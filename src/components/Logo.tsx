import { BRAND } from '../lib/api'
import defaultLogo from '../assets/teamflow-logo.png'

export default function Logo({ height = 32, withText = true, className = '' }: { height?: number; withText?: boolean; className?: string }) {
  // Prefer env-provided URL; otherwise use the imported asset (bundled by Vite)
  const src = BRAND.logoUrl ? BRAND.logoUrl : (defaultLogo as unknown as string)
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img src={src} height={height} style={{ height, width: 'auto', maxWidth: '100%' }} className="block object-contain" />
      {withText && <span className="text-lg font-semibold tracking-tight">{BRAND.name}</span>}
    </span>
  )
}
