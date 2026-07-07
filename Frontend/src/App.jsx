import React, { useState, useEffect } from 'react';
import { LayoutGrid, Sun, Moon, Database, LogOut } from 'lucide-react';
import DashboardStats from './components/DashboardStats';
import LeadForm from './components/LeadForm';
import LeadTable from './components/LeadTable';
import LeadDetailsModal from './components/LeadDetailsModal';
import Loader from './components/Loader';
import AnalyticsView from './components/AnalyticsView';
import LoginView from './components/LoginView';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null: loading, boolean once resolved

  // Filtering & Sorting State
  const [search, setSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Detail / Form State
  const [editingLead, setEditingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [formKey, setFormKey] = useState(0);
  
  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [activeView, setActiveView] = useState('dashboard');

  // Apply Theme on startup
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Check auth session on startup
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/check`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(!!data.authenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Session verification error:', err);
        setIsAuthenticated(false);
      }
    };
    verifySession();
  }, []);

  // Fetch stats from backend
  const fetchStats = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch leads from backend
  const fetchLeads = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        bookingStatus: bookingFilter,
        jobStatus: jobFilter,
        paymentStatus: paymentFilter,
        sortBy,
        sortOrder
      });
      const response = await fetch(`${API_BASE_URL}/leads?${queryParams}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search & automatic refetch on filter change
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        fetchLeads();
      }, 300); // 300ms debounce
      return () => clearTimeout(timer);
    }
  }, [search, bookingFilter, jobFilter, paymentFilter, sortBy, sortOrder, isAuthenticated]);

  // Load stats once and whenever database changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [leads.length, isAuthenticated]); // trigger stat updates when lead counts change

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSaveLead = async (formData) => {
    try {
      let response;
      if (editingLead) {
        // Update operation
        response = await fetch(`${API_BASE_URL}/leads/${editingLead._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          credentials: 'include'
        });
      } else {
        // Create operation
        response = await fetch(`${API_BASE_URL}/leads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          credentials: 'include'
        });
      }

      if (response.ok) {
        setEditingLead(null);
        setFormKey(prev => prev + 1); // Reset form inputs after successful submit
        fetchLeads();
        fetchStats();
        alert(editingLead ? 'Lead updated successfully!' : 'Lead registered successfully!');
      } else {
        const errData = await response.json();
        alert(`Error: ${errData.message || 'Failed to save lead'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Network error connecting to backend server');
    }
  };

  const handleDeleteLead = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this lead record?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (response.ok) {
          fetchLeads();
          fetchStats();
          alert('Lead deleted successfully');
        } else {
          alert('Failed to delete lead');
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('Network error connecting to backend');
      }
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setIsAuthenticated(false);
        setLeads([]);
        setStats({});
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 1. Checking auth status loader
  if (isAuthenticated === null) {
    return (
      <div className="fullscreen-loader-container">
        <Loader message="Decrypting session credentials..." />
      </div>
    );
  }

  // 2. Render Login Screen
  if (isAuthenticated === false) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} apiUrl={API_BASE_URL} />;
  }

  // 3. Render Dashboard
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header animate-fade-in">
        <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src="/logo.jpg" 
            alt="Gigiman Logo" 
            style={{ 
              height: '80px', 
              borderRadius: '8px', 
              objectFit: 'contain',
              boxShadow: 'var(--shadow-md)'
            }} 
          />
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Gigiman Lead Management System
            </p>
            <span className="admin-session-badge">Admin Authenticated</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <button onClick={handleLogout} className="logout-btn" title="Sign Out">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* View Switcher Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        gap: '24px'
      }}>
        <button 
          onClick={() => setActiveView('dashboard')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 4px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeView === 'dashboard' ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: activeView === 'dashboard' ? '2px solid var(--text-primary)' : '2px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          Leads Manager
        </button>
        <button 
          onClick={() => setActiveView('analytics')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 4px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            color: activeView === 'analytics' ? 'var(--text-primary)' : 'var(--text-muted)',
            borderBottom: activeView === 'analytics' ? '2px solid var(--text-primary)' : '2px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          Campaign & Source Analytics
        </button>
      </div>

      {activeView === 'dashboard' ? (
        <>
          {/* Stats Section */}
          <DashboardStats stats={stats} />

          {/* Form / Actions Section */}
          <LeadForm
            key={formKey}
            lead={editingLead}
            onSave={handleSaveLead}
            onCancel={() => setEditingLead(null)}
          />

          {/* Lead Sheet Data Table */}
          {loading ? (
            <div className="glass-panel" style={{ padding: '40px' }}>
              <Loader message="Synchronizing with MongoDB instance..." />
            </div>
          ) : (
            <LeadTable
              leads={leads}
              search={search}
              setSearch={setSearch}
              bookingFilter={bookingFilter}
              setBookingFilter={setBookingFilter}
              jobFilter={jobFilter}
              setJobFilter={setJobFilter}
              paymentFilter={paymentFilter}
              setPaymentFilter={setPaymentFilter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
              onView={setViewingLead}
              onEdit={(lead) => {
                setEditingLead(lead);
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              onDelete={handleDeleteLead}
            />
          )}
        </>
      ) : (
        <AnalyticsView leads={leads} />
      )}

      {/* Details Sheet Modal */}
      {viewingLead && (
        <LeadDetailsModal
          lead={viewingLead}
          onClose={() => setViewingLead(null)}
        />
      )}
    </div>
  );
}

export default App;
