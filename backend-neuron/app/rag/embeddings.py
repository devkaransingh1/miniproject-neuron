
import cohere

from app.core.config import COHERE_API_KEY


# Cohere client
client = cohere.ClientV2(api_key=COHERE_API_KEY)

# Cohere embedding model
EMBEDDING_MODEL = "embed-v4.0"

# Keep this fixed so Chroma uses the same dimension everywhere
EMBEDDING_DIMENSION = 1024


def generate_embedding(text: str) -> list[float]:
    """
    Generate an embedding for a single document.
    """

    response = client.embed(
        model=EMBEDDING_MODEL,
        input_type="search_document",
        texts=[text],
        output_dimension=EMBEDDING_DIMENSION,
        embedding_types=["float"],
    )

    return response.embeddings.float[0]


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for multiple documents in one API request.
    """

    if not texts:
        return []

    response = client.embed(
        model=EMBEDDING_MODEL,
        input_type="search_document",
        texts=texts,
        output_dimension=EMBEDDING_DIMENSION,
        embedding_types=["float"],
    )

    return response.embeddings.float


if __name__ == "__main__":

    embedding = generate_embedding(
        "I received an internship opportunity from Paytm."
    )

    print("Embedding dimensions:", len(embedding))
    print("First 5 values:", embedding[:5])

