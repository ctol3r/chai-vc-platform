"""
ACA-Py Mock Server for Local Development
Simulates ACA-Py admin API for credential issuance testing
"""

from flask import Flask, request, jsonify
import uuid
from datetime import datetime
import time

app = Flask(__name__)

# In-memory storage
connections = {}
credential_exchanges = {}
credential_definitions = {
    "WgWxqztrNooG92RXvxSTWv:3:CL:20:medical-license": {
        "cred_def_id": "WgWxqztrNooG92RXvxSTWv:3:CL:20:medical-license",
        "schema_id": "WgWxqztrNooG92RXvxSTWv:2:medical-license:1.0",
        "tag": "medical-license",
    }
}

@app.route('/status', methods=['GET'])
def get_status():
    """Agent status endpoint"""
    return jsonify({
        "version": "0.7.5-mock",
        "label": "VitalCV ACA-Py Mock",
        "timing": {
            "uptime": int(time.time())
        }
    })

@app.route('/connections/create-invitation', methods=['POST'])
def create_invitation():
    """Create connection invitation"""
    data = request.json or {}
    alias = data.get('alias', 'Holder')
    
    conn_id = str(uuid.uuid4())
    invitation_id = str(uuid.uuid4())
    
    connections[conn_id] = {
        "connection_id": conn_id,
        "state": "invitation",
        "alias": alias,
        "created_at": datetime.utcnow().isoformat(),
    }
    
    return jsonify({
        "connection_id": conn_id,
        "invitation": {
            "@id": invitation_id,
            "@type": "https://didcomm.org/connections/1.0/invitation",
            "label": f"VitalCV - {alias}",
            "serviceEndpoint": "http://localhost:8031",
            "recipientKeys": ["mock-key-123"]
        },
        "invitation_url": f"http://localhost:8031?c_i={invitation_id}"
    })

@app.route('/connections/<conn_id>', methods=['GET'])
def get_connection(conn_id):
    """Get connection details"""
    if conn_id not in connections:
        return jsonify({"error": "Connection not found"}), 404
    
    # Simulate connection becoming active
    if connections[conn_id]["state"] == "invitation":
        connections[conn_id]["state"] = "active"
    
    return jsonify(connections[conn_id])

@app.route('/credential-definitions/created', methods=['GET'])
def list_credential_definitions():
    """List created credential definitions"""
    return jsonify({
        "credential_definition_ids": list(credential_definitions.keys())
    })

@app.route('/issue-credential-2.0/send', methods=['POST'])
def issue_credential():
    """Issue a credential"""
    data = request.json
    
    cred_ex_id = str(uuid.uuid4())
    thread_id = str(uuid.uuid4())
    
    credential_exchanges[cred_ex_id] = {
        "cred_ex_id": cred_ex_id,
        "credential_exchange_id": cred_ex_id,
        "connection_id": data.get("connection_id"),
        "cred_def_id": data.get("cred_def_id"),
        "state": "credential-issued",
        "thread_id": thread_id,
        "created_at": datetime.utcnow().isoformat(),
        "credential_preview": data.get("credential_preview", {}),
        "auto_issue": data.get("auto_issue", True),
    }
    
    return jsonify(credential_exchanges[cred_ex_id])

@app.route('/issue-credential-2.0/records/<cred_ex_id>', methods=['GET'])
def get_credential_exchange(cred_ex_id):
    """Get credential exchange record"""
    if cred_ex_id not in credential_exchanges:
        return jsonify({"error": "Credential exchange not found"}), 404
    
    # Simulate state progression
    record = credential_exchanges[cred_ex_id]
    if record["state"] == "credential-issued":
        # Progress to done after some time
        created = datetime.fromisoformat(record["created_at"])
        elapsed = (datetime.utcnow() - created).total_seconds()
        if elapsed > 5:
            record["state"] = "done"
    
    return jsonify(record)

@app.route('/webhooks/topic/<topic>/', methods=['POST'])
def webhook_handler(topic):
    """Webhook registration endpoint"""
    return jsonify({"message": f"Webhook for {topic} registered"})

@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        "message": "VitalCV ACA-Py Mock Server",
        "version": "0.1.0",
        "endpoints": [
            "GET /status",
            "POST /connections/create-invitation",
            "GET /connections/<id>",
            "GET /credential-definitions/created",
            "POST /issue-credential-2.0/send",
            "GET /issue-credential-2.0/records/<id>"
        ]
    })

if __name__ == '__main__':
    print("Starting ACA-Py Mock Server on port 8031...")
    print("This is a development stub - not for production use")
    app.run(host='0.0.0.0', port=8031, debug=True)
