// /api/orden.js para Vercel (CommonJS)
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { order_id } = req.query;
  if (!order_id) {
    return res.status(400).json({ error: 'Falta el parámetro order_id' });
  }
  // Endpoint AJAX de Servitotal
  const endpoint = 'https://servitotal.com/honduras/wp-admin/admin-ajax.php';
  const payload = {
    action: 'handle_apigee_form_user_order_submission',
    idType: '2',
    idNumber: order_id,
    countryID: 'HN'
  };
  try {
    const { data: response } = await axios.post(endpoint, new URLSearchParams(payload).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    if (response && response.success && response.data && response.data.order) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.json({ orderId: order_id, datos: response.data.order });
    } else if (response && response.data && response.data.error) {
      return res.status(404).json({ error: response.data.error, orderId: order_id });
    } else {
      return res.status(404).json({ error: 'No se encontraron datos para la orden', orderId: order_id });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error al consultar el endpoint', details: err.message });
  }
};
