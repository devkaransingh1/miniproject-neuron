from google import genai
from app.core.config import GEMINI_API_KEY

client = genai.Client(api_key=GEMINI_API_KEY)


def send_to_gemini(message):
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=message
    )

    return response.text