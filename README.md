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

## API (concise)

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

## Try it — curl examples

Use these examples from the `backend/` folder. They assume the server runs at `http://localhost:3000`.

1) Signup

```bash
curl -X POST http://localhost:3000/api/user/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"Pa$$w0rd"}'
```

2) Login (stores cookie in cookie-jar)

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Pa$$w0rd"}'
```

3) Create a workout (replace <exerciseId> with a real id from the `exercises` collection)

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/workout/new \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Leg Day",
    "description":"Strength session",
    "exercises":[{"exercise":"<exerciseId>","sets":4,"reps":10,"weight":60}],
    "scheduledAt":"2025-11-10T07:00:00.000Z",
    "status":"pending"
  }'
```

4) Update a workout

```bash
curl -b cookies.txt -X POST http://localhost:3000/api/workout/update/<workoutId> \
  -H "Content-Type: application/json" \
  -d '{"status":"completed","progressReport":{"completedWorkouts":1,"totalWeightLifted":240}}'
```

5) List workouts

```bash
curl -b cookies.txt "http://localhost:3000/api/workout/get?sort=asc"
```

6) Delete a workout

```bash
curl -b cookies.txt "http://localhost:3000/api/workout/delete/<workoutId>"
```

7) Get report (optionally filter by date range)

```bash
curl -b cookies.txt "http://localhost:3000/api/workout/getReport?from=2025-11-01&to=2025-11-30"
```

8) Logout

```bash
curl -b cookies.txt -c cookies.txt http://localhost:3000/api/user/logout
```

Notes:
- `-c cookies.txt` writes cookies to a file; `-b cookies.txt` sends them. This keeps the JWT cookie between requests.
- Replace `<exerciseId>` and `<workoutId>` with real ObjectId values from your database.

## Example responses (concise)

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