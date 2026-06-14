from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.schemas.stress_schema import PredictRequest, PredictResponse
from backend.schemas.user_schema import UserLogin, UserRegister, UserResponse
from backend.predict import predict_stress
from backend.chatbot import get_chat_response
from backend.recommendation import get_recommendations
from backend.history import get_user_history, get_stress_statistics
from backend.database import init_db, insert_user, get_user, insert_history
from backend.auth import hash_password, verify_password, create_access_token
from pydantic import BaseModel
import json
from pathlib import Path

app = FastAPI(
    title="SmartSenseAI Backend",
    description="FastAPI backend for student stress prediction and wellness recommendations.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "SmartSenseAI backend is running."}


@app.post("/register", response_model=UserResponse, tags=["Auth"])
def register(user: UserRegister):
    existing = get_user(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    hashed_pwd = hash_password(user.password)
    success = insert_user(user.email, user.name, hashed_pwd)

    if not success:
        raise HTTPException(status_code=500, detail="Registration failed.")

    return UserResponse(email=user.email, name=user.name)


@app.post("/login", tags=["Auth"])
def login(user: UserLogin):
    db_user = get_user(user.email)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    access_token = create_access_token(user.email)
    return {"access_token": access_token, "token_type": "bearer", "user": UserResponse(email=db_user["email"], name=db_user["name"])}


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
def predict(request: PredictRequest):
    features_dict = request.dict()
    result = predict_stress(features_dict)

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result


@app.post("/save-prediction", tags=["History"])
def save_prediction(user_email: str, prediction: dict):
    try:
        insert_history(
            user_email=user_email,
            stress_level=prediction["label"],
            confidence=prediction["confidence"],
            score=prediction["score"],
            features=prediction.get("features", {}),
        )
        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history/{user_email}", tags=["History"])
def get_history(user_email: str, limit: int = 50):
    history = get_user_history(user_email, limit)
    stats = get_stress_statistics(user_email)
    return {"history": history, "statistics": stats}


@app.get("/recommendations/{stress_level}", tags=["Recommendations"])
def get_recs(stress_level: str):
    if stress_level not in ["Low", "Moderate", "High"]:
        raise HTTPException(status_code=400, detail="Invalid stress level.")
    return {"recommendations": get_recommendations(stress_level)}


class ChatMessage(BaseModel):
    message: str


@app.post("/chat", tags=["Chatbot"])
def chat(msg: ChatMessage):
    response = get_chat_response(msg.message)
    return {"response": response}


# Serve React frontend as static files
dist_path = Path(__file__).parent.parent / "frontend" / "dist"
if dist_path.exists():
    app.mount("/", StaticFiles(directory=str(dist_path), html=True), name="static")
