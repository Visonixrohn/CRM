import React, { useState } from "react";
import { FaChartBar, FaCalculator, FaCoins, FaTrashAlt, FaPlus } from "react-icons/fa";

const mobileContainer = {
  maxWidth: 420,
  margin: "0 auto",
  padding: "18px 0 32px 0",
  background: "#f5faff",
  borderRadius: 18,
  boxShadow: "0 4px 24px #1976d211",
  minHeight: "100vh",
  display: "block",
};
const cardStyle = {
  borderRadius: 16,
  padding: "18px 16px",
  minWidth: 120,
  textAlign: "center",
  boxShadow: "0 4px 18px #1976d222",
  background: "linear-gradient(120deg,#e3f2fd 80%,#fff 100%)",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  alignItems: "center",
};
const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "2px solid #90caf9",
  fontSize: 17,
  background: "linear-gradient(90deg,#f7fafd 80%,#e3f2fd 100%)",
  marginTop: 8,
  marginBottom: 6,
  boxShadow: "0 2px 8px #90caf922",
  outline: "none",
};
const buttonStyle = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1.5px solid #90caf9",
  fontSize: 18,
  background: "#f7fafd",
  color: "#1976d2",
  fontWeight: 700,
  outline: "none",
  marginTop: 6,
  fontFamily: 'inherit',
  fontStyle: 'normal',
  letterSpacing: '0.5px',
};

const PromediosMobile = () => {
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

  const sumaIngresos = ingresos.reduce((acc, val) => acc + parseFloat(val || 0), 0);
  const promedio = meses > 0 ? sumaIngresos / meses : 0;
  const cuotaCalculada = promedio * (porcentaje / 100);
  const cuotaUtilizadaNum = parseFloat(cuotaUtilizada) || 0;
  const cuotaRestante = Math.max(cuotaCalculada - cuotaUtilizadaNum, 0);

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

  const formatNumber = (num) => {
    return num.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const agregarIngreso = () => {
    if (nuevoIngreso !== "" && !isNaN(nuevoIngreso)) {
      setIngresos([...ingresos, parseFloat(nuevoIngreso)]);
      setNuevoIngreso("");
    }
  };
  const editarIngreso = (idx, valor) => {
    const nuevos = [...ingresos];
    nuevos[idx] = parseFloat(valor) || 0;
    setIngresos(nuevos);
  };
  const eliminarIngreso = (idx) => {
    setIngresos(ingresos.filter((_, i) => i !== idx));
  };

  // Solo mostrar en móvil
  React.useEffect(() => {
    const handleResize = () => {
      const root = document.getElementById("promedios-mobile-root");
      if (root) {
        if (window.innerWidth > 600) {
          root.style.display = "none";
        } else {
          root.style.display = "block";
        }
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div id="promedios-mobile-root" style={mobileContainer}>
      <h2 style={{ marginBottom: 24, textAlign: "center", color: "#1976d2", fontWeight: 800, fontSize: 26, letterSpacing: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <FaChartBar style={{ fontSize: 26, color: "#2196f3" }} /> Promedios
      </h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ ...cardStyle, background: "#e3f2fd" }}>
          <FaCalculator style={{ fontSize: 22, color: "#1976d2", marginBottom: 4 }} />
          <div style={{ fontSize: 15, color: "#1976d2", fontWeight: 600 }}>Promedio</div>
          <div style={{ fontWeight: "bold", fontSize: 22, color: "#2196f3", marginTop: 2 }}>{formatNumber(promedio)}</div>
        </div>
        <div style={{ ...cardStyle, background: "#fff3e0" }}>
          <FaCoins style={{ fontSize: 22, color: "#ff9800", marginBottom: 4 }} />
          <div style={{ fontSize: 15, color: "#ff9800", fontWeight: 600 }}>Cuota calculada</div>
          <div style={{ fontWeight: "bold", fontSize: 22, color: "#ff9800", marginTop: 2 }}>{formatNumber(cuotaCalculada)}</div>
        </div>
        <div style={{ ...cardStyle, background: "#e8f5e9" }}>
          <FaCoins style={{ fontSize: 22, color: "#388e3c", marginBottom: 4 }} />
          <div style={{ fontSize: 15, color: "#388e3c", fontWeight: 600 }}>Cuota restante</div>
          <div style={{ fontWeight: "bold", fontSize: 22, color: "#388e3c", marginTop: 2 }}>{formatNumber(cuotaRestante)}</div>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px #1976d211", padding: "18px 12px", marginBottom: 18 }}>
        <label style={{ fontWeight: 600, color: "#1976d2", fontSize: 15, marginBottom: 2, letterSpacing: 0.5 }}>Meses</label>
        <input
          type="number"
          min={1}
          value={meses}
          onChange={e => setMeses(Number(e.target.value))}
          style={{ ...inputStyle, color: '#1976d2', fontWeight: 700 }}
        />
        <label style={{ fontWeight: 600, color: "#1976d2", fontSize: 15, marginBottom: 2, letterSpacing: 0.5, marginTop: 10 }}>Porcentaje</label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="number"
            min={0}
            max={100}
            value={porcentaje}
            onChange={e => setPorcentaje(Number(e.target.value))}
            style={{ ...inputStyle, paddingRight: 28, color: '#1976d2', fontWeight: 700 }}
          />
          <span style={{ position: "absolute", right: 12, color: "#1976d2", fontWeight: 600, fontSize: 15 }}>%</span>
        </div>
        <label htmlFor="cuota-utilizada" style={{ fontWeight: 600, color: "#1976d2", fontSize: 15, marginBottom: 2, letterSpacing: 0.5, marginTop: 10 }}>Cuota utilizada:</label>
        <input
          id="cuota-utilizada"
          type="number"
          value={cuotaUtilizada}
          onChange={e => setCuotaUtilizada(e.target.value)}
          style={{ ...inputStyle, minWidth: 120, color: '#1976d2', fontWeight: 700 }}
          placeholder="Ingrese la cuota"
        />
        <label style={{ fontWeight: 600, color: "#1976d2", fontSize: 15, marginBottom: 2, letterSpacing: 0.5, marginTop: 10 }}>Nuevo ingreso</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
          <input
            type="number"
            placeholder="Nuevo ingreso"
            value={nuevoIngreso}
            onChange={e => setNuevoIngreso(e.target.value)}
            style={{ ...inputStyle, width: "100%", color: '#1976d2', fontWeight: 700 }}
          />
          <button onClick={agregarIngreso} style={buttonStyle}><FaPlus style={{ marginRight: 6 }} />Agregar</button>
        </div>
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
          style={{ ...buttonStyle, background: "linear-gradient(90deg,#ff5252,#2196f3)", marginTop: 12 }}
        >
          <FaTrashAlt style={{ marginRight: 6 }} />Limpiar
        </button>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 8px #1976d211", padding: "18px 12px" }}>
        <h3 style={{ color: "#1976d2", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Ingresos</h3>
        {ingresos.length === 0 && (
          <div style={{ color: "#888", fontSize: 15, textAlign: "center", marginBottom: 8 }}>No hay ingresos agregados.</div>
        )}
        {ingresos.map((valor, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <input
              type="number"
              value={valor}
              onChange={e => editarIngreso(idx, e.target.value)}
              style={{ ...inputStyle, width: 90, fontSize: 15, margin: 0, background: "#f7fafd", border: "1.5px solid #90caf9" }}
            />
            <span style={{ color: "#2196f3", fontWeight: 600, fontSize: 15 }}>
              {formatNumber(valor)}
            </span>
            <button onClick={() => eliminarIngreso(idx)} style={{ ...buttonStyle, background: "linear-gradient(90deg,#ff5252,#ff9800)", fontSize: 15, padding: "6px 12px" }}><FaTrashAlt style={{ marginRight: 6 }} />Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromediosMobile;
