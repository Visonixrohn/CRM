import React, { useState } from "react";
import { FaChartBar, FaCalculator, FaCoins, FaTrashAlt, FaPlus } from "react-icons/fa";

const cardStyle = {
  borderRadius: 18,
  padding: "24px 32px",
  minWidth: 180,
  textAlign: "center",
  boxShadow: "0 8px 32px #1976d222",
  background: "linear-gradient(120deg,#e3f2fd 80%,#fff 100%)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
  alignItems: "center",
  transition: "box-shadow 0.2s",
};

const inputStyle = {
  width: 120,
  padding: "12px 16px",
  borderRadius: 12,
  border: "2px solid #90caf9",
  fontSize: 18,
  background: "linear-gradient(90deg,#f7fafd 80%,#e3f2fd 100%)",
  marginTop: 8,
  marginBottom: 6,
  boxShadow: "0 2px 12px #90caf922",
  outline: "none",
  transition: "border 0.2s, box-shadow 0.2s",
};

const buttonStyle = {
  padding: "10px 24px",
  borderRadius: 12,
  background: "linear-gradient(90deg,#2196f3,#00b7ff)",
  color: "#fff",
  border: "none",
  fontWeight: "bold",
  fontSize: 18,
  boxShadow: "0 4px 16px #2196f322",
  cursor: "pointer",
  transition: "background 0.2s, box-shadow 0.2s",
  display: "flex",
  alignItems: "center",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 4px 24px #1976d211",
  overflow: "hidden",
  marginTop: 18,
};

const thStyle = {
  padding: 16,
  background: "linear-gradient(90deg,#e3f2fd 80%,#bbdefb 100%)",
  borderBottom: "2px solid #90caf9",
  fontWeight: 700,
  fontSize: 17,
  color: "#1976d2",
};

const tdStyle = {
  padding: 12,
  fontSize: 16,
  borderBottom: "1px solid #e0e0e0",
  background: "#fff",
};

const tdActionsStyle = {
  ...tdStyle,
  textAlign: "center",
};

const Promedios = () => {
  const [meses, setMeses] = useState(() => Number(localStorage.getItem("promedios-meses")) || 1);
  const [porcentaje, setPorcentaje] = useState(() => Number(localStorage.getItem("promedios-porcentaje")) || 0);
  const [ingresos, setIngresos] = useState(() => {
    try {
      const val = localStorage.getItem("promedios-ingresos");
      return val ? JSON.parse(val) : [];
    } catch { return []; }
  });
  const [nuevoIngreso, setNuevoIngreso] = useState("");
  const [cuotaUtilizada, setCuotaUtilizada] = useState(() => localStorage.getItem("promedios-cuotaUtilizada") || "");
  // Calcular promedio: suma total de ingresos entre los meses
  const sumaIngresos = ingresos.reduce((acc, val) => acc + parseFloat(val || 0), 0);
  const promedio = meses > 0 ? sumaIngresos / meses : 0;
  const cuotaCalculada = promedio * (porcentaje / 100);
  const cuotaUtilizadaNum = parseFloat(cuotaUtilizada) || 0;
  
  // Guardar en localStorage cada vez que cambian los datos
  React.useEffect(() => {
    localStorage.setItem("promedios-meses", meses);
  }, [meses]);
  React.useEffect(() => {
    localStorage.setItem("promedios-porcentaje", porcentaje);
  }, [porcentaje]);
  React.useEffect(() => {
    localStorage.setItem("promedios-ingresos", JSON.stringify(ingresos));
  }, [ingresos]);
  React.useEffect(() => {
    localStorage.setItem("promedios-cuotaUtilizada", cuotaUtilizada);
  }, [cuotaUtilizada]);

  // Formateador de miles con comas
  const formatNumber = (num) => {
    return num.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Handler para agregar ingreso
  const agregarIngreso = () => {
    if (nuevoIngreso !== "" && !isNaN(nuevoIngreso)) {
      setIngresos([...ingresos, parseFloat(nuevoIngreso)]);
      setNuevoIngreso("");
    }
  };

  // Handler para editar ingreso
  const editarIngreso = (idx, valor) => {
    const nuevos = [...ingresos];
    nuevos[idx] = parseFloat(valor) || 0;
    setIngresos(nuevos);
  };
  // Handler para eliminar ingreso
  const eliminarIngreso = (idx) => {
    setIngresos(ingresos.filter((_, i) => i !== idx));
  };

  // Calcular cuota restante
  const cuotaRestante = Math.max((promedio * (porcentaje / 100)) - (parseFloat(cuotaUtilizada) || 0), 0);

  return (
  <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start", margin: "40px 0", background: "#f5faff", borderRadius: 24, boxShadow: "0 8px 32px #1976d211", padding: "32px 0" }}>
      {/* Columna izquierda: Inputs y cards */}
      <div style={{ flex: 1, minWidth: 340 }}>
        <h2 style={{ marginBottom: 32, textAlign: "center", color: "#1976d2", fontWeight: 800, fontSize: 32, letterSpacing: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <FaChartBar style={{ fontSize: 32, color: "#2196f3" }} /> Promedios
        </h2>
        <div style={{ display: "flex", gap: 24, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ ...cardStyle, background: "#e3f2fd" }}>
            <FaCalculator style={{ fontSize: 28, color: "#1976d2", marginBottom: 6 }} />
            <div style={{ fontSize: 16, color: "#1976d2", fontWeight: 600 }}>Promedio</div>
            <div style={{ fontWeight: "bold", fontSize: 28, color: "#2196f3", marginTop: 2 }}>{formatNumber(promedio)}</div>
          </div>
          <div style={{ ...cardStyle, background: "#fff3e0" }}>
            <FaCoins style={{ fontSize: 28, color: "#ff9800", marginBottom: 6 }} />
            <div style={{ fontSize: 16, color: "#ff9800", fontWeight: 600 }}>Cuota calculada</div>
            <div style={{ fontWeight: "bold", fontSize: 28, color: "#ff9800", marginTop: 2 }}>{formatNumber(cuotaCalculada)}</div>
          </div>
          <div style={{ ...cardStyle, background: "#e8f5e9" }}>
            <FaCoins style={{ fontSize: 28, color: "#388e3c", marginBottom: 6 }} />
            <div style={{ fontSize: 16, color: "#388e3c", fontWeight: 600 }}>Cuota restante</div>
            <div style={{ fontWeight: "bold", fontSize: 28, color: "#388e3c", marginTop: 2 }}>{formatNumber(cuotaRestante)}</div>
          </div>
        </div>
  <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", background: "#e3f2fd", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px #1976d211", minWidth: 180 }}>
            <label style={{ fontWeight: 600, color: "#1976d2", fontSize: 16, marginBottom: 2, letterSpacing: 0.5 }}>Meses</label>
            <input
              type="number"
              min={1}
              value={meses}
              onChange={e => setMeses(Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", background: "#fff3e0", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px #ff980011", minWidth: 180 }}>
            <label style={{ fontWeight: 600, color: "#1976d2", fontSize: 16, marginBottom: 2, letterSpacing: 0.5 }}>Porcentaje</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type="number"
                min={0}
                max={100}
                value={porcentaje}
                onChange={e => setPorcentaje(Number(e.target.value))}
                style={{ ...inputStyle, paddingRight: 28 }}
              />
              <span style={{ position: "absolute", right: 12, color: "#1976d2", fontWeight: 600, fontSize: 16 }}>%</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", background: "#e8f5e9", borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 8px #388e3c11", minWidth: 180 }}>
            <label htmlFor="cuota-utilizada" style={{ fontWeight: 600, color: "#1976d2", fontSize: 16, marginBottom: 2, letterSpacing: 0.5 }}>Cuota utilizada:</label>
            <input
              id="cuota-utilizada"
              type="number"
              value={cuotaUtilizada}
              onChange={e => setCuotaUtilizada(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #ccc', fontSize: 16, minWidth: 120 }}
              placeholder="Ingrese la cuota"
            />
            <label style={{ fontWeight: 600, color: "#1976d2", fontSize: 16, marginBottom: 2, letterSpacing: 0.5, marginTop: 12 }}>Nuevo ingreso</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
              <input
                 type="number"
                 placeholder="Nuevo ingreso"
                 value={nuevoIngreso}
                 onChange={e => setNuevoIngreso(e.target.value)}
                 style={{ ...inputStyle, width: 180 }}
              />
              <button onClick={agregarIngreso} style={buttonStyle}><FaPlus style={{ marginRight: 8 }} />Agregar</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end", marginTop: 12 }}>
            <label style={{ visibility: "hidden" }}>Limpiar</label>
            <button
              onClick={() => {
                setIngresos([]);
                setMeses(1);
                setPorcentaje(0);
                setNuevoIngreso("");
                setCuotaUtilizada("");
                localStorage.removeItem("promedios-meses");
                localStorage.removeItem("promedios-porcentaje");
                localStorage.removeItem("promedios-ingresos");
                localStorage.removeItem("promedios-cuotaUtilizada");
              }}
              style={{ ...buttonStyle, background: "linear-gradient(90deg,#ff5252,#2196f3)", marginTop: 2 }}
            >
              <FaTrashAlt style={{ marginRight: 8 }} />Limpiar
            </button>
          </div>
        </div>
      </div>
      {/* Columna derecha: Tabla */}
  <div style={{ flex: 1.2, minWidth: 380, overflowX: "auto", background: "#fff", borderRadius: 18, boxShadow: "0 4px 24px #1976d211", padding: "24px 18px" }}>
  <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Ingreso</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingresos.map((valor, idx) => (
              <tr key={idx} style={{ transition: "background 0.2s" }}>
                <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: "#1976d2" }}>{idx + 1}</td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    value={valor}
                    onChange={e => editarIngreso(idx, e.target.value)}
                    style={{ ...inputStyle, width: 110, fontSize: 16, margin: 0, background: "#f7fafd", border: "1.5px solid #90caf9" }}
                  />
                  <span style={{ marginLeft: 12, color: "#2196f3", fontWeight: 600, fontSize: 16 }}>
                    {formatNumber(valor)}
                  </span>
                </td>
                <td style={tdActionsStyle}>
                  <button onClick={() => eliminarIngreso(idx)} style={{ ...buttonStyle, background: "linear-gradient(90deg,#ff5252,#ff9800)", fontSize: 16, padding: "8px 18px" }}><FaTrashAlt style={{ marginRight: 8 }} />Eliminar</button>
                </td>
              </tr>
            ))}
            {ingresos.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: 16, textAlign: "center", color: "#888", fontSize: 16 }}>No hay ingresos agregados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Promedios;
