
from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.neuron_vector import NeuronVector


class PostgresVectorStore:
    """
    PostgreSQL/pgvector storage for Neuron's RAG documents.
    Uses Neon through the existing SQLAlchemy database configuration.
    """

    @staticmethod
    def upsert(
        ids,
        documents,
        embeddings,
        metadatas,
    ):
        if not ids:
            return

        if not (
            len(ids)
            == len(documents)
            == len(embeddings)
            == len(metadatas)
        ):
            raise ValueError(
                "IDs, documents, embeddings, and metadata "
                "must have matching lengths."
            )

        db = SessionLocal()

        try:
            for item_id, document, embedding, metadata in zip(
                ids,
                documents,
                embeddings,
                metadatas,
            ):
                user_id = int(metadata["user_id"])
                source = metadata["source"]

                # Scope the upsert to the owner and source.
                existing = db.execute(
                    select(NeuronVector).where(
                        NeuronVector.id == item_id,
                        NeuronVector.user_id == user_id,
                        NeuronVector.source == source,
                    )
                ).scalar_one_or_none()

                if existing:
                    existing.document = document
                    existing.embedding = embedding
                    existing.metadata_json = metadata
                else:
                    db.add(
                        NeuronVector(
                            id=item_id,
                            user_id=user_id,
                            source=source,
                            document=document,
                            embedding=embedding,
                            metadata_json=metadata,
                        )
                    )

            db.commit()

        except Exception:
            db.rollback()
            raise

        finally:
            db.close()

    @staticmethod
    def query(
        query_embeddings,
        n_results=3,
        where=None,
        include=None,
    ):
        if not query_embeddings or not query_embeddings[0]:
            return {
                "documents": [[]],
                "metadatas": [[]],
                "distances": [[]],
            }

        query_embedding = query_embeddings[0]
        n_results = max(1, min(int(n_results), 10))

        # Preserve the user/source filters used by the old
        # ChromaDB retriever.
        filters = where or {}
        conditions = filters.get("$and", [])

        user_id = None
        source = None

        for condition in conditions:
            if "user_id" in condition:
                user_id = int(condition["user_id"]["$eq"])
            elif "source" in condition:
                source = condition["source"]["$eq"]

        if user_id is None or source is None:
            raise ValueError(
                "A user_id and source filter are required."
            )

        db = SessionLocal()

        try:
            distance = NeuronVector.embedding.cosine_distance(
                query_embedding
            ).label("distance")

            rows = db.execute(
                select(NeuronVector, distance)
                .where(
                    NeuronVector.user_id == user_id,
                    NeuronVector.source == source,
                )
                .order_by(distance)
                .limit(n_results)
            ).all()

            return {
                "documents": [[row.document for row, _ in rows]],
                "metadatas": [
                    [row.metadata_json or {} for row, _ in rows]
                ],
                "distances": [
                    [float(distance) for _, distance in rows]
                ],
            }

        finally:
            db.close()


# Keep the existing interface so ingestion/retrieval imports
# can continue using `collection.upsert()` and `collection.query()`.
collection = PostgresVectorStore()
