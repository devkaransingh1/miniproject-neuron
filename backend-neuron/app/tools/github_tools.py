import base64
import json
import requests
from langchain_core.tools import tool

from app.db.session import SessionLocal
from app.models.user import User

GITHUB_API_BASE = "https://api.github.com"


def _get_user_and_headers(user_id: int):
    """
    Helper to fetch user and construct GitHub API request headers.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None, None, "User not found in database."

        if not user.is_github_connected or not user.github_access_token:
            return None, None, (
                "GitHub is not connected. Please connect your GitHub account "
                "in the integrations panel to use GitHub tools."
            )

        headers = {
            "Authorization": f"Bearer {user.github_access_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "Neuron-App",
        }
        return user, headers, None
    finally:
        db.close()


def create_github_tools(user_id: int):
    """
    Factory returning a suite of LangChain tools for interacting with GitHub.
    """

    @tool
    def github_search_code(query: str, repo: str | None = None) -> str:
        """Search code across the user's GitHub repositories or inside a specific repository.
        Args:
            query: The code snippet, symbol, function, or keyword to search for (e.g. 'SessionMiddleware' or 'def create_user').
            repo: Optional repository in 'owner/repo' format (e.g. 'octocat/Hello-World') to narrow the search.
        """
        user, headers, err = _get_user_and_headers(user_id)
        if err:
            return json.dumps({"error": err})

        username = user.github_username
        search_query = query.strip()
        if repo:
            full_q = f"{search_query} repo:{repo.strip()}"
        elif username:
            full_q = f"{search_query} user:{username}"
        else:
            full_q = search_query

        # Include text-match media type to get matched code context
        code_headers = dict(headers)
        code_headers["Accept"] = "application/vnd.github.text-match+json"

        try:
            resp = requests.get(
                f"{GITHUB_API_BASE}/search/code",
                params={"q": full_q, "per_page": 10},
                headers=code_headers,
                timeout=15,
            )
            if resp.status_code != 200:
                return json.dumps({
                    "error": f"GitHub code search failed with HTTP {resp.status_code}: {resp.text}"
                })

            data = resp.json()
            items = []
            for item in data.get("items", []):
                matches = []
                for tm in item.get("text_matches", []):
                    fragment = tm.get("fragment", "").strip()
                    if fragment:
                        matches.append(fragment[:300])

                items.append({
                    "name": item.get("name"),
                    "path": item.get("path"),
                    "repository": item.get("repository", {}).get("full_name"),
                    "html_url": item.get("html_url"),
                    "code_snippets": matches[:3],
                })

            return json.dumps({
                "query": query,
                "total_count": data.get("total_count", 0),
                "matched_files": items,
            })
        except Exception as exc:
            return json.dumps({"error": f"Failed to execute code search: {str(exc)}"})

    @tool
    def github_search_commits(query: str, repo: str | None = None) -> str:
        """Search commit messages, recent commits, and git history across user repositories.
        Args:
            query: Commit message keyword, author name, or date query (e.g. 'fix auth' or 'refactor').
            repo: Optional repository in 'owner/repo' format to search commits inside a specific repo.
        """
        user, headers, err = _get_user_and_headers(user_id)
        if err:
            return json.dumps({"error": err})

        username = user.github_username
        search_query = query.strip()

        commit_headers = dict(headers)
        commit_headers["Accept"] = "application/vnd.github.cloak-preview+json, application/vnd.github+json"

        try:
            # If repo is specified and query is generic like 'recent' or 'latest', fetch repo commits directly
            if repo and search_query.lower() in ("recent", "latest", "commits", ""):
                resp = requests.get(
                    f"{GITHUB_API_BASE}/repos/{repo.strip()}/commits",
                    params={"per_page": 10},
                    headers=commit_headers,
                    timeout=15,
                )
                if resp.status_code != 200:
                    return json.dumps({"error": f"GitHub commits request failed: HTTP {resp.status_code}"})

                raw_commits = resp.json()
                results = []
                for c in raw_commits:
                    commit_obj = c.get("commit", {})
                    results.append({
                        "sha": c.get("sha")[:7] if c.get("sha") else "",
                        "message": commit_obj.get("message", "").split("\n")[0],
                        "author": commit_obj.get("author", {}).get("name"),
                        "date": commit_obj.get("author", {}).get("date"),
                        "html_url": c.get("html_url"),
                    })
                return json.dumps({"repo": repo, "count": len(results), "commits": results})

            # Otherwise use GitHub Search Commits API
            if repo:
                full_q = f"{search_query} repo:{repo.strip()}"
            elif username:
                full_q = f"{search_query} author:{username}"
            else:
                full_q = search_query

            resp = requests.get(
                f"{GITHUB_API_BASE}/search/commits",
                params={"q": full_q, "sort": "author-date", "order": "desc", "per_page": 10},
                headers=commit_headers,
                timeout=15,
            )
            if resp.status_code != 200:
                return json.dumps({"error": f"GitHub commit search failed: HTTP {resp.status_code}"})

            data = resp.json()
            commits = []
            for item in data.get("items", []):
                c = item.get("commit", {})
                commits.append({
                    "sha": item.get("sha")[:7] if item.get("sha") else "",
                    "message": c.get("message", "").split("\n")[0],
                    "author": c.get("author", {}).get("name"),
                    "date": c.get("author", {}).get("date"),
                    "repository": item.get("repository", {}).get("full_name"),
                    "html_url": item.get("html_url"),
                })

            return json.dumps({
                "query": query,
                "total_count": data.get("total_count", 0),
                "commits": commits,
            })
        except Exception as exc:
            return json.dumps({"error": f"Failed to search commits: {str(exc)}"})

    @tool
    def github_get_file_content(repo: str, path: str, ref: str | None = None) -> str:
        """Fetch and read the raw source code of a specific file from a GitHub repository.
        Args:
            repo: Repository name in 'owner/repo' format (e.g. 'octocat/Hello-World').
            path: Relative path to the file inside the repository (e.g. 'src/App.jsx' or 'main.py').
            ref: Optional branch or commit SHA (e.g. 'main', 'master').
        """
        user, headers, err = _get_user_and_headers(user_id)
        if err:
            return json.dumps({"error": err})

        params = {}
        if ref:
            params["ref"] = ref

        try:
            clean_repo = repo.strip()
            clean_path = path.strip().lstrip("/")
            resp = requests.get(
                f"{GITHUB_API_BASE}/repos/{clean_repo}/contents/{clean_path}",
                params=params,
                headers=headers,
                timeout=15,
            )
            if resp.status_code == 404:
                return json.dumps({"error": f"File '{clean_path}' not found in repository '{clean_repo}'."})
            if resp.status_code != 200:
                return json.dumps({"error": f"GitHub file request failed: HTTP {resp.status_code}"})

            data = resp.json()
            encoding = data.get("encoding")
            raw_content = data.get("content", "")

            if encoding == "base64" and raw_content:
                decoded_bytes = base64.b64decode(raw_content)
                text_content = decoded_bytes.decode("utf-8", errors="replace")
            else:
                text_content = raw_content

            # Cap length to prevent blowing context token window
            truncated = False
            if len(text_content) > 6000:
                text_content = text_content[:6000]
                truncated = True

            return json.dumps({
                "repository": clean_repo,
                "path": clean_path,
                "size_bytes": data.get("size"),
                "truncated": truncated,
                "content": text_content,
                "html_url": data.get("html_url"),
            })
        except Exception as exc:
            return json.dumps({"error": f"Failed to fetch file content: {str(exc)}"})

    @tool
    def github_list_repos(sort: str = "updated") -> str:
        """List repositories accessible to the user on GitHub.
        Args:
            sort: Sorting criteria, one of 'updated', 'created', 'pushed', or 'full_name'. Defaults to 'updated'.
        """
        user, headers, err = _get_user_and_headers(user_id)
        if err:
            return json.dumps({"error": err})

        try:
            resp = requests.get(
                f"{GITHUB_API_BASE}/user/repos",
                params={"sort": sort, "per_page": 25, "affiliation": "owner,collaborator"},
                headers=headers,
                timeout=15,
            )
            if resp.status_code != 200:
                return json.dumps({"error": f"GitHub repos request failed: HTTP {resp.status_code}"})

            repos_data = resp.json()
            repos = []
            for r in repos_data:
                repos.append({
                    "name": r.get("name"),
                    "full_name": r.get("full_name"),
                    "private": r.get("private"),
                    "description": r.get("description"),
                    "language": r.get("language"),
                    "stars": r.get("stargazers_count"),
                    "forks": r.get("forks_count"),
                    "updated_at": r.get("updated_at"),
                    "html_url": r.get("html_url"),
                })

            return json.dumps({
                "count": len(repos),
                "repositories": repos,
            })
        except Exception as exc:
            return json.dumps({"error": f"Failed to list repositories: {str(exc)}"})

    @tool
    def github_search_issues_prs(query: str, repo: str | None = None, state: str = "open") -> str:
        """Search GitHub issues and pull requests created by or assigned to the user.
        Args:
            query: Keywords to search for in issues or PR titles and descriptions.
            repo: Optional repository in 'owner/repo' format.
            state: Issue state, either 'open', 'closed', or 'all'. Defaults to 'open'.
        """
        user, headers, err = _get_user_and_headers(user_id)
        if err:
            return json.dumps({"error": err})

        username = user.github_username
        search_terms = [query.strip()]
        if repo:
            search_terms.append(f"repo:{repo.strip()}")
        elif username:
            search_terms.append(f"author:{username}")

        if state in ("open", "closed"):
            search_terms.append(f"state:{state}")

        full_q = " ".join(t for t in search_terms if t)

        try:
            resp = requests.get(
                f"{GITHUB_API_BASE}/search/issues",
                params={"q": full_q, "per_page": 10},
                headers=headers,
                timeout=15,
            )
            if resp.status_code != 200:
                return json.dumps({"error": f"GitHub issues search failed: HTTP {resp.status_code}"})

            data = resp.json()
            items = []
            for item in data.get("items", []):
                items.append({
                    "number": item.get("number"),
                    "title": item.get("title"),
                    "state": item.get("state"),
                    "is_pull_request": "pull_request" in item,
                    "html_url": item.get("html_url"),
                    "created_at": item.get("created_at"),
                })

            return json.dumps({
                "query": full_q,
                "total_count": data.get("total_count", 0),
                "issues_and_prs": items,
            })
        except Exception as exc:
            return json.dumps({"error": f"Failed to search issues and PRs: {str(exc)}"})

    @tool
    def github_get_repo_contents(repo: str, path: str = "") -> str:
        """List files and folders inside a GitHub repository or subfolder in a single fast call.
        Args:
            repo: Repository name (e.g. 'miniproject-neuron' or 'owner/miniproject-neuron').
            path: Optional directory path inside repo (e.g. '' for root, or 'backend-neuron/app').
        """
        user, headers, err = _get_user_and_headers(user_id)
        if err:
            return json.dumps({"error": err})

        clean_repo = repo.strip()
        if "/" not in clean_repo and user.github_username:
            clean_repo = f"{user.github_username}/{clean_repo}"

        clean_path = path.strip().lstrip("/")
        endpoint = f"{GITHUB_API_BASE}/repos/{clean_repo}/contents"
        if clean_path:
            endpoint = f"{endpoint}/{clean_path}"

        try:
            resp = requests.get(endpoint, headers=headers, timeout=15)
            if resp.status_code == 404:
                return json.dumps({"error": f"Repository or path '{clean_repo}/{clean_path}' not found."})
            if resp.status_code != 200:
                return json.dumps({"error": f"GitHub contents request failed: HTTP {resp.status_code}"})

            data = resp.json()
            if isinstance(data, list):
                items = []
                for item in data:
                    items.append({
                        "name": item.get("name"),
                        "type": item.get("type"),
                        "path": item.get("path"),
                        "size": item.get("size"),
                        "html_url": item.get("html_url"),
                    })
                return json.dumps({
                    "repository": clean_repo,
                    "path": clean_path or "/",
                    "items": items,
                })
            else:
                return json.dumps({
                    "repository": clean_repo,
                    "name": data.get("name"),
                    "type": data.get("type"),
                    "size": data.get("size"),
                    "html_url": data.get("html_url"),
                })
        except Exception as exc:
            return json.dumps({"error": f"Failed to get repo contents: {str(exc)}"})

    return [
        github_get_repo_contents,
        github_search_code,
        github_search_commits,
        github_get_file_content,
        github_list_repos,
        github_search_issues_prs,
    ]
