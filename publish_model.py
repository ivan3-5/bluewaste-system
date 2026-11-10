#!/usr/bin/env python3
"""Publish the waste model in one step.

1. Export yolo-fastapi-sample/weights/best.pt to TFLite (LiteRT, FP32, 640x640).
2. Copy the export to yolo-fastapi-sample/weights/best.tflite.
3. Copy it to mobile_flutter/assets/models/best.tflite.
4. Upload the whole yolo-fastapi-sample/ folder to Hugging Face with the `hf` CLI.

Usage (from the repo root):
    python publish_model.py
    python publish_model.py --repo-id user/name --repo-type model
    python publish_model.py --skip-upload --skip-flutter

Authentication: uses the login saved by `hf auth login` (no token needed in the shell).
Requires: pip install "ultralytics[export-litert]" huggingface_hub
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
SAMPLE_DIR = REPO_ROOT / "yolo-fastapi-sample"
PT_PATH = SAMPLE_DIR / "weights" / "best.pt"
TFLITE_PATH = SAMPLE_DIR / "weights" / "best.tflite"
FLUTTER_MODEL_PATH = REPO_ROOT / "mobile_flutter" / "assets" / "models" / "best.tflite"

DEFAULT_REPO_ID = "ishuualt/bluewaste-yolo26"
DEFAULT_REPO_TYPE = "space"
IMG_SIZE = 640

# Not uploaded: local envs, caches, secrets, training outputs.
EXCLUDE_PATTERNS = [
    "__pycache__/*",
    "*.pyc",
    ".venv/*",
    "venv/*",
    "runs/*",
    "datasets/*",
    "logs/*",
    "*.log",
    ".env",
    ".env.*",
]


def export_tflite() -> None:
    """Export best.pt to TFLite in a temp dir so no export folders land in the repo."""
    from ultralytics import YOLO

    if not PT_PATH.exists():
        sys.exit(f"Missing model: {PT_PATH}")

    print(f"[export] Exporting {PT_PATH.name} to LiteRT (FP32, imgsz={IMG_SIZE})...")
    with tempfile.TemporaryDirectory() as tmp:
        tmp_pt = Path(tmp) / PT_PATH.name
        shutil.copy2(PT_PATH, tmp_pt)
        result = Path(YOLO(str(tmp_pt)).export(format="litert", imgsz=IMG_SIZE))

        # Depending on the Ultralytics version, the result is a file or a folder.
        artifact = result if result.is_file() else next(iter(sorted(result.rglob("*.tflite"))), None)
        if artifact is None:
            sys.exit(f"No .tflite produced under {result}")

        shutil.copy2(artifact, TFLITE_PATH)

    with TFLITE_PATH.open("rb") as f:
        header = f.read(8)
    if header[4:8] != b"TFL3":
        sys.exit(f"{TFLITE_PATH} does not look like a valid TFLite file")
    print(f"[export] Wrote {TFLITE_PATH.relative_to(REPO_ROOT)} ({TFLITE_PATH.stat().st_size / 1e6:.1f} MB)")


def copy_to_flutter() -> None:
    FLUTTER_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(TFLITE_PATH, FLUTTER_MODEL_PATH)
    print(f"[flutter] Copied to {FLUTTER_MODEL_PATH.relative_to(REPO_ROOT)}")


def find_hf_cli() -> str:
    """Prefer the `hf` binary from the same environment as this Python."""
    local = Path(sys.executable).with_name("hf")
    if local.exists():
        return str(local)
    found = shutil.which("hf")
    if not found:
        sys.exit("`hf` CLI not found. Install it with: pip install huggingface_hub")
    return found


def check_login(hf: str) -> None:
    result = subprocess.run([hf, "auth", "whoami"], capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit("Not logged in to Hugging Face. Run: hf auth login")
    print(f"[upload] Logged in as {result.stdout.strip()}")


def upload_to_hf(repo_id: str, repo_type: str, dry_run: bool) -> None:
    if dry_run:
        from huggingface_hub.utils import filter_repo_objects

        files = [p.relative_to(SAMPLE_DIR).as_posix() for p in SAMPLE_DIR.rglob("*") if p.is_file()]
        print(f"[upload] Files that would be uploaded to {repo_type} {repo_id}:")
        for f in filter_repo_objects(files, ignore_patterns=EXCLUDE_PATTERNS):
            print(f"  {f}")
        return

    hf = find_hf_cli()
    check_login(hf)

    cmd = [
        hf, "upload", repo_id, str(SAMPLE_DIR), ".",
        "--type", repo_type,
        "--commit-message", "Update YOLO model (best.pt -> best.tflite)",
    ]
    for pattern in EXCLUDE_PATTERNS:
        cmd += ["--exclude", pattern]

    print(f"[upload] Uploading {SAMPLE_DIR.relative_to(REPO_ROOT)}/ to {repo_type} {repo_id}...")
    result = subprocess.run(cmd)
    if result.returncode != 0:
        sys.exit(f"hf upload failed with exit code {result.returncode}")
    prefix = "spaces/" if repo_type == "space" else ("datasets/" if repo_type == "dataset" else "")
    print(f"[upload] Done: https://huggingface.co/{prefix}{repo_id}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--repo-id", default=DEFAULT_REPO_ID, help="Hugging Face repo id (owner/name)")
    parser.add_argument("--repo-type", default=DEFAULT_REPO_TYPE, choices=["space", "model", "dataset"])
    parser.add_argument("--skip-export", action="store_true", help="Do not re-export best.pt")
    parser.add_argument("--skip-upload", action="store_true", help="Do not upload to Hugging Face")
    parser.add_argument("--skip-flutter", action="store_true", help="Do not copy into mobile_flutter")
    parser.add_argument("--dry-run", action="store_true", help="List the files that would be uploaded and exit")
    args = parser.parse_args()

    if args.dry_run:
        upload_to_hf(args.repo_id, args.repo_type, dry_run=True)
        return

    if not args.skip_export:
        export_tflite()
    if not args.skip_flutter:
        copy_to_flutter()
    if not args.skip_upload:
        upload_to_hf(args.repo_id, args.repo_type, dry_run=False)


if __name__ == "__main__":
    main()
