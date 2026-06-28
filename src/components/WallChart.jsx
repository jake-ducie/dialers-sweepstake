import { getTeamAllocation, getPlayerColor, PLAYER_MAP } from '../data/sweepstake.js';
import TierBadge from './TierBadge.jsx';

const STAGE_ORDER = ['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];
const STAGE_SLOTS  = { LAST_32: 16, LAST_16: 8, QUARTER_FINALS: 4, SEMI_FINALS: 2, FINAL: 1 };
const STAGE_LABELS = {
  LAST_32:        'Round of 32',
  LAST_16:        'Round of 16',
  QUARTER_FINALS: 'Quarter-finals',
  SEMI_FINALS:    'Semi-finals',
  FINAL:          'Final',
};

export default function WallChart({ matches }) {
  const byStage = {};
  (matches || []).forEach(m => {
    if (STAGE_ORDER.includes(m.stage)) {
      if (!byStage[m.stage]) byStage[m.stage] = [];
      byStage[m.stage].push(m);
    }
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 0, minWidth: 900 }}>
        {STAGE_ORDER.map(stage => (
          <div key={stage} style={{ flex: 1, minWidth: 180 }}>
            <div style={{
              padding: '8px 12px',
              background: 'var(--raised)',
              borderBottom: '2px solid var(--accent)',
              fontWeight: 700,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--accent)',
              textAlign: 'center',
            }}>
              {STAGE_LABELS[stage]}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '12px 8px',
              gap: 8,
              alignItems: 'stretch',
              justifyContent: 'space-around',
              minHeight: 600,
            }}>
              {(() => {
                const apiMatches = byStage[stage] || [];
                const slots = STAGE_SLOTS[stage];
                const cards = apiMatches.map(m => <MatchCard key={m.id} apiMatch={m} />);
                for (let i = cards.length; i < slots; i++) {
                  cards.push(<MatchCard key={`tbd-${stage}-${i}`} />);
                }
                return cards;
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ apiMatch }) {
  const homeName = apiMatch?.homeTeam?.name || 'TBD';
  const awayName = apiMatch?.awayTeam?.name || 'TBD';
  const homeScore = apiMatch?.score?.fullTime?.home;
  const awayScore = apiMatch?.score?.fullTime?.away;
  const finished  = apiMatch?.status === 'FINISHED';

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      overflow: 'hidden',
      fontSize: '0.78rem',
    }}>
      <TeamSlot name={homeName} score={homeScore} won={finished && homeScore > awayScore} />
      <div style={{ height: 1, background: 'var(--border)' }} />
      <TeamSlot name={awayName} score={awayScore} won={finished && awayScore > homeScore} />
    </div>
  );
}

function TeamSlot({ name, score, won }) {
  const alloc = getTeamAllocation(name);
  const color  = alloc ? getPlayerColor(alloc.player) : null;
  const player = alloc ? PLAYER_MAP[alloc.player] : null;
  const isTbd  = name === 'TBD';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 8px',
      background: won ? (color ? color + '22' : 'var(--raised)') : 'transparent',
    }}>
      {player && (
        <span style={{
          fontSize: '0.6rem', fontWeight: 700, padding: '1px 3px',
          borderRadius: 3, background: color + '33', color, flexShrink: 0,
        }}>{player.id}</span>
      )}
      <span style={{
        flex: 1,
        color: isTbd ? 'var(--muted)' : color ? color : 'var(--text)',
        fontWeight: won ? 700 : 400,
        fontStyle: isTbd ? 'italic' : 'normal',
        fontSize: isTbd ? '0.7rem' : '0.78rem',
      }}>
        {name}
      </span>
      {alloc && <TierBadge tier={alloc.tier} />}
      {score != null && (
        <span style={{ fontWeight: 700, minWidth: 14, textAlign: 'right', color: won ? 'var(--text)' : 'var(--muted)' }}>{score}</span>
      )}
    </div>
  );
}
