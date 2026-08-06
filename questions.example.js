/**
 * questions.example.js — ejemplo de archivo externo de preguntas.
 *
 * Para usarlo:
 *   1. Renombrá este archivo a "questions.js".
 *   2. Ponelo en la misma carpeta que "index.html".
 *   3. Editá el array de más abajo con tus propias preguntas.
 *   4. Listo — index.html lo detecta y carga solo, sin que tengas que
 *      tocar el HTML. Funciona incluso abriendo el .html con doble
 *      clic (no necesita servidor).
 *
 * Tipos de pregunta soportados (campo "type"; si se omite, se asume
 * "single" = opción múltiple clásica):
 *
 *   - "single" (o sin "type"): opción múltiple, una sola correcta.
 *       { question, options: [...], correct: índice (0-based) }
 *
 *   - "boolean": verdadero / falso.
 *       { type: "boolean", question, correct: true | false }
 *
 *   - "multiple": selección múltiple, una o más correctas.
 *       { type: "multiple", question, options: [...], correct: [índices, 0-based] }
 *
 *   - "order": ordenar ítems. "items" va en el ORDEN CORRECTO;
 *     al alumno se le muestra barajado.
 *       { type: "order", question, items: [...] }
 *
 *   - "text": respuesta libre / párrafo. No se corrige de forma
 *     automática — queda para que el profesor la revise a mano
 *     (se guarda igual en la planilla, en la columna de detalle).
 *       { type: "text", question }
 *
 * Imagen opcional: CUALQUIER pregunta, sin importar el tipo, puede
 * llevar un campo "image" con una URL. Se muestra arriba de las
 * opciones. Si la URL no carga, el examen avisa en pantalla en vez de
 * dejar un espacio vacío sin explicación.
 *
 * Nota: si además configurás CONFIG.QUESTIONS_CSV_URL dentro de
 * index.html, el CSV tiene prioridad sobre este archivo.
 */
const QUIZ_QUESTIONS = [
  // --- Opción única ---
  {
    question: "¿Cuál es la capital de Francia?",
    options: ["Madrid", "París", "Roma", "Lisboa"],
    correct: 1
  },
  {
    question: "¿Cuánto es 12 × 8?",
    options: ["86", "96", "108", "76"],
    correct: 1
  },
  {
    question: "¿En qué continente está Egipto?",
    options: ["Asia", "Europa", "África", "Oceanía"],
    correct: 2
  },

  // --- Con imagen ---
  {
    question: "¿A qué país pertenece esta bandera?",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg",
    options: ["Argentina", "Uruguay", "Chile", "Paraguay"],
    correct: 0
  },

  // --- Verdadero / Falso ---
  {
    type: "boolean",
    question: "Python es un lenguaje de programación.",
    correct: true
  },

  // --- Selección múltiple (una o más correctas) ---
  {
    type: "multiple",
    question: "¿Cuáles de estos son planetas del sistema solar?",
    options: ["Marte", "Plutón", "Júpiter", "Sirio"],
    correct: [0, 2]
  },

  // --- Ordenar ---
  {
    type: "order",
    question: "Ordená estos planetas de más cercano a más lejano del Sol.",
    items: ["Mercurio", "Venus", "Tierra", "Marte"]
  },

  // --- Respuesta libre / párrafo (revisión manual) ---
  {
    type: "text",
    question: "Explicá con tus palabras por qué el cielo se ve azul."
  }
];
