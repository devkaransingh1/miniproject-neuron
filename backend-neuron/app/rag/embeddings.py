
import cohere

from app.core.config import COHERE_API_KEY


# -----------------------------------------
# COHERE CLIENT
# -----------------------------------------

client = cohere.ClientV2(
    api_key=COHERE_API_KEY
)


# -----------------------------------------
# EMBEDDING CONFIGURATION
# -----------------------------------------

EMBEDDING_MODEL = "embed-v4.0"

# Must remain consistent with the Chroma
# collection configuration.
EMBEDDING_DIMENSION = 1024


# -----------------------------------------
# SINGLE EMBEDDING
# -----------------------------------------

def generate_embedding(
    text: str
) -> list[float]:
    """
    Generate an embedding for one document.
    """

    if not isinstance(text, str):
        raise TypeError(
            "Embedding input must be a string."
        )

    text = text.strip()

    if not text:
        raise ValueError(
            "Cannot generate an embedding for empty text."
        )

    response = client.embed(
        model=EMBEDDING_MODEL,
        input_type="search_document",
        texts=[text],
        output_dimension=EMBEDDING_DIMENSION,
        embedding_types=["float"],
    )

    embeddings = response.embeddings.float

    if not embeddings:
        raise RuntimeError(
            "Cohere returned no embedding."
        )

    embedding = embeddings[0]

    if len(embedding) != EMBEDDING_DIMENSION:
        raise RuntimeError(
            "Unexpected embedding dimension: "
            f"{len(embedding)}. "
            f"Expected {EMBEDDING_DIMENSION}."
        )

    return embedding


# -----------------------------------------
# BATCH EMBEDDINGS
# -----------------------------------------

def generate_embeddings(
    texts: list[str]
) -> list[list[float]]:
    """
    Generate embeddings for multiple documents
    in one Cohere API request.
    """

    if not texts:
        return []

    if not isinstance(texts, list):
        raise TypeError(
            "texts must be a list of strings."
        )

    cleaned_texts = []

    for text in texts:

        if not isinstance(text, str):
            raise TypeError(
                "Every embedding input must be a string."
            )

        text = text.strip()

        if not text:
            raise ValueError(
                "Embedding input cannot contain empty text."
            )

        cleaned_texts.append(text)

    response = client.embed(
        model=EMBEDDING_MODEL,
        input_type="search_document",
        texts=cleaned_texts,
        output_dimension=EMBEDDING_DIMENSION,
        embedding_types=["float"],
    )

    embeddings = response.embeddings.float

    if len(embeddings) != len(cleaned_texts):
        raise RuntimeError(
            "Cohere returned an unexpected number "
            "of embeddings."
        )

    for embedding in embeddings:

        if len(embedding) != EMBEDDING_DIMENSION:
            raise RuntimeError(
                "Unexpected embedding dimension: "
                f"{len(embedding)}. "
                f"Expected {EMBEDDING_DIMENSION}."
            )

    return embeddings


# -----------------------------------------
# LOCAL TEST
# -----------------------------------------

if __name__ == "__main__":

    embedding = generate_embedding(
        "I received an internship opportunity from Paytm."
    )

    print(
        "Embedding dimensions:",
        len(embedding)
    )

    print(
        "First 5 values:",
        embedding[:5]
    )

