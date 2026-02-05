import requests
import time
import random
import socket

# --- CONFIGURATION (Interlinked with main.py) ---
API_URL = "http://127.0.0.1:8000"
TARGET_USER = "akash_employee"
HOSTNAME = socket.gethostname() # Automatically gets your PC name
LOCAL_IP = "192.168.1.45"       # Simulated local IP

def send_log_to_siem(action, resource, severity="Low"):
    payload = {
        "username": TARGET_USER,
        "action": action,
        "resource": resource,
        "ip_address": LOCAL_IP,
        "hostname": HOSTNAME,
        "severity": severity
    }
    try:
        res = requests.post(f"{API_URL}/receive-log", json=payload)
        data = res.json()
        print(f"[*] Action: {action} | Risk Score: {data.get('risk', 'N/A')}")
        return data.get('status') == 'BLOCKED'
    except Exception as e:
        print(f"[!] Connection Error: {e}")
        return False

def run_demo_scenario():
    print(f"=== INITIALIZING FORENSIC IDENTITY FOR {TARGET_USER} ===")
    
    # PHASE 0: Establish PC and IP details in the logs
    # This removes "Detecting..." and "Determining..." from the profile page
    send_log_to_siem("SYSTEM_AUTHORIZATION", "Endpoint_Identity_Verified", "Low")
    
    print("\n=== STARTING INSIDER THREAT SIMULATION ===")
    time.sleep(2)

    # Scenario 1: Bulk Staging (Interlinked with VELOCITY_THRESHOLD = 4)
    for i in range(5):
        send_log_to_siem("FILE_STAGING_ZIP", f"./SENSITIVE_DATA/backup_part_{i}.zip", "Medium")
        time.sleep(0.5)

    # Scenario 2: Sensitive Keyword Access
    send_log_to_siem("UNAUTHORIZED_READ", "FINANCE_RECORDS_2026.xlsx", "High")
    
    # Scenario 3: Honeytoken Trap (Instant Block)
    print("\n[!] Final Phase: Triggering Honeytoken Trap...")
    time.sleep(2)
    send_log_to_siem("HONEYTOKEN_TRAP_TRIGGERED", "ROOT_PASSWORDS.txt", "Critical")

    print("\n=== SIMULATION COMPLETE: USER SHOULD BE BLOCKED ===")

if __name__ == "__main__":
    run_demo_scenario()