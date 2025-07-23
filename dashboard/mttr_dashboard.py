import pandas as pd
import plotly.graph_objects as go
from datetime import datetime
from pathlib import Path


def load_incident_data(csv_path: Path) -> pd.DataFrame:
    """Load incident data from a CSV file."""
    df = pd.read_csv(csv_path, parse_dates=["start_time", "end_time"])
    df["recovery_minutes"] = (df["end_time"] - df["start_time"]).dt.total_seconds() / 60
    return df


def calculate_mttr(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate mean time to recovery per day."""
    df = df.copy()
    df["date"] = df["end_time"].dt.date
    daily_mttr = df.groupby("date")["recovery_minutes"].mean().reset_index()
    return daily_mttr


def create_burndown_chart(mttr: pd.DataFrame, output_html: Path) -> None:
    """Create a burn-down chart of MTTR over time and save as HTML."""
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=mttr["date"], y=mttr["recovery_minutes"],
                             mode="lines+markers", name="MTTR (minutes)"))
    fig.update_layout(title="Incident MTTR Burn-down",
                      xaxis_title="Date",
                      yaxis_title="Mean Time To Recovery (minutes)")
    fig.write_html(str(output_html))


def generate_dashboard():
    data_file = Path(__file__).parent / "data" / "incidents.csv"
    output_file = Path(__file__).parent / "mttr_burndown.html"
    df = load_incident_data(data_file)
    mttr = calculate_mttr(df)
    create_burndown_chart(mttr, output_file)
    print(f"Dashboard written to {output_file}")


if __name__ == "__main__":
    generate_dashboard()
