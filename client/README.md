# MSc Class Rep Selector

React and Vite client for the MSc Computer Science class representative election platform.

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` to the Express API base URL and `VITE_SOCKET_URL` to the Socket.IO server origin. These values are browser-visible; do not place secrets in client environment variables.

## Checks

```bash
npm run build
npm run lint
```

The client uses session storage for the JWT and authenticated Axios requests. Backend authorization remains authoritative.
