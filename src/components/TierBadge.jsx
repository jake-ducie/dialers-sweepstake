const TIER_COLORS = {
  T1: '#F59E0B',
  T2: '#9CA3AF',
  T3: '#6B7280',
  T4: '#4B5563',
  DH: '#F97316',
};

export default function TierBadge({ tier }) {
  if (!tier) return null;
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 5px',
      borderRadius: 4,
      fontSize: '0.7rem',
      fontWeight: 700,
      color: '#000',
      background: TIER_COLORS[tier] || '#888',
      letterSpacing: '0.03em',
    }}>
      {tier}
    </span>
  );
}
