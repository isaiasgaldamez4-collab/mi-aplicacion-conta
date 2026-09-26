import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import {
  Scale,
  Receipt,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Building,
  CheckCircle2,
  DollarSign,
  PieChart,
  ArrowRight
} from 'lucide-react';

export const FiscalView: React.FC = () => {
  const {
    activeClient,
    financials,
    purchases,
    invoices,
    setActiveTab
  } = useAccounting();

  const [activeFiscalTab, setActiveFiscalTab] = useState<'iva' | 'isr' | 'deducibles'>('iva');

  if (!activeClient) return null;

  const fiscal = financials?.fiscal || {
    ivaTrasladado: 0,
    ivaAcreditable: 0,
    ivaACargo: 0,
    ivaAFavor: 0,
    retencionesIsr: 0,
    retencionesIva: 0,
    gastosDeducibles: 0,
    gastosNoDeducibles: 0,
    ingresosAcumulables: 0,
    baseGravableIsr: 0,
    isrProvisionalEstimado: 0
  };

  const formatMoney = (val: number | undefined) => {
    if (val === undefined) return '$0.00';
    return `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isResico = activeClient.taxRegime.includes('RESICO');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Auditoría & Determinación Fiscal</span>
            <span aria-hidden="true">·</span>
            <span>Régimen: {activeClient.taxRegime}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono font-medium">SAT CFF & LISR</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Gastos Fiscales & Liquidación de Impuestos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cálculo mensual de IVA, Pago Provisional de ISR y auditoría de deducibilidad para <strong>{activeClient.commercialName || activeClient.businessName}</strong>
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveFiscalTab('iva')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeFiscalTab === 'iva' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Determinación IVA
          </button>
          <button
            onClick={() => setActiveFiscalTab('isr')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeFiscalTab === 'isr' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pago Provisional ISR
          </button>
          <button
            onClick={() => setActiveFiscalTab('deducibles')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeFiscalTab === 'deducibles' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gastos Deducibles (Art. 28)
          </button>
        </div>
      </div>

      {/* Main KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>IVA Trasladado (Cobrado)</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatMoney(fiscal.ivaTrasladado)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cobrado en ingresos y facturas</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>IVA Acreditable (Pagado)</span>
            <Receipt className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
            {formatMoney(fiscal.ivaAcreditable)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Generado en compras deducibles</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>IVA a Pagar / a Favor</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
            fiscal.ivaACargo > 0 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {fiscal.ivaACargo > 0 ? `+${formatMoney(fiscal.ivaACargo)}` : `-${formatMoney(fiscal.ivaAFavor)}`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {fiscal.ivaACargo > 0 ? 'Monto a enterar en pago provisional' : 'Saldo a favor para compensar'}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>ISR Provisional Estimado</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1 tabular-nums">
            {formatMoney(fiscal.isrProvisionalEstimado)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Tasa aplicable: {isResico ? '1% a 2.5% (RESICO)' : '30% General Ley'}
          </div>
        </div>
      </div>

      {/* Tab 1: Cédula de IVA Mensual */}
      {activeFiscalTab === 'iva' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white">Determinación Mensual del Impuesto al Valor Agregado (IVA)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cálculo formal de IVA causado vs IVA acreditable conforme a la Ley del IVA (LIVA).
            </p>
          </div>

          <div className="max-w-2xl bg-slate-950/80 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="font-sans text-slate-300">Base de Actos o Actividades Gravadas (Ventas):</span>
              <span className="text-white font-bold tabular-nums">{formatMoney(fiscal.ingresosAcumulables)}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-emerald-400">
              <span className="font-sans text-slate-300">(+) IVA Trasladado Cobrado a la Tasa 16%:</span>
              <span className="font-bold tabular-nums">{formatMoney(fiscal.ivaTrasladado)}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-blue-400">
              <span className="font-sans text-slate-300">(-) IVA Acreditable Pagado en Compras y Gastos:</span>
              <span className="font-bold tabular-nums">({formatMoney(fiscal.ivaAcreditable)})</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-slate-400">
              <span className="font-sans">(-) Retenciones de IVA Sufridas:</span>
              <span className="tabular-nums">({formatMoney(fiscal.retencionesIva)})</span>
            </div>

            <div className="flex items-center justify-between py-2 pt-3 border-t-2 border-slate-700 text-sm">
              <span className="font-sans font-bold text-white">(=) RESULTADO NETO DE IVA DEL PERÍODO:</span>
              <span className={`font-bold tabular-nums ${fiscal.ivaACargo > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {fiscal.ivaACargo > 0 ? `${formatMoney(fiscal.ivaACargo)} (A CARGO / PAGAR)` : `${formatMoney(fiscal.ivaAFavor)} (A FAVOR)`}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/50 rounded-lg border border-slate-800/60 text-xs text-slate-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-300 font-semibold">Fundamento Legal SAT (LIVA Art. 1, 4 y 5):</p>
              <p className="mt-0.5">
                El impuesto se calculará por cada mes de calendario. El contribuyente efectuará el pago mediante declaración que presentará ante las oficinas autorizadas a más tardar el día 17 del mes siguiente al que corresponda el pago.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pago Provisional ISR */}
      {activeFiscalTab === 'isr' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-semibold text-white">Determinación del Pago Provisional de ISR</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cálculo sobre base gravable real derivada de las operaciones contables registradas.
            </p>
          </div>

          <div className="max-w-2xl bg-slate-950/80 border border-slate-800 rounded-xl p-5 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
              <span className="font-sans text-slate-300">Total Ingresos Nominales Acumulables:</span>
              <span className="text-white font-bold tabular-nums">{formatMoney(fiscal.ingresosAcumulables)}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-slate-400">
              <span className="font-sans text-slate-300">(-) Deducciones Autorizadas (Compras y Gastos Deducibles):</span>
              <span className="tabular-nums">({formatMoney(fiscal.gastosDeducibles)})</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-blue-400">
              <span className="font-sans text-slate-300">(=) Base Gravable para Pago Provisional:</span>
              <span className="font-bold tabular-nums">{formatMoney(fiscal.baseGravableIsr)}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-slate-400">
              <span className="font-sans">Tasa de Impuesto Aplicable:</span>
              <span>{isResico ? '2.0% (RESICO)' : '30.0% (Título II LISR)'}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/80 text-slate-400">
              <span className="font-sans">(-) Retenciones de ISR Efectuadas por Clientes:</span>
              <span className="tabular-nums">({formatMoney(fiscal.retencionesIsr)})</span>
            </div>

            <div className="flex items-center justify-between py-2 pt-3 border-t-2 border-slate-700 text-sm">
              <span className="font-sans font-bold text-white">(=) ISR PROVISIONAL A CARGO A ENTERAR:</span>
              <span className="font-bold text-purple-400 tabular-nums">
                {formatMoney(fiscal.isrProvisionalEstimado)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Gastos Deducibles vs No Deducibles */}
      {activeFiscalTab === 'deducibles' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-white">Auditoría Fiscal de Deducibilidad (LISR Art. 27 y 28)</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Clasificación de compras y erogaciones de la empresa para evitar contingencias fiscales.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('purchases')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 self-start sm:self-auto"
            >
              Registrar nuevo gasto
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Gastos Deducibles al 100%
                </span>
                <span className="font-mono text-base">{formatMoney(fiscal.gastosDeducibles)}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Amparados con CFDI con folio fiscal, método de pago electrónico (SPEI, tarjeta, cheque nominativo) y estrictamente indispensables para la actividad preponderante.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-red-900/40 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs text-red-400 font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Gastos No Deducibles (Art. 28 LISR)
                </span>
                <span className="font-mono text-base">{formatMoney(fiscal.gastosNoDeducibles)}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Erogaciones en efectivo superiores a $2,000, multas, recargos fiscales, consumos en restaurantes sin justificación de negocios o compras sin comprobante fiscal vigente.
              </p>
            </div>
          </div>

          {/* Table of categorized purchases */}
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-slate-300 mb-2">Detalle de Erogaciones Registradas por el Contador</h3>
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Proveedor</th>
                    <th className="py-2.5 px-4 font-medium">Concepto / Categoría</th>
                    <th className="py-2.5 px-4 font-medium text-right">Subtotal</th>
                    <th className="py-2.5 px-4 font-medium text-right">IVA Acreditable</th>
                    <th className="py-2.5 px-4 font-medium text-center">Clasificación Fiscal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono">
                  {purchases.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-4 font-sans font-medium text-white">{p.providerName}</td>
                      <td className="py-2.5 px-4 font-sans text-slate-400">{p.category}</td>
                      <td className="py-2.5 px-4 text-right text-slate-200 tabular-nums">{formatMoney(p.subtotal)}</td>
                      <td className="py-2.5 px-4 text-right text-blue-400 tabular-nums">{formatMoney(p.ivaAmount)}</td>
                      <td className="py-2.5 px-4 text-center font-sans">
                        <span className={`text-[10px] px-2 py-0.5 rounded ${
                          p.deductibility === '100% Deducible'
                            ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/50'
                            : 'text-red-400 bg-red-950/40 border border-red-800/50'
                        }`}>
                          {p.deductibility}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {purchases.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-sans">
                        No hay gastos ni compras registradas para auditar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
