# TODO_NEXT

## Priorité immédiate
OK - Page session-edit - remove user from event by Admin/Modo
OK - Page session-edit - separer date et heure
OK- Page session-edit - ajouter un champ teacher/Moderator afin de savoir qui est en charge de l'event
- Page session-edit - corriger undefine

- Page index(USER) - afficher le cours qui correspont sur son bouton ou le mettre sous son horaire afin d'eviter les erreurs d'incription (horaire)
- Page index(USER) - afficher la couleur rouge quand le user est inscrit a ce cours sur son bouton (ROUGE)
- Page index(USER) - separer les compteur des inscrits
- Page index(USER) - Crée un bouton pour linker une page achhat de crédits

- Page admin - cree des filtres USER/MODO/ADMIN/ALL
- Page admin - cree des filtres AK1/AK2/A3
- Page admin(modo) - corriger les modifs pour modo rien ne marche

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
