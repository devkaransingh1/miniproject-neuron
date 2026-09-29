from google import genai
from google.genai import types

from app.core.config import GEMINI_API_KEY


client = genai.Client(api_key=GEMINI_API_KEY)


EMBEDDING_MODEL = "gemini-embedding-001"


def generate_embedding(text: str) -> list[float]:
    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=768
        )
    )

    return response.embeddings[0].values
  
  
if __name__ == "__main__":
    embedding = generate_embedding(
        "I received an internship opportunity from Paytm."
    )

    print("Embedding dimensions:", len(embedding))
    print("First 5 values:", embedding[:5])