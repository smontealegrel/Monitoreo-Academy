#!/usr/bin/env python3
"""
Genera contenido/contenido.js a partir de los JSON de contenido.
Esto permite que la app funcione abriendo index.html directamente (file://),
SIN servidor local, Python ni Node en el PC del usuario final.

Ejecuta este script SOLO cuando edites el contenido (los .json), para
regenerar el bundle. En Mac: doble clic en 'regenerar-contenido.command'.
"""
import json, os, glob

BASE = os.path.dirname(os.path.abspath(__file__))
CONT = os.path.join(BASE, "contenido")

def load(name):
    with open(os.path.join(CONT, name), encoding="utf-8") as f:
        return json.load(f)

bundle = {"curso": load("curso.json"), "dias": {}, "examenFinal": load("examen-final.json")}

for path in sorted(glob.glob(os.path.join(CONT, "dia-*.json"))):
    d = load(os.path.basename(path))
    bundle["dias"][str(d["id"])] = d

out = os.path.join(CONT, "contenido.js")
with open(out, "w", encoding="utf-8") as f:
    f.write("/* Bundle autogenerado por construir-bundle.py — NO editar a mano. */\n")
    f.write("/* Editar los .json y volver a ejecutar construir-bundle.py. */\n")
    f.write("window.__MDSTRM_CONTENT = ")
    # ensure_ascii=True => solo ASCII, a prueba de problemas de codificación en Windows
    json.dump(bundle, f, ensure_ascii=True, indent=1)
    f.write(";\n")

n_dias = len(bundle["dias"])
size = os.path.getsize(out)
print(f"Bundle generado: {out}")
print(f"  Días: {n_dias} | Examen final: {'sí' if bundle['examenFinal'] else 'no'} | {size//1024} KB")
