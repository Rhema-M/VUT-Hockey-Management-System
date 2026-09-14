import os
from datetime import date, datetime
from pathlib import Path
from typing import Any

import mysql.connector
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.security import check_password_hash

if __package__:
    from backend.database import execute, query, query_one
    from backend.middleware.auth import create_token, require_admin, token_user
    from backend.utils.validators import parse_date, parse_id, required, save_image, valid_email
else:
    from database import execute, query, query_one
    from middleware.auth import create_token, require_admin, token_user
    from utils.validators import parse_date, parse_id, required, save_image, valid_email

PROJECT_ROOT = Path(__file__).resolve().parents[1]
UPLOAD_ROOT = PROJECT_ROOT / "backend" / "uploads"
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

app = Flask(__name__, static_folder=str(PROJECT_ROOT), static_url_path="")
CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})
app.config["MAX_CONTENT_LENGTH"] = 6 * 1024 * 1024


def success(data: Any = None, status: int = 200):
    return jsonify({"success": True, "data": data}), status


def failure(message: str, status: int = 400):
    return jsonify({"success": False, "error": message}), status


def serialise(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, list):
        return [serialise(item) for item in value]
    if isinstance(value, dict):
        return {key: serialise(item) for key, item in value.items()}
    return value


def rows(sql: str, params: tuple = ()):
    return success(serialise(query(sql, params)))


def one(sql: str, params: tuple = ()):
    item = query_one(sql, params)
    return success(serialise(item)) if item else failure("Record not found", 404)


def optional_one(sql: str, params: tuple = ()):
    return success(serialise(query_one(sql, params)))


def payload() -> dict[str, Any]:
    return request.get_json(silent=True) or request.form.to_dict()


def resource_id(name: str) -> int | None:
    return parse_id(name)


@app.errorhandler(mysql.connector.Error)
def database_error(error):
    app.logger.error("Database operation failed: %s", error)
    return failure("The database is unavailable. Configure MySQL and try again.", 503)


@app.errorhandler(413)
def too_large(_error):
    return failure("The uploaded file is too large.", 413)


@app.get("/api/health")
def health():
    try:
        query("SELECT 1 AS ok")
        return success({"status": "ok", "database": "connected"})
    except mysql.connector.Error:
        return success({"status": "degraded", "database": "unavailable"}, 503)


@app.post("/api/auth/login")
def login():
    data = payload()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if not valid_email(email) or not password:
        return failure("Enter a valid email address and password.")
    user = query_one(
        "SELECT id, name, email, password_hash, role FROM users WHERE email = %s",
        (email,),
    )
    if not user or not check_password_hash(user["password_hash"], password):
        return failure("Invalid email or password.", 401)
    safe_user = {key: user[key] for key in ("id", "name", "email", "role")}
    return success({"token": create_token(safe_user), "user": safe_user})


@app.get("/api/auth/me")
@require_admin
def me():
    user = query_one("SELECT id, name, email, role FROM users WHERE id = %s", (int(token_user()["sub"]),))
    return success(user) if user else failure("User not found", 404)


@app.get("/api/teams")
def get_teams():
    return rows("SELECT * FROM teams ORDER BY name ASC")


@app.get("/api/teams/<int:item_id>")
def get_team(item_id):
    return one("SELECT * FROM teams WHERE id = %s", (item_id,))


@app.get("/api/players")
def get_players():
    team_id = parse_id(request.args.get("team_id"))
    sql = "SELECT p.*, t.name AS team_name FROM players p JOIN teams t ON t.id = p.team_id"
    params: tuple = ()
    if team_id:
        sql += " WHERE p.team_id = %s"
        params = (team_id,)
    return rows(sql + " ORDER BY p.name ASC", params)


@app.get("/api/players/<int:item_id>")
def get_player(item_id):
    return one(
        "SELECT p.*, t.name AS team_name FROM players p JOIN teams t ON t.id = p.team_id WHERE p.id = %s",
        (item_id,),
    )


@app.get("/api/fixtures")
def get_fixtures():
    sql = """SELECT f.*, t.name AS team_name
             FROM fixtures f JOIN teams t ON t.id = f.team_id"""
    filters: list[str] = []
    params: list[Any] = []
    team_id = parse_id(request.args.get("team_id"))
    date_filter = request.args.get("date")
    scope = request.args.get("scope")
    if team_id:
        filters.append("f.team_id = %s")
        params.append(team_id)
    if date_filter and parse_date(date_filter):
        filters.append("f.date = %s")
        params.append(parse_date(date_filter))
    if scope == "upcoming":
        filters.append("f.date >= CURDATE()")
    elif scope == "past":
        filters.append("f.date < CURDATE()")
    if filters:
        sql += " WHERE " + " AND ".join(filters)
    return rows(sql + " ORDER BY f.date ASC, f.time ASC", tuple(params))


@app.get("/api/fixtures/next")
def get_next_fixture():
    return optional_one(
        """SELECT f.*, t.name AS team_name
           FROM fixtures f JOIN teams t ON t.id = f.team_id
           WHERE TIMESTAMP(f.date, COALESCE(f.time, '00:00:00')) >= NOW()
           ORDER BY f.date ASC, f.time ASC LIMIT 1"""
    )


@app.get("/api/results")
def get_results():
    sql = """SELECT r.*, t.name AS team_name
             FROM results r JOIN teams t ON t.id = r.team_id"""
    filters: list[str] = []
    params: list[Any] = []
    team_id = parse_id(request.args.get("team_id"))
    date_filter = request.args.get("date")
    if team_id:
        filters.append("r.team_id = %s")
        params.append(team_id)
    if date_filter and parse_date(date_filter):
        filters.append("r.date = %s")
        params.append(parse_date(date_filter))
    if filters:
        sql += " WHERE " + " AND ".join(filters)
    return rows(sql + " ORDER BY r.date DESC", tuple(params))


@app.get("/api/results/latest")
def get_latest_result():
    return optional_one(
        """SELECT r.*, t.name AS team_name
           FROM results r JOIN teams t ON t.id = r.team_id
           ORDER BY r.date DESC, r.id DESC LIMIT 1"""
    )


@app.get("/api/news")
def get_news():
    if token_user():
        return rows(
            """SELECT n.id, n.author_id, n.title, n.slug, n.summary, n.content, n.image,
                      n.published, n.published_at, n.created_at, n.updated_at, u.name AS author_name
               FROM news n LEFT JOIN users u ON u.id = n.author_id
               ORDER BY COALESCE(n.published_at, n.created_at) DESC"""
        )
    return rows(
        """SELECT n.id, n.author_id, n.title, n.slug, n.summary, n.content, n.image,
                  n.published, n.published_at, n.created_at, n.updated_at, u.name AS author_name
           FROM news n LEFT JOIN users u ON u.id = n.author_id
           WHERE n.published = 1 ORDER BY COALESCE(n.published_at, n.created_at) DESC"""
    )


@app.get("/api/news/latest")
def get_latest_news():
    return get_news()


@app.get("/api/news/<int:item_id>")
def get_news_item(item_id):
    if token_user():
        return one(
            """SELECT n.id, n.author_id, n.title, n.slug, n.summary, n.content, n.image,
                      n.published, n.published_at, n.created_at, n.updated_at, u.name AS author_name
               FROM news n LEFT JOIN users u ON u.id = n.author_id
               WHERE n.id = %s""",
            (item_id,),
        )
    return one(
        """SELECT n.id, n.author_id, n.title, n.slug, n.summary, n.content, n.image,
                  n.published, n.published_at, n.created_at, n.updated_at, u.name AS author_name
           FROM news n LEFT JOIN users u ON u.id = n.author_id
           WHERE n.id = %s AND n.published = 1""",
        (item_id,),
    )


@app.get("/api/gallery")
def get_gallery():
    return rows(
        """SELECT g.*, t.name AS team_name
           FROM gallery g LEFT JOIN teams t ON t.id = g.team_id
           ORDER BY g.created_at DESC"""
    )


@app.get("/api/settings")
def get_settings():
    records = query("SELECT setting_key, setting_value FROM settings ORDER BY setting_key")
    return success({record["setting_key"]: record["setting_value"] for record in records})


@app.post("/api/contact")
def create_contact():
    data = payload()
    name, email, subject, message = (
        str(data.get(key, "")).strip() for key in ("name", "email", "subject", "message")
    )
    missing = required({"name": name, "email": email, "subject": subject, "message": message}, ["name", "email", "subject", "message"])
    if missing:
        return failure(missing)
    if not valid_email(email):
        return failure("Enter a valid email address.")
    if len(message) < 10 or len(message) > 5000:
        return failure("Message must be between 10 and 5000 characters.")
    item_id = execute(
        "INSERT INTO contact_messages (name, email, subject, message, status) VALUES (%s, %s, %s, %s, 'new')",
        (name, email, subject, message),
    )
    return success({"id": item_id}, 201)


RESOURCE_CONFIG = {
    "teams": {
        "table": "teams",
        "fields": ["name", "category", "description", "logo"],
        "required": ["name", "category"],
        "select": "SELECT * FROM teams ORDER BY name ASC",
        "image_category": "teams",
        "file_field": "logo",
    },
    "players": {
        "table": "players",
        "fields": ["team_id", "name", "position", "squad_number", "image", "biography"],
        "required": ["team_id", "name"],
        "select": "SELECT p.*, t.name AS team_name FROM players p JOIN teams t ON t.id = p.team_id ORDER BY p.name ASC",
        "image_category": "players",
        "file_field": "image",
    },
    "fixtures": {
        "table": "fixtures",
        "fields": ["team_id", "opponent", "date", "time", "venue", "competition", "status"],
        "required": ["team_id", "opponent", "date"],
        "select": "SELECT f.*, t.name AS team_name FROM fixtures f JOIN teams t ON t.id = f.team_id ORDER BY f.date ASC, f.time ASC",
    },
    "results": {
        "table": "results",
        "fields": ["team_id", "opponent", "team_score", "opponent_score", "date", "venue", "competition"],
        "required": ["team_id", "opponent", "team_score", "opponent_score", "date"],
        "select": "SELECT r.*, t.name AS team_name FROM results r JOIN teams t ON t.id = r.team_id ORDER BY r.date DESC",
    },
    "news": {
        "table": "news",
        "fields": ["title", "slug", "summary", "content", "image", "published", "published_at"],
        "required": ["title", "slug", "summary", "content"],
        "select": "SELECT n.*, u.name AS author_name FROM news n LEFT JOIN users u ON u.id = n.author_id ORDER BY n.created_at DESC",
        "image_category": "news",
        "file_field": "image",
    },
    "gallery": {
        "table": "gallery",
        "fields": ["caption", "image", "category", "team_id"],
        "required": ["image"],
        "select": "SELECT g.*, t.name AS team_name FROM gallery g LEFT JOIN teams t ON t.id = g.team_id ORDER BY g.created_at DESC",
        "image_category": "gallery",
        "file_field": "image",
    },
}


def clean_value(field: str, value: Any) -> Any:
    if value is None or value == "":
        return None
    if field.endswith("_id") or field in {"team_score", "opponent_score", "squad_number"}:
        return parse_id(value) or 0
    if field == "published":
        return 1 if str(value).lower() in {"1", "true", "on", "yes"} else 0
    if field == "date":
        return parse_date(str(value))
    return str(value).strip()


def resource_list(resource):
    config = RESOURCE_CONFIG[resource]
    return rows(config["select"])


def create_resource(resource):
    config = RESOURCE_CONFIG[resource]
    data = payload()
    if "image_category" in config and request.files.get(config["file_field"]):
        try:
            data[config["file_field"]] = save_image(
                request.files[config["file_field"]], UPLOAD_ROOT, config["image_category"]
            )
        except ValueError as error:
            return failure(str(error))
    missing = required(data, config["required"])
    if missing:
        return failure(missing)
    fields = config["fields"]
    values = [clean_value(field, data.get(field)) for field in fields]
    if resource == "news":
        data["author_id"] = int(token_user()["sub"])
        fields = ["author_id"] + fields
        values = [data["author_id"]] + values
    placeholders = ", ".join(["%s"] * len(fields))
    item_id = execute(
        f"INSERT INTO {config['table']} ({', '.join(fields)}) VALUES ({placeholders})",
        tuple(values),
    )
    return success({"id": item_id}, 201)


def update_resource(resource, item_id):
    config = RESOURCE_CONFIG[resource]
    data = payload()
    if "image_category" in config and request.files.get(config["file_field"]):
        try:
            data[config["file_field"]] = save_image(
                request.files[config["file_field"]], UPLOAD_ROOT, config["image_category"]
            )
        except ValueError as error:
            return failure(str(error))
    fields = [field for field in config["fields"] if field in data]
    if not fields:
        return failure("No editable fields supplied.")
    values = [clean_value(field, data.get(field)) for field in fields]
    execute(
        f"UPDATE {config['table']} SET {', '.join(f'{field} = %s' for field in fields)} WHERE id = %s",
        tuple(values) + (item_id,),
    )
    return success({"id": item_id})


def delete_resource(resource, item_id):
    execute(f"DELETE FROM {RESOURCE_CONFIG[resource]['table']} WHERE id = %s", (item_id,))
    return success({"id": item_id})


for resource_name in RESOURCE_CONFIG:
    app.add_url_rule(
        f"/api/{resource_name}",
        endpoint=f"{resource_name}_create",
        view_func=require_admin(lambda resource=resource_name: create_resource(resource)),
        methods=["POST"],
    )
    app.add_url_rule(
        f"/api/{resource_name}/<int:item_id>",
        endpoint=f"{resource_name}_update",
        view_func=require_admin(lambda item_id, resource=resource_name: update_resource(resource, item_id)),
        methods=["PUT"],
    )
    app.add_url_rule(
        f"/api/{resource_name}/<int:item_id>",
        endpoint=f"{resource_name}_delete",
        view_func=require_admin(lambda item_id, resource=resource_name: delete_resource(resource, item_id)),
        methods=["DELETE"],
    )


@app.get("/api/contact")
@require_admin
def admin_messages():
    return rows("SELECT * FROM contact_messages ORDER BY created_at DESC")


@app.put("/api/contact/<int:item_id>")
@require_admin
def update_message(item_id):
    data = payload()
    status = str(data.get("status", "")).strip()
    if status not in {"new", "read", "archived"}:
        return failure("Status must be new, read, or archived.")
    execute("UPDATE contact_messages SET status = %s WHERE id = %s", (status, item_id))
    return success({"id": item_id, "status": status})


@app.delete("/api/contact/<int:item_id>")
@require_admin
def delete_message(item_id):
    execute("DELETE FROM contact_messages WHERE id = %s", (item_id,))
    return success({"id": item_id})


@app.put("/api/settings")
@require_admin
def update_settings():
    data = payload()
    if not data:
        return failure("No settings supplied.")
    for key, value in data.items():
        execute(
            """INSERT INTO settings (setting_key, setting_value) VALUES (%s, %s)
               ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)""",
            (str(key), str(value)),
        )
    return get_settings()


@app.post("/api/uploads/<category>")
@require_admin
def upload(category):
    if category not in {"players", "teams", "news", "gallery"}:
        return failure("Unsupported upload category.")
    image = request.files.get("image")
    if not image:
        return failure("Choose an image to upload.")
    try:
        return success({"path": save_image(image, UPLOAD_ROOT, category)}, 201)
    except ValueError as error:
        return failure(str(error))


@app.get("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_ROOT, filename)


@app.get("/")
def home():
    return send_from_directory(PROJECT_ROOT, "index.html")


@app.get("/<path:filename>")
def frontend_file(filename):
    requested = PROJECT_ROOT / filename
    if requested.is_file() and PROJECT_ROOT in requested.parents:
        return send_from_directory(PROJECT_ROOT, filename)
    return send_from_directory(PROJECT_ROOT, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_ENV") == "development")