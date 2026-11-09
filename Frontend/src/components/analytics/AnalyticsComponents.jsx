import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { TrendingUp, Users, Film, Star, CheckCircle2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const CHART_COLORS = {
  primary: '#E50914',
  secondary: '#64748B',
  accent: '#38BDF8',
  success: '#34D399',
  warning: '#FBBF24',
  neumf: '#E50914',
}

const chartTheme = {
  gridColor: '#232B3A',
  textColor: '#94A3B8',
}

export function MetricCard({ title, value, description, icon, trend, className = '' }) {
  return (
    <div className={cn(
      'bg-card rounded-2xl p-5 border border-border/80',
      'transition-all duration-300 hover:border-accent/40 hover:shadow-lg',
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2.5">
            {icon && (
              <span className="p-2 bg-accent/10 rounded-xl text-accent shrink-0">
                {icon}
              </span>
            )}
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider truncate">{title}</h3>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-primary tracking-tight">{value}</div>
          {description && (
            <p className="text-xs text-secondary mt-1 truncate">{description}</p>
          )}
        </div>
        {trend !== undefined && trend !== null && (
          <div className={cn(
            'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0',
            trend >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          )}>
            <TrendingUp className={cn('h-3 w-3', trend < 0 && 'rotate-180')} />
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  )
}

export function ModelComparisonChart({ metrics = {}, className = '' }) {
  const models = ['popularity', 'gmf', 'mlp', 'neumf']
  const modelLabels = {
    popularity: 'Popularity Baseline',
    gmf: 'GMF (Matrix Factorization)',
    mlp: 'MLP (Deep Layers)',
    neumf: 'NeuMF (Neural NCF)',
  }

  const chartData = models
    .filter(m => metrics[m] || metrics[`${m}_baseline`] || (m === 'neumf' && metrics.neumf))
    .map(m => {
      const data = metrics[m] || metrics[`${m}_baseline`] || {}
      return {
        name: modelLabels[m] || m,
        'HR@10': data.hr_at_10 ?? data.HR_at_10 ?? 0,
        'NDCG@10': data.ndcg_at_10 ?? data.NDCG_at_10 ?? 0,
      }
    })

  // If backend provided only popularity_baseline & neumf directly:
  if (!chartData.length && metrics.popularity_baseline && metrics.neumf) {
    chartData.push(
      {
        name: 'Popularity Baseline',
        'HR@10': metrics.popularity_baseline.hr_at_10 ?? metrics.popularity_baseline.HR_at_10 ?? 0,
        'NDCG@10': metrics.popularity_baseline.ndcg_at_10 ?? metrics.popularity_baseline.NDCG_at_10 ?? 0,
      },
      {
        name: 'NeuMF (Ours)',
        'HR@10': metrics.neumf.hr_at_10 ?? metrics.neumf.HR_at_10 ?? 0,
        'NDCG@10': metrics.neumf.ndcg_at_10 ?? metrics.neumf.NDCG_at_10 ?? 0,
      }
    )
  }

  if (!chartData.length) {
    return (
      <div className={cn('bg-card rounded-2xl p-8 border border-border text-center', className)}>
        <p className="text-secondary text-sm">Evaluating models on Leave-One-Out protocol...</p>
        <p className="text-xs text-secondary/60 mt-1">HR@10 and NDCG@10 metrics will display here</p>
      </div>
    )
  }

  return (
    <div className={cn('bg-card rounded-2xl p-5 border border-border/80', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-primary text-base">Model Benchmark Comparison</h3>
          <p className="text-xs text-secondary mt-0.5">Leave-One-Out Evaluation on MovieLens 25M (Top-10 Ranking)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-secondary">HR@10</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
            <span className="text-secondary">NDCG@10</span>
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: chartTheme.textColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 1]} 
              tick={{ fill: chartTheme.textColor, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121722',
                border: '1px solid #232B3A',
                borderRadius: '12px',
                color: '#F8FAFC',
                fontSize: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}
              formatter={(value) => [typeof value === 'number' ? value.toFixed(4) : value, '']}
            />
            <Bar 
              dataKey="HR@10" 
              name="Hit Rate @ 10" 
              fill={CHART_COLORS.neumf} 
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
            <Bar 
              dataKey="NDCG@10" 
              name="NDCG @ 10" 
              fill={CHART_COLORS.accent} 
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function MetricTrendChart({ data, title, color = CHART_COLORS.primary, className = '' }) {
  if (!data?.length) return null

  return (
    <div className={cn('bg-card rounded-2xl p-5 border border-border/80', className)}>
      <h3 className="font-bold text-primary text-sm mb-3">{title}</h3>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: chartTheme.textColor, fontSize: 10 }} tickLine={false} />
            <YAxis tick={{ fill: chartTheme.textColor, fontSize: 10 }} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121722',
                border: '1px solid #232B3A',
                borderRadius: '8px',
                color: '#F8FAFC',
              }}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${color})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function DatasetStatsChart({ stats = {}, className = '' }) {
  const statItems = [
    { label: 'Active Users', value: stats.users || stats.total_users || 162148, icon: <Users className="h-4 w-4" /> },
    { label: 'Movie Catalog', value: stats.movies || stats.total_movies || 47396, icon: <Film className="h-4 w-4" /> },
    { label: 'Total Ratings', value: stats.ratings || stats.total_ratings || 25000095, icon: <Star className="h-4 w-4" /> },
    { label: 'Positive Interactions', value: stats.positives || stats.total_positives || 15000000, icon: <CheckCircle2 className="h-4 w-4" /> },
  ]

  return (
    <div className={cn('grid gap-3.5 sm:grid-cols-2', className)}>
      {statItems.map((stat) => (
        <div key={stat.label} className="bg-surface/60 rounded-xl p-4 border border-border/70 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-card text-accent border border-border/80">
            {stat.icon}
          </div>
          <div>
            <div className="text-xs font-medium text-secondary">{stat.label}</div>
            <div className="text-xl font-bold text-primary mt-0.5">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function EvaluationConfigDisplay({ config = {}, className = '' }) {
  const items = [
    { label: 'Evaluation Protocol', value: config?.evaluation?.protocol || 'Leave-One-Out (Chronological)' },
    { label: 'Negative Test Candidates', value: config?.evaluation?.negative_candidates || config?.evaluation?.eval_negatives || '99 negatives per user' },
    { label: 'Implicit Feedback Threshold', value: config?.positive_rule || config?.positive_threshold || 'Rating ≥ 3.5' },
    { label: 'Training Negative Ratio', value: config?.training?.negative_sampling?.ratio || '1 positive : 4 negatives' },
    { label: 'Min User Interactions', value: config?.minimum_user_interactions || config?.minimum_total_ratings || '5 ratings per user' },
    { label: 'Loss Function', value: 'BCEWithLogitsLoss' },
  ]

  return (
    <div className={cn('bg-card rounded-2xl p-5 border border-border/80', className)}>
      <h3 className="font-bold text-primary text-base mb-3">Model Training & Evaluation Setup</h3>
      <dl className="grid gap-2.5 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="bg-surface/60 rounded-xl p-3 border border-border/60">
            <dt className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-1">{item.label}</dt>
            <dd className="font-medium text-sm text-primary">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
