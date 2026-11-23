import { useEffect, useRef, useState } from 'react';

export type Estado = 'inicial' | 'carga' | 'resultado' | 'vacio' | 'error';
type Props = { estado: Estado; mensaje: string; onReintentar?: () => void };

export function EstadoOperacion({ estado, mensaje, onReintentar }: Props) {
  const [seReintento, setSeReintento] = useState(false);
  const encabezado = useRef<HTMLHeadingElement>(null);
  const focoEnReintento = useRef(false);
  const mostrarReintento = estado === 'error' || seReintento;

  useEffect(() => {
    if (seReintento && estado !== 'error' && estado !== 'carga') {
      if (focoEnReintento.current) encabezado.current?.focus();
      focoEnReintento.current = false;
      setSeReintento(false);
    }
  }, [estado, seReintento]);

  return (
    <section aria-labelledby="titulo-estado">
      <h2 id="titulo-estado" ref={encabezado} tabIndex={-1}>Estado de la consulta</h2>
      <div className="estado" data-estado={estado}>
        <p role="status" aria-live="polite" aria-atomic="true">{mensaje}</p>
      </div>
      {mostrarReintento && onReintentar && (
        <button className="reintentar" type="button" aria-disabled={estado === 'carga'} onFocus={() => { focoEnReintento.current = true; }} onBlur={() => { focoEnReintento.current = false; }} onClick={() => {
          if (estado === 'carga') return;
          setSeReintento(true);
          onReintentar();
        }}>
          {estado === 'carga' ? 'Consultando...' : 'Volver a intentar con datos reales'}
        </button>
      )}
    </section>
  );
}
