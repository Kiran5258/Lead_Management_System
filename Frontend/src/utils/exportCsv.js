import * as XLSX from 'xlsx';

/**
 * Utility to export lead data to a fully formatted Excel (.xlsx) file.
 * Handles automatic column width calculations (auto-fit) and cell types
 * so that Excel renders phone numbers, dates, pincodes, and currencies
 * properly without requiring any manual user adjustments.
 */
export const exportLeadsToCsv = (leads) => {
  if (!leads || leads.length === 0) {
    alert('No lead data available to export');
    return;
  }

  // Header definitions mapping exact user display names, properties, and types
  const headersMap = [
    { label: 'Lead ID ', key: 'leadId', type: 'string' },
    { label: 'Lead Date', key: 'leadDate', type: 'date' },
    { label: 'Customer Name', key: 'customerName', type: 'string' },
    { label: 'Phone Number', key: 'phoneNumber', type: 'string' }, // String type prevents Excel dropping leading zeroes
    { label: 'Area', key: 'area', type: 'string' },
    { label: 'Pincode', key: 'pincode', type: 'string' },
    { label: 'Repeat Customer (Y/N)', key: 'repeatCustomer', type: 'string' },
    { label: 'Lead Source', key: 'leadSource', type: 'string' },
    { label: 'Campaign Name', key: 'campaignName', type: 'string' },
    { label: 'Service Requested', key: 'serviceRequested', type: 'string' },
    { label: 'Booking Status', key: 'bookingStatus', type: 'string' },
    { label: 'Non-Booking Reason', key: 'nonBookingReason', type: 'string' },
    { label: 'Follow-up Status', key: 'followUpStatus', type: 'string' },
    { label: 'Next Follow-up Date', key: 'nextFollowUpDate', type: 'date' },
    { label: 'Assigned Employee', key: 'assignedEmployee', type: 'string' },
    { label: 'Assigned Provider', key: 'assignedProvider', type: 'string' },
    { label: 'Booking Date', key: 'bookingDate', type: 'date' },
    { label: 'Service Date', key: 'serviceDate', type: 'date' },
    { label: 'Service Start Time', key: 'serviceStartTime', type: 'string' },
    { label: 'Service End Time', key: 'serviceEndTime', type: 'string' },
    { label: 'Job Status', key: 'jobStatus', type: 'string' },
    { label: 'Customer Rating (1-5)', key: 'customerRating', type: 'number' },
    { label: 'Customer Review', key: 'customerReview', type: 'string' },
    { label: 'Complaint (Y/N)', key: 'complaint', type: 'string' },
    { label: 'Complaint Details', key: 'complaintDetails', type: 'string' },
    { label: 'Quoted Price (₹)', key: 'quotedPrice', type: 'number' },
    { label: 'Discount (₹)', key: 'discount', type: 'number' },
    { label: 'Final Price (₹)', key: 'finalPrice', type: 'number' },
    { label: 'Provider Payout (₹)', key: 'providerPayout', type: 'number' },
    { label: 'Travel Cost (₹)', key: 'travelCost', type: 'number' },
    { label: 'Material Cost (₹)', key: 'materialCost', type: 'number' },
    { label: 'Other Expenses (₹)', key: 'otherExpenses', type: 'number' },
    { label: 'Gross Profit (₹)', key: 'grossProfit', type: 'number' },
    { label: 'Payment Status', key: 'paymentStatus', type: 'string' },
    { label: 'Payment Method', key: 'paymentMethod', type: 'string' },
    { label: 'Remarks', key: 'remarks', type: 'string' }
  ];

  // Build the array of row objects using the friendly labels as key names
  const worksheetData = leads.map(lead => {
    const row = {};
    headersMap.forEach(h => {
      let val = lead[h.key];

      if (val === null || val === undefined) {
        val = '';
      } else if (h.type === 'date') {
        val = val ? new Date(val).toISOString().split('T')[0] : '';
      } else if (h.type === 'number') {
        val = isNaN(Number(val)) ? 0 : Number(val);
      } else {
        val = String(val);
      }

      row[h.label] = val;
    });
    return row;
  });

  // Create SheetJS Worksheet from JSON
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  // Apply cell types and formats (e.g. Phone numbers and Pincodes strictly as Text)
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Skip header row (R=0)
    headersMap.forEach((h, C) => {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellRef];
      if (cell) {
        if (h.key === 'phoneNumber' || h.key === 'pincode' || h.key === 'leadId') {
          cell.t = 's'; // Set cell type to String
          cell.z = '@'; // Force Excel Text format
        } else if (h.type === 'number') {
          cell.t = 'n'; // Set cell type to Number
          cell.z = '#,##0'; // Excel currency/comma spacing
        }
      }
    });
  }

  // Calculate dynamic column widths for perfect display (Auto-Fit)
  const colWidths = headersMap.map(h => {
    let maxLen = h.label.length; // Start with header title width
    
    leads.forEach(lead => {
      let val = lead[h.key];
      if (val === null || val === undefined) {
        val = '';
      } else if (h.type === 'date') {
        val = val ? new Date(val).toISOString().split('T')[0] : '';
      } else {
        val = String(val);
      }
      if (val.length > maxLen) {
        maxLen = val.length;
      }
    });

    // Provide padding (Min: 12 chars width, Max: 45 chars width to look clean)
    return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
  });

  worksheet['!cols'] = colWidths;

  // Create Workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Gigiman Leads');

  // Trigger browser download of binary .xlsx file
  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Gigiman_Leads_Report_${today}.xlsx`);
};
