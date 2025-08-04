import React, { useEffect, useMemo, useState } from 'react';
import './OnMuhasebePage.css';
import { utils, write, read } from 'xlsx';
import { calculateNetAmount, formatAmount, monthKey } from '../utils/accountingUtils';
import MonthlyProfitChart from '../components/MonthlyProfitChart';
import DownloadPDFReport from '../components/DownloadPDFReport';

function OnMuhasebePage() {
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('tatillen_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [filter, setFilter] = useState({
    month: 'Hepsi',
    type: 'Hepsi',
    category: 'Hepsi',
    method: 'Hepsi',
    currency: 'Hepsi',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });

  const [newEntry, setNewEntry] = useState({
    date: '',
    type: 'Gelir',
    category: '',
    note: '',
    amount: '',
    currency: '₺',
    method: 'Nakit',
    commission: 0,
    kdv: 0,
    tourismTax: 0,
  });

  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem('tatillen_entries', JSON.stringify(entries));
  }, [entries]);

  const uniqueMonths = useMemo(() => {
    const set = new Set(entries.map(e => monthKey(e.date)));
    return Array.from(set).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const mKey = monthKey(entry.date);
      const matchMonth = filter.month === 'Hepsi' || mKey === filter.month;
      const matchType = filter.type === 'Hepsi' || entry.type === filter.type;
      const matchCategory = filter.category === 'Hepsi' || entry.category === filter.category;
      const matchMethod = filter.method === 'Hepsi' || entry.method === filter.method;
      const matchCurrency = filter.currency === 'Hepsi' || entry.currency === filter.currency;
      const matchSearch =
        filter.search === '' ||
        entry.category?.toLowerCase().includes(filter.search.toLowerCase()) ||
        entry.note?.toLowerCase().includes(filter.search.toLowerCase());
      const matchDateFrom = filter.dateFrom ? entry.date >= filter.dateFrom : true;
      const matchDateTo = filter.dateTo ? entry.date <= filter.dateTo : true;

      return matchMonth && matchType && matchCategory && matchMethod && matchCurrency && matchSearch && matchDateFrom && matchDateTo;
    });
  }, [entries, filter]);

  const totals = useMemo(() => {
    const result = {
      grossIncome: 0,
      netIncome: 0,
      grossExpense: 0,
      netExpense: 0,
    };
    filteredEntries.forEach(entry => {
      const net = calculateNetAmount(entry);
      if (entry.type === 'Gelir') {
        result.grossIncome += Number(entry.amount);
        result.netIncome += net;
      } else {
        result.grossExpense += Number(entry.amount);
        result.netExpense += net;
      }
    });
    return result;
  }, [filteredEntries]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = () => {
    const newData = { ...newEntry, amount: parseFloat(newEntry.amount) };
    if (editIndex !== null) {
      const updated = [...entries];
      updated[editIndex] = newData;
      setEntries(updated);
      setEditIndex(null);
    } else {
      setEntries([...entries, newData]);
    }
    setNewEntry({
      date: '',
      type: 'Gelir',
      category: '',
      note: '',
      amount: '',
      currency: '₺',
      method: 'Nakit',
      commission: 0,
      kdv: 0,
      tourismTax: 0,
    });
  };

  const handleEdit = (index) => {
    setNewEntry(entries[index]);
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (index) => {
    if (window.confirm("Bu kaydı silmek istiyor musun?")) {
      const updated = [...entries];
      updated.splice(index, 1);
      setEntries(updated);
    }
  };

  const handleExcelExport = () => {
    const data = entries.map(e => ({ ...e, netAmount: calculateNetAmount(e) }));
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Muhasebe');
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'muhasebe.xlsx';
    link.click();
  };

  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const wb = read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = utils.sheet_to_json(ws);
    const newEntries = json.map(item => ({
      date: item.date || '',
      type: item.type || 'Gelir',
      category: item.category || '',
      note: item.note || '',
      amount: Number(item.amount || 0),
      currency: item.currency || '₺',
      method: item.method || 'Nakit',
      commission: Number(item.commission || 0),
      kdv: Number(item.kdv || 0),
      tourismTax: Number(item.tourismTax || 0),
    }));
    setEntries(prev => [...prev, ...newEntries]);
  };

  return (
    <div className="muhasebe-container">
      <h1>💼 Ön Muhasebe Paneli</h1>

      <div className="summary-cards">
        <div className="card gelir">
          <strong>Brüt Gelir:</strong> {formatAmount(totals.grossIncome)} ₺
          <br />
          <strong>Net Gelir:</strong> {formatAmount(totals.netIncome)} ₺
        </div>
        <div className="card gider">
          <strong>Brüt Gider:</strong> {formatAmount(totals.grossExpense)} ₺
          <br />
          <strong>Net Gider:</strong> {formatAmount(totals.netExpense)} ₺
        </div>
        <div className="card net">
          <strong>Kâr / Zarar:</strong> {formatAmount(totals.netIncome - totals.netExpense)} ₺
        </div>
      </div>

      <MonthlyProfitChart entries={entries} />

      <div className="filters">
        <select name="month" value={filter.month} onChange={(e) => setFilter({ ...filter, month: e.target.value })}>
          <option value="Hepsi">Tüm Aylar</option>
          {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select name="type" value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
          <option>Hepsi</option>
          <option>Gelir</option>
          <option>Gider</option>
        </select>
        <input name="search" value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} placeholder="Kategori / Not" />
        <input type="date" name="dateFrom" value={filter.dateFrom} onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })} />
        <input type="date" name="dateTo" value={filter.dateTo} onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })} />
      </div>

      <div className="export-buttons">
        <button onClick={handleExcelExport}>📥 Excel'e Aktar</button>
        <label className="import-button">
          📤 Excel'den Yükle
          <input type="file" accept=".xlsx,.csv" onChange={handleExcelImport} />
        </label>
        <DownloadPDFReport entries={filteredEntries} />
      </div>

      <table className="muhasebe-table">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Tip</th>
            <th>Kategori</th>
            <th>Açıklama</th>
            <th>Tutar</th>
            <th>Para</th>
            <th>POS</th>
            <th>KDV</th>
            <th>Turizm</th>
            <th>Net</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry, index) => (
            <tr key={index} className={entry.type === 'Gelir' ? 'gelir' : 'gider'}>
              <td>{entry.date}</td>
              <td>{entry.type}</td>
              <td>{entry.category}</td>
              <td>{entry.note}</td>
              <td>{formatAmount(entry.amount)}</td>
              <td>{entry.currency}</td>
              <td>{entry.commission}%</td>
              <td>{entry.kdv}%</td>
              <td>{entry.tourismTax}%</td>
              <td>{formatAmount(calculateNetAmount(entry))}</td>
              <td>
                <button onClick={() => handleEdit(index)}>✏️</button>
                <button onClick={() => handleDelete(index)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{editIndex !== null ? '📝 Kaydı Güncelle' : '➕ Yeni Kayıt Ekle'}</h3>
      <div className="entry-form">
        <input type="date" name="date" value={newEntry.date} onChange={handleInputChange} />
        <select name="type" value={newEntry.type} onChange={handleInputChange}>
          <option>Gelir</option>
          <option>Gider</option>
        </select>
        <input name="category" value={newEntry.category} onChange={handleInputChange} placeholder="Kategori" />
        <input name="note" value={newEntry.note} onChange={handleInputChange} placeholder="Açıklama" />
        <input name="amount" type="number" value={newEntry.amount} onChange={handleInputChange} placeholder="Tutar" />
        <input name="commission" type="number" value={newEntry.commission} onChange={handleInputChange} placeholder="POS (%)" />
        <input name="kdv" type="number" value={newEntry.kdv} onChange={handleInputChange} placeholder="KDV (%)" />
        <input name="tourismTax" type="number" value={newEntry.tourismTax} onChange={handleInputChange} placeholder="Turizm Vergisi (%)" />
        <button onClick={handleAddEntry}>{editIndex !== null ? 'Güncelle' : 'Ekle'}</button>
      </div>
    </div>
  );
}

export default OnMuhasebePage;
