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

  // Custom SVG Bar Chart calculation (Daily Revenue)
  const renderDailyChart = () => {
    const chartHeight = 160;
    const chartWidth = 500;
    const maxVal = Math.max(...revenue_chart_data.map(d => d.revenue), 1000);
    const barWidth = 40;
    const spacing = 28;
    const paddingLeft = 40;
    const paddingBottom = 25;
    
    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + paddingBottom}`} className="w-full h-full text-gray-500">
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight * (1 - ratio) + 5;
          const gridVal = Math.round(maxVal * ratio);
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={chartWidth} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <text x={paddingLeft - 8} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="end">
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
                height={Math.max(barHeight, 3)}
                rx="6"
                fill={isHovered ? "url(#barGradHover)" : "url(#barGrad)"}
                stroke={isHovered ? "#f472b6" : "rgba(168, 85, 247, 0.3)"}
                strokeWidth="1"
                className="transition-all duration-300"
              />
              {/* Date label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 18}
                fill={isHovered ? "#fff" : "rgba(255,255,255,0.4)"}
                fontSize="10"
                fontWeight={isHovered ? "bold" : "normal"}
                textAnchor="middle"
              >
                {item.date}
              </text>

              {/* Hover Value Popover */}
              {isHovered && (
                <g>
                  <rect
                    x={x - 15}
                    y={y - 25}
                    width={barWidth + 30}
                    height={20}
                    rx="4"
                    fill="rgba(13, 14, 18, 0.9)"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 12}
                    fill="#fff"
                    fontSize="9"
                    fontWeight="bold"
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
    const paddingRight = 15;
    const paddingBottom = 25;
    const usableWidth = chartWidth - paddingLeft - paddingRight;

    // Calculate line coordinates
    const coordinates = monthly_chart_data.map((item, idx) => {
      const x = paddingLeft + (idx / (monthly_chart_data.length - 1)) * usableWidth;
      const ratio = maxVal > 0 ? item.revenue / maxVal : 0;
      const y = chartHeight * (1 - ratio) + 5;
      return { x, y, val: item.revenue, label: item.month };
    });

    // SVG path description
    let pathD = "";
    let areaD = `M ${paddingLeft} ${chartHeight + 5}`; // Start at bottom left for fill
    
    coordinates.forEach((pt, idx) => {
      if (idx === 0) {
        pathD += `M ${pt.x} ${pt.y}`;
        areaD += ` L ${pt.x} ${pt.y}`;
      } else {
        pathD += ` L ${pt.x} ${pt.y}`;
        areaD += ` L ${pt.x} ${pt.y}`;
      }
    });
    
    if (coordinates.length > 0) {
      areaD += ` L ${coordinates[coordinates.length - 1].x} ${chartHeight + 5} Z`;
    }

    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + paddingBottom}`} className="w-full h-full text-gray-500">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight * (1 - ratio) + 5;
          const gridVal = Math.round(maxVal * ratio);
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
              <text x={paddingLeft - 8} y={y + 4} fill="rgba(255,255,255,0.3)" fontSize="9" textAnchor="end">
                ₹{gridVal >= 1000 ? `${(gridVal/1000).toFixed(1)}k` : gridVal}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        {coordinates.length > 0 && (
          <path d={areaD} fill="url(#areaGrad)" />
        )}

        {/* Stroke Line */}
        {coordinates.length > 0 && (
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
              <circle cx={pt.x} cy={pt.y} r="10" fill="transparent" />
              {/* Visual dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 6 : 4}
                fill={isHovered ? "#f472b6" : "#3b82f6"}
                stroke="#fff"
                strokeWidth="1.5"
                className="transition-all duration-200"
              />
              
              {/* Date labels */}
              <text
                x={pt.x}
                y={chartHeight + 18}
                fill={isHovered ? "#fff" : "rgba(255,255,255,0.4)"}
                fontSize="9"
                textAnchor="middle"
              >
                {pt.label.split(' ')[0]}
              </text>

              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={pt.x - 35}
                    y={pt.y - 32}
                    width={70}
                    height={22}
                    rx="4"
                    fill="rgba(13, 14, 18, 0.9)"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 18}
                    fill="#fff"
                    fontSize="9"
                    fontWeight="bold"
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
        <h2 className="font-heading text-3xl font-extrabold text-white tracking-tight">{t('revenueAnalytics')}</h2>
        <p className="text-gray-400 text-sm">Review financial performance and collection analytics</p>
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-purple-600/10 text-purple-400 rounded-xl">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase">{t('dailyEarnings')}</span>
            <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">₹{daily_earnings}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-blue-600/10 text-blue-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase">{t('monthlyRevenue')}</span>
            <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">₹{monthly_revenue}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-pink-600/10 text-pink-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase">{t('pendingCollection')}</span>
            <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">₹{pending_collection}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-semibold uppercase">{t('completedOrders')}</span>
            <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">{completed_orders}</h3>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Revenue Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-2 pb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t('chartDailyRev')}</h4>
          </div>
          <div className="h-48 flex items-center justify-center">
            {renderDailyChart()}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center space-x-2 pb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">{t('chartMonthlyRev')}</h4>
          </div>
          <div className="h-48 flex items-center justify-center">
            {renderMonthlyChart()}
          </div>
        </div>

      </div>

      {/* Top Customers list */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
          <h3 className="text-lg font-bold text-white font-heading">{t('topCustomers')}</h3>
        </div>

        {top_customers.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No customer orders logged yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {top_customers.map((c, index) => (
              <div
                key={c.id}
                className="bg-white/5 border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col items-center text-center space-y-2 cursor-pointer hover:border-purple-500/30 transition-all duration-300 group"
              >
                <div className="absolute top-2 right-2 text-xs font-bold text-gray-500 group-hover:text-purple-400">
                  #{index + 1}
                </div>
                
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-heading text-lg font-extrabold">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="text-sm font-bold text-white truncate max-w-[120px]">{c.name}</div>
                <div className="text-[10px] text-gray-500">{c.phone === '0000000000' ? '-' : c.phone}</div>
                
                <div className="pt-2 flex justify-between w-full border-t border-white/5 text-[10px] text-gray-400">
                  <span>Orders: <strong className="text-white">{c.order_count}</strong></span>
                  <span className="text-emerald-400 font-semibold">₹{c.total_spent}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
