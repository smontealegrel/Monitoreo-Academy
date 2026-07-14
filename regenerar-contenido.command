#!/bin/bash
# Regenera el bundle de contenido tras editar los archivos .json de /contenido.
# Solo lo usa el administrador (Santiago) en su Mac, cuando cambia el contenido.
cd "$(dirname "$0")" || exit 1
echo "Regenerando bundle de contenido..."
python3 construir-bundle.py
echo ""
echo "Listo. Ya puedes compartir la carpeta; los nuevos verán el contenido actualizado."
read -r -p "Presiona Enter para cerrar."
