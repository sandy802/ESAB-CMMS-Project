import sys
import json
import base64
import io
import argparse
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from db import get_connection

plt.rcParams.update({
    "figure.facecolor": "#111827",
    "axes.facecolor": "#111827",
    "axes.edgecolor": "#374151",
    "axes.labelcolor": "#d1d5db",
    "text.color": "#d1d5db",
    "xtick.color": "#9ca3af",
    "ytick.color": "#9ca3af",
    "font.size": 10,
})


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--from", dest="from_date", default=None)
    parser.add_argument("--to", dest="to_date", default=None)
    parser.add_argument("--assetId", dest="asset_id", default=None)
    args, _unknown = parser.parse_known_args()
    return args


def build_filter_clause(from_date, to_date, asset_id):
    conditions = []
    values = []

    if from_date:
        conditions.append("t.reported_at >= %s::timestamp")
        values.append(from_date)
    if to_date:
        conditions.append("t.reported_at <= %s::timestamp")
        values.append(f"{to_date} 23:59:59")
    if asset_id:
        conditions.append("t.asset_id = %s")
        values.append(asset_id)

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    return where, values



def get_tickets_dataframe(from_date=None, to_date=None, asset_id=None):
    conn = get_connection()
    where, values = build_filter_clause(from_date, to_date, asset_id)
    query = f"SELECT t.* FROM tickets t {where}"
    df = pd.read_sql(query, conn, params=values if values else None)
    conn.close()
    return df


def get_tickets_with_labels(from_date=None, to_date=None, asset_id=None):
    conn = get_connection()
    where, values = build_filter_clause(from_date, to_date, asset_id)
    query = f"""
        SELECT t.*, a.name AS asset_name, bt.name AS breakdown_type_name
        FROM tickets t
        LEFT JOIN assets a ON t.asset_id = a.id
        LEFT JOIN breakdown_types bt ON t.breakdown_type_id = bt.id
        {where}
    """
    df = pd.read_sql(query, conn, params=values if values else None)
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


def get_kpi_summary(from_date=None, to_date=None, asset_id=None):
    df = get_tickets_dataframe(from_date, to_date, asset_id)
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


def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", dpi=110)
    plt.close(fig)
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def breakdown_by_machine(df):
    counts = df["asset_name"].fillna("Unknown").value_counts()
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.bar(counts.index, counts.values, color="#f59e0b")
    ax.set_ylabel("Breakdowns")
    ax.set_title("Breakdowns by Machine")
    plt.xticks(rotation=30, ha="right")
    fig.tight_layout()
    top_machine = counts.index[0]
    top_count = int(counts.iloc[0])
    if top_count >= 3:
        insight = f"'{top_machine}' has had {top_count} breakdowns - the most of any machine. Consider scheduling an inspection or evaluating whether it needs replacement."
    else:
        insight = "No machine stands out as a repeat failure point yet - breakdowns are fairly spread out."
    return {"image": fig_to_base64(fig), "insight": insight}


def breakdown_by_type(df):
    counts = df["breakdown_type_name"].fillna("Unclassified").value_counts()
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.bar(counts.index, counts.values, color="#3b82f6")
    ax.set_ylabel("Breakdowns")
    ax.set_title("Breakdowns by Type")
    plt.xticks(rotation=30, ha="right")
    fig.tight_layout()
    top_type = counts.index[0]
    top_count = int(counts.iloc[0])
    pct = round((top_count / len(df)) * 100, 1) if len(df) > 0 else 0
    insight = f"'{top_type}' is the most common breakdown type, making up {pct}% of all tickets. Consider preventive maintenance or technician training focused on this area."
    return {"image": fig_to_base64(fig), "insight": insight}


def open_vs_closed(df):
    open_count = len(df[df["status"].isin(["OPEN", "IN_PROGRESS"])])
    closed_count = len(df[df["status"] == "CLOSED"])
    total = open_count + closed_count
    fig, ax = plt.subplots(figsize=(5, 4))
    colors = ["#ef4444", "#22c55e"]
    ax.pie([open_count, closed_count], labels=["Open / In Progress", "Closed"], autopct="%1.0f%%", colors=colors, textprops={"color": "#d1d5db"})
    ax.set_title("Open vs Closed Tickets")
    fig.tight_layout()
    open_pct = round((open_count / total) * 100, 1) if total > 0 else 0
    if open_pct >= 50:
        insight = f"{open_pct}% of tickets are still open - the maintenance team may be falling behind on resolving breakdowns."
    else:
        insight = f"Only {open_pct}% of tickets are still open - the team is keeping up well with resolving breakdowns."
    return {"image": fig_to_base64(fig), "insight": insight}


def get_charts(from_date=None, to_date=None, asset_id=None):
    df = get_tickets_with_labels(from_date, to_date, asset_id)
    if len(df) == 0:
        return {}
    return {
        "breakdownByMachine": breakdown_by_machine(df),
        "breakdownByType": breakdown_by_type(df),
        "openVsClosed": open_vs_closed(df),
    }


if __name__ == "__main__":
    args = parse_args()
    summary = get_kpi_summary(args.from_date, args.to_date, args.asset_id)
    summary["charts"] = get_charts(args.from_date, args.to_date, args.asset_id)
    print(json.dumps(summary))

