import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// --- 1. DATA DEL CURSO (Estructura de 8 Pasos) ---

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

const getFraseMotivacional = () => {
    return frasesMotivacion[
        Math.floor(Math.random() * frasesMotivacion.length)
    ];
};

const pasosVenta = [
    {
        titulo: "1. Mentalidad de Vendedor Élite",
        explicacion: "El éxito inicia en la mente. Debes creer genuinamente en tu producto y en tu capacidad para servir. Esto elimina la 'presión' y la convierte en 'asistencia'.",
        consejos: ["Elimina la culpa al vender: eres un solucionador de problemas.", "Practica la **visualización** del éxito antes de cada interacción.", "Aplica el principio 80/20: 80% de escucha y 20% de habla.", "Mantén una postura de **seguridad y entusiasmo** (se contagia)."],
        ejercicio: "Define tu 'Propósito de Venta' (¿por qué es importante lo que vendes?) y recítalo 5 veces al día.",
        color: "#00bfa5",
        icon: "🧠",
    },
    {
        titulo: "2. Rapport Genuino y Neuroventas",
        explicacion: "Generar una conexión auténtica es activar el cerebro emocional (sistema límbico). Busca la sintonía ('pacing' y 'leading') para bajar las defensas del cliente.",
        consejos: ["**Técnica del Espejo (Mirroring):** Refleja sutilmente el tono, ritmo de habla y lenguaje corporal del cliente.", "Identifica y usa el **Sistema Representacional** (Visual, Auditivo, Kinestésico) dominante del cliente en tu lenguaje.", "Usa su nombre con moderación (el sonido más dulce).", "La gente compra a quien le cae bien y **siente** que lo entiende."],
        ejercicio: "Grábate practicando la 'Técnica del Espejo' con un amigo y evalúa qué tan sutil fuiste.",
        color: "#4e7af5",
        icon: "🤝",
    },
    {
        titulo: "3. Detección de Necesidades Profundas",
        explicacion: "No preguntes 'qué', pregunta 'por qué' y 'para qué'. Descubre el **dolor** o **deseo** que tu producto realmente resuelve, apelando al cerebro reptil.",
        consejos: ["Usa la técnica del **'¿Y eso para ti qué significa?'** para profundizar en las respuestas.", "Detecta el **'Presupuesto de Tiempo, Esfuerzo y Dinero'** desde el inicio.", "Pregunta sobre las consecuencias de *no* resolver el problema (activando el miedo a perder, más poderoso que la ganancia).", "La **Escucha Activa** es tu herramienta principal: toma notas de palabras clave emocionales."],
        ejercicio: "Escribe 5 preguntas abiertas (no de sí/no) diseñadas para descubrir el 'dolor' de tu cliente.",
        color: "#ffc107",
        icon: "🔍",
    },
    {
        titulo: "4. Propuesta de Valor Irresistible",
        explicacion: "El cerebro toma decisiones rápidas. Tu apertura debe ser concisa, centrada en el **beneficio central** para el cliente, no en el producto.",
        consejos: ["El 'Pitch' de 30 segundos: ¿A quién ayudas? ¿A hacer qué? ¿Y cuál es el resultado único?", "Aplica el principio de la **Escasez y Urgencia** (si es genuino).", "Enfócate en el **valor percibido** y cómo este supera el 'sacrificio' (precio).", "Usa una frase de transición que enlace la necesidad con la solución: 'Basado en que [necesidad], te propongo [solución].'"],
        ejercicio: "Crea dos versiones de tu 'Pitch Irresistible': una de 15 segundos y otra de 30.",
        color: "#ff5722",
        icon: "✨",
    },
    {
        titulo: "5. Presentación: Beneficios que Activan el Deseo",
        explicacion: "Vende la película, no el guion. Las características son lógicas (cerebro racional), los beneficios son emocionales (cerebro límbico/reptil).",
        consejos: ["Traduce **Características** a **Beneficios** (Ej: 'Es liviano' → 'Ahorrarás tiempo y esfuerzo al transportarlo').", "Usa historias de éxito (Testimonios) que resuenen con la situación del cliente.", "**Demuestra el resultado**, no el proceso (si es posible).", "Neuroventas: Usa palabras que evocan **ganancia y seguridad**."],
        ejercicio: "Toma 3 características clave de tu producto y crea 3 historias breves de cómo transformaron la vida de un cliente.",
        color: "#673ab7",
        icon: "🎬",
    },
    {
        titulo: "6. Manejo de Objeciones (Oportunidades de Venta)",
        explicacion: "Toda objeción es una pregunta oculta, una búsqueda de más información para justificar la compra. Escucha, valida, aísla y responde.",
        consejos: ["**Método de las 3 F's:** 'Siento (**Feel**), entiendo que te sientas así, otros clientes se **Sentían** (Felt) igual, pero ellos **Descubrieron** (Found) que...'", "Aísla la objeción: 'Si resolvemos el tema del precio/tiempo, ¿avanzaríamos hoy?'", "Usa el **Cierre Puercoespín (Alex Day)**: Contesta una pregunta del cliente con otra que avance el proceso.", "Jamás discutas; muéstrate como un aliado."],
        ejercicio: "Practica el 'Cierre Puercoespín' y el 'Aislamiento' con las 3 objeciones más comunes que recibes.",
        color: "#e91e63",
        icon: "🛑",
    },
    {
        titulo: "7. Cierre de Venta (Natural y Decidido)",
        explicacion: "El cierre no es un evento, es la consecuencia de los 6 pasos anteriores. Si hiciste un buen Prechequeo, sabes cómo y cuándo cerrar.",
        consejos: ["**Cierre por Doble Alternativa:** '¿Prefieres el plan A o el B?', '¿Lo empezamos el martes o el jueves?'", "**Cierre por Asunción:** Actúa con confianza, asumiendo que el cliente ya tomó la decisión (Ej: 'Perfecto, solo necesito que me confirmes el método de pago').", "Silencio estratégico: Haz la pregunta de cierre y **calla**. El primero que habla pierde.", "Recuerda: estás ayudando a tu cliente a tomar una buena decisión."],
        ejercicio: "Elige 3 técnicas de cierre y practicalas en voz alta hasta que suenen completamente naturales.",
        color: "#3f51b5",
        icon: "✔️",
    },
    {
        titulo: "8. Post-Venta y Fidelización (Ventas Futuras)",
        explicacion: "Un cliente satisfecho es tu mejor vendedor. La post-venta maximiza el **Valor de Vida del Cliente (LTV)** y genera referencias.",
        consejos: ["**Onboarding (Bienvenida):** Asegúrate de que el cliente sepa exactamente cómo empezar y qué esperar.", "Solicita una referencia o testimonio en el momento de mayor satisfacción.", "Envía un mensaje de seguimiento (no de venta) a los 30 días para asegurar el éxito.", "Establece un plan de contacto (newsletter, ofertas especiales) para mantener el **Rapport a largo plazo**."],
        ejercicio: "Diseña un mensaje de 'Bienvenida' y un mensaje de 'Seguimiento a 30 días' post-compra.",
        color: "#9e9e9e",
        icon: "🔁",
    },
];

// --- 2. COMPONENTE DE DETALLE (Panel Derecho) ---

const detailVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const DetallePaso = ({ paso }) => {
    if (!paso) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ 
                    padding: 40, 
                    textAlign: 'center', 
                    color: '#6c757d', 
                    fontSize: '1.2em',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: '#ffffff', 
                    borderRadius: 12, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
            >
                <h3 style={{color: '#3f51b5', fontSize: '1.8em', marginBottom: '15px'}}>👋 ¡Bienvenido!</h3>
                <p>
                    Selecciona un **Módulo a la Izquierda** para empezar tu entrenamiento de Neuroventas.
                </p>
                <p style={{ marginTop: 10, fontStyle: 'italic', fontSize: '0.9em' }}>
                    Cada paso incluye un concepto clave, técnicas avanzadas y un ejercicio práctico.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            key={paso.titulo}
            variants={detailVariants}
            initial="hidden"
            animate="visible"
            style={{ 
                padding: 30, 
                background: '#ffffff', 
                borderRadius: 12, 
                boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                borderLeft: `8px solid ${paso.color}`,
                minHeight: '600px'
            }}
        >
            <h2 style={{ color: paso.color, marginBottom: 15, fontSize: '2.2em' }}>
                {paso.icon} {paso.titulo}
            </h2>

            <div style={{ borderBottom: '1px solid #e0e0e0', marginBottom: 20 }} />

            <h4 style={{ color: paso.color, marginBottom: 10, fontWeight: 600 }}>🧠 Concepto Clave:</h4>
            <p
                style={{
                    marginBottom: 30,
                    color: "#343a40",
                    background: '#f8f9fa',
                    padding: 15,
                    borderRadius: 8,
                    borderLeft: `3px solid ${paso.color}55`,
                    fontStyle: 'italic',
                    lineHeight: '1.6'
                }}
            >
                {paso.explicacion}
            </p>
            
            <h4 style={{ color: '#495057', marginBottom: 10, fontWeight: 600 }}>💡 Técnicas y Neuro-tips:</h4>
            <ul
                style={{
                    listStyleType: 'none',
                    paddingLeft: 0,
                    marginBottom: 30
                }}
            >
                {paso.consejos.map((c, i) => (
                    <li
                        key={i}
                        style={{
                            color: "#495057",
                            marginBottom: 10,
                            lineHeight: '1.5',
                            display: 'flex',
                            alignItems: 'flex-start'
                        }}
                    >
                        <span style={{ color: paso.color, marginRight: 8, fontWeight: 'bold' }}>•</span> {c}
                    </li>
                ))}
            </ul>
            
            <h4 style={{ color: '#28a745', marginBottom: 10, fontWeight: 600 }}>🎯 Ejercicio Práctico (¡A la acción!):</h4>
            <div
                style={{
                    color: "#28a745",
                    background: '#e6ffe6',
                    padding: 20,
                    borderRadius: 10,
                    border: '1px dashed #28a745',
                    fontWeight: 500,
                    fontSize: '1.1em'
                }}
            >
                {paso.ejercicio}
            </div>
        </motion.div>
    );
};

// --- 3. COMPONENTE PRINCIPAL ---

const AprendizajeCurso = () => {
    const [activo, setActivo] = useState(null);
    const [frase, setFrase] = useState(getFraseMotivacional());

    const pasoActivo = activo !== null ? pasosVenta[activo] : null;

    // Cambiar la frase motivacional cuando se abre un nuevo módulo
    useEffect(() => {
        setFrase(getFraseMotivacional());
    }, [activo]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ 
                padding: 40, 
                maxWidth: 1300, 
                margin: "30px auto", 
                fontFamily: "'Inter', sans-serif", 
                background: '#f4f7f9', 
                borderRadius: 15,
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}
        >
            <h1
                style={{
                    color: "#3f51b5",
                    textAlign: 'center',
                    marginBottom: 5,
                    fontSize: '3em',
                    fontWeight: 800
                }}
            >
                 Ventas
            </h1>
            <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: 40, fontSize: '1.2em' }}>
                La metodología de **8 Pasos** para convertir la 'presión' en **conexión auténtica**.
            </p>
            
            <motion.div
                style={{
                    display: 'flex',
                    gap: 30, 
                    minHeight: '650px',
                }}
            >
                {/* Columna Izquierda: Menú de Pasos */}
                <div style={{ flex: '0 0 350px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        style={{
                            background: "linear-gradient(45deg, #3f51b5 0%, #6c63ff 100%)",
                            color: "#fff",
                            borderRadius: 12,
                            padding: "15px 20px",
                            textAlign: "center",
                            fontWeight: 700,
                            fontSize: 18,
                            marginBottom: 20,
                            boxShadow: "0 6px 15px rgba(63, 81, 181, 0.4)",
                        }}
                    >
                        PILARES DEL ÉXITO EN VENTAS
                    </motion.div>

                    {pasosVenta.map((paso, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            style={{
                                borderRadius: 10,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                marginBottom: 15,
                                border:
                                    activo === idx
                                        ? `3px solid ${paso.color}`
                                        : "1px solid #e0e0e0",
                                cursor: "pointer",
                                padding: "18px 20px",
                                transition: 'all 0.3s ease-out',
                                background: activo === idx ? '#f3f6ff' : '#ffffff',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            onClick={() => setActivo(idx)}
                            whileHover={{ scale: 1.02, boxShadow: "0 6px 15px rgba(0,0,0,0.12)" }}
                        >
                            <span 
                                style={{
                                    fontSize: '1.5em',
                                    marginRight: 15,
                                    lineHeight: 1,
                                    color: paso.color
                                }}>{paso.icon}</span>
                            <span
                                style={{
                                    fontWeight: 700,
                                    fontSize: 18,
                                    color: activo === idx ? '#333' : "#495057",
                                }}
                            >
                                {paso.titulo}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* Columna Derecha: Panel de Detalle */}
                <div style={{ flex: 1 }}>
                    <DetallePaso paso={pasoActivo} />
                </div>
            </motion.div>
            
            {/* Frase Motivacional */}
            <motion.div
                key={frase}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    background: "#fff8e1",
                    color: "#ff8f00",
                    borderRadius: 12,
                    padding: "20px 25px",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 18,
                    boxShadow: "0 4px 12px rgba(255,143,0,0.1)",
                    cursor: "pointer",
                    border: '1px solid #ffe0b2',
                    marginTop: 30,
                    fontStyle: 'italic'
                }}
                onClick={() => setFrase(getFraseMotivacional())}
                title="Haz clic para cambiar la frase motivacional"
            >
                ✨ **Inspiración Neuroventas:** {frase}
            </motion.div>
        </motion.div>
    );
};

export default AprendizajeCurso;