import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import { PolizaEntry } from '../../types/accounting.js';
import {
  Plus,
  Trash2,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  X,
  BookOpen
} from 'lucide-react';

const STANDARD_ACCOUNTS = [
  { code: '1101-01', name: 'Caja General (Efectivo)' },
  { code: '1102-01', name: 'Bancos Nacionales (BBVA)' },
  { code: '1102-02', name: 'Bancos Nacionales (Banorte)' },
  { code: '1105-01', name: 'Clientes Nacionales' },
  { code: '1150-01', name: 'Almacén de Mercancías' },
  { code: '1201-01', name: 'Maquinaria y Equipo Industrial' },
  { code: '1202-01', name: 'Equipo de Cómputo y Servidores' },
  { code: '2101-01', name: 'Proveedores Nacionales' },
  { code: '2103-01', name: 'Retenciones de ISR por Sueldos' },
  { code: '2103-02', name: 'Cuotas Obreras IMSS por Pagar' },
  { code: '2104-01', name: 'Impuestos por Pagar (SAT IVA/ISR)' },
  { code: '2105-01', name: 'Sueldos y Salarios por Pagar' },
  { code: '3101-01', name: 'Capital Social Fijo' },
  { code: '4101-01', name: 'Ventas y Servicios Gravados al 16%' },
  { code: '5101-01', name: 'Costo de Ventas Directo' },
  { code: '6101-01', name: 'Sueldos y Salarios Administrativos' },
  { code: '6101-02', name: 'Cuotas Patronales IMSS e Infonavit' },
  { code: '6102-01', name: 'Arrendamiento de Oficinas y Almacén' },
  { code: '7101-01', name: 'Gastos Financieros y Comisiones' }
];

export const GeneralLedgerView: React.FC = () => {
  const { activeClient, polizas, createPoliza, deletePoliza } = useAccounting();

  const [typeFilter, setTypeFilter] = useState<'all' | 'Diario' | 'Ingreso' | 'Egreso'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Poliza Form State
  const [polizaNumber, setPolizaNumber] = useState('');
  const [polizaDate, setPolizaDate] = useState(new Date().toISOString().split('T')[0]);
  const [polizaType, setPolizaType] = useState<'Diario' | 'Ingreso' | 'Egreso'>('Diario');
  const [polizaConcept, setPolizaConcept] = useState('');
  const [entries, setEntries] = useState<PolizaEntry[]>([
    { id: '1', accountCode: '1102-01', accountName: 'Bancos Nacionales (BBVA)', concept: '', debe: 0, haber: 0 },
    { id: '2', accountCode: '4101-01', accountName: 'Ventas y Servicios Gravados al 16%', concept: '', debe: 0, haber: 0 }
  ]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!activeClient) return null;

  // Filtered polizas
  const filteredPolizas = polizas.filter(p => {
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    const matchesSearch = p.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Entry calculations for modal
  const totalDebe = entries.reduce((sum, e) => sum + (Number(e.debe) || 0), 0);
  const totalHaber = entries.reduce((sum, e) => sum + (Number(e.haber) || 0), 0);
  const difference = Math.abs(totalDebe - totalHaber);
  const isBalanced = difference < 0.01 && totalDebe > 0;

  const handleAddEntry = () => {
    setEntries([
      ...entries,
      {
        id: Date.now().toString(),
        accountCode: '1105-01',
        accountName: 'Clientes Nacionales',
        concept: polizaConcept || '',
        debe: 0,
        haber: 0
      }
    ]);
  };

  const handleRemoveEntry = (index: number) => {
    if (entries.length <= 2) {
      alert('Una póliza contable debe contener al menos 2 partidas (Principio de Partida Doble).');
      return;
    }
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleAccountChange = (index: number, code: string) => {
    const acc = STANDARD_ACCOUNTS.find(a => a.code === code);
    const updated = [...entries];
    updated[index].accountCode = code;
    updated[index].accountName = acc ? acc.name : '';
    setEntries(updated);
  };

  const handleEntryChange = (index: number, field: keyof PolizaEntry, value: any) => {
    const updated = [...entries];
    (updated[index] as any)[field] = value;
    setEntries(updated);
  };

  const handleSubmitPoliza = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!polizaConcept.trim()) {
      setErrorMsg('Debe especificar el concepto general de la póliza.');
      return;
    }

    if (!isBalanced) {
      setErrorMsg(`La póliza no está cuadrada. Diferencia: $${difference.toFixed(2)} MXN.`);
      return;
    }

    try {
      await createPoliza({
        number: polizaNumber || `P-${polizaType[0]}-${Date.now().toString().slice(-4)}`,
        date: polizaDate,
        type: polizaType,
        concept: polizaConcept,
        entries
      });

      setIsModalOpen(false);
      setPolizaConcept('');
      setEntries([
        { id: '1', accountCode: '1102-01', accountName: 'Bancos Nacionales (BBVA)', concept: '', debe: 0, haber: 0 },
        { id: '2', accountCode: '4101-01', accountName: 'Ventas y Servicios Gravados al 16%', concept: '', debe: 0, haber: 0 }
      ]);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la póliza.');
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Libro Diario Contable</span>
            <span aria-hidden="true">·</span>
            <span>Partida Doble NIF</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono">{polizas.length} Pólizas en Historial</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Pólizas & Asientos Contables
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro cronológico y fiscal para <strong>{activeClient.commercialName || activeClient.businessName}</strong>
          </p>
        </div>

        <button
          onClick={() => {
            setPolizaNumber(`POL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-emerald-950"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Póliza Contable</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por concepto o folio de póliza..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              typeFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({polizas.length})
          </button>
          <button
            onClick={() => setTypeFilter('Diario')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              typeFilter === 'Diario' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diario
          </button>
          <button
            onClick={() => setTypeFilter('Ingreso')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              typeFilter === 'Ingreso' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ingreso
          </button>
          <button
            onClick={() => setTypeFilter('Egreso')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              typeFilter === 'Egreso' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Egreso
          </button>
        </div>
      </div>

      {/* Polizas List */}
      <div className="space-y-4">
        {filteredPolizas.map(p => (
          <div key={p.id} className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {/* Header of Poliza */}
            <div className="bg-slate-950/70 px-5 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-white tracking-wide">{p.number}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  p.type === 'Ingreso' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' :
                  p.type === 'Egreso' ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60' :
                  'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                }`}>
                  PÓLIZA DE {p.type.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-mono">Fecha: {p.date}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Cuadrada: ${p.totalDebe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar la póliza ${p.number}? Esta acción actualizará los balances contables.`)) {
                      deletePoliza(p.id);
                    }
                  }}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  title="Eliminar póliza"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Concept */}
            <div className="px-5 py-2.5 bg-slate-900/40 text-xs text-slate-300 border-b border-slate-800/60">
              <span className="font-semibold text-slate-400 mr-2">Concepto:</span>
              {p.concept}
            </div>

            {/* Entries Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/40 text-slate-400 border-b border-slate-800/60">
                  <tr>
                    <th className="py-2 px-5 font-medium">Cuenta Contable</th>
                    <th className="py-2 px-4 font-medium">Nombre de la Partida</th>
                    <th className="py-2 px-4 font-medium">Concepto Específico</th>
                    <th className="py-2 px-4 font-medium text-right">Debe (Cargo)</th>
                    <th className="py-2 px-5 font-medium text-right">Haber (Abono)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 font-mono">
                  {p.entries.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2 px-5 text-slate-300 font-semibold">{entry.accountCode}</td>
                      <td className="py-2 px-4 font-sans text-slate-300">{entry.accountName}</td>
                      <td className="py-2 px-4 font-sans text-slate-400">{entry.concept || p.concept}</td>
                      <td className="py-2 px-4 text-right text-slate-200 tabular-nums">
                        {entry.debe > 0 ? `$${entry.debe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="py-2 px-5 text-right text-slate-200 tabular-nums">
                        {entry.haber > 0 ? `$${entry.haber.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-950/80 font-bold border-t border-slate-800">
                    <td colSpan={3} className="py-2 px-5 text-right font-sans text-slate-400">
                      SUMAS IGUALES:
                    </td>
                    <td className="py-2 px-4 text-right text-emerald-400 tabular-nums">
                      ${p.totalDebe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-5 text-right text-emerald-400 tabular-nums">
                      ${p.totalHaber.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {filteredPolizas.length === 0 && (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No se encontraron pólizas para este criterio.</p>
            <p className="text-xs text-slate-500 mt-1">Crea una nueva póliza con el botón superior.</p>
          </div>
        )}
      </div>

      {/* Modal: Nueva Póliza con Validador de Partida Doble en Tiempo Real */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Registro de Póliza Contable</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPoliza} className="p-6 space-y-5 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* General Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Folio / Número</label>
                  <input
                    type="text"
                    required
                    value={polizaNumber}
                    onChange={e => setPolizaNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha de Registro</label>
                  <input
                    type="date"
                    required
                    value={polizaDate}
                    onChange={e => setPolizaDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tipo de Póliza</label>
                  <select
                    value={polizaType}
                    onChange={e => setPolizaType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Diario">Póliza de Diario</option>
                    <option value="Ingreso">Póliza de Ingreso</option>
                    <option value="Egreso">Póliza de Egreso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Concepto General de la Operación</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Liquidación de factura F-1090 por concepto de asesoría..."
                  value={polizaConcept}
                  onChange={e => setPolizaConcept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Entries Grid */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">Desglose de Partidas (Partida Doble)</span>
                  <button
                    type="button"
                    onClick={handleAddEntry}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Partida
                  </button>
                </div>

                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Cuenta Contable</th>
                        <th className="py-2 px-3">Concepto Particular</th>
                        <th className="py-2 px-3 text-right">Debe (Cargo)</th>
                        <th className="py-2 px-3 text-right">Haber (Abono)</th>
                        <th className="py-2 px-2 text-center w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {entries.map((entry, idx) => (
                        <tr key={entry.id}>
                          <td className="p-2">
                            <select
                              value={entry.accountCode}
                              onChange={e => handleAccountChange(idx, e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:border-emerald-500 focus:outline-none"
                            >
                              {STANDARD_ACCOUNTS.map(acc => (
                                <option key={acc.code} value={acc.code}>
                                  {acc.code} - {acc.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder={polizaConcept || 'Concepto partida'}
                              value={entry.concept}
                              onChange={e => handleEntryChange(idx, 'concept', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:border-emerald-500 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={entry.debe || ''}
                              onChange={e => handleEntryChange(idx, 'debe', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-28 px-2 py-1.5 text-right font-mono bg-slate-900 border border-slate-800 rounded text-slate-200 focus:border-emerald-500 focus:outline-none tabular-nums"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={entry.haber || ''}
                              onChange={e => handleEntryChange(idx, 'haber', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-28 px-2 py-1.5 text-right font-mono bg-slate-900 border border-slate-800 rounded text-slate-200 focus:border-emerald-500 focus:outline-none tabular-nums"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveEntry(idx)}
                              className="text-slate-500 hover:text-red-400"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Double-entry Balance Validator Live Panel */}
                <div className={`p-3.5 rounded-lg border flex items-center justify-between text-xs font-mono ${
                  isBalanced
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                    : 'bg-red-950/40 border-red-800/80 text-red-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {isBalanced ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>
                      {isBalanced
                        ? 'Póliza cuadrada perfectamente. Principio de partida doble verificado.'
                        : `Desbalance contable: Diferencia de $${difference.toFixed(2)} MXN entre Cargos y Abonos.`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-right tabular-nums">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Total Cargos (Debe)</span>
                      <span className="font-bold text-white">${totalDebe.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Total Abonos (Haber)</span>
                      <span className="font-bold text-white">${totalHaber.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className={`px-5 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    isBalanced
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Póliza Balanceada</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
