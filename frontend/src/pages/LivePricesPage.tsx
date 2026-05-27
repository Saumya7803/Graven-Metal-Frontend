import { useEffect, useMemo, useState } from 'react';
import { MotionReveal } from '../components/MotionReveal';
import { SEO } from '../components/seo/SEO';
import { demoLiveRows } from '../data/demoContent';

type LiveRow = {
  metal: string;
  unit: string;
  price: number;
  change: number;
};

const seedRows: LiveRow[] = demoLiveRows;
const goldChartPoints = [
  { day: '12 May', value: 3190 },
  { day: '13 May', value: 3250 },
  { day: '14 May', value: 3348 },
  { day: '15 May', value: 3298 },
  { day: '16 May', value: 3318 },
  { day: '17 May', value: 3278 },
  { day: '18 May', value: 3405 },
  { day: '19 May', value: 3360 },
  { day: '20 May', value: 3340 },
  { day: '21 May', value: 3448 },
];

const metalColors: Record<string, string> = {
  Gold: '#d8a037',
  Silver: '#d4dde6',
  Iron: '#c2762f',
  Copper: '#c87a2d',
  Aluminium: '#d4dde6',
  Steel: '#d4dde6',
};

const sparklinePointsByMetal: Record<string, string> = {
  Gold: '0,12 9,16 18,13 27,21 36,17 45,27 54,22 63,31 72,24 81,28 90,34 99,29',
  Silver: '0,11 9,15 18,14 27,22 36,17 45,28 54,24 63,32 72,25 81,29 90,36 99,32',
  Iron: '0,13 9,11 18,18 27,16 36,27 45,22 54,32 63,27 72,35 81,29 90,34 99,31',
  Copper: '0,34 9,30 18,32 27,24 36,27 45,18 54,21 63,13 72,17 81,8 90,12 99,5',
  Aluminium: '0,12 9,18 18,14 27,24 36,19 45,29 54,24 63,34 72,28 81,32 90,39 99,34',
  Steel: '0,13 9,16 18,25 27,21 36,31 45,26 54,36 63,29 72,34 81,41 90,35 99,38',
};

function Sparkline({ metalName }: { metalName: string }) {
  const isCopper = metalName === 'Copper';
  const points = sparklinePointsByMetal[metalName] || sparklinePointsByMetal.Gold;
  const stroke = isCopper ? '#c87a2d' : '#d34836';
  return (
    <svg viewBox="0 0 100 44" className="h-8 w-24 sm:w-28" aria-hidden="true">
      <polyline
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
        points={points}
      />
    </svg>
  );
}

function GoldPriceChart() {
  const width = 560;
  const height = 280;
  const padding = { top: 18, right: 16, bottom: 36, left: 52 };
  const min = 3180;
  const max = 3460;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const coords = goldChartPoints.map((point, index) => {
    const x = padding.left + (index / (goldChartPoints.length - 1)) * chartWidth;
    const y = padding.top + ((max - point.value) / (max - min)) * chartHeight;
    return { ...point, x, y };
  });
  const linePoints = coords.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints = `${padding.left},${padding.top + chartHeight} ${linePoints} ${padding.left + chartWidth},${padding.top + chartHeight}`;
  const yTicks = [3200, 3260, 3320, 3380, 3440];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full sm:h-[300px]" role="img" aria-label="Gold 24K price chart for the last seven days">
      <defs>
        <linearGradient id="goldChartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d8a037" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#d8a037" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="goldChartStroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#8e6428" />
          <stop offset="55%" stopColor="#c88a2f" />
          <stop offset="100%" stopColor="#f2c15f" />
        </linearGradient>
      </defs>

      {yTicks.map((tick) => {
        const y = padding.top + ((max - tick) / (max - min)) * chartHeight;
        return (
          <g key={tick}>
            <line x1={padding.left} x2={padding.left + chartWidth} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" />
            <text x={padding.left - 12} y={y + 4} textAnchor="end" className="fill-zinc-500 text-[12px]">
              {tick.toLocaleString()}
            </text>
          </g>
        );
      })}

      {coords.filter((_, index) => index % 2 === 0).map((point) => (
        <text key={point.day} x={point.x} y={height - 10} textAnchor="middle" className="fill-zinc-500 text-[12px]">
          {point.day}
        </text>
      ))}

      <polygon points={areaPoints} fill="url(#goldChartFill)" />
      <polyline
        fill="none"
        points={linePoints}
        stroke="url(#goldChartStroke)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      {coords.map((point, index) => (
        <circle key={`${point.day}-${index}`} cx={point.x} cy={point.y} r={index === coords.length - 1 ? 4 : 2.5} fill="#f2c15f" />
      ))}
    </svg>
  );
}

export function LivePricesPage() {
  const [rows, setRows] = useState(seedRows);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeView, setActiveView] = useState<'metals' | 'watchlist'>('metals');
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const savedWatchlist = localStorage.getItem('live_prices_watchlist');
    if (!savedWatchlist) return;
    try {
      const parsed = JSON.parse(savedWatchlist);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        setWatchlist(parsed);
      }
    } catch {
      // Ignore malformed local storage payload.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('live_prices_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRows((prev) =>
        prev.map((row) => {
          const drift = (Math.random() - 0.5) * 0.8;
          const nextPrice = Math.max(1, row.price + row.price * (drift / 100));
          const nextChange = Number((row.change + drift).toFixed(2));
          return {
            ...row,
            price: Number(nextPrice.toFixed(row.price > 1000 ? 0 : 2)),
            change: nextChange,
          };
        }),
      );
      setLastUpdated(new Date());
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const topMover = useMemo(() => {
    const sourceRows = activeView === 'watchlist' ? rows.filter((row) => watchlist.includes(row.metal)) : rows;
    return [...sourceRows].sort((a, b) => b.change - a.change)[0];
  }, [activeView, rows, watchlist]);

  const visibleRows = useMemo(() => {
    if (activeView === 'metals') return rows;
    return rows.filter((row) => watchlist.includes(row.metal));
  }, [activeView, rows, watchlist]);

  const toggleWatchlist = (metal: string) => {
    setWatchlist((prev) =>
      prev.includes(metal) ? prev.filter((item) => item !== metal) : [...prev, metal],
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
      <SEO
        title="Live Prices"
        description="Track live metal prices, trends, and chart movements in real time."
        path="/live-prices"
      />
      <MotionReveal>
        <section className="rounded-lg border border-gold/15 bg-[#070d12] p-4 shadow-halo sm:p-5 md:p-6">
          <p className="text-sm text-zinc-500">Home / Live Prices</p>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Live Metal Prices</h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
            Real-time metal prices and market trends updated every few seconds.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView('metals')}
              className={`rounded-sm px-9 py-2 text-sm font-semibold transition ${
                activeView === 'metals'
                  ? 'bg-gold-cta text-black shadow-gold'
                  : 'border border-white/5 bg-[#0b1117] text-zinc-300 hover:text-gold'
              }`}
            >
              Metals
            </button>
            <button
              type="button"
              onClick={() => setActiveView('watchlist')}
              className={`rounded-sm px-8 py-2 text-sm font-semibold transition ${
                activeView === 'watchlist'
                  ? 'bg-gold-cta text-black shadow-gold'
                  : 'border border-white/5 bg-[#0b1117] text-zinc-300 hover:text-gold'
              }`}
            >
              Watchlist
            </button>
            <p className="ml-auto text-xs text-gold">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          </div>

          <div className="mt-3 overflow-x-auto rounded-md border border-white/5 bg-[#080d12]">
            <table className="w-full min-w-[580px] text-sm">
              <thead className="border-b border-white/5 bg-[#0b1117] text-xs text-zinc-400">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold">Metal</th>
                  <th className="px-3 py-3 text-left font-semibold">Price</th>
                  <th className="px-3 py-3 text-left font-semibold">Change</th>
                  <th className="px-3 py-3 text-left font-semibold">Chart (7D)</th>
                  <th className="px-3 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const up = row.change >= 0;
                  const metalName = row.metal.split(' ')[0];
                  const metalColor = metalColors[metalName] || '#d8a037';
                  const isSaved = watchlist.includes(row.metal);
                  return (
                    <tr key={row.metal} className="border-t border-white/5 bg-[#080d12] transition hover:bg-[#0e151c]">
                      <td className="px-3 py-3.5">
                        <span className="flex items-center gap-2 font-semibold text-zinc-200">
                          <span
                            className="grid h-4 w-4 place-items-center rounded-full"
                            style={{
                              background: `radial-gradient(circle at 35% 35%, #fff8dc, ${metalColor} 45%, #4b3312 100%)`,
                              boxShadow: `0 0 12px ${metalColor}55`,
                            }}
                          />
                          {row.metal}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 font-semibold text-white">
                        ${row.price.toLocaleString()} {row.unit}
                      </td>
                      <td className={`px-3 py-3.5 font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                        {up ? '+' : ''}
                        {row.change.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2">
                        <Sparkline metalName={metalName} />
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => toggleWatchlist(row.metal)}
                          className={`rounded-sm px-2.5 py-1 text-xs font-semibold transition ${
                            isSaved
                              ? 'bg-gold/20 text-gold hover:bg-gold/30'
                              : 'border border-white/10 text-zinc-300 hover:border-gold/35 hover:text-gold'
                          }`}
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {visibleRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-400">
                      No metals in your watchlist yet. Switch to Metals and click Save on any row.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </MotionReveal>

      <div className="space-y-5">
        <MotionReveal delay={0.06}>
          <section className="rounded-lg border border-gold/15 bg-[#070d12] p-4 shadow-halo sm:p-5">
            <h2 className="text-xl font-bold text-white">
              <span className="text-gold">Gold (24K)</span> Price Chart
            </h2>
            <p className="mt-2 text-xs text-zinc-500">Last 7 days</p>
            <div className="mt-2 rounded-md border border-white/5 bg-[#090f14] p-2">
              <GoldPriceChart />
            </div>
          </section>
        </MotionReveal>

        <MotionReveal delay={0.12}>
          <section className="rounded-lg border border-gold/15 bg-[#070d12] p-5 shadow-halo">
            <h2 className="text-xl font-bold text-white">Market Insights</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
              Precious metals are seeing stable growth driven by global market demand and economic factors.
            </p>
            <div className="mt-4 rounded-md border border-white/5 bg-black/25 p-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-zinc-400">Top mover</span>
                <span className={`text-sm font-semibold ${topMover?.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {topMover?.change >= 0 ? '+' : ''}
                  {topMover?.change.toFixed(2)}%
                </span>
              </div>
              <p className="mt-1 font-semibold text-gold">{topMover?.metal}</p>
            </div>
            <button className="mt-5 rounded-sm bg-gold-cta px-6 py-2.5 text-sm font-semibold text-black shadow-gold transition hover:brightness-110">
              View Full Report
            </button>
          </section>
        </MotionReveal>
      </div>
    </div>
  );
}
