# Checklist de validación de contenido — Mediastream Academy

**Objetivo:** que un senior de soporte confirme los datos operativos internos que NO se pueden verificar por internet.
Marca cada punto y, si algo está mal, escribe la corrección al lado. Yo ajusto el contenido y los quizzes con lo confirmado.

**Leyenda:** `[ ]` por revisar · `[x]` correcto · `[!]` corregir (anota el valor real)

> Nota: los datos abajo provienen del PDF de inducción que se subió. Ese PDF ya tenía al menos un dato inventado
> (los "seis valores", cuando los reales son *honestidad, pasión y transparencia*), por eso pedimos validar todo.

---

## Día 1 — Bienvenida y cómo trabajamos
- [ ] Mediastream: líder en streaming **desde 2007**, fundada por **Luis Ahumada**, sede **Santiago de Chile**, **+300 clientes** en LatAm y Europa. *(verificado en web pública)*
- [ ] Valores: **honestidad, pasión, transparencia**. *(verificado en web pública)*
- [ ] Canales: **Slack** interno · **Intercom** clientes · **correo** casos específicos · **Calendar** eventos/tareas + reuniones ocasionales. *(confirmado por Santiago)*

## Día 2 — Fundamentos de streaming
- [ ] Bitrate 1080p@30fps recomendado: **3.000–6.000 kbps** (¿usan ese rango como referencia interna?)
- [ ] Audio óptimo: **128 kbps AAC**
- [ ] HLS y SRT descritos como distribución vs contribución *(estándar de industria)*

## Día 3 — Ecosistema (Platform, CDN, Player, Encoder)
- [ ] Latencia HLS estándar: **10–30 s**
- [ ] TTL de caché CDN de ejemplo: **5–60 min** / se resuelve con purge
- [ ] Ingest en vivo por **RTMP o SRT**
- [ ] Componentes de software de la Platform — descripciones de **Platform_App, Embed, Tracker, Webchannel** son una aproximación mía por nombre, no confirmadas *(agregado 2026-07-14, vienen de la hoja "Entrenamiento Soporte")*

## Día 4 — Soporte e Intercom  ⚠️ (SLAs internos, revisar con cuidado)
- [ ] Prioridades y tiempos: **P1 <15 min · P2 <2 h · P3 <24 h · P4 <48 h**
- [ ] Escalamiento: **N1 (tú) → N2 (senior) → N3 (Ingeniería/DevOps)**
- [ ] Campos de categorización obligatorios en Intercom: **Tipo de ticket, Cliente, Módulo, Consulta frecuente**
- [ ] Valores de "Tipo de ticket": Consulta Cliente / Solucionado primer nivel / Problema Lado Cliente / Escalamiento Mediastream / Monitoreo / Reportado Por Soporte
- [ ] Nombres de clientes usados como ejemplo (Caracol, Megamedia, TVN, América TV, Grupo Fórmula): ¿ok usarlos?
- [ ] Regla de HOLD < 5 minutos (¿existe?)
- [ ] Base de conocimiento del equipo: ¿dónde vive (Notion/Confluence/Drive/otro) y cómo se actualiza? *(agregado 2026-07-14, viene de la hoja "Entrenamiento Soporte")*

## Día 5 — Encoders y conectividad
- [ ] Elemental **Live** = vivo · Elemental **Server** = transcodificación VOD *(estándar AWS)*
- [ ] Herramientas de acceso: **VPN + WinSCP (SFTP puerto 22)**
- [ ] Reglas de acceso remoto (gestor de contraseñas, autorización previa, documentar, cerrar sesión) — ¿coinciden con su política real?

## Día 6 — Módulo Media
- [ ] Límite de subida: **20 GB por archivo**
- [ ] Duración máxima: **11 h 59 min 59 s**
- [ ] Formatos soportados (lista del PDF): avi, mpg, mpeg, 3gp, flv, f4v, mp4, m4v, mkv, mov, mxf, wmv, mp3, aac, m4a, wav, ogg, wma
- [ ] Transcodifica a **MP4 (H.264)**, perfiles **144p→1080p**
- [ ] 4K (2160p): conserva original, reproducción **máx. 1080p**
- [ ] Estados: Uploading / Processing / Ready / Error
- [ ] Papelera (Trash) recupera o borra definitivamente

## Día 7 — Live y Live Editor  ⚠️ (muchos números específicos)
- [ ] Grabación: **máx. 3 h RTMP** / **máx. 5 h 59 m 59 s HLS** (Cloud Transcoding)
- [ ] Live Editor: movimiento fino **12 ms por clic**, **máx. 9 cortes** por proceso, **máx. 6 h** por clip
- [ ] Requiere **DVR/retención activo**
- [ ] **Regla de Zonas**: publicación del Live debe coincidir con zona de la cuenta (CL, US, BR…)
- [ ] Excepción: **Audio y Cloud Transcoding (AWS MediaLive) siempre en zona US**
- [ ] Modos de búsqueda: Live / Date Picker; marcadores I/O/C

## Día 8 — FAST, Schedules y Blackouts
- [ ] América TV: bloques **6 h L–V**; fin de semana **7 + 9 + 8 h**
- [ ] Ad breaks de **120 s**; episodios **35–45 min**
- [ ] Maniobra de continuidad con **OBS + POST JSON por API (JWT)**
- [ ] Error de colisión: *"There are already scheduled dates in the period you entered"*
- [ ] Blackout: bloques **is_blackout: true**
- [ ] IDs de canal de América TV (AFHS / Novelas) — ¿ok mantenerlos como ejemplo?

## Día 9 — Módulo Next / OTT
- [ ] Tipos de acceso: **Free / Registration / Invitation / Purchase**
- [ ] **CRÍTICO:** Purchase **reemplaza** el CSV; Invitation **acumula**
- [ ] Title Heading: Web **1920×300** / Mobile **1024×300**
- [ ] Custom Attribute **'Redirect To'** para colecciones

## Día 10 — Player y Monetización
- [ ] Autoplay requiere **Mute on Start**
- [ ] DAI (server-side, no bloqueable) vs SGAI (reproductor secundario sincronizado)
- [ ] SGAI: formatos **Side-by-Side / Full Screen** (estático, se cambia manual)
- [ ] Ad Unit en GAM: **1280×720 o 640×480**
- [ ] Ads sticky **728×90**, interstitial **800×600 / 320×480**
- [ ] Actualizar ads: subir **ads.txt** + **Publish**
- [ ] SCTE-35 marca puntos de anuncio *(estándar)*

## Día 11 — Feeds y sindicación
- [ ] Endpoints Feed JSON: `/feed/apps/{id}/category|media|season/{show_id}`
- [ ] Flags: **modules.app_feed = true** y **feeds.enabled = true**
- [ ] RSS podcast requiere **is_published: true** + audio disponible
- [ ] MRSS: metadato **google_dai** → Ad **ad-insertion-google**; cuepoints de Tracks **isAd: true**
- [ ] EPG expone grilla en vivo

## Día 12 — Watchfolders / Elemental Server
- [ ] Flujo: Watchfolder → Elemental Server (Job) → Output → Platform publica
- [ ] Parámetros: **Input Path / Output Path / Archive Path / Job Template**
- [ ] Job Queue: **Verde=éxito, Naranja=alerta, Rojo=error**
- [ ] Error común: sin Archive Path se reprocesan los mismos archivos

## Día 13 — APIs, metadatos y MCP
- [ ] Endpoints ejemplo: **GET/POST/PUT/DELETE /v1/medias**, auth **Bearer token / API Key**
- [ ] ID3 para nombre de canción en radio online
- [ ] Servidor **MCP**: `https://mcp.platform.mediastre.am` con getLiveStreamList / getMediaList / queryAnalytics *(la URL aparece como real)*
- [ ] Analytics API: `metrics.mdstrm.com/outbound/v1/metric/api`, header **X-API-Token**, cuota **2 TB/mes**, límite consulta 1 mes

## Día 14 — Monitoreo, QoE y Analytics (Elecard Boro)
- [ ] Alta en Boro: protocolo entrada **OTT**, nomenclatura `[TIPO] - [CUENTA]: [CONTEXTO] - [NOMBRE_LIVE] | [PROVEEDOR] - [ID_LIVE]` (V/R)
- [ ] Alarmas/webhooks: Video **'soporte' / 'soporte_boro'** · Audio **'SoporteAudio' / 'soporte_boro_Audio'**
- [ ] QoE Video: Video Freeze Detection + Thumbnails Capture · Audio: Loudness + Decodability
- [ ] Alarmas: Input Loss / Bitrate Drop / Audio Silence / Black Frame / Segment Missing
- [ ] Analytics Now vs Performance (métricas listadas)
- [ ] Crashlytics: óptimo **97–99 %**, se detiene rollout bajo **95 %**

## Día 15 — Operaciones avanzadas y diagnóstico
- [ ] Playout: loop/lineal, transiciones, SCTE-35
- [ ] Blackout: flujo (informar → geo-block → slate → probar con VPN → monitorear → desactivar)
- [ ] Capas de caché: **CDN / Browser / Platform / Player**
- [ ] Regla práctica: Ctrl+F5 y esperar antes de declarar bug
- [ ] Pasos de diagnóstico de "el video no carga"

---

### Cómo devolverme esto
Puedes:
1. Editar este archivo marcando `[x]` / `[!]` con la corrección, y avisarme; o
2. Simplemente decirme por chat "Día 7: la grabación HLS son 6h, no 5h59" y yo corrijo.

Cuando me confirmes, actualizo el `html` del día y las preguntas del quiz afectadas.
