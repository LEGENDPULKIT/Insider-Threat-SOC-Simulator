from motor.motor_asyncio import AsyncIOMotorClient
import os

# --- MONGODB CONNECTION SETTINGS ---
# For a Standalone MongoDB 8.x Community Edition
MONGO_URL = "mongodb://localhost:27017"

client = AsyncIOMotorClient(MONGO_URL)

# Accessing the specific database for our SIEM
database = client.siem_database  # This will create 'siem_database' if it doesn't exist

# Defining the collections
log_collection = database.get_collection("logs_collection")
session_collection = database.get_collection("sessions")

# Indexing Function (to be called on startup)
async def init_db():
    try:
        # Create indices for performance
        await log_collection.create_index([("username", 1), ("timestamp", -1)])
        await session_collection.create_index([("session_id", 1)], unique=True)
        print(f"[*] Successfully connected to MongoDB at {MONGO_URL}")
        print("[*] Security Indices Verified.")
    except Exception as e:
        print(f"[!] MongoDB Connection Error: {e}")

# Helper to format MongoDB documents for the API
def log_helper(log) -> dict:
    return {
        "id": str(log["_id"]),
        "username": log.get("username"),
        "action": log.get("action"),
        "resource": log.get("resource"),
        "ip_address": log.get("ip_address"),
        "risk_score": log.get("risk_score"),
        "timestamp": log.get("timestamp")
    }