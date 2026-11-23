import { Link, Route, Routes } from 'react-router-dom';
import { Consulta } from './pages/Consulta';
import { Detalle } from './pages/Detalle';
export default function App() {
  return <><a className="saltar" href="#contenido">Saltar al contenido</a><header className="encabezado"><div className="contenedor"><h1>Pulso Abierto</h1><p>Consulta de precios de Bitcoin, Ethereum y Solana en dólares estadounidenses.</p></div></header><main id="contenido" className="contenedor"><Routes><Route path="/" element={<Consulta />} /><Route path="/criptomonedas/:id" element={<Detalle />} /><Route path="*" element={<section><h2>Página no encontrada</h2><p>La dirección solicitada no existe.</p><Link to="/">Volver a la consulta</Link></section>} /></Routes></main><footer><div className="contenedor"><p>Pulso Abierto - Datos obtenidos de <a href="https://www.coingecko.com/" target="_blank" rel="noopener noreferrer">CoinGecko</a>.</p></div></footer></>;
}
