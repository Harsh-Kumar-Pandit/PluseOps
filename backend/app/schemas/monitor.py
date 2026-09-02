from pydantic import BaseModel, Field, HttpUrl


class MonitorCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

    url: HttpUrl

    method: str = Field(
        default="GET",
        pattern="^(GET|HEAD)$",
    )

    interval: int = Field(
        default=60,
        ge=10,
    )

    timeout: int = Field(
        default=10,
        ge=1,
        le=60,
    )

    expected_status: int = Field(
        default=200,
        ge=100,
        le=599,
    )

    failure_threshold: int = Field(
        default=2,
        ge=1,
        le=10,
    )

    degraded_threshold: int = Field(
        default=2000,
        ge=500,
        le=10000,
    )

    recovery_threshold: int = Field(
        default=2,
        ge=1,
        le=10,
    )


class MonitorUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    url: HttpUrl | None = None

    method: str | None = Field(
        default=None,
        pattern="^(GET|HEAD)$",
    )

    interval: int | None = Field(
        default=None,
        ge=10,
    )

    timeout: int | None = Field(
        default=None,
        ge=1,
        le=60,
    )

    expected_status: int | None = Field(
        default=None,
        ge=100,
        le=599,
    )

    failure_threshold: int | None = Field(
        default=None,
        ge=1,
        le=10,
    )

    is_active: bool | None = None

    degraded_threshold: int | None = Field(
        default=None,
        ge=500,
        le=10000,
    )

    recovery_threshold: int | None = Field(
        default=None,
        ge=1,
        le=10,
    )


class MonitorResponse(BaseModel):
    id: int
    name: str
    url: str
    method: str
    interval: int
    timeout: int
    expected_status: int
    failure_threshold: int
    consecutive_failures: int
    consecutive_successes: int
    degraded_threshold: int
    recovery_threshold: int
    status: str
    is_active: bool

    model_config = {
        "from_attributes": True
    }