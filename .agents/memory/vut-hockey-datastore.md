---
name: VUT Hockey datastore boundary
description: The VUT Hockey project deliberately stays MySQL-based and does not substitute the workspace Postgres service.
---

The app must keep MySQL as its only datastore. When MySQL is not configured in the development environment, the Flask API should return an explicit database-unavailable response while the static site remains usable; never add fake records or browser storage as a fallback.

**Why:** The project is intended to leave Replit and run against the developer's own MySQL installation.

**How to apply:** Preserve the environment-based mysql-connector configuration and update the schema/README together when database capabilities change.