"""
Fonction serverless Vercel : GET /api/etat

Dit au widget si un conseiller est joignable. Ne révèle jamais la clé,
seulement le fait qu'elle existe et le nom du modèle.

GET /api/etat?diag=1 ajoute de quoi comprendre pourquoi la clé n'arrive
pas : noms des variables visibles et longueur de MV_CLE. Jamais sa
valeur : ce point d'entrée est public.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _conseiller import etat, diagnostic  # noqa: E402


class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        charge = etat()
        if parse_qs(urlparse(self.path).query).get("diag"):
            charge["diagnostic"] = diagnostic()

        corps = json.dumps(charge, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corps)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corps)
