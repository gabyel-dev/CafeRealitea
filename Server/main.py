from flask import Flask
from flask_cors import CORS
from Controllers.auth_controller import auth_bp  # adjust path if needed
from Models.database import get_db_conn

get_db_conn()

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Needed for session
CORS(app, supports_credentials=True)  # Required for cookies/sessions from frontend

# Register the auth blueprint
app.register_blueprint(auth_bp)

# Optional test route
@app.route('/')
def index():
    return 'Flask Server is Running'

if __name__ == '__main__':
    app.run(debug=True)
