import React from "react";
import useGestionResumen from "./useGestionResumen";
import useClientesParaHoy from "./useClientesParaHoy";
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
  // Hook para clientes para hoy
  const { cantidad: clientesParaHoy, loading: loadingClientesParaHoy, error: errorClientesParaHoy } = useClientesParaHoy();

 
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
      title: "Entregas no Gestionadas",
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
   const { gestionadosHoy, pendientes } = useGestionResumen();
  // Tarjetas de gestión
  extraCards.push({
    title: "Clientes Gestionados",
    value: gestionadosHoy,
    colorClass: "success",
    icon: "✅"
  });
  extraCards.push({
    title: "Clientes Pendientes",
    value: pendientes,
    colorClass: "warning",
    icon: "⏳"
  });
    // Card de clientes para hoy
  extraCards.push({
    title: "Clientes para hoy",
    value: loadingClientesParaHoy ? 'Cargando...' : (errorClientesParaHoy ? 'Error' : clientesParaHoy),
    colorClass: "info",
    icon: "📋"
  });
  return (
    <div className="analisis-cards-grid">
      {cards.map((card) => (
        <div className="analisis-card" key={card.title}>
          <div className="analisis-card-title">{card.icon} {card.title}</div>
          <div className="analisis-card-value">
            {typeof values[card.valueKey] === "number"
              ? (card.valueKey === "diasRestantes"
                  ? values[card.valueKey]
                  : `L${values[card.valueKey].toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
              : values[card.valueKey]}
          </div>
        </div>
      ))}
      {extraCards.map((card) => (
        <div className="analisis-card" key={card.title}>
          <div className="analisis-card-title">{card.icon} {card.title}</div>
          <div className="analisis-card-value">{card.value}</div>
        </div>
      ))}
    </div>
  );
};

export default ComisionesMobileCards;
