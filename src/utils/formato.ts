/**
 * Formatea un precio en dólares con separador de miles y dos decimales.
 * Se utiliza tanto en el listado como en la página de detalle.
 */
export function formatearPrecio(precio: number): string {
  return `${precio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
}
