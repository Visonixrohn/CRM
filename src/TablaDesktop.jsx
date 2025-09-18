import React from "react";

export default function TablaDesktop({ filas, onWhatsApp, onLink, onMarcarGestion, copyToClipboard }) {
  return (
    <div style={{overflowX:'auto',margin:'0 auto',maxWidth:1200}}>
      <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:12,boxShadow:'0 2px 8px 0 rgba(80,80,120,0.08)'}}>
        <thead>
          <tr style={{background:'#f3f4f6'}}>
            <th style={{padding:'14px 12px'}}>ID</th>
            <th style={{padding:'14px 12px'}}>Nombre</th>
            <th style={{padding:'14px 12px'}}>Teléfono</th>
            <th style={{padding:'14px 12px'}}>Tienda</th>
            <th style={{padding:'14px 12px'}}>Actualizado</th>
            <th style={{padding:'14px 12px'}}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {filas.map(cliente => (
            <tr key={cliente.ID || cliente.id} style={{borderBottom:'1px solid #e5e7eb'}}>
              <td style={{padding:'12px'}}>
                {cliente.ID || cliente.id}
                <span
                  title="Copiar ID"
                  style={{cursor:'pointer',fontSize:17,marginLeft:6,verticalAlign:'middle'}}
                  onClick={e => copyToClipboard(cliente.ID || cliente.id, e)}
                  role="button"
                >📋</span>
              </td>
              <td style={{padding:'12px'}}>{cliente.NOMBRES || cliente.nombre} {cliente.APELLIDOS || cliente.apellido}</td>
              <td style={{padding:'12px',display:'flex',alignItems:'center',gap:6}}>
                {cliente.TELEFONO || cliente.tel}
                <a
                  href={`tel:${cliente.TELEFONO || cliente.tel}`}
                  title="Llamar"
                  style={{color:'#25D366',fontWeight:'bold',textDecoration:'none',fontSize:'1.15em',marginLeft:6,verticalAlign:'middle'}}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📞
                </a>
              </td>
              <td style={{padding:'12px'}}>{cliente.TIENDA || cliente.tienda}</td>
              <td style={{padding:'12px'}}>{cliente.updated_at}</td>
              <td style={{padding:'12px'}}>
                <button onClick={() => onWhatsApp(cliente)} style={{background:'#25D366',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontWeight:600,cursor:'pointer'}}>WhatsApp</button>
                <button style={{background:'#007bff',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontWeight:600,cursor:'pointer',marginLeft:4,marginRight:4}} onClick={() => onLink(cliente)}>Link</button>
                <button className="remove" style={{background:'#f59e42',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontWeight:600,cursor:'pointer'}} onClick={() => onMarcarGestion(cliente)}>Marcar gestión</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
