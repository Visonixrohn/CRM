import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./Documentos.css";
import PdfPreviewModal from "./PdfPreviewModal";

const Documentos = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombre, setNombre] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState("");
  const [documentos, setDocumentos] = useState([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const fetchDocumentos = async () => {
      try {
        const { data, error } = await supabase
          .from("documentos")
          .select("id, nombre, archivo");
        if (error) throw error;
        setDocumentos(data);
      } catch (error) {
        console.error("Error al obtener los documentos:", error);
      }
    };

    fetchDocumentos();
  }, []);

  const handleGuardar = async () => {
    if (!nombre.trim() || !archivo) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("No se pudo obtener el usuario autenticado.");
      }

      const uniqueFileName = `${Date.now()}_${archivo.name}`;

      const { data: archivoSubido, error: errorArchivo } =
        await supabase.storage
          .from("documentos")
          .upload(`public/${uniqueFileName}`, archivo);

      if (errorArchivo) {
        console.error("Error al subir el archivo al bucket:", errorArchivo);
        throw errorArchivo;
      }

      const { data: documento, error: errorDB } = await supabase
        .from("documentos")
        .insert({
          nombre,
          archivo: archivoSubido.path,
          user_id: userId,
        })
        .select("id");

      if (errorDB) {
        console.error(
          "Error al insertar los datos en la tabla documentos:",
          errorDB
        );
        throw errorDB;
      }

      setNombre("");
      setArchivo(null);
      setIsModalOpen(false);
      setError("");
      alert("Documento guardado exitosamente.");
    } catch (error) {
      console.error("Error al guardar el documento:", error);
      setError("Hubo un error al guardar el documento.");
    }
  };

  const handleOpenPdfModal = async (id) => {
    try {
      const { data, error } = await supabase
        .from("documentos")
        .select("archivo")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error(
          "El archivo no existe o hubo un error al buscarlo:",
          error
        );
        alert("El documento no está disponible.");
        return;
      }

      const url = `https://caqukltkvvsfairqphjf.supabase.co/storage/v1/object/public/documentos/${data.archivo}`;
      setPdfUrl(url);
      setIsPdfModalOpen(true);
    } catch (err) {
      console.error("Error al verificar el archivo en Supabase:", err);
      alert("Hubo un problema al verificar el documento.");
    }
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
    setPdfUrl("");
  };

  // Obtener usuario de localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  return (
    <div className="documentos-container">
      <h1>Documentos</h1>
      {(user && (user.rol === 'admin' || user.rol === 'superadmin')) && (
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          Agregar Documento
        </button>
      )}

      <div className="documentos-grid">
        {documentos.map((doc) => (
          <div key={doc.id} className="documento-card">
            
            <p className="documento-nombre">{doc.nombre}</p>
            <button
              onClick={() => handleOpenPdfModal(doc.id)}
              className="btn btn-secondary"
            >
              Ver Documento
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Agregar Documento</h2>
            <form className="form-container">
              {error && <p className="form-error">{error}</p>}
              <div className="form-group">
                <label htmlFor="nombreDocumento">Nombre del Documento</label>
                <input
                  id="nombreDocumento"
                  type="text"
                  placeholder="Nombre del Documento"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="archivoPDF">Subir PDF</label>
                <input
                  id="archivoPDF"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  className="form-file-input"
                />
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  onClick={handleGuardar}
                  className="btn btn-primary"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onRequestClose={handleClosePdfModal}
        pdfUrl={pdfUrl}
      />
    </div>
  );
};

export default Documentos;
