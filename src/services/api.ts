import {
  UserAccountant,
  ClientProfile,
  Poliza,
  BankAccount,
  Invoice,
  TaxDeadline,
  SpreadsheetData,
  FinancialStatements,
  CompanyPurchase,
  CompanyDebt,
  ActiveTab
} from '../types/accounting.js';

const TOKEN_KEY = 'contasuite_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY)
};

/**
 * Configuración de cliente API para Vercel y entornos de producción.
 * Utiliza estrictamente rutas relativas con baseURL: '/api' sin referencias a localhost.
 */
export const apiConfig = {
  baseURL: '/api'
};

function formatEndpoint(endpoint: string): string {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (clean.startsWith(apiConfig.baseURL)) {
    return clean;
  }
  return `${apiConfig.baseURL}${clean}`;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const relativeUrl = formatEndpoint(url);
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(relativeUrl, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Error en la solicitud (${response.status})`);
  }

  return data;
}

export const accountingApi = {
  // Auth
  async login(email: string, password: string): Promise<{ user: UserAccountant; token: string; session: any }> {
    const res = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    authStorage.setToken(res.token);
    return res;
  },

  async register(payload: {
    email: string;
    password: string;
    name: string;
    licenseNumber?: string;
    firmName?: string;
    phone?: string;
  }): Promise<{ user: UserAccountant; token: string; session: any }> {
    const res = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    authStorage.setToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: UserAccountant; session: { activeClientId: string | null; activeTab: ActiveTab } }> {
    return fetchWithAuth('/api/auth/me');
  },

  async updateProfile(updates: Partial<UserAccountant>): Promise<{ user: UserAccountant }> {
    return fetchWithAuth('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async updateSessionState(activeClientId: string | null, activeTab: ActiveTab): Promise<any> {
    return fetchWithAuth('/api/auth/session-state', {
      method: 'PUT',
      body: JSON.stringify({ activeClientId, activeTab })
    });
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
    }
  },

  // Clients
  async getClients(): Promise<ClientProfile[]> {
    const res = await fetchWithAuth('/api/clients');
    return res.clients || [];
  },

  async createClient(data: Partial<ClientProfile>): Promise<ClientProfile> {
    const res = await fetchWithAuth('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.client;
  },

  async updateClient(clientId: string, updates: Partial<ClientProfile>): Promise<ClientProfile> {
    const res = await fetchWithAuth(`/api/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    return res.client;
  },

  async deleteClient(clientId: string): Promise<void> {
    await fetchWithAuth(`/api/clients/${clientId}`, {
      method: 'DELETE'
    });
  },

  async resetClientData(clientId: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth(`/api/clients/${clientId}/reset-zero`, {
      method: 'POST'
    });
  },

  // Financials & Statements
  async getFinancials(clientId: string): Promise<FinancialStatements> {
    return fetchWithAuth(`/api/clients/${clientId}/financials`);
  },

  // Polizas
  async getPolizas(clientId: string): Promise<Poliza[]> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/polizas`);
    return res.polizas || [];
  },

  async createPoliza(clientId: string, data: any): Promise<Poliza> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/polizas`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.poliza;
  },

  async deletePoliza(clientId: string, polizaId: string): Promise<void> {
    await fetchWithAuth(`/api/clients/${clientId}/polizas/${polizaId}`, {
      method: 'DELETE'
    });
  },

  // Bank Accounts (Tesorería: Entradas, Salidas & Depósitos)
  async getBankAccounts(clientId: string): Promise<BankAccount[]> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/bank-accounts`);
    return res.accounts || [];
  },

  async createBankAccount(clientId: string, data: Partial<BankAccount>): Promise<BankAccount> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/bank-accounts`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.account;
  },

  async addBankMovement(clientId: string, accountId: string, movement: any): Promise<any> {
    return fetchWithAuth(`/api/clients/${clientId}/bank-accounts/${accountId}/movements`, {
      method: 'POST',
      body: JSON.stringify(movement)
    });
  },

  async toggleReconciliation(clientId: string, accountId: string, movementId: string): Promise<boolean> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/bank-accounts/${accountId}/reconcile/${movementId}`, {
      method: 'POST'
    });
    return res.reconciled;
  },

  // Purchases (Compras de la Empresa)
  async getPurchases(clientId: string): Promise<CompanyPurchase[]> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/purchases`);
    return res.purchases || [];
  },

  async createPurchase(clientId: string, data: any): Promise<CompanyPurchase> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/purchases`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.purchase;
  },

  async deletePurchase(clientId: string, purchaseId: string): Promise<void> {
    await fetchWithAuth(`/api/clients/${clientId}/purchases/${purchaseId}`, {
      method: 'DELETE'
    });
  },

  // Debts & Liabilities (Deudas y Pasivos)
  async getDebts(clientId: string): Promise<CompanyDebt[]> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/debts`);
    return res.debts || [];
  },

  async createDebt(clientId: string, data: any): Promise<CompanyDebt> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/debts`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.debt;
  },

  async addDebtPayment(clientId: string, debtId: string, paymentData: any): Promise<any> {
    return fetchWithAuth(`/api/clients/${clientId}/debts/${debtId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  async deleteDebt(clientId: string, debtId: string): Promise<void> {
    await fetchWithAuth(`/api/clients/${clientId}/debts/${debtId}`, {
      method: 'DELETE'
    });
  },

  // Invoices (CFDI)
  async getInvoices(clientId: string): Promise<Invoice[]> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/invoices`);
    return res.invoices || [];
  },

  async createInvoice(clientId: string, data: any): Promise<Invoice> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/invoices`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.invoice;
  },

  async updateInvoiceStatus(clientId: string, invoiceId: string, status: Invoice['status']): Promise<Invoice> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/invoices/${invoiceId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    return res.invoice;
  },

  // Deadlines
  async getDeadlines(clientId: string): Promise<TaxDeadline[]> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/deadlines`);
    return res.deadlines || [];
  },

  async createDeadline(clientId: string, data: any): Promise<TaxDeadline> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/deadlines`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.deadline;
  },

  async updateDeadlineStatus(clientId: string, deadlineId: string, status: TaxDeadline['status']): Promise<TaxDeadline> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/deadlines/${deadlineId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    return res.deadline;
  },

  // Spreadsheet
  async getSpreadsheet(clientId: string): Promise<SpreadsheetData> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/spreadsheet`);
    return res.sheet;
  },

  async saveSpreadsheet(clientId: string, sheetData: Partial<SpreadsheetData>): Promise<SpreadsheetData> {
    const res = await fetchWithAuth(`/api/clients/${clientId}/spreadsheet`, {
      method: 'PUT',
      body: JSON.stringify(sheetData)
    });
    return res.sheet;
  },

  // Export URLs (rutas relativas para Vercel y producción)
  getWordExportUrl(clientId: string): string {
    return `${apiConfig.baseURL}/export/word/${clientId}`;
  },

  getExcelExportUrl(clientId: string): string {
    return `${apiConfig.baseURL}/export/excel/${clientId}`;
  }
};
