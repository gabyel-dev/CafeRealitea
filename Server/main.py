import os
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from flask_session import Session
from extensions import socketio, bcrypt, connected_users
from finance_bp import finance_bp



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
CORS(app, supports_credentials=True)
bcrypt.init_app(app)
Session(app)

# Configure Socket.IO with proper async mode
socketio.init_app(app, 
                 cors_allowed_origins="*", 
                 async_mode='eventlet',
                 logger=True,
                 engineio_logger=True)

# ---- Socket.IO events ----
@socketio.on("connect")
def handle_connect():
    print("Client connected:", request.sid)
    return True  # Important: return True to accept connection

@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected:", request.sid)
    for uid, sid in list(connected_users.items()):
        if sid == request.sid:
            del connected_users[uid]
            break

@socketio.on("register_user")
def handle_register_user(data):
    user_id = data.get("user_id")
    if user_id:
        connected_users[user_id] = request.sid
        print(f"User {user_id}   {request.sid}")

# ---- Import and register blueprints AFTER initializing extensions ----
from Controllers.auth_controller import auth_bp
app.register_blueprint(auth_bp)
app.register_blueprint(finance_bp)

# Add health check endpoint
@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    print("Starting Socket.IO server...")
    socketio.run(app, 
                 host="0.0.0.0", 
                 port=5000, 
                 debug=True,  # Set to False in production
                 use_reloader=False,
                 allow_unsafe_werkzeug=True)