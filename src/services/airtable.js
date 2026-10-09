import productsData from '../data/products'

const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID
const PRODUCTS_TABLE = import.meta.env.VITE_AIRTABLE_PRODUCTS_TABLE || 'Productos'
const ORDERS_TABLE = import.meta.env.VITE_AIRTABLE_ORDERS_TABLE || 'Pedidos'

const isConfigured = API_KEY && BASE_ID

async function fetchAirtable(table) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${table}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  if (!res.ok) throw new Error(`Error Airtable: ${res.status}`)
  return res.json()
}

async function createAirtableRecord(table, fields) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${table}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records: [{ fields }] }),
  })
  if (!res.ok) throw new Error(`Error al crear registro: ${res.status}`)
  return res.json()
}

export async function getProducts() {
  if (!isConfigured) {
    // Fallback: datos mock locales
    return productsData
  }
  try {
    const data = await fetchAirtable(PRODUCTS_TABLE)
    return data.records.map((r) => ({
      id: r.id,
      name: r.fields.Nombre,
      description: r.fields.Descripción,
      price: r.fields.Precio,
      category: r.fields.Categoría,
      image: r.fields.Imagen?.[0]?.url || '',
      tags: r.fields.Tags || [],
    }))
  } catch (error) {
    console.warn('Error cargando de Airtable, usando datos locales:', error)
    return productsData
  }
}

export async function createOrder(orderData) {
  if (!isConfigured) {
    // Fallback: simular guardado local
    console.log('Pedido registrado (modo local):', orderData)
    return { id: `local-${Date.now()}`, ...orderData }
  }
  const fields = {
    Cliente: orderData.customerName,
    Teléfono: orderData.phone,
    Dirección: orderData.address,
    Notas: orderData.notes,
    Items: orderData.itemsText,
    Total: orderData.total,
    Estado: 'Pendiente',
    Fecha: new Date().toISOString(),
  }
  return createAirtableRecord(ORDERS_TABLE, fields)
}

export async function getOrders() {
  if (!isConfigured) {
    // Fallback: pedidos de ejemplo
    return [
      {
        id: 'demo-1',
        customerName: 'María García',
        phone: '11 5555-1234',
        address: 'Av. Corrientes 1234, CABA',
        notes: 'Sin azúcar en la tarta',
        itemsText: '1x Tarta de Chocolate y Aguacate, 2x Cookies de Avena',
        total: 5600,
        status: 'Pendiente',
        date: new Date().toISOString(),
      },
      {
        id: 'demo-2',
        customerName: 'Carlos López',
        phone: '11 6666-5678',
        address: 'Retiro en local',
        notes: '',
        itemsText: '2x Cheesecake de Anacardos',
        total: 8400,
        status: 'En preparación',
        date: new Date(Date.now() - 86400000).toISOString(),
      },
    ]
  }
  try {
    const data = await fetchAirtable(ORDERS_TABLE)
    return data.records.map((r) => ({
      id: r.id,
      customerName: r.fields.Cliente,
      phone: r.fields.Teléfono,
      address: r.fields.Dirección,
      notes: r.fields.Notas,
      itemsText: r.fields.Items,
      total: r.fields.Total,
      status: r.fields.Estado,
      date: r.fields.Fecha,
    }))
  } catch (error) {
    console.error('Error cargando pedidos:', error)
    return []
  }
}

export async function updateOrderStatus(orderId, newStatus) {
  if (!isConfigured) {
    console.log(`Estado actualizado (modo local): ${orderId} -> ${newStatus}`)
    return { id: orderId, status: newStatus }
  }
  const url = `https://api.airtable.com/v0/${BASE_ID}/${ORDERS_TABLE}/${orderId}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: { Estado: newStatus } }),
  })
  if (!res.ok) throw new Error(`Error actualizando: ${res.status}`)
  return res.json()
}
