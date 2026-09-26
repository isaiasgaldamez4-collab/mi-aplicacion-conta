/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AccountingProvider, useAccounting } from './context/AccountingContext.js';
import { Header } from './components/layout/Header.js';
import { FinancialDashboard } from './components/dashboard/FinancialDashboard.js';
import { FinancialStatementsView } from './components/statements/FinancialStatementsView.js';
import { GeneralLedgerView } from './components/ledger/GeneralLedgerView.js';
import { AccountingSpreadsheet } from './components/spreadsheet/AccountingSpreadsheet.js';
import { BankingView } from './components/banking/BankingView.js';
import { PurchasesView } from './components/purchases/PurchasesView.js';
import { DebtsView } from './components/debts/DebtsView.js';
import { FiscalView } from './components/fiscal/FiscalView.js';
import { InvoicesView } from './components/invoicing/InvoicesView.js';
import { TaxDeadlinesView } from './components/deadlines/TaxDeadlinesView.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { AccountantProfileModal } from './components/profile/AccountantProfileModal.js';
import { ExportCenterModal } from './components/export/ExportCenterModal.js';
import { NewClientModal } from './components/clients/NewClientModal.js';

const AppContent: React.FC = () => {
  const { activeTab } = useAccounting();
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <Header onOpenNewClient={() => setIsNewClientModalOpen(true)} />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'dashboard' && <FinancialDashboard />}
        {activeTab === 'treasury' && <BankingView />}
        {activeTab === 'purchases' && <PurchasesView />}
        {activeTab === 'debts' && <DebtsView />}
        {activeTab === 'fiscal' && <FiscalView />}
        {activeTab === 'polizas' && <GeneralLedgerView />}
        {activeTab === 'statements' && <FinancialStatementsView />}
        {activeTab === 'spreadsheet' && <AccountingSpreadsheet />}
        {activeTab === 'invoices' && <InvoicesView />}
        {activeTab === 'deadlines' && <TaxDeadlinesView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 px-4 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">ContaSoftware-2TB</span>
            <span aria-hidden="true">·</span>
            <span>Sistema Integral de Contabilidad Profesional & Auditoría Fiscal</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-500 font-mono">Bcrypt Security Hash</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Conforme a NIF y CFF</span>
            <span>·</span>
            <span>SAT CFDI 4.0</span>
            <span>·</span>
            <span>Contabilidad desde Cero</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AuthModal />
      <AccountantProfileModal />
      <ExportCenterModal />
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AccountingProvider>
      <AppContent />
    </AccountingProvider>
  );
}
