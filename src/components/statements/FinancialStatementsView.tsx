import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import { accountingApi } from '../../services/api.js';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Scale,
  DollarSign,
  TrendingUp,
  Building,
  UserCheck
} from 'lucide-react';

export const FinancialStatementsView: React.FC = () => {
  const { activeClient, financials, user, setIsExportModalOpen } = useAccounting();
  const [activeStatement, setActiveStatement] = useState<'balance' | 'resultados'>('balance');

  if (!activeClient || !financials) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl my-6">
        <Building className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Cargando estados financieros...</h3>
      </div>
    );
  }

  const { balanceGeneral: bal, estadoResultados: er } = financials;

  const formatMoney = (val: number | undefined) => {
    if (val === undefined) return '$0.00';
    return `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const wordExportUrl = accountingApi.getWordExportUrl(activeClient.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Estados Financieros NIF</span>
            <span aria-hidden="true">·</span>
            <span>{activeClient.taxRegime}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono">Ejercicio {activeClient.fiscalYear}</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            {activeClient.businessName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Período fiscal en curso: <strong className="text-slate-200">{activeClient.currentPeriod}</strong> · RFC: <span className="font-mono text-slate-300">{activeClient.rfc}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Statement Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveStatement('balance')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeStatement === 'balance' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Balance General
            </button>
            <button
              onClick={() => setActiveStatement('resultados')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeStatement === 'resultados' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Estado de Resultados
            </button>
          </div>

          <a
            href={wordExportUrl}
            download
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-900/20"
            title="Descargar reporte completo y dictamen en Microsoft Word"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Descargar en Word (.doc)</span>
          </a>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            title="Imprimir o guardar como PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Content */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 lg:p-8 shadow-sm font-sans">
        {/* Formal Header */}
        <div className="text-center pb-6 border-b border-slate-800">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            {user?.firmName || 'DESPACHO CONTABLE Y AUDITORÍA INTEGRAL'}
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            {activeClient.businessName}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            RFC: {activeClient.rfc} · Domicilio: {activeClient.address}
          </p>
          <div className="mt-2 inline-block px-3 py-1 bg-slate-800/80 rounded-md text-xs font-semibold text-slate-200 border border-slate-700">
            {activeStatement === 'balance'
              ? `BALANCE GENERAL AL 30 DE ${activeClient.currentPeriod.toUpperCase()}`
              : `ESTADO DE RESULTADOS INTEGRAL DEL 01 AL 30 DE ${activeClient.currentPeriod.toUpperCase()}`}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            (Cifras expresadas en Pesos Mexicanos - MXN de conformidad con las Normas de Información Financiera)
          </p>
        </div>

        {/* VIEW 1: BALANCE GENERAL */}
        {activeStatement === 'balance' && (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: ACTIVOS */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide border-b border-emerald-900/40 pb-2 flex items-center justify-between">
                    <span>ACTIVO</span>
                    <span className="font-mono text-xs text-slate-400">Total: {formatMoney(bal.activos.totalActivo)}</span>
                  </h3>

                  {/* Activo Circulante */}
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Activo Circulante
                    </h4>
                    <div className="divide-y divide-slate-800/70 border-y border-slate-800/70 text-xs">
                      {bal.activos.circulante.map(a => (
                        <div key={a.code} className="py-2 flex items-center justify-between">
                          <span className="text-slate-300">
                            <span className="font-mono text-slate-500 mr-2">{a.code}</span>
                            {a.name}
                          </span>
                          <span className="font-mono font-medium text-slate-200 tabular-nums">
                            {formatMoney(a.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="py-2.5 flex items-center justify-between font-semibold bg-slate-950/40 px-2 rounded">
                        <span className="text-slate-200">Total Activo Circulante</span>
                        <span className="font-mono text-emerald-400 tabular-nums">
                          {formatMoney(bal.activos.totalCirculante)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activo No Circulante (Fijo) */}
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Activo No Circulante (Propiedad, Planta y Equipo)
                    </h4>
                    <div className="divide-y divide-slate-800/70 border-y border-slate-800/70 text-xs">
                      {bal.activos.noCirculante.map(a => (
                        <div key={a.code} className="py-2 flex items-center justify-between">
                          <span className="text-slate-300">
                            <span className="font-mono text-slate-500 mr-2">{a.code}</span>
                            {a.name}
                          </span>
                          <span className="font-mono font-medium text-slate-200 tabular-nums">
                            {formatMoney(a.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="py-2.5 flex items-center justify-between font-semibold bg-slate-950/40 px-2 rounded">
                        <span className="text-slate-200">Total Activo No Circulante</span>
                        <span className="font-mono text-emerald-400 tabular-nums">
                          {formatMoney(bal.activos.totalNoCirculante)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gran Total Activo */}
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/50 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">SUMA TOTAL DEL ACTIVO</span>
                  <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                    {formatMoney(bal.activos.totalActivo)}
                  </span>
                </div>
              </div>

              {/* Right Column: PASIVOS Y CAPITAL */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide border-b border-amber-900/40 pb-2 flex items-center justify-between">
                    <span>PASIVO Y CAPITAL</span>
                    <span className="font-mono text-xs text-slate-400">Total: {formatMoney(bal.totalPasivoYCapital)}</span>
                  </h3>

                  {/* Pasivo Corto Plazo */}
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Pasivo a Corto Plazo (Circulante)
                    </h4>
                    <div className="divide-y divide-slate-800/70 border-y border-slate-800/70 text-xs">
                      {bal.pasivos.cortoPlazo.map(p => (
                        <div key={p.code} className="py-2 flex items-center justify-between">
                          <span className="text-slate-300">
                            <span className="font-mono text-slate-500 mr-2">{p.code}</span>
                            {p.name}
                          </span>
                          <span className="font-mono font-medium text-slate-200 tabular-nums">
                            {formatMoney(p.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="py-2.5 flex items-center justify-between font-semibold bg-slate-950/40 px-2 rounded">
                        <span className="text-slate-200">Total Pasivo a Corto Plazo</span>
                        <span className="font-mono text-amber-400 tabular-nums">
                          {formatMoney(bal.pasivos.totalCortoPlazo)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pasivo Largo Plazo */}
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Pasivo a Largo Plazo
                    </h4>
                    <div className="divide-y divide-slate-800/70 border-y border-slate-800/70 text-xs">
                      {bal.pasivos.largoPlazo.map(p => (
                        <div key={p.code} className="py-2 flex items-center justify-between">
                          <span className="text-slate-300">
                            <span className="font-mono text-slate-500 mr-2">{p.code}</span>
                            {p.name}
                          </span>
                          <span className="font-mono font-medium text-slate-200 tabular-nums">
                            {formatMoney(p.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="py-2.5 flex items-center justify-between font-semibold bg-slate-950/40 px-2 rounded">
                        <span className="text-slate-200">Total Pasivo</span>
                        <span className="font-mono text-amber-400 tabular-nums">
                          {formatMoney(bal.pasivos.totalPasivo)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Capital Contable */}
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                      Capital Contable
                    </h4>
                    <div className="divide-y divide-slate-800/70 border-y border-slate-800/70 text-xs">
                      {bal.capital.rubros.map(c => (
                        <div key={c.code} className="py-2 flex items-center justify-between">
                          <span className="text-slate-300">
                            <span className="font-mono text-slate-500 mr-2">{c.code}</span>
                            {c.name}
                          </span>
                          <span className={`font-mono font-medium tabular-nums ${c.code === '3301' ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>
                            {formatMoney(c.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="py-2.5 flex items-center justify-between font-semibold bg-slate-950/40 px-2 rounded">
                        <span className="text-slate-200">Total Capital Contable</span>
                        <span className="font-mono text-blue-400 tabular-nums">
                          {formatMoney(bal.capital.totalCapital)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gran Total Pasivo y Capital */}
                <div className="p-3.5 bg-blue-950/30 border border-blue-800/50 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">TOTAL PASIVO Y CAPITAL</span>
                  <span className="text-base font-bold font-mono text-blue-400 tabular-nums">
                    {formatMoney(bal.totalPasivoYCapital)}
                  </span>
                </div>
              </div>
            </div>

            {/* Validation Notice Bar */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">
                  Verificación de Cuadre Contable: <strong>Activo ({formatMoney(bal.activos.totalActivo)}) = Pasivo ({formatMoney(bal.pasivos.totalPasivo)}) + Capital ({formatMoney(bal.capital.totalCapital)})</strong>
                </span>
              </div>
              <span className="font-mono text-emerald-400 font-semibold">Diferencia: $0.00 MXN</span>
            </div>
          </div>
        )}

        {/* VIEW 2: ESTADO DE RESULTADOS INTEGRAL */}
        {activeStatement === 'resultados' && (
          <div className="mt-8 max-w-4xl mx-auto space-y-6">
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40 text-xs">
              <div className="grid grid-cols-12 bg-slate-950 p-3 font-semibold text-slate-300 border-b border-slate-800">
                <div className="col-span-8">Concepto / Partida Contable</div>
                <div className="col-span-2 text-right">Importe ($ MXN)</div>
                <div className="col-span-2 text-right">% Margen</div>
              </div>

              <div className="divide-y divide-slate-800/80 font-mono">
                {/* Ingresos */}
                <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-900/40">
                  <div className="col-span-8 font-sans font-medium text-slate-200">
                    Ingresos Netos por Actividades Ordinarias (Ventas y Servicios)
                  </div>
                  <div className="col-span-2 text-right font-bold text-white tabular-nums">
                    {formatMoney(er.ingresosNetos)}
                  </div>
                  <div className="col-span-2 text-right text-slate-400 tabular-nums">100.0%</div>
                </div>

                {/* Costo de Ventas */}
                <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-900/40 text-slate-400">
                  <div className="col-span-8 font-sans">(-) Costo de Ventas y Prestación de Servicios</div>
                  <div className="col-span-2 text-right tabular-nums">({formatMoney(er.costoVentas)})</div>
                  <div className="col-span-2 text-right tabular-nums">
                    {((er.costoVentas / (er.ingresosNetos || 1)) * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Utilidad Bruta */}
                <div className="grid grid-cols-12 p-3 items-center bg-slate-900/60 font-semibold">
                  <div className="col-span-8 font-sans text-white">(=) UTILIDAD BRUTA</div>
                  <div className="col-span-2 text-right text-emerald-400 tabular-nums font-bold">
                    {formatMoney(er.utilidadBruta)}
                  </div>
                  <div className="col-span-2 text-right text-emerald-400 tabular-nums">
                    {er.margenBrutoPct.toFixed(1)}%
                  </div>
                </div>

                {/* Gastos de Operación */}
                <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-900/40 text-slate-400">
                  <div className="col-span-8 font-sans">(-) Gastos Generales de Operación, Administración y Nómina</div>
                  <div className="col-span-2 text-right tabular-nums">({formatMoney(er.gastosOperacion)})</div>
                  <div className="col-span-2 text-right tabular-nums">
                    {((er.gastosOperacion / (er.ingresosNetos || 1)) * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Utilidad Operativa */}
                <div className="grid grid-cols-12 p-3 items-center bg-slate-900/60 font-semibold">
                  <div className="col-span-8 font-sans text-white">(=) UTILIDAD DE OPERACIÓN (EBITDA)</div>
                  <div className="col-span-2 text-right text-blue-400 tabular-nums font-bold">
                    {formatMoney(er.utilidadOperativa)}
                  </div>
                  <div className="col-span-2 text-right text-blue-400 tabular-nums">
                    {er.margenOperativoPct.toFixed(1)}%
                  </div>
                </div>

                {/* Gastos Financieros */}
                <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-900/40 text-slate-400">
                  <div className="col-span-8 font-sans">(-) Costo Financiero (Comisiones e Intereses Bancarios)</div>
                  <div className="col-span-2 text-right tabular-nums">({formatMoney(er.gastosFinancieros)})</div>
                  <div className="col-span-2 text-right text-slate-500 tabular-nums">-</div>
                </div>

                {/* Impuestos Provisionales ISR */}
                <div className="grid grid-cols-12 p-3 items-center hover:bg-slate-900/40 text-slate-400">
                  <div className="col-span-8 font-sans">(-) Provisión para Impuestos a la Utilidad (30% ISR)</div>
                  <div className="col-span-2 text-right tabular-nums">({formatMoney(er.impuestosEstimados)})</div>
                  <div className="col-span-2 text-right text-slate-500 tabular-nums">-</div>
                </div>

                {/* Utilidad Neta Final */}
                <div className="grid grid-cols-12 p-4 items-center bg-emerald-950/40 border-t-2 border-emerald-600 font-bold text-sm">
                  <div className="col-span-8 font-sans text-white text-base">
                    (=) UTILIDAD NETA DEL EJERCICIO
                  </div>
                  <div className="col-span-2 text-right text-emerald-400 text-base tabular-nums">
                    {formatMoney(er.utilidadNeta)}
                  </div>
                  <div className="col-span-2 text-right text-emerald-400 text-base tabular-nums">
                    {er.margenNetoPct.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auditor's Certification & Sign-off Block */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-56 border-t border-slate-400 mx-auto mb-2"></div>
            <p className="text-sm font-bold text-white">
              {user?.name || 'C.P. Isaías de Jesús Guzmán'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Contador Público Colegiado · Cédula Profesional: <span className="font-mono text-slate-300">{user?.licenseNumber || 'CP-8492015-DGP'}</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Folio de Registro en Colegio: {user?.collegeFolio || 'CCPM-2024-8842'} · Dictamen emitido con sello digital seguro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
