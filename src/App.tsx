import { useState, useEffect } from 'react';
import {
  ActiveNav,
  CarrierRate,
  Shipment,
  EmailRecord,
  ActivityUpdate,
  UserAccount,
  ShipmentStatus,
} from './types';
import {
  INITIAL_USER,
  INITIAL_RATES,
  INITIAL_SHIPMENTS,
  INITIAL_EMAILS,
  INITIAL_UPDATES,
  CURRENT_DATE_STRING,
} from './data/initialData';
import { applyEmailUpdates } from './utils/parser';

// Components
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { EmailDetailsModal } from './components/EmailDetailsModal';
import { AddShipmentModal } from './components/AddShipmentModal';

// Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { RateSearchView } from './views/RateSearchView';
import { ShipmentTrackerView } from './views/ShipmentTrackerView';
import { InvoiceCheckerView } from './views/InvoiceCheckerView';
import { EmailProcessorView } from './views/EmailProcessorView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [user, setUser] = useState<UserAccount>(INITIAL_USER);
  const [activeNav, setActiveNav] = useState<ActiveNav>('dashboard');

  // Core application data state
  const [rates, setRates] = useState<CarrierRate[]>(() => {
    const saved = localStorage.getItem('bluspark_rates');
    return saved ? JSON.parse(saved) : INITIAL_RATES;
  });

  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const saved = localStorage.getItem('bluspark_shipments');
    const initialList = saved ? JSON.parse(saved) : INITIAL_SHIPMENTS;
    // Auto-evaluate delay rule: past arrival date and not delivered
    const today = new Date(`${CURRENT_DATE_STRING}T00:00:00`);
    return initialList.map((s: Shipment) => {
      if (s.status !== 'Delivered') {
        const arr = new Date(`${s.expected_arrival}T00:00:00`);
        if (arr < today) {
          return { ...s, status: 'Delayed' as ShipmentStatus };
        }
      }
      return s;
    });
  });

  const [emails, setEmails] = useState<EmailRecord[]>(() => {
    const saved = localStorage.getItem('bluspark_emails');
    return saved ? JSON.parse(saved) : INITIAL_EMAILS;
  });

  const [activityUpdates, setActivityUpdates] = useState<ActivityUpdate[]>(() => {
    const saved = localStorage.getItem('bluspark_activities');
    return saved ? JSON.parse(saved) : INITIAL_UPDATES;
  });

  // Modal states
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isAddShipmentModalOpen, setIsAddShipmentModalOpen] = useState(false);
  const [auditShipmentId, setAuditShipmentId] = useState('SH001');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('bluspark_rates', JSON.stringify(rates));
  }, [rates]);

  useEffect(() => {
    localStorage.setItem('bluspark_shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('bluspark_emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('bluspark_activities', JSON.stringify(activityUpdates));
  }, [activityUpdates]);

  // Auth Handlers
  const handleLogin = (userAccount: UserAccount) => {
    setUser(userAccount);
    setIsAuthenticated(true);
    setActiveNav('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleToggleRole = () => {
    setUser((prev) => ({
      ...prev,
      role: prev.role === 'Admin' ? 'User' : 'Admin',
    }));
  };

  // Shipment Handlers
  const handleAddShipment = (newShipment: Shipment) => {
    setShipments((prev) => [newShipment, ...prev]);
    // Also record activity
    setActivityUpdates((prev) => [
      {
        id: `ACT_${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeAgo: 'Just now',
        type: 'shipment',
        title: `New shipment created: ${newShipment.shipment_id}`,
        subtitle: `${newShipment.carrier} | ${newShipment.origin_port} → ${newShipment.destination_port}`,
        badgeColor: 'blue',
      },
      ...prev,
    ]);
  };

  const handleUpdateShipmentStatus = (
    id: string,
    newStatus: ShipmentStatus,
    deliveredDate?: string
  ) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status: newStatus,
            delivered_date: deliveredDate || s.delivered_date,
          };
        }
        return s;
      })
    );
  };

  const handleAuditInvoice = (shipmentId: string) => {
    setAuditShipmentId(shipmentId);
    setActiveNav('invoice_checker');
  };

  // Email processing batch execution
  const handleProcessAllEmails = () => {
    let currentRates = [...rates];
    let currentShipments = [...shipments];
    const newActivities: ActivityUpdate[] = [];

    const updatedEmails = emails.map((em) => {
      if (!em.processed && em.type !== 'Irrelevant') {
        const result = applyEmailUpdates(em, currentRates, currentShipments);
        currentRates = result.updatedRates;
        currentShipments = result.updatedShipments;
        if (result.newActivity) {
          newActivities.push(result.newActivity);
        }
        return { ...em, processed: true };
      }
      return em;
    });

    setEmails(updatedEmails);
    setRates(currentRates);
    setShipments(currentShipments);
    if (newActivities.length > 0) {
      setActivityUpdates((prev) => [...newActivities, ...prev]);
    }
  };

  // Reset to initial baseline
  const handleResetRates = () => {
    setRates(INITIAL_RATES);
    localStorage.removeItem('bluspark_rates');
  };

  const handleResetShipments = () => {
    setShipments(INITIAL_SHIPMENTS);
    localStorage.removeItem('bluspark_shipments');
  };

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="bg-[#f0f4f9] text-slate-800 antialiased min-h-screen flex selection:bg-blue-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        onNavigate={setActiveNav}
        onLogout={handleLogout}
        pendingEmailCount={emails.filter((e) => !e.processed && e.type !== 'Irrelevant').length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopBar user={user} onToggleRole={handleToggleRole} />

        {/* Viewport Router */}
        {activeNav === 'dashboard' && (
          <DashboardView
            user={user}
            shipments={shipments}
            onNavigate={setActiveNav}
            onOpenAddShipment={() => setIsAddShipmentModalOpen(true)}
          />
        )}

        {activeNav === 'rate_search' && (
          <RateSearchView
            rates={rates}
            onImportRates={(newRates) => setRates((prev) => [...newRates, ...prev])}
            onResetRates={handleResetRates}
          />
        )}

        {activeNav === 'shipment_tracker' && (
          <ShipmentTrackerView
            shipments={shipments}
            onOpenAddModal={() => setIsAddShipmentModalOpen(true)}
            onUpdateStatus={handleUpdateShipmentStatus}
            onCheckInvoice={handleAuditInvoice}
            onResetShipments={handleResetShipments}
          />
        )}

        {activeNav === 'invoice_checker' && (
          <InvoiceCheckerView
            shipments={shipments}
            initialShipmentId={auditShipmentId}
          />
        )}

        {activeNav === 'email_processor' && (
          <EmailProcessorView
            emails={emails}
            activityUpdates={activityUpdates}
            onOpenEmailDetails={(email) => {
              setSelectedEmail(email);
              setIsEmailModalOpen(true);
            }}
            onProcessAllEmails={handleProcessAllEmails}
          />
        )}
      </div>

      {/* Global Modals */}
      <EmailDetailsModal
        email={selectedEmail}
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedEmail(null);
        }}
      />

      <AddShipmentModal
        isOpen={isAddShipmentModalOpen}
        onClose={() => setIsAddShipmentModalOpen(false)}
        onAddShipment={handleAddShipment}
        nextIdSuggestion={`SH00${shipments.length + 1}`}
      />
    </div>
  );
}
