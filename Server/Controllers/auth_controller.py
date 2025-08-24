from flask import Blueprint, request, jsonify, session
from Models.database import get_db_conn
import json
from utils.hash_passwords import hash_password, check_password
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def Login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute('SELECT * FROM users_account WHERE username = %s', (username,))
        user = cursor.fetchone()
        
        

        if user is None or not check_password(user['password'], password):
            return jsonify({'message': 'invalid credentials'}), 401
        
        # Access dictionary keys from RealDictCursor result
        db_id = user['id']           # adjust key name as per your column
        db_name = user['first_name']
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

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')

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
        return jsonify({'message': 'Registered Successfully', 'redirect': '/login'}), 201

    except Exception as e:
        print('failed to register', e)
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
        

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
        return jsonify({'message': 'Created successfully', 'order_id': order_id}), 201
    
    except Exception as e:
        conn.rollback()
        print("Order creation error:", e)
        return jsonify({'error': 'Server error'}), 500
    
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

        return jsonify(result)
    
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
                formatted = "Today / " + date.strftime("%I:%M %p")
            elif date.date() == today - timedelta(days=1): 
                formatted =  "Yesterday / " + date.strftime("%I:%M %p")
            else: 
                formatted = date.strftime("%b %d, %Y / %I:%M %p")

            result.append({
                "id": row['id'],
                "order_type": row['order_type'],
                "payment_method": row['payment_method'],
                "total": row['total'],
                "order_time": formatted
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
                "role": row['role']
            })
    
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)})
    
    finally:
        cursor.close()
        conn.close()
