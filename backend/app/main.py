from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from .database import engine, init_db
from .routers import bookings, catalog, fleet, misc, reports
from .seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    with Session(engine) as session:
        seed(session)
    yield


app = FastAPI(
    title="IranGlassCheck API",
    description="Glass service + 12-point fleet check platform (ایران‌گلس‌چک).",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog.router)
app.include_router(bookings.router)
app.include_router(reports.router)
app.include_router(fleet.router)
app.include_router(misc.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "iranglasscheck"}
