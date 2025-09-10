
import ModalForm from "./ModalForm";
import modalFormStyles from "./ModalForm.module.css";
import React from "react";
import { createPortal } from "react-dom";
import styles from "./Cotizaciones.module.css";
import tablaStyles from "./TablaAmortizacion.module.css";
import formCardStyles from "./FormCard.module.css";
import RegistrarPlanMobile from "./RegistrarPlanMobile";
import cardMobileStyles from "./CardMobile.module.css";
import CotizacionWhatsappModal from "./CotizacionWhatsappModal";


import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function TablaAmortizacion({ capital, tasa, plazo }) {
  const tabla = generarTablaAmortizacion(capital, tasa, plazo);
  return (
    <table className={tablaStyles.tablaAmortizacion}>
      <thead>
        <tr>
          <th>Mes</th>
          <th>Cuota</th>
          <th>Interés</th>
          <th>Capital</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>
        {tabla.map((fila) => (
          <tr key={fila.mes}>
            <td>{fila.mes}</td>
            <td>L {fila.cuota}</td>
            <td>L {fila.interes}</td>
            <td>L {fila.capital}</td>
            <td>L {fila.saldo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function generarTablaAmortizacion(capital, tasa, plazo) {
  const i = tasa;
  const cuota = (capital * i) / (1 - Math.pow(1 + i, -plazo));
  let saldo = capital;
  const tabla = [];

  for (let mes = 1; mes <= plazo; mes++) {
    const interes = saldo * i;
    const abonoCapital = cuota - interes;
    saldo -= abonoCapital;

    tabla.push({
      mes,
      cuota: cuota.toFixed(2),
      interes: interes.toFixed(2),
      capital: abonoCapital.toFixed(2),
      saldo: saldo > 0 ? saldo.toFixed(2) : "0.00"
    });
  }

  return tabla;
}

const Cotizaciones = () => {
  const [capital, setCapital] = useState(0);
  const [prima, setPrima] = useState(0);
  const [tasa, setTasa] = useState(0.02); // 2% mensual
  const [plazo, setPlazo] = useState(12);
  const [planes, setPlanes] = useState([]);
  const [planSeleccionado, setPlanSeleccionado] = useState("");
  const [nuevoPlan, setNuevoPlan] = useState("");
  const [nuevaTasa, setNuevaTasa] = useState("");
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalWhatsappOpen, setModalWhatsappOpen] = useState(false);
  const [usuarioId, setUsuarioId] = useState("");
  // Obtener usuario actual para WhatsApp
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUsuarioId(data.user.id);
    }
    getUser();
  }, []);

  // Cargar planes desde Supabase
  useEffect(() => {
    async function fetchPlanes() {
      setLoadingPlanes(true);
      const { data, error } = await supabase.from("planes").select();
      if (!error) setPlanes(data || []);
      setLoadingPlanes(false);
    }
    fetchPlanes();
  }, []);

    // Modal solo para móviles
    const modalMobile = (
      <div className="showOnlyMobile">
        <RegistrarPlanMobile
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onAddPlan={async (nuevoPlan, nuevaTasa, resetPlan, resetTasa) => {
            setAgregando(true);
            const { error } = await supabase.from("planes").insert({ plan: nuevoPlan, tasa: Number(nuevaTasa) });
            if (!error) {
              resetPlan("");
              resetTasa("");
              setModalOpen(false);
              // Refrescar lista de planes
              const { data } = await supabase.from("planes").select();
              setPlanes(data || []);
            }
            setAgregando(false);
          }}
        />
      </div>
    );
  // Cuando cambia el plan seleccionado, actualizar la tasa
  useEffect(() => {
    if (planSeleccionado && planes.length > 0) {
      const plan = planes.find(p => p.id === Number(planSeleccionado));
      if (plan) setTasa(Number(plan.tasa) / 100);
    }
  }, [planSeleccionado, planes]);
  const capitalFinanciar = Math.max(capital - prima, 0);

  // Para mostrar la cuota esperada
  const cuota = capitalFinanciar > 0 && plazo > 0 && tasa > 0
    ? Math.round((capitalFinanciar * tasa) / (1 - Math.pow(1 + tasa, -plazo)))
    : 0;

  return (
    <div className={styles.cotizacionesContainer}>
      <div className={styles.cotizacionesHeader}>
        <h2>Tabla de Amortización</h2>
        <div style={{display: 'flex', gap: 12}}>
          <button className={styles.cotizacionesAddBtn} onClick={() => setModalOpen(true)}>
            + Registrar nuevo plan
          </button>
          <button className={styles.cotizacionesAddBtn} style={{background: '#25d366'}} onClick={() => setModalWhatsappOpen(true)}>
            WhatsApp Cotización
          </button>
        </div>
      </div>
      {/* Contenedor especial para mobile */}
      <div className={cardMobileStyles.mobileCardsContainer}>
        <div className={`${formCardStyles.formCard} ${cardMobileStyles.cardMobile}`}>
          <div className={cardMobileStyles.cardMobileTitle}>Cotizador</div>
          <form className={formCardStyles.formCardForm} onSubmit={e => e.preventDefault()}>
            <label>
              Capital
              <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} min={1} />
            </label>
            <label>
              Prima
              <input type="number" value={prima} onChange={e => setPrima(Number(e.target.value))} min={0} max={capital} />
            </label>
            <label>
              Plan
              <select value={planSeleccionado} onChange={e => setPlanSeleccionado(e.target.value)}>
                <option value="">Selecciona un plan</option>
                {planes.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.plan} </option>
                ))}
              </select>
              {loadingPlanes && <span> Cargando...</span>}
            </label>
            {/*
            <label>
              Tasa mensual (%)
              <input type="number" value={tasa * 100} onChange={e => setTasa(Number(e.target.value) / 100)} min={0.01} step={0.01} />
            </label>
            */}
            <label>
              Plazo (meses)
              <input type="number" value={plazo} onChange={e => setPlazo(Number(e.target.value))} min={1} />
            </label>
          </form>
          <div className={formCardStyles.formCardCuota}>
            Cuota mensual estimada: <span>L {cuota}</span>
          </div>
          {planSeleccionado && planes.length > 0 && (() => {
            const plan = planes.find(p => p.id === Number(planSeleccionado));
            return plan ? (
              <div className={formCardStyles.formCardCuota}>
                <span>tasa: {Number(plan.tasa).toLocaleString(undefined, { maximumFractionDigits: 2 })}% </span>
              </div>
            ) : null;
          })()}
        </div>
        <div className={`${styles.cotizacionesTableWrap} ${cardMobileStyles.cardMobile}`} style={{marginTop: 0}}>
          <div className={cardMobileStyles.cardMobileTitle}>Tabla de Amortización</div>
          <TablaAmortizacion capital={capitalFinanciar} tasa={tasa} plazo={plazo} />
        </div>
      </div>
      {modalMobile}
      {/* Modal solo para desktop */}
      <CotizacionWhatsappModal
        open={modalWhatsappOpen}
        onClose={() => setModalWhatsappOpen(false)}
        usuarioId={usuarioId}
        plazo={plazo}
        prima={prima}
        cuota={cuota}
        productoDefault={''}
      />
    </div>
  );
}
export default Cotizaciones;
