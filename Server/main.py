import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_session import Session
from Controllers.auth_controller import auth_bp
from Models.database import get_db_conn
from utils.hash_passwords import bcrypt

# load env vars
load_dotenv()

app = Flask(__name__)

# ---- Config (directly in main.py) ----
app.secret_key = os.getenv("SECRET_KEY", "supersecretkey")

app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_USE_SIGNER"] = True
app.config["SESSION_KEY_PREFIX"] = "flask_session"
app.config["SESSION_COOKIE_NAME"] = "session_cookies"

# Important for cross-site cookies (Render backend <-> Vercel frontend)
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True   # True for HTTPS in production!

# ---- Init extensions ----
get_db_conn()
CORS(app, supports_credentials=True)
bcrypt.init_app(app)
Session(app)

# ---- Blueprints ----
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)