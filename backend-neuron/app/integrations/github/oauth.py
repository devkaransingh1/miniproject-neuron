import requests
from urllib.parse import urlencode

from app.core.config import (
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    GITHUB_REDIRECT_URI,
)

GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_API = "https://api.github.com/user"

GITHUB_SCOPES = "read:user user:email repo"


class GitHubOAuthError(Exception):
    pass


def get_github_authorization_url(state: str | None = None) -> str:
    """
    Construct the GitHub OAuth authorization URL.
    """
    if not GITHUB_CLIENT_ID:
        raise GitHubOAuthError("GITHUB_CLIENT_ID is not configured in backend environment.")

    params = {
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": GITHUB_REDIRECT_URI,
        "scope": GITHUB_SCOPES,
    }
    if state:
        params["state"] = state

    return f"{GITHUB_AUTH_URL}?{urlencode(params)}"


def exchange_github_code_for_token(code: str) -> str:
    """
    Exchange the temporary authorization code for a GitHub access token.
    """
    if not GITHUB_CLIENT_ID or not GITHUB_CLIENT_SECRET:
        raise GitHubOAuthError("GitHub Client ID or Client Secret is not configured.")

    payload = {
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": GITHUB_REDIRECT_URI,
    }
    headers = {
        "Accept": "application/json",
    }

    response = requests.post(
        GITHUB_TOKEN_URL,
        json=payload,
        headers=headers,
        timeout=15,
    )

    if response.status_code != 200:
        raise GitHubOAuthError(
            f"Failed to exchange GitHub authorization code: HTTP {response.status_code}"
        )

    data = response.json()
    if "error" in data:
        raise GitHubOAuthError(
            f"GitHub OAuth error: {data.get('error_description') or data.get('error')}"
        )

    access_token = data.get("access_token")
    if not access_token:
        raise GitHubOAuthError("No access token returned from GitHub.")

    return access_token


def fetch_github_user_profile(access_token: str) -> dict:
    """
    Fetch the authenticated GitHub user's profile details.
    """
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Neuron-App",
    }

    response = requests.get(
        GITHUB_USER_API,
        headers=headers,
        timeout=15,
    )

    if response.status_code != 200:
        raise GitHubOAuthError(
            f"Failed to fetch GitHub user profile: HTTP {response.status_code}"
        )

    return response.json()
