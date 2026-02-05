import time
import requests
import os
import getpass
import socket
import platform
import threading
import signal
import magic
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- CONFIGURATION (Interlinked with main.py) ---
API_BASE_URL = "http://127.0.0.1:8000"
MONITOR_PATH = "./LOCAL_WORK_DIR" # Agent's local workspace
SENSITIVE_DATA_SERVER_PATH = f"{API_BASE_URL}/fetch-file"

# --- AUTO-DETECTED DETAILS ---
CURRENT_USER = getpass.getuser()
HOSTNAME = socket.gethostname()
LOCAL_IP = socket.gethostbyname(HOSTNAME)
OS_SYSTEM = platform.system()

if not os.path.exists(MONITOR_PATH):
    os.makedirs(MONITOR_PATH)

# --- SECURITY ENFORCEMENT ---

def lockdown_workspace():
    """Triggered when Backend returns BLOCKED status."""
    print(f"\n[!!!] SECURITY ENFORCEMENT: Account for {CURRENT_USER} Suspended.")
    print("[*] Locking local workspace and killing unauthorized processes...")
    try:
        # Kill common exfiltration tools (Interlinked with Playbooks)
        suspicious = ["rclone", "ftp", "winscp", "powershell"]
        for proc in suspicious:
            os.system(f"taskkill /F /IM {proc}.exe >nul 2>&1")
        
        # Make the local work directory read-only
        os.system(f'attrib +r "{MONITOR_PATH}\\*" /s /d')
    except Exception as e:
        print(f"Lockdown failed: {e}")

# --- SERVER INTERACTION ---

def fetch_from_server(filename):
    """Interlinks with main.py fetch_file endpoint."""
    print(f"[*] Requesting {filename} from Central Server...")
    try:
        response = requests.get(f"{SENSITIVE_DATA_SERVER_PATH}/{filename}", params={"username": CURRENT_USER})
        
        if response.status_code == 200:
            print(f"[+] Access Granted: {filename} downloaded to local workspace.")
            # Logic to save file locally for the user
        elif response.status_code == 403:
            lockdown_workspace()
            print(f"[!] ACCESS DENIED: {response.json().get('detail')}")
    except Exception as e:
        print(f"[!] Server Connection Error: {e}")

# --- DETECTION LOGIC (The Brain) ---

class InterlinkedHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            self.inspect_and_report(event.src_path, "FILE_MODIFIED")

    def on_deleted(self, event):
        if not event.is_directory:
            # Trigger Sabotage logic in main.py
            self.send_log("CRITICAL: Local File Deleted", event.src_path, severity="High")

    def inspect_and_report(self, file_path, action):
        severity = "Low"
        filename = os.path.basename(file_path).lower()
        
        # Magic Byte Check for Encryption Staging
        try:
            mime = magic.from_file(file_path, mime=True)
            if "pgp" in mime or "encrypted" in mime:
                action = "STAGING: Encrypted Data Found"
                severity = "Critical"
        except: pass

        # Sensitive Keyword Cross-Reference (Matches main.py risk rules)
        if any(key in filename for key in ["secret", "payroll", "finance"]):
            severity = "High"

        self.send_log(action, file_path, severity)

    def send_log(self, action, resource, severity="Low"):
        payload = {
            "username": CURRENT_USER,
            "hostname": HOSTNAME,
            "ip_address": LOCAL_IP,
            "action": action,
            "resource": resource,
            "severity": severity
        }
        try:
            res = requests.post(f"{API_BASE_URL}/receive-log", json=payload, timeout=2)
            if res.json().get("status") == "BLOCKED":
                lockdown_workspace()
        except:
            pass

# --- BACKGROUND HEARTBEAT ---

def send_heartbeat():
    while True:
        try:
            requests.post(f"{API_BASE_URL}/heartbeat", json={"hostname": HOSTNAME}, timeout=2)
        except:
            pass
        time.sleep(5)

# --- MAIN EXECUTION ---

if __name__ == "__main__":
    # 1. Heartbeat starts (Visible in Metrics.jsx)
    threading.Thread(target=send_heartbeat, daemon=True).start()

    # 2. File Watcher starts (Feeds Incidents.jsx)
    observer = Observer()
    observer.schedule(InterlinkedHandler(), MONITOR_PATH, recursive=True)
    observer.start()
    
    print(f"[*] Agent active for {CURRENT_USER} | Monitoring: {MONITOR_PATH}")
    
    try:
        # Example of interlinked fetch
        # fetch_from_server("payroll_records.csv") 
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()