from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.session import get_db
from models.user import User
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):

    existing_user= db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    new_user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        {
            "sub": str(new_user.user_id),
            "email": new_user.email,
            "role": new_user.role.value
        }
    )

    return {
        "access_token": token,
        "role": new_user.role
    }

@router.post("/login", response_model=TokenResponse)
def login_user(data: LoginRequest, db: Session = Depends(get_db)):
    
    user=db.query(User).filter(User.email== data.email).first()

    if not user or not verify_password(data.password, user.password_hash):
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token = create_access_token(
        {
            "sub": str(user.user_id),
            "email": user.email,
            "role": user.role.value
        }
    )

    return {
        "access_token": token,
        "role": user.role
    }