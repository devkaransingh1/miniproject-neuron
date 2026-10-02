
from app.rag.embeddings import (
    client,
    EMBEDDING_MODEL,
    EMBEDDING_DIMENSION,
)

from app.rag.vector_store import collection


def retrieve_relevant_emails(
    user_id: int,
    query: str,
    top_k: int = 5
):
    # Generate embedding for the user's search query
    response = client.embed(
        model=EMBEDDING_MODEL,
        input_type="search_query",
        texts=[query],
        output_dimension=EMBEDDING_DIMENSION,
        embedding_types=["float"],
    )

    query_embedding = response.embeddings.float[0]

    # Search Chroma
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={
            "$and": [
                {"user_id": {"$eq": str(user_id)}},
                {"source": {"$eq": "gmail"}}
            ]
        },
        include=[
            "documents",
            "metadatas",
            "distances"
        ]
    )

    emails = []

    for i, document in enumerate(results["documents"][0]):

        metadata = results["metadatas"][0][i]
        distance = results["distances"][0][i]

        emails.append({
            "content": document,
            "subject": metadata.get("subject", ""),
            "sender": metadata.get("sender", ""),
            "date": metadata.get("date", ""),
            "source_id": metadata.get("source_id", ""),
            "distance": distance
        })

    return emails

