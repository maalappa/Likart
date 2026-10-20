import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, PayoutRequest, Restaurant, DeliveryPartner } from '../types';

export type ReportPeriodType = 'daily' | 'weekly' | 'monthly' | 'custom' | 'all';
export type ReportEntityType = 'restaurant' | 'delivery';

export interface StatementSummary {
  entityType: ReportEntityType;
  entityId: string;
  entityName: string;
  entityContact: string;
  entityEmail: string;
  entityTaxOrKyc: string;
  bankingOrUpi: string;
  periodType: ReportPeriodType;
  periodLabel: string;
  startDateStr: string;
  endDateStr: string;
  generatedAt: string;
  statementNumber: string;
  totalOrdersOrTrips: number;
  completedCount: number;
  cancelledCount: number;
  grossTurnoverOrSales: number;
  netCredits: number;
  settledPayouts: number;
  pendingPayouts: number;
  closingBalance: number;
}

export interface StatementPayoutBreakupRow {
  id: string;
  date: string;
  amount: number;
  method: string;
  destination: string;
  status: 'settled' | 'pending' | 'rejected' | 'approved';
  referenceId: string;
  processedDate?: string;
}

export interface StatementOrderRow {
  orderId: string;
  date: string;
  customerName: string;
  customerPhone: string;
  restaurantOrRider: string;
  details: string;
  paymentMethod: string;
  orderAmount: number;
  netCredit: number;
  status: string;
}

export interface CompleteStatementReport {
  summary: StatementSummary;
  payoutBreakup: StatementPayoutBreakupRow[];
  orderRows: StatementOrderRow[];
}

/**
 * Filter orders and payouts by date range based on period type
 */
export function getDateRangeForPeriod(
  periodType: ReportPeriodType,
  customDate?: string, // YYYY-MM-DD
  customMonth?: string, // YYYY-MM
  customStartDate?: string,
  customEndDate?: string
): { startDate: Date; endDate: Date; label: string } {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  let label = '';

  if (periodType === 'daily') {
    const targetDate = customDate ? new Date(customDate + 'T00:00:00') : new Date();
    startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
    endDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);
    label = `Daily Statement: ${startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  } else if (periodType === 'weekly') {
    // Current week (past 7 days including today)
    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    startDate = new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
    label = `Weekly Statement: ${startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  } else if (periodType === 'monthly') {
    if (customMonth) {
      const [year, month] = customMonth.split('-').map(Number);
      startDate = new Date(year, month - 1, 1, 0, 0, 0);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
    label = `Monthly Statement: ${startDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;
  } else if (periodType === 'custom') {
    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate + 'T00:00:00');
      endDate = new Date(customEndDate + 'T23:59:59');
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = now;
    }
    label = `Custom Range: ${startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} to ${endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  } else {
    // All time
    startDate = new Date(2025, 0, 1, 0, 0, 0);
    endDate = new Date(now.getFullYear() + 1, 11, 31, 23, 59, 59);
    label = `Lifetime Comprehensive Statement (Up to ${now.toLocaleDateString('en-IN')})`;
  }

  return { startDate, endDate, label };
}

/**
 * Parses timestamp to Date safely
 */
function parseDateSafe(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Core statement generator for a Restaurant or Delivery Partner
 */
export function generateStatementReport(params: {
  entityType: ReportEntityType;
  entityId: string; // specific id or 'all'
  periodType: ReportPeriodType;
  customDate?: string;
  customMonth?: string;
  customStartDate?: string;
  customEndDate?: string;
  orders: Order[];
  payoutRequests: PayoutRequest[];
  restaurants: Restaurant[];
  deliveryPartners: DeliveryPartner[];
}): CompleteStatementReport {
  const {
    entityType,
    entityId,
    periodType,
    customDate,
    customMonth,
    customStartDate,
    customEndDate,
    orders,
    payoutRequests,
    restaurants,
    deliveryPartners,
  } = params;

  const { startDate, endDate, label: periodLabel } = getDateRangeForPeriod(
    periodType,
    customDate,
    customMonth,
    customStartDate,
    customEndDate
  );

  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  let entityName = 'All Entities';
  let entityContact = 'N/A';
  let entityEmail = 'N/A';
  let entityTaxOrKyc = 'N/A';
  let bankingOrUpi = 'N/A';

  if (entityType === 'restaurant') {
    if (entityId !== 'all') {
      const rest = restaurants.find((r) => r.id === entityId);
      if (rest) {
        entityName = rest.name;
        entityContact = `${rest.ownerName} (${rest.phone})`;
        entityEmail = rest.email;
        entityTaxOrKyc = `FSSAI: ${rest.kyc?.fssaiNumber || 'N/A'} | GST: ${rest.kyc?.gstinNumber || 'N/A'} | PAN: ${rest.kyc?.panNumber || 'N/A'}`;
        const b = rest.kyc?.bankAccount;
        bankingOrUpi = b ? `${b.bankName} - A/C: ${b.accountNumber} (IFSC: ${b.ifscCode})` : 'Bank Transfer';
      }
    } else {
      entityName = 'All Platform Restaurants (Consolidated)';
      entityContact = 'LIKART Vendor Treasury Network';
      entityEmail = 'vendors@likart.com';
      entityTaxOrKyc = 'Consolidated Multi-Vendor GST & FSSAI Register';
      bankingOrUpi = 'Verified Partner Bank Accounts';
    }
  } else {
    if (entityId !== 'all') {
      const rider = deliveryPartners.find((d) => d.id === entityId);
      if (rider) {
        entityName = rider.name;
        entityContact = `Mobile: ${rider.phone}`;
        entityEmail = rider.email;
        entityTaxOrKyc = `DL: ${rider.kyc?.drivingLicenseNumber || 'N/A'} | PAN: ${rider.kyc?.panNumber || 'N/A'} | Aadhaar: ${rider.kyc?.aadhaarNumber ? 'XXXX-XXXX-' + rider.kyc.aadhaarNumber.slice(-4) : 'N/A'}`;
        bankingOrUpi = rider.kyc?.payoutUpiOrBank || 'Direct UPI / Bank Transfer';
      }
    } else {
      entityName = 'All Delivery Fleet Partners (Consolidated)';
      entityContact = 'LIKART Fleet Dispatch Operations';
      entityEmail = 'fleet@likart.com';
      entityTaxOrKyc = 'Consolidated Fleet Operations Register';
      bankingOrUpi = 'Verified Partner UPI / Bank Accounts';
    }
  }

  // Filter orders in timeframe
  const filteredOrders = orders.filter((o) => {
    // Check entity match
    if (entityType === 'restaurant') {
      if (entityId !== 'all' && o.restaurantId !== entityId) return false;
    } else {
      if (entityId !== 'all' && o.deliveryPartnerId !== entityId && o.riderId !== entityId) return false;
    }
    // Check date range
    const orderDate = parseDateSafe(o.createdAt);
    const orderMs = orderDate.getTime();
    return orderMs >= startMs && orderMs <= endMs;
  });

  // Filter payout requests in timeframe
  const filteredPayouts = payoutRequests.filter((p) => {
    // Check recipient match
    if (entityType === 'restaurant') {
      if (p.recipientType !== 'restaurant') return false;
      if (entityId !== 'all' && p.recipientId !== entityId) return false;
    } else {
      if (p.recipientType !== 'delivery') return false;
      if (entityId !== 'all' && p.recipientId !== entityId) return false;
    }
    // Check date range
    const reqDate = parseDateSafe(p.requestedAt);
    const reqMs = reqDate.getTime();
    return reqMs >= startMs && reqMs <= endMs;
  });

  // Calculate metrics
  let grossTurnover = 0;
  let netCredits = 0;
  let completedCount = 0;
  let cancelledCount = 0;

  const orderRows: StatementOrderRow[] = [];

  filteredOrders.forEach((o) => {
    const isCompleted = o.status === 'delivered';
    const isCancelled = o.status === 'cancelled';

    if (isCompleted) completedCount++;
    if (isCancelled) cancelledCount++;

    let orderVal = 0;
    let netCreditVal = 0;
    let detailsStr = '';

    if (entityType === 'restaurant') {
      orderVal = o.itemTotal || 0;
      const restObj = restaurants.find(
        (r) => r.id === o.restaurantId || r.name.toLowerCase() === o.restaurantName?.toLowerCase()
      );
      const restCommRate = typeof restObj?.commissionRate === 'number' ? restObj.commissionRate : 15;
      const commVal = Math.round((orderVal * restCommRate) / 100);
      netCreditVal = isCancelled ? 0 : Math.max(0, orderVal - commVal);
      detailsStr = (o.items || []).map((it) => `${it.quantity}x ${it.name}`).join(', ') || 'Food items';
      if (!isCancelled) {
        detailsStr += ` [Comm ${restCommRate}%: -₹${commVal}]`;
      }
    } else {
      orderVal = (o.deliveryFee || 0) + (o.tipAmount || 0);
      netCreditVal = isCancelled ? 0 : orderVal;
      detailsStr = `Delivery Trip • Fee: ₹${o.deliveryFee || 0} + Tip: ₹${o.tipAmount || 0}`;
    }

    if (!isCancelled) {
      grossTurnover += orderVal;
      netCredits += netCreditVal;
    }

    orderRows.push({
      orderId: o.id,
      date: new Date(o.createdAt || Date.now()).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      customerName: o.customerName || 'Customer',
      customerPhone: o.customerPhone || 'N/A',
      restaurantOrRider: entityType === 'restaurant' ? o.restaurantName || 'Restaurant' : o.deliveryPartnerName || 'Rider',
      details: detailsStr,
      paymentMethod: (o.paymentMethod || 'online').toUpperCase(),
      orderAmount: orderVal,
      netCredit: netCreditVal,
      status: o.status.toUpperCase(),
    });
  });

  // Payout breakup calculations
  let settledPayouts = 0;
  let pendingPayouts = 0;

  const payoutBreakup: StatementPayoutBreakupRow[] = filteredPayouts.map((p) => {
    if (p.status === 'settled') {
      settledPayouts += p.amount;
    } else if (p.status === 'pending' || p.status === 'approved') {
      pendingPayouts += p.amount;
    }

    return {
      id: p.id,
      date: new Date(p.requestedAt || Date.now()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      amount: p.amount,
      method: (p.payoutMethod || 'Bank Transfer').toUpperCase(),
      destination: p.bankOrUpiDetails || p.upiId || 'Verified Account',
      status: p.status,
      referenceId: p.referenceId || `UTR-LK-${Date.now().toString().slice(-6)}`,
      processedDate: p.processedAt
        ? new Date(p.processedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : undefined,
    };
  });

  // Closing balance
  const closingBalance = Math.max(0, netCredits - settledPayouts);

  const statementNumber = `SOA-${entityType.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

  const summary: StatementSummary = {
    entityType,
    entityId,
    entityName,
    entityContact,
    entityEmail,
    entityTaxOrKyc,
    bankingOrUpi,
    periodType,
    periodLabel,
    startDateStr: startDate.toLocaleDateString('en-IN'),
    endDateStr: endDate.toLocaleDateString('en-IN'),
    generatedAt: new Date().toLocaleString('en-IN'),
    statementNumber,
    totalOrdersOrTrips: filteredOrders.length,
    completedCount,
    cancelledCount,
    grossTurnoverOrSales: grossTurnover,
    netCredits,
    settledPayouts,
    pendingPayouts,
    closingBalance,
  };

  return { summary, payoutBreakup, orderRows };
}

/**
 * Export Statement to Microsoft Excel (.xlsx) workbook with 3 structured sheets:
 * 1. Statement Summary & KPIs
 * 2. Payout Breakup
 * 3. Order-Level View / Itemized Ledger
 */
export function exportStatementToExcel(report: CompleteStatementReport): void {
  const { summary, payoutBreakup, orderRows } = report;

  const wb = XLSX.utils.book_new();

  // SHEET 1: Summary & Account Statement
  const summarySheetData: any[][] = [
    ['LIKART FOODS & DELIVERIES - STATEMENT OF ACCOUNT / PAYOUT REPORT'],
    ['Statement Reference:', summary.statementNumber],
    ['Report Period:', summary.periodLabel],
    ['Date Range:', `${summary.startDateStr} to ${summary.endDateStr}`],
    ['Generated On:', summary.generatedAt],
    ['Currency:', 'INR (₹)'],
    [],
    ['--- BENEFICIARY / ENTITY DETAILS ---'],
    ['Entity Type:', summary.entityType === 'restaurant' ? 'Restaurant / Food Vendor' : 'Delivery Fleet Partner'],
    ['Name / Outlet:', summary.entityName],
    ['Contact Person:', summary.entityContact],
    ['Registered Email:', summary.entityEmail],
    ['Banking / Payout Destination:', summary.bankingOrUpi],
    ['Tax & Regulatory IDs:', summary.entityTaxOrKyc],
    [],
    ['--- EXECUTIVE FINANCIAL SUMMARY ---'],
    ['Key Metric', 'Figure / Value'],
    ['Total Orders / Trips Processed', summary.totalOrdersOrTrips],
    ['Completed / Delivered', summary.completedCount],
    ['Cancelled / Discarded', summary.cancelledCount],
    ['Gross Turnover / Sales Volume (₹)', summary.grossTurnoverOrSales],
    ['Net Vendor / Rider Earnings Credited (₹)', summary.netCredits],
    ['Total Settled Disbursements to Bank (₹)', summary.settledPayouts],
    ['Payouts in Review / Pending (₹)', summary.pendingPayouts],
    ['Closing Statement Balance (₹)', summary.closingBalance],
    [],
    ['Notice: This is a system-generated statement authenticated by LIKART Platform Treasury.'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

  // SHEET 2: Payout Breakup
  const payoutSheetData: any[][] = [
    ['PAYOUT DISBURSEMENT BREAKUP & SETTLEMENT LEDGER'],
    ['Beneficiary:', summary.entityName],
    ['Period:', summary.periodLabel],
    [],
    ['Payout ID', 'Request Date', 'Disbursed Amount (₹)', 'Payout Method', 'Bank A/c or UPI', 'Status', 'UTR / Reference Number', 'Settled Date'],
  ];

  if (payoutBreakup.length === 0) {
    payoutSheetData.push(['No payout transfers recorded in this timeframe.', '', '', '', '', '', '', '']);
  } else {
    payoutBreakup.forEach((p) => {
      payoutSheetData.push([
        p.id,
        p.date,
        p.amount,
        p.method,
        p.destination,
        p.status.toUpperCase(),
        p.referenceId,
        p.processedDate || p.date,
      ]);
    });
    payoutSheetData.push([]);
    payoutSheetData.push(['TOTAL SETTLED DISBURSEMENTS', '', summary.settledPayouts, '', '', 'SETTLED', '', '']);
    payoutSheetData.push(['TOTAL PENDING IN REVIEW', '', summary.pendingPayouts, '', '', 'PENDING', '', '']);
  }

  const wsPayout = XLSX.utils.aoa_to_sheet(payoutSheetData);
  XLSX.utils.book_append_sheet(wb, wsPayout, 'Payout Breakup');

  // SHEET 3: Order-Level View / Itemized Ledger
  const orderSheetData: any[][] = [
    ['ITEMIZED ORDER-LEVEL EARNINGS & TRANSACTIONS VIEW'],
    ['Beneficiary:', summary.entityName],
    ['Period:', summary.periodLabel],
    [],
    ['Order / Trip ID', 'Date & Time', 'Customer Name', 'Phone', 'Entity', 'Details / Items', 'Payment Mode', 'Order Value (₹)', 'Net Credit (₹)', 'Status'],
  ];

  if (orderRows.length === 0) {
    orderSheetData.push(['No transactions recorded in this timeframe.', '', '', '', '', '', '', '', '', '']);
  } else {
    orderRows.forEach((o) => {
      orderSheetData.push([
        o.orderId,
        o.date,
        o.customerName,
        o.customerPhone,
        o.restaurantOrRider,
        o.details,
        o.paymentMethod,
        o.orderAmount,
        o.netCredit,
        o.status,
      ]);
    });
    orderSheetData.push([]);
    orderSheetData.push(['TOTALS', '', '', '', '', '', '', summary.grossTurnoverOrSales, summary.netCredits, `${summary.completedCount} Completed`]);
  }

  const wsOrders = XLSX.utils.aoa_to_sheet(orderSheetData);
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Order-Level View');

  // Generate and download
  const cleanEntityName = summary.entityName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25);
  const fileName = `Statement_${cleanEntityName}_${summary.periodType}_${Date.now()}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * Export Statement of Account & Payout Report to a high-fidelity PDF (.pdf)
 */
export function exportStatementToPDF(report: CompleteStatementReport): void {
  const { summary, payoutBreakup, orderRows } = report;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('LIKART FOOD & DELIVERIES', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL STATEMENT OF ACCOUNT & PAYOUT REPORT', 14, 18);
  doc.text(`Ref: ${summary.statementNumber} | Generated: ${summary.generatedAt}`, 14, 23);

  // Beneficiary Info & Period Box
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`STATEMENT FOR: ${summary.entityName.toUpperCase()}`, 14, 36);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Beneficiary Type: ${summary.entityType === 'restaurant' ? 'Restaurant Vendor' : 'Delivery Fleet Partner'}`, 14, 42);
  doc.text(`Contact: ${summary.entityContact} | Email: ${summary.entityEmail}`, 14, 47);
  doc.text(`KYC & Tax Details: ${summary.entityTaxOrKyc}`, 14, 52);
  doc.text(`Payout Destination: ${summary.bankingOrUpi}`, 14, 57);

  // Period Badge
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageWidth - 75, 32, 61, 26, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('STATEMENT PERIOD', pageWidth - 70, 38);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.text(summary.periodLabel, pageWidth - 70, 44);
  doc.text(`From: ${summary.startDateStr}`, pageWidth - 70, 49);
  doc.text(`To:   ${summary.endDateStr}`, pageWidth - 70, 54);

  // Summary KPI Cards Table
  const summaryBody = [
    [
      `Total Orders/Trips:\n${summary.totalOrdersOrTrips} (${summary.completedCount} delivered)`,
      `Gross Turnover / Sales:\nINR ₹${summary.grossTurnoverOrSales.toLocaleString('en-IN')}`,
      `Net Credited Earnings:\nINR ₹${summary.netCredits.toLocaleString('en-IN')}`,
    ],
    [
      `Settled to Bank / UPI:\nINR ₹${summary.settledPayouts.toLocaleString('en-IN')}`,
      `Pending in Review:\nINR ₹${summary.pendingPayouts.toLocaleString('en-IN')}`,
      `Closing Statement Balance:\nINR ₹${summary.closingBalance.toLocaleString('en-IN')}`,
    ],
  ];

  autoTable(doc, {
    startY: 63,
    body: summaryBody,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 3,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 60, fillColor: [248, 250, 252] },
      1: { cellWidth: 61, fillColor: [240, 253, 244] },
      2: { cellWidth: 61, fillColor: [238, 242, 255] },
    },
  });

  // Table 1: Payout Breakup
  let currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 88;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. PAYOUT DISBURSEMENT BREAKUP & SETTLEMENTS', 14, currentY);

  const payoutHeaders = [['Payout ID', 'Date', 'Amount (₹)', 'Method', 'Destination', 'Status', 'UTR / Ref']];
  const payoutRows = payoutBreakup.map((p) => [
    p.id,
    p.date,
    `₹${p.amount.toLocaleString('en-IN')}`,
    p.method,
    p.destination.slice(0, 22),
    p.status.toUpperCase(),
    p.referenceId,
  ]);

  if (payoutRows.length === 0) {
    payoutRows.push(['No payouts recorded in this period', '-', '₹0', '-', '-', '-', '-']);
  }

  autoTable(doc, {
    startY: currentY + 3,
    head: payoutHeaders,
    body: payoutRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7,
      cellPadding: 2,
    },
    columnStyles: {
      2: { fontStyle: 'bold', textColor: [16, 185, 129] },
      5: { fontStyle: 'bold' },
    },
  });

  // Table 2: Order-Level View / Itemized Ledger
  currentY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 140;

  // If near end of page, add page
  if (currentY > 230) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. ORDER-LEVEL ITEMIZED VIEW & TRANSACTION LEDGER', 14, currentY);

  const orderHeaders = [['Order ID', 'Date & Time', 'Customer', 'Items / Trip Details', 'Mode', 'Amount (₹)', 'Net Credit (₹)', 'Status']];
  const orderTableRows = orderRows.slice(0, 150).map((o) => [
    o.orderId,
    o.date,
    o.customerName.slice(0, 16),
    o.details.slice(0, 32),
    o.paymentMethod,
    `₹${o.orderAmount}`,
    `₹${o.netCredit}`,
    o.status,
  ]);

  if (orderTableRows.length === 0) {
    orderTableRows.push(['No transactions recorded in this period', '-', '-', '-', '-', '₹0', '₹0', '-']);
  }

  autoTable(doc, {
    startY: currentY + 3,
    head: orderHeaders,
    body: orderTableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 6.8,
      cellPadding: 1.8,
    },
    columnStyles: {
      5: { fontStyle: 'bold' },
      6: { fontStyle: 'bold', textColor: [16, 185, 129] },
      7: { fontStyle: 'bold' },
    },
  });

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `LIKART Food & Deliveries Platform • Statement: ${summary.statementNumber} • Page ${i} of ${totalPages}`,
      14,
      doc.internal.pageSize.getHeight() - 6
    );
    doc.text(
      `Authenticated Digital Statement • Questions: finance@likart.com`,
      pageWidth - 75,
      doc.internal.pageSize.getHeight() - 6
    );
  }

  const cleanEntityName = summary.entityName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25);
  const fileName = `Statement_${cleanEntityName}_${summary.periodType}_${Date.now()}.pdf`;

  doc.save(fileName);
}
