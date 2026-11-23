import type { FormEvent } from 'react';

export const modos = ['real', 'carga', 'ejemplo', 'vacio', 'error'] as const;
export type Modo = typeof modos[number];
type Props = { texto: string; modo: string; errores: { texto?: string; modo?: string }; cargando: boolean; onTexto: (valor: string) => void; onModo: (valor: string) => void; onConsultar: (evento: FormEvent<HTMLFormElement>) => void };
export function Controles({ texto, modo, errores, cargando, onTexto, onModo, onConsultar }: Props) {
  return <section aria-labelledby="titulo-consulta"><h2 id="titulo-consulta">Consultar precios</h2>
    <p>Buscá por nombre o símbolo y elegí el tipo de consulta.</p>
    <form onSubmit={onConsultar} noValidate>
      <div role="alert">{(errores.texto || errores.modo) && <p className="error-campo">Revisá los campos indicados antes de consultar.</p>}</div>
      <div className="campos">
        <div><label htmlFor="busqueda">Buscar criptomoneda</label><input id="busqueda" value={texto} onChange={e => onTexto(e.target.value)} aria-invalid={!!errores.texto} aria-describedby={errores.texto ? 'ayuda-busqueda error-busqueda' : 'ayuda-busqueda'} /><p id="ayuda-busqueda" className="ayuda">Escribí un nombre, símbolo o «todas» para ver las tres.</p>{errores.texto && <p id="error-busqueda" className="error-campo">{errores.texto}</p>}</div>
        <div><label htmlFor="modo-consulta">Tipo de consulta</label><select id="modo-consulta" value={modo} onChange={e => onModo(e.target.value)} aria-invalid={!!errores.modo} aria-describedby={errores.modo ? 'ayuda-modo error-modo' : 'ayuda-modo'}>
          <option value="real">Precios reales de CoinGecko</option><option value="carga">Prueba: mostrar carga durante 3 segundos</option><option value="ejemplo">Prueba: resultado con datos de ejemplo</option><option value="vacio">Prueba: respuesta sin resultados</option><option value="error">Prueba: error simulado</option>
        </select><p id="ayuda-modo" className="ayuda">Las opciones de prueba permiten comprobar los estados.</p>{errores.modo && <p id="error-modo" className="error-campo">{errores.modo}</p>}</div>
      </div><button type="submit" disabled={cargando}>{cargando ? 'Consultando...' : 'Consultar precios'}</button>
    </form></section>;
}
