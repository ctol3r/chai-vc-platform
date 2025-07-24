#!/usr/bin/env python3
"""Simple DIDComm prototype server for inter-wallet messaging."""

import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

# In-memory message store: {recipient_id: [messages]}
MESSAGE_STORE = {}

class DIDCommHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.end_headers()

    def do_POST(self):
        if self.path == "/send":
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                sender = data.get("from")
                recipient = data.get("to")
                msg_type = data.get("type", "message")
                content = data.get("body")
                if not sender or not recipient or content is None:
                    raise ValueError("'from', 'to' and 'body' are required")
                message = {
                    "from": sender,
                    "to": recipient,
                    "type": msg_type,
                    "body": content,
                }
                MESSAGE_STORE.setdefault(recipient, []).append(message)
                self._set_headers(200)
                self.wfile.write(json.dumps({"status": "stored"}).encode())
            except (json.JSONDecodeError, ValueError) as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(b"{}")

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/messages":
            query = parse_qs(parsed.query)
            wallet_id = query.get("wallet_id", [None])[0]
            if not wallet_id:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "wallet_id query param required"}).encode())
                return
            messages = MESSAGE_STORE.pop(wallet_id, [])
            self._set_headers(200)
            self.wfile.write(json.dumps({"messages": messages}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(b"{}")


def run(host="0.0.0.0", port=8000):
    server = HTTPServer((host, port), DIDCommHandler)
    print(f"DIDComm prototype server running on {host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run()
