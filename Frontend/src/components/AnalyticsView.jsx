import React from 'react';
import { TrendingUp, BarChart2, Award, PieChart, IndianRupee } from 'lucide-react';

const AnalyticsView = ({ leads }) => {
  // Filter only completed bookings
  const bookedLeads = leads.filter(lead => lead.bookingStatus === 'Booked');

  // Aggregation containers
  const sourceMap = {};
  const campaignMap = {};
  let totalBookedRevenue = 0;
  let totalBookedProfit = 0;

  bookedLeads.forEach(lead => {
    const source = lead.leadSource ? lead.leadSource.trim() : 'Direct / Unknown';
    const campaign = lead.campaignName ? lead.campaignName.trim() : 'No Campaign';
    const revenue = lead.finalPrice || 0;
    const profit = lead.grossProfit || 0;

    totalBookedRevenue += revenue;
    totalBookedProfit += profit;

    // Group by Lead Source
    if (!sourceMap[source]) {
      sourceMap[source] = { count: 0, revenue: 0, profit: 0 };
    }
    sourceMap[source].count += 1;
    sourceMap[source].revenue += revenue;
    sourceMap[source].profit += profit;

    // Group by Campaign
    if (!campaignMap[campaign]) {
      campaignMap[campaign] = { count: 0, revenue: 0, profit: 0 };
    }
    campaignMap[campaign].count += 1;
    campaignMap[campaign].revenue += revenue;
    campaignMap[campaign].profit += profit;
  });

  // Sort and convert to arrays
  const sourceData = Object.entries(sourceMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count);

  const campaignData = Object.entries(campaignMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Maximum values for chart height calculations
  const maxSourceCount = sourceData.length > 0 ? Math.max(...sourceData.map(d => d.count)) : 0;
  const maxCampaignRevenue = campaignData.length > 0 ? Math.max(...campaignData.map(d => d.revenue)) : 0;

  // Best performers
  const topSource = sourceData.length > 0 ? sourceData[0] : null;
  const topCampaign = campaignData.length > 0 ? campaignData[0] : null;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Overview stats for Booked Leads */}
      <div className="grid-3">
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '6px' }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Booked Conversions</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>
                <span className="number-font">{bookedLeads.length}</span> Bookings
              </h3>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '6px' }}>
              <IndianRupee size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Booked Revenue</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>
                <span className="number-font">₹{totalBookedRevenue.toLocaleString('en-IN')}</span>
              </h3>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', borderRadius: '6px' }}>
              <Award size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Booked Profit</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '2px' }}>
                <span className="number-font">₹{totalBookedProfit.toLocaleString('en-IN')}</span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {bookedLeads.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No completed bookings found to compile campaign and source metrics. Mark booking status as "Booked" to view graph analytics.
        </div>
      ) : (
        <div className="grid-2">
          
          {/* Chart 1: Lead Source Analysis */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} /> Lead Source Performance
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Total bookings acquired through each marketing source channel.
            </p>

            {/* Vertical Bar Chart Container */}
            <div style={{
              height: '240px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              borderBottom: '2px solid var(--border-color)',
              paddingBottom: '8px',
              gap: '12px'
            }}>
              {sourceData.map((item, idx) => {
                const heightPercentage = maxSourceCount > 0 ? (item.count / maxSourceCount) * 85 : 0;
                return (
                  <div key={idx} style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    maxWidth: '60px'
                  }}>
                    <span className="number-font" style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>{item.count}</span>
                    
                    {/* The Bar */}
                    <div style={{
                      width: '100%',
                      height: `${heightPercentage}%`,
                      backgroundColor: 'var(--primary)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.6s ease',
                      opacity: 0.85,
                      cursor: 'pointer'
                    }} 
                    title={`${item.name}: ${item.count} bookings (₹${item.revenue.toLocaleString('en-IN')} Rev)`}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.85}
                    />
                    
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      marginTop: '8px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                      textAlign: 'center',
                      color: 'var(--text-secondary)'
                    }}>
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Top Source Highlight */}
            {topSource && (
              <div style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                ⭐ Top performer is <strong style={{ color: 'var(--text-primary)' }}>{topSource.name}</strong> driving <strong className="number-font">{topSource.count}</strong> bookings.
              </div>
            )}
          </div>

          {/* Chart 2: Campaign Attribution */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} /> Campaign Revenue Shares
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Attributed sales revenue and net profitability per marketing campaign.
            </p>

            {/* Horizontal Bar Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {campaignData.map((item, idx) => {
                const widthPercentage = maxCampaignRevenue > 0 ? (item.revenue / maxCampaignRevenue) * 100 : 0;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-primary)' }}>{item.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(<span className="number-font">{item.count}</span> bookings)</span></span>
                      <span className="number-font">₹{item.revenue.toLocaleString('en-IN')}</span>
                    </div>
                    
                    {/* Bar Background Track */}
                    <div style={{
                      height: '10px',
                      backgroundColor: 'var(--border-color)',
                      borderRadius: '50px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Bar Fill */}
                      <div style={{
                        width: `${widthPercentage}%`,
                        height: '100%',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '50px',
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      <span>Profitability:</span>
                      <span className="number-font" style={{ fontWeight: 600, color: item.profit >= 0 ? 'var(--color-completed)' : 'var(--color-nonbooking)' }}>
                        ₹{item.profit.toLocaleString('en-IN')} GP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Campaign Highlight */}
            {topCampaign && (
              <div style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                🏆 Top campaign is <strong style={{ color: 'var(--text-primary)' }}>{topCampaign.name}</strong> generating <strong className="number-font">₹{topCampaign.revenue.toLocaleString('en-IN')}</strong> in revenue.
              </div>
            )}
          </div>

        </div>
      )}
      
    </div>
  );
};

export default AnalyticsView;
