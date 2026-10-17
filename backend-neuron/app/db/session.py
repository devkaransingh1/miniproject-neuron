from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./neuron.db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_db_schema(db_engine=engine):
    """
    Ensure newly added columns exist in SQLite database.
    """
    from sqlalchemy import text
    try:
        with db_engine.connect() as conn:
            # Users table migration
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")).fetchall()
            if result:
                columns = [row[1] for row in conn.execute(text("PRAGMA table_info(users)")).fetchall()]
                new_columns = [
                    ("is_github_connected", "BOOLEAN DEFAULT 0 NOT NULL"),
                    ("github_access_token", "TEXT"),
                    ("github_username", "VARCHAR"),
                    ("github_user_id", "VARCHAR"),
                ]
                for col_name, col_type in new_columns:
                    if col_name not in columns:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))

            # Conversations table migration
            conv_result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'")).fetchall()
            if conv_result:
                conv_columns = [row[1] for row in conn.execute(text("PRAGMA table_info(conversations)")).fetchall()]
                if "updated_at" not in conv_columns:
                    conn.execute(text("ALTER TABLE conversations ADD COLUMN updated_at DATETIME"))

            conn.commit()
    except Exception as exc:
        print(f"Schema check error: {exc}")