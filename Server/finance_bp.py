from flask import Blueprint, request, jsonify, session
from Models.database import get_db_conn
from datetime import datetime
import traceback

finance_bp = Blueprint("finance", __name__)

# ---------------- EQUIPMENT ---------------- #
@finance_bp.route("/equipment", methods=["GET"])
def get_equipment():
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM equipment_costs ORDER BY id DESC")
        rows = cur.fetchall()
        # Convert to list of dicts for proper JSON serialization
        result = [dict(row) for row in rows] if rows else []
        return jsonify(result)
    except Exception as e:
        print("Error fetching equipment:", e)
        return jsonify({"error": "Failed to fetch equipment data"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

@finance_bp.route("/equipment", methods=["POST"])
def add_equipment():
    try:
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
        return jsonify(dict(row)), 201
    except Exception as e:
        print("Error adding equipment:", e)
        return jsonify({"error": "Failed to add equipment"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

@finance_bp.route("/equipment/<int:id>", methods=["PUT"])
def update_equipment(id):
    try:
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
        return jsonify(dict(row)) if row else ({"error": "Equipment not found"}), 404
    except Exception as e:
        print("Error updating equipment:", e)
        return jsonify({"error": "Failed to update equipment"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

@finance_bp.route("/equipment/<int:id>", methods=["DELETE"])
def delete_equipment(id):
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("DELETE FROM equipment_costs WHERE id=%s RETURNING *;", (id,))
        row = cur.fetchone()
        conn.commit()
        return jsonify({"deleted": dict(row)}) if row else ({"error": "Equipment not found"}), 404
    except Exception as e:
        print("Error deleting equipment:", e)
        return jsonify({"error": "Failed to delete equipment"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

# ---------------- GROSS PROFIT ---------------- #
@finance_bp.route("/gross-profit", methods=["GET"])
def get_gross_profit():
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("SELECT * FROM gross_profit_items ORDER BY date_created DESC")
        rows = cur.fetchall()
        result = [dict(row) for row in rows] if rows else []
        return jsonify(result)
    except Exception as e:
        print("Error fetching gross profit:", e)
        return jsonify({"error": "Failed to fetch gross profit data"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

@finance_bp.route("/gross-profit/<string:time_range>", methods=["GET"])
def get_gross_profit_by_range(time_range):
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        
        if time_range == "daily":
            cur.execute("""
                SELECT DATE(date_created) AS day,
                       SUM(amount) AS total_amount
                FROM gross_profit_items
                GROUP BY day
                ORDER BY day DESC
            """)
        elif time_range == "monthly":
            cur.execute("""
                SELECT EXTRACT(YEAR FROM date_created) AS year,
                       EXTRACT(MONTH FROM date_created) AS month,
                       SUM(amount) AS total_amount
                FROM gross_profit_items
                GROUP BY year, month
                ORDER BY year DESC, month DESC
            """)
        elif time_range == "yearly":
            cur.execute("""
                SELECT EXTRACT(YEAR FROM date_created) AS year,
                       SUM(amount) AS total_amount
                FROM gross_profit_items
                GROUP BY year
                ORDER BY year DESC
            """)
        else:
            cur.execute("SELECT * FROM gross_profit_items ORDER BY date_created DESC")
        
        rows = cur.fetchall()
        result = [dict(row) for row in rows] if rows else []
        return jsonify(result)
        
    except Exception as e:
        print("Error fetching gross profit by range:", e)
        traceback.print_exc()
        return jsonify({"error": "Failed to fetch gross profit data"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

@finance_bp.route("/gross-profit", methods=["POST"])
def add_gross_profit():
    try:
        data = request.get_json()
        name = data.get("name")
        amount = data.get("amount")
        date = data.get('date')  # comes from React: YYYY-MM-DD
        user_id = session.get("user", {}).get("id")

        # Convert string to datetime
        date_obj = datetime.fromisoformat(date) if date else datetime.now()

        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO gross_profit_items (name, amount, date_created, created_by)
            VALUES (%s, %s, %s, %s) RETURNING *;
        """, (name, amount, date_obj, user_id))
        row = cur.fetchone()
        conn.commit()
        return jsonify(dict(row)), 201
    except Exception as e:
        print("Error adding gross profit:", e)
        return jsonify({"error": "Failed to add gross profit item"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

@finance_bp.route("/gross-profit/<int:id>", methods=["PUT"])
def update_gross_profit(id):
    try:
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
        return jsonify(dict(row)) if row else ({"error": "Gross profit item not found"}), 404
    except Exception as e:
        print("Error updating gross profit:", e)
        return jsonify({"error": "Failed to update gross profit item"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

@finance_bp.route("/gross-profit/<int:id>", methods=["DELETE"])
def delete_gross_profit(id):
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("DELETE FROM gross_profit_items WHERE id=%s RETURNING *;", (id,))
        row = cur.fetchone()
        conn.commit()
        return jsonify({"deleted": dict(row)}) if row else ({"error": "Gross profit item not found"}), 404
    except Exception as e:
        print("Error deleting gross profit:", e)
        return jsonify({"error": "Failed to delete gross profit item"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

# ---------------- FINANCIAL SUMMARIES ---------------- #
def get_equipment_total():
    """Equipment is a one-time static cost (global)."""
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        cur.execute("SELECT COALESCE(SUM(price),0) AS total FROM equipment_costs;")
        result = cur.fetchone()
        return float(result['total']) if result else 0.0
    except Exception as e:
        print("Error getting equipment total:", e)
        return 0.0
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

def calculate_packaging_cost_for_orders(conn, date_condition):
    """Calculate packaging cost based on order items"""
    try:
        cur = conn.cursor()
        
        # First, check if packaging_cost column exists in orders table
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='orders' AND column_name='packaging_cost'
        """)
        has_packaging_column = cur.fetchone() is not None
        
        if has_packaging_column:
            # Use existing packaging_cost column
            cur.execute(f"""
                SELECT DATE(order_time) as day, 
                       SUM(total) AS revenue,
                       SUM(packaging_cost) AS packaging_cost
                FROM orders
                WHERE status='CONFIRMED' {date_condition}
                GROUP BY DATE(order_time)
                ORDER BY day DESC;
            """)
        else:
            # Calculate packaging cost dynamically from order items
            cur.execute(f"""
                SELECT DATE(o.order_time) as day, 
                       SUM(o.total) AS revenue,
                       SUM(COALESCE(pc.cost, 0) * oi.quantity) AS packaging_cost
                FROM orders o
                JOIN order_items oi ON o.id = oi.order_id
                LEFT JOIN packaging_costs pc ON oi.item_id = pc.item_id
                WHERE o.status='CONFIRMED' {date_condition}
                GROUP BY DATE(o.order_time)
                ORDER BY day DESC;
            """)
        
        return cur.fetchall()
    except Exception as e:
        print("Error calculating packaging cost:", e)
        return []

@finance_bp.route("/summaries/daily", methods=["GET"])
def daily_summary():
    try:
        conn = get_db_conn()
        cur = conn.cursor()

        # Get revenue and packaging cost
        orders_data = calculate_packaging_cost_for_orders(conn, "")
        
        # Get gross profit grouped by day
        cur.execute("""
            SELECT DATE(date_created) as day,
                   SUM(amount) as gross_profit
            FROM gross_profit_items
            GROUP BY DATE(date_created);
        """)
        gross_profit_rows = cur.fetchall()
        gross_profit_map = {str(row['day']): float(row['gross_profit']) for row in gross_profit_rows}

        equipment_total = get_equipment_total()

        summary = []
        for row in orders_data:
            day = str(row['day'])
            revenue = float(row['revenue'] or 0)
            packaging_cost = float(row['packaging_cost'] or 0)
            gross_profit = gross_profit_map.get(day, 0.0)

            net_profit = revenue - packaging_cost - gross_profit - equipment_total

            summary.append({
                "day": day,
                "revenue": revenue,
                "packaging_cost": packaging_cost,
                "gross_profit": gross_profit,
                "equipment_total": equipment_total,
                "net_profit": net_profit
            })

        return jsonify(summary)

    except Exception as e:
        print("Error in daily summary:", e)
        traceback.print_exc()
        return jsonify({"error": "Failed to generate daily summary"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

@finance_bp.route("/summaries/monthly", methods=["GET"])
def monthly_summary():
    try:
        conn = get_db_conn()
        cur = conn.cursor()

        # Revenue and packaging cost by month
        cur.execute("""
            SELECT EXTRACT(YEAR FROM order_time) AS year,
                   EXTRACT(MONTH FROM order_time) AS month,
                   SUM(total) AS revenue
            FROM orders
            WHERE status='CONFIRMED'
            GROUP BY year, month
            ORDER BY year DESC, month DESC;
        """)
        orders = cur.fetchall()

        # Calculate packaging cost by month
        cur.execute("""
            SELECT EXTRACT(YEAR FROM o.order_time) AS year,
                   EXTRACT(MONTH FROM o.order_time) AS month,
                   SUM(COALESCE(pc.cost, 0) * oi.quantity) AS packaging_cost
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN packaging_costs pc ON oi.item_id = pc.item_id
            WHERE o.status='CONFIRMED'
            GROUP BY year, month;
        """)
        packaging_rows = cur.fetchall()
        packaging_map = {(int(row['year']), int(row['month'])): float(row['packaging_cost'] or 0) for row in packaging_rows}

        # Gross profit by month
        cur.execute("""
            SELECT EXTRACT(YEAR FROM date_created) AS year,
                   EXTRACT(MONTH FROM date_created) AS month,
                   SUM(amount) as gross_profit
            FROM gross_profit_items
            GROUP BY year, month;
        """)
        gross_profit_rows = cur.fetchall()
        gross_profit_map = {(int(row['year']), int(row['month'])): float(row['gross_profit']) for row in gross_profit_rows}

        equipment_total = get_equipment_total()

        summary = []
        for row in orders:
            year, month = int(row['year']), int(row['month'])
            revenue = float(row['revenue'] or 0)
            packaging_cost = packaging_map.get((year, month), 0.0)
            gross_profit = gross_profit_map.get((year, month), 0.0)

            net_profit = revenue - packaging_cost - gross_profit - equipment_total

            summary.append({
                "year": year,
                "month": month,
                "revenue": revenue,
                "packaging_cost": packaging_cost,
                "gross_profit": gross_profit,
                "equipment_total": equipment_total,
                "net_profit": net_profit
            })

        return jsonify(summary)

    except Exception as e:
        print("Error in monthly summary:", e)
        traceback.print_exc()
        return jsonify({"error": "Failed to generate monthly summary"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

@finance_bp.route("/summaries/yearly", methods=["GET"])
def yearly_summary():
    try:
        conn = get_db_conn()
        cur = conn.cursor()

        # Revenue by year
        cur.execute("""
            SELECT EXTRACT(YEAR FROM order_time) AS year,
                   SUM(total) AS revenue
            FROM orders
            WHERE status='CONFIRMED'
            GROUP BY year
            ORDER BY year DESC;
        """)
        orders = cur.fetchall()

        # Packaging cost by year
        cur.execute("""
            SELECT EXTRACT(YEAR FROM o.order_time) AS year,
                   SUM(COALESCE(pc.cost, 0) * oi.quantity) AS packaging_cost
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN packaging_costs pc ON oi.item_id = pc.item_id
            WHERE o.status='CONFIRMED'
            GROUP BY year;
        """)
        packaging_rows = cur.fetchall()
        packaging_map = {int(row['year']): float(row['packaging_cost'] or 0) for row in packaging_rows}

        # Gross profit by year
        cur.execute("""
            SELECT EXTRACT(YEAR FROM date_created) AS year,
                   SUM(amount) as gross_profit
            FROM gross_profit_items
            GROUP BY year;
        """)
        gross_profit_rows = cur.fetchall()
        gross_profit_map = {int(row['year']): float(row['gross_profit']) for row in gross_profit_rows}

        equipment_total = get_equipment_total()

        summary = []
        for row in orders:
            year = int(row['year'])
            revenue = float(row['revenue'] or 0)
            packaging_cost = packaging_map.get(year, 0.0)
            gross_profit = gross_profit_map.get(year, 0.0)

            net_profit = revenue - packaging_cost - gross_profit - equipment_total

            summary.append({
                "year": year,
                "revenue": revenue,
                "packaging_cost": packaging_cost,
                "gross_profit": gross_profit,
                "equipment_total": equipment_total,
                "net_profit": net_profit
            })

        return jsonify(summary)

    except Exception as e:
        print("Error in yearly summary:", e)
        traceback.print_exc()
        return jsonify({"error": "Failed to generate yearly summary"}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()