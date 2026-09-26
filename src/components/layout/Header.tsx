import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext.js';
import { ActiveTab } from '../../types/accounting.js';
import {
  FileText,
  User,
  PlusCircle,
  AlertTriangle,
  ChevronDown,
  Building2,
  Download,
  Landmark,
  ShoppingBag,
  CreditCard,
  Scale,
  Receipt
} from 'lucide-react';

interface HeaderProps {
  onOpenNewClient: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewClient }) => {
  const {
    user,
    activeTab,
    setActiveTab,
    clients,
    activeClient,
    setActiveClient,
    urgentDeadlines,
    setIsProfileModalOpen,
    setIsExportModalOpen,
    setIsAuthModalOpen
  } = useAccounting();

  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon?: any }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'treasury', label: 'Tesorería & Depósitos' },
    { id: 'purchases', label: 'Compras de Empresa' },
    { id: 'debts', label: 'Deudas & Pasivos' },
    { id: 'fiscal', label: 'Gastos Fiscales & SAT' },
    { id: 'polizas', label: 'Pólizas Contables' },
    { id: 'statements', label: 'Balances NIF' },
    { id: 'spreadsheet', label: 'Papel de Trabajo' },
    { id: 'invoices', label: 'Facturas CFDI' },
    { id: 'deadlines', label: 'Vencimientos' }
  ];

  const pendingUrgentCount = urgentDeadlines.length;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              ContaSoftware-2TB
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-3">
            <span>Sistema Contable & Fiscal</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-emerald-400 font-mono text-[11px]">ERP Contador</span>
          </div>
        </div>

        {/* Client Switcher & Actions */}
        <div className="flex items-center gap-2">
          {/* Client Switcher Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-900 border border-slate-700/80 rounded-lg hover:border-slate-600 text-slate-200 transition-colors shadow-sm max-w-[210px] md:max-w-[270px]"
                title="Cambiar cliente contable"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="flex flex-col text-left truncate">
                  <span className="font-semibold text-white truncate text-[11px]">
                    {activeClient ? activeClient.commercialName || activeClient.businessName : 'Seleccionar Cliente'}
                  </span>
                  {activeClient && (
                    <span className="text-[10px] text-slate-400 font-mono truncate">
                      {activeClient.rfc} · {activeClient.currentPeriod}
                    </span>
                  )}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-auto" />
              </button>

              {isClientDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsClientDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1.5 z-40 text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>EMPRESAS CLIENTES ({clients.length})</span>
                      <button
                        onClick={() => {
                          setIsClientDropdownOpen(false);
                          onOpenNewClient();
                        }}
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                      >
                        <PlusCircle className="w-3 h-3" />
                        Nuevo
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1">
                      {clients.map(c => {
                        const isSelected = activeClient?.id === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              setActiveClient(c);
                              setIsClientDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 transition-colors ${
                              isSelected
                                ? 'bg-slate-800 text-emerald-300 font-medium'
                                : 'text-slate-300 hover:bg-slate-800/60'
                            }`}
                          >
                            <span className="truncate text-white font-medium">
                              {c.businessName}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>{c.rfc}</span>
                              <span aria-hidden="true">·</span>
                              <span>{c.status}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quick Export Button */}
          {activeClient && (
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              title="Exportar reportes oficiales de Word y Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Exportar</span>
            </button>
          )}

          {/* Accountant Profile Button */}
          {user ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors shadow-sm"
              title="Ver perfil del contador"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-slate-300" />
                )}
              </div>
              <span className="hidden lg:inline font-medium text-white truncate max-w-[130px]">
                {user.name.split(' ')[0]} {user.name.split(' ')[1] || ''}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              Acceso Contador
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scrollable ERP Navigation Bar */}
      <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto pt-2 pb-0.5 text-xs scrollbar-none border-t border-slate-900 mt-2">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span>{item.label}</span>
              {item.id === 'deadlines' && pendingUrgentCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
                  {pendingUrgentCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
