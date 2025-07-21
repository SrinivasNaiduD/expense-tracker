#Project Overview
................
This is a full-featured Expense Tracker Backend API built with Node.js, Express, MongoDB, and Redis. It supports:
-User registration & login with JWT
-CRUD for expenses
-Image uploads (receipt)
-Email alerts if monthly spending exceeds a threshold
-Background job processing with Bull & Redis
-Docker-based setup for consistent local development

How to Run the App (2 Options)
..............................
# Prerequisites
- Docker installed and running
# Steps

unzip the zip file
cd expense-tracker
docker-compose up --build (need to run or open docker while running the application)

This will start Node.js, MongoDB, and Redis in one go.
This app requires Redis, so it only works via Docker.
Running node app.js directly will NOT work unless Redis is installed manually.

Option 2: Local (Not Recommended — Partial Only)
You can run just the app without Docker, like this:
unzip the zip file
cd expense-tracker
npm install
node app.js

But:
....
Redis-dependent features (Bull queues, alerts) will not work
You’ll see connection errors unless you install Redis manually

You can still test:
...................
Auth (register/login)
Expense creation & CRUD
Image upload
Pagination/sorting/filtering

Create a .env file in your root:
................................
MONGO_URI=mongodb://localhost:27017/expense_db
JWT_SECRET=11d18128a078a052e2861b7c33807addb1d628a0484edd5bdae23b105594455573d4b0736c51af4c609ac73bc1071c171d241070c9bab97ac33cfa265e973312
EXPENSE_ALERT_LIMIT=5000
REDIS_URL=redis://redis:6379
EMAIL_USER=hello@learnatrecess.com
EMAIL_PASS=ikomuliosphirlre

# Use a Gmail account with App Password enabled (not your real password)

Auth
.....
POST /api/auth/register
POST /api/auth/login

Expenses
........
POST /api/expenses (with image upload)
GET /api/expenses?page=1&limit=10&sortBy=date&sortOrder=desc
PUT /api/expenses/:id
DELETE /api/expenses/:id
Use Authorization: Bearer <your_token> header

Accessing Uploaded Images
..........................
Uploaded receipt images are stored in /uploads and served via:
http://localhost:9000/uploads/<filename>

Background Jobs with Bull + Redis
.................................
Redis is run via Docker
On user registration, a background job is queued to simulate sending a weekly report
Simulated output appears in the Docker logs:
Simulated: Email sent to user@example.com

Email Alert Feature
...................
After each expense creation, the system checks if monthly total exceeds EXPENSE_ALERT_LIMIT
If yes, an email is sent to the user
Uses Gmail + Nodemailer (console logs in development)

Technologies Used
.................
Node.js + Express
MongoDB + Mongoose
Redis + Bull
Nodemailer (Gmail)
Docker + Docker Compose
Multer for file uploads
Morgan for logging
