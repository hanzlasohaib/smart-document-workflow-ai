from pydantic import BaseModel


class ExtractedFieldOut(BaseModel):
    field_name: str
    field_value: str
    is_verified: bool

    class Config:
        orm_mode = True
