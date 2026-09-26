import { Router, Request, Response } from 'express';
import { db } from './db.js';

export const apiRouter = Router();

// Middleware to extract and verify session
function authMiddleware(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado. Token de sesión no proporcionado.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  const session = db.getSession(token);
  if (!session) {
    res.status(401).json({ error: 'Sesión expirada o inválida. Por favor inicie sesión nuevamente.' });
    return;
  }
  const user = db.findUserById(session.accountantId);
  if (!user) {
    res.status(401).json({ error: 'Usuario no encontrado.' });
    return;
  }

  (req as any).user = user;
  (req as any).session = session;
  next();
}

// ================= AUTH ROUTES =================

// Register Accountant
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name, licenseNumber, firmName, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Por favor ingrese un formato de correo electrónico válido.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe contener al menos 6 caracteres.' });
      return;
    }

    const { user, token } = db.createUser({
      email,
      name,
      passwordPlain: password,
      licenseNumber,
      firmName,
      phone
    });

    res.status(201).json({
      message: 'Contador registrado exitosamente en ContaSoftware-2TB.',
      user,
      token,
      session: {
        activeClientId: db.getClients(user.id)[0]?.id || null,
        activeTab: 'dashboard'
      }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Error al registrar el contador.' });
  }
});

// Login Accountant
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Por favor proporcione correo y contraseña.' });
      return;
    }

    const { user, token, session } = db.verifyLogin(email, password);

    res.json({
      message: 'Autenticación exitosa en ContaSoftware-2TB.',
      user,
      token,
      session: {
        activeClientId: session.activeClientId,
        activeTab: session.activeTab,
        activeFilter: session.activeFilter
      }
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Error de autenticación.' });
  }
});

// Get Current User & Session
apiRouter.get('/auth/me', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const session = (req as any).session;
  const { passwordHash: _, ...safeUser } = user;

  res.json({
    user: safeUser,
    session: {
      activeClientId: session.activeClientId,
      activeTab: session.activeTab,
      activeFilter: session.activeFilter
    }
  });
});

// Update Profile
apiRouter.put('/auth/profile', authMiddleware, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const safeUser = db.updateUserProfile(user.id, req.body);
    res.json({ message: 'Perfil de contador actualizado.', user: safeUser });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update Session State
apiRouter.put('/auth/session-state', authMiddleware, (req: Request, res: Response) => {
  try {
    const session = (req as any).session;
    const { activeClientId, activeTab, activeFilter } = req.body;
    const updated = db.updateSessionState(session.token, { activeClientId, activeTab, activeFilter });
    res.json({ success: true, session: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Logout
apiRouter.post('/auth/logout', authMiddleware, (req: Request, res: Response) => {
  const session = (req as any).session;
  db.removeSession(session.token);
  res.json({ message: 'Sesión cerrada exitosamente.' });
});

// ================= CLIENTS ROUTES =================

// List Clients
apiRouter.get('/clients', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const clients = db.getClients(user.id);
  res.json({ clients });
});

// Create Client
apiRouter.post('/clients', authMiddleware, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const {
      businessName,
      commercialName,
      rfc,
      taxRegime,
      personType,
      email,
      phone,
      address,
      fiscalYear,
      currentPeriod,
      initialBankBalance,
      initialCapital
    } = req.body;

    if (!businessName || !rfc) {
      res.status(400).json({ error: 'Razón Social y RFC son obligatorios.' });
      return;
    }

    const code = `CLI-${Math.floor(100 + Math.random() * 900)}`;
    const newClient = db.createClient(user.id, {
      code,
      businessName,
      commercialName: commercialName || businessName,
      rfc: rfc.toUpperCase(),
      taxRegime: taxRegime || '601 - General de Ley Personas Morales',
      personType: personType || (rfc.length === 12 ? 'Persona Moral' : 'Persona Física'),
      email: email || '',
      phone: phone || '',
      address: address || '',
      status: 'Activo',
      fiscalYear: Number(fiscalYear) || new Date().getFullYear(),
      currentPeriod: currentPeriod || 'Septiembre 2026',
      initialBankBalance: Number(initialBankBalance) || 0,
      initialCapital: Number(initialCapital) || 0
    });

    res.status(201).json({ message: 'Cliente contable creado desde cero exitosamente.', client: newClient });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update Client
apiRouter.put('/clients/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const updated = db.updateClient(req.params.id, req.body);
    res.json({ message: 'Perfil del cliente actualizado.', client: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Client
apiRouter.delete('/clients/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    db.deleteClient(req.params.id);
    res.json({ message: 'Cliente y toda su contabilidad han sido eliminados.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reset client accounting data to zero
apiRouter.post('/clients/:id/reset-zero', authMiddleware, (req: Request, res: Response) => {
  try {
    const result = db.resetClientData(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ================= FINANCIALS & STATEMENTS =================

apiRouter.get('/clients/:id/financials', authMiddleware, (req: Request, res: Response) => {
  try {
    const statements = db.getFinancialStatements(req.params.id);
    res.json(statements);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ================= POLIZAS (JOURNAL ENTRIES) =================

apiRouter.get('/clients/:id/polizas', authMiddleware, (req: Request, res: Response) => {
  const polizas = db.getPolizas(req.params.id);
  res.json({ polizas });
});

apiRouter.post('/clients/:id/polizas', authMiddleware, (req: Request, res: Response) => {
  try {
    const { number, date, type, concept, entries, notes } = req.body;
    if (!concept || !entries || !Array.isArray(entries) || entries.length < 2) {
      res.status(400).json({ error: 'Una póliza requiere concepto y al menos dos partidas contables (partida doble).' });
      return;
    }

    const poliza = db.createPoliza(req.params.id, {
      number: number || `POL-${Date.now().toString().slice(-4)}`,
      date: date || new Date().toISOString().split('T')[0],
      type: type || 'Diario',
      concept,
      entries,
      notes
    });

    res.status(201).json({ message: 'Póliza contable registrada y balanceada.', poliza });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/clients/:id/polizas/:polizaId', authMiddleware, (req: Request, res: Response) => {
  try {
    db.deletePoliza(req.params.polizaId);
    res.json({ message: 'Póliza eliminada con éxito.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ================= BANK ACCOUNTS & MOVEMENTS (TESORERÍA) =================

apiRouter.get('/clients/:id/bank-accounts', authMiddleware, (req: Request, res: Response) => {
  const accounts = db.getBankAccounts(req.params.id);
  res.json({ accounts });
});

apiRouter.post('/clients/:id/bank-accounts', authMiddleware, (req: Request, res: Response) => {
  try {
    const { bankName, accountNumber, clabe, currency, initialBalance } = req.body;
    if (!bankName || !accountNumber) {
      res.status(400).json({ error: 'Banco y número de cuenta requeridos.' });
      return;
    }
    const account = db.createBankAccount(req.params.id, {
      bankName,
      accountNumber,
      clabe: clabe || '',
      currency: currency || 'MXN',
      initialBalance: Number(initialBalance) || 0
    });
    res.status(201).json({ message: 'Cuenta bancaria añadida.', account });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/clients/:id/bank-accounts/:accountId/movements', authMiddleware, (req: Request, res: Response) => {
  try {
    const movement = db.addBankMovement(req.params.accountId, req.body);
    res.status(201).json({ message: 'Movimiento registrado en tesorería y póliza contable generada.', movement });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/clients/:id/bank-accounts/:accountId/reconcile/:movementId', authMiddleware, (req: Request, res: Response) => {
  try {
    const reconciled = db.toggleReconciliation(req.params.accountId, req.params.movementId);
    res.json({ message: 'Estado de conciliación actualizado.', reconciled });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ================= COMPRAS DE LA EMPRESA (PURCHASES) =================

apiRouter.get('/clients/:id/purchases', authMiddleware, (req: Request, res: Response) => {
  const purchases = db.getPurchases(req.params.id);
  res.json({ purchases });
});

apiRouter.post('/clients/:id/purchases', authMiddleware, (req: Request, res: Response) => {
  try {
    const { providerName, providerRfc, invoiceFolio, date, dueDate, category, subtotal, ivaRate, ivaAmount, retentionIsr, retentionIva, paymentCondition, bankAccountId, deductibility, notes } = req.body;

    if (!providerName || subtotal === undefined) {
      res.status(400).json({ error: 'Nombre del proveedor y subtotal son obligatorios.' });
      return;
    }

    const purchase = db.createPurchase(req.params.id, {
      providerName,
      providerRfc: (providerRfc || 'XAXX010101000').toUpperCase(),
      invoiceFolio: invoiceFolio || '',
      date: date || new Date().toISOString().split('T')[0],
      dueDate: dueDate || date || new Date().toISOString().split('T')[0],
      category: category || 'Gasto Operativo',
      subtotal: Number(subtotal) || 0,
      ivaRate: ivaRate !== undefined ? Number(ivaRate) : 0.16,
      ivaAmount: ivaAmount !== undefined ? Number(ivaAmount) : (Number(subtotal) || 0) * 0.16,
      retentionIsr: Number(retentionIsr) || 0,
      retentionIva: Number(retentionIva) || 0,
      total: 0, // Computed by db
      paymentCondition: paymentCondition || 'Contado',
      bankAccountId,
      status: paymentCondition === 'Contado' ? 'Pagada' : 'Por Pagar',
      deductibility: deductibility || '100% Deducible',
      notes
    });

    res.status(201).json({ message: 'Compra de la empresa registrada y contabilizada.', purchase });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/clients/:id/purchases/:purchaseId', authMiddleware, (req: Request, res: Response) => {
  try {
    db.deletePurchase(req.params.purchaseId);
    res.json({ message: 'Compra eliminada.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ================= DEUDAS Y PASIVOS (DEBTS & LOANS) =================

apiRouter.get('/clients/:id/debts', authMiddleware, (req: Request, res: Response) => {
  const debts = db.getDebts(req.params.id);
  res.json({ debts });
});

apiRouter.post('/clients/:id/debts', authMiddleware, (req: Request, res: Response) => {
  try {
    const { creditorName, debtType, concept, totalAmount, interestRate, startDate, dueDate } = req.body;
    if (!creditorName || !totalAmount) {
      res.status(400).json({ error: 'Acreedor/Banco y monto de la deuda son obligatorios.' });
      return;
    }

    const debt = db.createDebt(req.params.id, {
      creditorName,
      debtType: debtType || 'Acreedor Diverso',
      concept: concept || 'Crédito / Pasivo registrado',
      totalAmount: Number(totalAmount) || 0,
      interestRate: Number(interestRate) || 0,
      startDate: startDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0]
    });

    res.status(201).json({ message: 'Deuda o pasivo registrado.', debt });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/clients/:id/debts/:debtId/payments', authMiddleware, (req: Request, res: Response) => {
  try {
    const payment = db.addDebtPayment(req.params.debtId, req.body);
    res.status(201).json({ message: 'Abono a deuda aplicado correctamente.', payment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/clients/:id/debts/:debtId', authMiddleware, (req: Request, res: Response) => {
  try {
    db.deleteDebt(req.params.debtId);
    res.json({ message: 'Registro de deuda eliminado.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ================= INVOICES (FACTURACIÓN CFDI) =================

apiRouter.get('/clients/:id/invoices', authMiddleware, (req: Request, res: Response) => {
  const invoices = db.getInvoices(req.params.id);
  res.json({ invoices });
});

apiRouter.post('/clients/:id/invoices', authMiddleware, (req: Request, res: Response) => {
  try {
    const { type, folio, partyRfc, partyName, date, dueDate, subtotal, taxIva, taxRetention, paymentMethod, category } = req.body;
    const sub = Number(subtotal) || 0;
    const iva = taxIva !== undefined ? Number(taxIva) : sub * 0.16;
    const ret = Number(taxRetention) || 0;
    const total = sub + iva - ret;

    const invoice = db.createInvoice(req.params.id, {
      type: type || 'Emitida',
      folio: folio || `F-${Math.floor(1000 + Math.random() * 9000)}`,
      partyRfc: (partyRfc || 'XAXX010101000').toUpperCase(),
      partyName: partyName || 'Público en General',
      date: date || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      subtotal: sub,
      taxIva: iva,
      taxRetention: ret,
      total,
      paymentMethod: paymentMethod || 'PUE',
      status: 'Vigente',
      category: category || 'General'
    });

    res.status(201).json({ message: 'Comprobante fiscal CFDI emitido.', invoice });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/clients/:id/invoices/:invoiceId/status', authMiddleware, (req: Request, res: Response) => {
  try {
    const invoice = db.updateInvoiceStatus(req.params.invoiceId, req.body.status);
    res.json({ message: 'Estatus de factura actualizado.', invoice });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ================= DEADLINES & FISCAL ALERTS =================

apiRouter.get('/clients/:id/deadlines', authMiddleware, (req: Request, res: Response) => {
  const deadlines = db.getDeadlines(req.params.id);
  res.json({ deadlines });
});

apiRouter.post('/clients/:id/deadlines', authMiddleware, (req: Request, res: Response) => {
  try {
    const deadline = db.createDeadline(req.params.id, req.body);
    res.status(201).json({ message: 'Alerta de vencimiento programada.', deadline });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/clients/:id/deadlines/:deadlineId', authMiddleware, (req: Request, res: Response) => {
  try {
    const deadline = db.updateDeadlineStatus(req.params.deadlineId, req.body.status);
    res.json({ message: 'Estatus de vencimiento actualizado.', deadline });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ================= SPREADSHEET (HOJA DE CÁLCULO) =================

apiRouter.get('/clients/:id/spreadsheet', authMiddleware, (req: Request, res: Response) => {
  const sheet = db.getSpreadsheet(req.params.id);
  res.json({ sheet });
});

apiRouter.put('/clients/:id/spreadsheet', authMiddleware, (req: Request, res: Response) => {
  try {
    const saved = db.saveSpreadsheet(req.params.id, req.body);
    res.json({ message: 'Hoja de trabajo contable guardada.', sheet: saved });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ================= EXPORTS (WORD & EXCEL) =================

apiRouter.get('/export/word/:clientId', (req: Request, res: Response) => {
  const client = db.getClientById(req.params.clientId);
  if (!client) {
    res.status(404).send('Cliente no encontrado');
    return;
  }
  const accountant = db.findUserById(client.accountantId);
  const statements = db.getFinancialStatements(client.id);

  const formatMoney = (val: number) => `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>ContaSoftware-2TB - Dictamen Contable y Balances - ${client.businessName}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 40px; color: #1e293b; line-height: 1.5; }
        .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; }
        .app-brand { font-size: 10pt; color: #059669; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
        .firm-title { font-size: 18pt; font-weight: bold; color: #0f172a; margin: 4px 0 0 0; }
        .firm-subtitle { font-size: 10pt; color: #64748b; margin: 3px 0 0 0; }
        .doc-title { font-size: 15pt; font-weight: bold; color: #059669; text-align: center; margin: 25px 0 10px 0; text-transform: uppercase; }
        .meta-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; margin-bottom: 25px; border-radius: 4px; font-size: 9.5pt; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 9.5pt; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; }
        th { background: #0f172a; color: white; text-align: left; }
        .text-right { text-align: right; }
        .total-row { background: #f1f5f9; font-weight: bold; border-top: 2px solid #0f172a; }
        .section-header { background: #e2e8f0; font-weight: bold; color: #0f172a; }
        .signature-section { margin-top: 50px; text-align: center; }
        .signature-line { width: 300px; border-top: 1px solid #0f172a; margin: 0 auto 8px auto; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="app-brand">ContaSoftware-2TB · Sistema Profesional de Contabilidad & Auditoría</div>
        <p class="firm-title">${accountant?.firmName || 'DESPACHO CONTABLE Y AUDITORÍA INTEGRAL'}</p>
        <p class="firm-subtitle">${accountant?.name || 'C.P. Colegiado'} · Cédula: ${accountant?.licenseNumber || 'CP-8492015-DGP'} · Folio: ${accountant?.collegeFolio || 'CCPM-8842'}</p>
      </div>

      <div class="meta-box">
        <strong>EMPRESA AUDITADA:</strong> ${client.businessName}<br>
        <strong>RFC:</strong> ${client.rfc} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>RÉGIMEN FISCAL:</strong> ${client.taxRegime}<br>
        <strong>PERÍODO CONTABLE:</strong> ${client.currentPeriod} (Ejercicio Fiscal ${client.fiscalYear})<br>
        <strong>DOMICILIO:</strong> ${client.address}
      </div>

      <div class="doc-title">DICTAMEN DE ESTADOS FINANCIEROS Y SITUACIÓN PATRIMONIAL</div>

      <h3 style="color:#0f172a; border-bottom: 1px solid #0f172a; padding-bottom: 4px;">1. BALANCE GENERAL (ESTADO DE SITUACIÓN FINANCIERA)</h3>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Concepto / Rubro Financiero</th>
            <th class="text-right">Importe ($ MXN)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="section-header"><td colspan="3">ACTIVO CIRCULANTE</td></tr>
          ${statements.balanceGeneral.activos.circulante.map(a => `
            <tr>
              <td>${a.code}</td>
              <td>${a.name}</td>
              <td class="text-right">${formatMoney(a.amount)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL ACTIVO CIRCULANTE</td>
            <td class="text-right">${formatMoney(statements.balanceGeneral.activos.totalCirculante)}</td>
          </tr>

          <tr class="section-header"><td colspan="3">ACTIVO NO CIRCULANTE (FIJO)</td></tr>
          ${statements.balanceGeneral.activos.noCirculante.map(a => `
            <tr>
              <td>${a.code}</td>
              <td>${a.name}</td>
              <td class="text-right">${formatMoney(a.amount)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL ACTIVO NO CIRCULANTE</td>
            <td class="text-right">${formatMoney(statements.balanceGeneral.activos.totalNoCirculante)}</td>
          </tr>
          <tr style="background:#0f172a; color:white; font-weight:bold;">
            <td colspan="2">TOTAL ACTIVO</td>
            <td class="text-right">${formatMoney(statements.balanceGeneral.activos.totalActivo)}</td>
          </tr>

          <tr class="section-header"><td colspan="3">PASIVO</td></tr>
          ${statements.balanceGeneral.pasivos.cortoPlazo.map(p => `
            <tr>
              <td>${p.code}</td>
              <td>${p.name}</td>
              <td class="text-right">${formatMoney(p.amount)}</td>
            </tr>
          `).join('')}
          ${statements.balanceGeneral.pasivos.largoPlazo.map(p => `
            <tr>
              <td>${p.code}</td>
              <td>${p.name}</td>
              <td class="text-right">${formatMoney(p.amount)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL PASIVO</td>
            <td class="text-right">${formatMoney(statements.balanceGeneral.pasivos.totalPasivo)}</td>
          </tr>

          <tr class="section-header"><td colspan="3">CAPITAL CONTABLE</td></tr>
          ${statements.balanceGeneral.capital.rubros.map(c => `
            <tr>
              <td>${c.code}</td>
              <td>${c.name}</td>
              <td class="text-right">${formatMoney(c.amount)}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="2">TOTAL CAPITAL CONTABLE</td>
            <td class="text-right">${formatMoney(statements.balanceGeneral.capital.totalCapital)}</td>
          </tr>
          <tr style="background:#0f172a; color:white; font-weight:bold;">
            <td colspan="2">TOTAL PASIVO Y CAPITAL</td>
            <td class="text-right">${formatMoney(statements.balanceGeneral.totalPasivoYCapital)}</td>
          </tr>
        </tbody>
      </table>

      <h3 style="color:#0f172a; border-bottom: 1px solid #0f172a; padding-bottom: 4px; margin-top: 35px;">2. ESTADO DE RESULTADOS INTEGRAL</h3>
      <table>
        <thead>
          <tr>
            <th>Concepto de Resultados</th>
            <th class="text-right">Importe ($ MXN)</th>
            <th class="text-right">% Margen</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ingresos Netos Totales</td>
            <td class="text-right">${formatMoney(statements.estadoResultados.ingresosNetos)}</td>
            <td class="text-right">100.0%</td>
          </tr>
          <tr>
            <td>(-) Costo de Ventas y Compras de Insumos</td>
            <td class="text-right">(${formatMoney(statements.estadoResultados.costoVentas)})</td>
            <td class="text-right">${((statements.estadoResultados.costoVentas / (statements.estadoResultados.ingresosNetos || 1)) * 100).toFixed(1)}%</td>
          </tr>
          <tr class="total-row">
            <td>(=) UTILIDAD BRUTA</td>
            <td class="text-right">${formatMoney(statements.estadoResultados.utilidadBruta)}</td>
            <td class="text-right">${statements.estadoResultados.margenBrutoPct.toFixed(1)}%</td>
          </tr>
          <tr>
            <td>(-) Gastos Operativos y Administrativos</td>
            <td class="text-right">(${formatMoney(statements.estadoResultados.gastosOperacion)})</td>
            <td class="text-right">${((statements.estadoResultados.gastosOperacion / (statements.estadoResultados.ingresosNetos || 1)) * 100).toFixed(1)}%</td>
          </tr>
          <tr class="total-row">
            <td>(=) UTILIDAD OPERATIVA</td>
            <td class="text-right">${formatMoney(statements.estadoResultados.utilidadOperativa)}</td>
            <td class="text-right">${statements.estadoResultados.margenOperativoPct.toFixed(1)}%</td>
          </tr>
          <tr>
            <td>(-) Gastos Financieros e Impuestos Estimados</td>
            <td class="text-right">(${formatMoney(statements.estadoResultados.gastosFinancieros + statements.estadoResultados.impuestosEstimados)})</td>
            <td class="text-right">-</td>
          </tr>
          <tr style="background:#059669; color:white; font-weight:bold;">
            <td>(=) RESULTADO NETO DEL EJERCICIO</td>
            <td class="text-right">${formatMoney(statements.estadoResultados.utilidadNeta)}</td>
            <td class="text-right">${statements.estadoResultados.margenNetoPct.toFixed(1)}%</td>
          </tr>
        </tbody>
      </table>

      <div class="signature-section">
        <div class="signature-line"></div>
        <strong>${accountant?.name || 'C.P. Isaías de Jesús Guzmán'}</strong><br>
        Contador Público Certificado · Cédula: ${accountant?.licenseNumber || 'CP-8492015-DGP'}<br>
        Reporte generado en ContaSoftware-2TB el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'application/msword; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="ContaSoftware2TB_Dictamen_${client.rfc}_${client.fiscalYear}.doc"`);
  res.send(wordHtml);
});

apiRouter.get('/export/excel/:clientId', (req: Request, res: Response) => {
  const client = db.getClientById(req.params.clientId);
  if (!client) {
    res.status(404).send('Cliente no encontrado');
    return;
  }
  const polizas = db.getPolizas(client.id);

  let csv = '\uFEFF';
  csv += `CONTASOFTWARE-2TB - REPORTE DE LIBRO DIARIO Y MAYOR - ${client.businessName}\n`;
  csv += `RFC: ${client.rfc}, PERIODO: ${client.currentPeriod}, FECHA DE EXPORTACION: ${new Date().toISOString()}\n\n`;
  csv += 'Numero Poliza,Fecha,Tipo,Concepto,Codigo Cuenta,Nombre Cuenta,Concepto Partida,Debe (Cargo),Haber (Abono)\n';

  polizas.forEach(p => {
    p.entries.forEach(e => {
      csv += `"${p.number}","${p.date}","${p.type}","${p.concept.replace(/"/g, '""')}","${e.accountCode}","${e.accountName.replace(/"/g, '""')}","${e.concept.replace(/"/g, '""')}",${e.debe},${e.haber}\n`;
    });
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="ContaSoftware2TB_Diario_${client.rfc}_${client.fiscalYear}.csv"`);
  res.send(csv);
});
