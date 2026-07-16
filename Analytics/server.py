from flask import Flask, request, jsonify, Response
from report import get_kpi_summary, get_charts, get_tickets_dataframe

app = Flask(__name__)

@app.route("/summary", methods=["GET"])
def summary():
    from_date = request.args.get("from")
    to_date = request.args.get("to")
    asset_id = request.args.get("assetId")
    result = get_kpi_summary(from_date, to_date, asset_id)
    result["charts"] = get_charts(from_date, to_date, asset_id)
    return jsonify(result)

@app.route("/export/csv", methods=["GET"])
def export_csv_route():
    from_date = request.args.get("from")
    to_date = request.args.get("to")
    asset_id = request.args.get("assetId")
    df = get_tickets_dataframe(from_date, to_date, asset_id)
    csv_data = df.to_csv(index=False)
    return Response(csv_data, mimetype="text/csv")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
