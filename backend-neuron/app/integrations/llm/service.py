from groq import Groq

from app.core.config import GROQ_API_KEY, GROQ_MODEL


client = Groq(api_key=GROQ_API_KEY)


def send_to_llm(messages):
    converted_messages = []

    for message in messages:
        role = message["role"]

        # Gemini uses "model", Groq uses "assistant"
        if role == "model":
            role = "assistant"

        # Gemini format:
        # {"role": "user", "parts": [{"text": "..."}]}
        #
        # Groq format:
        # {"role": "user", "content": "..."}
        content = "\n".join(
            part.get("text", "")
            for part in message.get("parts", [])
        )

        converted_messages.append({
            "role": role,
            "content": content
        })

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=converted_messages,
        temperature=0.2
    )

    return response.choices[0].message.content