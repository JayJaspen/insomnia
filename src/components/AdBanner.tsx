/**
 * AdBanner – placeholder för CPM-annonser.
 *
 * Ersätt innehållet i <div className="ad-slot"> med annonskodens script/iframe
 * från ditt annonsnätverk (t.ex. Google AdSense, Ezoic, AdThrive m.fl.).
 *
 * Props:
 *   slot   – unik identifierare, t.ex. "homepage-top" eller "chat-sidebar"
 *   size   – "leaderboard" (728×90), "rectangle" (300×250), "banner" (468×60)
 */
'use client'

type BannerSize = 'leaderboard' | 'rectangle' | 'banner'

const SIZE_CLASSES: Record<BannerSize, string> = {
  leaderboard: 'w-full max-w-[728px] h-[90px]',
  rectangle:   'w-[300px] h-[250px]',
  banner:      'w-full max-w-[468px] h-[60px]',
}

interface Props {
  slot: string
  size?: BannerSize
  className?: string
}

export default function AdBanner({ slot, size = 'leaderboard', className = '' }: Props) {
  return (
    <div
      className={`ad-slot flex items-center justify-center mx-auto
        border border-dashed border-accent/20 rounded-xl bg-bg-card/40
        text-text-muted text-xs ${SIZE_CLASSES[size]} ${className}`}
      data-ad-slot={slot}
      aria-label="Annons"
    >
      {/* ── Ersätt detta block med din annons-kod ── */}
      <span className="opacity-30 select-none pointer-events-none">
        Annons · {size} · {slot}
      </span>
      {/* ─────────────────────────────────────────── */}
    </div>
  )
}
