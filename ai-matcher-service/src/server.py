"""Simple HTTP server exposing job matching endpoints."""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import re
from .routes.match import rank_jobs_for_clinician


class MatchHandler(BaseHTTPRequestHandler):
    """HTTP request handler for job matching endpoints."""

    def do_GET(self) -> None:
        match = re.fullmatch(r"/match/jobs/([^/]+)", self.path)
        if self.command == "GET" and match:
            clinician_id = match.group(1)
            jobs = rank_jobs_for_clinician(clinician_id)
            response = json.dumps({"clinicianId": clinician_id, "jobs": jobs}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(response)
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found")


def run(port: int = 8000) -> None:
    """Run the HTTP server on the specified port."""
    server_address = ("", port)
    httpd = HTTPServer(server_address, MatchHandler)
    print(f"Matcher service running on port {port}")
    httpd.serve_forever()


if __name__ == "__main__":
    run()
