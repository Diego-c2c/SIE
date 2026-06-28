# Surf Academy Platform

Monorepo de démarrage pour une plateforme de réservation de cours surf / skate / bike tour / tourisme avec gestion des crédits, planning hebdomadaire, rôles admin/modérateur/professeur/utilisateur, et base prête pour un futur module surf camp.

## Stack
- Frontend statique de démonstration servi par Nginx
- API backend Node.js + Express
- PostgreSQL
- Docker Compose pour dev local
- Nginx VPS pour reverse proxy HTTP

## Démarrage local
1. Copier `.env.example` vers `.env`
2. Lancer `docker compose up --build`
3. Ouvrir `http://localhost:8080/surf-academy-platform.html`
4. Tester `http://localhost:3000/health`
