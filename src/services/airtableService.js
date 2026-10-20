import productsData from '../data/products'

const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID

console.log('[Airtable] API_KEY cargada:', API_KEY ? `Sí (${API_KEY.substring(0, 8)}...)` : 'No')
console.log('[Airtable] BASE_ID cargado:', BASE_ID ? `Sí (${BASE_ID})` : 'No')

const isConfigured = !!(API_KEY && BASE_ID)

const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x300/faf6f2/6d544f?text=ChimuCakes'

/**
 * Parsea variantes/tamaños y adicionales desde Airtable de forma defensiva.
 * Soporta múltiples formatos:
 * - Array directo: [{"tamano":"Mediano","precio":8500}]
 * - Objeto con tamanos y adicionales: {"tamanos":[...], "adicionales":[{"nombre":"Glaseado","precio":2000}]}
 */
function parseVariantes(variantesRaw) {
  if (!variantesRaw) return { tamanos: null, adicionales: null }

  let parsed = variantesRaw

  // Si es string, intentar parsear
  if (typeof variantesRaw === 'string') {
    try {
      parsed = JSON.parse(variantesRaw)
    } catch {
      console.warn('[Airtable] Error parseando variantes_json:', variantesRaw)
      return { tamanos: null, adicionales: null }
    }
  }

  // Si es un array directo (formato anterior)
  if (Array.isArray(parsed)) {
    return {
      tamanos: parsed.map((v) => ({
        tamano: v.tamano || v.label || v.nombre || 'Precio único',
        precio: Number(v.precio) || 0,
      })),
      adicionales: null,
    }
  }

  // Si es un objeto con tamanos y adicionales (nuevo formato)
  if (parsed && typeof parsed === 'object') {
    const tamanos = parsed.tamanos || parsed.opciones_tamano || parsed.opciones || parsed.variantes
    const adicionales = parsed.adicionales || parsed.extras || null

    return {
      tamanos: Array.isArray(tamanos)
        ? tamanos.map((v) => ({
            tamano: v.tamano || v.label || v.nombre || 'Precio único',
            precio: Number(v.precio) || 0,
          }))
        : null,
      adicionales: Array.isArray(adicionales)
        ? adicionales.map((a) => ({
            nombre: a.nombre || a.name || a.label || 'Adicional',
            precio: Number(a.precio) || 0,
          }))
        : null,
    }
  }

  return { tamanos: null, adicionales: null }
}

/**
 * Obtiene los productos disponibles desde Airtable.
 * Si no hay credenciales configuradas, retorna datos mock locales.
 */
export async function getProducts() {
  if (!isConfigured) {
    console.log('[Airtable] No configurado, usando datos mock locales')
    return productsData.map((p) => ({
      id: p.id,
      nombre: p.name,
      descripcion: p.description,
      precio: p.price,
      categoria: p.category,
      imagen_url: p.image,
      variantes: p.variantes || null,
    }))
  }

  // Traemos los productos sin formulas en la URL para evitar errores de sintaxis
  const url = `${BASE_URL}/Productos`
  console.log('[Airtable] GET URL:', url)

  try {
    const res = await fetch(url, { headers })
    console.log('[Airtable] Response status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] Error response:', errorBody)
      throw new Error(errorBody?.error?.message || `HTTP ${res.status}`)
    }

    const data = await res.json()
    console.log('[Airtable] Productos recibidos en total:', data.records?.length || 0)

    // Filtramos estrictamente: solo productos donde 'true' sea explícitamente true
    const availableRecords = (data.records || []).filter(
      (record) => record.fields?.true === true || record.fields?.disponible === true
    )

    return availableRecords.map((record) => {
      const fields = record.fields || {}

      // Debug temporal para Chipá
      if (fields.nombre?.includes('Chipa') || fields.nombre?.includes('Chipá')) {
        console.log('[DEBUG Chipá] nombre:', fields.nombre)
        console.log('[DEBUG Chipá] variantes_json:', fields.variantes_json)
        console.log('[DEBUG Chipá] variantes parseadas:', parseVariantes(fields.variantes_json))
        console.log('[DEBUG Chipá] Todos los campos:', Object.keys(fields))
      }

      const imagenUrl = fields.imagen?.[0]?.url || fields.imagen?.[0]?.thumbnails?.large?.url || PLACEHOLDER_IMAGE
      const nombre = fields.nombre || 'Sin nombre'
      const descripcion = fields.descripcion || ''
      const precio = fields.precio || 0
      const categoria = fields.categoria || 'Variados'

      return {
        id: record.id,
        nombre,
        name: nombre,
        descripcion,
        description: descripcion,
        precio,
        price: precio,
        categoria,
        category: categoria,
        imagen_url: imagenUrl,
        image: imagenUrl,
        variantes: parseVariantes(fields.variantes_json).tamanos,
        adicionales: parseVariantes(fields.variantes_json).adicionales,
        permite_sin_gluten: fields.permite_sin_gluten === true,
        permite_sin_azucar: fields.permite_sin_azucar === true,
        badge_texto: fields.badge_texto || null,
      }
    })
  } catch (error) {
    console.error('[Airtable] Error en getProducts:', error)
    throw error
  }
}

/**
 * Crea un nuevo pedido en Airtable.
 * @param {Object} orderData - Datos del pedido
 * @returns {Object} Confirmación con ID del pedido
 */
export async function createOrder(orderData) {
  if (!isConfigured) {
    const localId = `local-${Date.now()}`
    console.log('Pedido registrado (modo local):', { id: localId, ...orderData })
    return { id: localId, ...orderData }
  }

  const url = `${BASE_URL}/Pedidos`
  console.log('[Airtable] POST URL:', url)

  // NOTA: Se remueve fecha_creacion porque si es de tipo "Created time" en Airtable la calcula el servidor.
  const body = {
    records: [
      {
        fields: {
          cliente_nombre: orderData.customerName,
          direccion_entrega: orderData.address,
          items_json: orderData.itemsText,
          total: orderData.total,
          estado: 'Pendiente',
          fecha_entrega: orderData.deliveryDate,
          variantes: orderData.variantes || '',
        },
      },
    ],
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    console.log('[Airtable] POST status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] POST error:', errorBody)
      throw new Error(errorBody?.error?.message || `HTTP ${res.status}`)
    }

    const data = await res.json()
    return { id: data.records[0].id, ...orderData }
  } catch (error) {
    console.error('[Airtable] Error en createOrder:', error)
    throw error
  }
}

/**
 * Obtiene todos los pedidos desde Airtable, ordenados por fecha descendente.
 * Si no hay credenciales configuradas, retorna pedidos de ejemplo.
 */
export async function getOrders() {
  if (!isConfigured) {
    return [
      {
        id: 'demo-1',
        customerName: 'María García',
        phone: '11 5555-1234',
        address: 'Av. Corrientes 1234, CABA',
        notes: 'Sin azúcar en la tarta',
        itemsText: '1x Tarta de Chocolate y Aguacate (16cm), 2x Cookies de Avena',
        total: 19800,
        status: 'Pendiente',
        date: new Date().toISOString(),
        deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      },
      {
        id: 'demo-2',
        customerName: 'Carlos López',
        phone: '11 6666-5678',
        address: 'Retiro en local',
        notes: '',
        itemsText: '2x Cheesecake de Anacardos (10cm)',
        total: 28000,
        status: 'En preparación',
        date: new Date(Date.now() - 86400000).toISOString(),
        deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      },
    ]
  }

  const url = `${BASE_URL}/Pedidos?sort%5B0%5D%5Bfield%5D=fecha_creacion&sort%5B0%5D%5Bdirection%5D=desc`
  console.log('[Airtable] GET Orders URL:', url)

  try {
    const res = await fetch(url, { headers })
    console.log('[Airtable] GET Orders status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] GET Orders error:', errorBody)
      throw new Error(errorBody?.error?.message || `HTTP ${res.status}`)
    }

    const data = await res.json()

    return data.records.map((record) => {
      const fields = record.fields || {}
      return {
        id: record.id,
        customerName: fields.cliente_nombre || '',
        phone: fields.cliente_telefono || '',
        address: fields.direccion_entrega || '',
        notes: fields.notas || '',
        itemsText: fields.items_json || '',
        total: fields.total || 0,
        status: fields.estado || 'Pendiente',
        date: fields.fecha_creacion || new Date().toISOString(),
        deliveryDate: fields.fecha_entrega || '',
      }
    })
  } catch (error) {
    console.error('[Airtable] Error en getOrders:', error)
    throw error
  }
}

/**
 * Autentica un usuario contra la tabla "usuarios" de Airtable.
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Object} { success: boolean, user?: Object, error?: string }
 */
export async function authenticateUser(username, password) {
  if (!isConfigured) {
    // Fallback local con credenciales de demo
    const localUser = import.meta.env.VITE_ADMIN_USER || 'admin'
    const localPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'dulce2024'

    if (username === localUser && password === localPassword) {
      return { success: true, user: { username: localUser, name: 'Admin' } }
    }
    return { success: false, error: 'Usuario o contraseña incorrectos' }
  }

  try {
    const formula = encodeURIComponent(`AND({username} = '${username}', {password} = '${password}')`)
    const url = `${BASE_URL}/usuarios?filterByFormula=${formula}`
    console.log('[Airtable] Auth URL:', url)

    const res = await fetch(url, { headers })
    console.log('[Airtable] Auth status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] Auth error:', errorBody)
      return { success: false, error: 'Error de conexión. Intentá nuevamente.' }
    }

    const data = await res.json()

    if (data.records && data.records.length > 0) {
      const userRecord = data.records[0]
      return {
        success: true,
        user: {
          id: userRecord.id,
          username: userRecord.fields.username,
          name: userRecord.fields.name || userRecord.fields.username,
          email: userRecord.fields.email || '',
          role: userRecord.fields.role || 'admin',
        },
      }
    }

    return { success: false, error: 'Usuario o contraseña incorrectos' }
  } catch (error) {
    console.error('[Airtable] Error en authenticateUser:', error)
    return { success: false, error: 'Error de conexión. Intentá nuevamente.' }
  }
}

/**
 * Elimina un pedido de Airtable.
 * @param {string} orderId - ID del registro en Airtable
 * @returns {Object} Confirmación de eliminación
 */
export async function deleteOrder(orderId) {
  if (!isConfigured) {
    console.log(`Pedido eliminado (modo local): ${orderId}`)
    return { id: orderId, deleted: true }
  }

  const url = `${BASE_URL}/Pedidos/${orderId}`
  console.log('[Airtable] DELETE URL:', url)

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers,
    })

    console.log('[Airtable] DELETE status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] DELETE error:', errorBody)
      throw new Error(errorBody?.error?.message || `HTTP ${res.status}`)
    }

    return { id: orderId, deleted: true }
  } catch (error) {
    console.error('[Airtable] Error en deleteOrder:', error)
    throw error
  }
}

/**
 * Actualiza el estado de un pedido en Airtable.
 * @param {string} orderId - ID del registro en Airtable
 * @param {string} newStatus - Nuevo estado
 */
export async function updateOrderStatus(orderId, newStatus) {
  if (!isConfigured) {
    console.log(`Estado actualizado (modo local): ${orderId} -> ${newStatus}`)
    return { id: orderId, status: newStatus }
  }

  const url = `${BASE_URL}/Pedidos/${orderId}`
  console.log('[Airtable] PATCH URL:', url)

  const body = {
    fields: {
      estado: newStatus,
    },
  }

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    })

    console.log('[Airtable] PATCH status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] PATCH error:', errorBody)
      throw new Error(errorBody?.error?.message || `HTTP ${res.status}`)
    }

    return res.json()
  } catch (error) {
    console.error('[Airtable] Error en updateOrderStatus:', error)
    throw error
  }
}

/**
 * Obtiene la configuración de la tienda desde Airtable.
 * Lee el registro donde clave === 'general' o el primer registro.
 * @returns {Object} { tienda_activa: boolean, mensaje_cierre: string }
 */
export async function getStoreConfig() {
  if (!isConfigured) {
    console.log('[CONFIG TIENDA]:', { tiendaActiva: true, mensajeCierre: '', origen: 'sin configuracion' })
    return { tienda_activa: true, mensaje_cierre: '' }
  }

  try {
    const url = `${BASE_URL}/configuracion?maxRecords=1`
    console.log('[Airtable] GET Config URL:', url)

    const res = await fetch(url, { headers })
    console.log('[Airtable] GET Config status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] GET Config error:', errorBody)
      return { tienda_activa: true, mensaje_cierre: '' }
    }

    const data = await res.json()
    const records = data.records || []

    if (records.length === 0) {
      console.log('[CONFIG TIENDA]:', { tiendaActiva: true, mensajeCierre: '', origen: 'sin registros' })
      return { tienda_activa: true, mensaje_cierre: '' }
    }

    const fields = records[0].fields || {}
    // Checkbox desmarcado en Airtable devuelve undefined/null, no false
    const tiendaActiva = Boolean(fields.tienda_activa === true)
    const mensajeCierre = fields.mensaje_cierre || ''

    console.log('[CONFIG TIENDA]:', { tiendaActiva, mensajeCierre, origen: 'airtable' })

    return { tienda_activa: tiendaActiva, mensaje_cierre: mensajeCierre }
  } catch (error) {
    console.error('[Airtable] Error en getStoreConfig:', error)
    return { tienda_activa: true, mensaje_cierre: '' }
  }
}

/**
 * Obtiene los registros de la tabla "nosotros" de Airtable, ordenados por el campo 'orden'.
 * @returns {Array} Array de objetos con id, titulo, contenido, imagen_url, tipo, orden
 */
export async function getNosotros() {
  if (!isConfigured) {
    console.log('[Airtable] No configurado, usando datos mock locales')
    return [
      {
        id: 'mock-1',
        titulo: 'Equipo de Chimu',
        contenido: 'Mi pasión por la repostería comenzó desde muy chica. Todavía me acuerdo cuando una amiga de la familia me enseñó las primeras cosas básicas de repostería. O cuando iba en el colegio y hacía postres o tortas para mis amigos en cumpleaños y juntadas.\n\nY así, sin darme cuenta, fueron pasando los años. Hasta que en 2022 decidí dar el paso y comenzar a emprender.',
        imagen_url: '',
        tipo: 'equipo',
        orden: 1,
      },
      {
        id: 'mock-2',
        titulo: 'Nuestro compromiso',
        contenido: 'Desde el 2020 soy vegana. Pero viendo que no hay opciones aptas para nosotros, decidí juntar mi pasión por la repostería con el veganismo. Es así que cada vez les ofrezco más postres veganos.',
        imagen_url: '',
        tipo: 'compromiso',
        orden: 2,
      },
      {
        id: 'mock-3',
        titulo: 'Nuestra filosofía',
        contenido: 'Una de las cosas que me encanta es exactamente eso: veganizar recetas. Porque lo vegano no es feo si se hace con pasión y compromiso.',
        imagen_url: '',
        tipo: 'filosofia',
        orden: 3,
      },
      {
        id: 'mock-4',
        titulo: 'Firma',
        contenido: 'Con cariño, Lu, Deli y toda la familia Chimu 🩷',
        imagen_url: '',
        tipo: 'firma',
        orden: 4,
      },
    ]
  }

  try {
    const url = `${BASE_URL}/nosotros`
    console.log('[Airtable] GET Nosotros URL:', url)

    const res = await fetch(url, { headers })
    console.log('[Airtable] GET Nosotros status:', res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Airtable Nosotros Error:', res.status, errorText)
      throw new Error(`HTTP ${res.status}`)
    }

    const data = await res.json()
    const records = data.records || []

    // Ordenar por campo 'orden' en JavaScript
    records.sort((a, b) => (a.fields.orden || 0) - (b.fields.orden || 0))

    return records.map((record) => {
      const fields = record.fields || {}
      const imagenUrl = fields.imagen?.[0]?.url || fields.imagen?.[0]?.thumbnails?.large?.url || ''

      return {
        id: fields.id || record.id,
        titulo: fields.titulo || '',
        contenido: fields.contenido || '',
        imagen_url: imagenUrl,
        image: imagenUrl,
        tipo: fields.tipo || '',
        orden: fields.orden || 0,
      }
    })
  } catch (error) {
    console.error('[Airtable] Error en getNosotros:', error)
    return []
  }
}

/**
 * Obtiene los registros de la tabla "nosotros" de Airtable de forma aislada.
 * Consulta directa sin usar mapeadores de otras tablas.
 * @returns {Array} Array de objetos con id, titulo, contenido, orden, imagen
 */
export async function getNosotrosData() {
  if (!isConfigured) {
    console.log('[Airtable] No configurado, usando datos mock locales')
    return [
      {
        id: 'mock-1',
        titulo: 'Equipo de Chimu',
        contenido: 'Mi pasión por la repostería comenzó desde muy chica. Todavía me acuerdo cuando una amiga de la familia me enseñó las primeras cosas básicas de repostería. O cuando iba en el colegio y hacía postres o tortas para mis amigos en cumpleaños y juntadas.\n\nY así, sin darme cuenta, fueron pasando los años. Hasta que en 2022 decidí dar el paso y comenzar a emprender.',
        imagen: null,
        orden: 1,
      },
      {
        id: 'mock-2',
        titulo: 'Nuestro compromiso',
        contenido: 'Desde el 2020 soy vegana. Pero viendo que no hay opciones aptas para nosotros, decidí juntar mi pasión por la repostería con el veganismo. Es así que cada vez les ofrezco más postres veganos.',
        imagen: null,
        orden: 2,
      },
      {
        id: 'mock-3',
        titulo: 'Nuestra filosofía',
        contenido: 'Una de las cosas que me encanta es exactamente eso: veganizar recetas. Porque lo vegano no es feo si se hace con pasión y compromiso.',
        imagen: null,
        tipo: 'filosofia',
        orden: 3,
      },
      {
        id: 'mock-4',
        titulo: 'Firma',
        contenido: 'Con cariño, Lu, Deli y toda la familia Chimu 🩷',
        imagen: null,
        tipo: 'firma',
        orden: 4,
      },
    ]
  }

  try {
    const url = `${BASE_URL}/nosotros`
    console.log('[Airtable] GET Nosotros URL:', url)

    const res = await fetch(url, { headers })
    console.log('[Airtable] GET Nosotros status:', res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Airtable Nosotros Error:', res.status, errorText)
      throw new Error(`HTTP ${res.status}`)
    }

    const data = await res.json()
    const records = data.records || []

    // Ordenar por campo 'orden' en JavaScript
    records.sort((a, b) => (a.fields.orden || 0) - (b.fields.orden || 0))

    const datos = records.map((record) => {
      const fields = record.fields || {}

      // Extraer URL de imagen de attachment de Airtable
      const imagenUrl = Array.isArray(fields.imagen) && fields.imagen.length > 0
        ? (fields.imagen[0].url || fields.imagen[0].thumbnails?.large?.url || null)
        : null

      return {
        id: fields.id || record.id,
        titulo: fields.titulo || '',
        contenido: fields.contenido || '',
        orden: Number(fields.orden) || 0,
        imagen: imagenUrl,
      }
    })

    console.log('Datos de Nosotros cargados:', datos)

    return datos
  } catch (error) {
    console.error('[Airtable] Error en getNosotrosData:', error)
    return []
  }
}

/**
 * Obtiene los registros de la tabla "inicio_destacados" de Airtable de forma aislada.
 * Consulta directa sin usar mapeadores de otras tablas.
 * @returns {Array} Array de objetos con id, titulo, contenido, imagen, orden
 */
export async function getInicioDestacadosData() {
  if (!isConfigured) {
    console.log('[Airtable] No configurado, usando datos mock locales')
    return [
      {
        id: 'mock-inicio-1',
        titulo: 'Mesa Dulce para Eventos',
        contenido: 'Cumpleaños, casamientos, corporativos y celebraciones especiales. Creamos mesas dulces personalizadas con la variedad y calidad que merece tu evento.',
        imagen: null,
        whatsappMessage: '¡Hola ChimuCakes! Quisiera consultar presupuesto e información para contratar una mesa dulce para un evento.',
        orden: 1,
      },
      {
        id: 'mock-inicio-2',
        titulo: 'Torta Full Personalizada',
        contenido: 'Elegí la combinación perfecta: bizcochos de Chocolate, Vainilla, Red Velvet, Carrot Cake, Oreo y más. Rellenos especiales como Ganaches, Dulce de leche, Pistacho, Nutella, Frutos rojos y Crema Oreo.',
        imagen: null,
        whatsappMessage: '¡Hola ChimuCakes! Me gustaría cotizar una Torta Full Personalizada. ¿Me podrías brindar más información sobre los tamaños y disponibles?',
        orden: 2,
      },
    ]
  }

  try {
    const url = `${BASE_URL}/inicio_destacados`
    console.log('[Airtable] GET Inicio Destacados URL:', url)

    const res = await fetch(url, { headers })
    console.log('[Airtable] GET Inicio Destacados status:', res.status)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Airtable Inicio Destacados Error:', res.status, errorText)
      throw new Error(`HTTP ${res.status}`)
    }

    const data = await res.json()
    const records = data.records || []

    // Ordenar por campo 'orden' en JavaScript
    records.sort((a, b) => (a.fields.orden || 0) - (b.fields.orden || 0))

    return records.map((record) => {
      const fields = record.fields || {}

      // Extraer URL de imagen de attachment de Airtable
      const imagenUrl = Array.isArray(fields.imagen) && fields.imagen.length > 0
        ? (fields.imagen[0].url || fields.imagen[0].thumbnails?.large?.url || null)
        : null

      return {
        id: fields.id || record.id,
        titulo: fields.titulo || '',
        contenido: fields.contenido || '',
        imagen: imagenUrl,
        whatsappMessage: fields.whatsapp_message || '',
        orden: Number(fields.orden) || 0,
      }
    })
  } catch (error) {
    console.error('[Airtable] Error en getInicioDestacadosData:', error)
    return []
  }
}

/**
 * Actualiza un pedido completo en Airtable.
 * @param {string} orderId - ID del registro en Airtable
 * @param {Object} updateData - Campos a actualizar
 * @returns {Object} Confirmación de actualización
 */
export async function updateOrder(orderId, updateData) {
  if (!isConfigured) {
    console.log('Pedido actualizado (modo local):', { id: orderId, ...updateData })
    return { id: orderId, ...updateData }
  }

  const url = `${BASE_URL}/Pedidos/${orderId}`
  console.log('[Airtable] PATCH Order URL:', url)

  const body = {
    fields: {
      cliente_nombre: updateData.customerName,
      cliente_telefono: updateData.phone,
      direccion_entrega: updateData.address,
      items_json: updateData.itemsText,
      total: updateData.total,
      estado: updateData.status,
      fecha_entrega: updateData.deliveryDate,
      notas: updateData.notes || '',
    },
  }

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    })

    console.log('[Airtable] PATCH Order status:', res.status)

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}))
      console.error('[Airtable] PATCH Order error:', errorBody)
      throw new Error(errorBody?.error?.message || `HTTP ${res.status}`)
    }

    return res.json()
  } catch (error) {
    console.error('[Airtable] Error en updateOrder:', error)
    throw error
  }
}
