# Insider-Threat-SOC-Simulator

## 🚀 Overview
A high-fidelity Security Operations Center (SOC) simulator designed to detect and block insider threats in real-time. This project uses a **FastAPI** backend, **MongoDB** storage, and a **React 19** analytics dashboard to monitor user behavior and enforce security playbooks.

## 📁 Interlinked File Structure
- **`main.py`**: The central brain. Handles risk scoring, authentication, and the file-gatekeeper logic.
- **`database.py`**: The storage layer. Manages logs, sessions, and hashed user credentials.
- **`agent.py`**: The endpoint client. Resides on the employee machine, monitors local activity, and fetches files from the server.
- **`setup_users.py`**: Database initializer for Master and Employee roles.
- **`simulate_threats.py`**: Demo tool to trigger security incidents automatically.
- **Frontend (`/src`)**:
    - `Login.jsx`: Secure entry point with role-based redirection.
    - `Homes.jsx`: The "Exabeam" style SIEM overview.
    - `UserProfile.jsx`: Forensic view showing login stamps and risk history.

## 🛡️ Security Playbooks (Detection Rules)
1. **Velocity Check**: Detects 4+ staging actions or 10+ deletions in 60 seconds.
2. **Honeytoken Trap**: Instant 999 risk score and account lockout if decoy files are touched.
3. **Sensitive Keywords**: Automatic point escalation for files containing 'payroll', 'secret', or 'finance'.
4. **Time-of-Day Anomaly**: Flags logins occurring between 10 PM and 5 AM.

## 🛠️ Setup Instructions
1. **Database**: Ensure MongoDB 8.x is running.
2. **Backend**: 
   ```bash
   pip install fastapi uvicorn motor requests passlib[bcrypt] python-magic
   python setup_users.py
   uvicorn main:app --reload