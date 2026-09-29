print("Retrieval test started")

from app.rag.retriever import retrieve_relevant_emails

print("Retriever imported successfully")

results = retrieve_relevant_emails(
    user_id=3,  # Replace with your actual user ID
    query="What Python developer job opportunities did I receive?",
    top_k=5
)

print("Results received:", len(results))

for email in results:
    print("\nSubject:", email["subject"])
    print("Distance:", email["distance"])