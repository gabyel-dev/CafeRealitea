from flask_socketio import SocketIO

# Create socketio instance here
socketio = SocketIO(cors_allowed_origins="*")

# Track connected users globally
connected_users = {}
