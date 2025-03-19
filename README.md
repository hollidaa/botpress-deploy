# botpress-deploy

# Botpress Deployment

This repository contains scripts to deploy Botpress on Render.

## Overview

This setup automatically downloads and runs a pre-built version of Botpress, connecting it to a PostgreSQL database.

## Environment Variables

- `DATABASE_URL`: PostgreSQL database connection string
- `EXTERNAL_URL`: The URL where Botpress will be accessible
- `PORT`: The port Botpress will run on (default: 3000)
- `PG_SSL`: Whether to use SSL for database connection (default: true)
