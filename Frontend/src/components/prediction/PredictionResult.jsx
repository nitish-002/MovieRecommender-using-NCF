import { Brain, Info, Sparkles, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export function PredictionResult({ prediction, onClose }) {
  if (!prediction) return null

  const score = prediction.score ?? prediction.preference_score ?? 0
  const percentage = Math.min(Math.max(Math.round(score * 100), 0), 100)
  const confidence = score >= 0.75 ? 'high' : score >= 0.45 ? 'medium' : 'low'
  
  const confidenceConfig = {
    high: { 
      label: 'Strong Match', 
      desc: 'NeuMF model indicates a very high likelihood of positive engagement.',
      textColor: 'text-emerald-400', 
      bgColor: 'bg-emerald-500/10',
      strokeColor: '#34d399',
      borderColor: 'border-emerald-500/30'
    },
    medium: { 
      label: 'Moderate Match', 
      desc: 'Model identifies partial taste overlap with your interaction pattern.',
      textColor: 'text-amber-400', 
      bgColor: 'bg-amber-500/10',
      strokeColor: '#fbbf24',
      borderColor: 'border-amber-500/30'
    },
    low: { 
      label: 'Low Match', 
      desc: 'Unlikely to align with your historical viewing preferences.',
      textColor: 'text-slate-400', 
      bgColor: 'bg-slate-500/10',
      strokeColor: '#94a3b8',
      borderColor: 'border-slate-500/30'
    },
  }

  const conf = confidenceConfig[confidence]

  return (
    <div className="bg-card rounded-2xl p-6 border border-border space-y-6 animate-scale-in">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/15 text-accent">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-primary text-base">NeuMF Prediction Result</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1.5 text-secondary hover:text-primary hover:bg-surface rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss result"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Circular Progress Meter */}
      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        <div className="relative h-32 w-32 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              className="text-border"
              strokeWidth="3.2"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Value circle */}
            <path
              strokeWidth="3.2"
              strokeDasharray={`${percentage}, 100`}
              strokeLinecap="round"
              stroke={conf.strokeColor}
              fill="none"
              className="transition-all duration-1000 ease-out"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-primary tracking-tight">{percentage}%</span>
            <span className="text-[10px] text-secondary uppercase font-semibold tracking-wider">Affinity</span>
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border', conf.bgColor, conf.textColor, conf.borderColor)}>
            <Brain className="h-3.5 w-3.5" />
            {conf.label}
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            {conf.desc}
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-secondary">
            <span className="px-2 py-0.5 rounded bg-surface border border-border">
              Movie ID: <strong className="text-primary">{prediction.movie_id}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-surface border border-border">
              Raw Logit / Probability: <strong className="text-primary">{score.toFixed(4)}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface/60 rounded-xl p-4 border border-border/80">
        <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-accent" />
          Neural Collaborative Filtering Interpretation
        </h4>
        <p className="text-xs text-secondary/90 leading-relaxed">
          This score represents the NeuMF model's calculated probability that user #{prediction.user_id} would positively interact with this title (MovieLens threshold ≥ 3.5★). It fuses Generalized Matrix Factorization (GMF) and Multi-Layer Perceptron (MLP) latent embeddings.
        </p>
      </div>
    </div>
  )
}
