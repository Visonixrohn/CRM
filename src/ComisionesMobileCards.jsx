import React from "react";
import "./ComisionesMobileCards.css";

const cards = [
  {
    title: "Meta",
    valueKey: "meta",
    colorClass: "meta",
    icon: "🎯",
  },
  {
    title: "Comisión Obtenida",
    valueKey: "comisionObtenida",
    colorClass: "success",
    icon: "💵",
  },
  {
    title: "Diferencia a Meta",
    valueKey: "diferenciaMeta",
    colorClass: "danger",
    icon: "📊",
  },{
    title: "Meta Diaria",
    valueKey: "metaHoy",
    colorClass: "neutral",
    icon: "📈",
  },
  {
    title: "Días Restantes",
    valueKey: "diasRestantes",
    colorClass: "primary",
    icon: "📆",
  },
  
];

const ComisionesMobileCards = ({ meta, comisionObtenida, diferenciaMeta, diasRestantes, metaHoy, entregasPendientesAtrasadas, entregasParaHoy, entregasNoGestionadas }) => {
  const values = { meta, comisionObtenida, diferenciaMeta, diasRestantes, metaHoy };
  const extraCards = [];
   if (entregasParaHoy > 0) {
    extraCards.push({
      title: "Entregas para Hoy",
      value: entregasParaHoy,
      colorClass: "warning",
      icon: "📅"
    });
  }
   if (entregasNoGestionadas > 0) {
    extraCards.push({
      title: "No Gestionadas",
      value: entregasNoGestionadas,
      colorClass: "info",
      icon: "🕓"
    });
  }
  if (entregasPendientesAtrasadas > 0) {
    extraCards.push({
      title: "Entregas Atrasadas",
      value: entregasPendientesAtrasadas,
      colorClass: "danger",
      icon: "⏰"
    });
  }
 
 
  return (
    <div className="comisiones-mobile-cards">
      {cards.map((card) => (
        <div className={`com-card-mobile ${card.colorClass}`} key={card.title}>
          <span className="com-card-mobile-icon">{card.icon}</span>
          <span className="com-card-mobile-title">{card.title}</span>
          <strong className="com-card-mobile-value">
            {typeof values[card.valueKey] === "number"
              ? (card.valueKey === "diasRestantes"
                  ? values[card.valueKey]
                  : `Lps: ${values[card.valueKey].toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
              : values[card.valueKey]}
          </strong>
        </div>
      ))}
      {extraCards.map((card) => (
        <div className={`com-card-mobile ${card.colorClass}`} key={card.title}>
          <span className="com-card-mobile-icon">{card.icon}</span>
          <span className="com-card-mobile-title">{card.title}</span>
          <strong className="com-card-mobile-value">{card.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default ComisionesMobileCards;
