# README_PROJECT

## Nom
Surf Academy Platform

## Objectif
Créer une plateforme de surf school avec gestion des utilisateurs, crédits, planning hebdomadaire et réservation de cours, prête à évoluer vers le paiement en ligne et un module surf camp.

## Périmètre MVP
- validation des comptes par admin/modérateur
- attribution manuelle de crédits
- création d'activités hebdomadaires
- réservation par crédit
- gestion des participants par professeur/modérateur
- déploiement Docker sur VPS

## Structure proposée du dépôt GitHub
- `public/` prototype statique / landing + dashboard démonstrateur
- `docs/` documentation produit et technique
- `api/` backend futur Express
- `db/` schéma et migrations PostgreSQL
- `infra/` scripts de déploiement

## Lancer le prototype
```bash
docker compose up --build
```
Puis ouvrir `http://localhost:8080/surf-academy-platform.html`

## Étapes suivantes
1. Initialiser le repo GitHub.
2. Ajouter backend Express.
3. Ajouter schéma PostgreSQL.
4. Connecter l'UI planning à l'API.
5. Ajouter authentification et rôles.
