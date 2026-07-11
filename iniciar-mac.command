#!/bin/bash
# Mediastream Academy — lanzador para macOS.
# Doble clic para iniciar. Levanta un servidor local y abre el navegador.

cd "$(dirname "$0")" || exit 1
PORT=8750

echo "======================================"
echo "   Mediastream Academy — Soporte"
echo "======================================"
echo "Iniciando servidor local en el puerto $PORT..."
echo "Para cerrar la plataforma: cierra esta ventana."
echo ""

# Abrir el navegador tras un breve arranque
( sleep 1 && open "http://localhost:$PORT/index.html" ) &

# Preferir Python 3; si no, usar Node
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server "$PORT"
elif command -v node >/dev/null 2>&1; then
  node -e "const h=require('http'),f=require('fs'),p=require('path'),P=$PORT;const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json'};h.createServer((q,s)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const fp=p.join(process.cwd(),u);f.readFile(fp,(e,d)=>{if(e){s.writeHead(404);s.end('404');return;}s.writeHead(200,{'Content-Type':T[p.extname(fp)]||'application/octet-stream'});s.end(d);});}).listen(P,()=>console.log('Servidor en http://localhost:'+P));"
else
  echo "ERROR: No se encontró Python 3 ni Node.js. Instala uno de los dos."
  read -r -p "Presiona Enter para salir."
fi
