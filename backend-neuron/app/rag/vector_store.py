
import os

import chromadb


# -----------------------------------------
# CHROMA STORAGE
# -----------------------------------------

CHROMA_DB_PATH = os.getenv(
    "CHROMA_DB_PATH",
    "./chroma_db"
)


# -----------------------------------------
# CHROMA CLIENT
# -----------------------------------------

client = chromadb.PersistentClient(
    path=CHROMA_DB_PATH
)


# -----------------------------------------
# NEURON COLLECTION
# -----------------------------------------

collection = client.get_or_create_collection(
    name="neuron_documents_cohere",
    configuration={
        "hnsw": {
            "space": "cosine"
        }
    }
)

