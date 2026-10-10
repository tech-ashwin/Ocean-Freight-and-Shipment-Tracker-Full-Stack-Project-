import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Shipment, ContainerType } from '../types';
import { CURRENT_DATE_STRING } from '../data/initialData';

interface AddShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShipment: (newShipment: Shipment) => void;
  nextIdSuggestion?: string;
}

export const AddShipmentModal: React.FC<AddShipmentModalProps> = ({
  isOpen,
  onClose,
  onAddShipment,
  nextIdSuggestion = 'SH006',
}) => {
  const [shipmentId, setShipmentId] = useState(nextIdSuggestion);
  const [carrier, setCarrier] = useState('OceanLink Lines');
  const [originPort, setOriginPort] = useState('Nhava Sheva');
  const [destinationPort, setDestinationPort] = useState('Los Angeles');
  const [containerType, setContainerType] = useState<ContainerType>('40ft');
  const [departureDate, setDepartureDate] = useState('2026-10-01');
  const [expectedArrival, setExpectedArrival] = useState('2026-10-18');
  const [contractedRate, setContractedRate] = useState('2150');
  const [invoiceAmount, setInvoiceAmount] = useState('2150');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentId.trim() || !carrier || !originPort || !destinationPort) return;

    // Check if expected arrival is in the past compared to CURRENT_DATE_STRING
    const arrivalDate = new Date(`${expectedArrival}T00:00:00`);
    const today = new Date(`${CURRENT_DATE_STRING}T00:00:00`);
    const isDelayed = arrivalDate < today;

    const newShipment: Shipment = {
      id: `s_${Date.now()}`,
      shipment_id: shipmentId.trim().toUpperCase(),
      carrier,
      origin_port: originPort,
      destination_port: destinationPort,
      container_type: containerType,
      departure_date: departureDate,
      expected_arrival: expectedArrival,
      delivered_date: null,
      status: isDelayed ? 'Delayed' : 'In Transit',
      contracted_rate_usd: parseFloat(contractedRate) || 1500,
      invoice_amount_usd: invoiceAmount ? parseFloat(invoiceAmount) : undefined,
    };

    onAddShipment(newShipment);
    onClose();
  };

  return (
    <div
      aria-labelledby="modal-headline"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900" id="modal-headline">
              Add New Shipment
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Enter ocean freight shipment details to begin tracking.
            </p>
          </div>
          <button
            className="text-slate-400 hover:text-slate-600 transition p-1.5 rounded-md hover:bg-slate-100 focus:outline-none cursor-pointer"
            onClick={onClose}
            title="Close"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* 1. ID Field */}
            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1.5"
                htmlFor="modal-shipment-id"
              >
                Shipment ID <span className="text-rose-500">*</span>
              </label>
              <input
                className="w-full text-xs rounded border border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 shadow-none text-slate-800 bg-white"
                id="modal-shipment-id"
                placeholder="e.g. SH006"
                required
                type="text"
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
              />
            </div>

            {/* 2. Carrier Field */}
            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1.5"
                htmlFor="modal-carrier"
              >
                Carrier <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full text-xs rounded border border-slate-300 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 shadow-none bg-white"
                id="modal-carrier"
                required
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              >
                <option value="OceanLink Lines">OceanLink Lines</option>
                <option value="BlueWave Shipping">BlueWave Shipping</option>
                <option value="GlobalMariner">GlobalMariner</option>
                <option value="PacificStar Line">PacificStar Line</option>
                <option value="AtlasSea Carriers">AtlasSea Carriers</option>
                <option value="MSC">MSC</option>
                <option value="Maersk">Maersk</option>
                <option value="CMA CGM">CMA CGM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 3. Origin Field */}
            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1.5"
                htmlFor="modal-origin-port"
              >
                Origin <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full text-xs rounded border border-slate-300 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 shadow-none bg-white"
                id="modal-origin-port"
                required
                value={originPort}
                onChange={(e) => setOriginPort(e.target.value)}
              >
                <option value="Nhava Sheva">Nhava Sheva</option>
                <option value="Mundra">Mundra</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Shanghai">Shanghai</option>
                <option value="Singapore">Singapore</option>
                <option value="Hamburg">Hamburg</option>
              </select>
            </div>

            {/* 4. Destination Field */}
            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1.5"
                htmlFor="modal-destination-port"
              >
                Destination <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full text-xs rounded border border-slate-300 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 shadow-none bg-white"
                id="modal-destination-port"
                required
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
              >
                <option value="Los Angeles">Los Angeles</option>
                <option value="New York">New York</option>
                <option value="Savannah">Savannah</option>
                <option value="Houston">Houston</option>
                <option value="Long Beach">Long Beach</option>
                <option value="Norfolk">Norfolk</option>
                <option value="Rotterdam">Rotterdam</option>
                <option value="Dubai">Dubai</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Container */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Container Type
              </label>
              <select
                className="w-full text-xs rounded border border-slate-300 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-2.5 shadow-none bg-white"
                value={containerType}
                onChange={(e) => setContainerType(e.target.value as ContainerType)}
              >
                <option value="40ft">40ft</option>
                <option value="20ft">20ft</option>
              </select>
            </div>

            {/* 5. Departure Date Field */}
            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1.5"
                htmlFor="modal-departure-date"
              >
                Departure Date <span className="text-rose-500">*</span>
              </label>
              <input
                className="w-full text-xs rounded border border-slate-300 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-2.5 shadow-none bg-white"
                id="modal-departure-date"
                required
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>

            {/* 6. Expected Arrival Field */}
            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1.5"
                htmlFor="modal-expected-arrival"
              >
                Expected Arrival <span className="text-rose-500">*</span>
              </label>
              <input
                className="w-full text-xs rounded border border-slate-300 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-2.5 shadow-none bg-white"
                id="modal-expected-arrival"
                required
                type="date"
                value={expectedArrival}
                onChange={(e) => setExpectedArrival(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Contracted Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contracted Rate (USD)
              </label>
              <input
                type="number"
                className="w-full text-xs rounded border border-slate-300 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 shadow-none bg-white"
                value={contractedRate}
                onChange={(e) => setContractedRate(e.target.value)}
                placeholder="e.g. 2150"
              />
            </div>
            {/* Initial Invoice Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Invoice Amount (USD)
              </label>
              <input
                type="number"
                className="w-full text-xs rounded border border-slate-300 text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-2 px-3 shadow-none bg-white"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder="e.g. 2150"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded transition"
              id="cancel-shipment-btn"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-[#1a68e5] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-semibold rounded shadow-sm transition"
              id="save-shipment-btn"
              type="submit"
            >
              Save Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
