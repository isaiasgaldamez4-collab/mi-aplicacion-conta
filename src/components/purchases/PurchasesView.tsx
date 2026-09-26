import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import { CompanyPurchase } from '../../types/accounting.js';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Receipt,
  FileCheck2,
  Building,
  CreditCard,
  DollarSign,
  AlertCircle,
  X
} from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const {
    activeClient,
    purchases,
    bankAccounts,
    createPurchase,
    deletePurchase
  } = useAccounting();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('todos');

  // Form State
  const [providerName, setProviderName] = useState('');
  const [providerRfc, setProviderRfc] = useState('');
  const [invoiceFolio, setInvoiceFolio] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<CompanyPurchase['category']>('Materia Prima / Inventario');
  const [subtotal, setSubtotal] = useState('');
  const [ivaRate, setIvaRate] = useState('0.16');
  const [retentionIsr, setRetentionIsr] = useState('0');
  const [retentionIva, setRetentionIva] = useState('0');
  const [paymentCondition, setPaymentCondition] = useState<'Contado' | 'Crédito'>('Contado');
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id || '');
  const [deductibility, setDeductibility] = useState<CompanyPurchase['deductibility']>('100% Deducible');
  const [notes, setNotes] = useState('');

  if (!activeClient) return null;

  const numSubtotal = parseFloat(subtotal) || 0;
  const numIvaRate = parseFloat(ivaRate) || 0;
  const numIva = numSubtotal * numIvaRate;
  const numRetIsr = parseFloat(retentionIsr) || 0;
  const numRetIva = parseFloat(retentionIva) || 0;
  const calculatedTotal = numSubtotal + numIva - numRetIsr - numRetIva;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName || numSubtotal <= 0) return;

    await createPurchase({
      providerName,
      providerRfc: providerRfc.toUpperCase() || 'XAXX010101000',
      invoiceFolio,
      date,
      dueDate: paymentCondition === 'Crédito' ? dueDate : date,
      category,
      subtotal: numSubtotal,
      ivaRate: numIvaRate,
      ivaAmount: numIva,
      retentionIsr: numRetIsr,
      retentionIva: numRetIva,
      paymentCondition,
      bankAccountId: paymentCondition === 'Contado' ? bankAccountId : undefined,
      deductibility,
      notes
    });

    setIsModalOpen(false);
    setProviderName('');
    setProviderRfc('');
    setInvoiceFolio('');
    setSubtotal('');
    setRetentionIsr('0');
    setRetentionIva('0');
    setNotes('');
  };

  const filteredPurchases = purchases.filter(p => {
    if (filterCategory === 'todos') return true;
    return p.category === filterCategory;
  });

  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalIvaAcreditable = purchases
    .filter(p => p.deductibility !== 'No Deducible')
    .reduce((sum, p) => sum + p.ivaAmount, 0);
  const totalOnCredit = purchases
    .filter(p => p.paymentCondition === 'Crédito' && p.status === 'Por Pagar')
    .reduce((sum, p) => sum + p.total, 0);

  const formatMoney = (val: number) => `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Contabilidad de Costos & Proveedores</span>
            <span aria-hidden="true">·</span>
            <span>Compras de la Empresa</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono font-medium">{purchases.length} Adquisiciones</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Compras & Adquisiciones de la Empresa
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro manual de compras de materia prima, inventario, activo fijo y gastos deducibles para <strong>{activeClient.commercialName || activeClient.businessName}</strong>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-emerald-950 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Compra</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Total Compras Acumuladas</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatMoney(totalPurchasesAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Registrado directamente por el contador
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>IVA Acreditable Generado</span>
            <Receipt className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
            {formatMoney(totalIvaAcreditable)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Acreditable para pago mensual SAT
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Compras a Crédito Pendientes</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {formatMoney(totalOnCredit)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Impacta el pasivo a proveedores
          </div>
        </div>
      </div>

      {/* Purchases List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Filtrar por Categoría:</span>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none"
            >
              <option value="todos">Todas las categorías</option>
              <option value="Materia Prima / Inventario">Materia Prima / Inventario</option>
              <option value="Mercancías para Reventa">Mercancías para Reventa</option>
              <option value="Activo Fijo (Maquinaria / Equipo)">Activo Fijo (Maquinaria/Equipo)</option>
              <option value="Gasto Operativo">Gasto Operativo</option>
              <option value="Servicios Básicos (Luz, Internet, Renta)">Servicios Básicos</option>
              <option value="Honorarios Profesionales">Honorarios</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Mostrando {filteredPurchases.length} de {purchases.length} compras
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Folio Compra</th>
                <th className="py-2.5 px-4 font-medium">Fecha</th>
                <th className="py-2.5 px-4 font-medium">Proveedor & RFC</th>
                <th className="py-2.5 px-4 font-medium">Categoría</th>
                <th className="py-2.5 px-4 font-medium">Condición</th>
                <th className="py-2.5 px-4 font-medium text-right">Subtotal</th>
                <th className="py-2.5 px-4 font-medium text-right">IVA</th>
                <th className="py-2.5 px-4 font-medium text-right">Total</th>
                <th className="py-2.5 px-4 font-medium text-center">Deducibilidad</th>
                <th className="py-2.5 px-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {filteredPurchases.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-slate-200">
                    <div>{p.purchaseNumber}</div>
                    {p.invoiceFolio && (
                      <span className="text-[10px] text-slate-400 font-normal">Fac: {p.invoiceFolio}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{p.date}</td>
                  <td className="py-3 px-4 font-sans text-slate-200">
                    <div className="font-semibold text-white">{p.providerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.providerRfc}</div>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 border border-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      p.paymentCondition === 'Contado'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                    }`}>
                      {p.paymentCondition} ({p.status})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                    {formatMoney(p.subtotal)}
                  </td>
                  <td className="py-3 px-4 text-right text-blue-400 tabular-nums">
                    {formatMoney(p.ivaAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-white tabular-nums">
                    {formatMoney(p.total)}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      p.deductibility === '100% Deducible'
                        ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/50'
                        : p.deductibility === 'Parcialmente Deducible'
                        ? 'text-amber-400 bg-amber-950/40 border border-amber-800/50'
                        : 'text-red-400 bg-red-950/40 border border-red-800/50'
                    }`}>
                      {p.deductibility}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => deletePurchase(p.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Eliminar compra"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500 font-sans">
                    <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-400">No hay compras registradas en esta vista.</p>
                    <p className="text-xs text-slate-500 mt-1">Usa el botón "Registrar Compra" para ingresar adquisiciones desde cero.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Compra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Registro de Compra de la Empresa</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nombre o Razón Social del Proveedor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Aceros del Norte S.A."
                    value={providerName}
                    onChange={e => setProviderName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">RFC del Proveedor</label>
                  <input
                    type="text"
                    placeholder="ACN880312RA9"
                    value={providerRfc}
                    onChange={e => setProviderRfc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Folio Factura / Remisión</label>
                  <input
                    type="text"
                    placeholder="F-9821"
                    value={invoiceFolio}
                    onChange={e => setInvoiceFolio(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha de Compra</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Categoría Contable</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Materia Prima / Inventario">Materia Prima / Inventario</option>
                    <option value="Mercancías para Reventa">Mercancías para Reventa</option>
                    <option value="Activo Fijo (Maquinaria / Equipo)">Activo Fijo (Maquinaria / Equipo)</option>
                    <option value="Gasto Operativo">Gasto Operativo</option>
                    <option value="Servicios Básicos (Luz, Internet, Renta)">Servicios Básicos</option>
                    <option value="Honorarios Profesionales">Honorarios Profesionales</option>
                    <option value="Combustible y Viáticos">Combustible y Viáticos</option>
                  </select>
                </div>
              </div>

              {/* Importes */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Subtotal ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0.01"
                      placeholder="0.00"
                      value={subtotal}
                      onChange={e => setSubtotal(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Tasa IVA</label>
                    <select
                      value={ivaRate}
                      onChange={e => setIvaRate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none"
                    >
                      <option value="0.16">16% General</option>
                      <option value="0.08">8% Fronterizo</option>
                      <option value="0">0% Tasa Cero</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Retención ISR ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={retentionIsr}
                      onChange={e => setRetentionIsr(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Retención IVA ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={retentionIva}
                      onChange={e => setRetentionIva(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">Total Liquidación de Compra:</span>
                  <span className="text-base font-bold text-emerald-400 tabular-nums">
                    {formatMoney(calculatedTotal)}
                  </span>
                </div>
              </div>

              {/* Forma de Pago y Deducibilidad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Condición de Pago</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentCondition('Contado')}
                      className={`py-2 rounded-lg font-medium border text-center transition-colors ${
                        paymentCondition === 'Contado'
                          ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Contado (Salida de Banco)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentCondition('Crédito')}
                      className={`py-2 rounded-lg font-medium border text-center transition-colors ${
                        paymentCondition === 'Crédito'
                          ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      A Crédito (Genera Deuda)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Estatus Fiscal (Deducibilidad)</label>
                  <select
                    value={deductibility}
                    onChange={e => setDeductibility(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="100% Deducible">100% Deducible (con CFDI y requisito fiscal)</option>
                    <option value="Parcialmente Deducible">Parcialmente Deducible</option>
                    <option value="No Deducible">No Deducible (Art. 28 LISR)</option>
                  </select>
                </div>
              </div>

              {paymentCondition === 'Contado' && bankAccounts.length > 0 && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cuenta Bancaria de Salida</label>
                  <select
                    value={bankAccountId}
                    onChange={e => setBankAccountId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} ({b.accountNumber}) - Saldo: {formatMoney(b.currentBalance)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {paymentCondition === 'Crédito' && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha Límite de Pago a Proveedor</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Notas o Detalle de Partida</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de la compra, contrato u orden de compra..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar Compra en Libros</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
