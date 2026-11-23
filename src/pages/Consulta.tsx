import { useEffect, useRef, useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Controles, modos, type Modo } from '../components/Controles';
import { EstadoOperacion, type Estado } from '../components/EstadoOperacion';
import { Resultados } from '../components/Resultados';
import { monedas, obtenerPrecios, type Precios } from '../services/precios';
import { useFavoritos } from '../store/favoritos';

const esquema = z.object({ texto: z.string().trim().min(2, 'Ingresá al menos 2 caracteres.'), modo: z.enum(modos, { error: 'Elegí un tipo de consulta válido.' }) });
const ejemplo: Precios = { bitcoin: { usd: 70000 }, ethereum: { usd: 3500 }, solana: { usd: 150 } };

export function Consulta() {
  const [texto, setTexto] = useState('todas');
  const [modo, setModo] = useState<string>('real');
  const [errores, setErrores] = useState<{ texto?: string; modo?: string }>({});
  const [estado, setEstado] = useState<Estado>('inicial');
  const [mensajeError, setMensajeError] = useState('');
  const [precios, setPrecios] = useState<Precios>({});
  const [esEjemplo, setEsEjemplo] = useState(false);
  const [fecha, setFecha] = useState('');
  const cantidadFavoritos = useFavoritos(estado => estado.favoritos.length);
  const solicitud = useRef(0);
  const controlador = useRef<AbortController | null>(null);
  useEffect(() => () => { solicitud.current++; controlador.current?.abort(); }, []);

  async function consultar(modoConsulta: Modo) {
    controlador.current?.abort();
    const actual = ++solicitud.current;
    const abortador = new AbortController();
    controlador.current = abortador;
    setEstado('carga'); setMensajeError('');
    try {
      if (modoConsulta === 'carga') await new Promise<void>(resolve => setTimeout(resolve, 3000));
      if (abortador.signal.aborted || actual !== solicitud.current) return;
      if (modoConsulta === 'error') throw new Error('Se simuló un error para realizar la prueba.');
      const datos = modoConsulta === 'vacio' ? {} : modoConsulta === 'ejemplo' ? ejemplo : await obtenerPrecios(abortador.signal);
      if (actual !== solicitud.current) return;
      setPrecios(datos); setEsEjemplo(modoConsulta === 'ejemplo'); setFecha(new Date().toLocaleString('es-AR')); setEstado('resultado');
    } catch (error) {
      if (actual !== solicitud.current || abortador.signal.aborted) return;
      setMensajeError(error instanceof Error ? error.message : 'Error desconocido.'); setEstado('error');
    }
  }
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const resultado = esquema.safeParse({ texto, modo });
    if (!resultado.success) { const campos = resultado.error.flatten().fieldErrors; setErrores({ texto: campos.texto?.[0], modo: campos.modo?.[0] }); return; }
    setErrores({}); setTexto(resultado.data.texto); void consultar(resultado.data.modo);
  }
  const filtro = texto.trim().toLocaleLowerCase('es');
  const disponibles = monedas.flatMap(moneda => precios[moneda.id] === undefined ? [] : [{ moneda, precio: precios[moneda.id]!.usd }]);
  const resultados = disponibles.filter(({ moneda }) => filtro === 'todas' || `${moneda.nombre} ${moneda.simbolo}`.toLocaleLowerCase('es').includes(filtro));
  const estadoVisible: Estado = estado === 'resultado' && resultados.length === 0 ? 'vacio' : estado;
  const mensaje = estadoVisible === 'inicial' ? 'Todavía no se realizó ninguna consulta.' : estadoVisible === 'carga' ? 'Cargando precios, esperá un momento...' : estadoVisible === 'error' ? `Error: no se pudo completar la consulta. ${mensajeError}` : estadoVisible === 'vacio' ? (disponibles.length ? 'Sin resultados: ninguna criptomoneda coincide con la búsqueda.' : 'Sin resultados: no se recibieron precios para mostrar.') : `Consulta finalizada. Se encontraron ${resultados.length} criptomonedas.`;
  return <><Controles texto={texto} modo={modo} errores={errores} cargando={estado === 'carga'} onTexto={setTexto} onModo={setModo} onConsultar={enviar} /><p>Favoritos: {cantidadFavoritos}</p><EstadoOperacion estado={estadoVisible} mensaje={mensaje} onReintentar={() => { const validacion = esquema.safeParse({ texto, modo: 'real' }); setModo('real'); if (!validacion.success) { setErrores({ texto: validacion.error.flatten().fieldErrors.texto?.[0] }); return; } setErrores({}); setTexto(validacion.data.texto); void consultar('real'); }} />{estado === 'resultado' && resultados.length > 0 && <Resultados resultados={resultados} ejemplo={esEjemplo} fecha={fecha} />}</>;
}
