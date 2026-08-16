from sqlalchemy import Column, Integer, String, Enum
from db.session import Base
import enum

class UserRole(str,enum.Enum):
    USER="USER"
    HR = "HR"

class User(Base):
    __tablename__="users"

    user_id=Column(Integer, primary_key=True, index=True)
    name=Column(String, nullable=False)
    email=Column(String, nullable=False)
    password_hash=Column(String, nullable=False)
    role= Column(Enum(UserRole), nullable=False, default=UserRole.USER)    

    