from math import ceil
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Paginated(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int


def paginate(items_query, *, page: int, page_size: int) -> tuple[list, int, int]:
    """Apply offset/limit to a SQLAlchemy Query. Returns (rows, total, pages)."""
    total = items_query.count()
    pages = ceil(total / page_size) if total else 0
    offset = (page - 1) * page_size
    rows = items_query.offset(offset).limit(page_size).all()
    return rows, total, pages


def to_paginated(rows, *, total: int, page: int, page_size: int, pages: int) -> dict:
    return {
        "items": rows,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }
