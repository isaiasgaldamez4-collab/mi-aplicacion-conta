import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Building,
  KeyRound,
  ArrowRight,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { user, login, register, isAuthModalOpen, setIsAuthModalOpen } = useAccounting();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [firmName, setFirmName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated and not explicitly requested, don't show
  if (!isAuthModalOpen && user) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login(email, password);
      setPassword(''); // Never keep plaintext password in memory
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await register({
        email,
        password,
        name,
        licenseNumber,
        firmName,
        phone
      });
      setPassword(''); // Clear plaintext password
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login for the Programming Expo presentation
  const handleExpoQuickLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await login('isaiasdejesusguzman53@gmail.com', 'contador2026');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error en acceso rápido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              <span className="font-bold text-white tracking-tight text-base">ContaSoftware-2TB</span>
            </div>
            {user && (
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Plataforma Contable y Fiscal · Software Profesional para Contadores
          </p>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 mt-4 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`py-1.5 rounded-md font-medium transition-colors ${
                mode === 'login' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`py-1.5 rounded-md font-medium transition-colors ${
                mode === 'register' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registro de Contador
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Demo Login Button for the Expo Presentation */}
          <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Acceso Rápido Expo (C.P. Demo)</span>
              </div>
              <button
                type="button"
                onClick={handleExpoQuickLogin}
                disabled={isLoading}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
              >
                Entrar Demo
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Inicia sesión con la cuenta de demostración del C.P. Isaías de Jesús Guzmán y clientes precargados.
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase font-mono">O ingresa tus datos</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Correo Electrónico (Gmail)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Contraseña de Acceso</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Protegida con función hash unidireccional bcrypt (nunca mostrada en pantalla).
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-950"
              >
                <span>{isLoading ? 'Verificando Hash...' : 'Ingresar al Sistema'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nombre Completo del Contador</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="C.P. Nombre Apellido"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Correo Electrónico (Gmail de verdad)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="tu-correo@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Contraseña Elegida (Cualquiera de tu elección)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="•••••••• (mínimo 6 caracteres)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Puedes utilizar cualquier contraseña personal. Se almacenará cifrada con bcrypt.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cédula Profesional</label>
                  <input
                    type="text"
                    placeholder="CP-0000000"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Despacho Contable</label>
                  <input
                    type="text"
                    placeholder="Nombre del despacho"
                    value={firmName}
                    onChange={e => setFirmName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-950"
              >
                <span>{isLoading ? 'Cifrando datos...' : 'Crear Cuenta Segura de Contador'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Ethical Security Assurance Footer */}
          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Cifrado Bcrypt & Sesión Persistente
            </span>
            <span>SAT v4.0 & NIF</span>
          </div>
        </div>
      </div>
    </div>
  );
};
