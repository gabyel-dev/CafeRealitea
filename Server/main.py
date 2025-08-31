import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room, leave_room
from Controllers.auth_controller import auth_bp
from Models.database import get_db_conn
from utils.hash_passwords import bcrypt

# load env vars
load_dotenv()

app = Flask(__name__)

# ---- Config ----
app.secret_key = os.getenv("SECRET_KEY", "supersecretkey")
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_USE_SIGNER"] = True
app.config["SESSION_KEY_PREFIX"] = "flask_session"
app.config["SESSION_COOKIE_NAME"] = "session_cookies"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True

# ---- Init extensions ----
get_db_conn()
CORS(app, supports_credentials=True)
bcrypt.init_app(app)
Session(app)

# ---- Socket.IO ----
socketio = SocketIO(app, cors_allowed_origins="*")

# Track connected users {user_id: session_id}
connected_users = {}

@socketio.on("connect")
def handle_connect():
    print("Client connected:", request.sid)

@socketio.on("disconnect")
def handle_disconnect():
    # remove user from connected_users
    for uid, sid in list(connected_users.items()):
        if sid == request.sid:
            del connected_users[uid]
            break
    print("Client disconnected:", request.sid)

@socketio.on("register_user")
def handle_register_user(data):
    """Frontend sends {user_id} after login"""
    user_id = data.get("user_id")
    if user_id:
        connected_users[user_id] = request.sid
        print(f"User {user_id} registered to socket {request.sid}")

# ---- Blueprints ----
app.register_blueprint(auth_bp)

if __name__ == '__main__':
    # use socketio.run instead of app.run
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
