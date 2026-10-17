from sqlalchemy import Column, Integer, Text, String, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector

from app.db.base import Base


class NeuronVector(Base):
    __tablename__ = "neuron_vectors"

    id = Column(Text, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    source = Column(String, nullable=False)
    document = Column(Text, nullable=False)
    embedding = Column(Vector(1024), nullable=False)
    metadata_json = Column(
        "metadata",
        JSONB,
        nullable=False,
        default=dict
    )