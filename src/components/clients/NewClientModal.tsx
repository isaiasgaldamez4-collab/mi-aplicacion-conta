import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import { Building2, X, Plus, ShieldCheck, Sparkles } from 'lucide-react';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({ isOpen, onClose }) => {
  const { createClient } = useAccounting();

  const [businessName, setBusinessName] = useState('');
  const [commercialName, setCommercialName] = useState('');
  const [rfc, setRfc] = useState('');
  const [taxRegime, setTaxRegime] = useState('601 - General de Ley Personas Morales');
  const [personType, setPersonType] = useState<'Persona Moral' | 'Persona Física'>('Persona Moral');
  const [initialBankBalance, setInitialBankBalance] = useState('0');
  const [initialCapital, setInitialCapital] = useState('0');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState('Septiembre 2026');
  const [fiscalYear, setFiscalYear] = useState('2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !rfc) {
      setErrorMsg('Razón Social y RFC son requeridos obligatoriamente.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await createClient({
        businessName,
        commercialName: commercialName || businessName,
        rfc: rfc.toUpperCase().trim(),
        taxRegime,
        personType,
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        currentPeriod,
        fiscalYear: parseInt(fiscalYear) || 2026,
        initialBankBalance: parseFloat(initialBankBalance) || 0,
        initialCapital: parseFloat(initialCapital) || 0
      });

      onClose();
      setBusinessName('');
      setCommercialName('');
      setRfc('');
      setInitialBankBalance('0');
      setInitialCapital('0');
      setEmail('');
      setPhone('');
      setAddress('');
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar cliente contable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Alta de Perfil del Cliente Contable</h3>
              <p className="text-[11px] text-slate-400">ContaSoftware-2TB · Contabilidad desde cero sin dinero simulado</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-emerald-300 text-[11px] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>
              <strong>Contabilidad Real desde Cero:</strong> Este cliente se iniciará en $0.00. Como contador, tú tendrás control total de todas las entradas, salidas, depósitos del cliente, compras de la empresa, deudas y gastos fiscales.
            </span>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Razón Social Legal de la Empresa</label>
            <input
              type="text"
              required
              placeholder="Ej. Manufacturas del Centro S.A. de C.V."
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Nombre Comercial</label>
              <input
                type="text"
                placeholder="Ej. Centro Manufacturas"
                value={commercialName}
                onChange={e => setCommercialName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">RFC Fiscal</label>
              <input
                type="text"
                required
                placeholder="MDC240101XYZ"
                value={rfc}
                onChange={e => setRfc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tipo de Persona</label>
              <select
                value={personType}
                onChange={e => setPersonType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Persona Moral">Persona Moral (Sociedades)</option>
                <option value="Persona Física">Persona Física con Actividad Empresarial</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Régimen Fiscal (SAT)</label>
              <select
                value={taxRegime}
                onChange={e => setTaxRegime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="601 - General de Ley Personas Morales">601 - General de Ley Personas Morales</option>
                <option value="626 - Régimen Simplificado de Confianza (RESICO)">626 - Régimen Simplificado de Confianza (RESICO)</option>
                <option value="612 - Personas Físicas con Actividades Empresariales">612 - Personas Físicas con Actividades Empresariales</option>
                <option value="603 - Personas Morales con Fines no Lucrativos">603 - Personas Morales con Fines no Lucrativos</option>
              </select>
            </div>
          </div>

          {/* Opening balances (Default: $0.00) */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3">
            <span className="text-[11px] font-semibold text-slate-300 block">Saldos de Apertura (Opcionales - Por defecto $0.00):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Saldo Inicial en Banco ($ MXN)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={initialBankBalance}
                  onChange={e => setInitialBankBalance(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">0.00 para empezar desde cero</span>
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Capital Social Aportado ($ MXN)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={initialCapital}
                  onChange={e => setInitialCapital(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Aportación de socios según acta</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Ejercicio Fiscal</label>
              <input
                type="number"
                value={fiscalYear}
                onChange={e => setFiscalYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Período Contable Inicial</label>
              <input
                type="text"
                value={currentPeriod}
                onChange={e => setCurrentPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Correo Electrónico de Contacto</label>
              <input
                type="email"
                placeholder="administracion@cliente.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Teléfono Directo</label>
              <input
                type="text"
                placeholder="+52 55 1234 5678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Domicilio Fiscal Registrado</label>
            <input
              type="text"
              placeholder="Calle, Número, Colonia, C.P., Ciudad, Estado"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creando...' : 'Crear Perfil del Cliente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
