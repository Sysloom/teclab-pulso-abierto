import { afterEach, describe, expect, it, vi } from 'vitest';
import { obtenerPrecios, URL_API } from './precios';

afterEach(() => vi.unstubAllGlobals());

describe('obtenerPrecios', () => {
  it('consulta la API y adapta únicamente los precios conocidos al formato de la aplicación', async () => {
    const json = vi.fn().mockResolvedValue({
      bitcoin: { usd: 70000, eur: 65000 },
      ethereum: { usd: 3500 },
      dogecoin: { usd: 1 },
    });
    const fetchSimulado = vi.fn().mockResolvedValue({ ok: true, status: 200, json });
    vi.stubGlobal('fetch', fetchSimulado);
    const controlador = new AbortController();

    await expect(obtenerPrecios(controlador.signal)).resolves.toEqual({
      bitcoin: { usd: 70000 },
      ethereum: { usd: 3500 },
    });
    expect(fetchSimulado).toHaveBeenCalledWith(URL_API, { signal: controlador.signal });
    expect(json).toHaveBeenCalledOnce();
  });

  it('rechaza respuestas HTTP no exitosas sin procesar el JSON', async () => {
    const json = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, json }));

    await expect(obtenerPrecios()).rejects.toThrow(/503/);
    expect(json).not.toHaveBeenCalled();
  });
});
