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
        
        session['user'] = {
            'id': db_id,
            'username': db_user,
            'role': role
            }

        
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

#LOGOUT
@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'logged out successfully', 'redirect': '/login' })


#CHECK USER SESSION
@auth_bp.route('/user', methods=['GET'])
def check_session():
    return jsonify({
        'user': session.get('user'),
        'logged_in': 'user' in session,
        'role': session.get('user')['role'] if session.get('user') else None
    })

@auth_bp.route('/items', methods=['GET'])
def items():
        conn = get_db_conn()
        cursor = conn.cursor()


        cursor.execute("""SELECT c.id as category_id,
        c.name as category_name,
        i.id as item_id,
        i.name as item_name, 
        i.price as price FROM category c LEFT JOIN itemss i ON c.id = i.category_id ORDER BY c.id, i.id""")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        categories = {}
        for row in rows:
            cat_id = row["category_id"]
            if cat_id not in categories:
                categories[cat_id] = {
                    "category_id": cat_id,
                    "category_name": row["category_name"],
                    "items": []
                }
            if row["item_id"]:  # Skip empty categories
                categories[cat_id]["items"].append({
                    "id": row["item_id"],
                    "name": row["item_name"],
                    "price": float(row["price"])
                })

        return jsonify(list(categories.values()))