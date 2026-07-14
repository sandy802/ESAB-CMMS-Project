import json
import pandas as pd
from db import get_connection

def get_tickets_dataframe():
    conn = get_connection()
    query = "SELECT * FROM tickets"
    df = pd.read_sql(query, conn)
    conn.close()
    return df

def calculate_mtbf_minutes(df):
    gaps = []
    for asset_id, group in df.groupby("asset_id"):
        times = group["reported_at"].sort_values()
        diffs = times.diff().dropna()
        gaps.extend(diffs.dt.total_seconds() / 60)

    if len(gaps) == 0:
        return None
    return round(sum(gaps) / len(gaps), 2)

def get_kpi_summary():
    df = get_tickets_dataframe()

    total_tickets = len(df)
    open_tickets = len(df[df["status"] == "OPEN"])
    in_progress_tickets = len(df[df["status"] == "IN_PROGRESS"])
    closed_tickets = len(df[df["status"] == "CLOSED"])

    closed_df = df[df["status"] == "CLOSED"]
    avg_mttr = closed_df["mttr_minutes"].mean() if len(closed_df) > 0 else None
    avg_mtbf = calculate_mtbf_minutes(df)

    return {
        "totalTickets": int(total_tickets),
        "openTickets": int(open_tickets),
        "inProgressTickets": int(in_progress_tickets),
        "closedTickets": int(closed_tickets),
        "avgMTTRMinutes": round(float(avg_mttr), 2) if avg_mttr is not None else None,
        "avgMTBFMinutes": float(avg_mtbf) if avg_mtbf is not None else None,
    }

if __name__ == "__main__":
    summary = get_kpi_summary()
    print(json.dumps(summary))
