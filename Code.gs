/**
 * Code.gs — pegar este código en el editor de Apps Script de una
 * Google Sheet nueva (Extensiones > Apps Script). Ver README.md,
 * sección "Recibir resultados en una planilla", para los pasos
 * completos de instalación y despliegue.
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

// true para activar el aviso por correo (recomendado, ya que el examen
// puede cerrarse solo por una violación y conviene enterarse al toque),
// false para no enviar avisos y solo guardar en la planilla.
const SEND_EMAIL_NOTIFICATION = true;


// ============================================================
// No hace falta tocar nada de acá para abajo
// ============================================================

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

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Fecha", "Materia", "Alumno", "Puntaje", "Total", "Porcentaje",
      "Aprobado", "Advertencias", "Motivo de finalización", "Detalle de respuestas"
    ]);
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.exam || "(sin especificar)",
    data.student || "(sin nombre)",
    data.score,
    data.total,
    (data.percent || 0) + "%",
    data.passed ? "Sí" : "No",
    data.warnings || 0,
    data.closeReason || "",
    JSON.stringify(data.answers || [])
  ]);

  if (SEND_EMAIL_NOTIFICATION && TEACHER_EMAIL) {
    const body =
      "Materia/examen: " + (data.exam || "(sin especificar)") + "\n" +
      "Alumno: " + (data.student || "(sin nombre)") + "\n" +
      "Puntaje: " + data.score + "/" + data.total + " (" + data.percent + "%)\n" +
      "Aprobado: " + (data.passed ? "Sí" : "No") + "\n" +
      "Advertencias durante el examen: " + (data.warnings || 0) + "\n" +
      "Motivo de finalización: " + (data.closeReason || "(no informado)");

    MailApp.sendEmail(
      TEACHER_EMAIL,
      "Resultado de examen (" + (data.exam || "sin materia") + "): " + (data.student || "alumno sin nombre"),
      body
    );
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
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
      avisoPorCorreoActivado: SEND_EMAIL_NOTIFICATION
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
// si está configurado, manda el correo de aviso).
function probarEnvioDePrueba() {
  const fakeRequest = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        exam: "Examen de prueba",
        student: "Alumno de prueba",
        score: 4,
        total: 5,
        percent: 80,
        passed: true,
        warnings: 0,
        closeReason: "Finalizado por el alumno.",
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
