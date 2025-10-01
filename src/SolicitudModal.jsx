import React from "react";
import "./SolicitudModal.css";

const SolicitudModal = ({ detalle, onClose, onActualizarStatus, onEliminarSolicitud }) => {
  if (!detalle) return null;
  // Filtrar y agrupar los campos en pares
  const campos = Object.entries(detalle)
    .filter(([key, value]) => {
      const ocultar = [
        "ref persona 1 tel casa",
        "ref persona 2 tel casa",
        "ref familiar 1 tel casa",
        "ref familiar 2 tel casa",
        "usuario",
        "id",
        "status",
        "created_at"
      ];
      const normalizado = key.trim().toLowerCase().replace(/:$/, "");
      if (value === null || value === undefined || String(value).trim() === "") return false;
      return !ocultar.includes(normalizado);
    });

  // Agrupar en tríos
  const filas = [];
  for (let i = 0; i < campos.length; i += 3) {
    const trio = [];
    for (let j = 0; j < 3; j++) {
      if (campos[i + j]) {
        trio.push(campos[i + j]);
      } else {
        trio.push([null, null]);
      }
    }
    filas.push(trio);
  }

  return (
    <div className="detalle-modal" onClick={e => {
      if (e.target.classList.contains('detalle-modal')) onClose();
    }}>
      <div className="detalle-contenido">
        <div className="solicitud-modal-main">
          <h2 className="solicitud-modal-title">
            Solicitud de empleo: {detalle?.Nombre || ''}
          </h2>
          <table className="solicitud-modal-table">
            <tbody>
              {filas.map((trio, idx) => (
                <tr key={idx}>
                  {trio.map(([key, value], j) => {
                    if (!key) return [<td className="solicitud-modal-label" key={`label-${j}`}></td>, <td className="solicitud-modal-value" key={`value-${j}`}></td>];
                    const esUbicacion =
                      key.trim().toLowerCase() === "ubicación del domicilio" ||
                      key.trim().toLowerCase() === "ubicación del trabajo";
                    let urlMaps = null;
                    if (esUbicacion && value && typeof value === 'string' && value.trim().length > 0) {
                      urlMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
                    }
                    return [
                      <td className="solicitud-modal-label" key={`label-${j}`}>{key}</td>,
                      <td className="solicitud-modal-value" key={`value-${j}`}>{
                        esUbicacion && urlMaps ? (
                          <a
                            href={urlMaps}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver en Google Maps"
                            className="solicitud-modal-maps"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          </a>
                        ) : value}
                      </td>
                    ];
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="solicitud-modal-actions">
            <button onClick={() => onActualizarStatus("Tomado")}>Marcar como Tomado</button>
            <button onClick={onEliminarSolicitud} className="eliminar">Eliminar solicitud</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudModal;
