# backend/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from logging_config import logger
from datetime import timedelta
from auth import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from auth import *

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autorise tous les domaines (à configurer en prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    logger.info("L'endpoint / a été accédé.")
    return {"message": "Bienvenue sur l'API FastAPI"}

@app.get("/test")
def test_endpoint():
    logger.info("L'endpoint /test a été accédé.")
    return {"message": "Ceci est un test."}

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Incorrect username or password",
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

import pyotp

@app.get("/2fa/generate")
async def generate_otp(current_user: User = Depends(get_current_active_user)):
    # Utilise le secret associé à l'utilisateur pour générer un OTP
    totp = pyotp.TOTP(current_user.otp_secret)
    return {"otp": totp.now()}

@app.post("/2fa/verify")
async def verify_otp(otp_code: str, current_user: User = Depends(get_current_active_user)):
    totp = pyotp.TOTP(current_user.otp_secret)
    if not totp.verify(otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP")
    return {"message": "OTP verified successfully"}
