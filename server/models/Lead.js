import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  leadId: { 
    type: String, 
    unique: true 
  },
  leadDate: { 
    type: Date, 
    default: Date.now 
  },
  customerName: { 
    type: String, 
    required: true,
    trim: true
  },
  phoneNumber: { 
    type: String, 
    required: true,
    trim: true
  },
  area: { 
    type: String, 
    required: true,
    trim: true
  },
  pincode: { 
    type: String, 
    required: true,
    trim: true
  },
  leadSource: { 
    type: String,
    trim: true,
    default: ''
  },
  campaignName: { 
    type: String,
    trim: true,
    default: ''
  },
  serviceRequested: { 
    type: String, 
    required: true,
    trim: true
  },
  bookingStatus: { 
    type: String, 
    enum: ['Pending', 'Booked', 'Non-Booking'], 
    default: 'Pending' 
  },
  nonBookingReason: { 
    type: String,
    trim: true,
    default: ''
  },
  followUpStatus: { 
    type: String,
    trim: true,
    default: ''
  },
  assignedEmployee: { 
    type: String,
    trim: true,
    default: ''
  },
  assignedProvider: { 
    type: String,
    trim: true,
    default: ''
  },
  quotedPrice: { 
    type: Number, 
    default: 0 
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  finalPrice: { 
    type: Number, 
    default: 0 
  },
  bookingDate: { 
    type: Date 
  },
  serviceDate: { 
    type: Date 
  },
  serviceStartTime: { 
    type: String,
    default: ''
  },
  serviceEndTime: { 
    type: String,
    default: ''
  },
  jobStatus: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  customerRating: { 
    type: Number, 
    min: 1, 
    max: 5,
    default: 5
  },
  customerReview: { 
    type: String,
    trim: true,
    default: ''
  },
  complaint: { 
    type: String, 
    enum: ['Y', 'N'], 
    default: 'N' 
  },
  complaintDetails: { 
    type: String,
    trim: true,
    default: ''
  },
  providerPayout: { 
    type: Number, 
    default: 0 
  },
  travelCost: { 
    type: Number, 
    default: 0 
  },
  materialCost: { 
    type: Number, 
    default: 0 
  },
  otherExpenses: { 
    type: Number, 
    default: 0 
  },
  grossProfit: { 
    type: Number, 
    default: 0 
  },
  paymentStatus: { 
    type: String, 
    enum: ['Paid', 'Pending', 'Failed'], 
    default: 'Pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'UPI', 'Card', 'Net Banking', 'N/A'], 
    default: 'N/A' 
  },
  repeatCustomer: { 
    type: String, 
    enum: ['Y', 'N'], 
    default: 'N' 
  },
  nextFollowUpDate: { 
    type: Date 
  },
  remarks: { 
    type: String,
    trim: true,
    default: ''
  }
}, { 
  timestamps: true 
});

// Pre-save middleware to handle ID generation and financial math
leadSchema.pre('save', async function(next) {
  // Generate sequence-based lead ID if it doesn't exist
  if (!this.leadId) {
    try {
      const LeadModel = mongoose.model('Lead');
      // Sort by leadId descending (lexical sort) to find the largest numeric ID
      const lastLead = await LeadModel.findOne({}, { leadId: 1 }).sort({ leadId: -1 });
      let nextNum = 1;
      
      if (lastLead && lastLead.leadId) {
        const match = lastLead.leadId.match(/LD-(\d+)/);
        if (match) {
          nextNum = parseInt(match[1], 10) + 1;
        }
      }
      this.leadId = `LD-${String(nextNum).padStart(4, '0')}`;
    } catch (err) {
      return next(err);
    }
  }

  // Calculate final price and gross profit on save to ensure data consistency
  this.finalPrice = (this.quotedPrice || 0) - (this.discount || 0);
  this.grossProfit = this.finalPrice - (this.providerPayout || 0) - (this.travelCost || 0) - (this.materialCost || 0) - (this.otherExpenses || 0);

  next();
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
