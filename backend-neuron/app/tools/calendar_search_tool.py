import json 
import re 
from datetime import datetime, timedelta, timezone 
from langchain_core.tools import tool 
from app.db.session import SessionLocal 
from app.models.user import User 
from app.integrations.google.calendar_token_manager import ( 
    create_calendar_service, CalendarReconnectRequired, 
) 

INDIA_TIMEZONE = timezone(timedelta(hours=5, minutes=30)) 

WEEKDAYS = { 
    "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3, 
    "friday": 4, "saturday": 5, "sunday": 6, 
} 

# Maps both full names and abbreviations cleanly
MONTHS = {
    "january": 1, "jan": 1, "february": 2, "feb": 2, "march": 3, "mar": 3,
    "april": 4, "apr": 4, "may": 5, "june": 6, "jun": 6, "july": 7, "jul": 7,
    "august": 8, "aug": 8, "september": 9, "sep": 9, "october": 10, "oct": 10,
    "november": 11, "nov": 11, "december": 12, "dec": 12
}

# Regex pattern built safely ensuring full strings like 'october' match before 'oct'
MONTH_RE = r"(?:january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|october|oct|november|nov|december|dec)"

def get_day_range(query: str): 
    query_lower = query.lower().strip() 
    now = datetime.now(INDIA_TIMEZONE) 
    
    if re.search(r"\btoday\b", query_lower): 
        start = now.replace(hour=0, minute=0, second=0, microsecond=0) 
        return start, start + timedelta(days=1) 
        
    if re.search(r"\btomorrow\b", query_lower): 
        start = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0) 
        return start, start + timedelta(days=1) 
        
    for day_name, target_weekday in WEEKDAYS.items(): 
        if re.search(rf"\bthis\s+{day_name}\b", query_lower): 
            current_weekday = now.weekday() 
            days_ahead = (target_weekday - current_weekday) % 7 
            start = (now + timedelta(days=days_ahead)).replace(hour=0, minute=0, second=0, microsecond=0) 
            return start, start + timedelta(days=1) 
            
        if re.search(rf"\bnext\s+{day_name}\b", query_lower): 
            current_weekday = now.weekday() 
            days_ahead = (target_weekday - current_weekday) % 7 
            if days_ahead == 0: 
                days_ahead = 7 
            start = (now + timedelta(days=days_ahead)).replace(hour=0, minute=0, second=0, microsecond=0) 
            return start, start + timedelta(days=1) 
            
    return None 

def get_date_range(query: str): 
    query_lower = query.lower().strip() 
    now = datetime.now(INDIA_TIMEZONE) 
    
    # YYYY-MM-DD
    iso_match = re.search(r"\b(\d{4})-(\d{1,2})-(\d{1,2})\b", query_lower) 
    if iso_match: 
        year, month, day = map(int, iso_match.groups()) 
        try: 
            start = datetime(year, month, day, tzinfo=INDIA_TIMEZONE) 
            return start, start + timedelta(days=1) 
        except ValueError: 
            return None 
            
    # 5 October / 5 Oct
    day_month_match = re.search(rf"\b(\d{1,2})\s+({MONTH_RE})(?:\s+(\d{4}))?\b", query_lower) 
    if day_month_match: 
        day = int(day_month_match.group(1)) 
        month_name = day_month_match.group(2) 
        year = day_month_match.group(3) 
        month = MONTHS[month_name] 
        year = int(year) if year else now.year 
        try: 
            start = datetime(year, month, day, tzinfo=INDIA_TIMEZONE) 
            return start, start + timedelta(days=1) 
        except ValueError: 
            return None 
            
    # October 5 / Oct 5
    month_day_match = re.search(rf"\b({MONTH_RE})\s+(\d{1,2})(?:\s+(\d{4}))?\b", query_lower) 
    if month_day_match: 
        month_name = month_day_match.group(1) 
        day = int(month_day_match.group(2)) 
        year = month_day_match.group(3) 
        month = MONTHS[month_name] 
        year = int(year) if year else now.year 
        try: 
            start = datetime(year, month, day, tzinfo=INDIA_TIMEZONE) 
            return start, start + timedelta(days=1) 
        except ValueError: 
            return None 
            
    return None 

def create_calendar_search_tool(user_id: int): 
    @tool 
    def calendar_search(query: str) -> str: 
        """Search the user's Google Calendar for specific dates or event text keywords.""" 
        print(f"📅 CALENDAR SEARCH → user_id={user_id}, query={query}") 
        db = SessionLocal() 
        try: 
            user = db.query(User).filter(User.id == user_id).first() 
            if not user: 
                return json.dumps({"error": "User not found."}) 
                
            try: 
                service = create_calendar_service(user) 
            except CalendarReconnectRequired as exc: 
                return json.dumps({"error": str(exc)}) 
                
            date_range = get_day_range(query) or get_date_range(query) 
            
            if date_range: 
                time_min, time_max = date_range 
                events_result = service.events().list( 
                    calendarId="primary", 
                    timeMin=time_min.astimezone(timezone.utc).isoformat(), 
                    timeMax=time_max.astimezone(timezone.utc).isoformat(), 
                    singleEvents=True, 
                    orderBy="startTime", 
                    maxResults=20, 
                ).execute() 
            else: 
                # CRITICAL FIX: Look back up to 1 year ago so keyword searches can locate past events
                lookback_start = datetime.now(timezone.utc) - timedelta(days=365)
                events_result = service.events().list( 
                    calendarId="primary", 
                    timeMin=lookback_start.isoformat(), 
                    singleEvents=True, 
                    orderBy="startTime", 
                    maxResults=20, 
                    q=query, 
                ).execute() 
                
            events = events_result.get("items", []) 
            print(f"📅 CALENDAR RESULTS → {len(events)} events found") 
            
            results = [] 
            for event in events: 
                start = event.get("start", {}) 
                end = event.get("end", {}) 
                results.append({ 
                    "id": event.get("id"), 
                    "summary": event.get("summary", ""), 
                    "start": (start.get("dateTime") or start.get("date")), 
                    "end": (end.get("dateTime") or end.get("date")), 
                    "location": event.get("location", ""), 
                    "description": event.get("description", ""), 
                    "status": event.get("status"), 
                    "html_link": event.get("htmlLink"), 
                }) 
            return json.dumps({"query": query, "count": len(results), "events": results}) 
            
        except Exception as exc: 
            print(f"❌ CALENDAR SEARCH ERROR → {exc}") 
            return json.dumps({"error": f"Calendar search failed: {str(exc)}"}) 
        finally: 
            db.close() 
            
    return calendar_search