# AGENTS.md

## Comandos

- **Desarrollo:** `npm.cmd run dev` (usar `npm.cmd` en Windows — `npm` falla por política de ejecución de PowerShell)
- **Build:** `npm.cmd run build`
- **Preview:** `npm.cmd run preview`

## Stack

- React 18 + Vite 5 + React Router 6
- Tailwind CSS 3 (colores personalizados: `rosa`, `marron`, `verde`, `lima`, `oscuro`, `crema`)
- Sin tests, lint ni typecheck configurados

## Arquitectura

- `src/context/CartContext.jsx` — estado global del carrito (items, cantidades, total)
- `src/services/airtableService.js` — capa de datos con fallback local. Si `VITE_AIRTABLE_API_KEY` no está definida, usa datos mock de `src/data/products.js`
- Tablas Airtable: `Productos`, `Pedidos`, `usuarios` (login con `authenticateUser()`)
- `src/data/products.js` — 12 productos mock (fallback cuando Airtable no está configurado)
- `src/pages/Admin.jsx` — contraseña hardcodeada: `dulce2024` (línea 6)
- Marca: **ChimuCakes** (no "Dulce Raíz")

## Variables de entorno

Copiar `.env.example` como `.env` y completar:

| Variable | Propósito |
|----------|-----------|
| `VITE_AIRTABLE_API_KEY` | API key de Airtable (actualizada: Oct 2026) |
| `VITE_AIRTABLE_BASE_ID` | Base ID de Airtable |
| `VITE_AIRTABLE_PRODUCTS_TABLE` | Tabla de productos (default: `Productos`) |
| `VITE_AIRTABLE_ORDERS_TABLE` | Tabla de pedidos (default: `Pedidos`) |
| `VITE_WHATSAPP_PHONE` | Número del vendedor para pedidos (con código de país, sin símbolos) |

## Notas

- **NO desplegar automáticamente** a Netlify ni ningún servicio externo. Trabajar únicamente en local con `npm run dev`
- El servidor dev corre en `http://localhost:5173`
- La app funciona completa sin backend (datos mock + registro simulado en consola)
- Los pedidos se envían vía `https://wa.me/<numero>?text=<mensaje>` (mensaje preformateado)
- No hay workflow de CI ni pre-commit hooks
