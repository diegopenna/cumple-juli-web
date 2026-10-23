# Mis XV · Julieta

Invitación estática para celular y escritorio. Abrir `index.html` o servir esta carpeta con `python -m http.server 4173`. Compatible con GitHub Pages, sin instalación ni compilación.

## Datos

- Fiesta: 5 de diciembre de 2026, 21:00 a 05:00 (Buenos Aires).
- Ubicación: Fray Luis Beltrán 1465, C1842 El Jagüel, Provincia de Buenos Aires. Maps: https://maps.app.goo.gl/wYBB1rsQSf2HCsVo8
- Verdes y lilas reservados; no se inventó un nivel de formalidad.
- Alias: `julieta-md`.
- WhatsApp: `5491135577619`.
- El formulario prepara el mensaje; el invitado debe enviarlo en WhatsApp. No guarda respuestas ni envía automáticamente.

## Edición

Textos y enlaces en `index.html`; fecha del contador y número de WhatsApp en `js/script.js`; colores y animaciones en `css/styles.css`. Actualizar también `assets/julieta-xv.ics` al cambiar la fecha.

Reemplazar `assets/musica.mp3` por la canción elegida, conservando el nombre. La pista inicial es una melodía instrumental original de prueba generada localmente. La música solo comienza tras elegir entrar con música o tocar el control flotante.

Fondo floral generado con la herramienta integrada ImageGen. Prompt: fondo vertical de papel artesanal pistacho, flores blancas y rosa suave en las esquinas, hojas de eucalipto y trazos dorados, centro amplio vacío, sin texto ni mariposas. Las mariposas son SVG animados en CSS, con respeto por la preferencia de movimiento reducido.

Archivos de diseño fuente y generación de la música en `tools/` cuando corresponda. La primera versión se prepara localmente para revisar antes de publicar.

## Invitaciones personalizadas

Editar `invitados.json` con códigos únicos y su descripción. Ejemplo: `?cod=Ale` (o `&cod=Ale` si hay otros parámetros). El código no distingue mayúsculas y minúsculas. Sin código aparece el formulario original con nombre; un código válido muestra la descripción en portada y confirmación, oculta el campo de nombre y usa la descripción en WhatsApp. Un código inválido o un error de carga muestra un aviso y permite escribir el nombre. Servir por HTTP para cargar el JSON. El JSON es público en una web estática.

También se aceptan rutas como `https://diegopenna.github.io/cumple-juli-web/Ale`, `/ale` o `/ALE` (con o sin barra final). GitHub Pages usa `404.html` para servir estas rutas, manteniendo la URL. Regenerar ese archivo después de modificar `index.html` con `node tools/prepare-pages.js` y subirlo junto al resto. La carpeta del proyecto en Pages debe ser `/cumple-juli-web/`. El servidor local de Python no aplica automáticamente este fallback. GitHub Pages entrega HTTP 404 en rutas personalizadas aunque la invitación se renderiza; los enlaces `?cod=Ale` siguen disponibles con HTTP 200.

## Google Sheets

La fuente principal es la planilla de Google Sheets configurada en `GUESTS_CSV_URL` (`js/script.js`). Columnas: `codigo` y `personas` (también se acepta `descripcion`). Compartir para lectura sin iniciar sesión; edición solo con los organizadores. Los códigos deben ser únicos sin distinguir mayúsculas. Los cambios se consultan al abrir una invitación personalizada, sin un nuevo deploy, sujetos a la caché de Google. Si Google falla o tarda más de 8 segundos, se usa `invitados.json` como respaldo. Esta copia NO se actualiza automáticamente; debe sincronizarse y publicarse manualmente. Si el CSV es válido pero no contiene un código, no se busca en el respaldo para evitar recuperar invitados eliminados.

## Miniatura al compartir

Metadatos Open Graph en index.html y 404.html con imagen pública `assets/invitacion-preview.jpg`. Imagen creada con ImageGen integrado: tarjeta floral pistacho, flores crema y rosa suave, nombre Julieta en caligrafía, MIS XV y fecha 5 de diciembre de 2026; texto centrado para admitir recortes. Publicar también el JPG. Para mayor compatibilidad de vista previa compartir `/?cod=Ale`: responde HTTP 200; `/Ale` depende de 404.html y algunos rastreadores pueden omitir la miniatura. La vista previa no incluye los nombres de destinatarios y su actualización depende de la caché de la aplicación.
