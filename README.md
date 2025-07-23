# Chai VC Platform

End-to-end healthcare credentialing and hiring verification.

## MTTR Burn-down Dashboard

A sample dashboard script is provided in `dashboard/mttr_dashboard.py`.
It loads incident data from `dashboard/data/incidents.csv` and generates
`mttr_burndown.html` using Plotly.

Run the dashboard:

```bash
python dashboard/mttr_dashboard.py
```

Unit tests for the dashboard live in `dashboard/tests` and can be run with:

```bash
python -m unittest discover dashboard/tests
```

