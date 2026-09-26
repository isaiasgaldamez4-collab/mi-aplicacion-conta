import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import { BankMovement } from '../../types/accounting.js';
import {
  CreditCard,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Building,
  Landmark,
  X,
  Filter
} from 'lucide-react';

export const BankingView: React.FC = () => {
  const {
    activeClient,
    bankAccounts,
    createBankAccount,
    addBankMovement,
    toggleReconciliation
  } = useAccounting();

  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    bankAccounts[0]?.id || ''
  );
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementFilter, setMovementFilter] = useState<'todos' | 'deposito' | 'retiro'>('todos');

  // New Account form state
  const [newBankName, setNewBankName] = useState('BBVA Bancomer');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newClabe, setNewClabe] = useState('');
  const [newInitialBalance, setNewInitialBalance] = useState('0');

  // New Movement form state (Entradas, Salidas & Depósitos)
  const [movDate, setMovDate] = useState(new Date().toISOString().split('T')[0]);
  const [movDesc, setMovDesc] = useState('');
  const [movRef, setMovRef] = useState('');
  const [movType, setMovType] = useState<'deposito' | 'retiro'>('deposito');
  const [movCategory, setMovCategory] = useState<BankMovement['movementCategory']>('Depósito del Cliente');
  const [counterparty, setCounterparty] = useState('');
  const [movAmount, setMovAmount] = useState('');

  if (!activeClient) return null;

  const currentAccount = bankAccounts.find(b => b.id === selectedAccountId) || bankAccounts[0];

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName || !newAccountNumber) return;
    await createBankAccount({
      bankName: newBankName,
      accountNumber: newAccountNumber,
      clabe: newClabe,
      currency: 'MXN',
      initialBalance: parseFloat(newInitialBalance) || 0
    });
    setIsAccountModalOpen(false);
    setNewAccountNumber('');
    setNewClabe('');
    setNewInitialBalance('0');
  };

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount || !movAmount || !movDesc) return;

    await addBankMovement(currentAccount.id, {
      date: movDate,
      description: movDesc,
      reference: movRef || `SPEI-${Math.floor(10000 + Math.random() * 90000)}`,
      type: movType,
      movementCategory: movCategory,
      counterparty,
      amount: parseFloat(movAmount)
    });

    setIsMovementModalOpen(false);
    setMovDesc('');
    setMovRef('');
    setCounterparty('');
    setMovAmount('');
  };

  const formatMoney = (val: number | undefined) => {
    if (val === undefined) return '$0.00';
    return `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalCashInBanks = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);

  const displayedMovements = (currentAccount?.movements || []).filter(m => {
    if (movementFilter === 'todos') return true;
    return m.type === movementFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Tesorería & Cuentas Bancarias</span>
            <span aria-hidden="true">·</span>
            <span>Entradas, Salidas & Depósitos</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono font-medium">Saldo Total: {formatMoney(totalCashInBanks)}</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Tesorería, Entradas, Salidas & Depósitos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro manual de depósitos del cliente, cobros, transferencias y salidas bancarias para <strong>{activeClient.commercialName || activeClient.businessName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Landmark className="w-3.5 h-3.5 text-blue-400" />
            <span>Nueva Cuenta Bancaria</span>
          </button>

          <button
            onClick={() => {
              setMovType('deposito');
              setMovCategory('Depósito del Cliente');
              setIsMovementModalOpen(true);
            }}
            disabled={!currentAccount}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-emerald-950"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bankAccounts.map(b => {
          const isSelected = (currentAccount?.id === b.id);
          return (
            <div
              key={b.id}
              onClick={() => setSelectedAccountId(b.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  {b.bankName}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{b.accountNumber}</span>
              </div>
              <div className="text-xl font-bold font-mono text-white tabular-nums tracking-tight">
                {formatMoney(b.currentBalance)}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono truncate max-w-[170px]">CLABE: {b.clabe || 'No configurada'}</span>
                <span className="text-emerald-400 font-medium">Libros NIF</span>
              </div>
            </div>
          );
        })}
        {bankAccounts.length === 0 && (
          <div className="col-span-3 p-6 text-center bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No hay cuentas bancarias creadas. Usa el botón "Nueva Cuenta Bancaria" para agregar una cuenta con saldo inicial de $0.00.
          </div>
        )}
      </div>

      {/* Movements Table */}
      {currentAccount && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Movimientos: {currentAccount.bankName} ({currentAccount.accountNumber})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Coteja cada entrada o salida con el extracto bancario para mantener conciliación contable.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filtrar:</span>
              <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-xs">
                <button
                  onClick={() => setMovementFilter('todos')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    movementFilter === 'todos' ? 'bg-slate-800 text-white' : 'text-slate-400'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setMovementFilter('deposito')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    movementFilter === 'deposito' ? 'bg-emerald-950 text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  Depósitos (+)
                </button>
                <button
                  onClick={() => setMovementFilter('retiro')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    movementFilter === 'retiro' ? 'bg-amber-950 text-amber-300' : 'text-slate-400'
                  }`}
                >
                  Salidas (-)
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium">Fecha</th>
                  <th className="py-2.5 px-4 font-medium">Tipo / Categoría</th>
                  <th className="py-2.5 px-4 font-medium">Descripción & Contraparte</th>
                  <th className="py-2.5 px-4 font-medium">Referencia</th>
                  <th className="py-2.5 px-4 font-medium text-right">Monto</th>
                  <th className="py-2.5 px-4 font-medium text-right">Saldo Posterior</th>
                  <th className="py-2.5 px-4 font-medium text-center">Conciliación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono">
                {displayedMovements.map(m => (
                  <tr key={m.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 text-slate-300">{m.date}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        m.type === 'deposito'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                      }`}>
                        {m.movementCategory || (m.type === 'deposito' ? 'Depósito' : 'Salida')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-200">
                      <div className="font-medium text-white flex items-center gap-1.5">
                        {m.type === 'deposito' ? (
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span>{m.description}</span>
                      </div>
                      {m.counterparty && (
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Contraparte: {m.counterparty}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{m.reference}</td>
                    <td className={`py-3 px-4 text-right font-bold tabular-nums ${
                      m.type === 'deposito' ? 'text-emerald-400' : 'text-slate-200'
                    }`}>
                      {m.type === 'deposito' ? `+${formatMoney(m.amount)}` : `-${formatMoney(m.amount)}`}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                      {formatMoney(m.balanceAfter)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleReconciliation(currentAccount.id, m.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-medium transition-colors ${
                          m.reconciled
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
                        }`}
                        title="Haz clic para conciliar / desconciliar"
                      >
                        {m.reconciled ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Conciliado</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Pendiente</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {displayedMovements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                      No hay movimientos registrados en esta cuenta. Registra depósitos o salidas con el botón superior.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Registrar Movimiento / Depósito / Salida */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-base font-bold text-white">Registro de Tesorería</h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMovement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Tipo de Operación</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMovType('deposito');
                      setMovCategory('Depósito del Cliente');
                    }}
                    className={`py-2 rounded-lg font-medium border text-center transition-colors ${
                      movType === 'deposito'
                        ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Depósito / Entrada (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMovType('retiro');
                      setMovCategory('Salida / Pago a Proveedor');
                    }}
                    className={`py-2 rounded-lg font-medium border text-center transition-colors ${
                      movType === 'retiro'
                        ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Salida / Retiro (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Categoría del Movimiento</label>
                <select
                  value={movCategory}
                  onChange={e => setMovCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                >
                  {movType === 'deposito' ? (
                    <>
                      <option value="Depósito del Cliente">Depósito del Cliente (Efectivo / Transferencia)</option>
                      <option value="Entrada de Dinero / Venta">Entrada de Dinero / Cobro de Factura</option>
                      <option value="Aportación de Capital">Aportación de Capital de Socios</option>
                      <option value="Otro">Otro Ingreso / Rendimiento</option>
                    </>
                  ) : (
                    <>
                      <option value="Salida / Pago a Proveedor">Salida / Pago a Proveedor</option>
                      <option value="Pago de Deuda / Préstamo">Pago de Deuda / Préstamo</option>
                      <option value="Gasto Fiscal / Operativo">Gasto Operativo o Fiscal</option>
                      <option value="Nómina y Sueldos">Pago de Nómina y Sueldos</option>
                      <option value="Pago de Impuestos SAT">Pago de Impuestos SAT</option>
                      <option value="Retiro de Socio">Retiro de Socio / Dividendos</option>
                      <option value="Otro">Otro Egreso</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Monto ($ MXN)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  placeholder="0.00"
                  value={movAmount}
                  onChange={e => setMovAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-base font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Concepto o Descripción</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Depósito en cuenta fiscal por cobranza..."
                  value={movDesc}
                  onChange={e => setMovDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Contraparte (Nombre de Cliente, Proveedor o Emisor)</label>
                <input
                  type="text"
                  placeholder="Ej. Cliente Corporativo o Proveedor..."
                  value={counterparty}
                  onChange={e => setCounterparty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={movDate}
                    onChange={e => setMovDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Referencia / Folio</label>
                  <input
                    type="text"
                    placeholder="SPEI-..."
                    value={movRef}
                    onChange={e => setMovRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Registrar en Tesorería y Contabilizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nueva Cuenta Bancaria */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-base font-bold text-white">Añadir Cuenta Bancaria</h3>
              <button onClick={() => setIsAccountModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Institución Bancaria</label>
                <select
                  value={newBankName}
                  onChange={e => setNewBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="BBVA Bancomer">BBVA Bancomer</option>
                  <option value="Banorte Empresarial">Banorte Empresarial</option>
                  <option value="Santander Corporativo">Santander Corporativo</option>
                  <option value="Citibanamex">Citibanamex</option>
                  <option value="HSBC México">HSBC México</option>
                  <option value="Scotiabank">Scotiabank</option>
                  <option value="Caja en Efectivo">Caja Chica / Efectivo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Número de Cuenta o Tarjeta</label>
                <input
                  type="text"
                  required
                  placeholder="•••• 4920"
                  value={newAccountNumber}
                  onChange={e => setNewAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">CLABE Interbancaria (18 dígitos)</label>
                <input
                  type="text"
                  placeholder="012180004920881923"
                  value={newClabe}
                  onChange={e => setNewClabe(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Saldo Inicial de Apertura ($ MXN)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00 (Por defecto 0.00 para empezar desde cero)"
                  value={newInitialBalance}
                  onChange={e => setNewInitialBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Déjalo en 0.00 para llevar la contabilidad completamente en limpio desde cero.</span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Registrar Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
