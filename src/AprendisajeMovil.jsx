import React, { useState } from "react";
import { motion } from "framer-motion";
import "./Aprendisaje.css";

const frasesMotivacion = [
  "La confianza vende más que el producto.",
  "El éxito en ventas es ayudar, no presionar.",
  "Vender es servir con pasión.",
  "Cada objeción es una oportunidad de conectar.",
  "El mejor vendedor es quien inspira confianza.",
  "No vendas productos, vende soluciones y emociones.",
  "La actitud positiva abre más puertas que cualquier argumento.",
  "El silencio después de la pregunta de cierre es oro puro.",
  "Vende la transformación, no la transacción.",
  "La objeción no es un 'NO', es un 'Dime más'.",
];

const pasosVenta = [
  {
    titulo: "1. Mentalidad de Vendedor Élite",
    explicacion: "El éxito inicia en la mente. Debes creer genuinamente en tu producto y en tu capacidad para servir. Esto elimina la 'presión' y la convierte en 'asistencia'.",
    consejos: ["Elimina la culpa al vender: eres un solucionador de problemas.", "Practica la **visualización** del éxito antes de cada interacción.", "Aplica el principio 80/20: 80% de escucha y 20% de habla.", "Mantén una postura de **seguridad y entusiasmo** (se contagia)."],
    ejercicio: "Define tu 'Propósito de Venta' (¿por qué es importante lo que vendes?) y recítalo 5 veces al día.",
  },
  {
    titulo: "2. Rapport Genuino y Neuroventas",
    explicacion: "Generar una conexión auténtica es activar el cerebro emocional (sistema límbico). Busca la sintonía ('pacing' y 'leading') para bajar las defensas del cliente.",
    consejos: ["**Técnica del Espejo (Mirroring):** Refleja sutilmente el tono, ritmo de habla y lenguaje corporal del cliente.", "Identifica y usa el **Sistema Representacional** (Visual, Auditivo, Kinestésico) dominante del cliente en tu lenguaje.", "Usa su nombre con moderación (el sonido más dulce).", "La gente compra a quien le cae bien y **siente** que lo entiende."],
    ejercicio: "Grábate practicando la 'Técnica del Espejo' con un amigo y evalúa qué tan sutil fuiste.",
  },
  {
    titulo: "3. Detección de Necesidades Profundas",
    explicacion: "No preguntes 'qué', pregunta 'por qué' y 'para qué'. Descubre el **dolor** o **deseo** que tu producto realmente resuelve, apelando al cerebro reptil.",
    consejos: ["Usa la técnica del **'¿Y eso para ti qué significa?'** para profundizar en las respuestas.", "Detecta el **'Presupuesto de Tiempo, Esfuerzo y Dinero'** desde el inicio.", "Pregunta sobre las consecuencias de *no* resolver el problema (activando el miedo a perder, más poderoso que la ganancia).", "La **Escucha Activa** es tu herramienta principal: toma notas de palabras clave emocionales."],
    ejercicio: "Escribe 5 preguntas abiertas (no de sí/no) diseñadas para descubrir el 'dolor' de tu cliente.",
  },
  {
    titulo: "4. Propuesta de Valor Irresistible",
    explicacion: "El cerebro toma decisiones rápidas. Tu apertura debe ser concisa, centrada en el **beneficio central** para el cliente, no en el producto.",
    consejos: ["El 'Pitch' de 30 segundos: ¿A quién ayudas? ¿A hacer qué? ¿Y cuál es el resultado único?", "Aplica el principio de la **Escasez y Urgencia** (si es genuino).", "Enfócate en el **valor percibido** y cómo este supera el 'sacrificio' (precio).", "Usa una frase de transición que enlace la necesidad con la solución: 'Basado en que [necesidad], te propongo [solución].'"],
    ejercicio: "Crea dos versiones de tu 'Pitch Irresistible': una de 15 segundos y otra de 30.",
  },
  {
    titulo: "5. Presentación: Beneficios que Activan el Deseo",
    explicacion: "Vende la película, no el guion. Las características son lógicas (cerebro racional), los beneficios son emocionales (cerebro límbico/reptil).",
    consejos: ["Traduce **Características** a **Beneficios** (Ej: 'Es liviano' → 'Ahorrarás tiempo y esfuerzo al transportarlo').", "Usa historias de éxito (Testimonios) que resuenen con la situación del cliente.", "**Demuestra el resultado**, no el proceso (si es posible).", "Neuroventas: Usa palabras que evocan **ganancia y seguridad**."],
    ejercicio: "Toma 3 características clave de tu producto y crea 3 historias breves de cómo transformaron la vida de un cliente.",
  },
  {
    titulo: "6. Manejo de Objeciones (Oportunidades de Venta)",
    explicacion: "Toda objeción es una pregunta oculta, una búsqueda de más información para justificar la compra. Escucha, valida, aísla y responde.",
    consejos: ["**Método de las 3 F's:** 'Siento (**Feel**), entiendo que te sientas así, otros clientes se **Sentían** (Felt) igual, pero ellos **Descubrieron** (Found) que...'", "Aísla la objeción: 'Si resolvemos el tema del precio/tiempo, ¿avanzaríamos hoy?'", "Usa el **Cierre Puercoespín (Alex Day)**: Contesta una pregunta del cliente con otra que avance el proceso.", "Jamás discutas; muéstrate como un aliado."],
    ejercicio: "Practica el 'Cierre Puercoespín' y el 'Aislamiento' con las 3 objeciones más comunes que recibes.",
  },
  {
    titulo: "7. Cierre de Venta (Natural y Decidido)",
    explicacion: "El cierre no es un evento, es la consecuencia de los 6 pasos anteriores. Si hiciste un buen Prechequeo, sabes cómo y cuándo cerrar.",
    consejos: ["**Cierre por Doble Alternativa:** '¿Prefieres el plan A o el B?', '¿Lo empezamos el martes o el jueves?'", "**Cierre por Asunción:** Actúa con confianza, asumiendo que el cliente ya tomó la decisión (Ej: 'Perfecto, solo necesito que me confirmes el método de pago').", "Silencio estratégico: Haz la pregunta de cierre y **calla**. El primero que habla pierde.", "Recuerda: estás ayudando a tu cliente a tomar una buena decisión."],
    ejercicio: "Elige 3 técnicas de cierre y practicalas en voz alta hasta que suenen completamente naturales.",
  },
  {
    titulo: "8. Post-Venta y Fidelización (Ventas Futuras)",
    explicacion: "Un cliente satisfecho es tu mejor vendedor. La post-venta maximiza el **Valor de Vida del Cliente (LTV)** y genera referencias.",
    consejos: ["**Onboarding (Bienvenida):** Asegúrate de que el cliente sepa exactamente cómo empezar y qué esperar.", "Solicita una referencia o testimonio en el momento de mayor satisfacción.", "Envía un mensaje de seguimiento (no de venta) a los 30 días para asegurar el éxito.", "Establece un plan de contacto (newsletter, ofertas especiales) para mantener el **Rapport a largo plazo**."],
    ejercicio: "Diseña un mensaje de 'Bienvenida' y un mensaje de 'Seguimiento a 30 días' post-compra.",
  },
];

function getFraseMotivacional() {
  return frasesMotivacion[Math.floor(Math.random() * frasesMotivacion.length)];
}

const AprendisajeMovil = () => {
  const [activo, setActivo] = useState(null);
  const [frase, setFrase] = useState(getFraseMotivacional());

  return (
    <div className="aprendisaje-bg" style={{ padding: 0, minHeight: "100vh" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="aprendisaje-card"
        style={{ padding: "18px 8px", maxWidth: "100%", borderRadius: 0, boxShadow: "none" }}
      >
        <h1 className="aprendisaje-title" style={{ fontSize: "1.3rem", marginBottom: 10 }}>
          Curso de Ventas
        </h1>
        <p className="aprendisaje-subtitle" style={{ fontSize: "1rem", marginBottom: 16 }}>
          ¡Aprende los pasos clave para vender más y mejor!
        </p>
        {pasosVenta.map((paso, idx) => (
          <motion.div
            key={idx}
            initial={false}
            animate={activo === idx ? { backgroundColor: "#f3f0ff" } : { backgroundColor: "#fff" }}
            className={`aprendisaje-accordion${activo === idx ? " active" : ""}`}
            style={{ marginBottom: 10, borderRadius: 10, borderWidth: 1, borderColor: activo === idx ? "#6c63ff" : "#e0e0e0" }}
            onClick={() => setActivo(activo === idx ? null : idx)}
            whileHover={{ scale: 1.01 }}
          >
            <div className={`aprendisaje-accordion-header${activo === idx ? " active" : ""}`} style={{ padding: "12px 16px", fontSize: "1rem" }}>
              <span>{idx + 1}. {paso.titulo}</span>
            </div>
            {activo === idx && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="aprendisaje-accordion-content"
                style={{ padding: "0 16px 12px 16px", fontSize: "0.95rem" }}
              >
                <div style={{ marginBottom: 6, color: "#3949ab" }}><b>Explicación:</b> {paso.explicacion}</div>
                <div style={{ marginBottom: 6 }}>
                  <b>Consejos:</b>
                  <ul style={{ marginTop: 2, marginBottom: 2 }}>
                    {paso.consejos.map((c, i) => (
                      <li key={i} style={{ color: "#512da8", marginBottom: 2 }}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginBottom: 6, color: "#009688" }}><b>Ejercicio:</b> {paso.ejercicio}</div>
              </motion.div>
            )}
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="aprendisaje-motivador"
          style={{ fontSize: "1rem", padding: "14px 8px", borderRadius: 10, marginBottom: 18 }}
        >
          Recuerda: <span style={{ fontWeight: 700 }}>¡En ventas se vende confianza, no solo productos!</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="aprendisaje-frase"
          style={{ fontSize: "0.95rem", padding: "10px 8px", borderRadius: 8, marginBottom: 10 }}
          onClick={() => setFrase(getFraseMotivacional())}
          title="Haz clic para cambiar la frase motivacional"
        >
          {frase}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AprendisajeMovil;
