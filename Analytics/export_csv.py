import sys
from report import get_tickets_dataframe, parse_args

def export_csv(from_date=None, to_date=None, asset_id=None):
    df = get_tickets_dataframe(from_date, to_date, asset_id)
    df.to_csv(sys.stdout, index=False)

if __name__ == "__main__":
    args = parse_args()
    export_csv(args.from_date, args.to_date, args.asset_id)
