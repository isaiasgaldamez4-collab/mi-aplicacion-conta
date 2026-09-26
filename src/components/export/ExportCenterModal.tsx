import React from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import { accountingApi } from '../../services/api.js';
import {
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  Database,
  CheckCircle2,
  X
} from 'lucide-react';

export const ExportCenterModal: React.FC = () => {
  const { activeClient, isExportModalOpen, setIsExportModalOpen, polizas, bankAccounts, invoices, deadlines } = useAccounting();

  if (!isExportModalOpen || !activeClient) return null;

  const wordUrl = accountingApi.getWordExportUrl(activeClient.id);
  const excelUrl = accountingApi.getExcelExportUrl(activeClient.id);

  const handlePrint = () => {
    setIsExportModalOpen(false);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleJsonBackup = () => {
    const backup = {
      client: activeClient,
      exportDate: new Date().toISOString(),
      polizas,
      bankAccounts,
      invoices,
      deadlines
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ContaSoftware2TB_Backup_${activeClient.rfc}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Centro de Exportación Rápida de Reportes</h3>
          </div>
          <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-400">
            Exporta dictámenes ejecutivos, libros contables y papeles de trabajo para{' '}
            <strong className="text-slate-200">{activeClient.businessName}</strong> ({activeClient.currentPeriod}).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* 1. Word Report */}
            <a
              href={wordUrl}
              download
              className="p-4 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-600/60 rounded-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-6 h-6 text-blue-400 group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/60">
                    .DOC WORD
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  Dictamen Contable Word
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Estados Financieros (Balance y Resultados) con opinión formal de auditoría y sello digital.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-blue-400 font-semibold text-[11px]">
                <Download className="w-3.5 h-3.5" />
                <span>Descargar para Microsoft Word</span>
              </div>
            </a>

            {/* 2. Excel Spreadsheet */}
            <a
              href={excelUrl}
              download
              className="p-4 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-600/60 rounded-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-400 group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                    .CSV EXCEL
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Libro Diario & Pólizas
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Asientos contables, cuentas auxiliares, cargos y abonos compatibles con Microsoft Excel.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <Download className="w-3.5 h-3.5" />
                <span>Descargar para Excel</span>
              </div>
            </a>

            {/* 3. Direct Print / PDF */}
            <button
              onClick={handlePrint}
              className="p-4 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-600/60 rounded-xl transition-all flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Printer className="w-6 h-6 text-purple-400 group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-950/60 px-2 py-0.5 rounded border border-purple-900/60">
                    IMPRIMIR / PDF
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Impresión Directa a PDF
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Formato de presentación formal en hojas membretadas para actas de asamblea.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-purple-400 font-semibold text-[11px]">
                <Printer className="w-3.5 h-3.5" />
                <span>Abrir Diálogo de Impresión</span>
              </div>
            </button>

            {/* 4. JSON Full Backup */}
            <button
              onClick={handleJsonBackup}
              className="p-4 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-600 rounded-xl transition-all flex flex-col justify-between text-left group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Database className="w-6 h-6 text-slate-300 group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    .JSON DATA
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors">
                  Respaldo Completo de Datos
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Exportación integral del ejercicio fiscal (clientes, pólizas, facturas y saldos).
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
                <Download className="w-3.5 h-3.5" />
                <span>Guardar Copia de Respaldo</span>
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Seguridad: Documentos firmados criptográficamente</span>
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-sans font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
