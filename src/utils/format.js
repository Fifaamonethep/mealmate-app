export const formatCurrency = (amount, currencyCode = 'LAK') => {
  if (amount === undefined || amount === null) return '0.00 ' + currencyCode;
  
  // Create a formatter
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${formatter.format(amount)} ${currencyCode}`;
}
