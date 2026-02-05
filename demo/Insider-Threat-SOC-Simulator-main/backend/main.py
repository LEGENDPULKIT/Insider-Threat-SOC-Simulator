from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Dict, Optional, Set, List
import requests
import uuid
import asyncio
import os
from database import (
    log_collection, 
    session_collection, 
    user_collection, 
    audit_collection, 
    log_helper, 
    audit_helper, 
    init_db
)
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext

app = FastAPI(title="Exabeam Local Data Server")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- CONFIGURATION ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "SENSITIVE_DATA")

if not os.path.exists(DATA_PATH):
    os.makedirs(DATA_PATH)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class InsiderLog(BaseModel):
    username: str
    action: str
    resource: str
    ip_address: str
    hostname: str = "Unknown"
    severity: str = "Low"

class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str
    role: str = "employee"

# --- SYSTEM STATE ---
user_risk_scores: Dict[str, int] = {}
blocked_users: Set[str] = set()
agent_health: Dict[str, datetime] = {}
BLOCK_THRESHOLD = 180 

@app.on_event("startup")
async def startup_event():
    await init_db()

# --- DUPLICATE PREVENTION & AUTH ---

@app.post("/register")
async def register(user: UserRegister):
    """Prevents duplicate usernames."""
    normalized_username = user.username.lower()
    existing_user = await user_collection.find_one({"username": normalized_username})
    
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = pwd_context.hash(user.password)
    await user_collection.insert_one({
        "username": normalized_username,
        "password": hashed_password,
        "role": user.role,
        "status": "active",
        "last_login": None
    })
    
    # Log registration in Audit
    await audit_collection.insert_one({
        "admin": "System",
        "action": "USER_REGISTRATION",
        "target": normalized_username,
        "timestamp": datetime.now()
    })
    return {"message": "Registration successful"}

@app.post("/login")
async def login(data: UserLogin):
    user = await user_collection.find_one({"username": data.username.lower()})
    if not user or not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if data.username.lower() in blocked_users:
        raise HTTPException(status_code=403, detail="ACCOUNT SUSPENDED")

    login_time = datetime.now()
    await user_collection.update_one({"username": user["username"]}, {"$set": {"last_login": login_time}})
    return {"username": user["username"], "role": user["role"], "last_login": login_time}

# --- SECURITY ENGINE ---

@app.post("/receive-log")
async def receive_log(log: InsiderLog):
    """Processes telemetry and prevents duplicate incident flooding."""
    if log.username in blocked_users:
        return {"status": "BLOCKED"}

    # Duplicate Prevention: 5-second window
    dup_time = datetime.now() - timedelta(seconds=5)
    if await log_collection.find_one({"username": log.username, "action": log.action, "resource": log.resource, "timestamp": {"$gte": dup_time}}):
        return {"status": "Duplicate suppressed"}

    risk_added = 0
    if "SENSITIVE" in log.action: risk_added += 60
    if "TRAP" in log.action: risk_added = 999 

    user_risk_scores[log.username] = user_risk_scores.get(log.username, 0) + risk_added
    total_score = user_risk_scores[log.username]
    if total_score >= BLOCK_THRESHOLD: blocked_users.add(log.username)

    new_log = log.dict()
    new_log.update({"risk_score": total_score, "timestamp": datetime.now()})
    await log_collection.insert_one(new_log)
    return {"status": "Processed", "risk": total_score}

# --- MONITORING & DATA ---

@app.get("/view-audit")
async def view_audit():
    """FIXES 404: Provides audit records for the Master dashboard."""
    return [audit_helper(a) async for a in audit_collection.find().sort("timestamp", -1)]

@app.post("/heartbeat")
async def heartbeat(data: dict):
    agent_health[data.get("hostname")] = datetime.now()
    return {"status": "Alive"}

@app.get("/agent-status")
def get_status():
    return {h: "ONLINE" for h in agent_health.keys()}

@app.get("/list-files")
async def list_files():
    files = os.listdir(DATA_PATH)
    return [{"name": f, "type": "Restricted" if any(k in f.lower() for k in ["payroll", "secret"]) else "Standard"} for f in files]

@app.get("/fetch-file/{filename}")
async def fetch_file(filename: str, username: str):
    if username.lower() in blocked_users or user_risk_scores.get(username.lower(), 0) >= BLOCK_THRESHOLD:
        raise HTTPException(status_code=403, detail="ACCOUNT SUSPENDED")
    file_path = os.path.join(DATA_PATH, filename)
    if os.path.exists(file_path):
        return FileResponse(path=file_path, filename=filename)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/view-logs")
async def view_logs():
    return [log_helper(log) async for log in log_collection.find().sort("timestamp", -1)]