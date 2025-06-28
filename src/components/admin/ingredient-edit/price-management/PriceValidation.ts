
export const isPriceErroneous = (price: number, unit: string): boolean => {
  if (unit === 'kg') {
    return price < 0.5 || price > 100;
  }
  if (unit === 'l' || unit === 'litro') {
    return price < 0.3 || price > 50;
  }
  if (unit === 'g') {
    return price > 5;
  }
  return false;
};

export interface PriceEditData {
  priceId?: string;
  countryId: string;
  countryName: string;
  price: number;
  unit: string;
  seasonVariation?: string;
}
