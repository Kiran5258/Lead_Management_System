import React from 'react';
import { Users, IndianRupee, Percent, CheckCircle2, AlertCircle, Star } from 'lucide-react';

const DashboardStats = ({ stats }) => {
  const statItems = [
    {
      title: 'Total Leads',
      value: stats.totalLeads || 0,
      icon: Users,
      color: 'var(--primary)',
      bg: 'var(--primary-glow)',
      desc: 'Overall registered leads'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'var(--secondary)',
      bg: 'rgba(14, 165, 233, 0.1)',
      desc: 'Based on final quoted prices'
    },
    {
      title: 'Gross Profit',
      value: `₹${(stats.totalGrossProfit || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: (stats.totalGrossProfit || 0) >= 0 ? 'var(--color-completed)' : 'var(--color-nonbooking)',
      bg: (stats.totalGrossProfit || 0) >= 0 ? 'var(--bg-completed)' : 'var(--bg-nonbooking)',
      desc: 'Revenue minus total payouts & costs'
    },
    {
      title: 'Booking Conversion',
      value: `${stats.bookingRate || 0}%`,
      icon: Percent,
      color: 'var(--color-pending)',
      bg: 'var(--bg-pending)',
      desc: 'Leads successfully booked'
    },
    {
      title: 'Avg Customer Rating',
      value: `${stats.avgRating || 0} / 5`,
      icon: Star,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      desc: 'Average rating from customer reviews'
    },
    {
      title: 'Complaints Active',
      value: stats.complaintCount || 0,
      icon: AlertCircle,
      color: (stats.complaintCount || 0) > 0 ? '#ef4444' : 'var(--text-muted)',
      bg: (stats.complaintCount || 0) > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--border-color)',
      desc: 'Leads flagged with complaints'
    }
  ];

  return (
    <div className="grid-3 animate-fade-in" style={{ marginBottom: '2.5rem' }}>
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              backgroundColor: item.bg,
              color: item.color,
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.title}</p>
              <h3 className="number-font" style={{ fontSize: '1.75rem', fontWeight: '800', margin: '4px 0 2px 0', color: 'var(--text-primary)' }}>{item.value}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
