import sys
from report import get_tickets_dataframe

def export_csv():
    df = get_tickets_dataframe()
    # Print CSV directly to stdout so Node can capture it
    df.to_csv(sys.stdout, index=False)

if __name__ == "__main__":
    export_csv()
