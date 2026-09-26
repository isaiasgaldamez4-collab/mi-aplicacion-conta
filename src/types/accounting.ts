export interface UserAccountant {
  id: string;
  email: string;
  name: string;
  licenseNumber: string;
  firmName: string;
  collegeFolio: string;
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
  businessName: string;
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
  debe: number;
  haber: number;
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
  ivaRate: number; // 0.16, 0.08, 0
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
  interestRate: number; // Annual percentage
  startDate: string;
  dueDate: string;
  remainingBalance: number;
  status: 'Vigente' | 'Liquidada' | 'Vencida';
  payments: DebtPayment[];
  createdAt: string;
}

export interface FiscalTaxSummary {
  ivaTrasladado: number; // Cobrado en ventas
  ivaAcreditable: number; // Pagado en compras deducibles
  ivaACargo: number; // Si trasladado > acreditable
  ivaAFavor: number; // Si acreditable > trasladado
  retencionesIsr: number;
  retencionesIva: number;
  gastosDeducibles: number;
  gastosNoDeducibles: number;
  ingresosAcumulables: number;
  baseGravableIsr: number;
  isrProvisionalEstimado: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  type: 'Emitida' | 'Recibida';
  uuid: string;
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

export interface SpreadsheetCell {
  value: string;
  formula?: string;
  format?: 'currency' | 'number' | 'text' | 'percent';
  bold?: boolean;
}

export interface SpreadsheetData {
  clientId: string;
  title: string;
  cells: Record<string, SpreadsheetCell>;
  updatedAt: string;
}

export interface FinancialStatements {
  balanceGeneral: {
    activos: {
      circulante: { code: string; name: string; amount: number }[];
      totalCirculante: number;
      noCirculante: { code: string; name: string; amount: number }[];
      totalNoCirculante: number;
      totalActivo: number;
    };
    pasivos: {
      cortoPlazo: { code: string; name: string; amount: number }[];
      totalCortoPlazo: number;
      largoPlazo: { code: string; name: string; amount: number }[];
      totalLargoPlazo: number;
      totalPasivo: number;
    };
    capital: {
      rubros: { code: string; name: string; amount: number }[];
      totalCapital: number;
    };
    totalPasivoYCapital: number;
    isBalanced: boolean;
  };
  estadoResultados: {
    ingresosNetos: number;
    costoVentas: number;
    utilidadBruta: number;
    margenBrutoPct: number;
    gastosOperacion: number;
    utilidadOperativa: number;
    margenOperativoPct: number;
    gastosFinancieros: number;
    utilidadAntesImpuestos: number;
    impuestosEstimados: number;
    utilidadNeta: number;
    margenNetoPct: number;
  };
  fiscal: FiscalTaxSummary;
  kpis: {
    liquidezInmediata: string;
    capitalTrabajo: number;
    rotacionCarteraDias: number;
    deudaPatrimonioRatio: string;
    totalPolizas: number;
    totalFacturas: number;
    totalCompras: number;
    totalDeudas: number;
    vencimientosPendientes: number;
  };
}

export type ActiveTab =
  | 'dashboard'
  | 'treasury'
  | 'purchases'
  | 'debts'
  | 'fiscal'
  | 'polizas'
  | 'statements'
  | 'spreadsheet'
  | 'invoices'
  | 'deadlines';
