import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import {
  User,
  ShieldCheck,
  Building,
  Award,
  Phone,
  Mail,
  KeyRound,
  FileCheck,
  LogOut,
  Save,
  Check,
  X
} from 'lucide-react';

export const AccountantProfileModal: React.FC = () => {
  const { user, clients, polizas, updateProfile, logout, isProfileModalOpen, setIsProfileModalOpen } = useAccounting();

  const [name, setName] = useState(user?.name || '');
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || '');
  const [firmName, setFirmName] = useState(user?.firmName || '');
  const [collegeFolio, setCollegeFolio] = useState(user?.collegeFolio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialty, setSpecialty] = useState(user?.specialty || '');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isProfileModalOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        licenseNumber,
        firmName,
        collegeFolio,
        phone,
        specialty
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Dashboard Personal del Contador & Seguridad</h2>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* Top Profile Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/80 shrink-0 bg-slate-800 shadow-md">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-10 h-10 text-slate-400 mx-auto mt-4" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                  C.P. Certificado
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.firmName}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-slate-400 font-mono text-[11px]">
                <span>Cédula: <strong className="text-slate-200">{user.licenseNumber}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Folio Colegio: <strong className="text-slate-200">{user.collegeFolio}</strong></span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  logout();
                }}
                className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/80 rounded-lg font-medium transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Practice & Audit Telemetry Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Clientes Asignados</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">{clients.length}</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Empresas en regla</span>
            </div>
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Pólizas Procesadas</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">{polizas.length}</span>
              <span className="text-[10px] text-blue-400 block mt-0.5">Partida doble 100%</span>
            </div>
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Seguridad Activa</span>
              <span className="text-base font-bold font-mono text-emerald-400 block mt-1">Bcrypt Hash</span>
              <span className="text-[10px] text-slate-400 block">Cifrado persistente</span>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
              Información Profesional & Despacho
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nombre Completo del Contador</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Cédula Profesional (DGP)</label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Razón Social del Despacho Contable</label>
                <input
                  type="text"
                  value={firmName}
                  onChange={e => setFirmName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Folio Colegio de Contadores</label>
                <input
                  type="text"
                  value={collegeFolio}
                  onChange={e => setCollegeFolio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Especialidad Fiscal / Contable</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Teléfono Directo de Contacto</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Cryptographic Security Details (Ethical, strictly no credential exposure) */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Parámetros de Seguridad y Cifrado</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Todas las credenciales están protegidas mediante el algoritmo criptográfico <strong>bcrypt</strong> con factor de salteo (salt rounds = 10). Las credenciales nunca se transmiten ni muestran en texto plano. La sesión persistente utiliza tokens criptográficos sincronizados en tiempo real con la base de datos de auditoría.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
                <span>Algoritmo: bcrypt v5</span>
                <span aria-hidden="true">·</span>
                <span>Almacenamiento: ACID Persistent JSON Store</span>
                <span aria-hidden="true">·</span>
                <span>Correo registrado: {user.email}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{savedSuccess ? 'Cambios Guardados' : isSaving ? 'Guardando...' : 'Guardar Información'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
