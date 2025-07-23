import os
import zipfile
from typing import Optional


def export_credentials_to_zip(user_id: str, credentials_dir: str = "data/vcs", output_dir: str = "exports") -> str:
    """Export a user's JSON-LD credentials as a zip archive.

    Parameters
    ----------
    user_id: str
        Identifier for the user whose credentials will be exported.
    credentials_dir: str
        Base directory containing user credential folders.
    output_dir: str
        Directory where the zip archive will be created.

    Returns
    -------
    str
        Path to the created zip archive.
    """
    user_dir = os.path.join(credentials_dir, user_id)
    if not os.path.isdir(user_dir):
        raise FileNotFoundError(f"Credentials directory '{user_dir}' not found.")

    os.makedirs(output_dir, exist_ok=True)
    zip_path = os.path.join(output_dir, f"{user_id}_vcs.zip")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(user_dir):
            for fname in files:
                if fname.lower().endswith((".json", ".jsonld")):
                    file_path = os.path.join(root, fname)
                    arcname = os.path.relpath(file_path, user_dir)
                    zf.write(file_path, arcname)
    return zip_path


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Export user VCs as a zip of JSON-LD files (GDPR data portability)."
    )
    parser.add_argument("user_id", help="User identifier")
    parser.add_argument(
        "--credentials-dir",
        default="data/vcs",
        help="Base directory where user credential folders are stored",
    )
    parser.add_argument(
        "--output-dir",
        default="exports",
        help="Directory to write the resulting zip archive",
    )

    args = parser.parse_args()
    path = export_credentials_to_zip(args.user_id, args.credentials_dir, args.output_dir)
    print(f"Exported credentials to {path}")
