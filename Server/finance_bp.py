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


# ---------------- PRODUCT GROSS PROFIT ---------------- #
@finance_bp.route("/product-gross-profit", methods=["GET"])
def get_product_gross_profit():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT pgp.*, i.name as product_name, i.price as product_price
        FROM product_gross_profit pgp
        JOIN itemss i ON pgp.product_id = i.id
        ORDER BY i.name
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

@finance_bp.route("/product-gross-profit/<int:product_id>", methods=["GET"])
def get_gross_profit_by_product(product_id):
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT pgp.*, i.name as product_name, i.price as product_price
        FROM product_gross_profit pgp
        JOIN itemss i ON pgp.product_id = i.id
        WHERE pgp.product_id = %s
    """, (product_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    
    if row:
        return jsonify(row)
    else:
        return jsonify({"error": "Product gross profit not found"}), 404

@finance_bp.route("/product-gross-profit/<int:product_id>", methods=["PUT"])
def update_product_gross_profit(product_id):
    data = request.get_json()
    gross_profit = data.get("gross_profit")
    user_id = session.get("user", {}).get("id")

    conn = get_db_conn()
    cur = conn.cursor()
    
    try:
        # Check if product exists
        cur.execute("SELECT id FROM itemss WHERE id = %s", (product_id,))
        if not cur.fetchone():
            return jsonify({"error": "Product not found"}), 404

        # Update or insert gross profit
        cur.execute("""
            INSERT INTO product_gross_profit (product_id, gross_profit, created_by)
            VALUES (%s, %s, %s)
            ON CONFLICT (product_id) 
            DO UPDATE SET 
                gross_profit = EXCLUDED.gross_profit,
                updated_at = NOW(),
                created_by = EXCLUDED.created_by
            RETURNING *;
        """, (product_id, gross_profit, user_id))
        
        row = cur.fetchone()
        conn.commit()
        
        # Get product details for response
        cur.execute("""
            SELECT pgp.*, i.name as product_name, i.price as product_price
            FROM product_gross_profit pgp
            JOIN itemss i ON pgp.product_id = i.id
            WHERE pgp.id = %s
        """, (row['id'],))
        result = cur.fetchone()
        
        return jsonify(result)
        
    except Exception as e:
        conn.rollback()
        print("Error updating product gross profit:", e)
        return jsonify({"error": "Failed to update product gross profit"}), 500
    finally:
        cur.close()
        conn.close()

@finance_bp.route("/product-gross-profit/bulk-update", methods=["POST"])
def bulk_update_product_gross_profit():
    data = request.get_json()
    updates = data.get("updates", [])
    user_id = session.get("user", {}).get("id")

    if not updates:
        return jsonify({"error": "No updates provided"}), 400

    conn = get_db_conn()
    cur = conn.cursor()
    
    try:
        results = []
        for update in updates:
            product_id = update.get("product_id")
            gross_profit = update.get("gross_profit")
            
            if product_id is None or gross_profit is None:
                continue

            cur.execute("""
                INSERT INTO product_gross_profit (product_id, gross_profit, created_by)
                VALUES (%s, %s, %s)
                ON CONFLICT (product_id) 
                DO UPDATE SET 
                    gross_profit = EXCLUDED.gross_profit,
                    updated_at = NOW(),
                    created_by = EXCLUDED.created_by
                RETURNING *;
            """, (product_id, gross_profit, user_id))
            
            row = cur.fetchone()
            results.append(row)

        conn.commit()
        
        # Get updated records with product names
        product_ids = [str(update.get("product_id")) for update in updates]
        if product_ids:
            cur.execute("""
                SELECT pgp.*, i.name as product_name, i.price as product_price
                FROM product_gross_profit pgp
                JOIN itemss i ON pgp.product_id = i.id
                WHERE pgp.product_id IN (%s)
            """ % ",".join(product_ids))
            results = cur.fetchall()

        return jsonify(results)
        
    except Exception as e:
        conn.rollback()
        print("Error in bulk update:", e)
        return jsonify({"error": "Failed to update product gross profits"}), 500
    finally:
        cur.close()
        conn.close()

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

def get_daily_gross_profit(day):
    """Calculate gross profit for a specific day based on product gross profits"""
    conn = get_db_conn()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT SUM(oi.quantity * COALESCE(pgp.gross_profit, 0)) as total_gross_profit
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN product_gross_profit pgp ON oi.item_id = pgp.product_id
        WHERE o.status = 'CONFIRMED' 
        AND DATE(o.order_time) = %s
    """, (day,))
    
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    return float(result['total_gross_profit']) if result and result['total_gross_profit'] else 0.0

def get_monthly_gross_profit(year, month):
    """Calculate gross profit for a specific month based on product gross profits"""
    conn = get_db_conn()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT SUM(oi.quantity * COALESCE(pgp.gross_profit, 0)) as total_gross_profit
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN product_gross_profit pgp ON oi.item_id = pgp.product_id
        WHERE o.status = 'CONFIRMED' 
        AND EXTRACT(YEAR FROM o.order_time) = %s
        AND EXTRACT(MONTH FROM o.order_time) = %s
    """, (year, month))
    
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    return float(result['total_gross_profit']) if result and result['total_gross_profit'] else 0.0

def get_yearly_gross_profit(year):
    """Calculate gross profit for a specific year based on product gross profits"""
    conn = get_db_conn()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT SUM(oi.quantity * COALESCE(pgp.gross_profit, 0)) as total_gross_profit
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN product_gross_profit pgp ON oi.item_id = pgp.product_id
        WHERE o.status = 'CONFIRMED' 
        AND EXTRACT(YEAR FROM o.order_time) = %s
    """, (year,))
    
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    return float(result['total_gross_profit']) if result and result['total_gross_profit'] else 0.0

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

    equipment = get_equipment_total()

    summary = []
    for r in orders:
        day = r['day']
        revenue = float(r['revenue'])
        day_packaging = float(r['packaging_cost'])
        day_gross = get_daily_gross_profit(day)

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

    equipment = get_equipment_total()

    summary = []
    for r in orders:
        year, month = int(r['year']), int(r['month'])
        revenue = float(r['revenue'])
        month_packaging = float(r['packaging_cost'])
        month_gross = get_monthly_gross_profit(year, month)

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

    equipment = get_equipment_total()

    summary = []
    for r in orders:
        year = int(r['year'])
        revenue = float(r['revenue'])
        year_packaging = float(r['packaging_cost'])
        year_gross = get_yearly_gross_profit(year)

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

# ---------------- PRODUCT FINANCIAL ANALYSIS ---------------- #
@finance_bp.route("/product-analysis", methods=["GET"])
def get_product_analysis():
    """Get detailed financial analysis per product"""
    conn = get_db_conn()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            i.id,
            i.name as product_name,
            i.price as selling_price,
            COALESCE(pgp.gross_profit, 0) as gross_profit_per_unit,
            (i.price - COALESCE(pgp.gross_profit, 0)) as cost_per_unit,
            COALESCE(SUM(oi.quantity), 0) as total_units_sold,
            COALESCE(SUM(oi.quantity * i.price), 0) as total_revenue,
            COALESCE(SUM(oi.quantity * pgp.gross_profit), 0) as total_gross_profit
        FROM itemss i
        LEFT JOIN product_gross_profit pgp ON i.id = pgp.product_id
        LEFT JOIN order_items oi ON i.id = oi.item_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'CONFIRMED'
        GROUP BY i.id, i.name, i.price, pgp.gross_profit
        ORDER BY total_gross_profit DESC;
    """)
    
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

@finance_bp.route("/product-analysis/<int:product_id>", methods=["GET"])
def get_product_analysis_detail(product_id):
    """Get detailed financial analysis for a specific product over time"""
    conn = get_db_conn()
    cur = conn.cursor()
    
    # Product basic info
    cur.execute("""
        SELECT 
            i.id,
            i.name as product_name,
            i.price as selling_price,
            COALESCE(pgp.gross_profit, 0) as gross_profit_per_unit,
            (i.price - COALESCE(pgp.gross_profit, 0)) as cost_per_unit
        FROM itemss i
        LEFT JOIN product_gross_profit pgp ON i.id = pgp.product_id
        WHERE i.id = %s
    """, (product_id,))
    
    product_info = cur.fetchone()
    if not product_info:
        return jsonify({"error": "Product not found"}), 404
    
    # Monthly sales data
    cur.execute("""
        SELECT 
            EXTRACT(YEAR FROM o.order_time) as year,
            EXTRACT(MONTH FROM o.order_time) as month,
            SUM(oi.quantity) as units_sold,
            SUM(oi.quantity * i.price) as revenue,
            SUM(oi.quantity * COALESCE(pgp.gross_profit, 0)) as gross_profit
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN itemss i ON oi.item_id = i.id
        LEFT JOIN product_gross_profit pgp ON i.id = pgp.product_id
        WHERE o.status = 'CONFIRMED' AND i.id = %s
        GROUP BY year, month
        ORDER BY year DESC, month DESC;
    """, (product_id,))
    
    monthly_data = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({
        "product_info": product_info,
        "monthly_performance": monthly_data
    })