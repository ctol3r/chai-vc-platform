import os
import re
import ast
from pathlib import Path
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer

REPO_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_FILE = REPO_ROOT / 'docs' / 'DEV_PORTAL.md'

PYTHON_EXT = '.py'
TYPESCRIPT_EXT = '.ts'


def extract_python_docstrings(file_path: Path) -> str:
    try:
        source = file_path.read_text()
        mod = ast.parse(source)
        doc = ast.get_docstring(mod) or ''
        return doc
    except Exception:
        return ''


def extract_ts_comments(file_path: Path) -> str:
    text = file_path.read_text()
    comments = re.findall(r'/\*\*(.*?)\*/', text, re.S)
    return '\n'.join(comment.strip() for comment in comments)


def summarize(text: str, sentences: int = 3) -> str:
    if not text.strip():
        return ''
    parser = PlaintextParser.from_string(text, Tokenizer('english'))
    summarizer = LsaSummarizer()
    summary = summarizer(parser.document, sentences)
    return ' '.join(str(sent) for sent in summary)


def gather_docs() -> str:
    docs = []
    for path in REPO_ROOT.rglob('*'):
        if path.suffix == PYTHON_EXT:
            doc = extract_python_docstrings(path)
            summary = summarize(doc)
            if summary:
                docs.append(f'### {path.relative_to(REPO_ROOT)}\n{summary}\n')
        elif path.suffix == TYPESCRIPT_EXT:
            doc = extract_ts_comments(path)
            summary = summarize(doc)
            if summary:
                docs.append(f'### {path.relative_to(REPO_ROOT)}\n{summary}\n')
    return '\n'.join(docs)


def main():
    content = '# Dev Portal Documentation\n\n'
    content += 'Generated summary of codebase documentation.\n\n'
    content += gather_docs()
    OUTPUT_FILE.write_text(content)
    print(f'Documentation written to {OUTPUT_FILE}')


if __name__ == '__main__':
    main()
