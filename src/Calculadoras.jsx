import React, { useState } from "react";
import "./Calculadoras.css"; // Importamos estilos

const Calculadoras = () => {
  const [activeCalculator, setActiveCalculator] = useState("descuento");
  const [inputs, setInputs] = useState({
    precioNormal: "",
    precioConDescuento: "",
    totalACobrar: "",
    precioDeseado: "",
    precioNuestro: "",
    precioCompetencia: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  const renderCalculator = () => {
    if (activeCalculator === "extrafinanciamiento") {
      const precioConDescuento = parseFloat(inputs.precioConDescuento) || 0;
      const precioNormal = parseFloat(inputs.precioNormal) || 0;

      const porcentaje =
        precioConDescuento / 0.9 >= precioNormal
          ? precioNormal
          : precioConDescuento / 0.9;

      const totalACobrar = porcentaje; // Usar el resultado del porcentaje como Total a Cobrar
      const comisionExtra = precioNormal - totalACobrar;
      const porcentajeSolicitar =
        comisionExtra / precioNormal <= 0 ? 0 : comisionExtra / precioNormal;

      return (
        <div className="card">
          <h3>Extrafinanciamiento</h3>
          <p>Total a Cobrar: {totalACobrar.toFixed(2)}</p>
          <p>Comisión Extra: {comisionExtra.toFixed(2)}</p>
          <p>% a Solicitar: {(porcentajeSolicitar * 100).toFixed(2)}%</p>
        </div>
      );
    }

    if (activeCalculator === "descuento") {
      return (
        <div>
          <div className="card">
            <h3>Descuento</h3>
            <p>
              % a Solicitar:{" "}
              {(
                ((parseFloat(inputs.precioNormal) -
                  parseFloat(inputs.precioDeseado)) /
                  parseFloat(inputs.precioNormal)) *
                100
              ).toFixed(2)}
              %
            </p>
          </div>
        </div>
      );
    }

    if (activeCalculator === "garantia") {
      const precioNormal = parseFloat(inputs.precioNormal) || 0;
      const precioNuestro = parseFloat(inputs.precioNuestro) || 0;
      const precioCompetencia = parseFloat(inputs.precioCompetencia) || 0;

      const totalOfrecer =
        precioCompetencia - (precioNuestro - precioCompetencia) * 0.1;
      const porcentajeDescuento = (precioNormal - totalOfrecer) / precioNormal;

      return (
        <div>
          
          
          <div className="card">
            <h3>Garantía de Precio</h3>
            <p>Total a Ofrecer: {totalOfrecer.toFixed(2)}</p>
            <p>% de Descuento a solicitar: {(porcentajeDescuento * 100).toFixed(2)}%</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="calculadoras-container">
      <h1>Calculadoras</h1>

      {/* Card con resultado */}
      {renderCalculator()}

      {/* Inputs dinámicos */}
      <div className="formulario">
        {activeCalculator === "extrafinanciamiento" && (
          <>
            <label>
              Precio Normal:
              <input
                type="number"
                name="precioNormal"
                value={inputs.precioNormal}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Precio con Descuento:
              <input
                type="number"
                name="precioConDescuento"
                value={inputs.precioConDescuento}
                onChange={handleInputChange}
              />
            </label>
          </>
        )}

        {activeCalculator === "descuento" && (
          <>
            <label>
              Precio Normal:
              <input
                type="number"
                name="precioNormal"
                value={inputs.precioNormal}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Precio Deseado:
              <input
                type="number"
                name="precioDeseado"
                value={inputs.precioDeseado}
                onChange={handleInputChange}
              />
            </label>
          </>
        )}

        {activeCalculator === "garantia" && (
          <>
            <label>
              Precio Normal:
              <input
                type="number"
                name="precioNormal"
                value={inputs.precioNormal}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Precio Nuestro:
              <input
                type="number"
                name="precioNuestro"
                value={inputs.precioNuestro}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Precio de Competencia:
              <input
                type="number"
                name="precioCompetencia"
                value={inputs.precioCompetencia}
                onChange={handleInputChange}
              />
            </label>
          </>
        )}
      </div>

      {/* Botones */}
      <div className="button-group">
        <button
          className={activeCalculator === "extrafinanciamiento" ? "active" : ""}
          onClick={() => setActiveCalculator("extrafinanciamiento")}
        >
          Extrafinanciamiento
        </button>
        <button
          className={activeCalculator === "descuento" ? "active" : ""}
          onClick={() => setActiveCalculator("descuento")}
        >
          Descuento
        </button>
        <button
          className={activeCalculator === "garantia" ? "active" : ""}
          onClick={() => setActiveCalculator("garantia")}
        >
          Garantía de Precio
        </button>
      </div>
    </div>
  );
};

export default Calculadoras;
