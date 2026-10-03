# Backend configuration

Set `FRONTEND_URL` in the backend environment to the frontend origin used by
your deployment. After Google sign-in, the backend redirects the browser to
`{FRONTEND_URL}/chat`. When unset, it defaults to `http://localhost:5173` for
local Vite development.
