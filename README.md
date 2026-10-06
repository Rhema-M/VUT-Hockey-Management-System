# VUT Hockey Management System

A full-stack hockey club management system developed for the Vaal University of Technology (VUT) Hockey Club.

The system provides a public-facing hockey website alongside an authenticated administration system for managing teams, players, fixtures, results, news, gallery content, contact messages, and site settings.

## Live Demo

**Website:** https://vut-hockey-management-system-production.up.railway.app

## Features

### Public Website

* Home page
* Fixtures
* Results
* Teams and players
* News
* Gallery
* About
* Contact form
* Responsive layout

### Administration System

* Secure administrator login
* JWT-based authentication
* Dashboard
* Team management
* Player management
* Fixture management
* Result management
* News management
* Gallery management
* Contact message management
* Website settings
* Image uploads

### Backend

* REST API built with Flask
* MySQL database
* JWT authentication
* Password hashing
* Protected administrative routes
* Database-driven content
* File upload handling

## Tech Stack

**Frontend**

* HTML5
* CSS3
* JavaScript

**Backend**

* Python
* Flask
* Gunicorn
* PyJWT

**Database**

* MySQL

**Deployment**

* Railway
* GitHub

## Project Structure

```text
VUT-Hockey-Management-System/
└── vut-hockey/
    ├── admin/
    │   ├── index.html
    │   ├── login.html
    │   ├── teams.html
    │   ├── players.html
    │   ├── fixtures.html
    │   ├── results.html
    │   ├── news.html
    │   ├── gallery.html
    │   ├── messages.html
    │   └── settings.html
    │
    ├── backend/
    │   ├── app.py
    │   ├── database.py
    │   ├── auth.py
    │   └── uploads/
    │
    ├── database/
    │   ├── schema.sql
    │   └── seed.sql
    │
    ├── css/
    ├── js/
    ├── images/
    │
    ├── index.html
    ├── fixtures.html
    ├── results.html
    ├── team.html
    ├── news.html
    ├── gallery.html
    ├── about.html
    ├── contact.html
    │
    ├── .env.example
    └── README.md
```

## Database

The application uses MySQL to store and manage:

* Users
* Teams
* Players
* Fixtures
* Results
* News
* Gallery content
* Contact messages
* Website settings

The database schema and seed data are provided in the `database/` directory.

## Authentication

The administration system uses JWT-based authentication.

The login process is:

```text
Admin Login
     ↓
Flask REST API
     ↓
MySQL User Verification
     ↓
Password Verification
     ↓
JWT Token
     ↓
Authenticated Admin Dashboard
```

Administrative API routes require a valid authentication token.

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Rhema-M/VUT-Hockey-Management-System.git
cd VUT-Hockey-Management-System/vut-hockey
```

### 2. Create a virtual environment

From the `backend` directory:

```bash
cd backend
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

For Git Bash:

```bash
source venv/Scripts/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` directory based on `.env.example`.

Example:

```text
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=vut_hockey
JWT_SECRET=your_secret_key
FLASK_ENV=development
CORS_ORIGINS=*
PORT=5000
```

Do not commit `.env` files or production secrets to GitHub.

### 5. Create the database

Run the SQL files in `database/` using MySQL Workbench or another MySQL client.

The schema creates the required tables, while the seed file provides initial administrator and team data.

### 6. Run the application

From the `backend` directory:

```bash
python app.py
```

The application will be available at:

```text
http://127.0.0.1:5000
```

## API

The Flask backend exposes REST API endpoints for authentication and content management.

Example health endpoint:

```text
GET /api/health
```

The production health check confirms both application status and database connectivity.

## Deployment

The production application is deployed using Railway.

The deployment consists of:

```text
GitHub Repository
       ↓
Railway
       ↓
Gunicorn
       ↓
Flask Application
       ↓
Railway MySQL
```

Railway environment variables are used for production database credentials and JWT configuration.

## Development Status

The core public website, administration system, REST API, authentication, database integration, CRUD functionality, and Railway deployment are implemented and operational.

## Author

**Rhema Miller**

Computer Systems Engineering
Vaal University of Technology

GitHub: https://github.com/Rhema-M
