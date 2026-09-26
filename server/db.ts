import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel
  ? path.resolve('/tmp', 'data')
  : path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');
const BUNDLED_DB_FILE = path.resolve(__dirname, '../data/database.json');

// Ensure data folder exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create DATA_DIR:', e);
}

export interface UserAccountant {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // bcrypt hash - NEVER exposed to frontend
  licenseNumber: string; // Cédula Profesional
  firmName: string; // Despacho Contable
  collegeFolio: string; // Folio Colegio de Contadores
  phone: string;
  specialty: string;
  avatarUrl?: string;
  createdAt: string;
  lastLogin: string;
  preferences: {
    darkMode: boolean;
    autoAlerts: boolean;
    currency: string;
    fiscalCountry: string;
  };
}

export interface ClientProfile {
  id: string;
  accountantId: string;
  code: string;
  businessName: string; // Razón Social
  commercialName: string;
  rfc: string;
  taxRegime: string;
  personType: 'Persona Moral' | 'Persona Física';
  email: string;
  phone: string;
  address: string;
  status: 'Activo' | 'Suspendido' | 'En Auditoría';
  fiscalYear: number;
  currentPeriod: string;
  initialBankBalance: number;
  initialCapital: number;
  createdAt: string;
}

export interface PolizaEntry {
  id: string;
  accountCode: string;
  accountName: string;
  concept: string;
  debe: number; // Cargo
  haber: number; // Abono
}

export interface Poliza {
  id: string;
  clientId: string;
  number: string;
  date: string;
  type: 'Diario' | 'Ingreso' | 'Egreso' | 'Apertura';
  concept: string;
  entries: PolizaEntry[];
  totalDebe: number;
  totalHaber: number;
  isBalanced: boolean;
  notes?: string;
  createdAt: string;
}

export interface BankMovement {
  id: string;
  date: string;
  description: string;
  reference: string;
  type: 'deposito' | 'retiro';
  movementCategory:
    | 'Depósito del Cliente'
    | 'Entrada de Dinero / Venta'
    | 'Salida / Pago a Proveedor'
    | 'Pago de Deuda / Préstamo'
    | 'Gasto Fiscal / Operativo'
    | 'Nómina y Sueldos'
    | 'Pago de Impuestos SAT'
    | 'Aportación de Capital'
    | 'Retiro de Socio'
    | 'Otro';
  counterparty?: string;
  amount: number;
  balanceAfter: number;
  reconciled: boolean;
}

export interface BankAccount {
  id: string;
  clientId: string;
  bankName: string;
  accountNumber: string;
  clabe: string;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  movements: BankMovement[];
}

export interface CompanyPurchase {
  id: string;
  clientId: string;
  purchaseNumber: string;
  providerName: string;
  providerRfc: string;
  invoiceFolio: string;
  date: string;
  dueDate: string;
  category:
    | 'Materia Prima / Inventario'
    | 'Mercancías para Reventa'
    | 'Activo Fijo (Maquinaria / Equipo)'
    | 'Gasto Operativo'
    | 'Servicios Básicos (Luz, Internet, Renta)'
    | 'Honorarios Profesionales'
    | 'Combustible y Viáticos'
    | 'Otro';
  subtotal: number;
  ivaRate: number;
  ivaAmount: number;
  retentionIsr: number;
  retentionIva: number;
  total: number;
  paymentCondition: 'Contado' | 'Crédito';
  bankAccountId?: string;
  status: 'Pagada' | 'Por Pagar' | 'Cancelada';
  deductibility: '100% Deducible' | 'Parcialmente Deducible' | 'No Deducible';
  notes?: string;
  createdAt: string;
}

export interface DebtPayment {
  id: string;
  date: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  bankAccountId: string;
  reference: string;
  notes?: string;
}

export interface CompanyDebt {
  id: string;
  clientId: string;
  creditorName: string;
  debtType:
    | 'Proveedor a Crédito'
    | 'Préstamo Bancario'
    | 'Acreedor Diverso'
    | 'Obligación Fiscal (SAT/IMSS)'
    | 'Crédito Hipotecario / Arrendamiento';
  concept: string;
  totalAmount: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  remainingBalance: number;
  status: 'Vigente' | 'Liquidada' | 'Vencida';
  payments: DebtPayment[];
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  type: 'Emitida' | 'Recibida';
  uuid: string; // Folio Fiscal
  folio: string;
  partyRfc: string;
  partyName: string;
  date: string;
  dueDate: string;
  subtotal: number;
  taxIva: number;
  taxRetention: number;
  total: number;
  paymentMethod: 'PPD' | 'PUE';
  status: 'Vigente' | 'Cobrada' | 'Pagada' | 'Cancelada';
  category: string;
}

export interface TaxDeadline {
  id: string;
  clientId: string;
  title: string;
  description: string;
  type: 'SAT' | 'IMSS' | 'DIOT' | 'Bancario' | 'Nómina';
  dueDate: string;
  amount?: number;
  status: 'Pendiente' | 'Presentada' | 'Vencida';
  priority: 'Alta' | 'Media' | 'Baja';
}

export interface SpreadsheetData {
  clientId: string;
  title: string;
  cells: Record<string, { value: string; formula?: string; format?: string; bold?: boolean }>;
  updatedAt: string;
}

export interface SessionRecord {
  token: string;
  accountantId: string;
  activeClientId: string | null;
  activeTab: string;
  activeFilter?: string;
  createdAt: string;
  lastActivity: string;
}

export interface DatabaseSchema {
  users: UserAccountant[];
  sessions: SessionRecord[];
  clients: ClientProfile[];
  polizas: Poliza[];
  bankAccounts: BankAccount[];
  purchases: CompanyPurchase[];
  debts: CompanyDebt[];
  invoices: Invoice[];
  deadlines: TaxDeadline[];
  spreadsheets: Record<string, SpreadsheetData>;
}

// Initial clean schema without fake artificial money.
function getInitialData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync('contador2026', salt);

  const initialAccountant: UserAccountant = {
    id: 'acc_01',
    email: 'isaiasdejesusguzman53@gmail.com',
    name: 'C.P. Isaías de Jesús Guzmán',
    passwordHash: defaultHash,
    licenseNumber: 'CP-8492015-DGP',
    firmName: 'Guzmán & Asociados Contabilidad & Auditoría',
    collegeFolio: 'CCPM-2026-8842',
    phone: '+52 (55) 8492-3320',
    specialty: 'Contabilidad Corporativa & Auditoría Fiscal',
    avatarUrl: '/src/assets/images/avatar_accountant_1790392054567.jpg',
    createdAt: '2026-01-15T09:00:00.000Z',
    lastLogin: new Date().toISOString(),
    preferences: {
      darkMode: true,
      autoAlerts: true,
      currency: 'MXN',
      fiscalCountry: 'México (SAT)'
    }
  };

  // Client starting completely clean with $0.00 for the accountant to record from scratch
  const cleanClient: ClientProfile = {
    id: 'cli_01',
    accountantId: 'acc_01',
    code: 'CLI-001',
    businessName: 'Comercializadora Industrial Alfa S.A. de C.V.',
    commercialName: 'Grupo Alfa Contable',
    rfc: 'CIA240115KP8',
    taxRegime: '601 - General de Ley Personas Morales',
    personType: 'Persona Moral',
    email: 'administracion@grupoalfa.com.mx',
    phone: '+52 55 4190 2844',
    address: 'Av. Insurgentes Sur 1450, Piso 8, Benito Juárez, CDMX',
    status: 'Activo',
    fiscalYear: 2026,
    currentPeriod: 'Septiembre 2026',
    initialBankBalance: 0,
    initialCapital: 0,
    createdAt: new Date().toISOString()
  };

  const initialBankAccount: BankAccount = {
    id: 'bank_01',
    clientId: 'cli_01',
    bankName: 'BBVA Bancomer',
    accountNumber: '•••• 4920',
    clabe: '012180004920881923',
    currency: 'MXN',
    initialBalance: 0,
    currentBalance: 0,
    movements: []
  };

  // Standard fiscal calendar reminders for the accountant
  const deadlines: TaxDeadline[] = [
    {
      id: 'dl_01',
      clientId: 'cli_01',
      title: 'Declaración Pago Provisional Mensual ISR e IVA',
      description: 'Cálculo y entero mensual de impuestos sobre ingresos cobrados y deducciones del mes.',
      type: 'SAT',
      dueDate: '2026-10-17',
      status: 'Pendiente',
      priority: 'Alta'
    },
    {
      id: 'dl_02',
      clientId: 'cli_01',
      title: 'Declaración Informativa de Operaciones con Terceros (DIOT)',
      description: 'Desglose de actos y compras pagadas a proveedores para acreditamiento de IVA.',
      type: 'DIOT',
      dueDate: '2026-10-31',
      status: 'Pendiente',
      priority: 'Alta'
    },
    {
      id: 'dl_03',
      clientId: 'cli_01',
      title: 'Pago de Cuotas Obrero-Patronales IMSS (SIPARE)',
      description: 'Liquidación de cuotas de seguridad social y aportaciones al fondo de vivienda.',
      type: 'IMSS',
      dueDate: '2026-10-17',
      status: 'Pendiente',
      priority: 'Media'
    }
  ];

  const spreadsheets: Record<string, SpreadsheetData> = {
    cli_01: {
      clientId: 'cli_01',
      title: 'Papel de Trabajo - Conciliación Fiscal & Flujo de Caja Septiembre 2026',
      updatedAt: new Date().toISOString(),
      cells: {
        'A1': { value: 'CÉDULA DE AUDITORÍA & CONCILIACIÓN CONTABLE-FISCAL', bold: true },
        'A3': { value: 'Concepto / Rubro', bold: true },
        'B3': { value: 'Importe Contable ($)', bold: true },
        'C3': { value: 'Efecto Fiscal ($)', bold: true },
        'D3': { value: 'Notas de Auditoría', bold: true },
        'A4': { value: 'Ingresos Cobrados del Período' },
        'B4': { value: '0.00', format: 'currency' },
        'C4': { value: '0.00', format: 'currency' },
        'D4': { value: 'Registrado desde tesorería' },
        'A5': { value: 'Compras y Gastos Deducibles' },
        'B5': { value: '0.00', format: 'currency' },
        'C5': { value: '0.00', format: 'currency' },
        'D5': { value: 'Conforme a facturas y comprobantes' }
      }
    }
  };

  return {
    users: [initialAccountant],
    sessions: [],
    clients: [cleanClient],
    polizas: [],
    bankAccounts: [initialBankAccount],
    purchases: [],
    debts: [],
    invoices: [],
    deadlines,
    spreadsheets
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.purchases) parsed.purchases = [];
        if (!parsed.debts) parsed.debts = [];
        return parsed;
      } else if (isVercel && fs.existsSync(BUNDLED_DB_FILE)) {
        const raw = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.purchases) parsed.purchases = [];
        if (!parsed.debts) parsed.debts = [];
        this.save(parsed);
        return parsed;
      }
    } catch (err) {
      console.error('Error loading database file, initializing with fresh schema:', err);
    }
    const initial = getInitialData();
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const payload = JSON.stringify(dataToSave || this.data, null, 2);
      fs.writeFileSync(DB_FILE, payload, 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Auth & Users ---
  public findUserByEmail(email: string): UserAccountant | undefined {
    return this.data.users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  }

  public findUserById(id: string): UserAccountant | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: {
    email: string;
    name: string;
    passwordPlain: string;
    licenseNumber?: string;
    firmName?: string;
    phone?: string;
  }): { user: Omit<UserAccountant, 'passwordHash'>; token: string } {
    const existing = this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('Ya existe un contador registrado con este correo electrónico.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.passwordPlain, salt);

    const newUser: UserAccountant = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: userData.email.toLowerCase().trim(),
      name: userData.name.trim(),
      passwordHash,
      licenseNumber: userData.licenseNumber || 'CP-PENDIENTE',
      firmName: userData.firmName || 'Despacho Contable Independiente',
      collegeFolio: 'COL-' + Math.floor(1000 + Math.random() * 9000),
      phone: userData.phone || '+52 (55) 0000-0000',
      specialty: 'Contabilidad General & Fiscal',
      avatarUrl: '/src/assets/images/avatar_accountant_1790392054567.jpg',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: {
        darkMode: true,
        autoAlerts: true,
        currency: 'MXN',
        fiscalCountry: 'México'
      }
    };

    this.data.users.push(newUser);

    // Initial clean client for new accountant
    const firstClient: ClientProfile = {
      id: `cli_${Date.now()}`,
      accountantId: newUser.id,
      code: 'CLI-001',
      businessName: `${newUser.name.split(' ')[0]} Operaciones Comerciales S.A. de C.V.`,
      commercialName: 'Mi Empresa Cliente',
      rfc: 'EMC260101XY9',
      taxRegime: '601 - General de Ley Personas Morales',
      personType: 'Persona Moral',
      email: userData.email,
      phone: userData.phone || '+52 55 1234 5678',
      address: 'Paseo de la Reforma 405, CDMX',
      status: 'Activo',
      fiscalYear: 2026,
      currentPeriod: 'Septiembre 2026',
      initialBankBalance: 0,
      initialCapital: 0,
      createdAt: new Date().toISOString()
    };
    this.data.clients.push(firstClient);

    const initialBank: BankAccount = {
      id: `bank_${Date.now()}`,
      clientId: firstClient.id,
      bankName: 'BBVA Bancomer',
      accountNumber: '•••• 1024',
      clabe: '01218000' + Math.floor(1000000000 + Math.random() * 9000000000),
      currency: 'MXN',
      initialBalance: 0,
      currentBalance: 0,
      movements: []
    };
    this.data.bankAccounts.push(initialBank);

    const token = this.createSession(newUser.id, firstClient.id, 'dashboard');
    this.save();

    const { passwordHash: _, ...safeUser } = newUser;
    return { user: safeUser, token };
  }

  public verifyLogin(email: string, passwordPlain: string): { user: Omit<UserAccountant, 'passwordHash'>; token: string; session: SessionRecord } {
    const user = this.findUserByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas. Verifique su correo o regístrese.');
    }

    const isValid = bcrypt.compareSync(passwordPlain, user.passwordHash);
    if (!isValid) {
      throw new Error('Contraseña incorrecta. Por favor intente de nuevo.');
    }

    user.lastLogin = new Date().toISOString();

    const userClients = this.getClients(user.id);
    const lastClient = userClients.length > 0 ? userClients[0].id : null;

    const token = this.createSession(user.id, lastClient, 'dashboard');
    this.save();

    const { passwordHash: _, ...safeUser } = user;
    const session = this.getSession(token)!;
    return { user: safeUser, token, session };
  }

  // --- Sessions & State Persistence ---
  public createSession(accountantId: string, activeClientId: string | null, activeTab: string = 'dashboard'): string {
    const token = `csuite_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const session: SessionRecord = {
      token,
      accountantId,
      activeClientId,
      activeTab,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    this.data.sessions.push(session);
    this.save();
    return token;
  }

  public getSession(token: string): SessionRecord | undefined {
    return this.data.sessions.find(s => s.token === token);
  }

  public updateSessionState(token: string, updates: Partial<Pick<SessionRecord, 'activeClientId' | 'activeTab' | 'activeFilter'>>): SessionRecord {
    const session = this.getSession(token);
    if (!session) {
      throw new Error('Sesión no encontrada o expirada.');
    }
    if (updates.activeClientId !== undefined) session.activeClientId = updates.activeClientId;
    if (updates.activeTab !== undefined) session.activeTab = updates.activeTab;
    if (updates.activeFilter !== undefined) session.activeFilter = updates.activeFilter;
    session.lastActivity = new Date().toISOString();
    this.save();
    return session;
  }

  public removeSession(token: string) {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.save();
  }

  public updateUserProfile(userId: string, updates: Partial<Omit<UserAccountant, 'id' | 'email' | 'passwordHash'>>): Omit<UserAccountant, 'passwordHash'> {
    const user = this.findUserById(userId);
    if (!user) throw new Error('Usuario no encontrado.');

    if (updates.name) user.name = updates.name.trim();
    if (updates.licenseNumber) user.licenseNumber = updates.licenseNumber.trim();
    if (updates.firmName) user.firmName = updates.firmName.trim();
    if (updates.collegeFolio) user.collegeFolio = updates.collegeFolio.trim();
    if (updates.phone) user.phone = updates.phone.trim();
    if (updates.specialty) user.specialty = updates.specialty.trim();
    if (updates.preferences) user.preferences = { ...user.preferences, ...updates.preferences };

    this.save();
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  // --- Clients ---
  public getClients(accountantId: string): ClientProfile[] {
    return this.data.clients.filter(c => c.accountantId === accountantId);
  }

  public getClientById(clientId: string): ClientProfile | undefined {
    return this.data.clients.find(c => c.id === clientId);
  }

  public createClient(accountantId: string, clientData: Omit<ClientProfile, 'id' | 'accountantId' | 'createdAt'>): ClientProfile {
    const initialBankBal = Number(clientData.initialBankBalance) || 0;
    const initialCap = Number(clientData.initialCapital) || 0;

    const newClient: ClientProfile = {
      ...clientData,
      id: `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      accountantId,
      initialBankBalance: initialBankBal,
      initialCapital: initialCap,
      createdAt: new Date().toISOString()
    };
    this.data.clients.push(newClient);

    // Create an initial bank account with exactly the starting balance provided by the accountant (0.00 by default)
    const bankAccount: BankAccount = {
      id: `bank_${Date.now()}`,
      clientId: newClient.id,
      bankName: 'BBVA Bancomer',
      accountNumber: '•••• 1024',
      clabe: '01218000' + Math.floor(1000000000 + Math.random() * 9000000000),
      currency: 'MXN',
      initialBalance: initialBankBal,
      currentBalance: initialBankBal,
      movements: []
    };

    if (initialBankBal > 0) {
      bankAccount.movements.push({
        id: `bm_init_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: 'Saldo Inicial de Apertura de Cuenta',
        reference: 'APERTURA-001',
        type: 'deposito',
        movementCategory: 'Aportación de Capital',
        counterparty: newClient.businessName,
        amount: initialBankBal,
        balanceAfter: initialBankBal,
        reconciled: true
      });
    }
    this.data.bankAccounts.push(bankAccount);

    // If starting capital was entered, record an opening Poliza de Apertura
    if (initialCap > 0 || initialBankBal > 0) {
      const openAmount = initialCap > 0 ? initialCap : initialBankBal;
      this.data.polizas.push({
        id: `pol_open_${Date.now()}`,
        clientId: newClient.id,
        number: 'POL-APERTURA-001',
        date: new Date().toISOString().split('T')[0],
        type: 'Apertura',
        concept: 'Asiento de apertura - Capital social aportado y bancos',
        entries: [
          {
            id: 'e1',
            accountCode: '1102-01',
            accountName: 'Bancos Nacionales (BBVA)',
            concept: 'Depósito inicial de apertura',
            debe: openAmount,
            haber: 0
          },
          {
            id: 'e2',
            accountCode: '3101-01',
            accountName: 'Capital Social Aportado',
            concept: 'Aportación de los socios fundadores',
            debe: 0,
            haber: openAmount
          }
        ],
        totalDebe: openAmount,
        totalHaber: openAmount,
        isBalanced: true,
        notes: 'Póliza de apertura automática conforme a acta constitutiva',
        createdAt: new Date().toISOString()
      });
    }

    this.data.spreadsheets[newClient.id] = {
      clientId: newClient.id,
      title: `Papel de Trabajo - ${newClient.commercialName || newClient.businessName}`,
      updatedAt: new Date().toISOString(),
      cells: {
        'A1': { value: 'HOJA DE TRABAJO CONTABLE & AUDITORÍA', bold: true },
        'A3': { value: 'Cuenta / Partida', bold: true },
        'B3': { value: 'Saldo Inicial', bold: true },
        'C3': { value: 'Cargos', bold: true },
        'D3': { value: 'Abonos', bold: true },
        'E3': { value: 'Saldo Final', bold: true }
      }
    };

    this.save();
    return newClient;
  }

  public updateClient(clientId: string, updates: Partial<ClientProfile>): ClientProfile {
    const idx = this.data.clients.findIndex(c => c.id === clientId);
    if (idx === -1) throw new Error('Cliente no encontrado');
    this.data.clients[idx] = { ...this.data.clients[idx], ...updates };
    this.save();
    return this.data.clients[idx];
  }

  public deleteClient(clientId: string) {
    this.data.clients = this.data.clients.filter(c => c.id !== clientId);
    this.data.polizas = this.data.polizas.filter(p => p.clientId !== clientId);
    this.data.bankAccounts = this.data.bankAccounts.filter(b => b.clientId !== clientId);
    this.data.purchases = this.data.purchases.filter(p => p.clientId !== clientId);
    this.data.debts = this.data.debts.filter(d => d.clientId !== clientId);
    this.data.invoices = this.data.invoices.filter(i => i.clientId !== clientId);
    this.data.deadlines = this.data.deadlines.filter(d => d.clientId !== clientId);
    delete this.data.spreadsheets[clientId];
    this.save();
  }

  // --- Reset Client Data to Clean Zero ($0.00) ---
  public resetClientData(clientId: string) {
    const client = this.getClientById(clientId);
    if (!client) throw new Error('Cliente no encontrado');

    client.initialBankBalance = 0;
    client.initialCapital = 0;

    this.data.polizas = this.data.polizas.filter(p => p.clientId !== clientId);
    this.data.purchases = this.data.purchases.filter(p => p.clientId !== clientId);
    this.data.debts = this.data.debts.filter(d => d.clientId !== clientId);
    this.data.invoices = this.data.invoices.filter(i => i.clientId !== clientId);

    // Reset bank accounts to 0.00
    this.data.bankAccounts.forEach(b => {
      if (b.clientId === clientId) {
        b.initialBalance = 0;
        b.currentBalance = 0;
        b.movements = [];
      }
    });

    this.save();
    return { success: true, message: 'Contabilidad del cliente reiniciada a $0.00 con éxito.' };
  }

  // --- Polizas / Asientos Contables ---
  public getPolizas(clientId: string): Poliza[] {
    return this.data.polizas.filter(p => p.clientId === clientId);
  }

  public createPoliza(clientId: string, polizaData: Omit<Poliza, 'id' | 'clientId' | 'createdAt' | 'totalDebe' | 'totalHaber' | 'isBalanced'>): Poliza {
    const totalDebe = polizaData.entries.reduce((sum, e) => sum + (Number(e.debe) || 0), 0);
    const totalHaber = polizaData.entries.reduce((sum, e) => sum + (Number(e.haber) || 0), 0);
    const diff = Math.abs(totalDebe - totalHaber);
    const isBalanced = diff < 0.01;

    if (!isBalanced) {
      throw new Error(`Principio de partida doble desbalanceado: Total Cargos ($${totalDebe.toFixed(2)}) != Total Abonos ($${totalHaber.toFixed(2)}). Diferencia: $${diff.toFixed(2)}`);
    }

    const newPoliza: Poliza = {
      ...polizaData,
      id: `pol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      clientId,
      totalDebe,
      totalHaber,
      isBalanced: true,
      createdAt: new Date().toISOString()
    };

    this.data.polizas.unshift(newPoliza);
    this.save();
    return newPoliza;
  }

  public deletePoliza(polizaId: string) {
    this.data.polizas = this.data.polizas.filter(p => p.id !== polizaId);
    this.save();
  }

  // --- Bank Accounts & Movements (Entradas, Salidas y Depósitos) ---
  public getBankAccounts(clientId: string): BankAccount[] {
    return this.data.bankAccounts.filter(b => b.clientId === clientId);
  }

  public createBankAccount(clientId: string, accountData: Omit<BankAccount, 'id' | 'clientId' | 'currentBalance' | 'movements'>): BankAccount {
    const initBal = Number(accountData.initialBalance) || 0;
    const newAccount: BankAccount = {
      ...accountData,
      id: `bank_${Date.now()}`,
      clientId,
      initialBalance: initBal,
      currentBalance: initBal,
      movements: []
    };

    if (initBal > 0) {
      newAccount.movements.push({
        id: `bm_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: 'Saldo Inicial de Apertura',
        reference: 'APERTURA',
        type: 'deposito',
        movementCategory: 'Depósito del Cliente',
        amount: initBal,
        balanceAfter: initBal,
        reconciled: true
      });
    }

    this.data.bankAccounts.push(newAccount);
    this.save();
    return newAccount;
  }

  public addBankMovement(
    accountId: string,
    movement: {
      date: string;
      description: string;
      reference: string;
      type: 'deposito' | 'retiro';
      movementCategory?: BankMovement['movementCategory'];
      counterparty?: string;
      amount: number;
      reconciled?: boolean;
    }
  ) {
    const account = this.data.bankAccounts.find(b => b.id === accountId);
    if (!account) throw new Error('Cuenta bancaria no encontrada');

    const amount = Number(movement.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('El importe debe ser un número positivo.');
    }

    const newBalance = movement.type === 'deposito' ? account.currentBalance + amount : account.currentBalance - amount;
    account.currentBalance = newBalance;

    const cat: BankMovement['movementCategory'] =
      movement.movementCategory || (movement.type === 'deposito' ? 'Depósito del Cliente' : 'Salida / Pago a Proveedor');

    const newMov: BankMovement = {
      id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: movement.date || new Date().toISOString().split('T')[0],
      description: movement.description,
      reference: movement.reference || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
      type: movement.type,
      movementCategory: cat,
      counterparty: movement.counterparty || '',
      amount,
      balanceAfter: newBalance,
      reconciled: movement.reconciled ?? false
    };

    account.movements.unshift(newMov);

    // Automatically create a corresponding balanced Poliza (Ingreso o Egreso) so accounting books stay unified
    const polType = movement.type === 'deposito' ? 'Ingreso' : 'Egreso';
    const bankAccountCode = '1102-01';
    const contraAccountCode = movement.type === 'deposito' ? '1105-01' : '2101-01';
    const contraAccountName = movement.type === 'deposito' ? 'Clientes / Cobros por Depositar' : 'Proveedores / Gastos Operativos';

    const entries: PolizaEntry[] = movement.type === 'deposito'
      ? [
          {
            id: 'e1',
            accountCode: bankAccountCode,
            accountName: `${account.bankName} (${account.accountNumber})`,
            concept: movement.description,
            debe: amount,
            haber: 0
          },
          {
            id: 'e2',
            accountCode: contraAccountCode,
            accountName: contraAccountName,
            concept: movement.description,
            debe: 0,
            haber: amount
          }
        ]
      : [
          {
            id: 'e1',
            accountCode: contraAccountCode,
            accountName: contraAccountName,
            concept: movement.description,
            debe: amount,
            haber: 0
          },
          {
            id: 'e2',
            accountCode: bankAccountCode,
            accountName: `${account.bankName} (${account.accountNumber})`,
            concept: movement.description,
            debe: 0,
            haber: amount
          }
        ];

    this.data.polizas.unshift({
      id: `pol_mov_${Date.now()}`,
      clientId: account.clientId,
      number: `POL-${movement.type === 'deposito' ? 'ING' : 'EGR'}-${Date.now().toString().slice(-4)}`,
      date: movement.date,
      type: polType,
      concept: `${cat}: ${movement.description}`,
      entries,
      totalDebe: amount,
      totalHaber: amount,
      isBalanced: true,
      notes: `Generada automáticamente desde tesorería. Ref: ${newMov.reference}`,
      createdAt: new Date().toISOString()
    });

    this.save();
    return newMov;
  }

  public toggleReconciliation(accountId: string, movementId: string): boolean {
    const account = this.data.bankAccounts.find(b => b.id === accountId);
    if (!account) throw new Error('Cuenta bancaria no encontrada');
    const mov = account.movements.find(m => m.id === movementId);
    if (!mov) throw new Error('Movimiento no encontrado');
    mov.reconciled = !mov.reconciled;
    this.save();
    return mov.reconciled;
  }

  // --- Compras de la Empresa (Purchases) ---
  public getPurchases(clientId: string): CompanyPurchase[] {
    return this.data.purchases.filter(p => p.clientId === clientId);
  }

  public createPurchase(clientId: string, purchaseData: Omit<CompanyPurchase, 'id' | 'clientId' | 'createdAt' | 'purchaseNumber'>): CompanyPurchase {
    const sub = Number(purchaseData.subtotal) || 0;
    const rate = Number(purchaseData.ivaRate) !== undefined ? Number(purchaseData.ivaRate) : 0.16;
    const iva = Number(purchaseData.ivaAmount) !== undefined ? Number(purchaseData.ivaAmount) : sub * rate;
    const retIsr = Number(purchaseData.retentionIsr) || 0;
    const retIva = Number(purchaseData.retentionIva) || 0;
    const total = sub + iva - retIsr - retIva;

    const count = this.getPurchases(clientId).length + 1;
    const purchaseNumber = `CMP-${String(count).padStart(4, '0')}`;

    const newPurchase: CompanyPurchase = {
      ...purchaseData,
      id: `pur_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      clientId,
      purchaseNumber,
      subtotal: sub,
      ivaRate: rate,
      ivaAmount: iva,
      retentionIsr: retIsr,
      retentionIva: retIva,
      total,
      status: purchaseData.paymentCondition === 'Contado' ? 'Pagada' : 'Por Pagar',
      createdAt: new Date().toISOString()
    };

    this.data.purchases.unshift(newPurchase);

    // If purchase was paid immediately (Contado), apply withdrawal to the chosen bank account
    if (newPurchase.paymentCondition === 'Contado' && newPurchase.bankAccountId) {
      const bank = this.data.bankAccounts.find(b => b.id === newPurchase.bankAccountId);
      if (bank) {
        bank.currentBalance -= total;
        bank.movements.unshift({
          id: `bm_pur_${Date.now()}`,
          date: newPurchase.date,
          description: `Pago compra ${newPurchase.purchaseNumber} - ${newPurchase.providerName}`,
          reference: newPurchase.invoiceFolio || newPurchase.purchaseNumber,
          type: 'retiro',
          movementCategory: 'Salida / Pago a Proveedor',
          counterparty: newPurchase.providerName,
          amount: total,
          balanceAfter: bank.currentBalance,
          reconciled: true
        });
      }
    } else if (newPurchase.paymentCondition === 'Crédito') {
      // If purchase was on credit, automatically create a CompanyDebt record under 'Proveedor a Crédito'
      const newDebt: CompanyDebt = {
        id: `debt_pur_${Date.now()}`,
        clientId,
        creditorName: newPurchase.providerName,
        debtType: 'Proveedor a Crédito',
        concept: `Compra ${newPurchase.purchaseNumber} - Folio Factura: ${newPurchase.invoiceFolio || 'S/N'} (${newPurchase.category})`,
        totalAmount: total,
        interestRate: 0,
        startDate: newPurchase.date,
        dueDate: newPurchase.dueDate || newPurchase.date,
        remainingBalance: total,
        status: 'Vigente',
        payments: [],
        createdAt: new Date().toISOString()
      };
      this.data.debts.unshift(newDebt);
    }

    // Register Poliza de Compra (Partida doble)
    const costAccountCode = newPurchase.category.includes('Activo Fijo')
      ? '1201-01'
      : newPurchase.category.includes('Materia Prima') || newPurchase.category.includes('Mercancías')
      ? '1150-01'
      : '6101-05';
    const costAccountName = newPurchase.category.includes('Activo Fijo')
      ? 'Maquinaria y Equipo (Activo Fijo)'
      : newPurchase.category.includes('Materia Prima') || newPurchase.category.includes('Mercancías')
      ? 'Inventarios de Mercancías'
      : `Gastos de Operación (${newPurchase.category})`;

    const creditAccountCode = newPurchase.paymentCondition === 'Contado' ? '1102-01' : '2101-01';
    const creditAccountName = newPurchase.paymentCondition === 'Contado' ? 'Bancos Nacionales' : 'Proveedores Nacionales';

    const entries: PolizaEntry[] = [
      {
        id: 'pe_sub',
        accountCode: costAccountCode,
        accountName: costAccountName,
        concept: `Subtotal compra ${newPurchase.purchaseNumber}`,
        debe: sub,
        haber: 0
      }
    ];

    if (iva > 0) {
      entries.push({
        id: 'pe_iva',
        accountCode: newPurchase.paymentCondition === 'Contado' ? '1109-01' : '1109-02',
        accountName: newPurchase.paymentCondition === 'Contado' ? 'IVA Acreditable Pagado' : 'IVA por Acreditar',
        concept: `IVA de compra ${newPurchase.purchaseNumber}`,
        debe: iva,
        haber: 0
      });
    }

    if (retIsr > 0) {
      entries.push({
        id: 'pe_ret_isr',
        accountCode: '2103-01',
        accountName: 'Retenciones de ISR por Enterar',
        concept: `Retención ISR proveedor`,
        debe: 0,
        haber: retIsr
      });
    }

    if (retIva > 0) {
      entries.push({
        id: 'pe_ret_iva',
        accountCode: '2103-02',
        accountName: 'Retenciones de IVA por Enterar',
        concept: `Retención IVA proveedor`,
        debe: 0,
        haber: retIva
      });
    }

    entries.push({
      id: 'pe_contra',
      accountCode: creditAccountCode,
      accountName: creditAccountName,
      concept: `Liquidación / Provisión compra ${newPurchase.purchaseNumber}`,
      debe: 0,
      haber: total
    });

    this.data.polizas.unshift({
      id: `pol_pur_${Date.now()}`,
      clientId,
      number: `POL-CMP-${Date.now().toString().slice(-4)}`,
      date: newPurchase.date,
      type: newPurchase.paymentCondition === 'Contado' ? 'Egreso' : 'Diario',
      concept: `Compra ${newPurchase.purchaseNumber}: ${newPurchase.providerName} (${newPurchase.category})`,
      entries,
      totalDebe: sub + iva,
      totalHaber: total + retIsr + retIva,
      isBalanced: true,
      notes: `Factura: ${newPurchase.invoiceFolio || 'S/N'} · Deducibilidad: ${newPurchase.deductibility}`,
      createdAt: new Date().toISOString()
    });

    this.save();
    return newPurchase;
  }

  public deletePurchase(purchaseId: string) {
    this.data.purchases = this.data.purchases.filter(p => p.id !== purchaseId);
    this.save();
  }

  // --- Deudas y Pasivos de la Empresa (Debts & Loans) ---
  public getDebts(clientId: string): CompanyDebt[] {
    return this.data.debts.filter(d => d.clientId === clientId);
  }

  public createDebt(clientId: string, debtData: Omit<CompanyDebt, 'id' | 'clientId' | 'createdAt' | 'payments' | 'remainingBalance' | 'status'>): CompanyDebt {
    const totalAmount = Number(debtData.totalAmount) || 0;
    const newDebt: CompanyDebt = {
      ...debtData,
      id: `debt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      clientId,
      totalAmount,
      remainingBalance: totalAmount,
      status: 'Vigente',
      payments: [],
      createdAt: new Date().toISOString()
    };

    this.data.debts.unshift(newDebt);

    // If it is a bank loan (Préstamo Bancario), register cash inflow into bank account
    if (newDebt.debtType === 'Préstamo Bancario') {
      const bank = this.data.bankAccounts.find(b => b.clientId === clientId);
      if (bank) {
        bank.currentBalance += totalAmount;
        bank.movements.unshift({
          id: `bm_loan_${Date.now()}`,
          date: newDebt.startDate,
          description: `Disposición de Préstamo Bancario: ${newDebt.creditorName}`,
          reference: `PRESTAMO-${Date.now().toString().slice(-4)}`,
          type: 'deposito',
          movementCategory: 'Entrada de Dinero / Venta',
          counterparty: newDebt.creditorName,
          amount: totalAmount,
          balanceAfter: bank.currentBalance,
          reconciled: true
        });
      }
    }

    this.save();
    return newDebt;
  }

  public addDebtPayment(
    debtId: string,
    payment: {
      date: string;
      amount: number;
      principalAmount?: number;
      interestAmount?: number;
      bankAccountId?: string;
      reference?: string;
      notes?: string;
    }
  ) {
    const debt = this.data.debts.find(d => d.id === debtId);
    if (!debt) throw new Error('Deuda o pasivo no encontrado');

    const totalPaid = Number(payment.amount) || 0;
    const principal = Number(payment.principalAmount) !== undefined && Number(payment.principalAmount) > 0
      ? Number(payment.principalAmount)
      : totalPaid;
    const interest = Number(payment.interestAmount) || Math.max(0, totalPaid - principal);

    debt.remainingBalance = Math.max(0, debt.remainingBalance - principal);
    if (debt.remainingBalance <= 0.01) {
      debt.status = 'Liquidada';
    }

    const newPayment: DebtPayment = {
      id: `pay_${Date.now()}`,
      date: payment.date || new Date().toISOString().split('T')[0],
      amount: totalPaid,
      principalAmount: principal,
      interestAmount: interest,
      bankAccountId: payment.bankAccountId || '',
      reference: payment.reference || `ABONO-${Date.now().toString().slice(-4)}`,
      notes: payment.notes
    };
    debt.payments.unshift(newPayment);

    // Deduct from bank account if specified
    if (payment.bankAccountId) {
      const bank = this.data.bankAccounts.find(b => b.id === payment.bankAccountId);
      if (bank) {
        bank.currentBalance -= totalPaid;
        bank.movements.unshift({
          id: `bm_pay_${Date.now()}`,
          date: newPayment.date,
          description: `Abono a Pasivo: ${debt.creditorName} (${debt.concept})`,
          reference: newPayment.reference,
          type: 'retiro',
          movementCategory: 'Pago de Deuda / Préstamo',
          counterparty: debt.creditorName,
          amount: totalPaid,
          balanceAfter: bank.currentBalance,
          reconciled: true
        });
      }
    }

    this.save();
    return newPayment;
  }

  public deleteDebt(debtId: string) {
    this.data.debts = this.data.debts.filter(d => d.id !== debtId);
    this.save();
  }

  // --- Invoices / CFDIs ---
  public getInvoices(clientId: string): Invoice[] {
    return this.data.invoices.filter(i => i.clientId === clientId);
  }

  public createInvoice(clientId: string, invoiceData: Omit<Invoice, 'id' | 'clientId' | 'uuid'>): Invoice {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
    const simulatedUUID = `${s4()}${s4()}-${s4()}-4${s4().substr(0, 3)}-${s4()}-${s4()}${s4()}${s4()}`;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv_${Date.now()}`,
      clientId,
      uuid: simulatedUUID
    };

    this.data.invoices.unshift(newInvoice);

    // When invoice is created and payment is PUE (contado), automatically register deposit movement
    if (newInvoice.type === 'Emitida' && newInvoice.paymentMethod === 'PUE') {
      const bank = this.data.bankAccounts.find(b => b.clientId === clientId);
      if (bank) {
        bank.currentBalance += newInvoice.total;
        bank.movements.unshift({
          id: `bm_inv_${Date.now()}`,
          date: newInvoice.date,
          description: `Cobro de Factura ${newInvoice.folio} - ${newInvoice.partyName}`,
          reference: newInvoice.folio,
          type: 'deposito',
          movementCategory: 'Entrada de Dinero / Venta',
          counterparty: newInvoice.partyName,
          amount: newInvoice.total,
          balanceAfter: bank.currentBalance,
          reconciled: true
        });
        newInvoice.status = 'Cobrada';
      }
    }

    this.save();
    return newInvoice;
  }

  public updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Invoice {
    const inv = this.data.invoices.find(i => i.id === invoiceId);
    if (!inv) throw new Error('Factura no encontrada');
    inv.status = status;
    this.save();
    return inv;
  }

  // --- Tax Deadlines & Alerts ---
  public getDeadlines(clientId?: string): TaxDeadline[] {
    if (clientId) {
      return this.data.deadlines.filter(d => d.clientId === clientId);
    }
    return this.data.deadlines;
  }

  public createDeadline(clientId: string, deadlineData: Omit<TaxDeadline, 'id' | 'clientId'>): TaxDeadline {
    const newDeadline: TaxDeadline = {
      ...deadlineData,
      id: `dl_${Date.now()}`,
      clientId
    };
    this.data.deadlines.push(newDeadline);
    this.save();
    return newDeadline;
  }

  public updateDeadlineStatus(deadlineId: string, status: TaxDeadline['status']): TaxDeadline {
    const dl = this.data.deadlines.find(d => d.id === deadlineId);
    if (!dl) throw new Error('Vencimiento no encontrado');
    dl.status = status;
    this.save();
    return dl;
  }

  // --- Spreadsheets ---
  public getSpreadsheet(clientId: string): SpreadsheetData {
    if (!this.data.spreadsheets[clientId]) {
      const client = this.getClientById(clientId);
      this.data.spreadsheets[clientId] = {
        clientId,
        title: `Papel de Trabajo - ${client?.commercialName || 'Contabilidad'}`,
        updatedAt: new Date().toISOString(),
        cells: {
          'A1': { value: 'HOJA DE CÁLCULO CONTABLE & AUDITORÍA', bold: true },
          'A3': { value: 'Partida / Subcuenta', bold: true },
          'B3': { value: 'Importe ($)', bold: true },
          'C3': { value: 'Tasa %', bold: true },
          'D3': { value: 'Resultado ($)', bold: true }
        }
      };
      this.save();
    }
    return this.data.spreadsheets[clientId];
  }

  public saveSpreadsheet(clientId: string, spreadsheetData: Partial<SpreadsheetData>): SpreadsheetData {
    const current = this.getSpreadsheet(clientId);
    this.data.spreadsheets[clientId] = {
      ...current,
      ...spreadsheetData,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.spreadsheets[clientId];
  }

  // --- REAL FINANCIAL STATEMENTS COMPUTATION ---
  // Purely computed from what the accountant registers. No fake numbers or mock constants!
  public getFinancialStatements(clientId: string) {
    const client = this.getClientById(clientId);
    const polizas = this.getPolizas(clientId);
    const bankAccounts = this.getBankAccounts(clientId);
    const invoices = this.getInvoices(clientId);
    const purchases = this.getPurchases(clientId);
    const debts = this.getDebts(clientId);

    // 1. Activo Circulante
    // Total cash in banks
    const totalCashAndBanks = bankAccounts.reduce((sum, b) => sum + b.currentBalance, 0);

    // Total Accounts Receivable (Facturas Emitidas vigentes no cobradas)
    const totalAccountsReceivable = invoices
      .filter(i => i.type === 'Emitida' && i.status === 'Vigente')
      .reduce((sum, i) => sum + i.total, 0);

    // Inventarios (Compras de materia prima o inventario registradas)
    const inventory = purchases
      .filter(p => p.category === 'Materia Prima / Inventario' || p.category === 'Mercancías para Reventa')
      .reduce((sum, p) => sum + p.subtotal, 0);

    // 2. Activo No Circulante (Fijo)
    const fixedAssets = purchases
      .filter(p => p.category === 'Activo Fijo (Maquinaria / Equipo)')
      .reduce((sum, p) => sum + p.subtotal, 0);

    const accumulatedDepreciation = 0; // Se calcula a partir de cédula de depreciación

    const currentAssets = totalCashAndBanks + totalAccountsReceivable + inventory;
    const nonCurrentAssets = fixedAssets + accumulatedDepreciation;
    const totalAssets = currentAssets + nonCurrentAssets;

    // 3. Pasivo a Corto y Largo Plazo
    // Proveedores por pagar (compras a crédito por pagar + facturas recibidas vigentes)
    const totalAccountsPayable = purchases
      .filter(p => p.paymentCondition === 'Crédito' && p.status === 'Por Pagar')
      .reduce((sum, p) => sum + p.total, 0) +
      invoices
        .filter(i => i.type === 'Recibida' && i.status === 'Vigente')
        .reduce((sum, i) => sum + i.total, 0);

    // Deudas a corto plazo (vencimiento <= 1 año o acreedores)
    const shortTermDebts = debts
      .filter(d => d.status === 'Vigente' && (d.debtType === 'Proveedor a Crédito' || d.debtType === 'Acreedor Diverso' || d.debtType === 'Obligación Fiscal (SAT/IMSS)'))
      .reduce((sum, d) => sum + d.remainingBalance, 0);

    // Deudas a largo plazo (préstamos bancarios, hipotecas)
    const longTermDebts = debts
      .filter(d => d.status === 'Vigente' && (d.debtType === 'Préstamo Bancario' || d.debtType === 'Crédito Hipotecario / Arrendamiento'))
      .reduce((sum, d) => sum + d.remainingBalance, 0);

    // 4. Fiscal Computations (IVA e ISR)
    // IVA Trasladado (Cobrado en ventas y cobros)
    const ivaFromInvoices = invoices
      .filter(i => i.type === 'Emitida' && i.status !== 'Cancelada')
      .reduce((sum, i) => sum + i.taxIva, 0);

    // IVA Acreditable (Pagado en compras deducibles)
    const ivaFromPurchases = purchases
      .filter(p => p.deductibility !== 'No Deducible' && p.status !== 'Cancelada')
      .reduce((sum, p) => sum + p.ivaAmount, 0);

    const ivaACargo = Math.max(0, ivaFromInvoices - ivaFromPurchases);
    const ivaAFavor = Math.max(0, ivaFromPurchases - ivaFromInvoices);

    const retencionesIsr = purchases.reduce((sum, p) => sum + (p.retentionIsr || 0), 0);
    const retencionesIva = purchases.reduce((sum, p) => sum + (p.retentionIva || 0), 0);

    const taxesPayable = ivaACargo + retencionesIsr + retencionesIva;

    const currentLiabilities = totalAccountsPayable + shortTermDebts + taxesPayable;
    const nonCurrentLiabilities = longTermDebts;
    const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

    // 5. Estado de Resultados (Ingresos, Costos y Gastos)
    // Total revenues: Invoices emitidas + bank deposits classified as sales/income
    const salesFromInvoices = invoices
      .filter(i => i.type === 'Emitida' && i.status !== 'Cancelada')
      .reduce((sum, i) => sum + i.subtotal, 0);

    const salesFromDeposits = bankAccounts.flatMap(b => b.movements)
      .filter(m => m.type === 'deposito' && (m.movementCategory === 'Entrada de Dinero / Venta' || m.movementCategory === 'Depósito del Cliente'))
      .reduce((sum, m) => sum + m.amount, 0);

    // Avoid double counting if invoice was already paid into bank
    const totalSales = Math.max(salesFromInvoices, salesFromDeposits);

    // Cost of sales: Materia prima y mercancías compradas
    const totalCostOfSales = purchases
      .filter(p => (p.category === 'Materia Prima / Inventario' || p.category === 'Mercancías para Reventa') && p.status !== 'Cancelada')
      .reduce((sum, p) => sum + p.subtotal, 0);

    const grossProfit = totalSales - totalCostOfSales;

    // Operating expenses: Gastos operativos, servicios, honorarios, nómina de compras o polizas
    const expensesFromPurchases = purchases
      .filter(p => p.category !== 'Materia Prima / Inventario' && p.category !== 'Mercancías para Reventa' && p.category !== 'Activo Fijo (Maquinaria / Equipo)' && p.status !== 'Cancelada')
      .reduce((sum, p) => sum + p.subtotal, 0);

    const expensesFromPolizas = polizas
      .filter(p => p.type === 'Diario' || p.type === 'Egreso')
      .flatMap(p => p.entries)
      .filter(e => e.accountCode.startsWith('61') || e.accountCode.startsWith('62'))
      .reduce((sum, e) => sum + (e.debe || 0), 0);

    const operatingExpenses = Math.max(expensesFromPurchases, expensesFromPolizas);
    const operatingIncome = grossProfit - operatingExpenses;

    // Financial expenses (intereses pagados en deudas)
    const financialExpenses = debts.flatMap(d => d.payments).reduce((sum, p) => sum + (p.interestAmount || 0), 0);
    const profitBeforeTax = operatingIncome - financialExpenses;

    // Determinación del ISR Provisional
    const isResico = client?.taxRegime.includes('RESICO') || false;
    const isrRate = isResico ? 0.02 : 0.30;
    const baseGravableIsr = Math.max(0, profitBeforeTax);
    const estimatedTax = baseGravableIsr > 0 ? baseGravableIsr * isrRate : 0;

    const netIncome = profitBeforeTax - estimatedTax;

    // 6. Capital Contable
    const initialCapital = client?.initialCapital || 0;
    // Si no hay capital inicial explícito pero hay activos netos, se equilibra con la ecuación contable
    const retainedEarnings = 0;
    const calculatedCapital = initialCapital > 0 ? initialCapital : Math.max(0, totalAssets - totalLiabilities - netIncome);
    const totalEquity = calculatedCapital + retainedEarnings + netIncome;

    const fiscalSummary = {
      ivaTrasladado: ivaFromInvoices,
      ivaAcreditable: ivaFromPurchases,
      ivaACargo,
      ivaAFavor,
      retencionesIsr,
      retencionesIva,
      gastosDeducibles: purchases.filter(p => p.deductibility === '100% Deducible').reduce((s, p) => s + p.subtotal, 0),
      gastosNoDeducibles: purchases.filter(p => p.deductibility === 'No Deducible').reduce((s, p) => s + p.subtotal, 0),
      ingresosAcumulables: totalSales,
      baseGravableIsr,
      isrProvisionalEstimado: estimatedTax
    };

    return {
      balanceGeneral: {
        activos: {
          circulante: [
            { code: '1101-1102', name: 'Efectivo en Caja y Cuentas Bancarias', amount: totalCashAndBanks },
            { code: '1105', name: 'Cuentas por Cobrar a Clientes', amount: totalAccountsReceivable },
            { code: '1150', name: 'Inventarios de Mercancías y Materiales', amount: inventory }
          ],
          totalCirculante: currentAssets,
          noCirculante: [
            { code: '1201', name: 'Activo Fijo, Maquinaria y Equipo', amount: fixedAssets },
            { code: '1250', name: 'Depreciación Acumulada de Activos Fijos', amount: accumulatedDepreciation }
          ],
          totalNoCirculante: nonCurrentAssets,
          totalActivo: totalAssets
        },
        pasivos: {
          cortoPlazo: [
            { code: '2101', name: 'Proveedores Nacionales & Compras a Crédito', amount: totalAccountsPayable },
            { code: '2102', name: 'Acreedores y Deudas a Corto Plazo', amount: shortTermDebts },
            { code: '2103', name: 'Impuestos Fiscales por Enterar (SAT)', amount: taxesPayable }
          ],
          totalCortoPlazo: currentLiabilities,
          largoPlazo: [
            { code: '2201', name: 'Préstamos Bancarios y Créditos a Largo Plazo', amount: nonCurrentLiabilities }
          ],
          totalLargoPlazo: nonCurrentLiabilities,
          totalPasivo: totalLiabilities
        },
        capital: {
          rubros: [
            { code: '3101', name: 'Capital Social Aportado', amount: calculatedCapital },
            { code: '3201', name: 'Utilidades / Pérdidas de Ejercicios Anteriores', amount: retainedEarnings },
            { code: '3301', name: 'Resultado del Ejercicio Actual (Utilidad / Pérdida)', amount: netIncome }
          ],
          totalCapital: totalEquity
        },
        totalPasivoYCapital: totalLiabilities + totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1
      },
      estadoResultados: {
        ingresosNetos: totalSales,
        costoVentas: totalCostOfSales,
        utilidadBruta: grossProfit,
        margenBrutoPct: totalSales > 0 ? (grossProfit / totalSales) * 100 : 0,
        gastosOperacion: operatingExpenses,
        utilidadOperativa: operatingIncome,
        margenOperativoPct: totalSales > 0 ? (operatingIncome / totalSales) * 100 : 0,
        gastosFinancieros: financialExpenses,
        utilidadAntesImpuestos: profitBeforeTax,
        impuestosEstimados: estimatedTax,
        utilidadNeta: netIncome,
        margenNetoPct: totalSales > 0 ? (netIncome / totalSales) * 100 : 0
      },
      fiscal: fiscalSummary,
      kpis: {
        liquidezInmediata: currentLiabilities > 0 ? (currentAssets / currentLiabilities).toFixed(2) : '1.00',
        capitalTrabajo: currentAssets - currentLiabilities,
        rotacionCarteraDias: totalSales > 0 ? Math.round((totalAccountsReceivable / totalSales) * 30) : 0,
        deudaPatrimonioRatio: totalEquity > 0 ? (totalLiabilities / totalEquity).toFixed(2) : '0.00',
        totalPolizas: polizas.length,
        totalFacturas: invoices.length,
        totalCompras: purchases.length,
        totalDeudas: debts.length,
        vencimientosPendientes: this.getDeadlines(clientId).filter(d => d.status === 'Pendiente').length
      }
    };
  }
}

export const db = new Database();
