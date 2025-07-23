from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/verify/<credential_id>')
def verify_credential(credential_id):
    """Return a simple verification payload."""
    # In a real implementation this would check the credential against
    # a data store or blockchain. We simply return verified=True.
    response = {
        "credential_id": credential_id,
        "verified": True,
    }
    return jsonify(response)

@app.route('/widget.js')
def widget_js():
    """Serve the embeddable JavaScript widget."""
    return send_from_directory('static', 'widget.js')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
