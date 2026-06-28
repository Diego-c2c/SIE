# ARCHITECTURE

## Vision
Plateforme web pour une surf academy avec 4 axes: administration des comptes/crédits, planning hebdomadaire d'activités, réservation par crédits, et futur module surf camp.

## Modules fonctionnels
1. Authentification et gestion de comptes
   - inscription utilisateur
   - validation manuelle par admin/modérateur
   - rôles: admin, modérateur, professeur, utilisateur
2. Wallet de crédits
   - solde courant
   - mouvements de crédits (ajout, consommation, correction)
   - futur achat en ligne
3. Planning d'activités
   - cours de surf, skate, bike tour, tourisme
   - sessions datées avec capacité, niveau, coach, coût en crédits
   - affichage hebdomadaire type grille
4. Réservation
   - sélection d'un cours
   - contrôle du solde et des places
   - débit transactionnel des crédits
   - annulation selon règles métier
5. Espace professeur/modérateur
   - consultation des cours assignés
   - ajout/retrait d'élèves
   - pointage présence
6. Surf camp (phase 2)
   - séjours, hébergement, packs et extras

## Architecture technique cible
- Frontend: HTML/CSS/JS pour le prototype, puis app SPA Vue ou frontend SSR si besoin SEO avancé.
- Backend API: Node.js + Express.
- Base de données: PostgreSQL.
- Reverse proxy / static serving: Nginx.
- Conteneurisation: Docker + Docker Compose.
- Hébergement: VPS Linux.

## Découpage logique
- `frontend/`: vitrine, planning public/privé, dashboard rôle.
- `api/`: auth, users, credits, activities, bookings, attendance.
- `db/`: schéma PostgreSQL, migrations, seed de démo.
- `infra/`: Dockerfile, compose, nginx, scripts deploy.
- `docs/`: décisions, roadmap, tâches.

## Entités principales
- User
- Role
- CreditWallet
- CreditTransaction
- ActivityType
- ActivitySession
- Booking
- Attendance
- CampPackage (phase 2)

## Règles clés
- une réservation débite des crédits dans une transaction atomique
- un professeur ne modifie que ses cours, un admin/modérateur gère globalement
- une session a une capacité maximale
- toute action sensible est journalisée
