from flask import Blueprint, request, jsonify, session
from Models.database import get_db_conn
import json
from utils.hash_passwords import hash_password, check_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def Login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
        user = cursor.fetchone()
        
        

        if user is None and check_password(user['password'], password):
            return jsonify({'message': 'invalid credentials'})
        
        # Access dictionary keys from RealDictCursor result
        db_id = user['id']           # adjust key name as per your column
        db_name = user['name']
        db_email = user['email']
        db_user = user['username']
        role = user['role']
        
        session['user'] = {
            'id': db_id,
            'name': db_name,
            'email': db_email,
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

#REGISTER 
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    conn = get_db_conn()
    cursor = conn.cursor()

    hash_pass = hash_password(password)

    try:
        cursor.execute('INSERT INTO users_account (first_name, last_name, email, username, password, role) '
                        'VALUES (%s, %s, %s, %s, %s, %s)', (first_name, last_name, email, username, hash_pass, role))
        conn.commit()

        print('success!!')

        return jsonify({'message': 'Registered Successfully', 'redirect': '/login'})

    except Exception as e:
        print('failed to register')
        

#LOGOUT
@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'logged out successfully', 'redirect': '/Admin/dashboard' })


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

@auth_bp.route('/orders', methods=['POST'])
def create_order():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    conn = get_db_conn()
    cursor = conn.cursor()
    
    try:
        # Insert main order
        cursor.execute("""
            INSERT INTO orders (customer_name, order_type, payment_method, total)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (
            data.get('customer_name', 'Walk-in customer'),
            data['order_type'],
            data['payment_method'],
            json.dump(data['total'])
        ))
        
        order_id = cursor.fetchone()['id']
        
        # Insert order items
        for item in data['items']:
            cursor.execute("""
                INSERT INTO order_items (order_id, item_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (
                order_id,
                item['id'],
                item.get('quantity', 1),
                item['price']
            ))
        
        conn.commit()
        return jsonify({'message': 'Order created successfully', 'order_id': order_id}), 201
    
    except Exception as e:
        conn.rollback()
        print("Order creation error:", e)
        return jsonify({'error': 'Server error'}), 500
    
    finally:
        cursor.close()
        conn.close()


@auth_bp.route('/orders/simple', methods=['POST'])
def create_simple_order():
    from traceback import print_exc
    import json

    data = request.get_json()
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        # Count orders for order_number
        cursor.execute("SELECT COUNT(*) AS order_count FROM orders_")
        result = cursor.fetchone()

        # Handle dict or tuple result
        if isinstance(result, dict):
            order_count = result.get('order_count', 0)
        else:
            order_count = result[0] if result else 0

        order_number = f"#{order_count + 1}"
        print(f"Generated order_number: {order_number}")

        # Store items as JSON
        items_json = json.dumps(data.get('items', []), ensure_ascii=False)
        print(f"Items JSON: {items_json}")

        # Prepare query parameters
        params = (
            order_number,
            data.get('customer_name', 'Walk-in customer'),
            data.get('order_type'),
            data.get('payment_method'),
            data.get('total_amount'),
            items_json
        )

        # Insert into DB
        cursor.execute("""
            INSERT INTO orders_ (order_number, customer_name, order_type, 
                                 payment_method, total_amount, items)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, params)

        order_id_result = cursor.fetchone()
        if isinstance(order_id_result, dict):
            order_id = order_id_result.get('id')
        else:
            order_id = order_id_result[0] if order_id_result else None

        print(f"Inserted Order ID: {order_id}")

        conn.commit()
        return jsonify({
            'message': 'Order saved successfully',
            'order_number': order_number,
            'order_id': order_id
        }), 201

    except Exception as e:
        conn.rollback()
        print("Order error:", e)
        print_exc()
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()
