/**
 * Code.gs — pegar este código en el editor de Apps Script de una
 * Google Sheet nueva (Extensiones > Apps Script). Ver README.md,
 * sección "Recibir resultados en una planilla" y "Correo institucional
 * del alumno y aviso de resultados", para los pasos completos de
 * instalación y despliegue.
 */

// ============================================================
// CONFIGURACIÓN
// ============================================================

// Poné acá el correo que va a recibir un aviso por cada examen entregado
// (por ejemplo el del profesor/a a cargo). Podés poner varias direcciones
// separadas por coma: "profe1@colegio.edu, profe2@colegio.edu".
// Dejalo vacío ("") si no querés avisos por correo (los resultados
// igual se guardan en la planilla en cualquier caso).
const TEACHER_EMAIL = "biolatti.cecilia@sanluis.edu.ar";

// true para activar el aviso por correo al profesor (recomendado, ya
// que el examen puede cerrarse solo por una violación y conviene
// enterarse al toque), false para no enviar avisos y solo guardar en
// la planilla.
const SEND_EMAIL_NOTIFICATION = true;

// true para mandarle automáticamente al ALUMNO un correo de
// confirmación apenas entrega el examen (no incluye la nota: solo
// confirma que la entrega llegó bien). Requiere que index.html tenga
// CONFIG.COLLECT_STUDENT_EMAIL en true y que el alumno haya cargado su
// correo. Si acá lo ponés en false, no se manda ese correo aunque el
// alumno sí haya cargado su dirección (la fila igual se guarda con su
// email, por si querés mandarlo vos a mano).
const SEND_STUDENT_CONFIRMATION_EMAIL = true;


// ============================================================
// No hace falta tocar nada de acá para abajo
// ============================================================

// Encabezado de la planilla.
const HEADER = [
  "Fecha", "Materia", "Alumno", "Email", "Puntaje", "Total", "Porcentaje",
  "Aprobado", "Advertencias", "Salidas breves (margen de gracia)",
  "DevTools sospechado (heurística)", "Motivo de finalización",
  "Detalle de respuestas",
  "Corregido", "Nota final (manual)", "Comentario docente",
  "Resultado enviado", "Fecha envío resultado"
];

// Se fija que la fila 1 tenga TODAS las columnas de HEADER (incluida
// "Email") y devuelve el encabezado real de la planilla, en el orden en
// que están hoy sus columnas.
//
// Por qué existe esto: si en algún momento se armó la planilla con una
// versión anterior de este script (por ejemplo sin columna "Email"), el
// código viejo hacía sheet.appendRow([...]) con una lista de valores en
// un orden fijo — eso escribe cada dato en la posición de columna que
// le toca según el ARRAY, no según lo que dice el encabezado real de la
// fila 1. Si la fila 1 le faltaba una columna (p. ej. "Email"), todos
// los datos de ahí en más quedaban corridos una posición, y el correo
// del alumno terminaba pisado por otro dato o directamente afuera de la
// planilla. Con esta función el encabezado se autocompleta la primera
// vez que hace falta, y más abajo escribimos cada dato buscando la
// columna por NOMBRE (buildRowByHeader), así que da lo mismo el orden o
// si a la planilla le faltaba alguna columna: nunca más se corre.
function ensureHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
    return HEADER.slice();
  }

  const lastCol = Math.max(sheet.getLastColumn(), 1);
  let header = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  while (header.length && header[header.length - 1] === "") header.pop();

  const columnasFaltantes = HEADER.filter(h => header.indexOf(h) === -1);
  if (columnasFaltantes.length) {
    header = header.concat(columnasFaltantes);
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  }
  return header;
}

// Arma la fila a insertar respetando el orden REAL de columnas de la
// planilla (el que devuelve ensureHeader), no un orden fijo. Cualquier
// columna del encabezado que no tenga un valor definido en
// valoresPorColumna queda vacía (por ejemplo columnas propias que el
// profesor haya agregado a mano).
function buildRowByHeader(header, valoresPorColumna) {
  return header.map(col => {
    const v = valoresPorColumna[col];
    return (v === undefined || v === null) ? "" : v;
  });
}

function doPost(e) {
  // Si ves el error "Cannot read properties of undefined (reading
  // 'postData')" es porque corriste doPost desde el botón ▶ del editor
  // en vez de mandarle una solicitud real. Usá "probarEnvioDePrueba()"
  // de más abajo para probar sin necesidad del examen real.
  if (!e || !e.postData) {
    throw new Error(
      "doPost no recibió una solicitud real (e.postData vacío). " +
      "Esto pasa si lo ejecutás manualmente desde el editor. Para probar " +
      "el guardado sin usar el examen, corré la función 'probarEnvioDePrueba' " +
      "en su lugar (menú de funciones arriba, al lado de ▶ Ejecutar)."
    );
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  const header = ensureHeader(sheet);

  // Si el examen no tiene preguntas de desarrollo ("text"), está 100%
  // autocorregido y no necesita revisión manual: se marca "Corregido"
  // de una para que puedas mandar el resultado apenas quieras (menú
  // "Enviar resultados a los alumnos corregidos"). Si tiene preguntas
  // de desarrollo, queda "No" hasta que las revises y cambies esta
  // columna a "Sí" en la planilla (opcionalmente completando también
  // "Nota final (manual)" y "Comentario docente").
  const corregidoInicial = data.hasManualQuestions ? "No" : "Sí";

  sheet.appendRow(buildRowByHeader(header, {
    "Fecha": data.timestamp || new Date().toISOString(),
    "Materia": data.exam || "(sin especificar)",
    "Alumno": data.student || "(sin nombre)",
    "Email": data.email || "",
    "Puntaje": data.score,
    "Total": data.total,
    "Porcentaje": (data.percent || 0) + "%",
    "Aprobado": data.passed ? "Sí" : "No",
    "Advertencias": data.warnings || 0,
    "Salidas breves (margen de gracia)": data.quickExits || 0,
    "DevTools sospechado (heurística)": data.devToolsSuspected || 0,
    "Motivo de finalización": data.closeReason || "",
    "Detalle de respuestas": JSON.stringify(data.answers || []),
    "Corregido": corregidoInicial,
    "Nota final (manual)": "",   // completala solo si querés pisar el puntaje automático
    "Comentario docente": "",    // opcional, se incluye en el correo de resultado
    "Resultado enviado": "No",
    "Fecha envío resultado": ""
  }));

  if (SEND_EMAIL_NOTIFICATION && TEACHER_EMAIL) {
    const body =
      "Materia/examen: " + (data.exam || "(sin especificar)") + "\n" +
      "Alumno: " + (data.student || "(sin nombre)") + "\n" +
      "Email del alumno: " + (data.email || "(no informado)") + "\n" +
      "Puntaje: " + data.score + "/" + data.total + " (" + data.percent + "%)\n" +
      "Aprobado: " + (data.passed ? "Sí" : "No") + "\n" +
      "Advertencias durante el examen: " + (data.warnings || 0) + "\n" +
      "Salidas breves (dentro del margen de gracia, no cuentan como advertencia): " + (data.quickExits || 0) + "\n" +
      "DevTools sospechado (heurística, no confirma nada por sí sola): " + (data.devToolsSuspected || 0) + "\n" +
      "Motivo de finalización: " + (data.closeReason || "(no informado)") + "\n" +
      (data.hasManualQuestions
        ? "\nEste examen tiene preguntas de desarrollo: revisalas en la planilla y marcá \"Corregido\" = \"Sí\" cuando quieras habilitar el envío del resultado al alumno."
        : "");

    MailApp.sendEmail(
      TEACHER_EMAIL,
      "Resultado de examen (" + (data.exam || "sin materia") + "): " + (data.student || "alumno sin nombre"),
      body
    );
  }

  if (SEND_STUDENT_CONFIRMATION_EMAIL && isLikelyEmail(data.email)) {
    try {
      const body =
        "Hola " + (data.student || "") + ",\n\n" +
        "Recibimos tu examen \"" + (data.exam || "") + "\" el " +
        new Date(data.timestamp || Date.now()).toLocaleString("es-AR") + ".\n\n" +
        (data.hasManualQuestions
          ? "Este examen tiene preguntas de desarrollo que el profesor revisa a mano, así que en los próximos días vas a recibir otro correo aparte con tu resultado final.\n\n"
          : "En cuanto el profesor confirme la corrección, vas a recibir otro correo aparte con tu resultado final.\n\n") +
        "Este mensaje es solo para confirmarte que tu entrega llegó correctamente — todavía NO es tu nota.\n\n" +
        "Saludos.";

      MailApp.sendEmail(
        data.email,
        "Confirmación de entrega — " + (data.exam || "examen"),
        body
      );
    } catch (err) {
      // Si el correo del alumno está mal escrito o falla el envío, no
      // queremos que se pierda el guardado en la planilla por eso.
      Logger.log("No se pudo mandar el correo de confirmación al alumno: " + err);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Chequeo simple de formato de email (server-side, defensivo — la
// validación fuerte de dominio institucional ya la hace index.html
// antes de dejar avanzar al alumno).
function isLikelyEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// ============================================================
// ENVIAR RESULTADOS A LOS ALUMNOS CORREGIDOS
// ============================================================
//
// Recorre la planilla y, para cada fila donde la columna "Corregido"
// esté en "Sí" y "Resultado enviado" todavía esté en "No", le manda al
// alumno un correo con su resultado final (usando "Nota final
// (manual)" si la completaste, o el puntaje/porcentaje automático si
// la dejaste vacía, más el "Comentario docente" si escribiste algo) y
// marca esa fila como enviada.
//
// Se ejecuta desde el menú "📩 Exámenes → Enviar resultados a los
// alumnos corregidos" que aparece solo al ABRIR la planilla (recargá
// la página si no lo ves después de pegar este código por primera
// vez). También podés correrla manualmente desde el editor con ▶.
function enviarResultadosCorregidos() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const range = sheet.getDataRange();
  const values = range.getValues();

  if (values.length < 2) {
    avisar("No hay filas en la planilla todavía.");
    return;
  }

  const header = values[0];
  const idx = {
    materia: header.indexOf("Materia"),
    alumno: header.indexOf("Alumno"),
    email: header.indexOf("Email"),
    puntaje: header.indexOf("Puntaje"),
    total: header.indexOf("Total"),
    porcentaje: header.indexOf("Porcentaje"),
    aprobado: header.indexOf("Aprobado"),
    corregido: header.indexOf("Corregido"),
    notaFinal: header.indexOf("Nota final (manual)"),
    comentario: header.indexOf("Comentario docente"),
    enviado: header.indexOf("Resultado enviado"),
    fechaEnvio: header.indexOf("Fecha envío resultado")
  };

  const columnasFaltantes = Object.keys(idx).filter(k => idx[k] === -1);
  if (columnasFaltantes.length) {
    avisar(
      "Faltan columnas en el encabezado de la planilla: " + columnasFaltantes.join(", ") + ". " +
      "Si tenías una planilla de una versión anterior, actualizá la fila 1 con este encabezado:\n\n" +
      HEADER.join(" | ")
    );
    return;
  }

  let enviados = 0;
  let saltadosSinEmail = 0;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const email = String(row[idx.email] || "").trim();
    const corregido = String(row[idx.corregido] || "").trim().toLowerCase();
    const yaEnviado = String(row[idx.enviado] || "").trim().toLowerCase();

    const estaCorregido = corregido === "sí" || corregido === "si" || corregido === "true";
    const yaSeMando = yaEnviado === "sí" || yaEnviado === "si" || yaEnviado === "true";

    if (!estaCorregido || yaSeMando) continue;

    if (!isLikelyEmail(email)) {
      saltadosSinEmail++;
      continue;
    }

    const notaFinalManual = String(row[idx.notaFinal] || "").trim();
    const comentario = String(row[idx.comentario] || "").trim();
    const materia = row[idx.materia] || "(sin especificar)";
    const alumno = row[idx.alumno] || "";

    const resumenNota = notaFinalManual
      ? notaFinalManual
      : row[idx.puntaje] + "/" + row[idx.total] + " (" + row[idx.porcentaje] + ") — " +
        (String(row[idx.aprobado] || "").toLowerCase() === "sí" ? "Aprobado" : "No aprobado");

    const body =
      "Hola " + alumno + ",\n\n" +
      "Ya se corrigió tu examen \"" + materia + "\".\n\n" +
      "Resultado: " + resumenNota + "\n" +
      (comentario ? "\nComentario del profesor: " + comentario + "\n" : "") +
      "\nSaludos.";

    MailApp.sendEmail(email, "Resultado de tu examen — " + materia, body);

    sheet.getRange(i + 1, idx.enviado + 1).setValue("Sí");
    sheet.getRange(i + 1, idx.fechaEnvio + 1).setValue(new Date().toISOString());
    enviados++;
  }

  avisar(
    "Listo. Correos de resultado enviados: " + enviados + "." +
    (saltadosSinEmail
      ? "\nFilas marcadas como corregidas pero sin un email válido en la columna \"Email\": " + saltadosSinEmail + " (no se les pudo mandar nada)."
      : "")
  );
}

// Muestra un cuadro de diálogo si hay UI disponible (ejecución desde
// el menú), o si no, deja constancia en el registro de ejecución.
function avisar(mensaje) {
  try {
    SpreadsheetApp.getUi().alert(mensaje);
  } catch (err) {
    Logger.log(mensaje);
  }
}

// Crea el menú "📩 Exámenes" en la planilla cada vez que se abre.
// Si acabás de pegar este código por primera vez, recargá la pestaña
// de la Google Sheet (no la del editor de Apps Script) para verlo.
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📩 Exámenes")
    .addItem("Enviar resultados a los alumnos corregidos", "enviarResultadosCorregidos")
    .addToUi();
}

// ============================================================
// DIAGNÓSTICO — para probar que el deployment está bien armado
// ============================================================
//
// Responde a una solicitud GET simple (sin necesidad de rendir el
// examen). Sirve para dos cosas:
//   1. Pegar la URL que termina en /exec directamente en una pestaña
//      del navegador: si todo está bien deployado, ves un JSON con
//      "ok": true y el nombre de la planilla conectada.
//   2. El botón "Probar conexión con la planilla" de index.html usa
//      este mismo endpoint.
function doGet(e) {
  let sheetName = "(no se pudo leer)";
  try {
    sheetName = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName();
  } catch (err) {
    // seguimos igual, informamos el error más abajo
  }
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      mensaje: "El Web App de Apps Script está activo y conectado a esta planilla.",
      planilla: sheetName,
      teacherEmailConfigurado: !!TEACHER_EMAIL,
      avisoPorCorreoActivado: SEND_EMAIL_NOTIFICATION,
      avisoAlumnoActivado: SEND_STUDENT_CONFIRMATION_EMAIL
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// PRUEBA MANUAL — para testear desde el editor sin usar el examen
// ============================================================
//
// Para probar que la planilla y el correo funcionan sin tener que abrir
// el examen: arriba del editor, al lado del botón ▶ Ejecutar, elegí la
// función "probarEnvioDePrueba" en el desplegable y apretá ▶. Esto
// simula una entrega real (agrega una fila de prueba a la planilla y,
// si está configurado, manda el correo de aviso al profesor).
//
// OJO: el campo "email" de la prueba queda vacío a propósito, para no
// mandar accidentalmente un correo de confirmación a una dirección
// real mientras solo estás probando. Si además querés probar el correo
// de confirmación al alumno, completá "email" acá abajo con tu propio
// correo antes de ejecutar.
function probarEnvioDePrueba() {
  const fakeRequest = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        exam: "Examen de prueba",
        student: "Alumno de prueba",
        email: "",
        score: 4,
        total: 5,
        percent: 80,
        passed: true,
        warnings: 0,
        quickExits: 0,
        devToolsSuspected: 0,
        closeReason: "Finalizado por el alumno.",
        hasManualQuestions: false,
        answers: [
          { question: "Pregunta de prueba", selected: "Opción A", correct: "Opción A", isCorrect: true }
        ]
      })
    }
  };
  const result = doPost(fakeRequest);
  Logger.log(result.getContent());
  if (!TEACHER_EMAIL) {
    Logger.log(
      "AVISO: TEACHER_EMAIL está vacío, así que no se mandó ningún correo " +
      "(la fila SÍ se guardó en la planilla). Completá TEACHER_EMAIL arriba " +
      "de este archivo con tu email si querés recibir avisos."
    );
  }
}
