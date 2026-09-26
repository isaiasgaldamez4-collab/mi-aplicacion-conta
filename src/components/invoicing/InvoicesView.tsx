import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import { Invoice } from '../../types/accounting.js';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Building,
  DollarSign,
  X
} from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const { activeClient, invoices, createInvoice, updateInvoiceStatus } = useAccounting();

  const [typeFilter, setTypeFilter] = useState<'all' | 'Emitida' | 'Recibida'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Invoice Form
  const [invType, setInvType] = useState<'Emitida' | 'Recibida'>('Emitida');
  const [invFolio, setInvFolio] = useState('');
  const [partyRfc, setPartyRfc] = useState('');
  const [partyName, setPartyName] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invDueDate, setInvDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [subtotal, setSubtotal] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PUE' | 'PPD'>('PUE');
  const [category, setCategory] = useState('Servicios Generales');

  if (!activeClient) return null;

  const filtered = invoices.filter(i => {
    const matchesType = typeFilter === 'all' || i.type === typeFilter;
    const matchesSearch =
      i.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.partyRfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.uuid.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const subVal = parseFloat(subtotal) || 0;
  const ivaVal = subVal * 0.16;
  const totalVal = subVal + ivaVal;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || !subtotal) return;

    await createInvoice({
      type: invType,
      folio: invFolio || `F-${Math.floor(1000 + Math.random() * 9000)}`,
      partyRfc: partyRfc || 'XAXX010101000',
      partyName,
      date: invDate,
      dueDate: invDueDate,
      subtotal: subVal,
      taxIva: ivaVal,
      taxRetention: 0,
      total: totalVal,
      paymentMethod,
      category
    });

    setIsModalOpen(false);
    setPartyName('');
    setPartyRfc('');
    setSubtotal('');
    setInvFolio('');
  };

  const formatMoney = (val: number | undefined) => {
    if (val === undefined) return '$0.00';
    return `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Comprobantes Fiscales Digitales (CFDI)</span>
            <span aria-hidden="true">·</span>
            <span>SAT v4.0 Timbrado</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono font-medium">{invoices.length} Facturas Registradas</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Facturación & CFDIs Fiscales
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingresos y egresos fiscales validados para <strong>{activeClient.commercialName || activeClient.businessName}</strong>
          </p>
        </div>

        <button
          onClick={() => {
            setInvFolio(`F-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-emerald-950"
        >
          <Plus className="w-4 h-4" />
          <span>Generar CFDI Fiscal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por RFC, Razón Social, Folio o UUID fiscal..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              typeFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({invoices.length})
          </button>
          <button
            onClick={() => setTypeFilter('Emitida')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              typeFilter === 'Emitida' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Emitidas (Ingresos)
          </button>
          <button
            onClick={() => setTypeFilter('Recibida')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              typeFilter === 'Recibida' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recibidas (Gastos)
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-5 font-medium">Folio & Tipo</th>
                <th className="py-2.5 px-4 font-medium">Receptor / Emisor (Tercero)</th>
                <th className="py-2.5 px-4 font-medium">UUID Timbre Fiscal (SAT)</th>
                <th className="py-2.5 px-4 font-medium">Fecha</th>
                <th className="py-2.5 px-4 font-medium text-right">Subtotal</th>
                <th className="py-2.5 px-4 font-medium text-right">Total (+IVA)</th>
                <th className="py-2.5 px-5 font-medium text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {filtered.map(i => (
                <tr key={i.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-5">
                    <div className="font-bold text-white text-xs">{i.folio}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold inline-block mt-0.5 ${
                      i.type === 'Emitida'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                    }`}>
                      {i.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <div className="font-medium text-slate-200 truncate max-w-xs">{i.partyName}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">RFC: {i.partyRfc}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-[200px]" title={i.uuid}>
                    {i.uuid}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <div>{i.date}</div>
                    <div className="text-[10px] text-slate-500">{i.paymentMethod}</div>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                    {formatMoney(i.subtotal)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-white tabular-nums text-sm">
                    {formatMoney(i.total)}
                  </td>
                  <td className="py-3 px-5 text-center font-sans">
                    <select
                      value={i.status}
                      onChange={e => updateInvoiceStatus(i.id, e.target.value as any)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded border focus:outline-none cursor-pointer ${
                        i.status === 'Cobrada' || i.status === 'Pagada'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          : i.status === 'Vigente'
                          ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                          : 'bg-red-950/80 text-red-300 border-red-800'
                      }`}
                    >
                      <option value="Vigente">Vigente</option>
                      <option value="Cobrada">Cobrada</option>
                      <option value="Pagada">Pagada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-sans">
                    No se encontraron facturas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nuevo CFDI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-base font-bold text-white">Generar Comprobante Fiscal CFDI 4.0</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tipo de Factura</label>
                  <select
                    value={invType}
                    onChange={e => setInvType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Emitida">Factura Emitida (Ingreso)</option>
                    <option value="Recibida">Factura Recibida (Gasto / Proveedor)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Folio Serie</label>
                  <input
                    type="text"
                    required
                    value={invFolio}
                    onChange={e => setInvFolio(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  {invType === 'Emitida' ? 'Cliente / Receptor (Razón Social)' : 'Proveedor / Emisor'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Corporativo Acerero de México S.A. de C.V."
                  value={partyName}
                  onChange={e => setPartyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">RFC Tercero</label>
                  <input
                    type="text"
                    required
                    placeholder="CAM180215XYZ"
                    value={partyRfc}
                    onChange={e => setPartyRfc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="PUE">PUE - Pago en una sola exhibición</option>
                    <option value="PPD">PPD - Pago en parcialidades o diferido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha Emisión</label>
                  <input
                    type="date"
                    required
                    value={invDate}
                    onChange={e => setInvDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={invDueDate}
                    onChange={e => setInvDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subtotal & Calculated Taxes */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Subtotal ($ MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0.00"
                    value={subtotal}
                    onChange={e => setSubtotal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                  <span>IVA Trasladado (16%):</span>
                  <span className="text-slate-200">{formatMoney(ivaVal)}</span>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-white pt-1 font-mono">
                  <span>Total Facturado:</span>
                  <span className="text-emerald-400 text-base">{formatMoney(totalVal)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Timbrar CFDI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
