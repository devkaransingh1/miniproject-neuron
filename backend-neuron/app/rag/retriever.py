
from app.rag.embeddings import (
    client,
    EMBEDDING_MODEL,
    EMBEDDING_DIMENSION,
)

from app.rag.vector_store import collection


MAX_EMAIL_CONTENT_CHARS = 1200
MAX_TOTAL_CONTEXT_CHARS = 4000


def retrieve_relevant_emails(
    user_id: int,
    query: str,
    top_k: int = 3
):
    """
    Retrieve historically relevant Gmail messages
    from the authenticated user's RAG knowledge base.

    This function is for semantic / historical questions.
    Live or latest-email questions should use Gmail API directly.

    Retrieved email content is deliberately capped so that
    large email bodies cannot consume the entire LLM context.
    """

    if not query or not query.strip():
        return []

    top_k = max(
        1,
        min(int(top_k), 10)
    )

    # -----------------------------------------
    # GENERATE QUERY EMBEDDING
    # -----------------------------------------

    response = client.embed(
        model=EMBEDDING_MODEL,
        input_type="search_query",
        texts=[query],
        output_dimension=EMBEDDING_DIMENSION,
        embedding_types=["float"],
    )

    query_embedding = response.embeddings.float[0]

    # -----------------------------------------
    # SEARCH USER'S GMAIL KNOWLEDGE
    # -----------------------------------------

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={
            "$and": [
                {
                    "user_id": {
                        "$eq": str(user_id)
                    }
                },
                {
                    "source": {
                        "$eq": "gmail"
                    }
                }
            ]
        },
        include=[
            "documents",
            "metadatas",
            "distances"
        ]
    )

    documents = results.get(
        "documents",
        [[]]
    )

    metadatas = results.get(
        "metadatas",
        [[]]
    )

    distances = results.get(
        "distances",
        [[]]
    )

    if not documents or not documents[0]:
        return []

    # -----------------------------------------
    # BUILD CLEAN RESULTS
    # -----------------------------------------

    emails = []

    total_content_chars = 0

    for i, document in enumerate(documents[0]):

        if total_content_chars >= MAX_TOTAL_CONTEXT_CHARS:
            break

        metadata = (
            metadatas[0][i]
            if i < len(metadatas[0])
            else {}
        )

        distance = (
            distances[0][i]
            if i < len(distances[0])
            else None
        )

        document = document or ""

        remaining_chars = (
            MAX_TOTAL_CONTEXT_CHARS
            - total_content_chars
        )

        content_limit = min(
            MAX_EMAIL_CONTENT_CHARS,
            remaining_chars
        )

        content = document[:content_limit]

        total_content_chars += len(content)

        emails.append({
            "message_id": metadata.get(
                "source_id",
                ""
            ),
            "thread_id": metadata.get(
                "thread_id",
                ""
            ),
            "content": content,
            "subject": metadata.get(
                "subject",
                ""
            ),
            "sender": metadata.get(
                "sender",
                ""
            ),
            "recipient": metadata.get(
                "recipient",
                ""
            ),
            "date": metadata.get(
                "date",
                ""
            ),
            "distance": distance
        })

    print(
        f"🧠 RAG USED → "
        f"{len(emails)} emails, "
        f"{total_content_chars} content chars"
    )

    return emails
