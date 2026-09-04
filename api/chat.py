"""
Fonction serverless Vercel : POST /api/chat

Vercel ne fait pas tourner de serveur en continu. Chaque appel démarre
cette fonction, qui relaie la question vers le fournisseur avec la clé
prise dans les variables d'environnement du projet, puis s'éteint.

La clé n'est donc jamais servie au navigateur, exactement comme avec
proxy.py en local. Les deux partagent api/_conseiller.py.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _conseiller import repond  # noqa: E402


class handler(BaseHTTPRequestHandler):

    def _envoie(self, code, charge):
        corps = json.dumps(charge, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corps)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corps)

    def do_POST(self):
        try:
            taille = int(self.headers.get("Content-Length") or 0)
            if taille <= 0 or taille > 60000:
                raise ValueError
            entree = json.loads(self.rfile.read(taille).decode("utf-8"))
        except Exception:
            self._envoie(400, {"erreur": "requete_invalide"})
            return

        code, charge = repond(entree.get("messages"))
        # Le détail technique reste dans les journaux du serveur : il peut
        # contenir des informations sur le compte du fournisseur.
        if "detail" in charge:
            print("[conseiller]", charge.pop("detail"))
        self._envoie(code, charge)

    def do_GET(self):
        self._envoie(405, {"erreur": "methode_non_autorisee"})
