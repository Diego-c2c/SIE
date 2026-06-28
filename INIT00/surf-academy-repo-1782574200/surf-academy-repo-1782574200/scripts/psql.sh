#!/usr/bin/env sh
set -e
docker compose exec db psql -U surf -d surf_academy
