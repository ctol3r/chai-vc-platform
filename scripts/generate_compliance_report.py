import os
import subprocess
import datetime
from pathlib import Path

try:
    import openai
except ImportError:
    openai = None


def get_last_week_commits():
    try:
        logs = subprocess.check_output([
            'git', 'log', '--since=7.days', '--pretty=format:%s'
        ], text=True)
        return logs.splitlines()
    except subprocess.CalledProcessError:
        return []


def summarize_commits(commits: list[str]) -> str:
    if not commits:
        return "No commits in the last week."
    text = "\n".join(commits)
    if openai and os.getenv('OPENAI_API_KEY'):
        openai.api_key = os.getenv('OPENAI_API_KEY')
        prompt = (
            "Summarize the following commit messages focusing on compliance and "
            "policy adherence.\n" + text
        )
        try:
            resp = openai.ChatCompletion.create(
                model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}],
            )
            return resp.choices[0].message.content.strip()
        except Exception as e:
            return f"OpenAI API error: {e}\n\nOriginal messages:\n{text}"
    return text


def main():
    commits = get_last_week_commits()
    summary = summarize_commits(commits)
    report_dir = Path('compliance_reports')
    report_dir.mkdir(exist_ok=True)
    report_file = report_dir / f"report-{datetime.date.today().isoformat()}.txt"
    report_file.write_text(summary)
    print(f"Compliance report written to {report_file}")


if __name__ == "__main__":
    main()
