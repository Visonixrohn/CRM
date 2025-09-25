// Backend Express para exponer el endpoint /api/orden
const express = require('express');
const getOrderData = require('./scrapeOrder');
const app = express();
const PORT = process.env.PORT || 5500;

app.get('/api/orden', async (req, res) => {
  const orderId = req.query.order_id;
  if (!orderId) {
    return res.status(400).json({ error: 'Falta el parámetro order_id' });
  }
  const data = await getOrderData(orderId);
  // Permitir CORS para el frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json(data);
});

app.use(express.static(__dirname)); // Para servir archivos estáticos si es necesario

app.listen(PORT, () => {
  console.log(`Servidor Express escuchando en http://localhost:${PORT}`);
});
