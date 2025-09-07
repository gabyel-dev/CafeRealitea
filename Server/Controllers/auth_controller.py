from flask import Blueprint, request, jsonify, session
from Models.database import get_db_conn
import json
from utils.hash_passwords import hash_password, check_password
from datetime import datetime, timedelta
import pytz
import secrets
from extensions import socketio, connected_users  # ← ONLY import, don't define here
import psycopg2


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
            'token': token,
            'phone_number': user['phone_number']
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


@auth_bp.route('/update/account', methods=['POST'])
def update_account():
    conn = get_db_conn()
    cursor = conn.cursor()
    user = session.get('user')
    data = request.get_json()

    fname = data.get('first_name')
    lname = data.get('last_name')
    email = data.get('email')
    username = data.get('username')
    phone = data.get('phone_number')

    try:
        cursor.execute('UPDATE users_account SET first_name = %s, last_name = %s, email = %s, username = %s, phone_number = %s  WHERE id = %s', (fname, lname, email, username, phone, user['id']),)
        conn.commit()

        if cursor.rowcount > 0:
            return jsonify({'message': 'Updated Successfully', 'redirect': '/dashboard'}), 201
        else:
            return jsonify({'message': 'No changes made'}), 200

    except Exception as e:
        print('failed to updated user', e)
        return jsonify({'error': 'Update users account failed', 'details': str(e)}), 500
    finally:    
        cursor.close()
        conn.close()

@auth_bp.route('/update/profile_picture', methods=['POST'])
def insert_picture():
    if 'profile_image' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['profile_image']
    file_data = file.read()
    user_id = session.get('user', {}).get('id')

    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute('UPDATE users_account SET profile_picture = %s WHERE id = %s', (psycopg2.Binary(file_data), user_id),)
        conn.commit()
        return jsonify({'message': 'Profile image updated'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to update profile image', 'details': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/profile_image/<int:user_id>', methods=['GET'])
def view_profile(user_id):
    conn = get_db_conn()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT profile_image FROM users_account WHERE id=%s", (user_id,))
        row = cursor.fetchone()
        if row and row[0]:
            return row[0], 200, {'Content-Type': 'image/jpeg'}  # adjust type accordingly
        return '', 404
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
    user = session.get('user')
    return jsonify({
        'user': user,
        'logged_in': user is not None,
        'role': user['role'] if user else None
    })

#check session
@auth_bp.route('/check_session', methods=['GET'])
def checkSession():
    conn = get_db_conn()
    cursor = conn.cursor()

    user = session.get('user')
    if not user:
        cursor.close()
        conn.close()
        return jsonify({'valid': False, 'error': 'No active session'}), 403

    try:
        cursor.execute('SELECT users_token FROM users_account WHERE id = %s', (user['id'],))
        db_token_result = cursor.fetchone()
        
        if not db_token_result or db_token_result['users_token'] != user['token']:
            session.clear()
            return jsonify({'valid': False}), 403

        return jsonify({'valid': True, 'user': user}), 200
    
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

#view items in orders
@auth_bp.route('/items', methods=['GET'])
def items():
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute("""SELECT c.id as category_id,
        c.name as category_name,
        i.id as item_id,
        i.name as item_name, 
        i.price as price FROM categories c LEFT JOIN itemss i ON c.id = i.category_id ORDER BY c.id, i.id""")
        rows = cursor.fetchall()
        
        categories = {}
        for row in rows:
            cat_id = row["category_id"]
            if cat_id not in categories:
                categories[cat_id] = {
                    "category_id": cat_id,
                    "category_name": row["category_name"],
                    "items": []
                }
            if row["item_id"]:
                categories[cat_id]["items"].append({
                    "id": row["item_id"],
                    "name": row["item_name"],
                    "price": float(row["price"])
                })

        return jsonify(list(categories.values()))
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@auth_bp.route('/orders/pending', methods=['POST'])
def create_pending_order():
    data = request.get_json()
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        # Validate and calculate total
        items = data.get('items', [])
        if not items:
            return jsonify({'error': 'No items in order'}), 400
        
        # Calculate total from items
        calculated_total = 0
        for item in items:
            quantity = item.get('quantity', 1)
            price = item.get('price', 0)
            calculated_total += quantity * price
        
        # Use provided total if valid, otherwise use calculated total
        provided_total = data.get('total')
        if provided_total is None or not isinstance(provided_total, (int, float)):
            total_to_use = calculated_total
        else:
            total_to_use = provided_total

        # Ensure total is never None
        if total_to_use is None:
            total_to_use = 0.0

        # Ensure items is properly converted to JSON string
        items_json = json.dumps(items)
        print(f"💾 Saving items as JSON: {items_json}")

        # Insert into pending_orders table
        cursor.execute("""
            INSERT INTO pending_orders (customer_name, order_type, payment_method, total, items, user_id)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """, (
            data.get('customer_name', 'Walk-in customer'),
            data.get('order_type', 'Dine-in'),
            data.get('payment_method', 'Cash'),
            float(total_to_use),  # This will never be None now
            items_json,
            session.get('user', {}).get('id')
        ))
        
        result = cursor.fetchone()
        pending_order_id = result['id']
        created_at = result['created_at']
        
        conn.commit()

        print(f"✅ Pending order #{pending_order_id} created successfully")
        
        # 🔔 Broadcast notification to ALL connected users (admins/staff)
        socketio.emit("new_pending_order", {
            "message": f"New pending order #{pending_order_id} from {data.get('customer_name', 'Customer')}",
            "pending_order_id": pending_order_id,
            "customer_name": data.get('customer_name', 'Customer'),
            "total": float(total_to_use),
            "order_type": data.get('order_type', 'Dine-in'),
            "payment_method": data.get('payment_method', 'Cash'),
            "timestamp": created_at.isoformat(),
            "type": "pending_order"
        })

        return jsonify({
            'message': 'Pending order created successfully', 
            'pending_order_id': pending_order_id
        }), 201
    
    except Exception as e:
        conn.rollback()
        print("❌ Pending order error:", e)
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/pending-orders', methods=['GET'])
def get_pending_orders():
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT 
                po.*, 
                creator.username AS created_by,
                creator.first_name AS creator_first_name,
                creator.last_name AS creator_last_name,
                approver.username AS approved_by_username,
                approver.first_name AS approved_first_name,
                approver.last_name AS approved_last_name
            FROM pending_orders po
            LEFT JOIN users_account creator ON po.user_id = creator.id
            LEFT JOIN users_account approver ON po.approved_by = approver.id
            ORDER BY po.created_at DESC
        """)
        pending_orders = cursor.fetchall()

        result = []
        for order in pending_orders:
            items_data = order['items']
            # Parse JSON items
            try:
                items = json.loads(items_data) if isinstance(items_data, str) else items_data
            except:
                items = []

            # Calculate total if missing
            order_total = order['total'] or sum(item.get('quantity', 1) * item.get('price', 0) for item in items)

            result.append({
                "id": order['id'],
                "customer_name": order['customer_name'],
                "order_type": order['order_type'],
                "payment_method": order['payment_method'],
                "total": float(order_total),
                "items": items,
                "created_at": order['created_at'].isoformat() if order['created_at'] else None,
                "created_by": order['created_by'],
                "staff_name": f"{order['approved_first_name']} {order['approved_last_name']}" if order['approved_first_name'] else None
            })

        return jsonify(result)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "pending_orders": []}), 500
    finally:
        cursor.close()
        conn.close()


@auth_bp.route('/pending-orders/<int:pending_id>', methods=['GET'])
def get_pending_order_details(pending_id):
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        print(f"🔍 Fetching pending order #{pending_id} details...")
        
        cursor.execute("""
            SELECT 
                po.*, 
                u.username as created_by,
                u.first_name,
                u.last_name
            FROM pending_orders po 
            LEFT JOIN users_account u ON po.user_id = u.id 
            WHERE po.id = %s
        """, (pending_id,))
        
        order = cursor.fetchone()
        
        if not order:
            print(f"❌ Pending order #{pending_id} not found")
            return jsonify({"error": "Pending order not found"}), 404

        # Handle items data
        items_data = order['items']
        if isinstance(items_data, str):
            try:
                items = json.loads(items_data)
            except json.JSONDecodeError:
                print(f"❌ Invalid JSON in items: {items_data}")
                items = []
        elif isinstance(items_data, (dict, list)):
            items = items_data
        else:
            print(f"❓ Unknown items type: {type(items_data)}")
            items = []
        
        # Handle NULL total
        order_total = order['total']
        if order_total is None:
            print(f"⚠️ Order {order['id']} has NULL total, calculating from items...")
            calculated_total = 0
            for item in items:
                quantity = item.get('quantity', 1)
                price = item.get('price', 0)
                calculated_total += quantity * price
            order_total = calculated_total

        order_details = {
            "id": order['id'],
            "customer_name": order['customer_name'],
            "order_type": order['order_type'],
            "payment_method": order['payment_method'],
            "total": float(order_total),
            "items": items,
            "created_at": order['created_at'].isoformat() if order['created_at'] else None,
            "created_by": order['created_by'],
            "staff_name": f"{order['first_name']} {order['last_name']}" if order['first_name'] else None
        }

        print(f"✅ Found pending order #{pending_id}")
        return jsonify(order_details)
    
    except Exception as e:
        print(f"❌ Error fetching pending order #{pending_id}:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Confirm pending order (move to main orders)

@auth_bp.route('/orders', methods=['POST'])
def create_order(): 
    data = request.get_json()
    conn = get_db_conn()
    cursor = conn.cursor()
    
    try:
        # Check if packaging_cost column exists
        packaging_column_exists = check_packaging_cost_column_exists()
        
        # Validate and calculate total
        items = data.get('items', [])
        if not items:
            return jsonify({'error': 'No items in order'}), 400
        
        # Calculate total from items if not provided or invalid
        calculated_total = 0
        for item in items:
            quantity = item.get('quantity', 1)
            price = item.get('price', 0)
            calculated_total += quantity * price
        
        # Use provided total if valid, otherwise use calculated total
        provided_total = data.get('total')
        if provided_total is None or not isinstance(provided_total, (int, float)):
            total_to_use = calculated_total
        else:
            total_to_use = provided_total

        # Calculate packaging cost
        packaging_cost = get_packaging_cost_for_items(items)

        # Insert main order
        user_id = session.get("user", {}).get("id")

        if packaging_column_exists:
            cursor.execute("""
                INSERT INTO orders (customer_name, order_type, payment_method, total, packaging_cost, status, created_by)
                VALUES (%s, %s, %s, %s, %s, 'CONFIRMED', %s)
                RETURNING id
            """, (
                data.get('customer_name', 'Walk-in customer'),
                data.get('order_type', 'Dine-in'),
                data.get('payment_method', 'Cash'),
                float(total_to_use),
                float(packaging_cost),
                user_id
            ))
        else:
            cursor.execute("""
                INSERT INTO orders (customer_name, order_type, payment_method, total, status, created_by)
                VALUES (%s, %s, %s, %s, 'CONFIRMED', %s)
                RETURNING id
            """, (
                data.get('customer_name', 'Walk-in customer'),
                data.get('order_type', 'Dine-in'),
                data.get('payment_method', 'Cash'),
                float(total_to_use),
                user_id
            ))

        order_id = cursor.fetchone()['id']
        
        # Insert order items
        for item in items:
            cursor.execute("""
                INSERT INTO order_items (order_id, item_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (
                order_id,
                item.get('id'),
                item.get('quantity', 1),
                item.get('price', 0)
            ))
        
        conn.commit()

        user_id = session.get("user", {}).get("id")
        if user_id and user_id in connected_users:
            socketio.emit("notification", {
                "message": f"Your order #{order_id} has been created!",
                "order_id": order_id,
                "type": "personal"
            }, to=connected_users[user_id])
            
        return jsonify({
            'message': 'Created successfully', 
            'order_id': order_id,
            'packaging_cost': packaging_cost
        }), 201
    
    except Exception as e:
        conn.rollback()
        print("Order creation error:", e)
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

def check_packaging_cost_column_exists():
    conn = get_db_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='orders' AND column_name='packaging_cost'
        """)
        return cur.fetchone() is not None
    except Exception as e:
        print("Error checking column existence:", e)
        return False
    finally:
        cur.close()
        conn.close()

@auth_bp.route('/pending-orders/<int:pending_id>/confirm', methods=['POST'])
def confirm_pending_order(pending_id):
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        # Check if packaging_cost column exists
        packaging_column_exists = check_packaging_cost_column_exists()
        
        cursor.execute("SELECT * FROM pending_orders WHERE id = %s", (pending_id,))
        pending_order = cursor.fetchone()
        if not pending_order:
            return jsonify({"error": "Pending order not found"}), 404

        items_data = pending_order['items']
        items = json.loads(items_data) if isinstance(items_data, str) else items_data
        order_total = pending_order['total'] or sum(item.get('quantity', 1) * item.get('price', 0) for item in items)

        # Calculate packaging cost
        packaging_cost = get_packaging_cost_for_items(items)

        # Insert into main orders with created_by and approved_by
        if packaging_column_exists:
            cursor.execute("""
                INSERT INTO orders (customer_name, order_type, payment_method, total, packaging_cost, status, created_by, confirmed_by)
                VALUES (%s, %s, %s, %s, %s, 'CONFIRMED', %s, %s)
                RETURNING id
            """, (
                pending_order['customer_name'],
                pending_order['order_type'],
                pending_order['payment_method'],
                float(order_total),
                float(packaging_cost),
                pending_order['user_id'],          # creator of pending order
                session.get('user', {}).get('id') # staff confirming it
            ))
        else:
            cursor.execute("""
                INSERT INTO orders (customer_name, order_type, payment_method, total, status, created_by, confirmed_by)
                VALUES (%s, %s, %s, %s, 'CONFIRMED', %s, %s)
                RETURNING id
            """, (
                pending_order['customer_name'],
                pending_order['order_type'],
                pending_order['payment_method'],
                float(order_total),
                pending_order['user_id'],          # creator of pending order
                session.get('user', {}).get('id') # staff confirming it
            ))
            
        order_id = cursor.fetchone()['id']

        # Insert order items
        for item in items:
            cursor.execute("""
                INSERT INTO order_items (order_id, item_id, quantity, price)
                VALUES (%s, %s, %s, %s)
            """, (
                order_id,
                item.get('id'),
                item.get('quantity', 1),
                item.get('price', 0)
            ))

        # Update approved_by before deleting
        user_id = session.get('user', {}).get('id')
        cursor.execute("""
            UPDATE pending_orders
            SET confirmed_by = %s
            WHERE id = %s
        """, (user_id, pending_id))

        # Delete pending order
        cursor.execute("DELETE FROM pending_orders WHERE id = %s", (pending_id,))
        conn.commit()

        socketio.emit('order_confirmed',  {
            "message": f"Pending order #{pending_id} confirmed by staff.",
            "type": "order confirmed"
        })

        return jsonify({
            "message": f"Order {order_id} confirmed successfully",
            "order_id": order_id,
            "packaging_cost": packaging_cost
        }), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@auth_bp.route('/pending-orders/<int:pending_id>/cancel', methods=['POST'])
def cancel_pending_order(pending_id):
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        # Check if pending order exists
        cursor.execute("SELECT * FROM pending_orders WHERE id = %s", (pending_id,))
        pending_order = cursor.fetchone()
        
        if not pending_order:
            return jsonify({"error": "Pending order not found"}), 404

        # Delete from pending orders
        cursor.execute("DELETE FROM pending_orders WHERE id = %s", (pending_id,))
        conn.commit()

        socketio.emit('order_cancelled',  {
                "message": f"New pending order #{pending_id} from {pending_order['customer_name']} has been Rejected",
                "type": "order confirmed"
        })

        return jsonify({"message": f"Pending order {pending_id} cancelled successfully"}), 200
    
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
                       WHERE status = 'CONFIRMED'
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
            WHERE status = %s
            AND EXTRACT(YEAR FROM order_time) = EXTRACT(YEAR FROM CURRENT_DATE)
            AND EXTRACT(MONTH FROM order_time) = EXTRACT(MONTH FROM CURRENT_DATE)
            GROUP BY year, month
        """, ('CONFIRMED',))

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
    

@auth_bp.route('/daily-sales', methods=['GET'])
def daily():
    conn = get_db_conn()
    cursor = conn.cursor()
    
    try: 
        cursor.execute('SELECT * FROM orders WHERE status = %s ORDER BY order_time DESC;', ('CONFIRMED',))
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
                "order_time": pht,
                "order_time_raw": date.isoformat(),  # Raw datetime for filtering
                "date": date
            })

        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)})

    
    finally:
        cursor.close()
        conn.close()

@auth_bp.route('/recent-sales', methods=['GET'])
def recentSale():
    conn = get_db_conn()
    cursor = conn.cursor()
    
    try: 
        # Only show CONFIRMED orders, not pending ones
        cursor.execute('SELECT * FROM orders WHERE status = %s ORDER BY order_time DESC LIMIT 4;', ('CONFIRMED',))
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
    id = session.get('user', {}).get('id')

    if not id:
        return jsonify({"error": "Unauthorized"}), 401


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
        # Fetch order + items + creator + approver
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
                (oi.quantity * oi.price) AS subtotal,
                creator.first_name AS creator_first_name,
                creator.last_name AS creator_last_name,
                approver.first_name AS approver_first_name,
                approver.last_name AS approver_last_name
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN itemss i ON oi.item_id = i.id
            LEFT JOIN users_account creator ON o.created_by = creator.id
            LEFT JOIN users_account approver ON o.confirmed_by = approver.id
            WHERE o.id = %s;
        """, (id,))
        
        rows = cursor.fetchall()

        if not rows:
            return jsonify({"error": "Order not found"}), 404

        order_details = {
            "order_id": rows[0]["order_id"],
            "customer_name": rows[0]["customer_name"],
            "order_type": rows[0]["order_type"],
            "payment_method": rows[0]["payment_method"],
            "total": float(rows[0]["total"]),
            "created_by": f"{rows[0]['creator_first_name']} {rows[0]['creator_last_name']}" 
                          if rows[0]['creator_first_name'] else None,
            "approved_by": f"{rows[0]['approver_first_name']} {rows[0]['approver_last_name']}" 
                           if rows[0]['approver_first_name'] else None,
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

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

def update_last_activity(user_id):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users_account
            SET lastactivity = NOW()
            WHERE id = %s;
        """, (int(user_id),))  # <-- tama na ito (tuple with 1 element)
  # cast to integer
        conn.commit()
        print(f"Updated lastactivity for user {user_id}")
    except Exception as e:
        print("Error updating lastactivity:", e)
    finally:
        cursor.close()
        conn.close()




@auth_bp.route('/online_users', methods=['GET'])
def get_online_users():
    conn = get_db_conn()
    cursor = conn.cursor()

    try:
        # Online if active in the last 2 minutes
        cursor.execute("""
            SELECT id
            FROM users_account
            WHERE lastactivity >= NOW() - INTERVAL '2 minutes'
        """)
        online_users = cursor.fetchall()

        online_user_ids = [row['id'] for row in online_users]

        return jsonify({
            "online_users": online_user_ids,
            "count": len(online_user_ids)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
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

def get_packaging_cost_for_items(items):
    """
    items: list of dicts, each with 'id' and 'quantity'
    Returns: total packaging cost for this order
    """
    if not items:
        return 0.0

    conn = get_db_conn()
    cur = conn.cursor()

    # Collect item IDs
    item_ids = [item['id'] for item in items]
    
    # First, get the category for each menu item
    cur.execute("""
        SELECT id, category_id 
        FROM itemss 
        WHERE id = ANY(%s)
    """, (item_ids,))
    
    menu_items = cur.fetchall()
    item_category_map = {item['id']: item['category_id'] for item in menu_items}
    
    # Get all packaging costs
    cur.execute("""
        SELECT pc.category_id, pi.name as item_name, pc.cost
        FROM packaging_costs pc
        JOIN packaging_items pi ON pc.item_id = pi.id
    """)
    
    packaging_costs = cur.fetchall()
    
    # Create a mapping of category_id to packaging costs by item type
    packaging_cost_map = {}
    for cost in packaging_costs:
        category_id = cost['category_id']
        item_name = cost['item_name']
        if category_id not in packaging_cost_map:
            packaging_cost_map[category_id] = {}
        packaging_cost_map[category_id][item_name] = float(cost['cost'])

    total_packaging = 0
    
    # Calculate packaging cost for each item
    for item in items:
        item_id = item['id']
        category_id = item_category_map.get(item_id)
        
        if category_id and category_id in packaging_cost_map:
            category_costs = packaging_cost_map[category_id]
            # Sum all packaging costs for this category
            item_packaging_cost = sum(category_costs.values())
            total_packaging += item_packaging_cost * item.get('quantity', 1)

    cur.close()
    conn.close()
    return total_packaging


