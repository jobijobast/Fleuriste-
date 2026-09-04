"""
Fonction serverless Vercel : GET /api/etat

Dit au widget si un conseiller est joignable. Ne révèle jamais la clé,
seulement le fait qu'elle existe et le nom du modèle.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _conseiller import etat  # noqa: E402


class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        corps = json.dumps(etat(), ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corps)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corps)
