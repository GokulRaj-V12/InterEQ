"""
InterEQ Backend — Flask Application
=====================================
Handles authentication and MFA verification APIs.
This is the skeleton for future MFA automation integration.
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from datetime import timedelta
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
app.permanent_session_lifetime = timedelta(hours=1)

CORS(app, supports_credentials=True, origins=[
    "http://localhost:8080",
    "https://gokulraj-v12.github.io",
])


# ─────────────────────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "InterEQ API"}), 200


# ─────────────────────────────────────────────────────────────
# Step 1: Login — validate credentials, trigger MFA
# ─────────────────────────────────────────────────────────────
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email    = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    # TODO: Validate credentials against your user store / target service
    # For now, accept any non-empty input in demo mode
    # In production: verify against DB or call target service login endpoint

    # Trigger MFA (send OTP, etc.)
    # TODO: Integrate with email/SMS/TOTP provider
    session["pending_mfa_email"] = email
    session["mfa_verified"] = False

    return jsonify({"message": "MFA code sent.", "email": email}), 200


# ─────────────────────────────────────────────────────────────
# Step 2: MFA Verify — validate OTP code
# ─────────────────────────────────────────────────────────────
@app.route("/api/mfa/verify", methods=["POST"])
def mfa_verify():
    data = request.get_json()
    code = data.get("code", "").strip()

    if len(code) != 6 or not code.isdigit():
        return jsonify({"error": "Invalid code format."}), 400

    pending_email = session.get("pending_mfa_email")
    if not pending_email:
        return jsonify({"error": "No pending MFA session."}), 401

    # TODO: Validate OTP against generated/sent code
    # For demo, accept "000000" as the magic test code
    if code == "000000":
        session["mfa_verified"] = True
        session["user_email"] = pending_email
        return jsonify({"message": "MFA verified.", "redirect": "/dashboard"}), 200

    return jsonify({"error": "Invalid or expired code."}), 401


# ─────────────────────────────────────────────────────────────
# Step 3: Agent trigger endpoint — for automation integration
# ─────────────────────────────────────────────────────────────
@app.route("/api/agent/trigger", methods=["POST"])
def agent_trigger():
    """
    Called by the MFA automation agent to initiate a full login flow.
    The agent provides credentials; this endpoint orchestrates the flow.
    """
    data = request.get_json()
    email    = data.get("email", "")
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Credentials required."}), 400

    # TODO: Pass to agent runner — agent will:
    #   1. Submit credentials to target service
    #   2. Intercept MFA challenge
    #   3. Resolve OTP (via email/TOTP/SMS extraction)
    #   4. Submit OTP and return session token

    return jsonify({
        "status": "initiated",
        "message": "Agent run queued. MFA flow will be resolved automatically.",
    }), 202


# ─────────────────────────────────────────────────────────────
# Step 4: Logout
# ─────────────────────────────────────────────────────────────
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Signed out."}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
