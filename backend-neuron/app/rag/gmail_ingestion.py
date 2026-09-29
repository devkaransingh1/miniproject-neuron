from app.integrations.google.oauth import create_gmail_service
from app.rag.embeddings import generate_embedding
from app.rag.vector_store import collection


def get_header(headers, name):
    for header in headers:
        if header["name"].lower() == name.lower():
            return header["value"]

    return ""


def ingest_gmail_message(user, message_id):
    service = create_gmail_service(user)

    data = service.users().messages().get(
        userId="me",
        id=message_id,
        format="full"
    ).execute()

    payload = data.get("payload", {})
    headers = payload.get("headers", [])

    sender = get_header(headers, "From")
    recipient = get_header(headers, "To")
    subject = get_header(headers, "Subject")
    date = get_header(headers, "Date")

    thread_id = data.get("threadId", "")
    label_ids = data.get("labelIds", [])

    # Reuse our existing email body extraction logic
    from app.api.v1.gmail import extract_email_body

    body = extract_email_body(payload)

    document = f"""
Subject: {subject}
From: {sender}
To: {recipient}
Date: {date}

{body}
""".strip()

    embedding = generate_embedding(document)

    metadata = {
        "user_id": str(user.id),
        "source": "gmail",
        "source_id": message_id,
        "thread_id": thread_id,
        "sender": sender,
        "recipient": recipient,
        "subject": subject,
        "date": date,
        "label_ids": ",".join(label_ids),
    }

    collection.upsert(
        ids=[message_id],
        documents=[document],
        embeddings=[embedding],
        metadatas=[metadata]
    )

    return {
        "message_id": message_id,
        "subject": subject,
        "status": "indexed"
    }
    
def ingest_gmail_messages(user, max_results=100):
    service = create_gmail_service(user)

    results = service.users().messages().list(
        userId="me",
        maxResults=max_results
    ).execute()

    messages = results.get("messages", [])

    indexed = []

    for message in messages:
        result = ingest_gmail_message(
            user,
            message["id"]
        )

        indexed.append(result)

    return indexed