from pydantic import BaseModel, HttpUrl


class MonitorCreate(BaseModel):
    name: str
    url: HttpUrl
    method: str = "GET"
    interval: int = 60
    timeout: int = 10
    expected_status: int = 200
    failure_threshold: int = 2


class MonitorUpdate(BaseModel):
    name: str | None = None
    url: HttpUrl | None = None
    method: str | None = None
    interval: int | None = None
    timeout: int | None = None
    expected_status: int | None = None
    failure_threshold: int | None = None
    is_active: bool | None = None


class MonitorResponse(BaseModel):
    id: int
    name: str
    url: str
    method: str
    interval: int
    timeout: int
    expected_status: int
    failure_threshold: int
    status: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }