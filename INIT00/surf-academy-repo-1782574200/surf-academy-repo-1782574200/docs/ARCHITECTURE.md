# ARCHITECTURE

## Monorepo
- `public`: interface statique de démonstration
- `api`: backend Express avec services métier
- `db`: migrations et seed PostgreSQL
- `infra`: configurations Nginx dev et VPS
- `scripts`: commandes de confort

## Endpoints MVP
- `POST /auth/register`
- `POST /auth/login`
- `GET /users`
- `GET /users/pending`
- `POST /users/:id/activate`
- `GET /credits/wallet/:userId`
- `POST /credits/grant`
- `GET /sessions`
- `POST /sessions`
- `POST /sessions/:id/roster`
- `POST /bookings`
