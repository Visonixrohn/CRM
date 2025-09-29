import React, { useState } from "react";
import "./Aprendisaje.css";

const pasos = [
  {
    titulo: "Rapport inicial (acercamiento rápido)",
    explicacion:
      "El primer contacto con el cliente debe generar confianza en segundos. Aquí defines si el cliente te escucha o te ignora.",
    consejos: [
      "Acércate con energía positiva y una sonrisa auténtica.",
      "Haz una observación ligera o pregunta corta para romper el hielo.",
      "Mantén contacto visual, pero sin invadir.",
      "Adapta tu tono de voz al del cliente (técnica espejo).",
      "Sé breve y directo, la gente en piso no tiene mucho tiempo.",
      "No te acerques como 'vendedor', acércate como 'asesor'.",
      "No hables de inmediato del producto, primero genera interés.",
    ],
    estrategias: [
      "Haz preguntas de curiosidad: '¿Ya conocía esta promoción?'.",
      "Crea urgencia desde el inicio: 'Esta oferta es solo por hoy'.",
      "Inicia con un cumplido genuino: 'Buen gusto en elegir este color'.",
    ],
    ejercicio:
      "Practica frases cortas que generen interés, como: '¿Prefiere algo duradero o más económico?' o '¿Ya vio la novedad que acaba de llegar?'.",
  },
  {
    titulo: "Prechequeo (detectar interés rápido)",
    explicacion:
      "Antes de invertir tu energía, valida si el cliente muestra interés real en lo que ofreces.",
    consejos: [
      "Haz 1 o 2 preguntas rápidas para detectar necesidad.",
      "Si el cliente no muestra interés, sonríe, agradece y busca otro prospecto.",
      "Si detectas apertura, mantén la conversación activa.",
      "Tu meta es separar curiosos de posibles compradores.",
    ],
    estrategias: [
      "Pregunta filtro: '¿Está buscando para usted o para regalo?'.",
      "Pregunta de necesidad: '¿Prefiere algo que dure más o que sea más económico?'.",
      "Pregunta de tiempo: '¿Lo necesita de inmediato o para más adelante?'.",
    ],
    ejercicio:
      "Crea un guion con 3 preguntas de prechequeo y aplícalo durante un turno completo.",
  },
  {
    titulo: "Apertura de la venta (captar atención)",
    explicacion:
      "La apertura en piso debe enganchar en segundos. Aquí despiertas curiosidad y logras que el cliente se quede contigo.",
    consejos: [
      "Haz una pregunta poderosa que active el interés.",
      "Muestra una característica llamativa del producto.",
      "Usa frases que inviten a probar: 'Si gusta, véalo de cerca'.",
      "Tu objetivo es que el cliente no se vaya, sino que te escuche.",
    ],
    estrategias: [
      "Apertura con reto: 'Le apuesto que este modelo le sorprende'.",
      "Apertura con comparación: 'Este es el que más buscan quienes saben de calidad'.",
      "Apertura de experiencia: 'Tóquelo, siéntalo, pruébelo, va a notar la diferencia'.",
    ],
    ejercicio:
      "Ensaya frases de apertura frente al espejo y mide cuál suena más natural.",
  },
  {
    titulo: "Presentación del producto (mostrar valor rápido)",
    explicacion:
      "En piso, la presentación debe ser corta, clara y enfocada en beneficios inmediatos.",
    consejos: [
      "Muestra el producto físicamente si es posible.",
      "Enfócate en el beneficio principal: ahorro, durabilidad, moda, etc.",
      "Haz que el cliente lo toque, lo pruebe o lo visualice en uso.",
      "Habla de cómo le soluciona la vida, no de características técnicas.",
      "Cuenta historias cortas: 'Un cliente lo compró la semana pasada y quedó encantado'.",
    ],
    estrategias: [
      "Usa storytelling: conecta el producto con una historia real.",
      "Usa comparación: 'Este dura 3 veces más que el modelo anterior'.",
      "Resalta exclusividad: 'Este modelo no lo tiene otra tienda en la zona'.",
    ],
    ejercicio:
      "Crea un pitch de 30 segundos resaltando el beneficio clave de tu producto.",
  },
  {
    titulo: "Manejo de objeciones (no huir del 'no')",
    explicacion:
      "En piso escucharás muchos 'no'. No significa rechazo personal, significa duda o falta de información.",
    consejos: [
      "Escucha con calma y agradece la sinceridad.",
      "Reformula la objeción: 'Entiendo que le parece caro, ¿le cuento por qué vale la pena?'.",
      "Responde con un beneficio concreto, no con teoría.",
      "Nunca discutas, siempre lleva la objeción hacia la solución.",
    ],
    estrategias: [
      "Objeción de precio: responde con valor ('Le dura 2 años más, lo barato sale caro').",
      "Objeción de tiempo: genera urgencia ('La promoción solo es hoy').",
      "Objeción de indecisión: simplifica ('Si no le convence, siempre puede cambiarlo').",
    ],
    ejercicio:
      "Haz una lista de los 5 'no' más comunes y prepara respuestas cortas para cada uno.",
  },
  {
    titulo: "Cierre de la venta (pedir decisión sin miedo)",
    explicacion:
      "El cierre en piso debe ser natural, directo y sin rodeos. Si el cliente ya mostró interés, pide la decisión.",
    consejos: [
      "Usa cierres de opción: '¿Lo llevamos en rojo o en negro?'.",
      "Invita a la acción inmediata: 'Si gusta, le hago la nota ya'.",
      "No le des demasiadas vueltas, el cliente puede perder interés.",
      "El silencio también vende: pregunta y espera la respuesta.",
    ],
    estrategias: [
      "Cierre por escasez: 'Quedan las últimas 2 piezas'.",
      "Cierre por urgencia: 'La promoción termina hoy'.",
      "Cierre alternativo: '¿Lo prefiere en efectivo o con tarjeta?'.",
      "Cierre de prueba: '¿Lo empaco de una vez?'.",
      "Cierre de compromiso: '¿Se lo separo mientras ve otros modelos?'.",
    ],
    ejercicio:
      "Practica al menos 5 frases de cierre distintas y úsalas con diferentes clientes en un día.",
  },
  {
    titulo: "Post-venta rápida (crear fidelidad en piso)",
    explicacion:
      "Aunque sea venta rápida, deja al cliente con buena experiencia para que regrese o te recomiende.",
    consejos: [
      "Agradece de forma genuina la compra.",
      "Da una recomendación rápida de uso o cuidado.",
      "Invita a volver: 'Cuando llegue la nueva colección, le aviso'.",
      "Recuerda: cada cliente satisfecho es publicidad gratis.",
    ],
    estrategias: [
      "Entrega un consejo extra: 'Si lo limpia con esto, le durará mucho más'.",
      "Ofrece garantía verbal: 'Si tiene algún detalle, venga y lo resolvemos'.",
      "Crea un vínculo personal: 'Me busca por mi nombre la próxima vez'.",
    ],
    ejercicio:
      "Diseña una frase de despedida que haga sentir especial al cliente y practícala con cada venta.",
  },
];

const frasesMotivacion = [
  // Motivación personal
  "Cada cliente es una nueva oportunidad.",
  "El 'no' de hoy puede ser un 'sí' mañana.",
  "El que más ofrece, más vende.",
  "En piso de venta, la sonrisa es tu mejor herramienta.",
  "El mejor vendedor convierte curiosos en compradores.",
  "Si no preguntas, no vendes.",
  "Cada contacto cuenta, no lo desperdicies.",
  "La actitud vende más que el precio.",
  "Nunca subestimes el poder de un '¿puedo ayudarle?'.",
  "La perseverancia abre más puertas que el talento.",
  // Estrategia de ventas
  "El cliente no compra lo que vendes, compra cómo lo haces sentir.",
  "Un buen cierre empieza con una buena apertura.",
  "No vendas productos, vende beneficios.",
  "El mejor argumento de venta es dejar hablar al cliente.",
  "Un vendedor pasivo espera, un vendedor activo provoca.",
  "No hay ventas difíciles, hay vendedores sin estrategia.",
  "El silencio es una herramienta de cierre.",
  "Una sonrisa abre más ventas que un descuento.",
  "Vender es ayudar a decidir, no presionar.",
  "El tiempo perdido con un cliente equivocado es una venta perdida con el correcto.",
];

function getFraseMotivacional() {
  return frasesMotivacion[Math.floor(Math.random() * frasesMotivacion.length)];
}

const Aprendisaje = () => {
  const [frase, setFrase] = useState(getFraseMotivacional());
  const [temaSeleccionado, setTemaSeleccionado] = useState(0);
  return (
    <div className="aprendisaje-main split-view">
      <h2 className="aprendisaje-title">Guía de Ventas en Piso</h2>
      <div className="aprendisaje-split-container">
        <div className="aprendisaje-temas-lista">
          <h3 className="aprendisaje-temas-titulo">Pasos y Estrategias</h3>
          <ul>
            {pasos.map((paso, idx) => (
              <li
                key={idx}
                className={
                  "aprendisaje-tema-item" +
                  (temaSeleccionado === idx ? " seleccionado" : "")
                }
                onClick={() => setTemaSeleccionado(idx)}
              >
                <span className="aprendisaje-tema-num">{idx + 1}</span>
                <span className="aprendisaje-tema-titulo">{paso.titulo}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="aprendisaje-explicacion-panel">
          <h3 className="aprendisaje-explicacion-titulo">
            {pasos[temaSeleccionado].titulo}
          </h3>
          <div className="aprendisaje-explicacion">
            <strong>Explicación:</strong> {pasos[temaSeleccionado].explicacion}
          </div>
          <div className="aprendisaje-consejos">
            <strong>Consejos prácticos:</strong>
            <ul>
              {pasos[temaSeleccionado].consejos.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
          {pasos[temaSeleccionado].estrategias && (
            <div className="aprendisaje-estrategias">
              <strong>Estrategias de campo:</strong>
              <ul>
                {pasos[temaSeleccionado].estrategias.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="aprendisaje-ejercicio">
            <strong>Ejercicio sugerido:</strong>
            <div>{pasos[temaSeleccionado].ejercicio}</div>
          </div>
        </div>
      </div>
      <div className="aprendisaje-motivador">
        <h3>Recuerda:</h3>
        <p>
          En ventas en frío, lo que más vendes es{" "}
          <span className="aprendisaje-confianza">actitud y confianza</span>, no
          solo productos.
        </p>
      </div>
      <div className="aprendisaje-frase-motivacional">
        <span>{frase}</span>
        <button
          className="aprendisaje-frase-btn"
          onClick={() => setFrase(getFraseMotivacional())}
        >
          Otra frase
        </button>
      </div>
    </div>
  );
};

export default Aprendisaje;
