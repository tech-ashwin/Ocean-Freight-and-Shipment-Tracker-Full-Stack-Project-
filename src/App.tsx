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
import {
  getStoredToken,
  getStoredUser,
  clearStoredAuth,
  fetchRatesFromBackend,
  fetchShipmentsFromBackend,
  syncRatesToBackend,
  createShipmentOnBackend,
  updateShipmentStatusOnBackend,
  batchIngestEmailsToBackend,
} from './utils/auth';

// Components
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MobileBottomNav } from './components/MobileBottomNav';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if user has an existing session token and user profile
    const token = getStoredToken();
    const storedUser = getStoredUser();
    return !!(token && storedUser);
  });
  const [user, setUser] = useState<UserAccount>(() => {
    return getStoredUser() || INITIAL_USER;
  });
  const [activeNav, setActiveNav] = useState<ActiveNav>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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

  // Initial fetch from backend if available
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [backendRates, backendShipments] = await Promise.all([
          fetchRatesFromBackend(),
          fetchShipmentsFromBackend(),
        ]);
        if (isMounted) {
          if (backendRates && backendRates.length > 0) {
            setRates(backendRates);
          }
          if (backendShipments && backendShipments.length > 0) {
            setShipments(backendShipments);
          }
        }
      } catch (e) {
        console.warn('Backend data load fallback to local state:', e);
      }
    }
    loadBackendData();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Sync to local storage for offline state persistence
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
    clearStoredAuth();
    setIsAuthenticated(false);
  };

  const handleOpenAddShipment = () => {
    setIsAddShipmentModalOpen(true);
  };

  const handleImportRates = (newRates: CarrierRate[]) => {
    setRates((prev) => [...newRates, ...prev]);
    syncRatesToBackend(newRates).catch(console.error);
  };

  // Shipment Handlers
  const handleAddShipment = (newShipment: Shipment) => {
    setShipments((prev) => [newShipment, ...prev]);
    createShipmentOnBackend(newShipment).catch(console.error);
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

    const target = shipments.find((s) => s.id === id);
    if (target) {
      updateShipmentStatusOnBackend(target.shipment_id || id, newStatus, deliveredDate).catch(console.error);
      setActivityUpdates((prev) => [
        {
          id: `ACT_${Date.now()}`,
          timestamp: new Date().toISOString(),
          timeAgo: 'Just now',
          type: newStatus === 'Delayed' ? 'delayed' : 'shipment',
          title: `Shipment ${target.shipment_id} marked as ${newStatus}`,
          subtitle: `${target.carrier} | ${target.origin_port} → ${target.destination_port}`,
          badgeColor: newStatus === 'Delayed' ? 'rose' : 'blue',
        },
        ...prev,
      ]);
    }
  };

  const handleAuditInvoice = (shipmentId: string) => {
    setAuditShipmentId(shipmentId);
    setActiveNav('invoice_checker');
  };

  // Email processing batch execution
  const handleProcessAllEmails = () => {
    let currRates = [...rates];
    let currShipments = [...shipments];
    const newUpdates: ActivityUpdate[] = [];

    const updatedEmails = emails.map((email) => {
      if (email.processed || email.type === 'Irrelevant') return email;
      const { updatedRates, updatedShipments, newActivity } = applyEmailUpdates(
        email,
        currRates,
        currShipments
      );
      currRates = updatedRates;
      currShipments = updatedShipments;
      if (newActivity) newUpdates.push(newActivity);
      return { ...email, processed: true };
    });

    setEmails(updatedEmails);
    setRates(currRates);
    setShipments(currShipments);
    if (newUpdates.length > 0) {
      setActivityUpdates((prev) => [...newUpdates, ...prev]);
    }

    // Persist new rates and activities to backend
    batchIngestEmailsToBackend({
      updates: newUpdates,
      newRates: currRates,
      newShipmentStatuses: currShipments.map(s => ({
        shipment_id: s.shipment_id,
        status: s.status,
        delivered_date: s.delivered_date
      }))
    }).catch(console.error);
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
    <div className="bg-[#f0f4f9] text-slate-800 antialiased min-h-screen flex selection:bg-blue-500 selection:text-white relative">
      {/* Sidebar Navigation (Permanent on desktop, Drawer on mobile) */}
      <Sidebar
        activeNav={activeNav}
        onNavigate={(nav) => {
          setActiveNav(nav);
          setIsMobileMenuOpen(false);
        }}
        onLogout={handleLogout}
        pendingEmailCount={emails.filter((e) => !e.processed && e.type !== 'Irrelevant').length}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopBar
          user={user}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Viewport Router */}
        {activeNav === 'dashboard' && (
          <DashboardView
            user={user}
            shipments={shipments}
            onNavigate={setActiveNav}
            onOpenAddShipment={handleOpenAddShipment}
          />
        )}

        {activeNav === 'rate_search' && (
          <RateSearchView
            rates={rates}
            onImportRates={handleImportRates}
            onResetRates={handleResetRates}
          />
        )}

        {activeNav === 'shipment_tracker' && (
          <ShipmentTrackerView
            shipments={shipments}
            onOpenAddModal={handleOpenAddShipment}
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

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablets < md) */}
      <MobileBottomNav
        activeNav={activeNav}
        onNavigate={setActiveNav}
        pendingEmailCount={emails.filter((e) => !e.processed && e.type !== 'Irrelevant').length}
      />

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
