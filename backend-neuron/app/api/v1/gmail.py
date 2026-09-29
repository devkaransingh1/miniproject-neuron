from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import RedirectResponse
import base64
from app.db.session import get_db
from app.models.user import User
from app.api.v1.auth import get_current_user
from bs4 import BeautifulSoup, Comment
import re, html

from app.integrations.google.oauth import (
    create_gmail_flow,
    create_gmail_service,
)

router = APIRouter()


    
@router.get("/connect/gmail")
def connect_gmail(request: Request,user=Depends(get_current_user)):
    if user.is_gmail_connected:
        return {
            "message": "gmail is already connected",
            "connected": True
        }

    flow = create_gmail_flow()

    authorization_url, state = flow.authorization_url(
        access_type="offline",
    )

    request.session["gmail_oauth_state"] = state

    return RedirectResponse(url=authorization_url)


    
@router.get('/connect/gmail/callback')
def gmail_callback(request:Request,user=Depends(get_current_user),db:Session=Depends(get_db)):
    
    code = request.query_params.get('code')
    
    if not code:
        raise HTTPException(status_code=400,detail="gmail connection Authorization code missing")
    
    flow = create_gmail_flow()
    flow.fetch_token(code=code)
    
    user.gmail_access_token = flow.credentials.token
    user.gmail_refresh_token = flow.credentials.refresh_token
    user.gmail_token_expiry = flow.credentials.expiry
    user.is_gmail_connected = True
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "message":"gmail connected succesfully",
        "connected":True
    }
    
  
@router.get("/gmail/profile")
def gmail_profile(user=Depends(get_current_user)):
    
    if not user.is_gmail_connected:
        raise HTTPException(status_code=401,detail="gmail access not granted")
    
    service = create_gmail_service(user)

    profile = service.users().getProfile(
        userId="me"
    ).execute()

    return {
        "email": profile["emailAddress"],
        "messages_total": profile["messagesTotal"],
        "threads_total": profile["threadsTotal"]
    }
    
    
    
def decode_email_body(data):
    decoded = base64.urlsafe_b64decode(data)
    return decoded.decode("utf-8", errors="replace")


def find_body_parts(part, plain_parts, html_parts):
    mime_type = part.get("mimeType", "")
    body = part.get("body", {})
    data = body.get("data")

    # Actual body part
    if data and mime_type == "text/plain":
        plain_parts.append(decode_email_body(data))

    elif data and mime_type == "text/html":
        html_parts.append(decode_email_body(data))

    # Nested MIME parts
    for child in part.get("parts", []):
        find_body_parts(child, plain_parts, html_parts)


def clean_html_body(raw_html):
    import html
    import re
    from bs4 import BeautifulSoup

    # Gmail/email content can contain escaped HTML
    raw_html = raw_html.replace("\\u003C", "<")
    raw_html = raw_html.replace("\\u003E", ">")
    raw_html = raw_html.replace("\\u0026", "&")

    # Decode HTML entities
    raw_html = html.unescape(raw_html)

    # Remove conditional comments
    raw_html = re.sub(
        r"<!--\s*\[if.*?<!\s*\[endif\]\s*-->",
        "",
        raw_html,
        flags=re.IGNORECASE | re.DOTALL
    )

    # Remove remaining conditional markers
    raw_html = re.sub(
        r"<!--.*?-->",
        "",
        raw_html,
        flags=re.DOTALL
    )

    soup = BeautifulSoup(raw_html, "html.parser")

    # Remove email-client/template elements
    for tag in soup.find_all([
        "style",
        "script",
        "head",
        "title",
        "svg",
        "noscript"
    ]):
        tag.decompose()

    text = soup.get_text(" ", strip=True)

    text = html.unescape(text)
    # Remove spaces before punctuation
    text = re.sub(r"\s+([,.!?;:])", r"\1", text)
    # Normalize multiple space
    text = re.sub(r"[ \t]+", " ", text)
    
    return text.strip()
  

def remove_duplicate_blocks(text):
    lines = text.splitlines()

    result = []
    seen = set()

    for line in lines:
        normalized = line.strip().lower()

        if not normalized:
            continue

        if normalized in seen:
            continue

        seen.add(normalized)
        result.append(line)

    return "\n".join(result)


def extract_email_body(payload):
    html_parts = []
    plain_parts = []

    def walk(part):
        mime_type = part.get("mimeType", "")
        body = part.get("body", {})
        data = body.get("data")

        if data:
            decoded = decode_email_body(data)

            if mime_type == "text/html":
                html_parts.append(decoded)

            elif mime_type == "text/plain":
                plain_parts.append(decoded)

        for child in part.get("parts", []):
            walk(child)

    walk(payload)

    # Prefer HTML because this email's plain-text
    # representation is poorly formatted.
    if html_parts:
        cleaned_parts = []

        for part in html_parts:
            cleaned = clean_html_body(part)

            if cleaned:
                cleaned_parts.append(cleaned)

        return "\n".join(cleaned_parts)

    if plain_parts:
        return "\n".join(plain_parts).strip()

    return ""
  
  

@router.get("/gmail/messages")
def gmail_messages(
    user=Depends(get_current_user)
):
    service = create_gmail_service(user)

    results = service.users().messages().list(
        userId="me",
        maxResults=10
    ).execute()

    messages = results.get("messages", [])

    emails = []

    for message in messages:

        data = service.users().messages().get(
            userId="me",
            id=message["id"],
            format="metadata",
            metadataHeaders=["From", "Subject", "Date"]
        ).execute()

        headers = data.get("payload", {}).get("headers", [])

        email = {
            "id": message["id"],
            "from": "",
            "subject": "",
            "date": "",
            "body": data.get("snippet", "")
        }

        for header in headers:

            name = header["name"].lower()
            value = header["value"]

            if name == "from":
                email["from"] = value

            elif name == "subject":
                email["subject"] = value

            elif name == "date":
                email["date"] = value

        emails.append(email)

    return {
        "count": len(emails),
        "emails": emails
    }
    
    
@router.get("/gmail/messages/{message_id}")
def gmail_message(
    message_id: str,
    user=Depends(get_current_user)
):
    service = create_gmail_service(user)

    data = service.users().messages().get(
        userId="me",
        id=message_id,
        format="full"
    ).execute()

    headers = data.get("payload", {}).get("headers", [])

    email = {
        "id": data["id"],
        "from": "",
        "to": "",
        "subject": "",
        "date": "",
        "body": ""
    }

    for header in headers:
        name = header["name"].lower()
        value = header["value"]

        if name == "from":
            email["from"] = value
        elif name == "to":
            email["to"] = value
        elif name == "subject":
            email["subject"] = value
        elif name == "date":
            email["date"] = value

    email["body"] = extract_email_body(data["payload"])

    return email

def search_gmail_messages(user, query, max_results=10):
    service = create_gmail_service(user)

    results = service.users().messages().list(
        userId="me",
        q=query,
        maxResults=max_results
    ).execute()

    messages = results.get("messages", [])

    emails = []

    for message in messages:
        data = service.users().messages().get(
            userId="me",
            id=message["id"],
            format="metadata",
            metadataHeaders=["From", "To", "Subject", "Date"]
        ).execute()

        headers = data.get("payload", {}).get("headers", [])

        email = {
            "id": message["id"],
            "from": "",
            "to": "",
            "subject": "",
            "date": "",
            "body": data.get("snippet", "")
        }

        for header in headers:
            name = header["name"].lower()
            value = header["value"]

            if name == "from":
                email["from"] = value
            elif name == "to":
                email["to"] = value
            elif name == "subject":
                email["subject"] = value
            elif name == "date":
                email["date"] = value

        emails.append(email)

    return emails



@router.get("/gmail/search")
def search_gmail(
    q: str,
    user=Depends(get_current_user)
):
    emails = search_gmail_messages(user, q)

    return {
        "count": len(emails),
        "emails": emails
    }