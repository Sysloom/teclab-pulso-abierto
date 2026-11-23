import type { Moneda } from '../services/precios';
import { useFavoritos } from '../store/favoritos';

type Props = { moneda: Moneda };

export function BotonFavorito({ moneda }: Props) {
  const esFavorito = useFavoritos((estado) => estado.favoritos.includes(moneda.id));
  const alternarFavorito = useFavoritos((estado) => estado.alternarFavorito);
  const accion = esFavorito ? 'Quitar' : 'Agregar';
  return (
    <button
      type="button"
      className="secundario"
      aria-label={`${accion} ${moneda.nombre} ${esFavorito ? 'de' : 'a'} favoritos`}
      aria-pressed={esFavorito}
      onClick={() => alternarFavorito(moneda.id)}
    >
      {esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    </button>
  );
}
