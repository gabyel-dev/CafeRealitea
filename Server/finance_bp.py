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
    cur.execute("SELECT COALESCE(SUM(price),0) FROM equipment_costs;")
    equipment = cur.fetchone()[0]
    cur.execute("SELECT COALESCE(SUM(amount),0) FROM gross_profit_items;")
    gross_profit = cur.fetchone()[0]
    cur.execute("SELECT COALESCE(SUM(cost),0) FROM packaging_costs;")
    packaging = cur.fetchone()[0]
    cur.close()
    conn.close()
    return float(equipment), float(gross_profit), float(packaging)

@finance_bp.route("/summaries/daily", methods=["GET"])
def daily_summary():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT DATE(order_time) as day, SUM(total) AS revenue
        FROM orders
        WHERE status='CONFIRMED'
        GROUP BY day
        ORDER BY day DESC;
    """)
    rows = cur.fetchall()
    equipment, gross_profit, packaging = get_total_costs()
    # add net profit
    summary = [{"day": r[0], "revenue": float(r[1]), "net_profit": float(r[1]) - (equipment + gross_profit + packaging)} for r in rows]
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
               SUM(total) AS revenue
        FROM orders
        WHERE status='CONFIRMED'
        GROUP BY year, month
        ORDER BY year DESC, month DESC;
    """)
    rows = cur.fetchall()
    equipment, gross_profit, packaging = get_total_costs()
    summary = [{"year": r[0], "month": r[1], "revenue": float(r[2]), "net_profit": float(r[2]) - (equipment + gross_profit + packaging)} for r in rows]
    cur.close()
    conn.close()
    return jsonify(summary)

@finance_bp.route("/summaries/yearly", methods=["GET"])
def yearly_summary():
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT EXTRACT(YEAR FROM order_time) AS year,
               SUM(total) AS revenue
        FROM orders
        WHERE status='CONFIRMED'
        GROUP BY year
        ORDER BY year DESC;
    """)
    rows = cur.fetchall()
    equipment, gross_profit, packaging = get_total_costs()
    summary = [{"year": r[0], "revenue": float(r[1]), "net_profit": float(r[1]) - (equipment + gross_profit + packaging)} for r in rows]
    cur.close()
    conn.close()
    return jsonify(summary)
