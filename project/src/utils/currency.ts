export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    currencyDisplay: 'narrowSymbol'
  }).format(amount).replace('KES', 'KSh');
};
