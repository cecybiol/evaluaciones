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
  {
    type: "text",
    question: "Explica cómo funciona el proceso de arranque de una PC indicando sus diferentes estados (No enciende, Enciende sin imagen, POST, Carga del sistema operativo). ¿Qué es el proceso POST y cuál es su función?"
  },
  {
    type: "text",
    question: "Indica al menos dos fallas posibles del procesador, dos de la memoria RAM y dos de la fuente de alimentación. Para cada una, explica una posible solución."
  },
  {
    question: "¿En qué estado del proceso de arranque se encuentra una PC si el conector ATX de la placa madre está dañado?",
    options: [
      "No enciende",
      "Enciende y no da imagen",
      "Enciende y muestra un código de error",
      "Carga el sistema operativo"
    ],
    correct: 0
  },
  {
    question: "¿En qué estado del proceso de arranque se encuentra una PC si el procesador está dañado?",
    options: [
      "No enciende",
      "Enciende y no da imagen",
      "Enciende y muestra un código de error",
      "Carga normalmente"
    ],
    correct: 1
  },
  {
    question: "¿En qué estado del proceso de arranque se encuentra una PC si la memoria secundaria principal (SSD/HDD) está desconectada?",
    options: [
      "No enciende",
      "Enciende y no da imagen",
      "Enciende y muestra un código de error",
      "No presenta fallas"
    ],
    correct: 2
  },
  {
    question: "¿En qué estado del proceso de arranque se encuentra una PC si la fecha y hora están desactualizadas?",
    options: [
      "No enciende",
      "Enciende y no da imagen",
      "Enciende y muestra un código de error",
      "Carga normalmente sin advertencias"
    ],
    correct: 2
  },
  {
    question: "¿En qué estado del proceso de arranque se encuentra una PC si el ventilador del procesador no es detectado?",
    options: [
      "No enciende",
      "Enciende y no da imagen",
      "Enciende y muestra un código de error",
      "Carga el sistema operativo"
    ],
    correct: 2
  },
  {
    question: "¿En qué estado del proceso de arranque se encuentra una PC si la BIOS está dañada?",
    options: [
      "No enciende",
      "Enciende y no da imagen",
      "Enciende y muestra un código de error",
      "Carga normalmente"
    ],
    correct: 1
  },
  {
    type: "text",
    question: "ESCENARIO 1: El equipo no enciende ni muestra luces ni sonidos. Se verificó la corriente eléctrica y la conexión.\n\nIndica:\n- ¿En qué etapa del proceso de arranque ocurre la falla?\n- ¿Qué componente físico o lógico puede estar fallando?\n- ¿Cómo verificarías o resolverías el problema?"
  },
  {
    type: "text",
    question: "ESCENARIO 2: El equipo enciende, pero se escucha una serie de pitidos y la pantalla permanece negra. Anteriormente se había instalado una tarjeta gráfica.\n\nIndica:\n- ¿En qué etapa del proceso de arranque ocurre la falla?\n- ¿Qué componente físico o lógico puede estar fallando?\n- ¿Cómo verificarías o resolverías el problema?"
  },
  {
    type: "text",
    question: "ESCENARIO 3: El equipo enciende, se observan luces en diferentes componentes, pero la pantalla permanece negra.\n\nIndica:\n- ¿En qué etapa del proceso de arranque ocurre la falla?\n- ¿Qué componente físico o lógico puede estar fallando?\n- ¿Cómo verificarías o resolverías el problema?"
  },
  {
    type: "text",
    question: "ESCENARIO 4: La PC enciende, los ventiladores giran a máxima velocidad, no hay imagen ni pitidos y luego de un minuto se apaga sola.\n\nIndica:\n- ¿En qué etapa del proceso de arranque ocurre la falla?\n- ¿Qué componente físico o lógico puede estar fallando?\n- ¿Cómo verificarías o resolverías el problema?"
  },
  {
    type: "text",
    question: "ESCENARIO 5: Al encender la PC aparece el mensaje 'No Boot Device Found' o 'Operating System Not Found'.\n\nIndica:\n- ¿En qué etapa del proceso de arranque ocurre la falla?\n- ¿Qué componente físico o lógico puede estar fallando?\n- ¿Cómo verificarías o resolverías el problema?"
  },
  {
    type: "text",
    question: "ESCENARIO 6: La PC emite una serie de pitidos largos y continuos al encender y no muestra imagen.\n\nIndica:\n- ¿En qué etapa del proceso de arranque ocurre la falla?\n- ¿Qué componente físico o lógico puede estar fallando?\n- ¿Cómo verificarías o resolverías el problema?"
  },
  {
    type: "text",
    question: "¿Cómo verificarías el estado de una fuente de alimentación por fuera de la PC? Describe el procedimiento y los elementos necesarios."
  },
  {
    question: "Al medir una fuente ATX se obtienen los siguientes valores:\n- Línea de 12 V: 11,2 V\n- Línea de 5 V: 5,10 V\n\n¿Cuál de las siguientes afirmaciones es correcta?",
    options: [
      "Ambas tensiones están dentro del rango permitido.",
      "La línea de 12 V está fuera del rango permitido y la de 5 V está dentro del rango.",
      "La línea de 12 V está dentro del rango y la de 5 V está fuera del rango.",
      "Ambas tensiones están fuera del rango permitido."
    ],
    correct: 1
  },
  {
    type: "order",
    question: "Ordena las etapas del proceso de arranque de una PC desde que se presiona el botón de encendido hasta la carga del sistema operativo.",
    items: [
      "Se presiona el botón de encendido",
      "La fuente entrega la señal Power Good",
      "La CPU comienza a ejecutar el firmware BIOS/UEFI",
      "Se ejecuta el POST",
      "Se detectan los dispositivos de almacenamiento",
      "Se carga el gestor de arranque",
      "Se inicia el sistema operativo"
    ]
  }
];