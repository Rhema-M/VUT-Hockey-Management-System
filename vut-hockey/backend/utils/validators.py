import re
from datetime import date, datetime
from pathlib import Path
from uuid import uuid4

from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
ALLOWED_IMAGE_MIMETYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


def required(data: dict, fields: list[str]) -> str | None:
    missing = [field for field in fields if not str(data.get(field, "")).strip()]
    return f"Missing required fields: {', '.join(missing)}" if missing else None


def valid_email(value: str) -> bool:
    return bool(EMAIL_RE.match(value.strip()))


def parse_id(value: str | int | None) -> int | None:
    try:
        parsed = int(value or 0)
        return parsed if parsed > 0 else None
    except (TypeError, ValueError):
        return None


def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def valid_image(file: FileStorage | None) -> tuple[bool, str]:
    if not file or not file.filename:
        return False, "No image file provided"
    filename = secure_filename(file.filename)
    extension = Path(filename).suffix.lower().lstrip(".")
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        return False, "Only JPG, JPEG, PNG, and WebP images are accepted"
    if file.mimetype not in ALLOWED_IMAGE_MIMETYPES:
        return False, "The uploaded file is not a supported image type"
    file.stream.seek(0, 2)
    size = file.stream.tell()
    file.stream.seek(0)
    if size > MAX_IMAGE_BYTES:
        return False, "Images must be 5 MB or smaller"
    return True, ""


def save_image(file: FileStorage, upload_root: Path, category: str) -> str:
    ok, error = valid_image(file)
    if not ok:
        raise ValueError(error)
    directory = upload_root / category
    directory.mkdir(parents=True, exist_ok=True)
    extension = Path(secure_filename(file.filename)).suffix.lower()
    filename = f"{uuid4().hex}{extension}"
    file.save(directory / filename)
    return f"/uploads/{category}/{filename}"