from flask_socketio import SocketIO
from flask_bcrypt import Bcrypt

# Initialize extensions - use async_mode='eventlet' for production
socketio = SocketIO(cors_allowed_origins="*", async_mode='eventlet')
bcrypt = Bcrypt()

# Track connected users
connected_users = {}