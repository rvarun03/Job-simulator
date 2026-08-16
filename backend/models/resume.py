from sqlalchemy import Column, Integer, String, Text
from db.session import Base

class Resume(Base):
    __tablename__= "resumes"
    id=Column(Integer, primary_key=True, index=True)
    raw_text= Column(Text)
    structured_data= Column(Text)

    