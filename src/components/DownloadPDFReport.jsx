// src/components/DownloadPDFReport.jsx
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { calculateNetAmount, formatAmount } from '../utils/accountingUtils';

function DownloadPDFReport({ entries }) {
  const handleDownload = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Tatillen Ön Muhasebe Raporu', 14, 20);

    doc.setFontSize(11);
    doc.text(`Kayıt Sayısı: ${entries.length}`, 14, 28);
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 150, 28);

    const tableData = entries.map(e => ([
      e.date,
      e.type,
      e.category,
      e.note,
      formatAmount(e.amount),
      e.currency,
      `${e.commission}%`,
      `${e.kdv}%`,
      `${e.tourismTax}%`,
      formatAmount(calculateNetAmount(e)),
    ]));

    doc.autoTable({
      head: [[
        'Tarih', 'Tip', 'Kategori', 'Açıklama', 'Tutar', 'Para',
        'POS', 'KDV', 'Turizm', 'Net'
      ]],
      body: tableData,
      startY: 36,
      styles: { font: 'helvetica', fontSize: 9 },
      headStyles: { fillColor: [22, 160, 133] },
      theme: 'striped',
    });

    doc.save('tatillen-on-muhasebe.pdf');
  };

  return (
    <button onClick={handleDownload}>🧾 PDF Rapor Al</button>
  );
}

export default DownloadPDFReport;
