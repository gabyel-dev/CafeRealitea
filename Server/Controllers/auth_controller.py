from flask import Blueprint, request, jsonify, session
from Models.database import get_db_conn
import json
from utils.hash_passwords import hash_password, check_password
from datetime import datetime, timedelta
import pytz
import secrets
from extensions import socketio, connected_users


ALLOWED_ROLES = ['Staff', 'Admin', 'System Administrator']

auth_bp = Blueprint('auth', __name__)
#login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT * FROM users_account WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user is None or not check_password(user['password'], password):
            return jsonify({'message': 'Invalid credentials'}), 401

        # 🔹 Always generate a new secure random token (force logout)
        token = secrets.token_hex(32)

        # Update DB token (overwrites old one if exists)
        cursor.execute("UPDATE users_account SET users_token = %s WHERE id = %s", (token, user['id']))
        conn.commit()

        # Save token + user info to session
        session['user'] = {
            'id': user['id'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'email': user['email'],
            'username': user['username'],
            'role': user['role'],
            'token': token
        }

        return jsonify({
            'message': 'Login successful',
            'user': session['user'],
            'redirect': '/dashboard'
        }), 200

    except Exception as e:
        print("Login error:", e)
        return jsonify({'error': 'Server error'}), 500

    finally:
        cursor.close()
        conn.close()


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

    if role not in ALLOWED_ROLES:
            return jsonify({"error": "Invalid Role"}), 400

    if not all([first_name, last_name, email, username, password, role]):
        return jsonify({'error': 'All fields are required'}), 400

    conn = get_db_conn()
    cursor = conn.cursor()

    hash_pass = hash_password(password)

    try:
        cursor.execute(
            'INSERT INTO users_account (first_name, last_name, email, username, password, role) '
            'VALUES (%s, %s, %s, %s, %s, %s)',
            (first_name, last_name, email, username, hash_pass, role)
        )
        conn.commit()
        return jsonify({'message': 'Registered Successfully', 'redirect': '/members'}), 201

    except Exception as e:
        print('failed to register', e)
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
        

#LOGOUT
@auth_bp.route('/logout', methods=['POST'])
def logout():
    user = session.get('user')

    if user:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute('UPDATE users_account SET users_token = NULL WHERE id = %s', (user['id'],))
        conn.commit()
        cursor.close()
        conn.close()

    session.clear()
    return jsonify({'message': 'logged out successfully', 'redirect': '/' })


#CHECK USER SESSION
@auth_bp.route('/user', methods=['GET'])
def check_session():
    return jsonify({
        'user': session.get('user'),
        'logged_in': 'user' in session,
        'role': session.get('user')['role'] if session.get('user') else None
    })

#check session
@auth_bp.route('/check_session', methods=['GET'])
def checkSession():
    conn = get_db_conn()
    cursor = conn.cursor()

    user = session.get('user')
    if not user:  # ✅ handle missing session
        cursor.close()
        conn.close()
        return jsonify({'valid': False, 'error': 'No active session'}), 403

    cursor.execute('SELECT users_token FROM users_account WHERE id = %s', (user['id'],))
    db_token = cursor.fetchone()    
    cursor.close()
    conn.close()

    if not db_token or db_token[0] != user['token']:
        session.clear()
        return jsonify({'valid': False}), 403

    return jsonify({'valid': True, 'user': user}), 20


#view items in orders
@auth_bp.route('/items', methods=['GET'])
def items():
        conn = get_db_conn()
        cursor = conn.cursor()


        cursor.execute("""SELECT c.id as category_id,
        c.name as category_name,
        i.id as item_id,
        i.name as item_name, 
        i.price as price FROM categories c LEFT JOIN itemss i ON c.id = i.category_id ORDER BY c.id, i.id""")
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

#handle orders
@auth_bp.route('/orders', methods=['POST'])
def create_order(): 
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
            data['total']
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


        user_id = session.get("user", {}).get("id")
        if user_id and user_id in connected_users:
                socketio.emit("notification", {
                    "message": f"Your order #{order_id} has been created!",
                    "order_id": order_id,
                    "type": "personal"
                }, to=connected_users[user_id])
        return jsonify({'message': 'Created successfully', 'order_id': order_id}), 201
    

    
    except Exception as e:
        conn.rollback()
        print("Order creation error:", e)
        return jsonify({'error': 'Server error'}), 500
    
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/orders/pending', methods=['POST'])
def create_pending_order():
    data = request.get_json()
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO orders (customer_name, order_type, payment_method, total, status)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data.get('customer_name', 'Walk-in customer'),
            data['order_type'],
            data['payment_method'],
            data['total'],
            "PENDING"   # ⚠️ difference from /orders
        ))
        
        order_id = cursor.fetchone()['id']

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

        # 🔔 Broadcast pending order to all connected users
        socketio.emit("notification", {
            "message": f"New pending order #{order_id} needs confirmation!",
            "order_id": order_id,
            "type": "broadcast"
        }, broadcast=True)

        return jsonify({'message': 'Pending order created', 'order_id': order_id}), 201
    
    except Exception as e:
        conn.rollback()
        print("Pending order error:", e)
        return jsonify({'error': 'Server error'}), 500
    
    finally:
        cursor.close()
        conn.close()



@auth_bp.route('/orders/update_status', methods=['POST'])
def update_order_status():
    data = request.get_json()
    order_id = data.get("order_id")
    new_status = data.get("status")  # CONFIRMED or CANCELED

    if new_status not in ["CONFIRMED", "CANCELED"]:
        return jsonify({"error": "Invalid status"}), 400

    conn = get_db_conn()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE orders SET status = %s WHERE id = %s", (new_status, order_id))
        conn.commit()

        # 🔔 Notify everyone about status update
        socketio.emit("notification", {
            "message": f"Order #{order_id} has been {new_status.lower()}!",
            "order_id": order_id,
            "type": "status_update"
        }, broadcast=True)

        return jsonify({"message": f"Order {order_id} updated to {new_status}"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


#all months
@auth_bp.route('/orders/months', methods=['GET'])
def months():
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute("""SELECT 
                            EXTRACT (YEAR FROM order_time) AS YEAR, 
                            EXTRACT (MONTH FROM order_time) AS MONTH,
                            COUNT (*) AS total_orders, 
                            SUM(total) AS total_sales 
                        FROM orders
                        GROUP BY year, month
                        ORDER BY year, month """)
        rows = cursor.fetchall()

        result = []

        for row in rows:
            result.append({
                "year": row['year'],
                "months": row['month'],
                "total_orders": row["total_orders"],
                "total_sales": row["total_sales"]
            })

        return jsonify(result)
    
    except Exception as e:
        print(e)
        return jsonify({"error message": e})
    
    finally:
        cursor.close()
        conn.close()

#all years
@auth_bp.route('/orders/year', methods=['GET'])
def years():

    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute("""SELECT 
                            EXTRACT (YEAR FROM order_time) AS YEAR, 
                            COUNT (*) AS total_orders, 
                            SUM(total) AS total_sales 
                        FROM orders
                        GROUP BY year
                        ORDER BY year """)
        rows = cursor.fetchall()

        result = []

        for row in rows:
            result.append({
                "year": row['year'],
                "total_orders": row["total_orders"],
                "total_sales": row["total_sales"]
            })

        return jsonify(result)
    
    except Exception as e:
        print(e)
        return jsonify({"error message": e})
    
    finally:
        cursor.close()
        conn.close()

#current month
@auth_bp.route('/orders/current-month', methods=['GET'])
def monthly():
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute("""
                            SELECT 
                                EXTRACT(YEAR FROM order_time) AS year, 
                                EXTRACT(MONTH FROM order_time) AS month,
                                COUNT(*) AS total_orders, 
                                SUM(total) AS total_sales 
                            FROM orders
                            WHERE EXTRACT(YEAR FROM order_time) = EXTRACT(YEAR FROM CURRENT_DATE)
                            AND EXTRACT(MONTH FROM order_time) = EXTRACT(MONTH FROM CURRENT_DATE)
                            GROUP BY year, month
                        """)

        rows = cursor.fetchone()

        cursor.execute("""
                    SELECT *
                    FROM orders
                    WHERE EXTRACT(YEAR FROM order_time) = EXTRACT(YEAR FROM CURRENT_DATE)
                    AND EXTRACT(MONTH FROM order_time) = EXTRACT(MONTH FROM CURRENT_DATE);

                       """)
        orders = cursor.fetchall()

        result = {
            "year": int(rows["year"]),
            "month": int(rows["month"]),
            "total_orders": int(rows["total_orders"]),
            "total_sales": int(rows["total_sales"]),
            "orders": []
        }


        for o in orders:
            result['orders'].append({
                "id": o['id'],
                "total": o["total"]
            })

        return jsonify([result])
    
    except Exception as e:
        print(e)
        return jsonify({"error message": e})
    
    finally:
        cursor.close()
        conn.close()
    

#daily sales
@auth_bp.route('/daily-sales', methods=['GET'])
def daily():
    conn = get_db_conn()
    cursor = conn.cursor()
    
    try: 
        cursor.execute('SELECT * FROM orders ORDER BY order_time DESC')
        rows = cursor.fetchall()

        
        today = datetime.today().date()
        result = []

        for row in rows:

            date = row['order_time'] if isinstance(row['order_time'], datetime) else datetime.strptime(str(row['order_time']), "%Y-%m-%d %H:%M:%S.%f")

            if date.date() == today:
                pht = "Today • " + date.astimezone(pytz.timezone('Asia/Manila')).strftime("%I:%M %p")
            elif date.date() == today - timedelta(days=1): 
                pht =  "Yesterday • " + date.astimezone(pytz.timezone('Asia/Manila')).strftime("%I:%M %p")
            else: 
                pht = date.astimezone(pytz.timezone('Asia/Manila')).strftime("%b %d, %Y • %I:%M %p")

            result.append({
                "id": row['id'],
                "order_type": row['order_type'],
                "payment_method": row['payment_method'],
                "total": row['total'],
                "order_time": pht
            })

        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)})

    
    finally:
        cursor.close()
        conn.close()

#recent
@auth_bp.route('/recent-sales', methods=['GET'])
def recentSale():
    conn = get_db_conn()
    cursor = conn.cursor()
    
    try: 
        cursor.execute('SELECT * FROM orders ORDER BY order_time DESC LIMIT 4;')
        rows = cursor.fetchall()

        
        today = datetime.today().date()
        result = []

        for row in rows:

            date = row['order_time'] if isinstance(row['order_time'], datetime) else datetime.strptime(str(row['order_time']), "%Y-%m-%d %H:%M:%S.%f")

            if date.date() == today:
                pht = "Today • " + date.astimezone(pytz.timezone('Asia/Manila')).strftime("%I:%M %p")
            elif date.date() == today - timedelta(days=1): 
                pht =  "Yesterday • " + date.astimezone(pytz.timezone('Asia/Manila')).strftime("%I:%M %p")
            else: 
                pht = date.astimezone(pytz.timezone('Asia/Manila')).strftime("%b %d, %Y • %I:%M %p")

            result.append({
                "id": row['id'],
                "order_type": row['order_type'],
                "payment_method": row['payment_method'],
                "total": row['total'],
                "order_time": pht
            })

        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)})

    
    finally:
        cursor.close()
        conn.close()

#fetch users
@auth_bp.route('/users_account', methods=['GET'])
def users():
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT * FROM users_account')
        rows = cursor.fetchall()

        result = []

        for row in rows:
            result.append({
                "id": row['id'],
                "first_name": row['first_name'],
                "last_name": row['last_name'],
                "email": row['email'],
                "role": row['role'],
                "token": row['users_token']
            })
    
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})
    
    finally:
        cursor.close()
        conn.close()

#top items
@auth_bp.route('/top_items', methods=['GET'])
def top_items():
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute("""
                                            SELECT 
                        oi.item_id,
                        i.name AS product_name,
                        SUM(oi.quantity) AS total_quantity,
                        SUM(oi.quantity * oi.price) AS total_sales
                    FROM order_items oi
                    JOIN orders o ON oi.order_id = o.id
                    JOIN itemss i ON oi.item_id = i.id
                    GROUP BY oi.item_id, i.name
                    ORDER BY total_sales DESC
                    LIMIT 3;

                        """)
        items = cursor.fetchall()

        result = []

        for item in items:
            result.append({
                "item_id": item['item_id'],
                "product_name": item['product_name'],
                "total_quantity": item['total_quantity'],
                "total_sales": item['total_sales'],
            })
        return jsonify(result)

    except Exception as e:
        return jsonify({"message": str(e)})
    
    finally:
        cursor.close()
        conn.close()


#top items
@auth_bp.route('/top_items', methods=['GET'])
def top_items():
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute("""
                                            SELECT 
                        oi.item_id,
                        i.name AS product_name,
                        SUM(oi.quantity) AS total_quantity,
                        SUM(oi.quantity * oi.price) AS total_sales
                    FROM order_items oi
                    JOIN orders o ON oi.order_id = o.id
                    JOIN itemss i ON oi.item_id = i.id
                    GROUP BY oi.item_id, i.name
                    ORDER BY total_quantity DESC;

                        """)
        items = cursor.fetchall()

        result = []

        for item in items:
            result.append({
                "item_id": item['item_id'],
                "product_name": item['product_name'],
                "total_quantity": item['total_quantity'],
                "total_sales": item['total_sales'],
            })
        return jsonify(result)

    except Exception as e:
        return jsonify({"message": str(e)})
    
    finally:
        cursor.close()
        conn.close()

#fetch users
@auth_bp.route('/api/users/<int:id>', methods=['GET'])
def user_details(id):
    conn = get_db_conn()
    cursor = conn.cursor()  # ✅ DictCursor for key-based access

    try:
        cursor.execute(
            'SELECT id, first_name, last_name, email, username, role FROM users_account WHERE id = %s',
            (id,)
        )
        user = cursor.fetchone()  # single row

        if user:
            user_details = {
                "id": user["id"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "email": user["email"],
                "username": user["username"],
                "role": user["role"]
            }
            return jsonify(user_details)
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()


@auth_bp.route('/api/order/<int:id>', methods=['GET'])
def order_details(id):
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT 
                o.id AS order_id,
                o.customer_name,
                o.order_type,
                o.payment_method,
                o.total,
                i.name AS item_name,
                oi.quantity,
                oi.price,
                (oi.quantity * oi.price) AS subtotal
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN itemss i ON oi.item_id = i.id
            WHERE o.id = %s;
        """, (id,))
        
        rows = cursor.fetchall()

        if rows:
            order_details = {
                "order_id": rows[0]["order_id"],
                "customer_name": rows[0]["customer_name"],
                "order_type": rows[0]["order_type"],
                "payment_method": rows[0]["payment_method"],
                "total": float(rows[0]["total"]),
                "items": []
            }

            for r in rows:
                order_details['items'].append({
                    "name": r["item_name"],
                    "quantity": r["quantity"],
                    "price": float(r["price"]),
                    "subtotal": float(r["subtotal"])
                })

            return jsonify(order_details)
        else:
            return jsonify({"error": "Order not found"}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()



#change role 
@auth_bp.route('/update_role', methods=['POST'])
def change_role():
    data = request.get_json()
    id = data.get('id')
    role = data.get('role')
    conn = get_db_conn()
    cursor = conn.cursor()

    if role not in ALLOWED_ROLES:
            return jsonify({"error": "Invalid Role"}), 400

    try:
        cursor.execute("UPDATE users_account SET role = %s WHERE id = %s", (role, id))
        conn.commit()

        return jsonify({"message": "Role updated successfully"})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/delete/<int:id>', methods=['POST'])
def delete_user(id):
    # Optional: Check if user has admin privileges
    # if session.get('role') != 'admin':
    #     return jsonify({'error': 'Insufficient permissions'}), 403

    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        # First check if user exists
        cursor.execute('SELECT id FROM users_account WHERE id = %s', (id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Then delete
        cursor.execute('DELETE FROM users_account WHERE id = %s', (id,))
        conn.commit()
    
        return jsonify({"message": "User Deleted Successfully"}), 200
    
    except Exception as e:
        conn.rollback()  # Rollback on error
        return jsonify({'error': str(e)}), 500
    
    finally:
        cursor.close()
        conn.close()


        