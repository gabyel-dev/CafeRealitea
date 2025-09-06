from flask import Blueprint, request, jsonify, session
from Models.database import get_db_conn
from datetime import datetime

finance_bp = Blueprint("finance", __name__)

# ---------------- EQUIPMENT ---------------- #
@finance_bp.route("/equipment", methods=["GET"])
def get_equipment():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM equipment_costs ORDER BY id DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

@finance_bp.route("/equipment", methods=["POST"])
def add_equipment():
    data = request.get_json()
    name = data.get("name")
    price = data.get("price")
    user_id = session.get("user", {}).get("id")

    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO equipment_costs (name, price, created_by)
        VALUES (%s, %s, %s) RETURNING *;
    """, (name, price, user_id))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(row), 201

@finance_bp.route("/equipment/<int:id>", methods=["PUT"])
def update_equipment(id):
    data = request.get_json()
    name = data.get("name")
    price = data.get("price")

    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        UPDATE equipment_costs
        SET name=%s, price=%s, updated_at=NOW()
        WHERE id=%s RETURNING *;
    """, (name, price, id))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(row)

@finance_bp.route("/equipment/<int:id>", methods=["DELETE"])
def delete_equipment(id):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM equipment_costs WHERE id=%s RETURNING *;", (id,))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"deleted": row})


# ---------------- GROSS PROFIT ---------------- #
@finance_bp.route("/gross-profit", methods=["GET"])
def get_gross_profit():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM gross_profit_items ORDER BY id DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

# ADD THIS NEW ENDPOINT RIGHT HERE
@finance_bp.route("/gross-profit/<string:time_range>", methods=["GET"])
def get_gross_profit_by_range(time_range):
    conn = get_db_conn()
    cur = conn.cursor()
    
    try:
        if time_range == "daily":
            # Get gross profit for today only
            cur.execute("""
                SELECT * FROM gross_profit_items 
                WHERE DATE(created_at) = CURRENT_DATE 
                ORDER BY created_at DESC
            """)
        elif time_range == "monthly":
            # Get gross profit for current month
            cur.execute("""
                SELECT * FROM gross_profit_items 
                WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
                ORDER BY created_at DESC
            """)
        elif time_range == "yearly":
            # Get gross profit for current year
            cur.execute("""
                SELECT * FROM gross_profit_items 
                WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
                ORDER BY created_at DESC
            """)
        else:
            # Default: get all gross profit items
            cur.execute("SELECT * FROM gross_profit_items ORDER BY created_at DESC")
        
        rows = cur.fetchall()
        return jsonify(rows)
        
    except Exception as e:
        print("Error fetching gross profit:", e)
        return jsonify({"error": "Failed to fetch gross profit data"}), 500
    finally:
        cur.close()
        conn.close()

# Also add a filtered equipment endpoint for consistency
@finance_bp.route("/equipment/<string:time_range>", methods=["GET"])
def get_equipment_by_range(time_range):
    conn = get_db_conn()
    cur = conn.cursor()
    
    try:
        # For equipment, you might want different logic since it's usually one-time costs
        # This example shows all equipment, but you could filter by purchase date if you have that field
        cur.execute("SELECT * FROM equipment_costs ORDER BY created_at DESC")
        rows = cur.fetchall()
        return jsonify(rows)
        
    except Exception as e:
        print("Error fetching equipment:", e)
        return jsonify({"error": "Failed to fetch equipment data"}), 500
    finally:
        cur.close()
        conn.close()

@finance_bp.route("/gross-profit", methods=["POST"])
def add_gross_profit():
    data = request.get_json()
    name = data.get("name")
    amount = data.get("amount")
    user_id = session.get("user", {}).get("id")

    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO gross_profit_items (name, amount, created_by)
        VALUES (%s, %s, %s) RETURNING *;
    """, (name, amount, user_id))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(row), 201

@finance_bp.route("/gross-profit/<int:id>", methods=["PUT"])
def update_gross_profit(id):
    data = request.get_json()
    name = data.get("name")
    amount = data.get("amount")

    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        UPDATE gross_profit_items
        SET name=%s, amount=%s, updated_at=NOW()
        WHERE id=%s RETURNING *;
    """, (name, amount, id))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(row)

@finance_bp.route("/gross-profit/<int:id>", methods=["DELETE"])
def delete_gross_profit(id):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM gross_profit_items WHERE id=%s RETURNING *;", (id,))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"deleted": row})

# ---------------- PACKAGING COSTS ---------------- #
@finance_bp.route("/packaging-costs", methods=["GET"])
def get_packaging_costs():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT pc.id, c.name AS category, i.name AS item, pc.cost
        FROM packaging_costs pc
        JOIN packaging_categories c ON pc.category_id = c.id
        JOIN packaging_items i ON pc.item_id = i.id
        ORDER BY c.id, i.id;
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

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
    
    # Get packaging costs for all items at once
    cur.execute("""
        SELECT pc.item_id, pc.cost, pi.name as item_name
        FROM packaging_costs pc
        JOIN packaging_items pi ON pc.item_id = pi.id
        WHERE pc.item_id = ANY(%s)
    """, (item_ids,))
    
    rows = cur.fetchall()
    packaging_cost_map = {row['item_id']: float(row['cost']) for row in rows}

    total_packaging = 0
    for item in items:
        cost = packaging_cost_map.get(item['id'], 0)
        total_packaging += cost * item.get('quantity', 1)

    cur.close()
    conn.close()
    return total_packaging

@finance_bp.route("/summaries/daily-with-packaging", methods=["GET"])
def daily_summary_with_packaging():
    conn = get_db_conn()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT o.id, DATE(o.order_time) AS day, o.total, oi.item_id, oi.quantity
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status='CONFIRMED'
        ORDER BY day DESC
    """)
    
    rows = cur.fetchall()
    conn.close()

    # Group by day
    daily_totals = {}
    for row in rows:
        day = row['day']
        daily_totals.setdefault(day, {"revenue": 0.0, "items": []})
        daily_totals[day]["revenue"] += float(row['total'])
        daily_totals[day]["items"].append({"id": row['item_id'], "quantity": row['quantity']})

    # Calculate packaging cost per day
    summary = []
    for day, data in daily_totals.items():
        packaging_cost = get_packaging_cost_for_items(data["items"])
        net_profit = data["revenue"] - packaging_cost
        summary.append({
            "day": str(day),
            "revenue": data["revenue"],
            "packaging_tax": packaging_cost,
            "net_profit_after_packaging": net_profit
        })

    return jsonify(summary)


@finance_bp.route("/packaging-costs/<int:id>", methods=["PUT"])
def update_packaging_cost(id):
    data = request.get_json()
    cost = data.get("cost")

    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        UPDATE packaging_costs
        SET cost=%s, updated_at=NOW()
        WHERE id=%s RETURNING *;
    """, (cost, id))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return jsonify(row)

# ---------------- FINANCIAL SUMMARIES ---------------- #
def get_total_costs():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT COALESCE(SUM(price),0) AS total FROM equipment_costs;")
    equipment = cur.fetchone()['total']
    
    cur.execute("SELECT COALESCE(SUM(amount),0) AS total FROM gross_profit_items;")
    gross_profit = cur.fetchone()['total']
    
    cur.execute("SELECT COALESCE(SUM(cost),0) AS total FROM packaging_costs;")
    packaging = cur.fetchone()['total']
    
    cur.close()
    conn.close()
    return float(equipment), float(gross_profit), float(packaging)


@finance_bp.route("/packaging-costs/update", methods=["POST"])
def update_packaging_costs():
    data = request.get_json()
    category = data.get("category")
    item_costs = data.get("costs")
    
    if not category or not item_costs:
        return jsonify({"error": "Category and costs are required"}), 400
    
    conn = get_db_conn()
    cur = conn.cursor()
    
    try:
        # Get category ID
        cur.execute("SELECT id FROM packaging_categories WHERE name = %s", (category,))
        category_row = cur.fetchone()
        if not category_row:
            return jsonify({"error": "Category not found"}), 404
        
        category_id = category_row['id']
        
        # Update each item cost
        for item_name, cost in item_costs.items():
            # Get item ID
            cur.execute("SELECT id FROM packaging_items WHERE name = %s", (item_name,))
            item_row = cur.fetchone()
            if not item_row:
                continue  # Skip if item not found
            
            item_id = item_row['id']
            
            # Update cost
            cur.execute("""
                UPDATE packaging_costs 
                SET cost = %s, updated_at = NOW()
                WHERE category_id = %s AND item_id = %s
                RETURNING *
            """, (cost, category_id, item_id))
            
            # If no rows were updated, insert new cost
            if cur.rowcount == 0:
                cur.execute("""
                    INSERT INTO packaging_costs (category_id, item_id, cost)
                    VALUES (%s, %s, %s)
                    RETURNING *
                """, (category_id, item_id, cost))
        
        conn.commit()
        return jsonify({"message": "Packaging costs updated successfully"}), 200
        
    except Exception as e:
        conn.rollback()
        print("Error updating packaging costs:", e)
        return jsonify({"error": "Server error"}), 500
    finally:
        cur.close()
        conn.close()


# ---------------- FINANCIAL SUMMARIES ---------------- #
def get_equipment_total():
    """Equipment is a one-time static cost (global)."""
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT COALESCE(SUM(price),0) AS total FROM equipment_costs;")
    equipment = cur.fetchone()['total']
    cur.close()
    conn.close()
    return float(equipment)


@finance_bp.route("/summaries/daily", methods=["GET"])
def daily_summary():
    conn = get_db_conn()
    cur = conn.cursor()

    # Revenue + packaging cost from orders
    cur.execute("""
        SELECT DATE(order_time) as day, 
               SUM(total) AS revenue,
               SUM(packaging_cost) AS packaging_cost
        FROM orders
        WHERE status='CONFIRMED'
        GROUP BY day
        ORDER BY day DESC;
    """)
    orders = cur.fetchall()

    # Gross profit grouped by day
    cur.execute("""
        SELECT DATE(created_at) as day,
               SUM(amount) as gross_profit
        FROM gross_profit_items
        GROUP BY day;
    """)
    gross_profit_rows = cur.fetchall()
    gross_profit_map = {r['day']: float(r['gross_profit']) for r in gross_profit_rows}

    equipment = get_equipment_total()

    summary = []
    for r in orders:
        day = r['day']
        revenue = float(r['revenue'])
        day_packaging = float(r['packaging_cost'])
        day_gross = gross_profit_map.get(day, 0.0)

        net_profit = revenue - (equipment + day_packaging + day_gross)

        summary.append({
            "day": str(day),
            "revenue": revenue,
            "packaging_cost": day_packaging,
            "gross_profit": day_gross,
            "equipment_total": equipment,
            "net_profit": net_profit
        })

    cur.close()
    conn.close()
    return jsonify(summary)


@finance_bp.route("/summaries/monthly", methods=["GET"])
def monthly_summary():
    conn = get_db_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT EXTRACT(YEAR FROM order_time) AS year,
               EXTRACT(MONTH FROM order_time) AS month,
               SUM(total) AS revenue,
               SUM(packaging_cost) AS packaging_cost
        FROM orders
        WHERE status='CONFIRMED'
        GROUP BY year, month
        ORDER BY year DESC, month DESC;
    """)
    orders = cur.fetchall()

    cur.execute("""
        SELECT EXTRACT(YEAR FROM created_at) AS year,
               EXTRACT(MONTH FROM created_at) AS month,
               SUM(amount) as gross_profit
        FROM gross_profit_items
        GROUP BY year, month;
    """)
    gross_profit_rows = cur.fetchall()
    gross_profit_map = {(int(r['year']), int(r['month'])): float(r['gross_profit']) for r in gross_profit_rows}

    equipment = get_equipment_total()

    summary = []
    for r in orders:
        year, month = int(r['year']), int(r['month'])
        revenue = float(r['revenue'])
        month_packaging = float(r['packaging_cost'])
        month_gross = gross_profit_map.get((year, month), 0.0)

        net_profit = revenue - (equipment + month_packaging + month_gross)

        summary.append({
            "year": year,
            "month": month,
            "revenue": revenue,
            "packaging_cost": month_packaging,
            "gross_profit": month_gross,
            "equipment_total": equipment,
            "net_profit": net_profit
        })

    cur.close()
    conn.close()
    return jsonify(summary)


@finance_bp.route("/summaries/yearly", methods=["GET"])
def yearly_summary():
    conn = get_db_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT EXTRACT(YEAR FROM order_time) AS year,
               SUM(total) AS revenue,
               SUM(packaging_cost) AS packaging_cost
        FROM orders
        WHERE status='CONFIRMED'
        GROUP BY year
        ORDER BY year DESC;
    """)
    orders = cur.fetchall()

    cur.execute("""
        SELECT EXTRACT(YEAR FROM created_at) AS year,
               SUM(amount) as gross_profit
        FROM gross_profit_items
        GROUP BY year;
    """)
    gross_profit_rows = cur.fetchall()
    gross_profit_map = {int(r['year']): float(r['gross_profit']) for r in gross_profit_rows}

    equipment = get_equipment_total()

    summary = []
    for r in orders:
        year = int(r['year'])
        revenue = float(r['revenue'])
        year_packaging = float(r['packaging_cost'])
        year_gross = gross_profit_map.get(year, 0.0)

        net_profit = revenue - (equipment + year_packaging + year_gross)

        summary.append({
            "year": year,
            "revenue": revenue,
            "packaging_cost": year_packaging,
            "gross_profit": year_gross,
            "equipment_total": equipment,
            "net_profit": net_profit
        })

    cur.close()
    conn.close()
    return jsonify(summary)
