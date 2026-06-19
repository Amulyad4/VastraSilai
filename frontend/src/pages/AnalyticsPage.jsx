import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { IndianRupee, TrendingUp, Users, Calendar, Award, Star } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // SVG Chart states
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [hoveredLineIndex, setHoveredLineIndex] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/analytics/revenue`);
        setData(res.data);
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">{t('loading')}</span>
      </div>
    );
  }

  const {
    daily_earnings,
    monthly_revenue,
    pending_collection,
    completed_orders,
    top_customers,
    revenue_chart_data,
    monthly_chart_data
  } = data;

  // Custom Bezier path helper for line charts (Cubic Spline interpolation)
  const getBezierPath = (points) => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      
      // Control points are halfway horizontally
      const cp1x = curr.x + (next.x - curr.x) / 3;
      const cp1y = curr.y;
      const cp2x = curr.x + 2 * (next.x - curr.x) / 3;
      const cp2y = next.y;
      
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  // Custom SVG Bar Chart calculation (Daily Revenue)
  const renderDailyChart = () => {
    const chartHeight = 160;
    const chartWidth = 500;
    const maxVal = Math.max(...revenue_chart_data.map(d => d.revenue), 1000);
    const barWidth = 32;
    const spacing = 36;
    const paddingLeft = 45;
    const paddingBottom = 25;
    
    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + paddingBottom}`} className="w-full h-full text-gray-500 overflow-visible chart-container-glow">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.45" />
          </linearGradient>
          <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#a855f7" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight * (1 - ratio) + 5;
          const gridVal = Math.round(maxVal * ratio);
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={chartWidth} y2={y} className="chart-grid-line" strokeDasharray="4,4" />
              <text x={paddingLeft - 8} y={y + 4} className="chart-grid-text font-bold text-[10px]" textAnchor="end">
                ₹{gridVal}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {revenue_chart_data.map((item, idx) => {
          const x = paddingLeft + idx * (barWidth + spacing) + spacing / 2;
          const ratio = maxVal > 0 ? item.revenue / maxVal : 0;
          const barHeight = chartHeight * ratio;
          const y = chartHeight - barHeight + 5;
          const isHovered = hoveredBarIndex === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredBarIndex(idx)}
              onMouseLeave={() => setHoveredBarIndex(null)}
              className="cursor-pointer"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 4)}
                rx="8"
                ry="8"
                fill={isHovered ? "url(#barGradHover)" : "url(#barGrad)"}
                stroke={isHovered ? "#f472b6" : "rgba(168, 85, 247, 0.2)"}
                strokeWidth="1.5"
                filter={isHovered ? "url(#barShadow)" : "none"}
                className="transition-all duration-300"
              />
              {/* Date label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 18}
                className="chart-axis-label font-extrabold text-[10px] transition-all duration-200"
                fill={isHovered ? "#a855f7" : undefined}
                textAnchor="middle"
              >
                {item.date}
              </text>

              {/* Hover Value Popover with pointing arrow */}
              {isHovered && (
                <g className="animate-fade-in">
                  <polygon
                    points={`${x + barWidth/2 - 6},${y - 10} ${x + barWidth/2 + 6},${y - 10} ${x + barWidth/2},${y - 4}`}
                    className="chart-tooltip-bg filter drop-shadow-md"
                  />
                  <rect
                    x={x - 24}
                    y={y - 36}
                    width={barWidth + 48}
                    height={26}
                    rx="6"
                    className="chart-tooltip-bg filter drop-shadow-lg"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 20}
                    className="chart-tooltip-text font-black text-[10px]"
                    textAnchor="middle"
                  >
                    ₹{item.revenue}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // Custom SVG Line Chart calculation (Monthly Revenue)
  const renderMonthlyChart = () => {
    const chartHeight = 160;
    const chartWidth = 500;
    const maxVal = Math.max(...monthly_chart_data.map(d => d.revenue), 5000);
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingBottom = 25;
    const usableWidth = chartWidth - paddingLeft - paddingRight;

    // Calculate line coordinates
    const coordinates = monthly_chart_data.map((item, idx) => {
      const x = paddingLeft + (idx / (monthly_chart_data.length - 1)) * usableWidth;
      const ratio = maxVal > 0 ? item.revenue / maxVal : 0;
      const y = chartHeight * (1 - ratio) + 5;
      return { x, y, val: item.revenue, label: item.month };
    });

    const linePathD = getBezierPath(coordinates);
    
    // Shaded Area path closed at bottom
    let areaD = "";
    if (coordinates.length > 0) {
      areaD = `${linePathD} L ${coordinates[coordinates.length - 1].x} ${chartHeight + 5} L ${coordinates[0].x} ${chartHeight + 5} Z`;
    }

    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + paddingBottom}`} className="w-full h-full text-gray-500 overflow-visible chart-container-glow">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
          <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight * (1 - ratio) + 5;
          const gridVal = Math.round(maxVal * ratio);
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} className="chart-grid-line" strokeDasharray="4,4" />
              <text x={paddingLeft - 8} y={y + 4} className="chart-grid-text font-bold text-[10px]" textAnchor="end">
                {gridVal >= 1000 ? `₹${(gridVal/1000).toFixed(1)}k` : `₹${gridVal}`}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        {coordinates.length > 0 && areaD && (
          <path d={areaD} fill="url(#areaGrad)" />
        )}

        {/* Stroke Line with Shadow (Glow backdrop) */}
        {coordinates.length > 0 && linePathD && (
          <>
            <path
              d={linePathD}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-20 blur-[2px] chart-neon-line-blue"
            />
            <path
              d={linePathD}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* Interactive Data Dots */}
        {coordinates.map((pt, idx) => {
          const isHovered = hoveredLineIndex === idx;
          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredLineIndex(idx)}
              onMouseLeave={() => setHoveredLineIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible touch target */}
              <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
              
              {/* Pulsing glow ring on hover */}
              {isHovered && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="12"
                  fill="none"
                  stroke="#f472b6"
                  strokeWidth="1.5"
                  className="animate-ping opacity-60"
                />
              )}

              {/* Visual dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6.5 : 4}
                fill={isHovered ? "#f472b6" : "#3b82f6"}
                stroke="#fff"
                strokeWidth="2"
                className="transition-all duration-200"
              />
              
              {/* Date labels */}
              <text
                x={pt.x}
                y={chartHeight + 18}
                className="chart-axis-label font-extrabold text-[10px] transition-all duration-200"
                fill={isHovered ? "#3b82f6" : undefined}
                textAnchor="middle"
              >
                {pt.label.split(' ')[0]}
              </text>

              {/* Tooltip with pointing arrow */}
              {isHovered && (
                <g className="animate-fade-in">
                  <polygon
                    points={`${pt.x - 6},${pt.y - 12} ${pt.x + 6},${pt.y - 12} ${pt.x},${pt.y - 6}`}
                    className="chart-tooltip-bg filter drop-shadow-md"
                  />
                  <rect
                    x={pt.x - 40}
                    y={pt.y - 38}
                    width={80}
                    height={26}
                    rx="6"
                    className="chart-tooltip-bg filter drop-shadow-lg"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 22}
                    className="chart-tooltip-text font-black text-[10px]"
                    textAnchor="middle"
                  >
                    ₹{pt.val}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title */}
      <div>
        <h2 className="font-heading text-3xl font-black text-gray-800 dark:text-white tracking-tight">{t('revenueAnalytics')}</h2>
        <p className="text-gray-555 dark:text-gray-400 text-sm">Review financial performance and collection analytics</p>
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Daily Earnings */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4 analytics-kpi-card kpi-purple">
          <div className="p-3 bg-purple-105 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl shadow-sm shadow-purple-600/5">
            <IndianRupee className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider">{t('dailyEarnings')}</span>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-0.5">₹{daily_earnings}</h3>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4 analytics-kpi-card kpi-blue">
          <div className="p-3 bg-blue-105 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm shadow-blue-600/5">
            <TrendingUp className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider">{t('monthlyRevenue')}</span>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-0.5">₹{monthly_revenue}</h3>
          </div>
        </div>

        {/* Pending Collection */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4 analytics-kpi-card kpi-pink">
          <div className="p-3 bg-pink-105 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-2xl shadow-sm shadow-pink-600/5">
            <Users className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider">{t('pendingCollection')}</span>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-0.5">₹{pending_collection}</h3>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="glass-panel p-6 rounded-3xl flex items-center space-x-4 analytics-kpi-card kpi-emerald">
          <div className="p-3 bg-emerald-105 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm shadow-emerald-600/5">
            <Award className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-extrabold uppercase tracking-wider">{t('completedOrders')}</span>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-0.5">{completed_orders}</h3>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Revenue Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-2 pb-2">
            <TrendingUp className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
            <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">{t('chartDailyRev')}</h4>
          </div>
          <div className="h-48 flex items-center justify-center">
            {renderDailyChart()}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-2 pb-2">
            <Calendar className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            <h4 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">{t('chartMonthlyRev')}</h4>
          </div>
          <div className="h-48 flex items-center justify-center">
            {renderMonthlyChart()}
          </div>
        </div>

      </div>

      {/* Top Customers list */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
        <div className="flex items-center space-x-2 border-b border-purple-500/10 dark:border-white/5 pb-3">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-spin" style={{ animationDuration: '6s' }} />
          <h3 className="text-lg font-black text-gray-800 dark:text-white font-heading">{t('topCustomers')}</h3>
        </div>

        {top_customers.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No customer orders logged yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {top_customers.map((c, index) => {
              const rank = index + 1;
              const isGold = rank === 1;
              const isSilver = rank === 2;
              const isBronze = rank === 3;
              
              let cardClass = "glass-card";
              let badgeColor = "bg-purple-500/10 text-purple-650 dark:text-purple-400";
              let avatarClass = "from-purple-500 to-indigo-650 text-white";
              
              if (isGold) {
                cardClass = "metal-gold";
                badgeColor = "bg-yellow-500/20 text-yellow-800 dark:text-yellow-400";
                avatarClass = "from-yellow-400 to-amber-500 text-white";
              } else if (isSilver) {
                cardClass = "metal-silver";
                badgeColor = "bg-gray-400/20 text-gray-700 dark:text-gray-300";
                avatarClass = "from-gray-300 to-gray-500 text-white";
              } else if (isBronze) {
                cardClass = "metal-bronze";
                badgeColor = "bg-orange-400/20 text-orange-800 dark:text-orange-450";
                avatarClass = "from-orange-400 to-amber-700 text-white";
              }

              return (
                <div
                  key={c.id}
                  className={`top-customer-rank-card border rounded-3xl p-5 relative overflow-hidden flex flex-col items-center text-center space-y-3 cursor-pointer ${cardClass}`}
                >
                  {/* Medal Rank badge */}
                  <div className={`absolute top-3 right-3 flex items-center justify-center p-1.5 rounded-full ${badgeColor}`}>
                    <Award className="w-4 h-4" strokeWidth={isGold || isSilver || isBronze ? 3 : 2} />
                  </div>
                  
                  <div className="text-[10px] font-black text-gray-500 tracking-wider absolute top-3 left-4 uppercase">
                    Rank #{rank}
                  </div>
                  
                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarClass} flex items-center justify-center font-heading text-xl font-extrabold shadow-md mt-4`}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-0.5">
                    <div className="text-sm font-black text-gray-800 dark:text-white truncate max-w-[130px]" title={c.name}>
                      {c.name}
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      {c.phone === '0000000000' ? '-' : c.phone}
                    </div>
                  </div>
                  
                  {/* Order metrics inside a capsule */}
                  <div className="pt-3 flex justify-between w-full border-t border-purple-500/10 dark:border-white/5 text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                    <span className="flex flex-col items-start text-left">
                      <span className="text-[8px] uppercase font-bold text-gray-400">Bookings</span>
                      <strong className="text-gray-850 dark:text-white font-extrabold text-sm">{c.order_count}</strong>
                    </span>
                    <span className="flex flex-col items-end text-right">
                      <span className="text-[8px] uppercase font-bold text-gray-400">Revenue</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">₹{c.total_spent}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
