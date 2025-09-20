import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import "./DesktopMesAnalisis.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DesktopMesAnalisis = ({
  diasDelMes,
  meta,
  comisionObtenida,
  gastoMensual,
  montoProyectadoHoy,
  montoAtrasado,
  porcentajeAvance,
  estadoActual,
  metaDiaria
}) => {
  // Datos para la gráfica de barras
  const data = {
    labels: Array.from({ length: diasDelMes }, (_, i) => `${i + 1}`),
    datasets: [
      {
        label: "Meta acumulada",
        data: Array.from({ length: diasDelMes }, (_, i) => meta > 0 ? ((i + 1) / diasDelMes) * meta : 0),
        backgroundColor: "#6366f1",
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
      {
        label: "Comisión acumulada",
        data: Array.from({ length: diasDelMes }, (_, i) => (i + 1) === new Date().getDate() ? comisionObtenida : (i + 1) < new Date().getDate() ? (comisionObtenida / new Date().getDate()) * (i + 1) : null),
        backgroundColor: "#34d399",
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      }
    ]
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "Día del mes" } },
      y: { title: { display: true, text: "Lempiras" }, beginAtZero: true },
    },
  };

  return (
    <div className="desktop-analisis-flex">
      <div className="desktop-analisis-block">
        <h2 className="desktop-analisis-title">Análisis Avanzado del Mes</h2>
        <div className="desktop-analisis-bar-container">
          <Bar data={data} options={options} />
        </div>
      </div>
      <div className="desktop-analisis-summary">
        <div className="desktop-analisis-item"><span>Días del mes:</span> <strong>{diasDelMes}</strong></div>
        <div className="desktop-analisis-item"><span>Meta diaria:</span> <strong>L{metaDiaria}</strong></div>
        <div className="desktop-analisis-item"><span>Monto vendido:</span> <strong>L{comisionObtenida.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div>
        <div className="desktop-analisis-item"><span>Cobertura de gasto mensual:</span> <strong>L{(comisionObtenida - gastoMensual).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div>
        <div className="desktop-analisis-item"><span>% de cobertura de gasto mensual:</span> <strong>{gastoMensual > 0 ? ((comisionObtenida / gastoMensual) * 100).toFixed(1) : 0}%</strong></div>
        <div className="desktop-analisis-item"><span>Monto proyectado de hoy:</span> <strong>L{montoProyectadoHoy.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div>
        <div className="desktop-analisis-item"><span>Monto atrasado:</span> <strong style={{ color: '#f87171' }}>L{montoAtrasado.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></div>
        <div className="desktop-analisis-item"><span>% de avance:</span> <strong>{porcentajeAvance.toFixed(1)}%</strong></div>
        <div className="desktop-analisis-item"><span>Estado actual:</span> <strong style={{ color: estadoActual === "Atrasado" ? "#f87171" : estadoActual === "Avanzado" ? "#34d399" : "#facc15" }}>{estadoActual}</strong></div>
      </div>
    </div>
  );
};

export default DesktopMesAnalisis;
