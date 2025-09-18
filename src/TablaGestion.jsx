import React from "react";
import "./TablaGestion.css";

const TablaGestion = ({ clientes, onCopyId, onWhatsApp, onLink, onMarcarGestion }) => (
  <div className="tabla-gestion-container">
    <table className="tabla-gestion">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombres</th>
          <th>Apellidos</th>
          <th>Teléfono</th>
          <th>Tienda</th>
          <th>Estado</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((cliente) => {
          // Mapear estado integer a texto
          const estadoMap = {
            0: 'No contestan',
            1: 'No quiere',
            2: 'Sí quiere',
            3: 'A eliminar',
            null: '',
            undefined: ''
          };
          const estadoTxt = estadoMap[cliente.estado];
          return (
            <tr key={cliente.ID || cliente.id}>
              <td>
                {String(cliente.ID || cliente.id).length === 12
                  ? '0' + String(cliente.ID || cliente.id)
                  : cliente.ID || cliente.id}
                <span
                  className="copy-btn"
                  title="Copiar ID"
                  style={{ marginLeft: 5 }}
                  onClick={e => {
                    const idStr = String(cliente.ID || cliente.id);
                    const idToCopy = idStr.length === 12 ? '0' + idStr : idStr;
                    onCopyId(idToCopy, e);
                  }}
                >📋</span>
              </td>
              <td>{cliente.NOMBRES || cliente.nombre}</td>
              <td>{cliente.APELLIDOS || cliente.apellido}</td>
              <td>{cliente.TELEFONO || cliente.tel}</td>
              <td>{cliente.TIENDA || cliente.tienda}</td>
              <td>{estadoTxt}</td>
              <td>
                <button onClick={() => onWhatsApp(cliente)}>Enviar</button>
                <button style={{marginLeft:4,marginRight:4}} onClick={() => onLink(cliente)}>Link</button>
                <button className="remove" onClick={() => onMarcarGestion(cliente)}>Marcar gestion</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default TablaGestion;
