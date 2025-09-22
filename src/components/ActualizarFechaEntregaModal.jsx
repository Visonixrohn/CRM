import React, { useState } from "react";

export default function ActualizarFechaEntregaModal({ open, entrega, onClose, onUpdated }) {
  const [pregunta, setPregunta] = useState(true);
  const [nuevaFecha, setNuevaFecha] = useState(entrega?.fecha_entrega || "");
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const handleActualizar = async () => {
    setLoading(true);
    // Aquí deberías llamar a la función de actualización real (API o prop)
    if (onUpdated) await onUpdated(nuevaFecha);
    setLoading(false);
    setPregunta(true);
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'#0008',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="modal-content" style={{background:'#fff',padding:32,borderRadius:12,minWidth:320,maxWidth:400,boxShadow:'0 4px 32px #0002'}}>
        {pregunta ? (
          <>
            <div style={{fontSize:20,marginBottom:16}}>¿Quieres actualizar la fecha de entrega?</div>
            <div style={{display:'flex',gap:16,justifyContent:'center'}}>
              <button onClick={()=>setPregunta(false)} style={{padding:'8px 24px',background:'#6366f1',color:'#fff',border:'none',borderRadius:8,fontWeight:'bold'}}>Sí</button>
              <button onClick={onClose} style={{padding:'8px 24px',background:'#e5e7eb',color:'#111',border:'none',borderRadius:8}}>No</button>
            </div>
          </>
        ) : (
          <>
            <div style={{fontSize:18,marginBottom:12}}>Selecciona la nueva fecha:</div>
            <input type="date" value={nuevaFecha} onChange={e=>setNuevaFecha(e.target.value)} style={{fontSize:16,padding:8,borderRadius:6,border:'1px solid #ddd',marginBottom:20}} />
            <div style={{display:'flex',gap:16,justifyContent:'center'}}>
              <button onClick={handleActualizar} disabled={loading} style={{padding:'8px 24px',background:'#22c55e',color:'#fff',border:'none',borderRadius:8,fontWeight:'bold'}}>
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
              <button onClick={onClose} style={{padding:'8px 24px',background:'#e5e7eb',color:'#111',border:'none',borderRadius:8}}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
