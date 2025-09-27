💰 Dhan Sakshi (धन साक्षी)
Problem Statement ID: PS-25149 (Loan Utilization Tracking via Mobile App)

Theme: Smart Automation

Team: Hexa Titans

🚀 Overview
Dhan Sakshi (meaning "Money Witness") is an AI-powered, mobile-first platform designed to solve the critical problem of loan fund misuse and high manual verification costs faced by lending agencies and banks.

Our solution introduces Smart Automation into the asset verification process, allowing borrowers to submit proof easily, even in areas with poor network coverage, while instantly flagging potential fraud for officers.

✨ Core Innovations
Innovation

Description

Impact

Offline-First Submission

Beneficiaries can capture photos/videos of purchased assets and save them locally. The data automatically syncs to the cloud the moment network connectivity is restored.

Eliminates field visit dependency and ensures data capture is possible anywhere, improving efficiency in rural areas.

AI-Powered Fraud Detection

The backend analyzes uploaded media for anomalies, metadata tampering, and geo-fencing violations.

Instantly flags "Suspicious" cases, allowing officers to approve verified cases instantly and focus manual efforts only on high-risk cases.

Immutability (Future Scope)

All final approval/rejection decisions are logged to a mock Blockchain Ledger.

Ensures a tamper-proof audit trail for regulatory compliance and transparency.

💻 Technical Stack
The prototype is built as a highly performant, two-part application:

Frontend (Mobile Prototype)
Technology: React (Simulating a high-fidelity React Native application).

Styling: Tailwind CSS with custom Cyber-Teal aesthetics for a professional, high-impact console look.

Key Feature Demo: Local Storage simulation for the Offline-First capability.

Backend (API Gateway & Logic)
Technology: Node.js (Express) with CORS enabled for development.

Database (Mocked): In-memory storage simulating MongoDB (for media metadata) and PostgreSQL (for structured case data).

Core Logic: Contains the API endpoints for user sync, officer review, and the AI Simulation script.

🛠️ Setup and Installation
Follow these steps to run the application locally in your VS Code environment.

Prerequisites
You must have Node.js (includes npm) installed on your machine.

1. Backend Setup
The backend runs on Port 5000.

Navigate to the backend/ folder in your terminal.

cd backend

Install Node.js dependencies:

npm install

Start the server:

node index.js

(The terminal should show: Node.js Backend Server running on http://localhost:5000)

2. Frontend Setup
The frontend runs on Port 3000. Keep the backend server running!

Open a NEW terminal window and navigate to the frontend/ folder.

cd frontend

Install React dependencies (if not done yet):

npm install

Start the React application:

npm start

The application will automatically open in your browser at http://localhost:3000.

💡 How to Demo (The Golden Path)
Use this script flow to impress the jury:

Start on the Beneficiary Tab: Point to the Mobile Frame and state the Offline-First capability.

Go Offline: Click the ON toggle switch to set it to OFF (Red).

Capture Proof and click Save Proof Locally (Offline). Observe the pending count increase.

Sync Trigger: Switch the toggle back to ON (Green). Click Sync All Pending Case(s).

The Reveal: Immediately switch to the Officer (AI/Remote Review Dashboard) tab. The new case will appear, instantly flagged by the AI script.

Impact: Click the case, point to the AI Status, and finalize the review by clicking Approve Loan Use.
