# Student Record Management API

A Spring Boot REST API for student records using Java 17, Maven, Spring Data JPA, and an in-memory H2 database.

## Run

Install Java 17 or later and Maven, then run from this directory:

```text
mvn spring-boot:run
```

The API listens on `http://localhost:8080`. The in-memory database is recreated when the application restarts.

## Endpoints

| Method | Path | Result |
| --- | --- | --- |
| POST | `/api/students` | Create a student; returns `201 Created` |
| GET | `/api/students` | List all students |
| GET | `/api/students/{id}` | Get one student |
| PUT | `/api/students/{id}` | Replace a student's details |
| DELETE | `/api/students/{id}` | Delete a student; returns `204 No Content` |

Example request body:

```json
{
  "name": "Avery Chen",
  "rollNumber": "STU-1001",
  "branch": "Computer Science",
  "marks": 88
}
```

Names, roll numbers, and branches must not be blank. Marks must be between 0 and 100, inclusive. Roll numbers must be unique. Validation errors return `400`, duplicate roll numbers return `409`, and missing student IDs return `404`; errors use a JSON body with timestamp, status, error, message, and path.

The H2 console is available at `http://localhost:8080/h2-console` while the application is running. Use JDBC URL `jdbc:h2:mem:studentdb`, username `sa`, and an empty password.