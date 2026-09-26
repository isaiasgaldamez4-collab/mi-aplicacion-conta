import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import { CompanyDebt } from '../../types/accounting.js';
import {
  CreditCard,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Building,
  X
} from 'lucide-react';

export const DebtsView: React.FC = () => {
  const {
    activeClient,
    debts,
    bankAccounts,
    createDebt,
    addDebtPayment,
    deleteDebt
  } = useAccounting();

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<CompanyDebt | null>(null);

  // New Debt Form
  const [creditorName, setCreditorName] = useState('');
  const [debtType, setDebtType] = useState<CompanyDebt['debtType']>('Proveedor a Crédito');
  const [concept, setConcept] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPrincipal, setPaymentPrincipal] = useState('');
  const [paymentInterest, setPaymentInterest] = useState('0');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentBankId, setPaymentBankId] = useState(bankAccounts[0]?.id || '');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  if (!activeClient) return null;

  const formatMoney = (val: number | undefined) => {
    if (val === undefined) return '$0.00';
    return `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditorName || !totalAmount) return;

    await createDebt({
      creditorName,
      debtType,
      concept: concept || 'Obligación financiera contraída',
      totalAmount: parseFloat(totalAmount),
      interestRate: parseFloat(interestRate) || 0,
      startDate,
      dueDate
    });

    setIsDebtModalOpen(false);
    setCreditorName('');
    setConcept('');
    setTotalAmount('');
    setInterestRate('0');
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtForPayment || !paymentAmount) return;

    const amt = parseFloat(paymentAmount) || 0;
    const princ = parseFloat(paymentPrincipal) || amt;
    const intr = parseFloat(paymentInterest) || Math.max(0, amt - princ);

    await addDebtPayment(selectedDebtForPayment.id, {
      date: paymentDate,
      amount: amt,
      principalAmount: princ,
      interestAmount: intr,
      bankAccountId: paymentBankId,
      reference: paymentRef || `SPEI-${Date.now().toString().slice(-4)}`,
      notes: paymentNotes
    });

    setSelectedDebtForPayment(null);
    setPaymentAmount('');
    setPaymentPrincipal('');
    setPaymentInterest('0');
    setPaymentRef('');
    setPaymentNotes('');
  };

  const totalDebtBalance = debts.reduce((sum, d) => sum + d.remainingBalance, 0);
  const totalOriginalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0);
  const activeDebtsCount = debts.filter(d => d.status === 'Vigente').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Pasivos & Obligaciones Financieras</span>
            <span aria-hidden="true">·</span>
            <span>Deudas & Proveedores a Crédito</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-mono font-medium">{activeDebtsCount} Pasivos Vigentes</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Deudas, Créditos & Pasivos de la Empresa
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Control de cuentas por pagar, préstamos bancarios y amortizaciones para <strong>{activeClient.commercialName || activeClient.businessName}</strong>
          </p>
        </div>

        <button
          onClick={() => setIsDebtModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-amber-950 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Deuda / Pasivo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Saldo Total Pendiente por Pagar</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {formatMoney(totalDebtBalance)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Impacta directamente el Pasivo del Balance General
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Monto Original Financiado</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatMoney(totalOriginalDebt)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Capital e importes contratados
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Amortizado / Liquidado</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatMoney(Math.max(0, totalOriginalDebt - totalDebtBalance))}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Pagos a capital aplicados con salida de banco
          </div>
        </div>
      </div>

      {/* Debts Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h2 className="text-xs font-semibold text-slate-300">Registro de Pasivos y Acreedores</h2>
          <span className="text-xs text-slate-400 font-mono">{debts.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4 font-medium">Acreedor / Institución</th>
                <th className="py-2.5 px-4 font-medium">Tipo de Deuda</th>
                <th className="py-2.5 px-4 font-medium">Concepto</th>
                <th className="py-2.5 px-4 font-medium text-right">Monto Original</th>
                <th className="py-2.5 px-4 font-medium text-right">Saldo Pendiente</th>
                <th className="py-2.5 px-4 font-medium">Vencimiento</th>
                <th className="py-2.5 px-4 font-medium text-center">Estado</th>
                <th className="py-2.5 px-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {debts.map(d => {
                const paidPct = d.totalAmount > 0 ? ((d.totalAmount - d.remainingBalance) / d.totalAmount) * 100 : 0;
                return (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-sans font-semibold text-white">
                      {d.creditorName}
                      {d.interestRate > 0 && (
                        <span className="text-[10px] text-slate-400 font-mono ml-2">({d.interestRate}% anual)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 border border-slate-700">
                        {d.debtType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400 max-w-xs truncate">
                      {d.concept}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                      {formatMoney(d.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-400 tabular-nums">
                      {formatMoney(d.remainingBalance)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{d.dueDate}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        d.status === 'Liquidada'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : d.status === 'Vencida'
                          ? 'bg-red-950/60 text-red-400 border border-red-800/60'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                      }`}>
                        {d.status} ({paidPct.toFixed(0)}% amortizado)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {d.status !== 'Liquidada' && (
                          <button
                            onClick={() => {
                              setSelectedDebtForPayment(d);
                              setPaymentAmount(d.remainingBalance.toString());
                              setPaymentPrincipal(d.remainingBalance.toString());
                            }}
                            className="px-2.5 py-1 text-[11px] font-sans font-medium text-emerald-400 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 rounded"
                          >
                            Abonar / Pagar
                          </button>
                        )}
                        <button
                          onClick={() => deleteDebt(d.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {debts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500 font-sans">
                    <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-400">No hay deudas o pasivos registrados.</p>
                    <p className="text-xs text-slate-500 mt-1">Registra proveedores a crédito, préstamos bancarios u obligaciones fiscales desde cero.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Deuda */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Registrar Deuda o Pasivo Empresarial</h3>
              </div>
              <button onClick={() => setIsDebtModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDebt} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nombre del Acreedor / Banco / Proveedor</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. BBVA Crédito PyME o Proveedor Aceros S.A."
                  value={creditorName}
                  onChange={e => setCreditorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tipo de Pasivo</label>
                  <select
                    value={debtType}
                    onChange={e => setDebtType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Proveedor a Crédito">Proveedor a Crédito</option>
                    <option value="Préstamo Bancario">Préstamo Bancario</option>
                    <option value="Acreedor Diverso">Acreedor Diverso</option>
                    <option value="Obligación Fiscal (SAT/IMSS)">Obligación Fiscal (SAT/IMSS)</option>
                    <option value="Crédito Hipotecario / Arrendamiento">Crédito Hipotecario / Arrendamiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Monto Total de la Obligación ($ MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0.01"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={e => setTotalAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Concepto o Destino del Financiamiento</label>
                <input
                  type="text"
                  placeholder="Ej. Línea de crédito para capital de trabajo o compra de maquinaria"
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tasa Interés Anual (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={interestRate}
                    onChange={e => setInterestRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha Contratación</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDebtModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar en Pasivos</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Abono a Deuda */}
      {selectedDebtForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <h3 className="text-base font-bold text-white">Abono / Liquidación de Deuda</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedDebtForPayment.creditorName} · Saldo: {formatMoney(selectedDebtForPayment.remainingBalance)}</p>
              </div>
              <button onClick={() => setSelectedDebtForPayment(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Monto Total del Pago ($ MXN)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  max={selectedDebtForPayment.remainingBalance}
                  value={paymentAmount}
                  onChange={e => {
                    setPaymentAmount(e.target.value);
                    setPaymentPrincipal(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-base font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Abono a Capital ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentPrincipal}
                    onChange={e => setPaymentPrincipal(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Interés Financiero ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentInterest}
                    onChange={e => setPaymentInterest(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Pagar desde Cuenta Bancaria (Salida de Efectivo)</label>
                <select
                  value={paymentBankId}
                  onChange={e => setPaymentBankId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                >
                  {bankAccounts.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({b.accountNumber}) - Saldo disp: {formatMoney(b.currentBalance)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha del Pago</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Referencia / Folio SPEI</label>
                  <input
                    type="text"
                    placeholder="SPEI-..."
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDebtForPayment(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Aplicar Pago y Descontar de Banco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
