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
  },
  {
    title: "Días Restantes",
    valueKey: "diasRestantes",
    colorClass: "primary",
    icon: "📆",
  },
  {
    title: "Meta Diaria",
    valueKey: "metaHoy",
    colorClass: "neutral",
    icon: "📈",
  },
];

const ComisionesMobileCards = ({ meta, comisionObtenida, diferenciaMeta, diasRestantes, metaHoy }) => {
  const values = { meta, comisionObtenida, diferenciaMeta, diasRestantes, metaHoy };
  return (
    <div className="comisiones-mobile-cards">
      {cards.map((card) => (
        <div className={`com-card-mobile ${card.colorClass}`} key={card.title}>
          <span className="com-card-mobile-icon">{card.icon}</span>
          <span className="com-card-mobile-title">{card.title}</span>
          <strong className="com-card-mobile-value">
            {typeof values[card.valueKey] === "number"
              ? `L${values[card.valueKey].toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : values[card.valueKey]}
          </strong>
        </div>
      ))}
    </div>
  );
};

export default ComisionesMobileCards;
