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


import GASelectorRows from "./GASelectorRows";
import GASelectorRowsModal from "./GASelectorRowsModal";
import GASelectorRowsMobile from "./GASelectorRowsMobile";
import GASelectorRowsMobileModal from "./GASelectorRowsMobileModal";
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
  const [rows, setRows] = useState([
    { precio: 0, depto: '', total: 0, gaEnabled: true }
  ]);
  const capital = rows.reduce((acc, row) => acc + (Number(row.total) || 0), 0);
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
  const [modalGAOpen, setModalGAOpen] = useState(false);
  const [modalPPlusOpen, setModalPPlusOpen] = useState(false);
  // Obtener usuario actual para WhatsApp
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) setUsuarioId(userId);
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

    // Modal para registrar plan (desktop y mobile)
    const handleAddPlan = async (e) => {
      e.preventDefault();
      setAgregando(true);
      const { error } = await supabase.from("planes").insert({ plan: nuevoPlan, tasa: Number(nuevaTasa) });
      if (!error) {
        setNuevoPlan("");
        setNuevaTasa("");
        setModalOpen(false);
        // Refrescar lista de planes
        const { data } = await supabase.from("planes").select();
        setPlanes(data || []);
      }
      setAgregando(false);
    };

    const modalPlan = modalOpen && (
      <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}}>
        <form onSubmit={handleAddPlan} style={{background:'#fff',padding:24,borderRadius:8,minWidth:300,boxShadow:'0 2px 12px #0003',display:'flex',flexDirection:'column',gap:12}}>
          <h3>Registrar nuevo plan</h3>
          <label>
            Nombre del plan
            <input value={nuevoPlan} onChange={e=>setNuevoPlan(e.target.value)} required />
          </label>
          <label>
            Tasa (%)
            <input type="number" value={nuevaTasa} onChange={e=>setNuevaTasa(e.target.value)} min={0.01} step={0.01} required />
          </label>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button type="button" onClick={()=>setModalOpen(false)} style={{background:'#eee',border:'none',padding:'6px 16px',borderRadius:4}}>Cancelar</button>
            <button type="submit" disabled={agregando} style={{background:'#1976d2',color:'#fff',border:'none',padding:'6px 16px',borderRadius:4}}>{agregando ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    );
  // Cuando cambia el plan seleccionado, actualizar la tasa
  useEffect(() => {
    if (planSeleccionado && planes.length > 0) {
      const plan = planes.find(p => p.id === Number(planSeleccionado));
      if (plan) {
        setTasa(Number(plan.tasa) / 100);
        if (plan.plan && plan.plan.trim().toLowerCase() === 'plan 50/50') {
          // Calcular 50% del total de precios
          const totalPrecios = rows.reduce((acc, row) => acc + (Number(row.precio) || 0), 0);
          setPrima(Number((totalPrecios * 0.5).toFixed(2)));
        }
      }
    }
  }, [planSeleccionado, planes, rows]);
  const capitalFinanciar = Math.max(capital - prima, 0);

  // Para mostrar la cuota esperada
  const cuota = capitalFinanciar > 0 && plazo > 0 && tasa > 0
    ? Math.round((capitalFinanciar * tasa) / (1 - Math.pow(1 + tasa, -plazo)))
    : 0;

  // Manejar registro en Supabase
  const handleGAFormSubmit = async ({ depto, porcentaje }) => {
    await supabase.from("ga_registros").insert({ depto, porcentaje });
    // Aquí podrías mostrar un mensaje de éxito o refrescar datos si es necesario
  };
              {/* GASelectorRows debajo del botón GA + */}
              <div style={{marginTop: '16px'}}>
                <GASelectorRows />
              </div>

  return (
    <div className={styles.cotizacionesContainer}>
      <div className={styles.cotizacionesHeader}>
        <h2>COTIZACIONES</h2>
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
              <input type="number" value={capital} readOnly style={{background:'#f3f3f3'}} />
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
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>
                {[3,6,9,12,15,18,24,36,48].map(val => (
                  <button
                    key={val}
                    type="button"
                    style={{
                      background: plazo === val ? '#1976d2' : '#eee',
                      color: plazo === val ? '#fff' : '#222',
                      border: 'none',
                      borderRadius: 4,
                      padding: '4px 10px',
                      cursor: 'pointer',
                      fontWeight: plazo === val ? 'bold' : 'normal'
                    }}
                    onClick={() => setPlazo(val)}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </label>
          </form>
          <div className={formCardStyles.formCardCuota}>

            Cuota mensual estimada: <span>L {cuota}</span><br />

            Total a pagar: <span>L {cuota * plazo}</span>

        
            <br />
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button type="button" style={{background:'#1976d2', color:'#fff', border:'none', borderRadius:4, padding:'4px 12px', cursor:'pointer'}} onClick={() => setModalGAOpen(true)}>
                Registrar GA %
              </button>
              <button type="button" style={{background:'#43a047', color:'#fff', border:'none', borderRadius:4, padding:'4px 12px', cursor:'pointer'}} onClick={() => setModalPPlusOpen(true)}>
                Agregar roductos 
              </button>
            </div>
          </div>
          {modalGAOpen && (
            <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0008',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
              <div>
                <GAForm onClose={() => setModalGAOpen(false)} onSubmit={handleGAFormSubmit} />
              </div>
            </div>
          )}
          {/* Solo desktop */}
          <div className="showOnlyDesktop">
            <GASelectorRowsModal open={modalPPlusOpen} onClose={() => setModalPPlusOpen(false)} rows={rows} setRows={setRows} />
          </div>
          {/* Solo móvil: modal */}
          <GASelectorRowsMobileModal open={modalPPlusOpen} onClose={() => setModalPPlusOpen(false)} rows={rows} setRows={setRows} />
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
  {modalPlan}
      {/* Modal solo para desktop */}
      <CotizacionWhatsappModal
        open={modalWhatsappOpen}
        onClose={() => setModalWhatsappOpen(false)}
        usuarioId={usuarioId}
        nombreUsuario={localStorage.getItem("nombre") || ""}
        plazo={plazo}
        prima={prima}
        cuota={cuota}
        productoDefault={rows.map(r => r.depto || '').filter(Boolean).join(', ')}
      />
    </div>
  );
}
import GAForm from "./GAForm";
export default Cotizaciones;

// Eliminar importación duplicada de GASelectorRows
