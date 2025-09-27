import React, { useState } from "react";
import "./Aprendisaje.css";

const pasos = [
	{
		titulo: "Freeman (rapport inicial)",
		explicacion:
			"El primer contacto es clave para generar confianza y empatía. El rapport inicial consiste en conectar emocionalmente con el cliente, mostrando interés genuino y actitud positiva.",
		consejos: [
			"Sonríe y mantén contacto visual.",
			"Haz preguntas abiertas para conocer al cliente.",
			"Usa el nombre del cliente durante la conversación.",
			"Aplica la técnica de espejo: adapta tu lenguaje corporal y tono de voz al del cliente.",
			"Recuerda: la gente compra a quien le cae bien (Jürgen Klaric).",
		],
		ejercicio:
			"Practica iniciar conversaciones con desconocidos, buscando puntos en común y generando empatía rápidamente.",
	},
	{
		titulo: "Prechequeo",
		explicacion:
			"Antes de avanzar, verifica que el cliente cumple con los requisitos básicos para tu producto o servicio. Esto ahorra tiempo y enfoca la energía en prospectos calificados.",
		consejos: [
			"Haz preguntas de filtro para identificar necesidades reales.",
			"No temas descartar prospectos que no cumplen el perfil.",
			"Valida presupuesto, interés y capacidad de decisión.",
			"Recuerda: el tiempo es tu recurso más valioso.",
		],
		ejercicio:
			"Crea una lista de preguntas de prechequeo y úsalas en tu próxima llamada o reunión de ventas.",
	},
	{
		titulo: "Apertura",
		explicacion:
			"La apertura prepara el terreno para la presentación. Aquí se establece el objetivo de la reunión y se genera expectativa positiva.",
		consejos: [
			"Explica brevemente el propósito de la reunión.",
			"Haz una pregunta poderosa para captar atención.",
			"Usa frases que generen curiosidad y apertura mental.",
			"Recuerda: la apertura debe ser breve y energética.",
		],
		ejercicio:
			"Ensaya tu frase de apertura frente al espejo y mide el impacto en tu tono y lenguaje corporal.",
	},
	{
		titulo: "Presentación del producto",
		explicacion:
			"Presenta tu producto enfocándote en los beneficios emocionales y funcionales. Utiliza historias y ejemplos para conectar con el cliente.",
		consejos: [
			"Habla menos de características y más de beneficios.",
			"Utiliza storytelling para ilustrar el valor.",
			"Aplica neuroventas: activa emociones positivas y visualiza el resultado.",
			"Haz preguntas que involucren al cliente en la experiencia.",
			"Recuerda: la gente compra por emoción y justifica con lógica (Jürgen Klaric).",
		],
		ejercicio:
			"Redacta una historia breve que muestre cómo tu producto ha cambiado la vida de un cliente.",
	},
	{
		titulo: "Manejo de objeciones",
		explicacion:
			"Las objeciones son oportunidades para profundizar y aclarar dudas. Escucha con atención, valida la preocupación y responde con seguridad.",
		consejos: [
			"Escucha sin interrumpir y agradece la objeción.",
			"Reformula la objeción para mostrar comprensión.",
			"Responde con datos, testimonios o preguntas que desactiven el miedo.",
			"Usa técnicas de cierre de Alex Day: pregunta '¿Qué te detiene para tomar la decisión hoy?'.",
		],
		ejercicio:
			"Haz una lista de las objeciones más comunes y escribe respuestas efectivas para cada una.",
	},
	{
		titulo: "Cierre de la venta",
		explicacion:
			"El cierre es el momento de pedir la decisión. Hazlo con seguridad y claridad, usando técnicas directas o alternativas.",
		consejos: [
			"Utiliza preguntas de cierre: '¿Prefieres la opción A o B?'.",
			"Haz un resumen de beneficios antes de pedir la decisión.",
			"No temas al silencio: espera la respuesta con confianza.",
			"Recuerda: el cierre es un servicio, no una presión (Alex Day).",
		],
		ejercicio:
			"Practica diferentes frases de cierre y mide la reacción de tus prospectos.",
	},
	{
		titulo: "Post-venta",
		explicacion:
			"La relación no termina con la venta. El seguimiento post-venta genera fidelidad y recomendaciones. Asegúrate de que el cliente esté satisfecho y mantén el contacto.",
		consejos: [
			"Envía un mensaje de agradecimiento personalizado.",
			"Pregunta por la experiencia y ofrece soporte.",
			"Solicita retroalimentación y testimonios.",
			"Recuerda: la post-venta es el inicio de la próxima venta.",
		],
		ejercicio:
			"Diseña un protocolo de seguimiento post-venta y aplícalo en tu próxima venta.",
	},
];

const frasesMotivacion = [
	"La confianza vende más que el producto.",
	"El éxito en ventas es cuestión de actitud.",
	"No vendas productos, vende soluciones.",
	"El mejor vendedor es el que escucha más.",
	"Cada no te acerca al siguiente sí.",
	"La perseverancia vence la resistencia.",
	"Vender es ayudar a decidir.",
	"La pasión es el motor de la venta.",
	"El miedo a vender se vence vendiendo.",
	"La venta comienza cuando el cliente dice no.",
];

function getFraseMotivacional() {
	return frasesMotivacion[
		Math.floor(Math.random() * frasesMotivacion.length)
	];
}

const Accordion = ({ pasos }) => {
	const [openIndex, setOpenIndex] = useState(null);
	return (
		<div className="aprendisaje-accordion">
			{pasos.map((paso, idx) => (
				<div
					className={`aprendisaje-card${
						openIndex === idx ? " open" : ""
					}`}
					key={idx}
				>
					<div className="aprendisaje-card-row">
						<button
							className="aprendisaje-card-header"
							onClick={() =>
								setOpenIndex(openIndex === idx ? null : idx)
							}
						>
							<span className="aprendisaje-card-num">{idx + 1}</span>
							<span className="aprendisaje-card-title">{paso.titulo}</span>
							<span className="aprendisaje-card-arrow">
								{openIndex === idx ? "▲" : "▼"}
							</span>
						</button>
						{openIndex === idx && (
							<div className="aprendisaje-card-body-right">
								<div className="aprendisaje-explicacion">
									<strong>Explicación:</strong> {paso.explicacion}
								</div>
								<div className="aprendisaje-consejos">
									<strong>Consejos prácticos:</strong>
									<ul>
										{paso.consejos.map((c, i) => (
											<li key={i}>{c}</li>
										))}
									</ul>
								</div>
								<div className="aprendisaje-ejercicio">
									<strong>Ejercicio sugerido:</strong>
									<div>{paso.ejercicio}</div>
								</div>
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

const Aprendisaje = () => {
	const [frase, setFrase] = useState(getFraseMotivacional());
	return (
		<div className="aprendisaje-main">
			<h2 className="aprendisaje-title">Curso de Ventas Interactivo</h2>
			<Accordion pasos={pasos} />
			<div className="aprendisaje-motivador">
				<h3>Recuerda:</h3>
				<p>
					¡En ventas, lo que realmente vendes es{" "}
					<span className="aprendisaje-confianza">confianza</span>, no solo
					productos!
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
