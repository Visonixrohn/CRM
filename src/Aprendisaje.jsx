import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaHandshake, FaCheckCircle, FaDoorOpen, FaBoxOpen, FaQuestionCircle, FaFlagCheckered, FaHeart } from "react-icons/fa";

const pasosVenta = [
	{
		titulo: "Freeman (rapport inicial)",
		icono: <FaHandshake size={40} color="#7b1fa2" style={{ marginRight: 18 }} />,
		explicacion:
			"Genera una conexión genuina con el cliente. El rapport inicial es clave para que el cliente se sienta cómodo y confiado.",
		consejos: [
			"Sonríe y mantén contacto visual.",
			"Haz preguntas abiertas para conocer al cliente.",
			"Usa técnicas de neuroventas: activa emociones positivas, valida sus necesidades (Klaric).",
		],
		ejercicio:
			"Practica iniciar una conversación con 3 personas desconocidas, buscando generar confianza y empatía.",
	},
	{
		titulo: "Prechequeo",
		icono: <FaCheckCircle size={40} color="#1976d2" style={{ marginRight: 18 }} />,
		explicacion:
			"Identifica si el cliente realmente necesita tu producto y si está en condiciones de comprar. Evita perder tiempo en prospectos no calificados.",
		consejos: [
			"Haz preguntas de filtro: ¿Qué buscas resolver? ¿Cuál es tu presupuesto?",
			"Detecta señales de interés real.",
			"Aplica el método de calificación rápida (Klaric).",
		],
		ejercicio:
			"Haz una lista de 5 preguntas clave para calificar a tus prospectos antes de presentar el producto.",
	},
	{
		titulo: "Apertura",
		icono: <FaDoorOpen size={40} color="#009688" style={{ marginRight: 18 }} />,
		explicacion:
			"Presenta la intención de la reunión y genera expectativa. La apertura debe ser clara y positiva.",
		consejos: [
			"Sé directo pero amable: explica el objetivo de la charla.",
			"Crea curiosidad sobre el producto.",
			"Utiliza frases de apertura motivadoras (Alex Day).",
		],
		ejercicio:
			"Escribe y practica tu frase de apertura para captar la atención del cliente en menos de 10 segundos.",
	},
	{
		titulo: "Presentación del producto",
		icono: <FaBoxOpen size={40} color="#4caf50" style={{ marginRight: 18 }} />,
		explicacion:
			"Muestra los beneficios y el valor del producto, no solo sus características. Conecta emocionalmente.",
		consejos: [
			"Enfócate en los beneficios que resuelven problemas.",
			"Usa historias y ejemplos reales (Klaric).",
			"Haz preguntas que involucren al cliente en la solución.",
		],
		ejercicio:
			"Haz una presentación breve de tu producto enfocada en beneficios, usando una historia real.",
	},
	{
		titulo: "Manejo de objeciones",
		icono: <FaQuestionCircle size={40} color="#ff9800" style={{ marginRight: 18 }} />,
		explicacion:
			"Escucha las dudas del cliente y responde con empatía. Las objeciones son oportunidades para reforzar la confianza.",
		consejos: [
			"Escucha sin interrumpir y valida la preocupación.",
			"Responde con argumentos basados en neuroventas (Klaric).",
			"Utiliza técnicas de cierre: '¿Qué te detiene de comprar hoy?' (Alex Day).",
		],
		ejercicio:
			"Escribe las 3 objeciones más comunes y prepara respuestas empáticas y motivadoras para cada una.",
	},
	{
		titulo: "Cierre de la venta",
		icono: <FaFlagCheckered size={40} color="#e040fb" style={{ marginRight: 18 }} />,
		explicacion:
			"Solicita la decisión de compra con seguridad y motivación. El cierre debe ser natural y positivo.",
		consejos: [
			"Utiliza frases de cierre: '¿Prefieres la opción A o B?' (Alex Day).",
			"Refuerza la confianza y el valor del producto.",
			"Haz sentir al cliente que está tomando una gran decisión.",
		],
		ejercicio:
			"Practica 3 frases de cierre y úsalas en tus próximas reuniones de ventas.",
	},
	{
		titulo: "Post-venta",
		icono: <FaHeart size={40} color="#1976d2" style={{ marginRight: 18 }} />,
		explicacion:
			"Acompaña al cliente después de la compra. La post-venta genera fidelidad y recomendaciones.",
		consejos: [
			"Haz seguimiento y pregunta por su experiencia.",
			"Ofrece soporte y agradece la confianza.",
			"Solicita retroalimentación para mejorar.",
		],
		ejercicio:
			"Envía un mensaje de agradecimiento y seguimiento a tus últimos 3 clientes.",
	},
];

const frasesMotivacion = [
	"La confianza vende más que el producto.",
	"El éxito en ventas es ayudar, no solo convencer.",
	"Cada no te acerca a un sí.",
	"Vender es servir con pasión.",
	"El mejor vendedor es quien inspira confianza.",
	"La actitud positiva abre puertas que el conocimiento no puede.",
	"Recuerda: vendes soluciones, no solo productos.",
];

function getFraseMotivacional() {
	return frasesMotivacion[
		Math.floor(Math.random() * frasesMotivacion.length)
	];
}

const Accordion = ({ items }) => {
	const [openIndex, setOpenIndex] = useState(null);
	return (
		<div style={{ maxWidth: 750, margin: "48px auto" }}>
			{items.map((item, idx) => (
				<motion.div
					key={item.titulo}
					initial={{ borderRadius: 28 }}
					animate={{ borderRadius: openIndex === idx ? 40 : 28, boxShadow: openIndex === idx ? "0 8px 32px #7b1fa255" : "0 4px 16px #7b1fa222" }}
					style={{
						background: openIndex === idx ? "#fff" : "linear-gradient(90deg, #7b1fa2 60%, #1976d2 100%)",
						color: openIndex === idx ? "#222" : "#fff",
						marginBottom: 32,
						cursor: "pointer",
						padding: 0,
						border: openIndex === idx ? "3px solid #7b1fa2" : "none",
						transition: "all 0.3s",
					}}
					onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
				>
					<div style={{ display: "flex", alignItems: "center", padding: "32px 40px", fontWeight: 900, fontSize: 26, borderBottom: openIndex === idx ? "2px solid #7b1fa2" : "none", background: openIndex === idx ? "#ede7f6" : "none" }}>
						{item.icono}
						<span style={{ textDecoration: openIndex === idx ? "underline" : "none", textUnderlineOffset: 6 }}>{item.titulo}</span>
					</div>
					{openIndex === idx && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							transition={{ duration: 0.4 }}
							style={{ padding: "0 40px 32px 40px", background: "#f3e5f5", borderRadius: 24 }}
						>
							<div style={{ marginBottom: 16, fontSize: 20 }}><b>Explicación:</b> {item.explicacion}</div>
							<div style={{ marginBottom: 16 }}>
								<b>Consejos prácticos:</b>
								<ul style={{ margin: "8px 0 0 28px", fontSize: 19 }}>
									{item.consejos.map((c, i) => (
										<li key={i} style={{ marginBottom: 8 }}>{c}</li>
									))}
								</ul>
							</div>
							<div style={{ marginBottom: 8, fontSize: 19 }}><b>Ejercicio sugerido:</b> {item.ejercicio}</div>
						</motion.div>
					)}
				</motion.div>
			))}
		</div>
	);
};

const BloqueMotivador = () => (
	<motion.div
		initial={{ opacity: 0, y: 40 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.7 }}
		style={{
			background: "linear-gradient(90deg, #1976d2 60%, #7b1fa2 100%)",
			color: "#fff",
			padding: "48px 40px",
			borderRadius: 40,
			textAlign: "center",
			fontWeight: 900,
			fontSize: 30,
			margin: "56px auto 0 auto",
			maxWidth: 750,
			boxShadow: "0 8px 32px #1976d255",
		}}
	>
		Recuerda:{" "}
		<span style={{ color: "#ffd600", fontWeight: 900, fontSize: 32 }}>
			¡Vendes confianza, no solo productos!
		</span>
	</motion.div>
);

const Aprendisaje = () => {
	const [frase, setFrase] = useState(getFraseMotivacional());
	// Cambia la frase motivacional al hacer clic
	const handleNuevaFrase = () => setFrase(getFraseMotivacional());

	return (
		<div
			style={{
				padding: 0,
				background: "#ede7f6",
				minHeight: "100vh",
			}}
		>
			<motion.div
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7 }}
				style={{
					background:
						"linear-gradient(90deg, #7b1fa2 60%, #1976d2 100%)",
					color: "#fff",
					borderRadius: 40,
					maxWidth: 750,
					margin: "56px auto 0 auto",
					boxShadow: "0 8px 32px #7b1fa255",
					padding: "40px 40px 24px 40px",
					textAlign: "center",
				}}
			>
				<h2
					style={{
						fontWeight: 900,
						fontSize: 40,
						marginBottom: 12,
						letterSpacing: 1,
					}}
				>
					Curso de Ventas Interactivo
				</h2>
				<p
					style={{
						fontSize: 26,
						fontWeight: 600,
						marginBottom: 0,
					}}
				>
					Aprende los pasos clave para vender con éxito y confianza.
				</p>
			</motion.div>
			<Accordion items={pasosVenta} />
			<BloqueMotivador />
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				style={{
					margin: "56px auto 0 auto",
					maxWidth: 750,
					background: "linear-gradient(90deg, #7b1fa2 60%, #1976d2 100%)",
					borderRadius: 32,
					boxShadow: "0 4px 16px #1976d222",
					padding: "32px 32px",
					textAlign: "center",
					color: "#fff",
					fontWeight: 700,
					fontSize: 26,
				}}
			>
				<span style={{ fontStyle: "italic" }}>{frase}</span>
				<br />
				<button
					onClick={handleNuevaFrase}
					style={{
						marginTop: 22,
						background: "#ffd600",
						color: "#7b1fa2",
						border: "none",
						borderRadius: 14,
						padding: "14px 32px",
						fontWeight: 900,
						cursor: "pointer",
						fontSize: 20,
						boxShadow: "0 2px 8px #7b1fa222",
					}}
				>
					Otra frase motivacional
				</button>
			</motion.div>
		</div>
	);
};

export default Aprendisaje;
