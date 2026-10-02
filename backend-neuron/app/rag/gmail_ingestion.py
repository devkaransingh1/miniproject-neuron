
from datetime import datetime, timezone

from app.integrations.google.oauth import create_gmail_service

from app.rag.embeddings import (
    generate_embeddings,
)

from app.rag.vector_store import collection


BATCH_SIZE = 10


def get_header(headers, name):

    for header in headers:

        if header["name"].lower() == name.lower():
            return header["value"]

    return ""


def prepare_gmail_message(
    user,
    message_id,
    service
):
    """
    Fetch a Gmail message and prepare its
    document + metadata.

    Embedding is NOT generated here.
    """

    data = service.users().messages().get(
        userId="me",
        id=message_id,
        format="full"
    ).execute()

    payload = data.get("payload", {})

    headers = payload.get(
        "headers",
        []
    )

    sender = get_header(
        headers,
        "From"
    )

    recipient = get_header(
        headers,
        "To"
    )

    subject = get_header(
        headers,
        "Subject"
    )

    date = get_header(
        headers,
        "Date"
    )

    thread_id = data.get(
        "threadId",
        ""
    )

    label_ids = data.get(
        "labelIds",
        []
    )

    from app.api.v1.gmail import extract_email_body

    body = extract_email_body(
        payload
    )

    document = f"""
Subject: {subject}
From: {sender}
To: {recipient}
Date: {date}

{body}
""".strip()

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

    return {
        "id": message_id,
        "document": document,
        "metadata": metadata,
        "subject": subject,
    }


def ingest_gmail_messages(
    user,
    max_results=50
):
    """
    Initial Gmail → RAG synchronization.

    Fetches up to max_results emails and processes
    embeddings in batches.
    """

    service = create_gmail_service(
        user
    )

    indexed = []

    next_page_token = None

    while len(indexed) < max_results:

        remaining = (
            max_results
            - len(indexed)
        )

        page_size = min(
            remaining,
            50
        )

        print(
            f"📨 Requesting up to {page_size} Gmail messages..."
        )

        response = service.users().messages().list(
            userId="me",
            maxResults=page_size,
            pageToken=next_page_token
        ).execute()

        messages = response.get(
            "messages",
            []
        )

        print(
            f"📨 Gmail returned {len(messages)} messages"
        )

        if not messages:
            break

        batch = []

        for message in messages:

            if len(indexed) + len(batch) >= max_results:
                break

            print(
                f"📥 Fetching {message['id']}"
            )

            prepared = prepare_gmail_message(
                user,
                message["id"],
                service
            )

            batch.append(
                prepared
            )

        if batch:

            print(
                f"🧠 Generating embeddings for {len(batch)} emails..."
            )

            documents = [
                item["document"]
                for item in batch
            ]

            embeddings = generate_embeddings(
                documents
            )

            print(
                f"💾 Saving {len(batch)} emails to Chroma..."
            )

            collection.upsert(
                ids=[
                    item["id"]
                    for item in batch
                ],
                documents=documents,
                embeddings=embeddings,
                metadatas=[
                    item["metadata"]
                    for item in batch
                ]
            )

            indexed.extend(
                [
                    {
                        "message_id": item["id"],
                        "subject": item["subject"],
                        "status": "indexed"
                    }
                    for item in batch
                ]
            )

            print(
                f"✅ Batch indexed: {len(batch)} emails"
            )

        next_page_token = response.get(
            "nextPageToken"
        )

        if not next_page_token:
            break

    print(
        f"🏁 Initial Gmail sync completed: {len(indexed)} emails"
    )

    return indexed


def sync_new_gmail_messages(user, max_results=50):
    """
    Incremental Gmail → RAG synchronization.

    Fetches emails received after the user's
    last successful RAG synchronization.

    Maximum emails processed in one sync = max_results.
    """

    service = create_gmail_service(user)

    if user.gmail_last_sync_at:

        last_sync = user.gmail_last_sync_at

        if last_sync.tzinfo is None:
            last_sync = last_sync.replace(
                tzinfo=timezone.utc
            )

        timestamp = int(
            last_sync.timestamp()
        )

        query = f"after:{timestamp}"

    else:
        query = ""

    indexed = []
    next_page_token = None

    while len(indexed) < max_results:

        remaining = max_results - len(indexed)

        print(
            f"📨 Calling Gmail messages.list() "
            f"(remaining limit: {remaining})"
        )

        response = service.users().messages().list(
            userId="me",
            q=query,
            maxResults=min(BATCH_SIZE, remaining),
            pageToken=next_page_token
        ).execute()

        print(
            "✅ Gmail messages.list() returned"
        )

        messages = response.get(
            "messages",
            []
        )

        print(
            f"📨 Gmail returned {len(messages)} messages"
        )

        if not messages:
            break

        # Safety: never process more than remaining limit
        messages = messages[:remaining]

        batch = []

        for message in messages:

            # Extra safety check
            if len(indexed) + len(batch) >= max_results:
                break

            print(
                f"📥 Fetching {message['id']}"
            )

            prepared = prepare_gmail_message(
                user,
                message["id"],
                service
            )

            batch.append(
                prepared
            )

            # Process batch of 10
            if len(batch) >= BATCH_SIZE:

                documents = [
                    item["document"]
                    for item in batch
                ]

                print(
                    f"🧠 Generating embeddings for "
                    f"{len(batch)} emails..."
                )

                embeddings = generate_embeddings(
                    documents
                )

                print(
                    f"💾 Saving {len(batch)} emails to Chroma..."
                )

                collection.upsert(
                    ids=[
                        item["id"]
                        for item in batch
                    ],
                    documents=documents,
                    embeddings=embeddings,
                    metadatas=[
                        item["metadata"]
                        for item in batch
                    ]
                )

                indexed.extend(
                    [
                        {
                            "message_id": item["id"],
                            "subject": item["subject"],
                            "status": "indexed"
                        }
                        for item in batch
                    ]
                )

                print(
                    f"✅ Batch indexed: {len(batch)} emails"
                )

                batch = []

        # Process remaining emails in the current page
        if batch:

            documents = [
                item["document"]
                for item in batch
            ]

            print(
                f"🧠 Generating embeddings for "
                f"{len(batch)} emails..."
            )

            embeddings = generate_embeddings(
                documents
            )

            print(
                f"💾 Saving {len(batch)} emails to Chroma..."
            )

            collection.upsert(
                ids=[
                    item["id"]
                    for item in batch
                ],
                documents=documents,
                embeddings=embeddings,
                metadatas=[
                    item["metadata"]
                    for item in batch
                ]
            )

            indexed.extend(
                [
                    {
                        "message_id": item["id"],
                        "subject": item["subject"],
                        "status": "indexed"
                    }
                    for item in batch
                ]
            )

            print(
                f"✅ Final batch indexed: {len(batch)} emails"
            )

        # Stop once 50 emails have been processed
        if len(indexed) >= max_results:
            break

        next_page_token = response.get(
            "nextPageToken"
        )

        if not next_page_token:
            break

    print(
        f"🏁 Incremental Gmail sync completed: "
        f"{len(indexed)} emails"
    )

    return indexed




def update_gmail_sync_time(
    user,
    db
):

    user.gmail_last_sync_at = datetime.now(
        timezone.utc
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return user.gmail_last_sync_at

