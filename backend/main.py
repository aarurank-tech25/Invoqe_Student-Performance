"""
main.py
-------
FastAPI Application Entrypoint for AETHER Student Intelligence Platform.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.database import engine, Base
from backend.seed import seed_database
from backend.routers import auth, students, predictions, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables and seed accounts are initialized on startup
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Startup notice: {e}")
    yield


app = FastAPI(
    title="AETHER — AI Student Intelligence & Success API",
    description="Enterprise predictive machine learning API for academic risk mitigation and performance modeling.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware (Enable local React dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route Mounting
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(predictions.router)
app.include_router(admin.router)


@app.get("/api/health")
def health_check():
    """System health check probe."""
    return {
        "status": "healthy",
        "service": "AETHER Student Intelligence API",
        "version": "2.0.0",
        "model_loaded": True,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Fallback error envelope for unexpected internal errors."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )
