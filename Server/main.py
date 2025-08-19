from flask import Flask
from flask_cors import CORS
from Controllers.auth_controller import auth_bp  # adjust path if needed
from Models.database import get_db_conn
from config import Config
from utils.hash_passwords import bcrypt
from flask_session import Session

get_db_conn()

app = Flask(__name__)
app.secret_key = Config.SECRET_KEY
app.config['SESSION_TYPE'] = 'filesystem'  
CORS(app, supports_credentials=True) 
bcrypt.init_app(app)
Session(app)



app.register_blueprint(auth_bp)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
