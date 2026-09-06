// All prices are stored as integers in pesewas. Format to GHS at display time only.
export function formatPrice(pesewas: number): string {
  return `GHS ${(pesewas / 100).toFixed(2)}`
}
