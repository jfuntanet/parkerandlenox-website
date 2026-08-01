import { getMenus, findMenuByKeyword, type MenuSection } from '@/lib/api'

interface Props {
  menuKeyword: string  // 'barra' o 'cocina'
  title: string
  eyebrow: string
  emptyMsg: string
  hidePrices?: boolean
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

export async function MenuPageView({ menuKeyword, title, eyebrow, emptyMsg, hidePrices }: Props) {
  const menus = await getMenus().catch(() => [])
  const menu  = findMenuByKeyword(menus, menuKeyword)
  const sections: MenuSection[] = menu?.sections?.slice().sort((a,b) => a.sort_order - b.sort_order) ?? []

  return (
    <div className="relative min-h-screen pt-32 pb-24">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(160,120,74,0.10) 0%, transparent 60%)' }} />

      <div className="relative z-10 px-8 md:px-16 max-w-3xl mx-auto">
        <div className="mb-16 text-center">
          <p className="font-mono text-[0.6rem] tracking-[0.5em] uppercase mb-3" style={{ color: 'var(--color-parker-bronze)' }}>
            {eyebrow}
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-light text-cream">{title}</h1>
          <div className="mt-6 mx-auto h-px w-24" style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.4), transparent)' }} />
        </div>

        {sections.length === 0 ? (
          <p className="font-body text-center py-12" style={{ color: 'rgba(237,232,220,0.5)' }}>{emptyMsg}</p>
        ) : (
          <div className="flex flex-col gap-14">
            {sections.map(sec => {
              const items = sec.items.slice().sort((a,b) => a.sort_order - b.sort_order)
              return (
                <section key={sec.id}>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(160,120,74,0.35), transparent)' }} />
                    <span className="font-mono text-[0.65rem] tracking-[0.5em] uppercase" style={{ color: 'var(--color-parker-concrete)' }}>
                      {sec.name}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, rgba(192,32,42,0.35), transparent)' }} />
                  </div>
                  <div className="flex flex-col divide-y divide-white/[0.06]">
                    {items.map(it => (
                      <div key={it.id} className="py-5">
                        <div className="flex items-baseline justify-between gap-3 mb-1">
                          <h3 className="font-serif text-lg md:text-xl text-cream">{it.name}</h3>
                          {!hidePrices && (
                            <span className="font-mono text-sm flex-shrink-0" style={{ color: 'var(--color-parker-bronze)' }}>
                              {formatPrice(Number(it.price))}
                            </span>
                          )}
                        </div>
                        {it.description && (
                          <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(237,232,220,0.6)' }}>
                            {it.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
