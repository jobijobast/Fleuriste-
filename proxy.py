#!/usr/bin/env python3
"""
Maison Verveine - serveur de développement.

Sert le site statique et expose /api/etat et /api/chat, exactement comme
le fera Vercel en production. La logique du conseiller n'est pas ici :
elle vit dans api/_conseiller.py, partagée avec les fonctions
serverless, pour qu'il n'existe jamais deux versions du périmètre.

Pourquoi passer par un serveur plutôt qu'appeler le modèle depuis le
navigateur :

  1. La clé d'API reste côté serveur. Elle n'est jamais envoyée au
     navigateur, donc jamais lisible dans les outils de développement,
     jamais présente dans le dépôt Git.
  2. Le prompt système reste hors de portée. Écrit côté navigateur,
     n'importe qui le réécrirait depuis la console pour faire sortir le
     conseiller de son sujet.

Lancement :

    python proxy.py

Puis http://localhost:5199

Configuration : copier .env.exemple en .env et y mettre la clé.
Le fichier .env est ignoré par Git.
"""

import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RACINE = Path(__file__).resolve().parent
sys.path.insert(0, str(RACINE / "api"))

# La console Windows est en cp1252 : sans cela, le moindre accent dans un
# message de diagnostic fait planter l'écriture.
for flux in (sys.stdout, sys.stderr):
    try:
        flux.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def charge_env():
    """Lit .env s'il existe. Les variables d'environnement ont priorité."""
    fichier = RACINE / ".env"
    if fichier.exists():
        for ligne in fichier.read_text(encoding="utf-8").splitlines():
            ligne = ligne.strip()
            if not ligne or ligne.startswith("#") or "=" not in ligne:
                continue
            cle, _, valeur = ligne.partition("=")
            os.environ.setdefault(cle.strip(), valeur.strip().strip("'\""))


charge_env()

from _conseiller import repond, etat, indice  # noqa: E402

PORT = int(os.environ.get("MV_PORT", "5199"))


class Handler(SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(RACINE), **kwargs)

    def log_message(self, format, *args):
        if "/api/" in self.path:
            sys.stderr.write("[proxy] %s\n" % (format % args))

    def end_headers(self):
        # Serveur de développement : on ne veut jamais qu'un navigateur
        # garde en cache un .js ou un .css qu'on vient de modifier.
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def json(self, code, charge):
        corps = json.dumps(charge, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corps)))
        self.end_headers()
        self.wfile.write(corps)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/etat":
            self.json(200, etat())
            return
        super().do_GET()

    def do_POST(self):
        if self.path.split("?")[0] != "/api/chat":
            self.send_error(404)
            return

        try:
            taille = int(self.headers.get("Content-Length") or 0)
            if taille <= 0 or taille > 60000:
                raise ValueError
            entree = json.loads(self.rfile.read(taille).decode("utf-8"))
        except Exception:
            self.json(400, {"erreur": "requete_invalide"})
            return

        code, charge = repond(entree.get("messages"))
        detail = charge.pop("detail", "")

        if code != 200:
            sys.stderr.write("[proxy] %s %s\n" % (code, detail))
            aide = indice(charge.get("code", code), "")
            if aide:
                sys.stderr.write("[proxy] " + aide.replace("\n", "\n[proxy] ") + "\n")

        self.json(code, charge)


if __name__ == "__main__":
    e = etat()
    print("Maison Verveine")
    print("  http://localhost:%d" % PORT)
    if e["ia"]:
        print("  conseiller en ligne, modele : %s" % e["modele"])
    else:
        print("  PAS DE CLE : le conseiller s'affichera indisponible")
        print("  (copier .env.exemple en .env et renseigner MV_CLE)")
    print("  Ctrl+C pour arreter")
    try:
        ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
    except KeyboardInterrupt:
        print("\nArrete.")
