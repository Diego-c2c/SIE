# DECISIONS

## D001 - Backend Node.js + Express
Choisi pour rapidité de livraison, écosystème large, et cohérence avec votre stack actuelle.

## D002 - PostgreSQL
Choisi pour les relations claires entre utilisateurs, crédits, sessions et réservations, plus transactions robustes.

## D003 - Crédit wallet séparé des réservations
Le solde visible vient d'un ledger (`credit_transactions`) plutôt que d'un simple compteur. Cela facilite audit, remboursements et futur paiement en ligne.

## D004 - Planning hebdomadaire centré sur `activity_sessions`
Chaque session stocke date, heure, activité, niveau, professeur, capacité et coût. L'affichage semaine n'est qu'une projection UI.

## D005 - Rôles simples au départ
RBAC minimal: admin, moderator, teacher, user. Évite la complexité prématurée.

## D006 - Docker first
Le projet doit tourner localement et sur VPS avec la même base de conteneurs.

## D007 - MVP paiement différé
On réserve d'abord via crédits ajoutés manuellement. Le paiement en ligne arrive après stabilisation du cœur métier.

## D008 - Surf camp reporté phase 2
Le module surf camp reste découplé pour ne pas bloquer la sortie du MVP cours/planning.
