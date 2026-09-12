import os
from functools import wraps
from typing import Any, Callable

import jwt
from flask import g, jsonify, request


def create_token(user: dict[str, Any]) -> str:
    return jwt.encode(
        {
            "sub": str(user["id"]),
            "email": user["email"],
            "role": user["role"],
        },
        os.getenv("JWT_SECRET", "development-only-secret"),
        algorithm="HS256",
    )


def token_user() -> dict[str, Any] | None:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    try:
        return jwt.decode(
            header.removeprefix("Bearer ").strip(),
            os.getenv("JWT_SECRET", "development-only-secret"),
            algorithms=["HS256"],
        )
    except jwt.PyJWTError:
        return None


def require_admin(view: Callable):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = token_user()
        if not user or user.get("role") != "admin":
            return jsonify({"success": False, "error": "Administrator authentication required"}), 401
        g.current_user = user
        return view(*args, **kwargs)

    return wrapped