// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { useFavoritos } from './store/favoritos';

const precios = { bitcoin: { usd: 70000 }, ethereum: { usd: 3500 }, solana: { usd: 150 } };

function respuesta(datos: unknown, ok = true): Response {
  return { ok, status: ok ? 200 : 503, json: async () => datos } as Response;
}

function mostrarApp() {
  return render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
}

beforeEach(() => {
  useFavoritos.setState({ favoritos: [] });
  localStorage.clear();
  // Toda solicitud no preparada falla localmente, nunca accede a la red.
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Solicitud no prevista')));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('consulta de precios', () => {
  it('muestra carga y luego el resultado obtenido por el servicio', async () => {
    let resolver!: (valor: Response) => void;
    vi.mocked(fetch).mockReturnValueOnce(new Promise<Response>(resolve => { resolver = resolve; }));
    const usuario = userEvent.setup();
    mostrarApp();

    await usuario.click(screen.getByRole('button', { name: 'Consultar precios' }));
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    resolver(respuesta(precios));
    expect(await screen.findByRole('heading', { name: 'Bitcoin' })).toBeInTheDocument();
    expect(screen.getByText('70,000.00 USD')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/consulta finalizada/i);
  });

  it('muestra ausencia de datos cuando la API devuelve una respuesta vacía', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(respuesta({}));
    const usuario = userEvent.setup();
    mostrarApp();

    await usuario.click(screen.getByRole('button', { name: 'Consultar precios' }));
    expect(await screen.findByText('Sin resultados: no se recibieron precios para mostrar.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Bitcoin' })).not.toBeInTheDocument();
  });

  it('informa un error y recupera la consulta al reintentar', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(respuesta({}, false)).mockResolvedValueOnce(respuesta(precios));
    const usuario = userEvent.setup();
    mostrarApp();

    await usuario.click(screen.getByRole('button', { name: 'Consultar precios' }));
    expect(await screen.findByText(/error: no se pudo completar la consulta/i)).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: /volver a intentar/i }));
    expect(await screen.findByRole('heading', { name: 'Bitcoin' })).toBeInTheDocument();
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it('sincroniza el marcado y desmarcado entre listado y detalle en ambas direcciones', async () => {
    vi.mocked(fetch).mockResolvedValue(respuesta(precios));
    const usuario = userEvent.setup();
    mostrarApp();
    const consultar = async () => {
      await usuario.click(screen.getByRole('button', { name: 'Consultar precios' }));
      await screen.findByRole('heading', { name: 'Bitcoin' });
    };
    const agregar = () => screen.getByRole('button', { name: 'Agregar Bitcoin a favoritos' });
    const quitar = () => screen.getByRole('button', { name: 'Quitar Bitcoin de favoritos' });

    await consultar();
    expect(agregar()).toHaveAttribute('aria-pressed', 'false');
    await usuario.click(agregar());
    expect(quitar()).toHaveAttribute('aria-pressed', 'true');
    await usuario.click(screen.getByRole('link', { name: 'Ver detalle de Bitcoin' }));
    expect(await screen.findByRole('heading', { name: 'Detalle de Bitcoin' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Quitar Bitcoin de favoritos' })).toHaveAttribute('aria-pressed', 'true');
    await usuario.click(quitar());
    expect(agregar()).toHaveAttribute('aria-pressed', 'false');
    await usuario.click(screen.getByRole('link', { name: 'Volver a la consulta' }));
    await consultar();
    expect(agregar()).toHaveAttribute('aria-pressed', 'false');
    await usuario.click(screen.getByRole('link', { name: 'Ver detalle de Bitcoin' }));
    expect(await screen.findByRole('heading', { name: 'Detalle de Bitcoin' })).toBeInTheDocument();
    await usuario.click(await screen.findByRole('button', { name: 'Agregar Bitcoin a favoritos' }));
    expect(quitar()).toHaveAttribute('aria-pressed', 'true');
    await usuario.click(screen.getByRole('link', { name: 'Volver a la consulta' }));
    await consultar();
    expect(quitar()).toHaveAttribute('aria-pressed', 'true');
    await usuario.click(quitar());
    expect(agregar()).toHaveAttribute('aria-pressed', 'false');
  });
});
