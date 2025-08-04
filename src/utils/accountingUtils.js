// src/utils/accountingUtils.js

// Tutarı net hale getirir (komisyon + KDV + turizm vergisi çıkarılır)
export function calculateNetAmount(entry) {
  const amount = Number(entry.amount) || 0;
  const commission = Number(entry.commission) || 0;
  const kdv = Number(entry.kdv) || 0;
  const tourismTax = Number(entry.tourismTax) || 0;
  const totalTaxRate = (commission + kdv + tourismTax) / 100;

  const net = amount * (1 - totalTaxRate);
  return Math.round(net * 100) / 100;
}

// Örnek: 1234.56 → "1.234,56"
export function formatAmount(value) {
  const num = Number(value) || 0;
  return num.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Tarihi ay bazlı anahtar yapar: "2025-08-01" → "2025-08"
export function monthKey(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : '';
}
