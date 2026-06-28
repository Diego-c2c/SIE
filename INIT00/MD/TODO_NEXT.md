# TODO_NEXT

## Priorité immédiate
- créer repo GitHub `surf-academy-platform`
- définir licence, `.gitignore`, conventions commit
- choisir mono-repo simple: `public`, `api`, `db`, `docs`

## Backend
- créer Express app
- installer validation (`zod` ou `joi`)
- créer routes `/auth`, `/users`, `/credits`, `/sessions`, `/bookings`
- préparer middleware RBAC

## Database
- dessiner MCD/ERD
- créer tables `users`, `roles`, `wallets`, `credit_transactions`, `activity_types`, `activity_sessions`, `bookings`, `attendance`
- ajouter index sur `activity_sessions(date)`, `bookings(user_id, session_id)`

## Frontend
- transformer le prototype en composants réutilisables
- ajouter vue login/register
- ajouter vue mes crédits / mes réservations
- ajouter actions réserver/annuler

## Infra
- ajouter nginx config VPS
- ajouter variables `.env`
- préparer CI GitHub Actions build + deploy
