#!/usr/bin/env python3
"""
Slofa English - Local Development Server
Serves static frontend files and routes /api/slofa to Serverless API handler.
"""
import http.server
import socketserver
import os
import sys

# Add current workspace directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from api.slofa import handler as SlofaHandler

class DevServerHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path.startswith('/api/slofa'):
            # Delegate to SlofaHandler
            SlofaHandler.do_POST(self)
        else:
            self.send_error(404, "Not Found")

    def do_OPTIONS(self):
        if self.path.startswith('/api/slofa'):
            SlofaHandler.do_OPTIONS(self)
        else:
            self.send_error(404, "Not Found")

def run(port=8000):
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", port), DevServerHandler) as httpd:
            print(f"🛋️ Slofa English Server running at: http://localhost:{port}")
            print("Press Ctrl+C to stop the server.")
            httpd.serve_forever()
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"⚠️ Port {port} in use, trying {port + 1}...")
            run(port + 1)
        else:
            raise e

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    run(port)
