# IoT Time-Series Collector

## Tech Stack
* **Backend:** Spring Boot, Java, Gradle
* **Database:** PostgreSQL 15 (Alpine) with Liquibase migrations
* **Containerization:** Docker & Docker Compose (Resource limits: 300M for DB, 600M for App)

## Project Structure & Prerequisites

Before running the application, make sure you have **Docker** and **Docker Compose** installed on your machine.

### 1. Environment Configuration (`.env`)
Create a `.env` file in the root directory of the project (the same folder as `docker-compose.yml`). This file must **not** be tracked by Git.

```env
DB_NAME=<database_name>
DB_USER=<database_user>
DB_PASSWORD=<database_user_password>
JWT_SECRET=<jwt_secret>
PASS_HASH=<application_admin_user_password_hash>
```

### 2. Build JAR
To build the app, run:
```bash
cd backend && ./gradlew clean bootJar && cd ..
```

### 3. Run in Docker
To start the app and database in Docker with force image rebuild, run:
```bash
docker compose up --build
```

### 4. Stop Docker
To stop Docker containers:
```bash
docker compose down
```
To stop Docker containers and clean volumes:
```bash
docker compose down -v
```


## Credits & Copyright
* **Course & University:** Developed as part of the **Advanced Web Applications** (*Zaawansowane Aplikacje Internetowe – ZAI*) course at **Warsaw University of Technology** (Politechnika Warszawska).
* **Provided Materials:** The OpenAPI specification (`src/main/resources/api/zai-api-26z.yaml`) and the test script (`scripts/test/z0ai-tests.mjs`) were provided as part of the course materials by the instructor.