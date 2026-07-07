import React from 'react';
import { Search, Download, Eye, Edit2, Trash2, ChevronUp, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { exportLeadsToCsv } from '../utils/exportCsv';

const LeadTable = ({
  leads,
  search,
  setSearch,
  bookingFilter,
  setBookingFilter,
  jobFilter,
  setJobFilter,
  paymentFilter,
  setPaymentFilter,
  sortBy,
  sortOrder,
  handleSort,
  onView,
  onEdit,
  onDelete
}) => {
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

  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp size={14} style={{ marginLeft: '4px' }} /> : <ChevronDown size={14} style={{ marginLeft: '4px' }} />;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
      
      {/* Controls Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search Lead ID, Name, Phone, Area, Service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input"
            style={{ width: '100%', paddingLeft: '40px' }}
          />
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filters:</span>
          </div>

          <select
            value={bookingFilter}
            onChange={(e) => setBookingFilter(e.target.value)}
            className="glass-input"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="All">All Bookings</option>
            <option value="Pending">Pending</option>
            <option value="Booked">Booked</option>
            <option value="Non-Booking">Non-Booking</option>
          </select>

          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="glass-input"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="All">All Job Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="glass-input"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <option value="All">All Payments</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={() => exportLeadsToCsv(leads)}
            className="btn btn-primary"
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          >
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container">
        {leads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            No leads found matching current search and filter parameters.
          </div>
        ) : (
          <table className="lead-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('leadId')}>Lead ID {renderSortIcon('leadId')}</th>
                <th onClick={() => handleSort('customerName')}>Customer {renderSortIcon('customerName')}</th>
                <th>Phone</th>
                <th onClick={() => handleSort('area')}>Area {renderSortIcon('area')}</th>
                <th onClick={() => handleSort('serviceRequested')}>Service {renderSortIcon('serviceRequested')}</th>
                <th>Booking Status</th>
                <th>Job Status</th>
                <th onClick={() => handleSort('finalPrice')} style={{ textAlign: 'right' }}>Final Price {renderSortIcon('finalPrice')}</th>
                <th onClick={() => handleSort('grossProfit')} style={{ textAlign: 'right' }}>Gross Profit {renderSortIcon('grossProfit')}</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td className="number-font" style={{ fontWeight: 700, color: 'var(--primary)' }}>{lead.leadId}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{lead.customerName}</span>
                      {lead.repeatCustomer === 'Y' && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-completed)', fontWeight: 600 }}>[Repeat Customer]</span>
                      )}
                    </div>
                  </td>
                  <td className="number-font">{lead.phoneNumber}</td>
                  <td>{lead.area}</td>
                  <td>{lead.serviceRequested}</td>
                  <td>{getBookingStatusBadge(lead.bookingStatus)}</td>
                  <td>{getJobStatusBadge(lead.jobStatus)}</td>
                  <td className="number-font" style={{ textAlign: 'right', fontWeight: 600 }}>₹{(lead.finalPrice || 0).toLocaleString('en-IN')}</td>
                  <td className="number-font" style={{
                    textAlign: 'right',
                    fontWeight: 700,
                    color: (lead.grossProfit || 0) >= 0 ? 'var(--color-completed)' : 'var(--color-nonbooking)'
                  }}>
                    ₹{(lead.grossProfit || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button
                        title="View Full Details"
                        onClick={(e) => { e.stopPropagation(); onView(lead); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex'
                        }}
                        onMouseEnter={el => el.currentTarget.style.color = 'var(--primary)'}
                        onMouseLeave={el => el.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="Edit Lead"
                        onClick={(e) => { e.stopPropagation(); onEdit(lead); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex'
                        }}
                        onMouseEnter={el => el.currentTarget.style.color = 'var(--secondary)'}
                        onMouseLeave={el => el.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        title="Delete Record"
                        onClick={(e) => { e.stopPropagation(); onDelete(lead._id); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          display: 'flex'
                        }}
                        onMouseEnter={el => el.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={el => el.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default LeadTable;
