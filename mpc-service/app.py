from flask import Flask, request, jsonify

app = Flask(__name__)

# In-memory store of submitted credential hashes per institution
submitted_data: dict[str, set[str]] = {}

@app.route('/submit', methods=['POST'])
def submit_credentials():
    body = request.get_json(force=True)
    institution = body.get('institution')
    credentials = body.get('credentials')
    if not institution or not isinstance(credentials, list):
        return jsonify({'error': 'Invalid request'}), 400
    submitted_data.setdefault(institution, set()).update(credentials)
    return jsonify({'status': 'received', 'institution': institution})

@app.route('/intersection', methods=['GET'])
def compute_intersection():
    if not submitted_data:
        return jsonify({'intersection': []})
    # Start with the credential set of the first institution
    iterator = iter(submitted_data.values())
    intersection = set(next(iterator))
    for creds in iterator:
        intersection &= creds
    return jsonify({'intersection': sorted(intersection)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
