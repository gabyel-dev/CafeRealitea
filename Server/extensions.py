from flask_socketio import SocketIO
from flask_bcrypt import Bcrypt

# Initialize extensions
socketio = SocketIO(cors_allowed_origins="*", async_mode='threading')
bcrypt = Bcrypt()

# Track connected users
connected_users = {}