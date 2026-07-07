import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import Lead from './models/Lead.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'https://lead-management-system-1-wana.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Auth & Session Middleware
const protectAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gigiman_secret_jwt_key_2026_safe');
    if (decoded.role === 'admin') {
      next();
    } else {
      res.status(401).json({ message: 'Not authorized, invalid role' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Auth routes
// @desc    Admin login
// @route   POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
  if (password === adminPassword) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'gigiman_secret_jwt_key_2026_safe', {
      expiresIn: '24h',
    });
    
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    return res.json({ success: true, message: 'Logged in successfully' });
  } else {
    return res.status(401).json({ message: 'Invalid secret passcode' });
  }
});

// @desc    Admin logout
// @route   POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Check auth status
// @route   GET /api/auth/check
app.get('/api/auth/check', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ authenticated: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gigiman_secret_jwt_key_2026_safe');
    if (decoded.role === 'admin') {
      return res.json({ authenticated: true });
    }
    return res.json({ authenticated: false });
  } catch (error) {
    return res.json({ authenticated: false });
  }
});

// Routes

// @desc    Get all leads with search and filter
// @route   GET /api/leads
app.get('/api/leads', protectAdmin, async (req, res) => {
  try {
    const { search, bookingStatus, jobStatus, paymentStatus, sortBy, sortOrder } = req.query;
    
    let query = {};
    
    // Search filter (matches multiple text fields)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { leadId: searchRegex },
        { customerName: searchRegex },
        { phoneNumber: searchRegex },
        { area: searchRegex },
        { pincode: searchRegex },
        { serviceRequested: searchRegex },
        { assignedEmployee: searchRegex },
        { assignedProvider: searchRegex }
      ];
    }
    
    // Status filters
    if (bookingStatus && bookingStatus !== 'All') {
      query.bookingStatus = bookingStatus;
    }
    if (jobStatus && jobStatus !== 'All') {
      query.jobStatus = jobStatus;
    }
    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default sorting
    if (sortBy) {
      sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    }

    const leads = await Lead.find(query).sort(sortOptions);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching leads', error: error.message });
  }
});

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/stats
app.get('/api/dashboard/stats', protectAdmin, async (req, res) => {
  try {
    const leads = await Lead.find({});
    
    const totalLeads = leads.length;
    
    let totalRevenue = 0;
    let totalGrossProfit = 0;
    let bookedCount = 0;
    let completedCount = 0;
    let complaintCount = 0;
    let ratingSum = 0;
    let ratedCount = 0;

    leads.forEach(lead => {
      totalRevenue += lead.finalPrice || 0;
      totalGrossProfit += lead.grossProfit || 0;
      
      if (lead.bookingStatus === 'Booked') bookedCount++;
      if (lead.jobStatus === 'Completed') completedCount++;
      if (lead.complaint === 'Y') complaintCount++;
      
      if (lead.customerRating) {
        ratingSum += lead.customerRating;
        ratedCount++;
      }
    });

    const bookingRate = totalLeads ? ((bookedCount / totalLeads) * 100).toFixed(1) : 0;
    const avgRating = ratedCount ? (ratingSum / ratedCount).toFixed(1) : 0;

    res.json({
      totalLeads,
      totalRevenue,
      totalGrossProfit,
      bookingRate,
      completedCount,
      complaintCount,
      avgRating
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching dashboard stats', error: error.message });
  }
});

// @desc    Get a single lead by ID
// @route   GET /api/leads/:id
app.get('/api/leads/:id', protectAdmin, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching lead details', error: error.message });
  }
});

// @desc    Create a new lead
// @route   POST /api/leads
app.post('/api/leads', protectAdmin, async (req, res) => {
  try {
    // Lead Schema pre-save hooks will auto-generate leadId and recalculate finalPrice & grossProfit
    const lead = new Lead(req.body);
    const createdLead = await lead.save();
    res.status(201).json(createdLead);
  } catch (error) {
    res.status(400).json({ message: 'Invalid lead data', error: error.message });
  }
});

// @desc    Update an existing lead
// @route   PUT /api/leads/:id
app.put('/api/leads/:id', protectAdmin, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      // Do not overwrite leadId
      if (key !== 'leadId') {
        lead[key] = req.body[key];
      }
    });

    // Save will trigger the pre-save hook for recalculations
    const updatedLead = await lead.save();
    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: 'Invalid update data', error: error.message });
  }
});

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
app.delete('/api/leads/:id', protectAdmin, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    await lead.deleteOne();
    res.json({ message: 'Lead removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting lead', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
