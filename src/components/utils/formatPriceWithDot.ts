export default function formatPriceWithDot(value: number | string) {
  const intValue = Math.floor(Number(value));
  return intValue.toLocaleString('en-US').replace(/,/g, '.');
} 