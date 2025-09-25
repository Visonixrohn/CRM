// Script para obtener datos de una orden desde Servitotal y generar un JSON
// Uso: node scrapeOrder.js <order_id>

const axios = require('axios');
const cheerio = require('cheerio');

async function getOrderData(orderId) {
  // Endpoint AJAX de Servitotal
  const endpoint = 'https://servitotal.com/honduras/wp-admin/admin-ajax.php';
  const payload = {
    action: 'handle_apigee_form_user_order_submission',
    idType: '2', // Buscar por número de orden
    idNumber: orderId,
    countryID: 'HN'
  };
  try {
    const { data: response } = await axios.post(endpoint, new URLSearchParams(payload).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    // La respuesta debe tener la estructura esperada
    if (response && response.success && response.data && response.data.order) {
      return { orderId, datos: response.data.order };
    } else if (response && response.data && response.data.error) {
      return { error: response.data.error, orderId };
    } else {
      return { error: 'No se encontraron datos para la orden', orderId };
    }
  } catch (err) {
    return { error: 'Error al consultar el endpoint', details: err.message };
  }
}

// Ejecutar si se llama desde la terminal
if (require.main === module) {
  const orderId = process.argv[2] || '758873';
  getOrderData(orderId).then(json => {
    console.log(JSON.stringify(json, null, 2));
  });
}

module.exports = getOrderData;
