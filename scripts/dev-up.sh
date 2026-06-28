#!/usr/bin/env sh
set -e
cp -n .env.example .env 2>/dev/null || true
docker compose up --build
