const statusColors = {
  'Pendiente': 'bg-yellow-100 text-yellow-800',
  'En preparación': 'bg-blue-100 text-blue-800',
  'Entregado': 'bg-green-100 text-green-800',
  'Cancelado': 'bg-red-100 text-red-800',
}

function AdminOrderTable({ orders, onStatusChange }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-md">
        <p className="text-marron/60">No hay pedidos registrados</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-md">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-marron/10 bg-crema">
          <tr>
            <th className="px-4 py-3 font-semibold text-marron">Cliente</th>
            <th className="px-4 py-3 font-semibold text-marron">Teléfono</th>
            <th className="px-4 py-3 font-semibold text-marron">Dirección</th>
            <th className="px-4 py-3 font-semibold text-marron">Items</th>
            <th className="px-4 py-3 font-semibold text-marron">Total</th>
            <th className="px-4 py-3 font-semibold text-marron">Estado</th>
            <th className="px-4 py-3 font-semibold text-marron">Fecha Pedido</th>
            <th className="px-4 py-3 font-semibold text-marron">Fecha Entrega</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-marron/5 hover:bg-crema/50">
              <td className="px-4 py-3 font-medium text-oscuro">{order.customerName}</td>
              <td className="px-4 py-3 text-marron">{order.phone}</td>
              <td className="px-4 py-3 text-marron">{order.address}</td>
              <td className="max-w-[200px] truncate px-4 py-3 text-marron" title={order.itemsText}>
                {order.itemsText}
              </td>
              <td className="px-4 py-3 font-semibold text-verde">
                ${order.total?.toLocaleString('es-AR')}
              </td>
              <td className="px-4 py-3">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En preparación">En preparación</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </td>
              <td className="px-4 py-3 text-xs text-marron/60">
                {new Date(order.date).toLocaleDateString('es-AR')}
              </td>
              <td className="px-4 py-3 text-xs text-marron/60">
                {order.deliveryDate || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminOrderTable
