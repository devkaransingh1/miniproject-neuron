import chromadb


client = chromadb.PersistentClient(
    path="./chroma_db"
)


collection = client.get_or_create_collection(
    name="neuron_documents",
    configuration={
        "hnsw": {
            "space": "cosine"
        }
    }
)