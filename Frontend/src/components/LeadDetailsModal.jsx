import React from 'react';
import { X, Calendar, User, Phone, MapPin, DollarSign, Wrench, ShieldAlert, Award, Star } from 'lucide-react';

const LeadDetailsModal = ({ lead, onClose }) => {
  if (!lead) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const formatted = new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return <span className="number-font">{formatted}</span>;
  };

  const formatCurrency = (val) => {
    return <span className="number-font">₹{(val || 0).toLocaleString('en-IN')}</span>;
  };

  const getBookingStatusBadge = (status) => {
    switch (status) {
      case 'Booked': return <span className="badge badge-booked">Booked</span>;
      case 'Non-Booking': return <span className="badge badge-nonbooking">Non-Booking</span>;
      default: return <span className="badge badge-pending">Pending</span>;
    }
  };

  const getJobStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <span className="badge badge-completed">Completed</span>;
      case 'In Progress': return <span className="badge badge-inprogress">In Progress</span>;
      case 'Cancelled': return <span className="badge badge-cancelled">Cancelled</span>;
      default: return <span className="badge badge-pending">Pending</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="badge badge-paid">Paid</span>;
      case 'Failed': return <span className="badge badge-failed">Failed</span>;
      default: return <span className="badge badge-pending">Pending</span>;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel animate-scale-in" style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-surface)',
          zIndex: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="number-font" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', padding: '4px 8px', borderRadius: '4px' }}>
                {lead.leadId || 'NEW'}
              </span>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Lead Details</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Created on {formatDate(lead.createdAt)}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
             onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          
          {/* Group 1: Customer Profile */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
              <User size={18} /> Customer Profile
            </h3>
            <div className="grid-3">
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Customer Name</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{lead.customerName}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Phone Number</label>
                <p className="number-font" style={{ fontWeight: 500, marginTop: '2px' }}>{lead.phoneNumber}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Repeat Customer</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>
                  <span className={`badge ${lead.repeatCustomer === 'Y' ? 'badge-booked' : 'badge-cancelled'}`}>
                    {lead.repeatCustomer || 'N'}
                  </span>
                </p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Area</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{lead.area}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pincode</label>
                <p className="number-font" style={{ fontWeight: 500, marginTop: '2px' }}>{lead.pincode}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Lead Date</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{formatDate(lead.leadDate)}</p>
              </div>
            </div>
          </div>

          {/* Group 2: Lead Acquisition & Operations */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
              <Wrench size={18} /> Acquisition & Operations
            </h3>
            <div className="grid-3">
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Lead Source</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{lead.leadSource || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Campaign Name</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{lead.campaignName || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Service Requested</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{lead.serviceRequested}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Booking Status</label>
                <div style={{ marginTop: '2px' }}>{getBookingStatusBadge(lead.bookingStatus)}</div>
              </div>
              {lead.bookingStatus === 'Non-Booking' && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Non-Booking Reason</label>
                  <p style={{ fontWeight: 500, marginTop: '2px', color: '#ef4444' }}>{lead.nonBookingReason || 'N/A'}</p>
                </div>
              )}
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Follow-up Status</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{lead.followUpStatus || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Next Follow-up Date</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{formatDate(lead.nextFollowUpDate)}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Employee</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{lead.assignedEmployee || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Provider</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{lead.assignedProvider || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Group 3: Schedule & Execution */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
              <Calendar size={18} /> Schedule & Execution
            </h3>
            <div className="grid-3">
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Booking Date</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{formatDate(lead.bookingDate)}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Service Date</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{formatDate(lead.serviceDate)}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Service Time</label>
                <p className="number-font" style={{ fontWeight: 500, marginTop: '2px' }}>
                  {lead.serviceStartTime ? `${lead.serviceStartTime} - ${lead.serviceEndTime || 'End N/A'}` : 'N/A'}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Job Status</label>
                <div style={{ marginTop: '2px' }}>{getJobStatusBadge(lead.jobStatus)}</div>
              </div>
            </div>
          </div>

          {/* Group 4: Pricing & Financials */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
              <DollarSign size={18} /> Pricing & Financials
            </h3>
            <div className="grid-3" style={{ gap: '16px 20px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Quoted Price</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{formatCurrency(lead.quotedPrice)}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Discount Allowed</label>
                <p style={{ fontWeight: 500, marginTop: '2px', color: '#ef4444' }}>- {formatCurrency(lead.discount)}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Final Price Collected</label>
                <p style={{ fontWeight: 700, marginTop: '2px', color: 'var(--primary)' }}>{formatCurrency(lead.finalPrice)}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Provider Payout</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{formatCurrency(lead.providerPayout)}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Travel Cost</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{formatCurrency(lead.travelCost)}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Material Cost</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{formatCurrency(lead.materialCost)}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Other Expenses</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{formatCurrency(lead.otherExpenses)}</p>
              </div>
              
              {/* Highlight Gross Profit */}
              <div className="glass-panel" style={{
                gridColumn: 'span 2',
                padding: '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: (lead.grossProfit || 0) >= 0 ? 'var(--bg-completed)' : 'var(--bg-nonbooking)',
                border: 'none'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Gross Profit</span>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: (lead.grossProfit || 0) >= 0 ? 'var(--color-completed)' : 'var(--color-nonbooking)'
                }}>
                  {formatCurrency(lead.grossProfit)}
                </span>
              </div>
            </div>
            
            {/* Payment Sub-section */}
            <div className="grid-3" style={{ marginTop: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Payment Status</label>
                <div style={{ marginTop: '2px' }}>{getPaymentStatusBadge(lead.paymentStatus)}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Payment Method</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>{lead.paymentMethod || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Group 5: Feedback & Audits */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
              <Award size={18} /> Customer Review & Complaints
            </h3>
            <div className="grid-3" style={{ marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Rating</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < (lead.customerRating || 0) ? '#f59e0b' : 'none'}
                      color={i < (lead.customerRating || 0) ? '#f59e0b' : 'var(--text-muted)'}
                    />
                  ))}
                  <span className="number-font" style={{ fontSize: '0.9rem', fontWeight: 600, marginLeft: '6px' }}>({lead.customerRating || 0})</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Complaint Flag</label>
                <p style={{ fontWeight: 500, marginTop: '2px' }}>
                  <span className={`badge ${lead.complaint === 'Y' ? 'badge-nonbooking' : 'badge-completed'}`}>
                    {lead.complaint === 'Y' ? 'YES (Y)' : 'NO (N)'}
                  </span>
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Customer Review Comments</label>
                <p style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  marginTop: '4px',
                  color: lead.customerReview ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontStyle: lead.customerReview ? 'normal' : 'italic'
                }}>
                  {lead.customerReview || 'No customer comments registered.'}
                </p>
              </div>
              
              {lead.complaint === 'Y' && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', color: '#ef4444' }}>Complaint Details</label>
                  <p style={{
                    padding: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    marginTop: '4px',
                    color: 'var(--text-primary)'
                  }}>
                    {lead.complaintDetails || 'Complaint registered without details.'}
                  </p>
                </div>
              )}

              {lead.remarks && (
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Operations Remarks</label>
                  <p style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    marginTop: '4px',
                    color: 'var(--text-primary)'
                  }}>
                    {lead.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-primary)',
          borderBottomLeftRadius: 'var(--radius-md)',
          borderBottomRightRadius: 'var(--radius-md)'
        }}>
          <button className="btn btn-secondary" onClick={onClose}>Close Detail Sheet</button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
