import React from "react";
import styles from "./AmortizacionCardsMobile.module.css";

// Recibe las mismas props que TablaAmortizacion
const AmortizacionCardsMobile = ({ capital, prima, tasa, planNombre, plazoSeleccionado }) => {
  const plazos = [3, 6, 9, 12, 15, 18, 24, 36];
  if (planNombre && planNombre.trim().toUpperCase() === 'LC MOTO') {
    plazos.push(48);
  }
  const capitalFinanciar = Math.max(capital - prima, 0);
  const filas = plazos.map(pz => {
    const cuotaMensual = (capitalFinanciar > 0 && pz > 0 && tasa > 0)
      ? Math.round((capitalFinanciar * tasa) / (1 - Math.pow(1 + tasa, -pz)))
      : 0;
    const totalPagar = cuotaMensual * pz;
    return {
      plazo: pz,
      prima,
      cuotaMensual,
      totalPagar
    };
  });
  return (
    <div className={styles.cardsContainer}>
      {filas.map(fila => (
        <div
          key={fila.plazo}
          className={fila.plazo === plazoSeleccionado ? styles.selectedCard : styles.card}
        >
          <div className={styles.cardRow}><b>Tiempo:</b> {fila.plazo} meses</div>
          <div className={styles.cardRow}><b>Prima:</b> L {Number(fila.prima).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={styles.cardRow}><b>Cuota mensual:</b> L {fila.cuotaMensual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className={styles.cardRow}><b>Total a pagar:</b> L {fila.totalPagar.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      ))}
    </div>
  );
};

export default AmortizacionCardsMobile;
