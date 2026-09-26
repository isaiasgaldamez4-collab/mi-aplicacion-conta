import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserAccountant,
  ClientProfile,
  FinancialStatements,
  Poliza,
  BankAccount,
  CompanyPurchase,
  CompanyDebt,
  Invoice,
  TaxDeadline,
  SpreadsheetData,
  ActiveTab
} from '../types/accounting.js';
import { accountingApi, authStorage } from '../services/api.js';

interface AccountingContextType {
  // Auth & Session
  user: UserAccountant | null;
  token: string | null;
  isLoadingAuth: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserAccountant>) => Promise<void>;

  // Navigation & Persistence
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Clients
  clients: ClientProfile[];
  activeClient: ClientProfile | null;
  setActiveClient: (client: ClientProfile) => void;
  createClient: (data: Partial<ClientProfile>) => Promise<void>;
  updateClient: (id: string, updates: Partial<ClientProfile>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  resetClientData: () => Promise<void>;

  // Accounting Data for active client
  financials: FinancialStatements | null;
  polizas: Poliza[];
  bankAccounts: BankAccount[];
  purchases: CompanyPurchase[];
  debts: CompanyDebt[];
  invoices: Invoice[];
  deadlines: TaxDeadline[];
  spreadsheet: SpreadsheetData | null;
  isLoadingClientData: boolean;

  // Actions
  refreshClientData: () => Promise<void>;
  createPoliza: (data: any) => Promise<void>;
  deletePoliza: (id: string) => Promise<void>;
  createBankAccount: (data: any) => Promise<void>;
  addBankMovement: (accountId: string, movement: any) => Promise<void>;
  toggleReconciliation: (accountId: string, movementId: string) => Promise<void>;
  createPurchase: (data: any) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
  createDebt: (data: any) => Promise<void>;
  addDebtPayment: (debtId: string, paymentData: any) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  createInvoice: (data: any) => Promise<void>;
  updateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => Promise<void>;
  createDeadline: (data: any) => Promise<void>;
  updateDeadlineStatus: (deadlineId: string, status: TaxDeadline['status']) => Promise<void>;
  saveSpreadsheet: (sheet: Partial<SpreadsheetData>) => Promise<void>;

  // Automatic alerts
  urgentDeadlines: TaxDeadline[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccountant | null>(null);
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [activeTab, setActiveTabState] = useState<ActiveTab>('dashboard');

  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [activeClient, setActiveClientState] = useState<ClientProfile | null>(null);

  const [financials, setFinancials] = useState<FinancialStatements | null>(null);
  const [polizas, setPolizas] = useState<Poliza[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [purchases, setPurchases] = useState<CompanyPurchase[]>([]);
  const [debts, setDebts] = useState<CompanyDebt[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deadlines, setDeadlines] = useState<TaxDeadline[]>([]);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [isLoadingClientData, setIsLoadingClientData] = useState<boolean>(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Load initial session on boot
  useEffect(() => {
    async function initSession() {
      const storedToken = authStorage.getToken();
      if (!storedToken) {
        setIsLoadingAuth(false);
        setIsAuthModalOpen(true);
        return;
      }

      try {
        const { user: authedUser, session } = await accountingApi.getMe();
        setUser(authedUser);
        setToken(storedToken);

        const clientList = await accountingApi.getClients();
        setClients(clientList);

        if (clientList.length > 0) {
          const matched = clientList.find(c => c.id === session.activeClientId) || clientList[0];
          setActiveClientState(matched);
        }

        if (session.activeTab) {
          setActiveTabState(session.activeTab as ActiveTab);
        }
      } catch (err) {
        console.warn('Session expired or invalid, clearing:', err);
        authStorage.clearToken();
        setToken(null);
        setUser(null);
        setIsAuthModalOpen(true);
      } finally {
        setIsLoadingAuth(false);
      }
    }

    initSession();
  }, []);

  // Fetch all accounting data when active client changes
  const fetchActiveClientData = useCallback(async (clientId: string) => {
    setIsLoadingClientData(true);
    try {
      const [fin, pol, bank, pur, dbt, inv, dead, sheet] = await Promise.all([
        accountingApi.getFinancials(clientId).catch(() => null),
        accountingApi.getPolizas(clientId).catch(() => []),
        accountingApi.getBankAccounts(clientId).catch(() => []),
        accountingApi.getPurchases(clientId).catch(() => []),
        accountingApi.getDebts(clientId).catch(() => []),
        accountingApi.getInvoices(clientId).catch(() => []),
        accountingApi.getDeadlines(clientId).catch(() => []),
        accountingApi.getSpreadsheet(clientId).catch(() => null)
      ]);

      setFinancials(fin);
      setPolizas(pol);
      setBankAccounts(bank);
      setPurchases(pur);
      setDebts(dbt);
      setInvoices(inv);
      setDeadlines(dead);
      setSpreadsheet(sheet);
    } catch (err) {
      console.error('Error fetching client accounting data:', err);
    } finally {
      setIsLoadingClientData(false);
    }
  }, []);

  useEffect(() => {
    if (activeClient) {
      fetchActiveClientData(activeClient.id);
    }
  }, [activeClient, fetchActiveClientData]);

  // Sync session state to server so reload remembers exact location
  const syncSession = useCallback((clientId: string | null, tab: ActiveTab) => {
    if (authStorage.getToken()) {
      accountingApi.updateSessionState(clientId, tab).catch(() => {});
    }
  }, []);

  const setActiveClient = (client: ClientProfile) => {
    setActiveClientState(client);
    syncSession(client.id, activeTab);
  };

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    syncSession(activeClient ? activeClient.id : null, tab);
  };

  // Auth Handlers
  const login = async (email: string, pass: string) => {
    const res = await accountingApi.login(email, pass);
    setUser(res.user);
    setToken(res.token);
    setIsAuthModalOpen(false);

    const clientList = await accountingApi.getClients();
    setClients(clientList);

    if (clientList.length > 0) {
      const target = clientList.find(c => c.id === res.session.activeClientId) || clientList[0];
      setActiveClientState(target);
    }
    if (res.session.activeTab) {
      setActiveTabState(res.session.activeTab as ActiveTab);
    }
  };

  const register = async (payload: any) => {
    const res = await accountingApi.register(payload);
    setUser(res.user);
    setToken(res.token);
    setIsAuthModalOpen(false);

    const clientList = await accountingApi.getClients();
    setClients(clientList);
    if (clientList.length > 0) {
      setActiveClientState(clientList[0]);
    }
  };

  const logout = async () => {
    await accountingApi.logout();
    setUser(null);
    setToken(null);
    setClients([]);
    setActiveClientState(null);
    setFinancials(null);
    setPolizas([]);
    setBankAccounts([]);
    setPurchases([]);
    setDebts([]);
    setInvoices([]);
    setDeadlines([]);
    setSpreadsheet(null);
    setIsAuthModalOpen(true);
  };

  const updateProfile = async (updates: Partial<UserAccountant>) => {
    const { user: updated } = await accountingApi.updateProfile(updates);
    setUser(updated);
  };

  // Client Management Handlers
  const createClient = async (data: Partial<ClientProfile>) => {
    const created = await accountingApi.createClient(data);
    setClients(prev => [...prev, created]);
    setActiveClientState(created);
    syncSession(created.id, activeTab);
  };

  const updateClient = async (id: string, updates: Partial<ClientProfile>) => {
    const updated = await accountingApi.updateClient(id, updates);
    setClients(prev => prev.map(c => (c.id === id ? updated : c)));
    if (activeClient?.id === id) {
      setActiveClientState(updated);
    }
  };

  const deleteClient = async (id: string) => {
    await accountingApi.deleteClient(id);
    const remaining = clients.filter(c => c.id !== id);
    setClients(remaining);
    if (activeClient?.id === id) {
      setActiveClientState(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const resetClientData = async () => {
    if (!activeClient) return;
    await accountingApi.resetClientData(activeClient.id);
    await refreshClientData();
  };

  // Accounting Action Handlers
  const refreshClientData = async () => {
    if (activeClient) {
      await fetchActiveClientData(activeClient.id);
    }
  };

  const createPoliza = async (data: any) => {
    if (!activeClient) return;
    await accountingApi.createPoliza(activeClient.id, data);
    await refreshClientData();
  };

  const deletePoliza = async (id: string) => {
    if (!activeClient) return;
    await accountingApi.deletePoliza(activeClient.id, id);
    await refreshClientData();
  };

  const createBankAccount = async (data: any) => {
    if (!activeClient) return;
    await accountingApi.createBankAccount(activeClient.id, data);
    await refreshClientData();
  };

  const addBankMovement = async (accountId: string, movement: any) => {
    if (!activeClient) return;
    await accountingApi.addBankMovement(activeClient.id, accountId, movement);
    await refreshClientData();
  };

  const toggleReconciliation = async (accountId: string, movementId: string) => {
    if (!activeClient) return;
    await accountingApi.toggleReconciliation(activeClient.id, accountId, movementId);
    await refreshClientData();
  };

  const createPurchase = async (data: any) => {
    if (!activeClient) return;
    await accountingApi.createPurchase(activeClient.id, data);
    await refreshClientData();
  };

  const deletePurchase = async (id: string) => {
    if (!activeClient) return;
    await accountingApi.deletePurchase(activeClient.id, id);
    await refreshClientData();
  };

  const createDebt = async (data: any) => {
    if (!activeClient) return;
    await accountingApi.createDebt(activeClient.id, data);
    await refreshClientData();
  };

  const addDebtPayment = async (debtId: string, paymentData: any) => {
    if (!activeClient) return;
    await accountingApi.addDebtPayment(activeClient.id, debtId, paymentData);
    await refreshClientData();
  };

  const deleteDebt = async (id: string) => {
    if (!activeClient) return;
    await accountingApi.deleteDebt(activeClient.id, id);
    await refreshClientData();
  };

  const createInvoice = async (data: any) => {
    if (!activeClient) return;
    await accountingApi.createInvoice(activeClient.id, data);
    await refreshClientData();
  };

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    if (!activeClient) return;
    await accountingApi.updateInvoiceStatus(activeClient.id, invoiceId, status);
    await refreshClientData();
  };

  const createDeadline = async (data: any) => {
    if (!activeClient) return;
    await accountingApi.createDeadline(activeClient.id, data);
    await refreshClientData();
  };

  const updateDeadlineStatus = async (deadlineId: string, status: TaxDeadline['status']) => {
    if (!activeClient) return;
    await accountingApi.updateDeadlineStatus(activeClient.id, deadlineId, status);
    await refreshClientData();
  };

  const saveSpreadsheet = async (sheetData: Partial<SpreadsheetData>) => {
    if (!activeClient) return;
    const saved = await accountingApi.saveSpreadsheet(activeClient.id, sheetData);
    setSpreadsheet(saved);
  };

  const urgentDeadlines = deadlines.filter(d => d.status === 'Pendiente');

  return (
    <AccountingContext.Provider
      value={{
        user,
        token,
        isLoadingAuth,
        login,
        register,
        logout,
        updateProfile,
        activeTab,
        setActiveTab,
        clients,
        activeClient,
        setActiveClient,
        createClient,
        updateClient,
        deleteClient,
        resetClientData,
        financials,
        polizas,
        bankAccounts,
        purchases,
        debts,
        invoices,
        deadlines,
        spreadsheet,
        isLoadingClientData,
        refreshClientData,
        createPoliza,
        deletePoliza,
        createBankAccount,
        addBankMovement,
        toggleReconciliation,
        createPurchase,
        deletePurchase,
        createDebt,
        addDebtPayment,
        deleteDebt,
        createInvoice,
        updateInvoiceStatus,
        createDeadline,
        updateDeadlineStatus,
        saveSpreadsheet,
        urgentDeadlines,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isExportModalOpen,
        setIsExportModalOpen
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
