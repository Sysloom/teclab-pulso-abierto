export const monedas = [
  { id: 'bitcoin', nombre: 'Bitcoin', simbolo: 'BTC' },
  { id: 'ethereum', nombre: 'Ethereum', simbolo: 'ETH' },
  { id: 'solana', nombre: 'Solana', simbolo: 'SOL' },
] as const;
export type Moneda = typeof monedas[number];
export type IdMoneda = Moneda['id'];
export type Precios = Partial<Record<IdMoneda, { usd: number }>>;
export const URL_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd';

export async function obtenerPrecios(signal?: AbortSignal): Promise<Precios> {
  const respuesta = await fetch(URL_API, { signal });
  if (!respuesta.ok) throw new Error(`El servicio devolvió el código HTTP ${respuesta.status}.`);
  const json: unknown = await respuesta.json();
  if (typeof json !== 'object' || json === null || Array.isArray(json)) throw new Error('La respuesta de la API no tiene el formato esperado.');
  const datos = json as Record<string, unknown>;
  const precios: Precios = {};
  for (const moneda of monedas) {
    const dato = datos[moneda.id];
    if (dato === undefined) continue;
    if (typeof dato !== 'object' || dato === null || !('usd' in dato) || typeof dato.usd !== 'number' || !Number.isFinite(dato.usd)) throw new Error(`El precio de ${moneda.nombre} no es válido.`);
    precios[moneda.id] = { usd: dato.usd };
  }
  return precios;
}
