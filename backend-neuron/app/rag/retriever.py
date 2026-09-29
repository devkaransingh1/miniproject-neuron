from app.rag.embeddings import client, EMBEDDING_MODEL
from app.rag.vector_store import collection
from google.genai import types


def retrieve_relevant_emails(
    user_id: int,
    query: str,
    top_k: int = 5
):
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=query,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=768
        )
    )

    query_embedding = response.embeddings[0].values

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={
            "$and": [
                {"user_id": {"$eq": str(user_id)}},
                {"source": {"$eq": "gmail"}}
            ]
        },
        include=["documents", "metadatas", "distances"]
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