import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Clock3,
  Filter,
  LineChart,
  RefreshCw,
  Search,
  Star,
  TrendingUp,
} from 'lucide-react';
import { MotionReveal } from '../components/MotionReveal';
import { SEO } from '../components/seo/SEO';
import { demoLiveRows } from '../data/demoContent';

type LiveRow = {
  metal: string;
  unit: string;
  price: number;
  change: number;
};

type SortMode = 'mover' | 'price-high' | 'price-low' | 'name';

const seedRows: LiveRow[] = demoLiveRows;

const metalColors: Record<string, string> = {
  Gold: '#d8a037',
  Silver: '#d4dde6',
  Iron: '#a66a45',
  Copper: '#c87a2d',
  Aluminium: '#d4dde6',
  Steel: '#aeb7c1',
};

const sparklinePointsByMetal: Record<string, string> = {
  Gold: '0,28 9,24 18,26 27,18 36,20 45,12 54,15 63,9 72,14 81,10 90,6 99,8',
  Silver: '0,24 9,22 18,25 27,18 36,21 45,14 54,17 63,12 72,15 81,11 90,8 99,10',
  Iron: '0,13 9,16 18,14 27,21 36,18 45,27 54,25 63,30 72,28 81,33 90,29 99,31',
  Copper: '0,32 9,28 18,30 27,22 36,24 45,16 54,18 63,11 72,14 81,7 90,10 99,5',
  Aluminium: '0,18 9,20 18,17 27,23 36,19 45,27 54,24 63,31 72,27 81,29 90,34 99,32',
  Steel: '0,20 9,18 18,24 27,22 36,28 45,25 54,31 63,28 72,34 81,30 90,36 99,33',
};

const chartPointsByMetal: Record<string, number[]> = {
  Gold: [5920, 5995, 6040, 6015, 6072, 6098, 6064, 6120, 6105, 6168],
  Silver: [76200, 76940, 77100, 76860, 77520, 77980, 77640, 78220, 78050, 78610],
  Iron: [52800, 52440, 52680, 52120, 51980, 52330, 52010, 51820, 51640, 52100],
  Copper: [780, 788, 792, 799, 795, 806, 811, 816, 808, 821],
  Aluminium: [228, 226, 224, 225, 223, 222, 224, 226, 225, 227],
  Steel: [55800, 56220, 56650, 56380, 56820, 57140, 56900, 57360, 57220, 57650],
};

const chartLabels = ['12 May', '13 May', '14 May', '15 May', '16 May', '17 May', '18 May', '19 May', '20 May', '21 May'];

function getMetalName(rowName: string) {
  return rowName.split(' ')[0];
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: value > 1000 ? 0 : 2,
  })}`;
}

function Sparkline({ metalName, positive }: { metalName: string; positive: boolean }) {
  const points = sparklinePointsByMetal[metalName] || sparklinePointsByMetal.Gold;
  const stroke = positive ? '#34d399' : '#f87171';

  return (
    <svg viewBox="0 0 100 44" className="h-9 w-28" aria-hidden="true">
      <polyline
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.8"
        points={points}
      />
    </svg>
  );
}

function PriceChart({ metalName }: { metalName: string }) {
  const width = 620;
  const height = 300;
  const padding = { top: 22, right: 18, bottom: 40, left: 64 };
  const values = chartPointsByMetal[metalName] || chartPointsByMetal.Gold;
  const min = Math.min(...values) * 0.995;
  const max = Math.max(...values) * 1.005;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const color = metalColors[metalName] || metalColors.Gold;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((step) => min + (max - min) * step);

  const coords = values.map((value, index) => {
    const x = padding.left + (index / (values.length - 1)) * chartWidth;
    const y = padding.top + ((max - value) / (max - min)) * chartHeight;
    return { value, label: chartLabels[index], x, y };
  });

  const linePoints = coords.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPoints = `${padding.left},${padding.top + chartHeight} ${linePoints} ${padding.left + chartWidth},${padding.top + chartHeight}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[270px] w-full" role="img" aria-label={`${metalName} price trend chart`}>
      <defs>
        <linearGradient id="priceChartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="priceChartStroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#8d6a36" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor="#f0cf8a" />
        </linearGradient>
      </defs>

      {ticks.map((tick) => {
        const y = padding.top + ((max - tick) / (max - min)) * chartHeight;
        return (
          <g key={tick}>
            <line x1={padding.left} x2={padding.left + chartWidth} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" />
            <text x={padding.left - 12} y={y + 4} textAnchor="end" className="fill-zinc-500 text-[12px]">
              {formatCurrency(tick).replace('$', '')}
            </text>
          </g>
        );
      })}

      {coords.filter((_, index) => index % 2 === 0).map((point) => (
        <text key={point.label} x={point.x} y={height - 12} textAnchor="middle" className="fill-zinc-500 text-[12px]">
          {point.label}
        </text>
      ))}

      <polygon points={areaPoints} fill="url(#priceChartFill)" />
      <polyline
        fill="none"
        points={linePoints}
        stroke="url(#priceChartStroke)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      {coords.map((point, index) => (
        <circle
          key={`${point.label}-${point.value}`}
          cx={point.x}
          cy={point.y}
          r={index === coords.length - 1 ? 4 : 2.5}
          fill={index === coords.length - 1 ? '#f0cf8a' : color}
        />
      ))}
    </svg>
  );
}

export function LivePricesPage() {
  const [rows, setRows] = useState(seedRows);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeView, setActiveView] = useState<'metals' | 'watchlist'>('metals');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('mover');
  const [selectedMetal, setSelectedMetal] = useState(getMetalName(seedRows[0].metal));

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

  const scopedRows = useMemo(() => {
    const source = activeView === 'watchlist' ? rows.filter((row) => watchlist.includes(row.metal)) : rows;
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery ? source.filter((row) => row.metal.toLowerCase().includes(normalizedQuery)) : source;

    return [...filtered].sort((a, b) => {
      if (sortMode === 'price-high') return b.price - a.price;
      if (sortMode === 'price-low') return a.price - b.price;
      if (sortMode === 'name') return a.metal.localeCompare(b.metal);
      return Math.abs(b.change) - Math.abs(a.change);
    });
  }, [activeView, query, rows, sortMode, watchlist]);

  const topMover = useMemo(() => [...rows].sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0], [rows]);
  const gainers = useMemo(() => rows.filter((row) => row.change >= 0).length, [rows]);
  const averageMove = useMemo(() => rows.reduce((total, row) => total + row.change, 0) / rows.length, [rows]);
  const selectedRow = rows.find((row) => getMetalName(row.metal) === selectedMetal) || rows[0];
  const selectedIsUp = selectedRow.change >= 0;

  const toggleWatchlist = (metal: string) => {
    setWatchlist((prev) => (prev.includes(metal) ? prev.filter((item) => item !== metal) : [...prev, metal]));
  };

  return (
    <div className="space-y-5">
      <SEO
        title="Live Prices"
        description="Track live metal prices, trends, and chart movements in real time."
        path="/live-prices"
      />

      <MotionReveal>
        <section className="overflow-hidden rounded-md border border-gold/15 bg-[#060b10] shadow-halo">
          <div className="border-b border-gold/10 bg-[linear-gradient(135deg,#09111a_0%,#05090e_58%,#0b1015_100%)] px-4 py-5 sm:px-6 lg:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm text-zinc-500">Home / Live Prices</p>
                <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">Live Metal Prices</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                  Track simulated market movement, compare material rates, and save the metals you monitor most.
                </p>
              </div>

              <div className="grid gap-2 text-xs text-zinc-400 sm:grid-cols-2 lg:min-w-[340px]">
                <div className="rounded-md border border-white/10 bg-black/25 px-3 py-2">
                  <span className="flex items-center gap-2">
                    <Clock3 size={14} className="text-gold" />
                    Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-300">
                  <span className="flex items-center gap-2">
                    <RefreshCw size={14} />
                    Auto refresh 3.5s
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-b border-gold/10 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
            <article className="rounded-md border border-white/10 bg-[#0a1118] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase text-zinc-500">Top mover</p>
                <TrendingUp size={17} className="text-gold" />
              </div>
              <p className="mt-3 text-lg font-bold text-white">{topMover.metal}</p>
              <p className={`mt-1 text-sm font-semibold ${topMover.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {topMover.change >= 0 ? '+' : ''}
                {topMover.change.toFixed(2)}%
              </p>
            </article>

            <article className="rounded-md border border-white/10 bg-[#0a1118] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase text-zinc-500">Market breadth</p>
                <BarChart3 size={17} className="text-gold" />
              </div>
              <p className="mt-3 text-lg font-bold text-white">
                {gainers}/{rows.length} gaining
              </p>
              <p className="mt-1 text-sm text-zinc-400">Positive metals right now</p>
            </article>

            <article className="rounded-md border border-white/10 bg-[#0a1118] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase text-zinc-500">Average move</p>
                {averageMove >= 0 ? <ArrowUpRight size={17} className="text-emerald-400" /> : <ArrowDownRight size={17} className="text-red-400" />}
              </div>
              <p className={`mt-3 text-lg font-bold ${averageMove >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {averageMove >= 0 ? '+' : ''}
                {averageMove.toFixed(2)}%
              </p>
              <p className="mt-1 text-sm text-zinc-400">Across listed metals</p>
            </article>

            <article className="rounded-md border border-white/10 bg-[#0a1118] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase text-zinc-500">Watchlist</p>
                <Star size={17} className="text-gold" />
              </div>
              <p className="mt-3 text-lg font-bold text-white">{watchlist.length} saved</p>
              <p className="mt-1 text-sm text-zinc-400">Stored on this browser</p>
            </article>
          </div>

          <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] lg:p-5">
            <section className="min-w-0">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="inline-flex w-fit rounded-md border border-white/10 bg-[#0a1118] p-1">
                  {(['metals', 'watchlist'] as const).map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => setActiveView(view)}
                      className={`rounded px-4 py-2 text-sm font-semibold capitalize transition ${
                        activeView === view ? 'bg-gold-cta text-black shadow-gold' : 'text-zinc-300 hover:text-gold'
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>

                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px] xl:min-w-[430px]">
                  <label className="relative block">
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search metal"
                      className="gm-input h-10 pl-9"
                    />
                  </label>
                  <label className="relative block">
                    <Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <select
                      value={sortMode}
                      onChange={(event) => setSortMode(event.target.value as SortMode)}
                      className="gm-input h-10 appearance-none pl-9"
                    >
                      <option value="mover">Top movers</option>
                      <option value="price-high">Price high</option>
                      <option value="price-low">Price low</option>
                      <option value="name">Name</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-4 hidden overflow-x-auto rounded-md border border-white/10 bg-[#080d12] md:block">
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="border-b border-white/10 bg-[#0b1117] text-xs text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Metal</th>
                      <th className="px-4 py-3 text-left font-semibold">Price</th>
                      <th className="px-4 py-3 text-left font-semibold">Move</th>
                      <th className="px-4 py-3 text-left font-semibold">7D</th>
                      <th className="px-4 py-3 text-right font-semibold">Watch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopedRows.map((row) => {
                      const up = row.change >= 0;
                      const metalName = getMetalName(row.metal);
                      const metalColor = metalColors[metalName] || metalColors.Gold;
                      const isSaved = watchlist.includes(row.metal);
                      return (
                        <tr
                          key={row.metal}
                          className={`border-t border-white/5 bg-[#080d12] transition hover:bg-[#0e151c] ${
                            selectedMetal === metalName ? 'bg-gold/5' : ''
                          }`}
                        >
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => setSelectedMetal(metalName)}
                              className="flex items-center gap-3 text-left font-semibold text-zinc-200 hover:text-gold"
                            >
                              <span
                                className="grid h-4 w-4 place-items-center rounded-full"
                                style={{
                                  background: `radial-gradient(circle at 35% 35%, #fff8dc, ${metalColor} 45%, #4b3312 100%)`,
                                  boxShadow: `0 0 12px ${metalColor}55`,
                                }}
                              />
                              {row.metal}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-white">
                            {formatCurrency(row.price)} {row.unit}
                          </td>
                          <td className={`px-4 py-3.5 font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                            <span className="inline-flex items-center gap-1">
                              {up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                              {up ? '+' : ''}
                              {row.change.toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <Sparkline metalName={metalName} positive={up} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => toggleWatchlist(row.metal)}
                              aria-label={isSaved ? `Remove ${row.metal} from watchlist` : `Save ${row.metal} to watchlist`}
                              className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
                                isSaved
                                  ? 'border-gold/35 bg-gold/15 text-gold'
                                  : 'border-white/10 text-zinc-400 hover:border-gold/35 hover:text-gold'
                              }`}
                            >
                              <Star size={16} fill={isSaved ? 'currentColor' : 'none'} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid gap-3 md:hidden">
                {scopedRows.map((row) => {
                  const up = row.change >= 0;
                  const metalName = getMetalName(row.metal);
                  const metalColor = metalColors[metalName] || metalColors.Gold;
                  const isSaved = watchlist.includes(row.metal);
                  return (
                    <article key={row.metal} className="rounded-md border border-white/10 bg-[#080d12] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <button type="button" onClick={() => setSelectedMetal(metalName)} className="flex min-w-0 items-center gap-3 text-left">
                          <span
                            className="mt-1 h-4 w-4 shrink-0 rounded-full"
                            style={{
                              background: `radial-gradient(circle at 35% 35%, #fff8dc, ${metalColor} 45%, #4b3312 100%)`,
                              boxShadow: `0 0 12px ${metalColor}55`,
                            }}
                          />
                          <span>
                            <span className="block font-semibold text-white">{row.metal}</span>
                            <span className="mt-1 block text-sm text-zinc-400">
                              {formatCurrency(row.price)} {row.unit}
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWatchlist(row.metal)}
                          aria-label={isSaved ? `Remove ${row.metal} from watchlist` : `Save ${row.metal} to watchlist`}
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border ${
                            isSaved ? 'border-gold/35 bg-gold/15 text-gold' : 'border-white/10 text-zinc-400'
                          }`}
                        >
                          <Star size={16} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                          {up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                          {up ? '+' : ''}
                          {row.change.toFixed(2)}%
                        </span>
                        <Sparkline metalName={metalName} positive={up} />
                      </div>
                    </article>
                  );
                })}
              </div>

              {scopedRows.length === 0 ? (
                <div className="mt-4 rounded-md border border-white/10 bg-[#080d12] px-4 py-10 text-center">
                  <Star size={22} className="mx-auto text-gold" />
                  <p className="mt-3 font-semibold text-white">No metals found</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {activeView === 'watchlist'
                      ? 'Switch to Metals and save rows to build your watchlist.'
                      : 'Try another search term.'}
                  </p>
                </div>
              ) : null}
            </section>

            <aside className="space-y-4">
              <section className="rounded-md border border-gold/15 bg-[#080d12] p-4 shadow-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-zinc-500">Focused chart</p>
                    <h2 className="mt-1 text-xl font-bold text-white">{selectedMetal} trend</h2>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-md border border-gold/25 bg-gold/10 text-gold">
                    <LineChart size={19} />
                  </span>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {rows.map((row) => {
                    const metalName = getMetalName(row.metal);
                    return (
                      <button
                        key={row.metal}
                        type="button"
                        onClick={() => setSelectedMetal(metalName)}
                        className={`rounded-md border px-3 py-2 text-left text-xs font-semibold transition ${
                          selectedMetal === metalName
                            ? 'border-gold/45 bg-gold/15 text-gold'
                            : 'border-white/10 bg-black/15 text-zinc-300 hover:border-gold/30'
                        }`}
                      >
                        {metalName}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-md border border-white/10 bg-[#090f14] p-2">
                  <PriceChart metalName={selectedMetal} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 rounded-md border border-white/10 bg-black/20 px-3 py-3">
                  <span>
                    <span className="block text-xs text-zinc-500">Current</span>
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(selectedRow.price)} {selectedRow.unit}
                    </span>
                  </span>
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${selectedIsUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {selectedIsUp ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                    {selectedIsUp ? '+' : ''}
                    {selectedRow.change.toFixed(2)}%
                  </span>
                </div>
              </section>

              <section className="rounded-md border border-gold/15 bg-[#080d12] p-4 shadow-panel">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase text-zinc-500">Desk notes</p>
                    <h2 className="mt-1 text-xl font-bold text-white">Market Insights</h2>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-md border border-gold/25 bg-gold/10 text-gold">
                    <Bell size={18} />
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <p className="rounded-md border border-white/10 bg-black/20 px-3 py-3 text-sm leading-6 text-zinc-400">
                    Precious metals are holding firm while industrial metals show mixed movement across the session.
                  </p>
                  <p className="rounded-md border border-white/10 bg-black/20 px-3 py-3 text-sm leading-6 text-zinc-400">
                    Use the watchlist to track materials tied to current quotes or procurement planning.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </section>
      </MotionReveal>
    </div>
  );
}
