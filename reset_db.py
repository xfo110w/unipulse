import asyncio
from backend.database import engine, Base
import backend.models  # ensure models are loaded
from backend.init_defaults import ensure_default_buildings

async def reset_to_clean():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(ensure_default_buildings)
    print("Database reset successfully! Buildings 1 to 23 and default rooms are initialized.")

if __name__ == "__main__":
    asyncio.run(reset_to_clean())
