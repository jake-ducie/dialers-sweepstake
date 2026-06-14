import { getTeamAllocation, getPlayerColor, PLAYER_MAP } from '../data/sweepstake.js';
import TierBadge from './TierBadge.jsx';

// Hardcoded Round of 32 matchups from the FIFA draw
const R32_MATCHUPS = [
  { id: 'M73', home: '2nd A',              away: '2nd B' },
  { id: 'M74', home: '1st E',              away: '3rd A/B/C/D/F' },
  { id: 'M75', home: '1st F',              away: '2nd C' },
  { id: 'M76', home: '1st C',              away: '2nd F' },
  { id: 'M77', home: '1st I',              away: '3rd C/D/F/G/H' },
  { id: 'M78', home: '2nd E',              away: '2nd I' },
  { id: 'M79', home: '1st A',              away: '3rd C/E/F/H/I' },
  { id: 'M80', home: '1st L',              away: '3rd E/H/I/J/K' },
  { id: 'M81', home: '1st D',              away: '3rd B/E/F/I/J' },
  { id: 'M82', home: '1st G',              away: '3rd A/E/H/I/J' },
  { id: 'M83', home: '2nd K',              away: '2nd L' },
  { id: 'M84', home: '1st H',              away: '2nd J' },
  { id: 'M85', home: '1st B',              away: '3rd E/F/G/I/J' },
  { id: 'M86', home: '1st J',              away: '2nd H' },
  { id: 'M87', home: '1st K',              away: '3rd D/E/I/J/L' },
  { id: 'M88', home: '2nd D',              away: '2nd G' },
];

const STAGE_ORDER = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];
const STAGE_LABELS = {
  ROUND_OF_32: 'Round of 32',
  ROUND_OF_16: 'Round of 16',
  QUARTER_FINALS: 'Quarter-finals',
  SEMI_FINALS: 'Semi-finals',
  FINAL: 'Final',
};

export default function WallChart({ matches }) {
  // Group API matches by stage
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
              {stage === 'ROUND_OF_32'
                ? R32_MATCHUPS.map(m => (
                    <MatchCard key={m.id} matchId={m.id} homePlaceholder={m.home} awayPlaceholder={m.away} apiMatches={byStage[stage]} />
                  ))
                : (byStage[stage] || []).map(m => (
                    <MatchCard key={m.id} apiMatch={m} />
                  ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ matchId, homePlaceholder, awayPlaceholder, apiMatch, apiMatches }) {
  // Try to find matching API match by matchday ID
  const resolved = apiMatch || (apiMatches || []).find(m => String(m.id) === matchId?.replace('M', ''));

  const homeName = resolved?.homeTeam?.name || homePlaceholder || '?';
  const awayName = resolved?.awayTeam?.name || awayPlaceholder || '?';
  const homeScore = resolved?.score?.fullTime?.home;
  const awayScore = resolved?.score?.fullTime?.away;
  const finished = resolved?.status === 'FINISHED';

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
  const color = alloc ? getPlayerColor(alloc.player) : null;
  const player = alloc ? PLAYER_MAP[alloc.player] : null;
  const isPlaceholder = !alloc && (name?.includes('1st') || name?.includes('2nd') || name?.includes('3rd'));

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
          borderRadius: 3, background: color + '33', color: color, flexShrink: 0,
        }}>{player.id}</span>
      )}
      <span style={{
        flex: 1,
        color: isPlaceholder ? 'var(--muted)' : color && alloc ? color : 'var(--text)',
        fontWeight: won ? 700 : 400,
        fontStyle: isPlaceholder ? 'italic' : 'normal',
        fontSize: isPlaceholder ? '0.7rem' : '0.78rem',
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
