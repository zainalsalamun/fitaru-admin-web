# Fitaru Admin API Routes

Base local URL:

```text
http://127.0.0.1:3000/api/v1
```

## System

- `GET /health`

## Admin CMS

- `GET /admin/overview`
- `GET /admin/users`
- `GET /admin/articles`
- `GET /admin/food-items`
- `GET /admin/exercise-items`
- `GET /admin/feedback`

## Public Mobile-Ready Reference

- `GET /articles`
- `GET /food-items`
- `GET /exercise-items`

## Current Data Source

Routes currently return mock data with the same response envelope used by the planned REST API:

```json
{
  "data": {},
  "meta": {}
}
```

Admin routes will switch to Supabase once the service role key and RLS strategy are configured.
