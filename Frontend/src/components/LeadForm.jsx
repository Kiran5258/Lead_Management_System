import React, { useState, useEffect } from 'react';
import { User, FileText, ClipboardList, DollarSign, ArrowRight, ArrowLeft, Save, Plus } from 'lucide-react';

const INITIAL_FORM_STATE = {
  customerName: '',
  phoneNumber: '',
  area: '',
  pincode: '',
  repeatCustomer: 'N',
  leadDate: new Date().toISOString().split('T')[0],
  leadSource: '',
  campaignName: '',
  serviceRequested: '',
  bookingStatus: 'Pending',
  nonBookingReason: '',
  followUpStatus: '',
  nextFollowUpDate: '',
  assignedEmployee: '',
  assignedProvider: '',
  bookingDate: '',
  serviceDate: '',
  serviceStartTime: '',
  serviceEndTime: '',
  jobStatus: 'Pending',
  customerRating: 5,
  customerReview: '',
  complaint: 'N',
  complaintDetails: '',
  quotedPrice: 0,
  discount: 0,
  finalPrice: 0,
  providerPayout: 0,
  travelCost: 0,
  materialCost: 0,
  otherExpenses: 0,
  grossProfit: 0,
  paymentStatus: 'Pending',
  paymentMethod: 'N/A',
  remarks: ''
};

const LeadForm = ({ lead, onSave, onCancel }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when editing a lead
  useEffect(() => {
    if (lead) {
      const formattedLead = { ...lead };
      // Format date fields to YYYY-MM-DD for standard html inputs
      const dateFields = ['leadDate', 'nextFollowUpDate', 'bookingDate', 'serviceDate'];
      dateFields.forEach(field => {
        if (formattedLead[field]) {
          formattedLead[field] = new Date(formattedLead[field]).toISOString().split('T')[0];
        } else {
          formattedLead[field] = '';
        }
      });
      setFormData({ ...INITIAL_FORM_STATE, ...formattedLead });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setActiveTab(0);
    setErrors({});
    setIsSubmitting(false);
  }, [lead]);

  // Calculate financial maths in real-time during render
  const finalPrice = (Number(formData.quotedPrice) || 0) - (Number(formData.discount) || 0);
  const grossProfit = finalPrice - (Number(formData.providerPayout) || 0) - (Number(formData.travelCost) || 0) - (Number(formData.materialCost) || 0) - (Number(formData.otherExpenses) || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for that field if edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateTab = (tabIndex) => {
    const tempErrors = {};
    if (tabIndex === 0) {
      if (!(formData.customerName || '').trim()) tempErrors.customerName = 'Customer Name is required';
      if (!(formData.phoneNumber || '').trim()) tempErrors.phoneNumber = 'Phone Number is required';
      if (!(formData.area || '').trim()) tempErrors.area = 'Area is required';
      if (!(formData.pincode || '').trim()) tempErrors.pincode = 'Pincode is required';
    } else if (tabIndex === 1) {
      if (!(formData.serviceRequested || '').trim()) tempErrors.serviceRequested = 'Service requested is required';
      if (formData.bookingStatus === 'Non-Booking' && !(formData.nonBookingReason || '').trim()) {
        tempErrors.nonBookingReason = 'Reason is required for non-bookings';
      }
    } else if (tabIndex === 2) {
      if (formData.complaint === 'Y' && !(formData.complaintDetails || '').trim()) {
        tempErrors.complaintDetails = 'Please provide details for the complaint';
      }
    }
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (validateTab(activeTab)) {
      setActiveTab(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setActiveTab(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;

    // Prevent saving if we are not on the final tab (activeTab < 3)
    if (activeTab < 3) {
      let firstInvalidTab = -1;
      // Check which preceding tab (up to current) is invalid
      for (let i = 0; i <= activeTab; i++) {
        if (!validateTab(i)) {
          firstInvalidTab = i;
          break;
        }
      }
      if (firstInvalidTab !== -1) {
        setActiveTab(firstInvalidTab);
      } else {
        // Move to the next tab if current tabs are valid
        setActiveTab(prev => Math.min(prev + 1, 3));
      }
      return;
    }

    // On the final tab, validate ALL tabs (0, 1, 2, 3) to ensure all sections are complete
    let isValid = true;
    for (let i = 0; i < tabs.length; i++) {
      if (!validateTab(i)) {
        setActiveTab(i);
        isValid = false;
        break;
      }
    }

    if (isValid) {
      setIsSubmitting(true);
      const submissionData = { ...formData };
      
      // Clean up empty string enums to prevent mongoose validation issues with null or empty strings
      if (!submissionData.bookingStatus) submissionData.bookingStatus = 'Pending';
      if (!submissionData.jobStatus) submissionData.jobStatus = 'Pending';
      if (!submissionData.paymentStatus) submissionData.paymentStatus = 'Pending';
      if (!submissionData.paymentMethod) submissionData.paymentMethod = 'N/A';
      if (!submissionData.repeatCustomer) submissionData.repeatCustomer = 'N';
      if (!submissionData.complaint) submissionData.complaint = 'N';

      // Clean up and format financial and numeric values
      const qPrice = Number(submissionData.quotedPrice) || 0;
      const disc = Number(submissionData.discount) || 0;
      const finalPriceValue = qPrice - disc;

      const payout = Number(submissionData.providerPayout) || 0;
      const travel = Number(submissionData.travelCost) || 0;
      const material = Number(submissionData.materialCost) || 0;
      const other = Number(submissionData.otherExpenses) || 0;
      const grossProfitValue = finalPriceValue - payout - travel - material - other;

      submissionData.quotedPrice = qPrice;
      submissionData.discount = disc;
      submissionData.finalPrice = finalPriceValue;
      submissionData.providerPayout = payout;
      submissionData.travelCost = travel;
      submissionData.materialCost = material;
      submissionData.otherExpenses = other;
      submissionData.grossProfit = grossProfitValue;

      // Clean up empty string dates to null so Mongoose parses them correctly
      const dateFields = ['leadDate', 'nextFollowUpDate', 'bookingDate', 'serviceDate'];
      dateFields.forEach(field => {
        if (!submissionData[field]) {
          submissionData[field] = null;
        }
      });

      Promise.resolve(onSave(submissionData))
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };

  const tabs = [
    { title: '1. Customer Profile', icon: User },
    { title: '2. Lead & Services', icon: FileText },
    { title: '3. Schedule & Feedback', icon: ClipboardList },
    { title: '4. Financial Details', icon: DollarSign }
  ];

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          {lead ? <Save size={24} /> : <Plus size={24} />}
          {lead ? `Edit Lead (${lead.leadId})` : 'Register New Lead'}
        </h2>
        {lead && (
          <button className="btn btn-secondary" onClick={onCancel}>Cancel Edit</button>
        )}
      </div>

      {/* Stepper Tabs */}
      <div className="form-stepper">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          return (
            <div
              key={idx}
              className={`step-tab ${activeTab === idx ? 'active' : ''}`}
              onClick={() => {
                if (!isSubmitting && (validateTab(activeTab) || idx < activeTab)) {
                  setActiveTab(idx);
                }
              }}
            >
              <Icon size={18} />
              <span>{tab.title}</span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* TAB 0: Customer Profile */}
        {activeTab === 0 && (
          <div className="animate-fade-in">
            <div className="grid-2" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Customer Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Kiran Kumar"
                  className="glass-input"
                />
                {errors.customerName && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.customerName}</span>}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Phone Number *</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  className="glass-input"
                />
                {errors.phoneNumber && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.phoneNumber}</span>}
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Area *</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Indiranagar"
                  className="glass-input"
                />
                {errors.area && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.area}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 560038"
                  className="glass-input"
                />
                {errors.pincode && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.pincode}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Repeat Customer? (Y/N)</label>
                <select
                  name="repeatCustomer"
                  value={formData.repeatCustomer}
                  onChange={handleChange}
                  className="glass-input"
                >
                  <option value="N">No (N)</option>
                  <option value="Y">Yes (Y)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: Lead Acquisition & Services */}
        {activeTab === 1 && (
          <div className="animate-fade-in">
            <div className="grid-3" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Lead Date</label>
                <input
                  type="date"
                  name="leadDate"
                  value={formData.leadDate}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Lead Source</label>
                <input
                  type="text"
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleChange}
                  placeholder="e.g. Google Search, Referral"
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Campaign Name</label>
                <input
                  type="text"
                  name="campaignName"
                  value={formData.campaignName}
                  onChange={handleChange}
                  placeholder="e.g. Summer Discount 2026"
                  className="glass-input"
                />
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Service Requested *</label>
                <input
                  type="text"
                  name="serviceRequested"
                  value={formData.serviceRequested}
                  onChange={handleChange}
                  placeholder="e.g. Deep Cleaning, AC Repair"
                  className="glass-input"
                />
                {errors.serviceRequested && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.serviceRequested}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Booking Status</label>
                <select
                  name="bookingStatus"
                  value={formData.bookingStatus}
                  onChange={handleChange}
                  className="glass-input"
                >
                  <option value="Pending">Pending</option>
                  <option value="Booked">Booked</option>
                  <option value="Non-Booking">Non-Booking</option>
                </select>
              </div>
            </div>

            {formData.bookingStatus === 'Non-Booking' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>Non-Booking Reason *</label>
                <input
                  type="text"
                  name="nonBookingReason"
                  value={formData.nonBookingReason}
                  onChange={handleChange}
                  placeholder="e.g. Price too high, Provider unavailable"
                  className="glass-input"
                  style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
                />
                {errors.nonBookingReason && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.nonBookingReason}</span>}
              </div>
            )}

            <div className="grid-4" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Follow-up Status</label>
                <input
                  type="text"
                  name="followUpStatus"
                  value={formData.followUpStatus}
                  onChange={handleChange}
                  placeholder="e.g. Called, Emailed"
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Next Follow-up Date</label>
                <input
                  type="date"
                  name="nextFollowUpDate"
                  value={formData.nextFollowUpDate}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Assigned Employee</label>
                <input
                  type="text"
                  name="assignedEmployee"
                  value={formData.assignedEmployee}
                  onChange={handleChange}
                  placeholder="e.g. Suga Dev"
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Assigned Provider</label>
                <input
                  type="text"
                  name="assignedProvider"
                  value={formData.assignedProvider}
                  onChange={handleChange}
                  placeholder="e.g. Gigiman Provider"
                  className="glass-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Schedule & Execution Feedback */}
        {activeTab === 2 && (
          <div className="animate-fade-in">
            <div className="grid-4" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Booking Date</label>
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Service Date</label>
                <input
                  type="date"
                  name="serviceDate"
                  value={formData.serviceDate}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Start Time</label>
                <input
                  type="time"
                  name="serviceStartTime"
                  value={formData.serviceStartTime}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>End Time</label>
                <input
                  type="time"
                  name="serviceEndTime"
                  value={formData.serviceEndTime}
                  onChange={handleChange}
                  className="glass-input"
                />
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Job Status</label>
                <select
                  name="jobStatus"
                  value={formData.jobStatus}
                  onChange={handleChange}
                  className="glass-input"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Customer Rating (1-5)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '46px' }}>
                  <input
                    type="range"
                    name="customerRating"
                    min="1"
                    max="5"
                    value={formData.customerRating}
                    onChange={handleChange}
                    style={{ flex: 1, accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', width: '30px', textAlign: 'right' }}>
                    {formData.customerRating}★
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Complaint Registered?</label>
                <select
                  name="complaint"
                  value={formData.complaint}
                  onChange={handleChange}
                  className="glass-input"
                >
                  <option value="N">No (N)</option>
                  <option value="Y">Yes (Y)</option>
                </select>
              </div>
            </div>

            {formData.complaint === 'Y' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>Complaint Details *</label>
                <textarea
                  name="complaintDetails"
                  value={formData.complaintDetails}
                  onChange={handleChange}
                  placeholder="Describe the complaint in detail..."
                  className="glass-input"
                  rows="3"
                  style={{ resize: 'vertical', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                />
                {errors.complaintDetails && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.complaintDetails}</span>}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Customer Review / Feedback</label>
              <textarea
                name="customerReview"
                value={formData.customerReview}
                onChange={handleChange}
                placeholder="Write down the customer review comment..."
                className="glass-input"
                rows="2"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        {/* TAB 3: Operations Pricing & Financials */}
        {activeTab === 3 && (
          <div className="animate-fade-in">
            <div className="grid-3" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Quoted Price (₹)</label>
                <input
                  type="number"
                  name="quotedPrice"
                  value={formData.quotedPrice}
                  onChange={handleChange}
                  className="glass-input"
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Discount (₹)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="glass-input"
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Final Price (₹) [Auto]</label>
                <div className="glass-input number-font" style={{
                  backgroundColor: 'var(--bg-primary)',
                  fontWeight: 700,
                  color: 'var(--primary)'
                }}>
                  ₹{finalPrice}
                </div>
              </div>
            </div>

            <div className="grid-4" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Provider Payout (₹)</label>
                <input
                  type="number"
                  name="providerPayout"
                  value={formData.providerPayout}
                  onChange={handleChange}
                  className="glass-input"
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Travel Cost (₹)</label>
                <input
                  type="number"
                  name="travelCost"
                  value={formData.travelCost}
                  onChange={handleChange}
                  className="glass-input"
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Material Cost (₹)</label>
                <input
                  type="number"
                  name="materialCost"
                  value={formData.materialCost}
                  onChange={handleChange}
                  className="glass-input"
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Other Expenses (₹)</label>
                <input
                  type="number"
                  name="otherExpenses"
                  value={formData.otherExpenses}
                  onChange={handleChange}
                  className="glass-input"
                  min="0"
                />
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '20px', alignItems: 'end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Payment Status</label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="glass-input"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="glass-input"
                >
                  <option value="N/A">N/A</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Gross Profit (₹) [Auto]</label>
                <div className="glass-input number-font" style={{
                  backgroundColor: grossProfit >= 0 ? 'var(--bg-completed)' : 'var(--bg-nonbooking)',
                  fontWeight: 800,
                  color: grossProfit >= 0 ? 'var(--color-completed)' : 'var(--color-nonbooking)',
                  border: 'none'
                }}>
                  ₹{grossProfit}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Operations Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter any general operations notes or customer remarks..."
                className="glass-input"
                rows="2"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          marginTop: '20px'
        }}>
          <div>
            {activeTab > 0 && (
              <button type="button" className="btn btn-secondary" onClick={handlePrev} disabled={isSubmitting}>
                <ArrowLeft size={16} /> Back
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>


            {activeTab < 3 ? (
              <button key="btn-continue" type="button" className="btn btn-primary" onClick={handleNext} disabled={isSubmitting}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button key="btn-submit" type="submit" className="btn btn-primary" disabled={isSubmitting}>
                <Save size={16} /> {isSubmitting ? 'Saving...' : (lead ? 'Save Lead Changes' : 'Submit Lead Record')}
              </button>
            )}
          </div>
        </div>

      </form>
    </div>
  );
};

export default LeadForm;
