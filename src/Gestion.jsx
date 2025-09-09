

import React, { useEffect, useState, useRef } from "react";
import "./Gestion.css";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnLNqq5vEQ5o0QhUIyywnvarUCMkVPA-n2B6ZConXYgL5hUuEvhj6J0Ejp430PK7NCzYGopGaJOw0Y/pub?output=csv";
const MENSAJE_DEFAULT = `Hola 😇 {NOMBRE},\nLe saluda Miguel de Curacao Roatán. Usted es parte de nuestros CLIENTES ESPECIALES 💎 y queremos invitarle a unirse a nuestro grupo exclusivo de promociones en WhatsApp 📲.\n\n¡Descubra ofertas únicas solo para usted y aproveche descuentos increíbles! 🎁🔥\n\n👉 Únase aquí: https://chat.whatsapp.com/GxyudGf4OZ8ET6PilXjVCj\n\nSerá un placer atenderle,\nAtt. Miguel Romero`;

function parseCSV(data) {
  const rows = data.split("\n").slice(1);
  return rows
    .map((r) => {
      const cols = r.split(",");
      if (cols.length < 9) return null;
      return {
        tienda: cols[6] || "",
        cadena: cols[1] || "",
        apellido: cols[2] || "",
        nombre: cols[3] || "",
        depto: cols[4] || "",
        muni: cols[5] || "",
        id: cols[0] || "",
        tel: cols[7] || "",
        segmento: cols[8] || "",
      };
    })
    .filter((c) => c && c.tel);
}

const Gestion = () => {
  const [clientes, setClientes] = useState([]);
  const [mensajeBase, setMensajeBase] = useState(() => localStorage.getItem("mensajeBase") || MENSAJE_DEFAULT);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState(["", "", "", "", ""]);
  const [lastRemoved, setLastRemoved] = useState(null);
  const [update, setUpdate] = useState(0);
  const mensajeRef = useRef();

  // Cargar clientes desde Google Sheets
  useEffect(() => {
    fetch(SHEET_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Error al cargar la hoja: ${res.status}`);
        return res.text();
      })
      .then((data) => {
        const parsed = parseCSV(data);
        if (parsed.length === 0) {
          setError("No se encontraron clientes con números de teléfono válidos.");
        }
        setClientes(parsed);
      })
      .catch((err) => {
        setError("Error al cargar los datos: " + err.message);
      });
  }, []);

  // Gestionados hoy
  const hoy = new Date().toLocaleDateString();
  const gestionados = JSON.parse(localStorage.getItem("gestionados") || "[]");
  const countGestionados = gestionados.filter((g) => g.fecha === hoy).length;

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((c) =>
    filtros.every((f, i) => {
      if (!f) return true;
      const val = [c.id, c.nombre, c.apellido, c.tel, c.tienda][i] || "";
      return val.toLowerCase().includes(f.toLowerCase());
    })
  );

  // Quitar cliente
  const quitarCliente = (cliente) => {
    const nuevo = [...gestionados, { id: cliente.id, fecha: hoy }];
    localStorage.setItem("gestionados", JSON.stringify(nuevo));
    setLastRemoved({ id: cliente.id, fecha: hoy });
    setUpdate((u) => u + 1);
  };

  // Restaurar último quitado
  const restaurarCliente = () => {
    if (lastRemoved) {
      let nuevo = gestionados.filter(
        (g) => !(g.id === lastRemoved.id && g.fecha === lastRemoved.fecha)
      );
      localStorage.setItem("gestionados", JSON.stringify(nuevo));
      setLastRemoved(null);
      setUpdate((u) => u + 1);
    } else {
      setError("No hay filas para restaurar.");
    }
  };

  // Copiar al portapapeles
  const copyToClipboard = (text, e) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        e.target.innerHTML = "✔";
        setTimeout(() => {
          e.target.innerHTML = "📋";
        }, 2000);
      });
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        e.target.innerHTML = "✔";
        setTimeout(() => {
          e.target.innerHTML = "📋";
        }, 2000);
      } catch (err) {
        setError("Error al copiar el ID: Copia no soportada en este navegador.");
      }
    }
  };

  // Enviar WhatsApp
  const enviarWhatsApp = (cliente) => {
    const texto = encodeURIComponent(
      mensajeBase.replace("{NOMBRE}", cliente.nombre)
    );
    const url = `https://web.whatsapp.com/send?phone=504${cliente.tel}&text=${texto}`;
    window.open(url, "_blank");
  };

  // Guardar mensaje
  const guardarMensaje = () => {
    setMensajeBase(mensajeRef.current.value);
    localStorage.setItem("mensajeBase", mensajeRef.current.value);
    setModalOpen(false);
  };

  // Filtros inputs
  const handleFiltro = (i, val) => {
    setFiltros((f) => {
      const nuevo = [...f];
      nuevo[i] = val;
      return nuevo;
    });
  };

  // Actualizar al quitar/restaurar
  useEffect(() => {
    // Forzar re-render al cambiar gestionados
  }, [update]);

  return (
    <div>
    
      <div className="cards">
        <div className="card">
          <h2>{clientes.length}</h2>
          <p>Total Clientes</p>
        </div>
        <div className="card">
          <h2>{countGestionados}</h2>
          <p>Gestionados Hoy</p>
        </div>
        <div className="card">
          <h2>{clientes.length - countGestionados}</h2>
          <p>Pendientes</p>
        </div>
      </div>
      <div className="filters">
        <button onClick={() => setModalOpen(true)}>Mensaje</button>
        <button onClick={restaurarCliente}>Regresar</button>
      </div>
      <div className="table-container">
        <table id="clientesTable">
          <thead>
            <tr>
              <th>
                ID
                <br />
                <input
                  type="text"
                  value={filtros[0]}
                  onChange={(e) => handleFiltro(0, e.target.value)}
                />
              </th>
              <th>
                Nombres
                <br />
                <input
                  type="text"
                  value={filtros[1]}
                  onChange={(e) => handleFiltro(1, e.target.value)}
                />
              </th>
              <th>
                Apellidos
                <br />
                <input
                  type="text"
                  value={filtros[2]}
                  onChange={(e) => handleFiltro(2, e.target.value)}
                />
              </th>
              <th>
                Teléfono
                <br />
                <input
                  type="text"
                  value={filtros[3]}
                  onChange={(e) => handleFiltro(3, e.target.value)}
                />
              </th>
              <th>
                Tienda
                <br />
                <input
                  type="text"
                  value={filtros[4]}
                  onChange={(e) => handleFiltro(4, e.target.value)}
                />
              </th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados
              .filter((cliente) =>
                !gestionados.some((g) => g.id === cliente.id && g.fecha === hoy)
              )
              .map((cliente) => (
                <tr key={cliente.id}>
                  <td>
                    {cliente.id}
                    <span
                      className="copy-btn"
                      title="Copiar ID"
                      style={{ marginLeft: 5 }}
                      onClick={(e) => copyToClipboard(cliente.id, e)}
                    >
                      📋
                    </span>
                  </td>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.apellido}</td>
                  <td>{cliente.tel}</td>
                  <td>{cliente.tienda}</td>
                  <td>
                    <button onClick={() => enviarWhatsApp(cliente)}>
                      Enviar
                    </button>
                    <button className="remove" onClick={() => quitarCliente(cliente)}>
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* Modal para mensaje */}
      {modalOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>Editar Mensaje</h3>
            <textarea ref={mensajeRef} defaultValue={mensajeBase} />
            <br />
            <br />
            <button onClick={guardarMensaje}>Guardar</button>
            <button onClick={() => setModalOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
      {/* Mensaje de error */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Gestion;
