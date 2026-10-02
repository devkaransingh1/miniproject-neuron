
from app.rag.retriever import retrieve_relevant_emails


query = "internship emails"

results = retrieve_relevant_emails(3,query)

print("\n================ RAG TEST ================\n")

print("QUERY:")
print(query)

print("\nRETRIEVED RESULTS:")

for i, result in enumerate(results, start=1):
    print(f"\n--- Result {i} ---")
    print(result)

print("\n===========================================\n")
