from flask import Blueprint, request, jsonify, session
from Models.database import get_db_conn

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def Login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT * FROM Admin_Users WHERE username = %s', (username,))
        user = cursor.fetchone()

        if user is None:
            return jsonify({'error': 'Invalid Credentials'}), 401
        
        # Access dictionary keys from RealDictCursor result
        db_id = user['id']           # adjust key name as per your column
        db_user = user['username']
        db_password = user['password']
        role = user['role']

        if password != db_password:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        session['user_id'] = db_id
        session['username'] = db_user
        session['role'] = role
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': db_id,
                'username': db_user,
                'role': role
            }
        }), 200

    except Exception as e:
        print("Login error:", e)
        return jsonify({'error': 'Server error'}), 500

    finally:
        cursor.close()
        conn.close()
