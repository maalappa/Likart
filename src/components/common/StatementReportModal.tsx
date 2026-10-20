import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Download,
  Calendar,
  Building2,
  Bike,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  Filter,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  TrendingUp,
  Search,
  AlertCircle,
} from 'lucide-react';
import { Order, PayoutRequest, Restaurant, DeliveryPartner } from '../../types';
import {
  ReportEntityType,
  ReportPeriodType,
  generateStatementReport,
  exportStatementToExcel,
  exportStatementToPDF,
} from '../../utils/statementReportGenerator';

interface StatementReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  payoutRequests: PayoutRequest[];
  restaurants: Restaurant[];
  deliveryPartners: DeliveryPartner[];
  initialEntityType?: ReportEntityType;
  initialEntityId?: string; // specific id or 'all'
  lockEntityType?: boolean;
  lockEntityId?: boolean;
}

export const StatementReportModal: React.FC<StatementReportModalProps> = ({
  isOpen,
  onClose,
  orders,
  payoutRequests,
  restaurants,
  deliveryPartners,
  initialEntityType = 'restaurant',
  initialEntityId = 'all',
  lockEntityType = false,
  lockEntityId = false,
}) => {
  const [entityType, setEntityType] = useState<ReportEntityType>(initialEntityType);
  const [entityId, setEntityId] = useState<string>(initialEntityId);
  const [periodType, setPeriodType] = useState<ReportPeriodType>('monthly');

  // Date selectors
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [customDate, setCustomDate] = useState<string>(todayStr);
  const [customMonth, setCustomMonth] = useState<string>(currentMonthStr);
  const [customStartDate, setCustomStartDate] = useState<string>(todayStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  // Active view tab inside modal
  const [activeTab, setActiveTab] = useState<'summary' | 'payouts' | 'orders'>('summary');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Reset or initialize state when opening
  React.useEffect(() => {
    if (isOpen) {
      if (initialEntityType) setEntityType(initialEntityType);
      if (initialEntityId) setEntityId(initialEntityId);
    }
  }, [isOpen, initialEntityType, initialEntityId]);

  // Compute statement report
  const report = useMemo(() => {
    return generateStatementReport({
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
    });
  }, [
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
  ]);

  if (!isOpen) return null;

  const handleDownloadExcel = () => {
    setIsExporting('excel');
    try {
      exportStatementToExcel(report);
    } catch (err) {
      console.error('Failed to export Excel statement:', err);
    } finally {
      setTimeout(() => setIsExporting(null), 800);
    }
  };

  const handleDownloadPDF = () => {
    setIsExporting('pdf');
    try {
      exportStatementToPDF(report);
    } catch (err) {
      console.error('Failed to export PDF statement:', err);
    } finally {
      setTimeout(() => setIsExporting(null), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter orders in order-level tab
  const filteredOrderRows = report.orderRows.filter((o) => {
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      o.details.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-heading text-white">
                  Statement of Account & Payout Reports
                </h3>
                <span className="text-[10px] uppercase font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Official Audit
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Download Daily, Weekly, and Monthly Statements with summary KPIs, payout breakup, and order-level audit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Entity Type */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                Entity Category
              </label>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  disabled={lockEntityType}
                  onClick={() => {
                    setEntityType('restaurant');
                    if (!lockEntityId) setEntityId('all');
                  }}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    entityType === 'restaurant'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Restaurant</span>
                </button>
                <button
                  type="button"
                  disabled={lockEntityType}
                  onClick={() => {
                    setEntityType('delivery');
                    if (!lockEntityId) setEntityId('all');
                  }}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    entityType === 'delivery'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Rider Fleet</span>
                </button>
              </div>
            </div>

            {/* 2. Specific Entity Selector */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                {entityType === 'restaurant' ? 'Select Restaurant' : 'Select Delivery Partner'}
              </label>
              <select
                disabled={lockEntityId}
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 shadow-2xs focus:outline-emerald-500 disabled:opacity-75 disabled:bg-slate-100"
              >
                {!lockEntityId && (
                  <option value="all">
                    {entityType === 'restaurant'
                      ? '✨ All Restaurants (Consolidated)'
                      : '✨ All Delivery Fleet (Consolidated)'}
                  </option>
                )}
                {entityType === 'restaurant'
                  ? restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.ownerName})
                      </option>
                    ))
                  : deliveryPartners.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.phone})
                      </option>
                    ))}
              </select>
            </div>

            {/* 3. Period Type (Daily / Weekly / Monthly / Custom) */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                Statement Timeframe
              </label>
              <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setPeriodType('daily')}
                  className={`py-1.5 rounded-lg transition text-center ${
                    periodType === 'daily' ? 'bg-emerald-600 text-white font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodType('weekly')}
                  className={`py-1.5 rounded-lg transition text-center ${
                    periodType === 'weekly' ? 'bg-emerald-600 text-white font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodType('monthly')}
                  className={`py-1.5 rounded-lg transition text-center ${
                    periodType === 'monthly' ? 'bg-emerald-600 text-white font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setPeriodType('custom')}
                  className={`py-1.5 rounded-lg transition text-center ${
                    periodType === 'custom' ? 'bg-emerald-600 text-white font-black' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* 4. Date Picker Input according to periodType */}
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                {periodType === 'daily'
                  ? 'Selected Day'
                  : periodType === 'monthly'
                  ? 'Selected Month'
                  : periodType === 'weekly'
                  ? 'Active Week Range'
                  : 'Custom Date Range'}
              </label>
              {periodType === 'daily' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 shadow-2xs"
                />
              )}
              {periodType === 'monthly' && (
                <input
                  type="month"
                  value={customMonth}
                  onChange={(e) => setCustomMonth(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 shadow-2xs"
                />
              )}
              {periodType === 'weekly' && (
                <div className="p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 truncate">
                  Past 7 Days (Ending Today)
                </div>
              )}
              {periodType === 'custom' && (
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-1/2 text-[11px] p-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-1/2 text-[11px] p-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Download Buttons Toolbar */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{report.summary.periodLabel}</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              • Ref: <span className="font-mono">{report.summary.statementNumber}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Download Excel (.xlsx) */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={isExporting !== null}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Download 3-Sheet Excel workbook (Summary, Payout Breakup, Order-Level)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>{isExporting === 'excel' ? 'Generating...' : 'Download Excel (.xlsx)'}</span>
            </button>

            {/* Download PDF (.pdf) */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting !== null}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Download printable signed PDF Statement of Account"
            >
              <Download className="w-4 h-4 text-rose-200" />
              <span>{isExporting === 'pdf' ? 'Generating...' : 'Download PDF (.pdf)'}</span>
            </button>

            {/* Print View */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              title="Print Statement"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI Summary Cards Bar */}
        <div className="p-4 bg-slate-100/60 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Orders / Trips</span>
            <p className="text-lg font-black text-slate-900">{report.summary.totalOrdersOrTrips}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">{report.summary.completedCount} delivered</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Gross Turnover</span>
            <p className="text-lg font-black text-slate-900">₹{report.summary.grossTurnoverOrSales.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-slate-400">Total volume</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Net Credited</span>
            <p className="text-lg font-black text-emerald-700">₹{report.summary.netCredits.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">Earned credits</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Settled to Bank</span>
            <p className="text-lg font-black text-blue-700">₹{report.summary.settledPayouts.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-blue-600 font-semibold">{report.payoutBreakup.filter((p) => p.status === 'settled').length} transfers</span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Pending Review</span>
            <p className="text-lg font-black text-amber-600">₹{report.summary.pendingPayouts.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-amber-600 font-semibold">Awaiting transfer</span>
          </div>

          <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-2xs">
            <span className="text-[10px] font-black uppercase text-emerald-100 block mb-0.5">Statement Balance</span>
            <p className="text-lg font-black text-white">₹{report.summary.closingBalance.toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-emerald-100 font-medium">Available balance</span>
          </div>
        </div>

        {/* Navigation Tabs (Summary / Payout Breakup / Order-Level View) */}
        <div className="px-5 pt-3 bg-white border-b border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'summary'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Executive Summary & KYC
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payouts')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'payouts'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>2. Payout Breakup</span>
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] rounded-full">
              {report.payoutBreakup.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>3. Order-Level View</span>
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[10px] rounded-full">
              {report.orderRows.length}
            </span>
          </button>
        </div>

        {/* Body Content according to activeTab */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Executive Summary & KYC */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    Beneficiary Identity & Regulatory Records
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <p>
                      <strong className="text-slate-700">Account Holder / Entity:</strong>{' '}
                      <span className="font-semibold text-slate-900">{report.summary.entityName}</span>
                    </p>
                    <p>
                      <strong className="text-slate-700">Contact Person:</strong>{' '}
                      <span className="text-slate-600">{report.summary.entityContact}</span>
                    </p>
                    <p>
                      <strong className="text-slate-700">Email:</strong>{' '}
                      <span className="text-slate-600">{report.summary.entityEmail}</span>
                    </p>
                    <p>
                      <strong className="text-slate-700">Regulatory Tax / KYC:</strong>{' '}
                      <span className="text-slate-600">{report.summary.entityTaxOrKyc}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                    Banking & Settlement Destination
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <p>
                      <strong className="text-slate-700">Payout Destination:</strong>{' '}
                      <span className="font-semibold text-slate-900">{report.summary.bankingOrUpi}</span>
                    </p>
                    <p>
                      <strong className="text-slate-700">Statement Period:</strong>{' '}
                      <span className="text-slate-600">{report.summary.periodLabel}</span>
                    </p>
                    <p>
                      <strong className="text-slate-700">Date Coverage:</strong>{' '}
                      <span className="text-slate-600">{report.summary.startDateStr} to {report.summary.endDateStr}</span>
                    </p>
                    <p>
                      <strong className="text-slate-700">Audit Status:</strong>{' '}
                      <span className="text-emerald-700 font-bold">✓ Verified Digital Record</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Payout & Earnings reconciliation */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center justify-between">
                  <span>Statement Reconciliation Equation</span>
                  <span className="text-[10px] text-slate-400 font-normal">All amounts in Indian Rupees (INR)</span>
                </h4>

                <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-600 font-medium">(+) Gross Period Earnings / Vendor Credits:</span>
                    <span className="font-bold text-slate-900">₹{report.summary.netCredits.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60 text-blue-700">
                    <span className="font-medium">(-) Settled Disbursements Transferred to Bank:</span>
                    <span className="font-bold">- ₹{report.summary.settledPayouts.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60 text-amber-600">
                    <span className="font-medium">(-) Payout Requests Currently in Review:</span>
                    <span className="font-bold">- ₹{report.summary.pendingPayouts.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-emerald-700 font-black text-sm">
                    <span>(=) Net Statement Closing Balance Available:</span>
                    <span className="text-base">₹{report.summary.closingBalance.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Payout Breakup */}
          {activeTab === 'payouts' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Disbursements and payout transaction transfers within this timeframe:</span>
                <span className="font-bold text-slate-700">Total Settled: ₹{report.summary.settledPayouts.toLocaleString('en-IN')}</span>
              </div>

              {report.payoutBreakup.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No payout transfers in this timeframe</p>
                  <p className="text-[11px] text-slate-400">
                    Any bank or UPI transfers requested or settled in this period will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Payout ID</th>
                        <th className="p-3">Request Date</th>
                        <th className="p-3">Disbursed Amount</th>
                        <th className="p-3">Method</th>
                        <th className="p-3">Destination</th>
                        <th className="p-3">UTR / Ref</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {report.payoutBreakup.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition font-medium">
                          <td className="p-3 font-mono font-bold text-slate-900">{p.id}</td>
                          <td className="p-3 text-slate-600">{p.date}</td>
                          <td className="p-3 font-black text-emerald-700">₹{p.amount.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-slate-600">{p.method}</td>
                          <td className="p-3 text-slate-600 truncate max-w-[160px]">{p.destination}</td>
                          <td className="p-3 font-mono text-slate-500">{p.referenceId}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                p.status === 'settled'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Order-Level View */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by Order ID, Customer, Phone, Items..."
                    className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-emerald-500"
                  />
                </div>
                <div className="text-xs text-slate-500 font-semibold">
                  Showing {filteredOrderRows.length} of {report.orderRows.length} items
                </div>
              </div>

              {filteredOrderRows.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No matching orders in this timeframe</p>
                  <p className="text-[11px] text-slate-400">Try adjusting the period filter or search keywords.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-[420px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] sticky top-0 z-10">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Details / Items</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Gross (₹)</th>
                        <th className="p-3">Net Credit (₹)</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredOrderRows.map((o) => (
                        <tr key={o.orderId} className="hover:bg-slate-50/80 transition font-medium">
                          <td className="p-3 font-mono font-bold text-slate-900">{o.orderId}</td>
                          <td className="p-3 text-slate-600 whitespace-nowrap">{o.date}</td>
                          <td className="p-3 font-semibold text-slate-800">
                            <div>{o.customerName}</div>
                            <div className="text-[10px] text-slate-400">{o.customerPhone}</div>
                          </td>
                          <td className="p-3 text-slate-600 max-w-[200px] truncate" title={o.details}>
                            {o.details}
                          </td>
                          <td className="p-3 text-slate-600">{o.paymentMethod}</td>
                          <td className="p-3 font-bold text-slate-900">₹{o.orderAmount}</td>
                          <td className="p-3 font-black text-emerald-700">₹{o.netCredit}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                o.status === 'DELIVERED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.status === 'CANCELLED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Audit Verified • LIKART Platform Treasury</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Excel</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
