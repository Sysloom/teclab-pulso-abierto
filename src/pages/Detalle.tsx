import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EstadoOperacion, type Estado } from '../components/EstadoOperacion';
import { BotonFavorito } from '../components/BotonFavorito';
import { monedas, obtenerPrecios, type Precios } from '../services/precios';
import { formatearPrecio } from '../utils/formato';

export function Detalle() {
  const { id } = useParams();
  const moneda = monedas.find(item => item.id === id);
  const [estado, setEstado] = useState<Estado>('carga');
  const [precios, setPrecios] = useState<Precios>({});
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    if (!moneda) return;
    const controlador = new AbortController();
    setEstado('carga');
    obtenerPrecios(controlador.signal).then(datos => {
      if (controlador.signal.aborted) return;
      setPrecios(datos); setEstado(datos[moneda.id] === undefined ? 'vacio' : 'resultado');
    }).catch((motivo: unknown) => {
      if (controlador.signal.aborted) return;
      setError(motivo instanceof Error ? motivo.message : 'Error desconocido.'); setEstado('error');
    });
    return () => controlador.abort();
  }, [moneda, intento]);
  if (!moneda) return <section><h2>Criptomoneda no encontrada</h2><p>La criptomoneda solicitada no está disponible.</p><Link to="/">Volver a la consulta</Link></section>;
  const precio = precios[moneda.id]?.usd;
  const mensaje = estado === 'carga' ? 'Cargando precio, esperá un momento...' : estado === 'error' ? `Error: no se pudo completar la consulta. ${error}` : estado === 'vacio' ? 'Sin resultados: no se recibió un precio para esta criptomoneda.' : 'Consulta finalizada.';
  return <><section><Link to="/">Volver a la consulta</Link><h2>Detalle de {moneda.nombre}</h2><p>Precio en dólares estadounidenses, consultado a CoinGecko.</p><BotonFavorito moneda={moneda} /></section><EstadoOperacion estado={estado} mensaje={mensaje} onReintentar={() => setIntento(anterior => anterior + 1)} />{estado === 'resultado' && precio !== undefined && <section><h2>{moneda.nombre}</h2><p className="simbolo">{moneda.simbolo}</p><p className="precio">{formatearPrecio(precio)}</p></section>}</>;
}
