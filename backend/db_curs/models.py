from database import Base
from sqlalchemy import Column
from sqlalchemy.sql.sqltypes import Integer, String, Float


class DbUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    email = Column(String)
    password = Column(String)
    weight = Column(Float)
    height = Column(Integer)
    target_weight = Column(Float)
    time_frame = Column(Integer, default=6)
