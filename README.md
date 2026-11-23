# Pulso Abierto

Pulso Abierto es una aplicación web para consultar los precios en dólares estadounidenses de Bitcoin (BTC), Ethereum (ETH) y Solana (SOL). Permite buscar por nombre o símbolo, navegar al detalle de cada criptomoneda, marcar favoritos y conservarlos después de recargar la página. Los precios reales se obtienen de la API pública de [CoinGecko](https://www.coingecko.com/).

## Tecnologías principales

- React 19 y TypeScript 5.8
- Vite 6 como empaquetador y servidor de desarrollo
- React Router 7 para la navegación entre el listado y el detalle
- Zustand 5 con `persist` para los favoritos
- Zod 4 para la validación del formulario
- Vitest 5 y Testing Library para las pruebas automatizadas

## Requisitos

- Node.js 22.12 (LTS) o 24.x; la verificación se realizó con Node.js 24.15
- npm 10 o superior (la verificación se realizó con npm 11.12)
- Conexión a Internet para consultar precios reales

## Instalación

Desde la raíz del proyecto:

```bash
npm ci
```

`npm ci` instala exactamente las versiones registradas en `package-lock.json`.

## Ejecutar en desarrollo

```bash
npm run dev
```

Abrí la dirección que muestra Vite (por defecto, `http://localhost:5173`).

## Ejecutar las pruebas

```bash
npm test
```

Las pruebas usan respuestas simuladas y no realizan solicitudes reales a CoinGecko.

## Generar el build productivo

```bash
npm run build
```

El comando ejecuta primero la comprobación de tipos (`tsc --noEmit`) y luego `vite build`. El resultado se genera en `dist/`.

## Comprobar el build con preview

```bash
npm run preview
```

Abrí la dirección que indica el comando (por defecto, `http://localhost:4173`).

## Uso

El campo de búsqueda comienza en «todas», por lo que se muestran las tres monedas. Se puede buscar por nombre o símbolo; el filtro se aplica sobre los resultados ya obtenidos. Después de elegir «Precios reales» o un modo de prueba, hay que presionar «Consultar precios».

El botón de favoritos funciona tanto en el listado como en el detalle. La selección se guarda en el almacenamiento local del navegador, bajo la clave `pulso-abierto-favoritos`, y se conserva al recargar o volver a abrir la aplicación en el mismo dispositivo y origen.

El modo de ejemplo no contiene precios reales; al abrir un detalle se consultan precios reales y pueden ser distintos. El modo carga espera tres segundos y después consulta la API; los modos vacío y error simulan esos estados. El reintento utiliza datos reales. El texto se valida después de quitar espacios y requiere al menos dos caracteres; el selector solo admite las opciones previstas.

## Estructura del proyecto

```text
src/
├── components/   # Formulario, resultados, estado de la consulta y botón de favoritos
├── pages/        # Página de consulta y página de detalle
├── services/     # Acceso a la API de CoinGecko y tipos de datos
├── store/        # Estado global de favoritos con persistencia
├── utils/        # Funciones de formato compartidas
├── App.tsx       # Rutas y estructura general
├── App.test.tsx  # Pruebas de integración de los recorridos principales
└── main.tsx      # Punto de entrada de React
```


## Mejora de mantenibilidad

**Problema identificado:** la misma expresión de formato de precios estaba duplicada en `src/components/Resultados.tsx` y en `src/pages/Detalle.tsx`:

```ts
precio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
```

Al repetirse en dos lugares, cualquier cambio en el formato debía aplicarse dos veces y existía el riesgo de que el listado y el detalle mostraran precios distintos.

**Cambio realizado:** se extrajo la función `formatearPrecio` a `src/utils/formato.ts`, que devuelve el precio con separador de miles, dos decimales y el sufijo `USD`. Tanto el listado como el detalle ahora utilizan esa única función. Se agregó una prueba unitaria en `src/utils/formato.test.ts`.

**Comprobación de ausencia de regresiones:**

- `npm test`: las 7 pruebas de los 3 archivos finalizan correctamente, incluidas las que verifican los precios renderizados y la sincronización de favoritos entre listado y detalle.
- `npm run build`: la comprobación de tipos y la generación del build finalizan sin errores.
- Se recorrió la aplicación en el servidor de desarrollo y en `npm run preview`: consulta de precios, navegación al detalle, recarga de la ruta, favoritos, validación del formulario y vista móvil. El formato de los precios se mantuvo idéntico en ambas vistas.

## Publicación en Vercel

El proyecto incluye `vercel.json` con la configuración necesaria:

- Framework: Vite
- Comando de build: `npm run build`
- Directorio de salida: `dist`
- Reescritura de rutas del cliente hacia `index.html`, para que una ruta de detalle como `/criptomonedas/bitcoin` funcione al abrirse directamente o al recargarse.

URL de la aplicación publicada: https://teclab-pulso-abierto.vercel.app/

## Verificación final

- Pruebas ejecutadas: `npm test` — 7 pruebas aprobadas en 3 archivos.
- Build generado correctamente: `npm run build` — salida en `dist/`.
- Preview comprobado: `npm run preview` — aplicación cargada, consulta de precios real, navegación al detalle, acceso directo y recarga de la ruta, favoritos persistentes, formulario validado y vista móvil sin desborde horizontal.
- Sitio publicado comprobado: https://teclab-pulso-abierto.vercel.app/ — carga correcta, consulta real a CoinGecko, navegación al detalle, acceso directo y recarga de `/criptomonedas/bitcoin`, favoritos persistentes, formulario funcional y vista móvil, sin errores en consola ni en el panel de red.
- Despliegue realizado: Vercel — https://teclab-pulso-abierto.vercel.app/ (rama `main`, estado Ready).
- Fecha de verificación: 23 de noviembre de 2026.
