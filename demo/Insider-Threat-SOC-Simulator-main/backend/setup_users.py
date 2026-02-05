import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def setup():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.siem_database
    users = db.get_collection("users")

    initial_users = [
        {"username": "admin", "password": "master", "role": "master"},
        {"username": "employee", "password": "123", "role": "employee"}
    ]

    print("[*] Checking user database...")

    for user_data in initial_users:
        # Check if user already exists before inserting
        exists = await users.find_one({"username": user_data["username"]})
        if not exists:
            user_data["password"] = pwd_context.hash(user_data["password"])
            user_data["status"] = "active"
            user_data["last_login"] = None
            await users.insert_one(user_data)
            print(f"[+] Created: {user_data['username']}")
        else:
            print(f"[!] {user_data['username']} already exists. Skipping.")

    print("[*] User setup complete.")

if __name__ == "__main__":
    asyncio.run(setup())