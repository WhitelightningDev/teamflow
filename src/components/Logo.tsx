import { BRAND } from '../lib/api'
import defaultLogo from '../assets/teamflow-logo.png'

export default function Logo({ height = 32, className = '' }: { height?: number; withText?: boolean; className?: string }) {
  const src = BRAND.logoUrl || defaultLogo
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img src={src} height={height} style={{ height }} className="block" />
      
    </span>
  )
}
