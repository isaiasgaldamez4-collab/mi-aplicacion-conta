import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import { TaxDeadline } from '../../types/accounting.js';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  ShieldAlert,
  Bell,
  X
} from 'lucide-react';

export const TaxDeadlinesView: React.FC = () => {
  const { activeClient, deadlines, createDeadline, updateDeadlineStatus } = useAccounting();

  const [statusFilter, setStatusFilter] = useState<'all' | 'Pendiente' | 'Presentada'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<'SAT' | 'IMSS' | 'DIOT' | 'Bancario' | 'Nómina'>('SAT');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [priority, setPriority] = useState<'Alta' | 'Media' | 'Baja'>('Alta');

  if (!activeClient) return null;

  const filtered = deadlines.filter(d => {
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  const handleCreateDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    await createDeadline({
      title,
      description: desc,
      type,
      dueDate,
      amount: amount ? parseFloat(amount) : undefined,
      status: 'Pendiente',
      priority
    });

    setIsModalOpen(false);
    setTitle('');
    setDesc('');
    setDueDate('');
    setAmount('');
  };

  const formatMoney = (val: number | undefined) => {
    if (val === undefined) return '-';
    return `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Calendario de Obligaciones Fiscales</span>
            <span aria-hidden="true">·</span>
            <span>Alertas Automáticas SAT / IMSS</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-mono font-medium">
              {deadlines.filter(d => d.status === 'Pendiente').length} Pendientes
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Vencimientos Fiscales & Alertas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo en tiempo real de plazos legales para <strong>{activeClient.commercialName || activeClient.businessName}</strong>
          </p>
        </div>

        <button
          onClick={() => {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            setDueDate(nextWeek.toISOString().split('T')[0]);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-amber-950"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Vencimiento</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas ({deadlines.length})
          </button>
          <button
            onClick={() => setStatusFilter('Pendiente')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'Pendiente' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pendientes de Cumplimiento
          </button>
          <button
            onClick={() => setStatusFilter('Presentada')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'Presentada' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Presentadas / Cumplidas
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span>Notificaciones activas para el contador</span>
        </div>
      </div>

      {/* Deadlines List */}
      <div className="space-y-3">
        {filtered.map(d => {
          const isPending = d.status === 'Pendiente';
          return (
            <div
              key={d.id}
              className={`p-5 rounded-xl border transition-all ${
                isPending
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-900/50 border-slate-800/60 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      d.type === 'SAT' ? 'bg-red-950/80 text-red-400 border border-red-800/60' :
                      d.type === 'IMSS' ? 'bg-blue-950/80 text-blue-400 border border-blue-800/60' :
                      d.type === 'DIOT' ? 'bg-purple-950/80 text-purple-400 border border-purple-800/60' :
                      'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                    }`}>
                      {d.type}
                    </span>
                    <h3 className="text-sm font-bold text-white">{d.title}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      d.priority === 'Alta' ? 'bg-amber-950 text-amber-300 font-semibold' : 'text-slate-400'
                    }`}>
                      Prioridad {d.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                    {d.description}
                  </p>
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-xs font-mono font-medium text-amber-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Vence: {d.dueDate}</span>
                    </div>
                    {d.amount && (
                      <div className="text-xs font-mono text-slate-300 mt-0.5 tabular-nums">
                        Importe: <strong className="text-white">{formatMoney(d.amount)}</strong>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() =>
                        updateDeadlineStatus(d.id, d.status === 'Pendiente' ? 'Presentada' : 'Pendiente')
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        d.status === 'Presentada'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{d.status === 'Presentada' ? 'Cumplida' : 'Marcar Presentada'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
            <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No hay obligaciones para esta vista.</p>
          </div>
        )}
      </div>

      {/* Modal: Programar Vencimiento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-base font-bold text-white">Programar Obligación Fiscal</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeadline} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Concepto de la Obligación</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pago Provisional de ISR e IVA..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Descripción / Instrucciones</label>
                <textarea
                  rows={2}
                  placeholder="Detalles de la presentación, línea de captura o formato..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Autoridad / Tipo</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="SAT">SAT (Impuestos Federales)</option>
                    <option value="IMSS">IMSS / Infonavit</option>
                    <option value="DIOT">DIOT (Proveedores)</option>
                    <option value="Bancario">Cobranza Factura</option>
                    <option value="Nómina">Dispersión Nómina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Prioridad</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Importe Estimado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Opcional"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold"
                >
                  Guardar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
