from app.models import RefreshToken
from datetime import datetime
from app.core.security import create_refresh_token
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user

from app.core.database import get_db
import jwt

from app.core.security import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(User).where(User.email == data.email)
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(User.email == data.email)
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        data.password,
        user.password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    payload = jwt.decode(
        refresh_token,
        SECRET_KEY,
        algorithms=[ALGORITHM],
    )

    expires_at = datetime.utcfromtimestamp(
        payload["exp"]
    )

    db_refresh_token = RefreshToken(
    user_id=user.id,
        token=refresh_token,
        expires_at=expires_at,
    )

    db.add(db_refresh_token)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )

@router.post(
    "/refresh",
    response_model=TokenResponse,
)
def refresh(
    refresh_token: str,
    db: Session = Depends(get_db),
):
    try:
        payload = jwt.decode(
            refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")
        token_type = payload.get("type")

        if not user_id or token_type != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token",
            )

        stored_token = db.scalar(
            select(RefreshToken).where(
                RefreshToken.token == refresh_token,
                RefreshToken.user_id == int(user_id),
            )
        )

        if not stored_token:
            raise HTTPException(
                status_code=401,
                detail="Refresh token not found",
            )

        if stored_token.revoked:
            raise HTTPException(
                status_code=401,
                detail="Refresh token has been revoked",
            )

        new_access_token = create_access_token(
            int(user_id)
        )

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=refresh_token,
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Refresh token expired",
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

@router.post("/logout")
def logout(
    refresh_token: str,
    db: Session = Depends(get_db),
):
    stored_token = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token == refresh_token
        )
    )

    if not stored_token:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

    stored_token.revoked = True

    db.commit()

    return {
        "message": "Logged out successfully"
    }