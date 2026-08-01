import type { PrintReview } from '@/data/press-data'

export function PrintReviewCard({ review }: { review: PrintReview }) {
  const isAward = review.kind === 'award'

  return (
    <article
      className="group flex flex-col border border-white/[0.08] overflow-hidden hover:border-white/20 transition-all duration-500 w-full h-full"
      style={{ background: 'rgba(255,255,255,0.01)' }}
    >
      {review.image ? (
        <div
          className="w-full h-48 flex items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse at center, rgba(237,232,220,0.06) 0%, rgba(0,0,0,0.4) 80%)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.image}
            alt={`${review.outlet} — ${review.title}`}
            className="max-h-full max-w-[70%] object-contain drop-shadow-2xl group-hover:scale-[1.03] transition-transform duration-500"
          />
        </div>
      ) : isAward ? (
        <div
          className="w-full h-48 flex flex-col items-center justify-center overflow-hidden gap-2 px-4 text-center"
          style={{ background: 'radial-gradient(ellipse at center, rgba(192,32,42,0.10) 0%, rgba(0,0,0,0.5) 85%)' }}
        >
          <span aria-hidden className="font-serif" style={{ fontSize: '3.5rem', lineHeight: 1, color: 'var(--color-lenox-red)', opacity: 0.85 }}>★</span>
          <span className="font-mono text-[0.5rem] tracking-[0.35em] uppercase" style={{ color: 'var(--color-lenox-red)' }}>
            Reconocimiento
          </span>
        </div>
      ) : null}

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="font-mono text-[0.55rem] tracking-[0.2em] uppercase text-cream/70 truncate">
            {review.outlet}
          </p>
          <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-white/30 shrink-0">
            {review.date}
          </span>
        </div>

        <h3 className="font-serif text-base font-normal leading-snug mb-2 text-cream">
          {review.title}
        </h3>

        <p className="font-body text-sm leading-relaxed text-cream-muted mb-3 flex-1">
          {review.description}
        </p>

        <div className="mt-auto pt-3 border-t border-white/[0.06]">
          <span className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-white/30">
            {review.country} · {isAward ? 'Reconocimiento' : 'Impreso'}
          </span>
        </div>
      </div>
    </article>
  )
}
