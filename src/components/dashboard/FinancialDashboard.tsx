import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Scale,
  CreditCard,
  Building,
  RotateCcw,
  ShoppingBag,
  Plus,
  Landmark,
  Receipt
} from 'lucide-react';

export const FinancialDashboard: React.FC = () => {
  const {
    activeClient,
    financials,
    polizas,
    invoices,
    bankAccounts,
    purchases,
    debts,
    urgentDeadlines,
    resetClientData,
    setActiveTab,
    setIsExportModalOpen
  } = useAccounting();

  const [periodFilter, setPeriodFilter] = useState<'mes' | 'trimestre' | 'anual'>('mes');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!activeClient) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl my-6">
        <Building className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">No hay ningún cliente seleccionado</h3>
        <p className="text-sm text-slate-400 mt-1">Selecciona o registra un cliente para llevar su contabilidad desde cero en ContaSoftware-2TB.</p>
      </div>
    );
  }

  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return '$0.00';
    return `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const st = financials?.estadoResultados;
  const bal = financials?.balanceGeneral;
  const kpis = financials?.kpis;
  const fiscal = financials?.fiscal;

  const handleResetToZero = async () => {
    setIsResetting(true);
    try {
      await resetClientData();
      setIsResetConfirmOpen(false);
    } catch (err) {
      console.error('Error resetting client data:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const totalEntriesCount = (currentMovements: number, polCount: number, purCount: number, invCount: number) => {
    return currentMovements + polCount + purCount + invCount;
  };

  const totalMovementsCount = bankAccounts.reduce((sum, b) => sum + b.movements.length, 0);
  const hasZeroOperations = totalMovementsCount === 0 && purchases.length === 0 && invoices.length === 0 && polizas.length === 0;

  return (
    <div className="space-y-6">
      {/* Client Overview Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-emerald-400 font-semibold">{activeClient.code}</span>
              <span aria-hidden="true">·</span>
              <span>{activeClient.personType || 'Persona Moral'}</span>
              <span aria-hidden="true">·</span>
              <span>{activeClient.taxRegime}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 font-mono font-medium">Ejercicio {activeClient.fiscalYear}</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-white mt-1">
              {activeClient.businessName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              RFC: <span className="font-mono text-slate-300 font-semibold">{activeClient.rfc}</span> · Período activo: <span className="text-white font-medium">{activeClient.currentPeriod}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Actions to record accounting from scratch */}
            <button
              onClick={() => setActiveTab('treasury')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Registrar depósitos de cliente, entradas o salidas"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>+ Depósito / Entrada</span>
            </button>

            <button
              onClick={() => setActiveTab('purchases')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Registrar compras de la empresa"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Compra</span>
            </button>

            <button
              onClick={() => setActiveTab('debts')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="Registrar deudas y pasivos"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Deuda</span>
            </button>

            {/* Reset to Zero Button */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/60 rounded-lg transition-colors flex items-center gap-1.5"
              title="Reiniciar contabilidad de este cliente a $0.00"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpiar a $0.00</span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Dictamen Word</span>
            </button>
          </div>
        </div>

        {/* Informational banner when accounting is 100% from scratch */}
        {hasZeroOperations && (
          <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-xs text-emerald-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Contabilidad Limpia en $0.00 (Desde Cero):</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                No hay dinero simulado ni cifras automáticas. Comienza registrando los <strong>depósitos del cliente</strong> en Tesorería, las <strong>compras de la empresa</strong>, <strong>deudas</strong> o <strong>pólizas contables</strong>. El sistema calculará en tiempo real los balances conforme ingreses cada movimiento.
              </p>
            </div>
          </div>
        )}

        {/* Automatic alerts ticker for impending deadlines */}
        {urgentDeadlines.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-900/30">
            <div className="flex items-center gap-2 text-amber-300 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Alerta de Vencimiento Fiscal: {urgentDeadlines[0].title} vence el {urgentDeadlines[0].dueDate}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('deadlines')}
              className="text-amber-400 hover:text-amber-300 underline font-medium shrink-0 flex items-center gap-1"
            >
              Ver calendario fiscal SAT
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* KPI Financial Metric Grid (Real figures, no fallbacks) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Ingresos Totales */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Ingresos Totales Cobrados</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {formatCurrency(st?.ingresosNetos)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-slate-300 font-mono">{invoices.filter(i => i.type === 'Emitida').length} facturas</span>
            <span>· Depósitos registrados</span>
          </div>
        </div>

        {/* Metric 2: Compras & Gastos de la Empresa */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Compras & Gastos de Empresa</span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums tracking-tight">
            {formatCurrency((st?.costoVentas || 0) + (st?.gastosOperacion || 0))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-mono text-slate-300">{purchases.length} compras</span>
            <span>registradas en libros</span>
          </div>
        </div>

        {/* Metric 3: Total Activo (Bancos, Clientes & Bienes) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Activo Total Valuado</span>
            <Scale className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
            {formatCurrency(bal?.activos.totalActivo)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Bancos: {formatCurrency(bankAccounts.reduce((s, b) => s + b.currentBalance, 0))}</span>
          </div>
        </div>

        {/* Metric 4: Utilidad o Pérdida Neta */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Resultado Neto (Ejercicio)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
            (st?.utilidadNeta || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {formatCurrency(st?.utilidadNeta)}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-slate-300">{st?.margenNetoPct?.toFixed(1) || '0.0'}%</span>
            <span>margen neto</span>
          </div>
        </div>
      </div>

      {/* Main Financial Analytics & Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Desglose de Operaciones Contables */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-white">Resumen de Operaciones Contables & Fiscales</h2>
              <p className="text-xs text-slate-400 mt-0.5">Control de entradas, salidas, compras, deudas y determinación fiscal</p>
            </div>
            <button
              onClick={() => setActiveTab('fiscal')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Ver detalle fiscal SAT
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Box 1: Tesorería y Flujo */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-400" />
                  Tesorería & Cuentas de Banco
                </span>
                <button
                  onClick={() => setActiveTab('treasury')}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Gestionar
                </button>
              </div>
              <div className="font-mono text-xl font-bold text-white tabular-nums">
                {formatCurrency(bankAccounts.reduce((s, b) => s + b.currentBalance, 0))}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>Cuentas activas: {bankAccounts.length}</span>
                <span>Movimientos: {totalMovementsCount}</span>
              </div>
            </div>

            {/* Box 2: Compras de la Empresa */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                  Compras & Proveedores
                </span>
                <button
                  onClick={() => setActiveTab('purchases')}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Ver compras
                </button>
              </div>
              <div className="font-mono text-xl font-bold text-white tabular-nums">
                {formatCurrency(purchases.reduce((s, p) => s + p.total, 0))}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>Registros: {purchases.length}</span>
                <span>IVA Acred: {formatCurrency(fiscal?.ivaAcreditable)}</span>
              </div>
            </div>

            {/* Box 3: Deudas y Pasivos */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Deudas & Pasivos Pendientes
                </span>
                <button
                  onClick={() => setActiveTab('debts')}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Ver deudas
                </button>
              </div>
              <div className="font-mono text-xl font-bold text-amber-400 tabular-nums">
                {formatCurrency(debts.reduce((s, d) => s + d.remainingBalance, 0))}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>Pasivos activos: {debts.filter(d => d.status === 'Vigente').length}</span>
                <span>Proveedores a crédito</span>
              </div>
            </div>

            {/* Box 4: Impuestos SAT */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-purple-400" />
                  Determinación Fiscal (SAT)
                </span>
                <button
                  onClick={() => setActiveTab('fiscal')}
                  className="text-[11px] text-purple-400 hover:underline"
                >
                  Auditar
                </button>
              </div>
              <div className="font-mono text-xl font-bold text-white tabular-nums">
                {formatCurrency((fiscal?.ivaACargo || 0) + (fiscal?.isrProvisionalEstimado || 0))}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>IVA: {fiscal?.ivaACargo ? `Pagar ${formatCurrency(fiscal.ivaACargo)}` : `A favor ${formatCurrency(fiscal?.ivaAFavor)}`}</span>
                <span>ISR: {formatCurrency(fiscal?.isrProvisionalEstimado)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Pólizas en Libro Diario: <strong className="text-white font-mono">{polizas.length}</strong></span>
            <span>Facturas CFDI: <strong className="text-white font-mono">{invoices.length}</strong></span>
            <span>Estatus de Balance: <strong className="text-emerald-400">{bal?.isBalanced ? 'Cuadrado 100%' : 'En Proceso'}</strong></span>
          </div>
        </div>

        {/* Right: Structure & Telemetry Balances NIF */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-semibold text-white">Ecuación Contable NIF</h2>
              <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                bal?.isBalanced ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60' : 'bg-red-950/60 text-red-400'
              }`}>
                {bal?.isBalanced ? 'Activo = Pasivo + Capital' : 'Desbalance'}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Activo Total (A)</span>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums">
                    {formatCurrency(bal?.activos.totalActivo)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Circulante: {formatCurrency(bal?.activos.totalCirculante)}</span>
                  <span>Fijo: {formatCurrency(bal?.activos.totalNoCirculante)}</span>
                </div>
              </div>

              <div className="text-center text-slate-500 font-mono text-xs">=</div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Pasivo Total (P)</span>
                  <span className="font-mono text-amber-400 font-bold tabular-nums">
                    {formatCurrency(bal?.pasivos.totalPasivo)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Corto Plazo: {formatCurrency(bal?.pasivos.totalCortoPlazo)}</span>
                  <span>Largo Plazo: {formatCurrency(bal?.pasivos.totalLargoPlazo)}</span>
                </div>
              </div>

              <div className="text-center text-slate-500 font-mono text-xs">+</div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Capital Contable (C)</span>
                  <span className="font-mono text-blue-400 font-bold tabular-nums">
                    {formatCurrency(bal?.capital.totalCapital)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Utilidad del Ejercicio:</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(st?.utilidadNeta)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('statements')}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Ver Balance General & Estado de Resultados</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Reset Client Data to Clean Zero ($0.00) */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">¿Reiniciar contabilidad a $0.00?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Esta acción pondrá en <strong>$0.00</strong> los saldos de bancos, compras, deudas, facturas y pólizas de <strong>{activeClient.businessName}</strong> para que tú como contador puedas registrar y llevar toda la contabilidad desde cero sin ningún valor simulado.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={handleResetToZero}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold"
              >
                {isResetting ? 'Reiniciando...' : 'Confirmar e Iniciar en Cero'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
