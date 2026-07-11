@echo off
REM Mediastream Academy - lanzador para Windows.
REM Doble clic para iniciar. Levanta un servidor local y abre el navegador.

cd /d "%~dp0"
set PORT=8750

echo ======================================
echo    Mediastream Academy - Soporte
echo ======================================
echo Iniciando servidor local en el puerto %PORT%...
echo Para cerrar la plataforma: cierra esta ventana.
echo.

start "" "http://localhost:%PORT%/index.html"

where python >nul 2>nul
if %ERRORLEVEL%==0 (
  python -m http.server %PORT%
  goto :eof
)

where node >nul 2>nul
if %ERRORLEVEL%==0 (
  node -e "const h=require('http'),f=require('fs'),p=require('path'),P=%PORT%;const T={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json'};h.createServer((q,s)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const fp=p.join(process.cwd(),u);f.readFile(fp,(e,d)=>{if(e){s.writeHead(404);s.end('404');return;}s.writeHead(200,{'Content-Type':T[p.extname(fp)]||'application/octet-stream'});s.end(d);});}).listen(P,()=>console.log('Servidor en http://localhost:'+P));"
  goto :eof
)

echo ERROR: No se encontro Python ni Node.js. Instala uno de los dos.
pause
