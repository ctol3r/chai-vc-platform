import sys
import pathlib
import shutil

BASE_TEMPLATE = pathlib.Path('templates') / 'base.html'
THEMES_DIR = pathlib.Path('themes')

def build(theme_name: str, out_dir: str = 'dist') -> None:
    theme_dir = THEMES_DIR / theme_name
    if not theme_dir.exists():
        raise FileNotFoundError(f"Theme '{theme_name}' not found")

    out_path = pathlib.Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    template = BASE_TEMPLATE.read_text()
    header = (theme_dir / 'header.html').read_text()
    footer = (theme_dir / 'footer.html').read_text()
    css_src = theme_dir / 'theme.css'
    css_dst = out_path / 'theme.css'
    shutil.copyfile(css_src, css_dst)

    html = template.replace('{{title}}', 'Partner Portal') \
                   .replace('{{header}}', header) \
                   .replace('{{footer}}', footer) \
                   .replace('{{theme_css}}', 'theme.css')

    (out_path / 'index.html').write_text(html)
    print(f"Generated {out_path / 'index.html'}")

if __name__ == '__main__':
    theme = sys.argv[1] if len(sys.argv) > 1 else 'default'
    build(theme)
