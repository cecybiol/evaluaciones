# Quiz con modo seguro (HTML)

Un examen de opción múltiple en un único archivo HTML, sin backend. Bloquea copiar/pegar y clic derecho, exige pantalla completa, muestra un cuadro de diálogo inicial con las reglas que el alumno debe aceptar, y **cierra y envía el examen automáticamente ante el primer cambio de pestaña, pérdida de foco, minimización o salida de pantalla completa** (modo estricto, activado por defecto).

## Archivos

- `index.html` — todo el examen (HTML + CSS + JS en un solo archivo, sin dependencias externas salvo las tipografías de Google Fonts).
- `Code.gs` — script de Google Apps Script opcional para recibir los resultados en una Google Sheet y, opcionalmente, por correo.
- `questions.example.js` — ejemplo de archivo externo de preguntas en JS (renombrar a `questions.js` para usarlo).
- `questions.example.csv` — ejemplo de archivo externo de preguntas en CSV, de Matemática (para armar exámenes desde una planilla).
- `historia.example.csv` — segundo ejemplo de CSV, de Historia, usado en la sección "Varias materias con código de acceso" para mostrar el caso de dos exámenes distintos en una misma plataforma.

## Varias materias en una misma plataforma, con código de acceso

Si querés usar este mismo `index.html` para tomar exámenes de más de una materia (cada una con su propio código para que el alumno acceda), configurá `CONFIG.ACCESS_CODES_ENABLED: true` y completá el array `CONFIG.EXAMS` con un elemento por materia:

```js
ACCESS_CODES_ENABLED: true,

EXAMS: [
  {
    code: "MHSEPTIMO26",
    title: "Examen de Mantenimiento de Hardware",
    instructions: "Examen 2t : Proceso de Arranque, FUente de Alimentacion, Diagnostico y Fallas.",
    timeLimitMinutes: 70,
    passingPercent: 60,
    questionsCsvUrl: "hardware.csv"   // o "questions": [ ... ] con preguntas inline
  },
  {
    code: "HIST2026",
    title: "Examen de Historia",
    instructions: "Unidad 3: Revolución Industrial.",
    timeLimitMinutes: 30,
    passingPercent: 60,
    questionsCsvUrl: "historia.csv"
  }
]
```

Con esto configurado, antes de ver cualquier otra cosa, el alumno ve una pantalla que le pide un código. Si escribe `MATE2026`, se le carga el examen de Matemática (título, instrucciones, tiempo y preguntas propias); si escribe `HIST2026`, el de Historia. Un código que no coincide con ninguno muestra un error y deja reintentar.

**Campos que podés definir por examen** (todos opcionales — el que no pongas usa el valor global de `CONFIG` de más arriba como respaldo):

| Campo | Qué hace |
|---|---|
| `code` | El código que el alumno tiene que escribir (obligatorio, no distingue mayúsculas/minúsculas ni espacios al principio/final) |
| `title` | Título de ese examen |
| `instructions` | Texto introductorio de ese examen |
| `timeLimitMinutes` | Duración de ese examen |
| `passingPercent` | Porcentaje mínimo para "Aprobado" en ese examen |
| `questionsCsvUrl` | CSV propio de esa materia (recomendado si cada materia la arma un profesor distinto — ver "Automatizar la carga de preguntas") |
| `questions` | Alternativa a `questionsCsvUrl`: preguntas inline, mismo formato que `CONFIG.QUESTIONS` |

**Para probar el ejemplo tal cual está:** subí `index.html` junto con `questions.example.csv` y `historia.example.csv` (renombrados a `matematica.csv` y `historia.csv`, o ajustá las URLs en `EXAMS`) a tu hosting, activá `ACCESS_CODES_ENABLED` y descomentá el array `EXAMS` de arriba — ya viene con esos dos códigos de ejemplo comentados en `index.html`, listos para editar.

**Sobre la planilla de resultados:** cada fila ahora incluye una columna "Materia" con el título del examen rendido, así que en una sola planilla podés distinguir qué resultado corresponde a cada materia. Si ya tenías una planilla en uso de una versión anterior de este proyecto (sin esa columna), las filas viejas van a quedar tal cual, pero te conviene agregar manualmente el encabezado "Materia" en la columna B para que las filas nuevas queden alineadas con las viejas — o simplemente empezá una pestaña/planilla nueva.

**Importante — esto no es un sistema de login seguro.** Es un único archivo HTML sin backend: cualquiera que abra las herramientas de desarrollador del navegador (F12) puede ver el código fuente completo, incluidos los códigos de acceso y las preguntas de **todas** las materias configuradas, no solo la que está rindiendo. El código de acceso sirve para que el link no quede abierto a cualquiera que lo encuentre (por ejemplo, googleado o reenviado sin querer) — no para separar de forma segura el contenido entre grupos de alumnos con conocimientos técnicos. Si necesitás esa separación real (que un alumno de Matemática no pueda ver ni por error las preguntas de Historia inspeccionando el código), la alternativa más segura sigue siendo un archivo `index.html` por materia (podés seguir usando `ACCESS_CODES_ENABLED` con un solo código en cada uno, como contraseña extra), como se explica en "Cómo subirlo a GitHub".

## Modo estricto (zero tolerance) vs. modo tolerante

Por defecto, `CONFIG.ZERO_TOLERANCE = true`: **cualquiera** de estos eventos cierra el examen de inmediato y envía las respuestas tal cual estaban en ese momento, sin margen:

- Cambiar de pestaña o de aplicación.
- Minimizar la ventana.
- Que la ventana del examen pierda el foco (por ejemplo, hacer clic en otra ventana sin llegar a taparla del todo).
- Salir de la pantalla completa (si `REQUIRE_FULLSCREEN` está activo).

Si preferís el comportamiento anterior (tolerar unos pocos incidentes antes de auto-enviar), poné `ZERO_TOLERANCE: false` y configurá `MAX_WARNINGS` con la cantidad de incidentes permitidos.

## Cuadro de diálogo inicial

Antes de ver la pantalla de inicio, el alumno ve un cuadro de diálogo que lista explícitamente qué no puede hacer durante el examen, y tiene que tildar una casilla de "Entiendo estas condiciones..." para poder continuar. El botón para avanzar queda deshabilitado hasta que la casilla esté marcada.

## Valores que podés configurar

Todos están al principio del `<script>` de `index.html`, en el objeto `CONFIG`:

| Valor | Qué hace |
|---|---|
| `TITLE` | Título del examen (aparece en pantalla y en la pestaña del navegador) |
| `INSTRUCTIONS` | Texto introductorio en la pantalla de inicio |
| `TIME_LIMIT_MINUTES` | Duración total. Al llegar a 0, se envía solo |
| `ZERO_TOLERANCE` | `true` (por defecto): cualquier incidente cierra el examen de inmediato. `false`: usa el modo tolerante con `MAX_WARNINGS` |
| `MAX_WARNINGS` | Solo se usa si `ZERO_TOLERANCE` es `false`: cuántas salidas se toleran antes de auto-enviar |
| `REQUIRE_FULLSCREEN` | Si exige pantalla completa para rendir |
| `SHUFFLE_QUESTIONS` / `SHUFFLE_OPTIONS` | Orden aleatorio de preguntas y de opciones |
| `PASSING_PERCENT` | Porcentaje mínimo para figurar como "Aprobado" |
| `SHOW_REVIEW_AT_END` | Si al final se muestra qué respondió el alumno vs. la respuesta correcta |
| `COLLECT_STUDENT_EMAIL` | Si pide correo institucional además del nombre (ver "Correo institucional del alumno y aviso de resultados") |
| `STUDENT_EMAIL_DOMAIN` | Dominio obligatorio para ese correo (ej. `"@sanluis.edu.ar"`), o `""` para no exigir ninguno |
| `SHEET_WEB_APP_URL` | URL del Web App de `Code.gs` para mandar resultados a una Sheet / correo |
| `QUESTIONS_CSV_URL` | URL o ruta de un CSV externo con las preguntas (ver más abajo) |
| `QUESTIONS` | Array de preguntas por defecto (se usa si no hay CSV ni `questions.js`). Ver "Tipos de pregunta" más abajo para el formato de cada una |

## Tipos de pregunta

Además de la opción múltiple clásica, el examen soporta preguntas de selección múltiple, verdadero/falso, ordenar ítems, y respuesta libre. El campo `type` de cada pregunta define cuál es (si se omite, se usa `"single"`). Aplica igual para las tres formas de cargar preguntas: el array `QUESTIONS` dentro de `index.html`, un `questions.js` externo, o un CSV.

| Tipo (`type`) | Qué es | Campos propios |
|---|---|---|
| `single` (o sin `type`) | Opción múltiple, una sola correcta | `options`: array de textos. `correct`: índice de la correcta, empieza en 0 |
| `boolean` | Verdadero / Falso | `correct`: `true` o `false` |
| `multiple` | Selección múltiple, una o más correctas | `options`: array de textos. `correct`: array de índices correctos (0-based). Se exige marcar **todas** las correctas y ninguna incorrecta para tenerla como bien |
| `order` | Ordenar ítems (el alumno los reordena con flechas ▲▼) | `items`: array de textos **en el orden correcto**. Al alumno se le muestra barajado |
| `text` | Respuesta libre / párrafo | Sin campos extra. **No se corrige de forma automática**: no suma ni resta al puntaje, y el profesor la lee en la planilla (columna de detalle) para corregirla a mano |

Ejemplo de cada tipo dentro de `CONFIG.QUESTIONS` (mismo formato en `questions.js`):

```js
QUESTIONS: [
  {
    question: "¿Cuál es la capital de Francia?",
    options: ["Madrid", "París", "Roma", "Lisboa"],
    correct: 1
  },
  {
    type: "boolean",
    question: "Python es un lenguaje de programación.",
    correct: true
  },
  {
    type: "multiple",
    question: "¿Cuáles de estos son planetas del sistema solar?",
    options: ["Marte", "Plutón", "Júpiter", "Sirio"],
    correct: [0, 2]
  },
  {
    type: "order",
    question: "Ordená estos planetas de más cercano a más lejano del Sol.",
    items: ["Mercurio", "Venus", "Tierra", "Marte"]
  },
  {
    type: "text",
    question: "Explicá con tus palabras por qué el cielo se ve azul."
  }
]
```

**Sobre el puntaje:** las preguntas de tipo `text` quedan afuera del cálculo de porcentaje y de "Aprobado/No aprobado" (no hay forma de corregirlas solas). Si el examen tiene *solo* preguntas de tipo `text`, la pantalla de resultados directamente indica que se necesita revisión manual, sin puntaje. El resto de los tipos (`single`, `boolean`, `multiple`, `order`) sí se corrigen y puntúan automáticamente.

## Imagen en una pregunta

Cualquier pregunta, sin importar su tipo, puede llevar una imagen: agregale el campo `image` con una URL.

```js
{
  question: "¿A qué país pertenece esta bandera?",
  image: "https://ejemplo.com/bandera.png",
  options: ["Argentina", "Uruguay", "Chile", "Paraguay"],
  correct: 0
}
```

- Tiene que ser una **URL** (subida a algún hosting: GitHub, Google Drive con link público, Imgur, etc.), no un archivo local — el examen es un único HTML sin backend, así que no hay dónde "subir" una imagen propia.
- Si la URL no carga (link roto, sin conexión), el examen avisa en pantalla en vez de dejar un hueco vacío.
- En el CSV, es la columna `imagen` (dejala vacía si esa pregunta no lleva imagen). En `questions.js`, es el campo `image` de cada pregunta.

## Automatizar la carga de preguntas (CSV o JS externo)

Para no tener que editar `index.html` cada vez que cambian las preguntas, hay dos formas de cargarlas desde afuera. Se evalúan en este orden de prioridad:

### Opción 1 — Archivo `questions.js` (recomendada, no necesita servidor)

1. Copiá `questions.example.js`, renombralo a `questions.js`.
2. Ponelo en la misma carpeta que `index.html`.
3. Editá el array `QUIZ_QUESTIONS` con tus preguntas: `question` (texto), `options` (array de 2 a 6 textos), `correct` (índice de la opción correcta, empezando en 0).
4. Listo. `index.html` lo detecta solo. Esto funciona incluso abriendo el `.html` con doble clic, sin necesidad de subirlo a ningún servidor.

Si el archivo no existe, no pasa nada: el examen usa el array `QUESTIONS` que está dentro de `index.html` como respaldo.

### Opción 2 — CSV externo (útil para armar preguntas desde Excel/Sheets)

1. Copiá `questions.example.csv` como base. Columnas: `tipo`, `pregunta`, `imagen` (opcional), `opcion1`, `opcion2`, ... (hasta `opcion6`), `correcta`.
2. Si un texto tiene comas dentro (por ejemplo, "¿Cuántos... (definición actual, sin Plutón)?"), encerralo entre comillas dobles en el CSV.
3. Subí ese CSV a algún lugar accesible por URL (el mismo repositorio de GitHub Pages sirve; también funciona una hoja de Google Sheets publicada como CSV, o cualquier hosting estático).
4. En `index.html`, completá `CONFIG.QUESTIONS_CSV_URL` con esa URL (por ejemplo `"preguntas.csv"` si está al lado del `index.html`, o una URL completa).

**Columna `tipo`** — define qué tipo de pregunta es esa fila. Si la dejás vacía (o no incluís la columna), se asume opción única, para que los CSV viejos sigan funcionando sin cambios. Valores válidos y cómo usar `opcion1..6` / `correcta` en cada caso:

| `tipo` | `opcion1..6` | `correcta` |
|---|---|---|
| `opcion_unica` (o vacío) | las opciones | N° de la opción correcta, **empezando en 1** |
| `opcion_multiple` | las opciones | N°s de las opciones correctas separados por `\|`, ej. `1\|3` |
| `verdadero_falso` | (se ignoran, dejalas vacías) | `verdadero` o `falso` |
| `ordenar` | los ítems **en el orden correcto** | (se ignora, dejala vacía) |
| `parrafo` | (se ignoran, dejalas vacías) | (se ignora, dejala vacía) |

Mirá `questions.example.csv` para un ejemplo de cada tipo ya armado.

**Importante:** esta opción usa `fetch()`, que requiere servir el sitio por `http(s)://` (por ejemplo GitHub Pages). Si abrís el `.html` directo con doble clic (`file://`), el navegador bloquea esa carga por seguridad y el examen cae automáticamente al `questions.js` o al array `QUESTIONS` interno. Para uso 100% local sin servidor, usá la Opción 1 (`questions.js`).

Si `QUESTIONS_CSV_URL` está vacío, se ignora esta opción y se pasa directo a `questions.js` / `QUESTIONS`.

## ¿Funciona en celulares?

Sí, es responsive y usable en el navegador del celular. Con una salvedad importante:

- **Android (Chrome/Firefox):** la pantalla completa forzada funciona igual que en escritorio.
- **iPhone/iPad (Safari):** iOS no permite forzar pantalla completa en páginas web comunes (solo en videos), así que esa protección puntual no aplica ahí. El resto sí funciona igual: detección de cambio de app/pestaña, pérdida de foco, bloqueo de copiar/pegar, temporizador, etc. El propio quiz detecta esto y le avisa al alumno al empezar.

## Recibir resultados en una planilla y por correo (Google Sheets)

El quiz puede mandar cada resultado a una Google Sheet tuya en cuanto el alumno termina (ya sea porque finalizó normalmente, se le acabó el tiempo, o el examen se cerró solo por una violación), con aviso por correo a una cuenta que vos configurás. Es gratis y no requiere backend propio, con `Code.gs` (Google Apps Script).

**Pasos:**

1. Creá una Google Sheet nueva y vacía (la que va a acumular los resultados).
2. Andá a **Extensiones → Apps Script**.
3. Borrá el código de ejemplo que trae por defecto y pegá el contenido de `Code.gs`.
4. Completá `TEACHER_EMAIL` con el correo (o correos, separados por coma) que vas a usar para recibir los avisos. `SEND_EMAIL_NOTIFICATION` ya viene en `true` por defecto — si `TEACHER_EMAIL` queda vacío, simplemente no se manda ningún correo (los resultados igual se guardan en la planilla).
5. Guardá (ícono de disquete o `Ctrl+S`).
6. **Implementar → Nueva implementación**. Elegí tipo "Aplicación web", con:
   - Ejecutar como: **Yo** (tu cuenta)
   - Quién tiene acceso: **Cualquier usuario**
7. Google va a pedirte autorizar permisos (el script necesita escribir en la planilla y enviar correos). Aceptá con tu cuenta.
8. Copiá la URL que termina en `/exec`.
9. Pegá esa URL en `SHEET_WEB_APP_URL` dentro de `index.html`.

Cada vez que un alumno termina el examen (por tiempo, por una violación detectada, o por "Finalizar"), se agrega una fila con fecha, nombre, correo (si `COLLECT_STUDENT_EMAIL` está activo), puntaje, porcentaje, si aprobó, cuántas advertencias tuvo, **el motivo de finalización** (normal / tiempo agotado / cerrado por actividad no permitida), el detalle de qué respondió en cada pregunta, y columnas para el seguimiento de la corrección (`Corregido`, `Nota final (manual)`, `Comentario docente`, `Resultado enviado`). Si activaste el correo, te llega un aviso con ese mismo resumen apenas se envía. Ver "Correo institucional del alumno y aviso de resultados" más abajo para el detalle de cómo mandarle el resultado final al alumno una vez corregido.

Si más adelante modificás `Code.gs`, tenés que volver a **Implementar → Administrar implementaciones → Editar → Nueva versión** para que los cambios se apliquen (la URL se mantiene igual).

**¿Te aparece el error `Cannot read properties of undefined (reading 'postData')`?** Es porque corriste `doPost` apretando ▶ directamente en el editor, en vez de que lo llame una solicitud real. Para probar el guardado en la planilla (y el correo) sin usar el examen, elegí la función `probarEnvioDePrueba` en el desplegable de funciones (al lado del botón ▶) y ejecutala — simula una entrega real con datos de prueba.

### Si no te está llegando nada a la planilla ni al correo

Antes de nada, usá el botón **"Probar conexión con la planilla"** que aparece en la pantalla de inicio del examen (solo se muestra si completaste `SHEET_WEB_APP_URL`). Te dice al toque si el link funciona, si el aviso por correo está activado, y si falta configurar `TEACHER_EMAIL` — sin tener que rendir el examen entero para enterarte. Requiere que tu `Code.gs` incluya la función `doGet` (está en la versión más reciente de este archivo).

Si aun así no funciona, revisá en orden:

1. **¿`SHEET_WEB_APP_URL` está completo en `index.html`?** Si quedó vacío (`""`), el examen ni siquiera intenta mandar nada — es el motivo más común.
2. **¿Volviste a implementar después de editar `Code.gs`?** Cada cambio en el código requiere **Implementar → Administrar implementaciones → Editar (ícono de lápiz) → Nueva versión**. Si solo guardás con `Ctrl+S` pero no creás una nueva versión, el Web App sigue corriendo el código viejo.
3. **¿El deployment tiene acceso "Cualquier usuario"?** Si quedó en "Solo yo" o restringido a tu organización, las solicitudes del examen (que corren en el navegador del alumno, sin su cuenta de Google) van a fallar silenciosamente.
4. **¿Completaste `TEACHER_EMAIL` en `Code.gs`?** Por defecto viene vacío — si no le pusiste tu correo, la planilla SÍ se llena pero nunca se manda ningún email. No es un bug, es a propósito (para no obligarte a poner un correo si no lo querés), pero es la causa más común de "no me llega el correo" cuando la planilla sí se está llenando.
5. **Revisá la carpeta de spam** del correo que pusiste en `TEACHER_EMAIL`.
6. **Mirá el historial de ejecuciones**: en el editor de Apps Script, panel izquierdo → **Ejecuciones** (ícono de reloj). Ahí ves cada vez que se llamó a `doPost`/`doGet` y, si algo falló del lado del servidor, el error exacto.

Como el envío desde el examen usa `fetch(..., {mode:'no-cors'})` (necesario porque Apps Script no soporta el preflight de CORS normal), el navegador del alumno **nunca sabe si en verdad funcionó** — por eso, para diagnosticar, conviene usar el botón de prueba o mirar directamente el historial de ejecuciones en Apps Script, en vez de confiar en lo que dice el examen.

**Nota técnica:** el envío usa `fetch(..., {mode:'no-cors'})` porque Apps Script no maneja el "preflight" que exige el modo normal de CORS. Esto significa que el quiz no puede confirmar con certeza que Google procesó el dato — solo si la solicitud salió de la red o no. Por eso, si `SHOW_REVIEW_AT_END` está activo, el alumno también ve su resultado en pantalla como respaldo.

## Correo institucional del alumno y aviso de resultados

Además del nombre, el examen puede pedirle al alumno su correo institucional (validando el dominio) y usarlo para mandarle, por correo, la confirmación de que entregó el examen y — más adelante, cuando vos lo corrijas — su resultado final.

**Configuración en `index.html`:**

| Valor | Qué hace |
|---|---|
| `COLLECT_STUDENT_EMAIL` | Si es `true` (por defecto), pide el correo junto con el nombre antes de "Comenzar examen" |
| `STUDENT_EMAIL_DOMAIN` | Dominio institucional obligatorio, con el `@` incluido (ej. `"@sanluis.edu.ar"`). El examen no deja avanzar si el correo no termina exactamente con ese dominio. Dejalo en `""` para aceptar cualquier correo válido, sin restricción |

Esto no reemplaza nada de lo explicado en "Recibir resultados en una planilla": sigue siendo `Code.gs` el que hace todo el trabajo del lado del servidor. Con el correo del alumno sumado, `Code.gs` ahora hace dos envíos distintos:

### 1. Confirmación de entrega (automática, inmediata)

Apenas el alumno termina el examen (normal, por tiempo, o por una violación), si cargó un correo válido recibe un mail confirmando que la entrega llegó — **sin la nota**, para no revelar el resultado antes de que lo revises. Se controla con `SEND_STUDENT_CONFIRMATION_EMAIL` en `Code.gs` (`true` por defecto).

### 2. Resultado final (manual, cuando vos lo decidas)

La planilla ahora tiene columnas nuevas: `Email`, `Corregido`, `Nota final (manual)`, `Comentario docente`, `Resultado enviado` y `Fecha envío resultado`.

- Si el examen **no tiene preguntas de tipo `text`** (100% autocorregido), la fila llega con `Corregido = Sí` de una, así que podés mandar el resultado apenas quieras.
- Si el examen **sí tiene preguntas de tipo `text`** (desarrollo), la fila llega con `Corregido = No`: revisala a mano y, cuando estés conforme, cambiá esa celda a `Sí`. Opcionalmente completá también:
  - `Nota final (manual)`: si la dejás vacía, el correo usa el puntaje automático (`Puntaje/Total`); si escribís algo acá (por ejemplo `8/10` o `Aprobado con observaciones`), eso es lo que se manda en su lugar.
  - `Comentario docente`: texto libre opcional que se agrega al correo del alumno.

Cuando tengas una o más filas listas (`Corregido = Sí` y `Resultado enviado` todavía en `No`), abrí la Google Sheet y andá al menú **📩 Exámenes → Enviar resultados a los alumnos corregidos**. Eso manda el correo de resultado a cada alumno pendiente y marca esas filas como `Resultado enviado = Sí`, para no duplicar envíos si volvés a correrlo. Al final te muestra un resumen de cuántos correos se mandaron.

> Si no ves el menú "📩 Exámenes" en la planilla, recargá la pestaña de la Google Sheet (no la del editor de Apps Script) después de pegar/actualizar `Code.gs` — el menú se crea al abrir la planilla (`onOpen`).

**Si ya tenías una planilla de una versión anterior** (sin estas columnas), las filas viejas quedan tal cual; actualizá a mano el encabezado de la fila 1 con las columnas nuevas para que las filas siguientes queden alineadas, o empezá una pestaña/planilla nueva.

## Cómo subirlo a GitHub (para compartir un link)

Es 100% estático — solo HTML/CSS/JS que corre en el navegador del alumno — así que no necesita servidor, Node, ni build:

1. Creá un repositorio nuevo en GitHub y subí `index.html` (y, si usás preguntas externas, también `questions.js` o tu CSV). Podés arrastrarlos desde la web de GitHub, o con `git add / commit / push`.
2. Andá a **Settings → Pages**.
3. En "Source" elegí la rama `main` y la carpeta `/ (root)`, guardá.
4. En un par de minutos vas a tener un link tipo `https://tu-usuario.github.io/tu-repo/` que podés compartir directamente con los alumnos.

Si querés un examen distinto por grupo o por fecha, la forma más simple es duplicar el archivo (`examen1.html`, `examen2.html`, etc.) o, mejor todavía, mantener un solo `index.html` y cambiar solo el `questions.js` o el CSV que apunta cada uno (ver "Automatizar la carga de preguntas").

## ¿Qué pasa si el alumno cierra o cambia de ventana?

- **Cambiar de pestaña/app, minimizar, o perder el foco de la ventana**: queda cubierto por el modo estricto. Se detecta al instante y el examen se cierra y envía automáticamente, sin margen (a menos que hayas puesto `ZERO_TOLERANCE: false`, en cuyo caso se tolera hasta `MAX_WARNINGS` veces).
- **Cerrar la pestaña o la ventana**: el navegador muestra su propio diálogo de confirmación ("¿Salir de este sitio?"). Ese diálogo agrega fricción pero no puede impedir que el alumno cierre si confirma — es una limitación de los navegadores modernos, no del código.
- **Si cierra de verdad**: como todo el estado del examen vive solo en la memoria de esa pestaña (y no usa almacenamiento del navegador), si la cierra sin terminar se pierde el progreso y no queda ningún registro — a menos que ya hubiera llegado a la pantalla de resultados, momento en el que el resultado ya se envió a la planilla/correo.

## Limitaciones importantes (léelas antes de usarlo para algo con peso real)

- **Nada que corra solo en el navegador es 100% infalible.** Un alumno con conocimientos técnicos puede sortear estas protecciones (por ejemplo, editando el HTML localmente, usando un segundo dispositivo para buscar respuestas, o con extensiones de navegador). Esto sube bastante la barrera y desalienta el uso casual de otra pestaña, pero no reemplaza una supervisión activa (presencial o por videollamada) si la evaluación tiene mucho peso.
- **El modo estricto es sensible por diseño**, así que puede haber algún falso positivo ocasional (por ejemplo, un clic en una notificación del sistema operativo que le quita el foco a la ventana un instante). Es una decisión de diseño explícita a pedido: se prioriza la seguridad del examen sobre la tolerancia a distracciones accidentales. Si te resulta demasiado estricto, usá `ZERO_TOLERANCE: false`.
- **Cerrar la pestaña antes de terminar pierde el progreso**, como se explica arriba — no hay forma de recuperar respuestas de un intento que nunca llegó a la pantalla final.
- El bloqueo de atajos de teclado (F12, Ctrl+Shift+I, etc.) es solo disuasorio: un usuario puede abrir igual las herramientas de desarrollador desde el menú del navegador.
- El envío a Google Sheets / correo es "mejor esfuerzo": si el alumno se queda sin conexión justo al terminar, el resultado no llega a la planilla ni al correo (aunque sí lo ve en pantalla, si `SHOW_REVIEW_AT_END` está activo).
- La carga de preguntas por CSV (`QUESTIONS_CSV_URL`) requiere que el sitio esté servido por `http(s)://`; no funciona abriendo el `.html` directamente desde el disco. Para eso, usá `questions.js`.
