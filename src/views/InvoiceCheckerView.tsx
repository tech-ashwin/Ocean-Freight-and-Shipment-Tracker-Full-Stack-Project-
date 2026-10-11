import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Shipment } from '../types';

interface InvoiceCheckerViewProps {
  shipments: Shipment[];
  initialShipmentId?: string;
}

export const InvoiceCheckerView: React.FC<InvoiceCheckerViewProps> = ({
  shipments,
  initialShipmentId = 'SH001',
}) => {
  const [selectedShipmentId, setSelectedShipmentId] = useState(initialShipmentId);
  const [contractedRate, setContractedRate] = useState('1500');
  const [invoiceAmount, setInvoiceAmount] = useState('1700');
  const [currency, setCurrency] = useState('USD');
  const [inrRate, setInrRate] = useState('83.5');
  const [convertedInr, setConvertedInr] = useState<number>(16700);

  // Result state after clicking Check
  const [checkResult, setCheckResult] = useState<{
    contracted: number;
    invoice: number;
    diff: number;
    currency: string;
    isOvercharged: boolean;
    isEqual: boolean;
    isUndercharged: boolean;
  }>({
    contracted: 1500,
    invoice: 1700,
    diff: 200,
    currency: 'USD',
    isOvercharged: true,
    isEqual: false,
    isUndercharged: false,
  });

  // Whenever initialShipmentId changes
  useEffect(() => {
    if (initialShipmentId) {
      handleShipmentChange(initialShipmentId);
    }
  }, [initialShipmentId]);

  const handleShipmentChange = (shipmentId: string) => {
    setSelectedShipmentId(shipmentId);
    const target = shipments.find(
      (s) => s.shipment_id.toUpperCase() === shipmentId.toUpperCase()
    );
    if (target) {
      const contract = target.contracted_rate_usd;
      const invoice = target.invoice_amount_usd ?? target.contracted_rate_usd;
      setContractedRate(contract.toString());
      setInvoiceAmount(invoice.toString());
      runCheck(contract, invoice, currency);
    }
  };

  const runCheck = (contractVal: number, invoiceVal: number, currVal: string) => {
    const diff = invoiceVal - contractVal;
    const isOvercharged = diff > 0;
    const isEqual = diff === 0;
    const isUndercharged = diff < 0;

    setCheckResult({
      contracted: contractVal,
      invoice: invoiceVal,
      diff: Math.abs(diff),
      currency: currVal,
      isOvercharged,
      isEqual,
      isUndercharged,
    });

    // Recompute INR conversion if currency is USD
    const rateNum = parseFloat(inrRate) || 83.5;
    if (currVal === 'USD') {
      setConvertedInr(Math.round(Math.abs(diff) * rateNum));
    } else {
      setConvertedInr(Math.round(Math.abs(diff)));
    }
  };

  const handleCheckClick = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const c = parseFloat(contractedRate) || 0;
    const inv = parseFloat(invoiceAmount) || 0;
    runCheck(c, inv, currency);
  };

  const handleConvertClick = () => {
    const rateNum = parseFloat(inrRate) || 83.5;
    if (currency === 'USD') {
      setConvertedInr(Math.round(checkResult.diff * rateNum));
    } else {
      setConvertedInr(checkResult.diff);
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto" data-purpose="invoice-checker-view">
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
        {/* Page Heading */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Invoice Checker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verify invoices against contracted carrier rates to detect overcharging.
          </p>
        </div>

        {/* BEGIN: InputRowSection */}
        <section
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs"
          data-purpose="invoice-query-form"
        >
          <form
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4 items-end"
            onSubmit={handleCheckClick}
          >
            {/* Shipment ID Input */}
            <div>
              <label
                className="block text-xs font-semibold text-slate-600 mb-1.5"
                htmlFor="shipment-id"
              >
                Shipment ID
              </label>
              <div className="relative">
                <select
                  className="w-full text-sm rounded-md border border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-white text-slate-700"
                  id="shipment-id"
                  value={selectedShipmentId}
                  onChange={(e) => handleShipmentChange(e.target.value)}
                >
                  {shipments.map((s) => (
                    <option key={s.id} value={s.shipment_id}>
                      {s.shipment_id} ({s.carrier})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contracted Rate Input */}
            <div>
              <label
                className="block text-xs font-semibold text-slate-600 mb-1.5"
                htmlFor="contracted-rate"
              >
                Contracted Rate
              </label>
              <input
                className="w-full text-sm rounded-md border border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-slate-700 bg-white tabular-nums"
                id="contracted-rate"
                type="text"
                value={contractedRate}
                onChange={(e) => setContractedRate(e.target.value)}
              />
            </div>

            {/* Invoice Amount Input */}
            <div>
              <label
                className="block text-xs font-semibold text-slate-600 mb-1.5"
                htmlFor="invoice-amount"
              >
                Invoice Amount
              </label>
              <input
                className="w-full text-sm rounded-md border border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-slate-700 bg-white tabular-nums"
                id="invoice-amount"
                type="text"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
              />
            </div>

            {/* Currency Dropdown */}
            <div>
              <label
                className="block text-xs font-semibold text-slate-600 mb-1.5"
                htmlFor="currency-selector"
              >
                Currency
              </label>
              <div className="relative">
                <select
                  className="w-full text-sm rounded-md border border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 bg-white text-slate-700"
                  id="currency-selector"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>

            {/* Check Button */}
            <div>
              <button
                className="w-full bg-[#0066FF] hover:bg-[#0052cc] text-white font-medium text-sm py-2 px-4 rounded-md shadow-xs transition-colors duration-150 cursor-pointer h-[38px] flex items-center justify-center"
                type="submit"
              >
                Check
              </button>
            </div>
          </form>
        </section>
        {/* END: InputRowSection */}

        {/* BEGIN: OverchargedAlert / CorrectAlert */}
        {checkResult.isOvercharged && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3.5 animate-in fade-in duration-150"
            data-purpose="alert-overcharge"
          >
            {/* Alert Icon */}
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
              <span className="font-bold text-sm">!</span>
            </div>
            {/* Alert Text */}
            <div>
              <div className="text-sm font-bold text-red-600">
                Overcharged by {checkResult.currency} {checkResult.diff.toLocaleString()}
              </div>
              <div className="text-xs text-red-500 font-medium">
                Invoice amount is higher than the contracted rate.
              </div>
            </div>
          </div>
        )}

        {checkResult.isEqual && (
          <div
            className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center space-x-3.5 animate-in fade-in duration-150"
            data-purpose="alert-match"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-700">
                Correct Amount Charged
              </div>
              <div className="text-xs text-emerald-600 font-medium">
                Invoice amount is equal to the contracted rate
              </div>
            </div>
          </div>
        )}

        {checkResult.isUndercharged && (
          <div
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3.5 animate-in fade-in duration-150"
            data-purpose="alert-undercharge"
          >
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-blue-700">
                Undercharged by {checkResult.currency} {checkResult.diff.toLocaleString()}
              </div>
              <div className="text-xs text-blue-600 font-medium">
                Invoice amount is less than the contracted rate
              </div>
            </div>
          </div>
        )}
        {/* END: OverchargedAlert */}

        {/* BEGIN: RateComparisonCards */}
        <section
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs"
          data-purpose="rate-comparison-summary"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Item 1: Contracted Rate */}
            <div className="pb-4 md:pb-0 md:pr-6">
              <span className="text-xs font-semibold text-slate-500 block">
                Contracted Rate
              </span>
              <span className="text-xl font-bold text-slate-800 mt-1.5 block tabular-nums">
                {checkResult.currency} {checkResult.contracted.toLocaleString()}
              </span>
            </div>

            {/* Item 2: Invoice Amount */}
            <div className="py-4 md:py-0 md:px-6">
              <span className="text-xs font-semibold text-slate-500 block">
                Invoice Amount
              </span>
              <span className="text-xl font-bold text-slate-800 mt-1.5 block tabular-nums">
                {checkResult.currency} {checkResult.invoice.toLocaleString()}
              </span>
            </div>

            {/* Item 3: Difference */}
            <div className="pt-4 md:pt-0 md:pl-6">
              <span className="text-xs font-semibold text-slate-500 block">
                Difference
              </span>
              <span
                className={`text-xl font-bold mt-1.5 block tabular-nums ${
                  checkResult.isOvercharged
                    ? 'text-red-600'
                    : checkResult.isEqual
                    ? 'text-emerald-600'
                    : 'text-blue-600'
                }`}
              >
                {checkResult.currency} {checkResult.diff.toLocaleString()}
              </span>
            </div>
          </div>
        </section>
        {/* END: RateComparisonCards */}

        {/* BEGIN: CurrencyConversionSection */}
        <section
          className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs"
          data-purpose="currency-conversion-card"
        >
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            Currency Conversion (if needed)
          </h3>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Conversion Input Form Area */}
            <div className="flex items-end space-x-3 w-full max-w-sm">
              <div className="flex-1">
                <label
                  className="block text-xs font-semibold text-slate-600 mb-1.5"
                  htmlFor="rate-inr-usd"
                >
                  Rate (INR/USD)
                </label>
                <input
                  className="w-full text-sm rounded-md border border-slate-300 shadow-xs focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-slate-700 bg-white tabular-nums"
                  id="rate-inr-usd"
                  type="text"
                  value={inrRate}
                  onChange={(e) => setInrRate(e.target.value)}
                />
              </div>
              <div>
                <button
                  className="bg-[#0066FF] hover:bg-[#0052cc] text-white font-medium text-sm py-2 px-5 rounded-md shadow-xs transition-colors duration-150 cursor-pointer h-[38px]"
                  type="button"
                  onClick={handleConvertClick}
                >
                  Convert
                </button>
              </div>
            </div>

            {/* Result Area */}
            <div className="md:text-right pr-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Difference in INR
              </span>
              <span className="text-2xl font-bold text-slate-800 tabular-nums">
                ₹ {convertedInr.toLocaleString()}
              </span>
            </div>
          </div>
        </section>
        {/* END: CurrencyConversionSection */}
      </div>
    </main>
  );
};
