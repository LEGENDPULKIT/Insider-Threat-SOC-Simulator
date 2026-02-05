from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

# --- CONFIGURATION ---
MONGO_URL = "mongodb://localhost:27017"

client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
database = client.siem_database  

# --- COLLECTIONS ---
log_collection = database.get_collection("logs_collection")
session_collection = database.get_collection("sessions")
user_collection = database.get_collection("users")
audit_collection = database.get_collection("audit_logs")

async def init_db():
    """Initializes the database and ensures connectivity."""
    try:
        # Verify connection
        await client.admin.command('ping')
        
        # Create indexes for faster dashboard loading
        await log_collection.create_index([("timestamp", -1)])
        await audit_collection.create_index([("timestamp", -1)])
        await user_collection.create_index([("username", 1)], unique=True)
        
        print("[*] MongoDB Connection: OK")
    except Exception as e:
        print(f"[!] MongoDB Connection: FAILED. Error: {e}")

# --- HELPERS (Formatting for Frontend) ---

def log_helper(log) -> dict:
    """Formats incident logs for the Home and UserProfile pages."""
    return {
        "id": str(log["_id"]),
        "username": log.get("username"),
        "action": log.get("action"),
        "resource": log.get("resource"),
        "risk_score": log.get("risk_score", 0),
        "timestamp": log.get("timestamp").isoformat() if hasattr(log.get("timestamp"), 'isoformat') else str(log.get("timestamp")),
        "hostname": log.get("hostname", "Unknown"),
        "ip_address": log.get("ip_address", "0.0.0.0")
    }

def audit_helper(audit) -> dict:
    """Formats administrative logs to fix dashboard 404 errors."""
    return {
        "id": str(audit["_id"]),
        "admin": audit.get("admin", "System"),
        "action": audit.get("action"),
        "target": audit.get("target"),
        "timestamp": audit.get("timestamp").isoformat() if hasattr(audit.get("timestamp"), 'isoformat') else str(audit.get("timestamp"))
    }