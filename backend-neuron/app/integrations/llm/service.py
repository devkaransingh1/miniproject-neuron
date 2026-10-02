from langchain_groq import ChatGroq

from app.core.config import GROQ_API_KEY, GROQ_MODEL


llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model=GROQ_MODEL,
    temperature=0.2,
)


def send_to_llm(messages):
    langchain_messages = []

    for message in messages:
        role = message["role"]

        if role == "model":
            role = "assistant"

        content = message["parts"][0]["text"]

        langchain_messages.append(
            (role, content)
        )

    response = llm.invoke(langchain_messages)

    return response.content