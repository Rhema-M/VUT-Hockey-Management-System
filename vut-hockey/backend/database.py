import os
from contextlib import contextmanager
from typing import Any, Iterable

import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def connection_config() -> dict[str, Any]:
    return {
        "host": os.getenv("DB_HOST", "127.0.0.1"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", ""),
        "password": os.getenv("DB_PASSWORD", ""),
        "database": os.getenv("DB_NAME", "vut_hockey"),
        "autocommit": False,
    }


@contextmanager
def get_connection():
    connection = mysql.connector.connect(**connection_config())
    try:
        yield connection
    finally:
        if connection.is_connected():
            connection.close()


def query(sql: str, params: Iterable[Any] = ()) -> list[dict[str, Any]]:
    with get_connection() as connection:
        cursor = connection.cursor(dictionary=True)
        try:
            cursor.execute(sql, tuple(params))
            return cursor.fetchall()
        finally:
            cursor.close()


def query_one(sql: str, params: Iterable[Any] = ()) -> dict[str, Any] | None:
    rows = query(sql, params)
    return rows[0] if rows else None


def execute(sql: str, params: Iterable[Any] = ()) -> int:
    with get_connection() as connection:
        cursor = connection.cursor()
        try:
            cursor.execute(sql, tuple(params))
            connection.commit()
            return int(cursor.lastrowid or cursor.rowcount)
        except Exception:
            connection.rollback()
            raise
        finally:
            cursor.close()