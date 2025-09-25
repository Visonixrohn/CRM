import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const { order_id } = req.query;

  if (!order_id) {
    return res.status(400).json({ error: "Falta el parámetro order_id" });
  }

  try {
    // Simula el POST del formulario
    const response = await axios.post(
      "https://servitotal.com/honduras/consulta-tu-orden/",
      new URLSearchParams({ order_id }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const $ = cheerio.load(response.data);
    const table = $("table");

    if (!table.length) {
      return res.json({ error: "No se encontró información para esta orden" });
    }

    // Extrae encabezados
    const headers = [];
    table.find("th").each((i, el) => headers.push($(el).text().trim()));

    // Extrae filas
    const rows = [];
    table.find("tr").slice(1).each((i, tr) => {
      const cells = [];
      $(tr).find("td").each((j, td) => cells.push($(td).text().trim()));
      if (cells.length) {
        const obj = {};
        headers.forEach((h, j) => (obj[h] = cells[j] || ""));
        rows.push(obj);
      }
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error consultando Servitotal", details: err.message });
  }
}
