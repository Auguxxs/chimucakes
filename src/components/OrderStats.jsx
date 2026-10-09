import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const CATEGORIES = ['Tortas', 'Cheescakes', 'Budines', 'Galletitas']

const CATEGORY_COLORS = {
  'Tortas': '#ee95be',
  'Cheescakes': '#6d544f',
  'Budines': '#065a2a',
  'Galletitas': '#d0d721',
}

const FLAVOR_COLORS = [
  '#ee95be', '#6d544f', '#065a2a', '#d0d721', '#8a6f68',
  '#211f20', '#f8d0e4', '#0a7a3a', '#b8c421', '#5a4038',
]

// Mapeo de productos a categorías
const PRODUCT_CATEGORY_MAP = {
  'Tarta de Chocolate y Aguacate': 'Tortas',
  'Torta de Limón y Albahaca': 'Tortas',
  'Tarta de Manzana Rústica': 'Tortas',
  'Tarta de Coco y Mango': 'Tortas',
  'Tarta de Frutillas Crema': 'Tortas',
  'Cheesecake de Anacardos': 'Cheescakes',
  'Budín de Banana y Nuez': 'Budines',
  'Brownie de Remolacha': 'Budines',
  'Cookies de Avena y Pasas': 'Galletitas',
  'Roll de Canela Vegano': 'Galletitas',
  'Muffins de Arándanos': 'Galletitas',
  'Alfajores de Maicena': 'Galletitas',
}

function parseItems(itemsText) {
  if (!itemsText) return []
  return itemsText.split(',').map((item) => {
    const match = item.trim().match(/(\d+)x\s+(.+)/)
    if (match) {
      return { quantity: parseInt(match[1], 10), name: match[2].trim() }
    }
    return null
  }).filter(Boolean)
}

function getCategoryFromItem(itemName) {
  const lowerName = itemName.toLowerCase()

  // Prioridad 1: palabras clave específicas
  if (lowerName.includes('cheesecake') || lowerName.includes('cheese cake')) return 'Cheescakes'
  if (lowerName.includes('budín') || lowerName.includes('budin') || lowerName.includes('brownie')) return 'Budines'
  if (lowerName.includes('cookie') || lowerName.includes('roll') || lowerName.includes('muffin') || lowerName.includes('alfajor') || lowerName.includes('galletita')) return 'Galletitas'
  if (lowerName.includes('tarta') || lowerName.includes('torta')) return 'Tortas'

  // Prioridad 2: coincidencia con el mapa de productos
  for (const [productName, category] of Object.entries(PRODUCT_CATEGORY_MAP)) {
    if (itemName.includes(productName) || productName.includes(itemName)) {
      return category
    }
  }

  return null
}

function OrderStats({ orders }) {
  const [periodFilter, setPeriodFilter] = useState('Todos')
  const [categoryFilter, setCategoryFilter] = useState('Todas')

  const filteredOrders = useMemo(() => {
    if (periodFilter === 'Todos') return orders

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    if (periodFilter === 'Este mes') {
      return orders.filter((o) => {
        if (!o.deliveryDate) return false
        const date = new Date(o.deliveryDate + 'T00:00:00')
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth
      })
    }

    const monthIndex = MONTHS.indexOf(periodFilter)
    if (monthIndex !== -1) {
      return orders.filter((o) => {
        if (!o.deliveryDate) return false
        const date = new Date(o.deliveryDate + 'T00:00:00')
        return date.getFullYear() === currentYear && date.getMonth() === monthIndex
      })
    }

    return orders
  }, [orders, periodFilter])

  const stats = useMemo(() => {
    const deliveredOrders = filteredOrders.filter((o) => o.status === 'Entregado')
    const pendingOrders = filteredOrders.filter(
      (o) => o.status === 'Pendiente' || o.status === 'En preparación'
    )

    const totalSales = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const totalOrders = filteredOrders.length
    const averageTicket = deliveredOrders.length > 0 ? totalSales / deliveredOrders.length : 0

    // Top 5 productos más vendidos (solo pedidos Entregado)
    const productCount = {}
    deliveredOrders.forEach((order) => {
      const items = parseItems(order.itemsText)
      items.forEach((item) => {
        const key = item.name
        productCount[key] = (productCount[key] || 0) + item.quantity
      })
    })

    const topProducts = Object.entries(productCount)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    // Cantidad por sabor dentro de cada categoría (solo pedidos Entregado)
    const flavorCountByCategory = {}
    CATEGORIES.forEach((cat) => {
      flavorCountByCategory[cat] = {}
    })

    deliveredOrders.forEach((order) => {
      const items = parseItems(order.itemsText)
      items.forEach((item) => {
        const category = getCategoryFromItem(item.name)
        if (category && flavorCountByCategory[category]) {
          const flavorName = item.name.replace(/\s*\([^)]*\)/g, '').trim() // Quitar tamaño entre paréntesis
          flavorCountByCategory[category][flavorName] = (flavorCountByCategory[category][flavorName] || 0) + item.quantity
        }
      })
    })

    // Preparar datos para el gráfico
    const chartData = []
    const categoriesToShow = categoryFilter === 'Todas' ? CATEGORIES : [categoryFilter]

    categoriesToShow.forEach((cat) => {
      const flavors = flavorCountByCategory[cat]
      Object.entries(flavors).forEach(([flavor, quantity]) => {
        chartData.push({
          name: flavor,
          value: quantity,
          category: cat,
        })
      })
    })

    chartData.sort((a, b) => b.value - a.value)

    return {
      totalSales,
      totalOrders,
      averageTicket,
      pendingCount: pendingOrders.length,
      topProducts,
      chartData,
    }
  }, [filteredOrders, categoryFilter])

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString('es-AR')}`
  }

  const hasData = filteredOrders.length > 0

  return (
    <div className="mb-8">
      {/* Filtro de período compacto */}
      <div className="mb-4 flex justify-end">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marron/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="input-field w-auto appearance-none pl-9 pr-8 text-sm"
          >
            <option value="Todos">Todos</option>
            <option value="Este mes">Este mes</option>
            {MONTHS.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      {!hasData ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <p className="text-marron/60">Sin datos suficientes para este período</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card border-l-4 border-l-verde p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-verde/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-verde" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-marron/60">Ventas Totales</p>
                  <p className="text-xl font-bold text-verde">{formatCurrency(stats.totalSales)}</p>
                </div>
              </div>
            </div>

            <div className="card border-l-4 border-l-rosa p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rosa/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rosa" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-marron/60">Pedidos Totales</p>
                  <p className="text-xl font-bold text-marron">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="card border-l-4 border-l-lima p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lima/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-verde" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-marron/60">Ticket Promedio</p>
                  <p className="text-xl font-bold text-marron">{formatCurrency(stats.averageTicket)}</p>
                </div>
              </div>
            </div>

            <div className="card border-l-4 border-l-blue-500 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-marron/60">En Producción</p>
                  <p className="text-xl font-bold text-blue-600">{stats.pendingCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top 5 Productos */}
          <div className="card p-5 mb-6">
            <h3 className="font-display text-lg font-semibold text-marron">Top 5 Productos Más Vendidos</h3>
            {stats.topProducts.length > 0 ? (
              <div className="mt-4 space-y-3">
                {stats.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-lima text-oscuro' :
                      index === 1 ? 'bg-rosa text-oscuro' :
                      index === 2 ? 'bg-rosaClaro text-marron' :
                      'bg-crema text-marron'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-oscuro">{product.name}</p>
                    </div>
                    <span className="rounded-full bg-verde/10 px-3 py-1 text-sm font-semibold text-verde">
                      {product.quantity} uds
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm text-marron/50">Sin datos de ventas para mostrar</p>
              </div>
            )}
          </div>

          {/* Gráfico circular con filtro integrado */}
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-lg font-semibold text-marron">
                Unidades Vendidas por Sabor
              </h3>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marron/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-field w-auto appearance-none pl-9 pr-8 text-sm"
                >
                  <option value="Todas">Todas</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            {stats.chartData.length > 0 ? (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {stats.chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={FLAVOR_COLORS[index % FLAVOR_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} uds`, 'Cantidad']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-sm text-marron">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-marron/50">Sin datos de ventas para mostrar</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default OrderStats
