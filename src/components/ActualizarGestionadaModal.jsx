import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const opcionesGestionada = [
  "Gestionada",
  "No gestionada"
];

const ActualizarGestionadaModal = ({ open, entrega, onClose, onUpdated }) => {
  const [gestionada, setGestionada] = useState(entrega?.gestionada || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !entrega) return null;

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ gestionada })
        .eq("id", entrega.id);
      if (error) throw error;
      if (typeof onUpdated === "function") onUpdated(gestionada);
      onClose();
    } catch (e) {
      setError(e.message || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(30,41,59,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:3000,backdropFilter:'blur(2px)'}}>
      <div style={{background:'linear-gradient(135deg,#f8fafc 60%,#e0e7ff 100%)',borderRadius:18,padding:'32px 28px 24px 28px',minWidth:320,maxWidth:380,boxShadow:'0 8px 32px #0002',position:'relative',border:'1.5px solid #c7d2fe'}}>
        <button onClick={onClose} style={{position:'absolute',top:12,right:16,fontSize:'1.7rem',background:'none',border:'none',color:'#64748b',cursor:'pointer',transition:'color .2s'}} onMouseOver={e=>e.target.style.color='#ef4444'} onMouseOut={e=>e.target.style.color='#64748b'}>×</button>
        <h2 style={{margin:'0 0 18px 0',color:'#1e293b',fontWeight:700,fontSize:'1.25rem',letterSpacing:'.01em',textAlign:'center'}}>Actualizar Gestión</h2>
        <div style={{marginBottom:18}}>
          <label style={{display:'block',marginBottom:6,color:'#334155',fontWeight:500,fontSize:'.98em'}}>Estado de gestión</label>
          <select value={gestionada} onChange={e => setGestionada(e.target.value)} style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1.5px solid #cbd5e1',background:'#fff',fontSize:'1em',color:'#334155',outline:'none',transition:'border .2s',boxShadow:'0 1px 4px #64748b11'}}>
            <option value="">Selecciona estado</option>
            {opcionesGestionada.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <button onClick={handleSave} disabled={loading || !gestionada} style={{background:'linear-gradient(90deg,#6366f1 60%,#2563eb 100%)',color:'#fff',border:'none',borderRadius:8,padding:'10px 0',fontWeight:'bold',width:'100%',fontSize:'1.08em',boxShadow:'0 2px 8px #6366f122',letterSpacing:'.01em',transition:'background .2s',cursor:loading||!gestionada?'not-allowed':'pointer',opacity:loading||!gestionada?0.7:1}}>
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
        {error && <div style={{color:'#ef4444',marginTop:12,textAlign:'center',fontWeight:500}}>{error}</div>}
      </div>
    </div>
  );
};

export default ActualizarGestionadaModal;
