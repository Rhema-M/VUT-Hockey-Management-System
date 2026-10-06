# VUT Hockey

VUT Hockey is a university hockey club website and management system built as a full-stack application.

The project provides a public-facing website for club information and an authenticated administration system for managing teams, players, fixtures, results, news, gallery content, contact messages, and club settings.

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
* Dynamic content loaded from the backend API
* Loading, error, and empty states

### Administration

* Administrator login with JWT authentication
* Dashboard
* Team management
* Player management
* Fixture management
* Result management
* News management
* Gallery management
* Contact message management
* Club settings management
* Image uploads
* Create, read, update, and delete operations

## Tech Stack

**Frontend**

* HTML5
* CSS3
* Vanilla JavaScript

**Backend**

* Python
* Flask
* REST API
* PyJWT
* Werkzeug password hashing

**Database**

* MySQL 8
* Foreign keys
* Indexes

**Development**

* Git
* GitHub
* VS Code

## Project Structure

```text
vut-hockey/
├── admin/              # Admin dashboard pages
├── backend/            # Flask application and API
├── css/                # Website and admin styles
├── database/            # MySQL schema and seed data
├── js/                 # Frontend JavaScript
├── about.html
├── contact.html
├── fixtures.html
├── gallery.html
├── index.html
├── news.html
├── results.html
└── team.html
```

## Local Development

### Requirements

* Python 3.11 or newer
* MySQL 8 or newer
* Git
* VS Code

### 1. Clone the repository

Clone the repository and open the `vut-hockey` folder in VS Code.

### 2. Create a virtual environment

From the `vut-hockey` directory:

```bash
python -m venv backend/venv
```

Activate it:

**Git Bash**

```bash
source backend/venv/Scripts/activate
```

**Windows Command Prompt**

```text
backend\venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 4. Configure the environment

Copy the example environment file:

**Git Bash**

```bash
cp backend/.env.example backend/.env
```

**Windows Command Prompt**

```text
copy backend\.env.example backend\.env
```

Edit `backend/.env` and provide the MySQL connection details and a long random `JWT_SECRET`.

Do not commit `.env` to GitHub.

### 5. Create the database

From the project root:

```bash
mysql -u root -p < database/schema.sql
```

### 6. Seed the database

Before running the seed file, replace the password hash placeholder in `database/seed.sql`.

Generate a Werkzeug password hash with:

```bash
python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('your-password'))"
```

Then run:

```bash
mysql -u root -p < database/seed.sql
```

### 7. Start the Flask application

From the backend directory:

```bash
cd backend
python app.py
```

Open:

```text
http://localhost:5000
```

The administrator login is available at:

```text
http://localhost:5000/admin/login.html
```

## API

Public read endpoints include:

```text
GET /api/teams
GET /api/players
GET /api/fixtures
GET /api/results
GET /api/news
GET /api/gallery
GET /api/settings
```

Contact submissions use:

```text
POST /api/contact
```

Administrator authentication uses:

```text
POST /api/auth/login
```

Protected requests use:

```text
Authorization: Bearer <token>
```

CRUD operations are available for:

```text
/api/teams
/api/players
/api/fixtures
/api/results
/api/news
/api/gallery
```

Administration of contact messages and settings is handled through:

```text
/api/contact
/api/settings
```

API responses follow a consistent structure:

```json
{
  "success": true,
  "data": {}
}
```

or:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Database

The MySQL database contains tables for:

* Users
* Teams
* Players
* Fixtures
* Results
* News
* Gallery
* Contact messages
* Settings

Relationships are enforced using foreign keys, with indexes used for commonly queried fields.

## Demo

A live demo will be added once the application is deployed.

## Development Status

The core application is complete, including the public website, MySQL database, Flask REST API, administrator authentication, navigation, and CRUD functionality.

The project is currently configured for local development and is being prepared for public deployment.

## License

This project was developed as a university and portfolio project.
