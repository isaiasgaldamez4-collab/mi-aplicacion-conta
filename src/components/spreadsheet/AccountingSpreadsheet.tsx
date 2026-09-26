import React, { useState, useEffect, useCallback } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import { SpreadsheetCell } from '../../types/accounting.js';
import {
  FileSpreadsheet,
  Download,
  Save,
  Bold,
  DollarSign,
  Percent,
  Check,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROW_COUNT = 20;

// Evaluation engine for Excel formulas
function evaluateFormula(formula: string, cells: Record<string, SpreadsheetCell>): string {
  if (!formula.startsWith('=')) return formula;

  const expr = formula.substring(1).trim().toUpperCase();

  // SUM function: =SUM(A1:A5) or =SUM(B4:B8)
  const sumMatch = expr.match(/^SUM\(([A-H]\d+):([A-H]\d+)\)$/);
  if (sumMatch) {
    const start = sumMatch[1];
    const end = sumMatch[2];
    const startCol = start[0];
    const startRow = parseInt(start.substring(1), 10);
    const endCol = end[0];
    const endRow = parseInt(end.substring(1), 10);

    let sum = 0;
    const colStartIdx = COLS.indexOf(startCol);
    const colEndIdx = COLS.indexOf(endCol);

    for (let c = colStartIdx; c <= colEndIdx; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const key = `${COLS[c]}${r}`;
        const val = cells[key]?.value;
        const num = parseFloat(val || '0');
        if (!isNaN(num)) sum += num;
      }
    }
    return sum.toString();
  }

  // AVERAGE function
  const avgMatch = expr.match(/^AVERAGE\(([A-H]\d+):([A-H]\d+)\)$/);
  if (avgMatch) {
    const start = avgMatch[1];
    const end = avgMatch[2];
    const startCol = start[0];
    const startRow = parseInt(start.substring(1), 10);
    const endCol = end[0];
    const endRow = parseInt(end.substring(1), 10);

    let sum = 0;
    let count = 0;
    const colStartIdx = COLS.indexOf(startCol);
    const colEndIdx = COLS.indexOf(endCol);

    for (let c = colStartIdx; c <= colEndIdx; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const key = `${COLS[c]}${r}`;
        const val = cells[key]?.value;
        const num = parseFloat(val || '0');
        if (!isNaN(num)) {
          sum += num;
          count++;
        }
      }
    }
    return count > 0 ? (sum / count).toFixed(2) : '0';
  }

  // Simple arithmetic evaluation e.g. =B4*0.16 or =B4-B5
  try {
    const resolvedExpr = expr.replace(/([A-H]\d+)/g, match => {
      const cellVal = cells[match]?.value || '0';
      const num = parseFloat(cellVal);
      return isNaN(num) ? '0' : num.toString();
    });

    // Safe math eval with only numbers and operators
    if (/^[0-9+\-*/. ()]+$/.test(resolvedExpr)) {
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${resolvedExpr})`)();
      return typeof result === 'number' ? result.toFixed(2) : String(result);
    }
  } catch (err) {
    return '#ERROR';
  }

  return '#VALOR!';
}

export const AccountingSpreadsheet: React.FC = () => {
  const { activeClient, spreadsheet, saveSpreadsheet } = useAccounting();

  const [cells, setCells] = useState<Record<string, SpreadsheetCell>>({});
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [formulaInput, setFormulaInput] = useState<string>('');
  const [sheetTitle, setSheetTitle] = useState<string>('Papel de Trabajo Contable');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync with client's saved spreadsheet
  useEffect(() => {
    if (spreadsheet) {
      setCells(spreadsheet.cells || {});
      setSheetTitle(spreadsheet.title || 'Papel de Trabajo');
    }
  }, [spreadsheet]);

  // Update formula bar when cell selection changes
  useEffect(() => {
    const cell = cells[selectedCell];
    setFormulaInput(cell?.formula || cell?.value || '');
  }, [selectedCell, cells]);

  const handleCellClick = (key: string) => {
    setSelectedCell(key);
  };

  const updateCell = useCallback((key: string, rawInput: string) => {
    const isFormula = rawInput.startsWith('=');
    const newCells = { ...cells };

    if (isFormula) {
      const computed = evaluateFormula(rawInput, cells);
      newCells[key] = {
        ...newCells[key],
        formula: rawInput,
        value: computed
      };
    } else {
      newCells[key] = {
        ...newCells[key],
        formula: undefined,
        value: rawInput
      };
    }

    // Recompute dependent cells
    Object.keys(newCells).forEach(k => {
      if (newCells[k].formula) {
        newCells[k].value = evaluateFormula(newCells[k].formula!, newCells);
      }
    });

    setCells(newCells);
  }, [cells]);

  const handleFormulaInputChange = (val: string) => {
    setFormulaInput(val);
    updateCell(selectedCell, val);
  };

  const handleFormatToggle = (format: 'currency' | 'percent' | 'number') => {
    const current = cells[selectedCell] || { value: '' };
    const newFormat = current.format === format ? undefined : format;
    setCells({
      ...cells,
      [selectedCell]: { ...current, format: newFormat }
    });
  };

  const handleBoldToggle = () => {
    const current = cells[selectedCell] || { value: '' };
    setCells({
      ...cells,
      [selectedCell]: { ...current, bold: !current.bold }
    });
  };

  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    try {
      await saveSpreadsheet({
        title: sheetTitle,
        cells
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  // Load Templates
  const loadTemplate = (type: 'conciliacion' | 'depreciacion' | 'flujo') => {
    if (type === 'conciliacion') {
      const tCells: Record<string, SpreadsheetCell> = {
        'A1': { value: 'CONCILIACIÓN CONTABLE-FISCAL PROVISIONAL', bold: true },
        'A3': { value: 'Concepto / Rubro', bold: true },
        'B3': { value: 'Contable ($)', bold: true },
        'C3': { value: 'Tasa/Factor', bold: true },
        'D3': { value: 'Base Gravable', bold: true },
        'E3': { value: 'Auditoría', bold: true },

        'A4': { value: 'Ingresos Facturados' },
        'B4': { value: '823600', format: 'currency' },
        'C4': { value: '1.00', format: 'number' },
        'D4': { value: '823600', format: 'currency' },
        'E4': { value: 'CFDIs vigentes' },

        'A5': { value: 'Deducciones Autorizadas' },
        'B5': { value: '471500', format: 'currency' },
        'C5': { value: '1.00', format: 'number' },
        'D5': { value: '471500', format: 'currency' },
        'E5': { value: 'Compras + Nómina' },

        'A6': { value: 'Deducción de Inversiones (NIF)' },
        'B6': { value: '28400', format: 'currency' },
        'C6': { value: '1.00', format: 'number' },
        'D6': { value: '31500', format: 'currency' },
        'E6': { value: 'INPC Actualizado' },

        'A7': { value: 'Utilidad Fiscal Estimada' },
        'B7': { value: '323700', formula: '=B4-B5', format: 'currency', bold: true },
        'C7': { value: '0.30', format: 'percent' },
        'D7': { value: '320600', format: 'currency', bold: true },
        'E7': { value: 'Base provisional' },

        'A8': { value: 'Pago Provisional ISR (30%)' },
        'B8': { value: '97110', formula: '=B7*0.30', format: 'currency', bold: true },
        'C8': { value: '-', format: 'text' },
        'D8': { value: '96180', format: 'currency', bold: true },
        'E8': { value: 'Línea de captura' }
      };
      setCells(tCells);
      setSheetTitle('Conciliación Contable-Fiscal');
    } else if (type === 'depreciacion') {
      const tCells: Record<string, SpreadsheetCell> = {
        'A1': { value: 'CÉDULA DE DEPRECIACIÓN DE ACTIVOS FIJOS (NIF C-6)', bold: true },
        'A3': { value: 'Activo / Equipo', bold: true },
        'B3': { value: 'MOI (Costo Original)', bold: true },
        'C3': { value: 'Tasa Anual', bold: true },
        'D3': { value: 'Deprec. Mensual', bold: true },
        'E3': { value: 'Deprec. Acumulada', bold: true },

        'A4': { value: 'Maquinaria CNC Torno' },
        'B4': { value: '540000', format: 'currency' },
        'C4': { value: '0.10', format: 'percent' },
        'D4': { value: '4500', formula: '=B4*0.10/12', format: 'currency' },
        'E4': { value: '67500', format: 'currency' },

        'A5': { value: 'Servidores & Redes' },
        'B5': { value: '180000', format: 'currency' },
        'C5': { value: '0.30', format: 'percent' },
        'D5': { value: '4500', formula: '=B5*0.30/12', format: 'currency' },
        'E5': { value: '31500', format: 'currency' },

        'A6': { value: 'Vehículo de Distribución' },
        'B6': { value: '200000', format: 'currency' },
        'C6': { value: '0.25', format: 'percent' },
        'D6': { value: '4166.67', formula: '=B6*0.25/12', format: 'currency' },
        'E6': { value: '16000', format: 'currency' },

        'A7': { value: 'Total Depreciación Mes' },
        'B7': { value: '920000', formula: '=SUM(B4:B6)', format: 'currency', bold: true },
        'C7': { value: '-', format: 'text' },
        'D7': { value: '13166.67', formula: '=SUM(D4:D6)', format: 'currency', bold: true },
        'E7': { value: '115000', formula: '=SUM(E4:E6)', format: 'currency', bold: true }
      };
      setCells(tCells);
      setSheetTitle('Cédula de Depreciación NIF C-6');
    }
  };

  const handleExportCSV = () => {
    let csv = '\uFEFF';
    csv += `"${sheetTitle} - ${activeClient?.businessName}"\n\n`;

    // headers
    csv += COLS.join(',') + '\n';

    for (let r = 1; r <= ROW_COUNT; r++) {
      const rowVals = COLS.map(c => {
        const val = cells[`${c}${r}`]?.value || '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csv += rowVals.join(',') + '\n';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${sheetTitle.replace(/\s+/g, '_')}_${activeClient?.rfc}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCellValue = (cell?: SpreadsheetCell) => {
    if (!cell || !cell.value) return '';
    const num = parseFloat(cell.value);

    if (cell.format === 'currency' && !isNaN(num)) {
      return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (cell.format === 'percent' && !isNaN(num)) {
      return `${(num * 100).toFixed(1)}%`;
    }
    if (cell.format === 'number' && !isNaN(num)) {
      return num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return cell.value;
  };

  return (
    <div className="space-y-4">
      {/* Spreadsheet Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Hoja de Cálculo Financiera</span>
            <span aria-hidden="true">·</span>
            <span>Motor de Fórmulas Integrado</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono font-medium">Persistencia en Tiempo Real</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <input
              type="text"
              value={sheetTitle}
              onChange={e => setSheetTitle(e.target.value)}
              className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Templates */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => loadTemplate('conciliacion')}
              className="px-2.5 py-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              Conciliación Fiscal
            </button>
            <button
              onClick={() => loadTemplate('depreciacion')}
              className="px-2.5 py-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              Depreciación NIF C-6
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            title="Exportar a archivo de Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Descargar Excel</span>
          </button>

          <button
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-950"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Guardado en DB' : isSaving ? 'Guardando...' : 'Guardar Hoja'}</span>
          </button>
        </div>
      </div>

      {/* Formula & Formatting Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center gap-3 shadow-sm">
        {/* Active cell tag */}
        <div className="flex items-center gap-2">
          <span className="w-12 text-center py-1 text-xs font-mono font-bold bg-slate-950 border border-slate-800 rounded text-emerald-400">
            {selectedCell}
          </span>
          <span className="text-slate-500 font-mono text-xs">fx</span>
        </div>

        {/* Formula Input */}
        <input
          type="text"
          value={formulaInput}
          onChange={e => handleFormulaInputChange(e.target.value)}
          placeholder="Escribe un valor o fórmula (ej. =SUM(B4:B6), =B4*0.16, =B4-B5)..."
          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
        />

        {/* Formatting Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleBoldToggle}
            className={`p-1.5 rounded text-xs border ${
              cells[selectedCell]?.bold
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Negrita"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleFormatToggle('currency')}
            className={`px-2 py-1.5 rounded text-xs border font-mono flex items-center gap-1 ${
              cells[selectedCell]?.format === 'currency'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Formato Moneda ($ MXN)"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>$</span>
          </button>

          <button
            onClick={() => handleFormatToggle('percent')}
            className={`px-2 py-1.5 rounded text-xs border font-mono flex items-center gap-1 ${
              cells[selectedCell]?.format === 'percent'
                ? 'bg-blue-950/60 border-blue-800 text-blue-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Formato Porcentaje (%)"
          >
            <Percent className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid Viewport */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
          <table className="w-full border-collapse text-xs select-none">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-mono sticky top-0 z-10 border-b border-slate-800">
                <th className="w-10 p-2 text-center border-r border-slate-800 bg-slate-950">#</th>
                {COLS.map(col => (
                  <th
                    key={col}
                    className="min-w-[150px] p-2 text-center border-r border-slate-800 bg-slate-950 font-bold"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {Array.from({ length: ROW_COUNT }, (_, rIdx) => {
                const row = rIdx + 1;
                return (
                  <tr key={row} className="hover:bg-slate-900/50">
                    {/* Row Index */}
                    <td className="w-10 p-1.5 text-center bg-slate-950 text-slate-500 font-semibold border-r border-slate-800">
                      {row}
                    </td>

                    {/* Columns */}
                    {COLS.map(col => {
                      const cellKey = `${col}${row}`;
                      const cell = cells[cellKey];
                      const isSelected = selectedCell === cellKey;
                      const hasFormula = Boolean(cell?.formula);

                      return (
                        <td
                          key={cellKey}
                          onClick={() => handleCellClick(cellKey)}
                          className={`p-0 border-r border-slate-800 relative cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/40 ring-2 ring-emerald-500 z-10'
                              : 'hover:bg-slate-800/40'
                          }`}
                        >
                          <input
                            type="text"
                            value={isSelected ? formulaInput : formatCellValue(cell)}
                            onChange={e => {
                              setSelectedCell(cellKey);
                              handleFormulaInputChange(e.target.value);
                            }}
                            className={`w-full h-8 px-2 bg-transparent text-xs outline-none ${
                              cell?.bold ? 'font-bold' : ''
                            } ${
                              cell?.format === 'currency' || cell?.format === 'number' || cell?.format === 'percent'
                                ? 'text-right'
                                : 'text-left'
                            } ${
                              isSelected ? 'text-white' : 'text-slate-200'
                            }`}
                          />
                          {hasFormula && !isSelected && (
                            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Celda activa: <strong className="font-mono text-emerald-400">{selectedCell}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Fórmula activa: <strong className="font-mono text-slate-300">{cells[selectedCell]?.formula || 'Ninguna'}</strong></span>
          </div>
          <div className="text-slate-500">
            Fórmulas soportadas: =SUM(A1:A5), =AVERAGE(B1:B5), =A1*0.16, =A1-B1
          </div>
        </div>
      </div>
    </div>
  );
};
