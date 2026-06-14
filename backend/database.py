import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).resolve().parent.parent / "smartsense.db"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY,
            user_email TEXT NOT NULL,
            stress_level TEXT NOT NULL,
            confidence REAL NOT NULL,
            score REAL NOT NULL,
            features_used TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_email) REFERENCES users(email)
        )
    """)

    conn.commit()
    conn.close()


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def insert_user(email: str, name: str, password_hash: str):
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)", (email, name, password_hash))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def get_user(email: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None


def insert_history(user_email: str, stress_level: str, confidence: float, score: float, features: dict):
    conn = get_db()
    cursor = conn.cursor()
    import json
    cursor.execute(
        "INSERT INTO history (user_email, stress_level, confidence, score, features_used) VALUES (?, ?, ?, ?, ?)",
        (user_email, stress_level, confidence, score, json.dumps(features)),
    )
    conn.commit()
    conn.close()


def get_history(user_email: str, limit: int = 50):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM history WHERE user_email = ? ORDER BY created_at DESC LIMIT ?",
        (user_email, limit),
    )
    records = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return records
