# Running Expense Tracker in Docker

Docker runs a single, self-contained container: the Spring Boot app with an embedded H2 database. There's no separate database to install or run.

- The image is built inside Docker (Maven also builds the React bundle with webpack, so you don't need to run webpack yourself).
- The database is a file, `/data/expensetracker.mv.db`, kept in the named volume `expenses`, so it survives restarts, rebuilds and `docker compose down`.
- It runs with the `prod` and `embedded` profiles, never `dev`, because `dev` recreates the tables and loads sample data.

The app is at http://localhost:8080. The first start begins with an empty database and the six default categories.

Running from IntelliJ is unchanged: it still uses the Postgres on your PC (localhost:5432). The embedded database is only used when the `embedded` profile is active.

## One-time setup

1. Install Docker Desktop for Windows and start it.
2. Stop the app if it's running from IntelliJ (both use port 8080).

## Start it

From the project folder (IntelliJ's Terminal tab works):

```
docker compose up -d --build
```

The first build takes a few minutes (it downloads Maven dependencies and Node). Later builds are faster.

In IntelliJ you can also open `docker-compose.yml` and click the green run arrow next to `services:`; the container then shows up in the Services tool window, with logs.

Without Compose, the same thing is:

```
docker build -t expensetracker .
docker run -d --name expensetracker -p 8080:8080 -v expenses:/data --restart unless-stopped expensetracker
```

## Everyday commands

| What | Command |
| --- | --- |
| Rebuild after code changes | `docker compose up -d --build` |
| See app logs | `docker compose logs -f app` |
| Stop (data kept) | `docker compose down` |
| Back up the database | `docker compose stop` then `docker compose cp app:/data/expensetracker.mv.db backup.mv.db` then `docker compose start` |

**Don't** run `docker compose down -v`: `-v` deletes the `expenses` volume, which is your data.

If you used the earlier two-container setup, its Postgres data is still in the old `expense-data` volume; nothing here touches it. Delete it with `docker volume rm expense-tracker_expense-data` once you don't need it.

## Before exposing it beyond your PC

`application.yml` exposes every actuator endpoint (`/actuator/*`) and the app has no login. That's fine on localhost, but put it behind authentication before opening port 8080 to a network.

docker image save expensetracker -o expensetracker.tar