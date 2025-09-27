import React, { useState } from "react";

const cardStyle = {
  borderRadius: 12,
  padding: "18px 24px",
  minWidth: 140,
  textAlign: "center",
  boxShadow: "0 4px 18px #0002",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const inputStyle = {
  width: 100,
  padding: "10px 14px",
  borderRadius: 10,
  border: "2px solid #90caf9",
  fontSize: 17,
  background: "linear-gradient(90deg,#f7fafd 80%,#e3f2fd 100%)",
  marginTop: 6,
  marginBottom: 4,
  boxShadow: "0 2px 8px #90caf922",
  outline: "none",
  transition: "border 0.2s, box-shadow 0.2s",
};

const buttonStyle = {
  padding: "8px 20px",
  borderRadius: 8,
  background: "linear-gradient(90deg,#2196f3,#00b7ff)",
  color: "#fff",
  border: "none",
  fontWeight: "bold",
  fontSize: 16,
  boxShadow: "0 2px 8px #2196f322",
  cursor: "pointer",
  transition: "background 0.2s",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 2px 12px #0001",
  overflow: "hidden",
  marginTop: 12,
};

const thStyle = {
  padding: 12,
  background: "#e3f2fd",
  borderBottom: "2px solid #90caf9",
  fontWeight: 600,
  fontSize: 15,
  color: "#1976d2",
};

const tdStyle = {
  padding: 10,
  fontSize: 15,
  borderBottom: "1px solid #e0e0e0",
  background: "#fff",
};

const tdActionsStyle = {
  ...tdStyle,
  textAlign: "center",
};

const Promedios = () => {
  const [meses, setMeses] = useState(1);
  const [porcentaje, setPorcentaje] = useState(0);
  const [ingresos, setIngresos] = useState([]);
  const [nuevoIngreso, setNuevoIngreso] = useState("");

  // Calcular promedio: suma total de ingresos entre los meses
  const sumaIngresos = ingresos.reduce((acc, val) => acc + parseFloat(val || 0), 0);
  const promedio = meses > 0 ? sumaIngresos / meses : 0;
  const cuotaCalculada = promedio * (porcentaje / 100);

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

  return (
    <div style={{
      padding: "2.5rem 1rem 2rem 1rem",
      maxWidth: 1400,
      margin: "0 auto",
      background: "linear-gradient(120deg,#e3f2fd 60%,#fff 100%)",
      borderRadius: 18,
      boxShadow: "0 8px 32px #2196f322",
      minHeight: 480,
      display: "flex",
      gap: 48,
      flexDirection: "row",
      alignItems: "flex-start"
    }}>
      {/* Columna izquierda: Inputs y cards */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <h2 style={{ marginBottom: 28, textAlign: "center", color: "#1976d2", fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>Promedios</h2>
        <div style={{ display: "flex", gap: 18, marginBottom: 28, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ ...cardStyle, background: "#e3f2fd" }}>
            <div style={{ fontSize: 15, color: "#1976d2", fontWeight: 500 }}>Promedio</div>
            <div style={{ fontWeight: "bold", fontSize: 26, color: "#2196f3", marginTop: 2 }}>{formatNumber(promedio)}</div>
          </div>
          <div style={{ ...cardStyle, background: "#fff3e0" }}>
            <div style={{ fontSize: 15, color: "#ff9800", fontWeight: 500 }}>Cuota calculada</div>
            <div style={{ fontWeight: "bold", fontSize: 26, color: "#ff9800", marginTop: 2 }}>{formatNumber(cuotaCalculada)}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, marginBottom: 18, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <label style={{ fontWeight: 600, color: "#1976d2", fontSize: 16, marginBottom: 2, letterSpacing: 0.5 }}>Meses</label>
            <input
              type="number"
              min={1}
              value={meses}
              onChange={e => setMeses(Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
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
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <label style={{ fontWeight: 600, color: "#1976d2", fontSize: 16, marginBottom: 2, letterSpacing: 0.5 }}>Nuevo ingreso</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="number"
                placeholder="Nuevo ingreso"
                value={nuevoIngreso}
                onChange={e => setNuevoIngreso(e.target.value)}
                style={{ ...inputStyle, width: 140 }}
              />
              <button onClick={agregarIngreso} style={buttonStyle}>Agregar</button>
            </div>
          </div>
        </div>
      </div>
      {/* Columna derecha: Tabla */}
      <div style={{ flex: 1.2, minWidth: 340, overflowX: "auto" }}>
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
              <tr key={idx}>
                <td style={{ ...tdStyle, textAlign: "center" }}>{idx + 1}</td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    value={valor}
                    onChange={e => editarIngreso(idx, e.target.value)}
                    style={{ ...inputStyle, width: 110, fontSize: 15, margin: 0, background: "#f7fafd" }}
                  />
                  <span style={{ marginLeft: 8, color: "#2196f3", fontWeight: 500, fontSize: 15 }}>
                    {formatNumber(valor)}
                  </span>
                </td>
                <td style={tdActionsStyle}>
                  <button onClick={() => eliminarIngreso(idx)} style={{ ...buttonStyle, background: "linear-gradient(90deg,#ff5252,#ff9800)", fontSize: 14, padding: "6px 14px" }}>Eliminar</button>
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
