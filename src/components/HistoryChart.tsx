import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { PRTAlert } from '../types';
import { ExternalLink, Loader2, TrendingUp } from 'lucide-react';

interface HistoryChartProps {
  alert: PRTAlert;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const rank = data.rank === 101 ? '>100' : data.rank;
    const url = data.url;

    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl shadow-2xl min-w-[200px]">
        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">{label}</p>
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-xs font-medium text-zinc-400">Posición:</span>
          <span className="text-sm font-black text-emerald-400">{rank}</span>
        </div>
        {url && (
          <div className="pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">URL Indexada:</p>
              {data.urlChanged && (
                <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                  ¡Cambio detectado!
                </span>
              )}
            </div>
            <div className="flex items-start gap-2 group">
              <p className="text-[11px] text-zinc-300 break-all line-clamp-2 flex-1 leading-relaxed">
                {url}
              </p>
              <a 
                href={url.startsWith('http') ? url : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 bg-zinc-800 rounded-md text-zinc-400 hover:text-emerald-400 transition-colors mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const HistoryChart: React.FC<HistoryChartProps> = ({ alert }) => {
  const parseRank = (val: number | string | undefined): number | null => {
    if (val === undefined || val === null || val === '—' || val === '-') return null;
    if (typeof val === 'string') {
      if (val.includes('>') || val.includes('+')) return 101;
      const n = parseInt(val, 10);
      return isNaN(n) ? null : n;
    }
    return val;
  };

  // Use ONLY real history data if available
  const chartData = (alert.history || []).map((h, i, arr) => {
    const prevUrl = i > 0 ? arr[i - 1].url : null;
    const currentUrl = h.url;
    // Highlight if URL changed since previous recorded point
    const urlChanged = i > 0 && currentUrl && prevUrl && currentUrl !== prevUrl;

    return { 
      name: h.date, 
      rank: h.rank === 'NTH' ? 101 : parseInt(h.rank.toString(), 10), 
      url: currentUrl,
      urlChanged
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-zinc-50 rounded-[32px] border border-dashed border-zinc-200">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-100 mb-4 text-zinc-300">
          <TrendingUp className="w-6 h-6" />
        </div>
        <p className="text-sm font-black text-zinc-900">Sin datos de evolución diaria reales</p>
        <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-2 font-bold px-8 text-center leading-relaxed">
          La API de PRT no ha devuelto historial diario para esta keyword.<br/>
          Verifique que el seguimiento histórico esté activo en su cuenta de PRT.
        </p>
      </div>
    );
  }

  const maxRank = Math.max(...chartData.map(d => d.rank));
  const yDomain = [1, Math.max(10, maxRank + 2)];

  return (
    <div className="w-full h-72 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
            dy={10}
            interval="preserveStartEnd"
          />
          <YAxis 
            reversed 
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <ReferenceLine y={10} stroke="#fecaca" strokeDasharray="3 3" label={{ position: 'right', value: 'Top 10', fill: '#f87171', fontSize: 10 }} />
          <Area 
            type="monotone" 
            dataKey="rank" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRank)" 
            dot={(props: any) => {
              const { cx, cy, payload, index } = props;
              const url = payload?.url;
              const hasUrl = url && payload.rank !== 101;
              
              const handleClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (hasUrl) {
                  const finalUrl = url.startsWith('http') ? url : `https://${url}`;
                  window.open(finalUrl, '_blank', 'noopener,noreferrer');
                }
              };

              return (
                <circle 
                  key={`dot-${index}`}
                  cx={cx} 
                  cy={cy} 
                  r={payload.urlChanged ? 6 : (hasUrl ? 5 : 3)} 
                  fill={payload.urlChanged ? "#f97316" : "#10b981"} 
                  stroke="#fff" 
                  strokeWidth={payload.urlChanged ? 3 : 2} 
                  style={{ cursor: hasUrl ? 'pointer' : 'default' }}
                  onClick={handleClick}
                />
              );
            }}
            activeDot={(props: any) => {
              const { cx, cy, payload, index } = props;
              const url = payload?.url;
              const hasUrl = url && payload.rank !== 101;

              const handleClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (hasUrl) {
                  const finalUrl = url.startsWith('http') ? url : `https://${url}`;
                  window.open(finalUrl, '_blank', 'noopener,noreferrer');
                }
              };

              return (
                <circle 
                  key={`active-dot-${index}`}
                  cx={cx} 
                  cy={cy} 
                  r={payload.urlChanged ? 9 : 7} 
                  fill={payload.urlChanged ? "#ea580c" : "#059669"} 
                  stroke="#fff" 
                  strokeWidth={payload.urlChanged ? 3 : 2} 
                  style={{ cursor: hasUrl ? 'pointer' : 'default' }}
                  onClick={handleClick}
                />
              );
            }}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
