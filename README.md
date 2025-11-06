# Workout Tracker API (Backend)

Minimal, easy-to-use REST API for tracking workouts, exercises and basic user auth.

## What it is

A small Express + MongoDB backend that provides:
- User signup/login with cookie-based JWT auth
- CRUD for workouts (title, description, exercises, schedule, status)
- Workout reports (summary statistics and top exercises)
- Seed script for common exercises

## Tech stack
- Node.js (ES modules)
- Express
- MongoDB (Mongoose)
- JWT for authentication
- bcrypt for password hashing

## Quick start

1. Install dependencies

```bash
cd backend
npm install
```

2. Create a `.env` file in `backend/` with the following keys:

```
MONGO_URI=<your-mongodb-connection-string>
SECRET_KEY=<jwt-secret>
PORT=3000 # optional
```

3. Run the development server

```bash
npm run dev
```

The server listens on the PORT (default 3000). It connects to MongoDB on start.

## Seed exercises

A seed script inserts a list of common exercises into the `exercises` collection.

Run it from the `backend/` folder:

```bash
node seed-data/seed.js
```

This will connect to the database (using `MONGO_URI` from `.env`), clear existing exercises and insert default ones.

## API

Base path: `/api`

Auth routes (public):
- POST `/api/user/signup` — body: { name, email, password, role? }
  - Creates a new user
  - Returns 201 on success
- POST `/api/user/login` — body: { email, password }
  - Sets a cookie `token` (httpOnly) on successful login
- GET `/api/user/logout` — clears cookie

Protected routes (require cookie `token`):
- POST `/api/workout/new` — create workout
  - body: { title, description, exercises, scheduledAt, status, comments }
  - `exercises` expects array items with { exercise: <exerciseId>, sets, reps, weight?, notes? }
- POST `/api/workout/update/:workoutId` — update workout (partial/full)
  - body may include progressReport fields: totalWorkouts, completedWorkouts, totalWeightLifted
- GET `/api/workout/get` — list workouts for logged-in user
  - optional query: `status` (pending|completed|cancelled), `sort` (asc|desc)
- GET `/api/workout/delete/:workoutId` — permanently delete a workout
- GET `/api/workout/getReport` — generate report
  - optional query: `from`, `to` (dates) to filter the report period
  - returns: totals, completion rate, last7/30 days counts, topExercises

## Try it — Postman examples

Use Postman to exercise the API with saved requests and environment variables. These steps assume your server runs at `http://localhost:3000`.

Quick setup in Postman
- Create a new Environment (e.g., `Local`) and add variables:
  - `baseUrl` = `http://localhost:3000`
  - `exerciseId` = (leave blank until you seed and copy an id)
  - `workoutId` = (used later)

- In Postman preferences, ensure "Send cookies automatically" is enabled (Postman stores cookies per environment/host).

Requests (save each as a Postman request under a collection):

1) Signup
- Method: POST
- URL: `{{baseUrl}}/api/user/signup`
- Headers: `Content-Type: application/json`
- Body (raw JSON):

```json
{ "name": "Alice", "email": "alice@example.com", "password": "Pa$$w0rd" }
```

2) Login
- Method: POST
- URL: `{{baseUrl}}/api/user/login`
- Headers: `Content-Type: application/json`
- Body:

```json
{ "email": "alice@example.com", "password": "Pa$$w0rd" }
```

Postman will receive the cookie set by the server and store it for subsequent requests to the same host.

3) Create workout
- Method: POST
- URL: `{{baseUrl}}/api/workout/new`
- Headers: `Content-Type: application/json`
- Body example (replace `{{exerciseId}}` with a seeded exercise ObjectId):

```json
{
  "title": "Leg Day",
  "description": "Strength session",
  "exercises": [ { "exercise": "{{exerciseId}}", "sets": 4, "reps": 10, "weight": 60 } ],
  "scheduledAt": "2025-11-10T07:00:00.000Z",
  "status": "pending"
}
```

Save the returned workout `_id` into the `workoutId` environment variable (Postman can do this with a test script: `pm.environment.set('workoutId', pm.response.json().workout._id)`).

4) Update workout
- Method: POST
- URL: `{{baseUrl}}/api/workout/update/{{workoutId}}`
- Headers: `Content-Type: application/json`
- Body example:

```json
{ "status": "completed", "progressReport": { "completedWorkouts": 1, "totalWeightLifted": 240 } }
```

5) List workouts
- Method: GET
- URL: `{{baseUrl}}/api/workout/get?sort=asc`

6) Delete workout
- Method: GET
- URL: `{{baseUrl}}/api/workout/delete/{{workoutId}}`

7) Get report
- Method: GET
- URL: `{{baseUrl}}/api/workout/getReport?from=2025-11-01&to=2025-11-30`

8) Logout
- Method: GET
- URL: `{{baseUrl}}/api/user/logout`

Postman tips
- Use the Environment quick look (eye icon) to view/set `baseUrl`, `exerciseId`, `workoutId`.
- Add a small test script to the Login request to confirm auth and optionally store values:



## Example responses 

Below are short example JSON responses you can expect from the API.

- Signup (201 created)

```json
{
  "message": "Account created successfully.",
  "success": true
}
```

- Login (200 OK, cookie set)

```json
{
  "message": "Welcome back Alice",
  "user": { "_id": "64...", "name": "Alice", "email": "alice@example.com" },
  "success": true
}
```

- Create workout (201 created)

```json
{
  "success": true,
  "message": "Workout created successfully.",
  "workout": { "_id": "66...", "title": "Leg Day", "status": "pending", "exercises": [ /* ... */ ] }
}
```

- Update workout (200 OK)

```json
{
  "success": true,
  "message": "Workout updated successfully.",
  "workout": { "_id": "66...", "status": "completed", "progressReport": { "completedWorkouts": 1, "totalWeightLifted": 240 } }
}
```

- List workouts (200 OK)

```json
{
  "success": true,
  "message": "Workouts fetched successfully.",
  "count": 1,
  "workouts": [ { "_id": "66...", "title": "Leg Day", "status": "pending" } ]
}
```

- Delete workout (200 OK)

```json
{
  "success": true,
  "message": "Workout permanently deleted."
}
```

- Get report (200 OK)

```json
{
  "success": true,
  "message": "Workout report generated successfully.",
  "report": {
    "totalWorkouts": 5,
    "completedWorkouts": 3,
    "pendingWorkouts": 2,
    "totalWeightLifted": 1500,
    "completionRate": "60.00%",
    "last7Days": 2,
    "last30Days": 4,
    "topExercises": [ { "name": "Squats", "count": 4 }, { "name": "Deadlifts", "count": 3 } ]
  }
}
```

- Logout (200 OK)

```json
{
  "message": "Logged out successfully",
  "success": true
}
```

## License
MIT

[Idea](https://roadmap.sh/projects/fitness-workout-tracker)