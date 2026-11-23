import { Link } from 'react-router-dom';
import type { Moneda } from '../services/precios';
import { formatearPrecio } from '../utils/formato';
import { BotonFavorito } from './BotonFavorito';

export type Resultado = { moneda: Moneda; precio: number };

export function Tarjeta({ moneda, precio }: Resultado) {
  return (
    <article className="tarjeta">
      <h3>{moneda.nombre}</h3>
      <p className="simbolo">{moneda.simbolo}</p>
      <p className="precio">{formatearPrecio(precio)}</p>
      <div className="acciones">
        <Link to={`/criptomonedas/${moneda.id}`} aria-label={`Ver detalle de ${moneda.nombre}`}>
          Ver detalle
        </Link>
        <BotonFavorito moneda={moneda} />
      </div>
    </article>
  );
}

type Props = { resultados: Resultado[]; ejemplo: boolean; fecha: string };
export function Resultados({ resultados, ejemplo, fecha }: Props) {
  return (
    <section aria-labelledby="titulo-resultados">
      <h2 id="titulo-resultados">Resultados en USD</h2>
      <p>{ejemplo ? 'Datos de ejemplo para probar la aplicación (no son precios reales). El detalle consulta precios reales.' : 'Precios consultados a CoinGecko.'}</p>
      <div className="tarjetas">
        {resultados.map(resultado => <Tarjeta key={resultado.moneda.id} {...resultado} />)}
      </div>
      <p className="ayuda">Consulta realizada: {fecha}</p>
    </section>
  );
}
