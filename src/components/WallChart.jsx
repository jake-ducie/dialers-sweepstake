import { getTeamAllocation, getPlayerColor, PLAYER_MAP } from '../data/sweepstake.js';
import TierBadge from './TierBadge.jsx';

const STAGE_ORDER  = ['LAST_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'];
const STAGE_LABELS = {
  LAST_32:        'Round of 32',
  LAST_16:        'Round of 16',
  QUARTER_FINALS: 'Quarter-finals',
  SEMI_FINALS:    'Semi-finals',
  FINAL:          'Final',
};

// Build a bracket tree from the API match list.
// Returns: { LAST_32: [...16 matches], LAST_16: [...8 slots], QUARTER_FINALS: [...4 slots], SEMI_FINALS: [...2 slots], FINAL: [1 slot] }
// Each slot is { apiMatch, feederA, feederB } where feederA/B are the two R32 matches that produce the teams.
function buildBracket(matches) {
  const byStage = {};
  STAGE_ORDER.forEach(s => { byStage[s] = []; });
  (matches || []).forEach(m => {
    if (byStage[m.stage]) byStage[m.stage].push(m);
  });

  // Sort each stage by match id (scheduling order)
  STAGE_ORDER.forEach(s => byStage[s].sort((a, b) => a.id - b.id));

  const r32 = byStage['LAST_32'];

  // Pair R32 matches consecutively → each pair feeds one R16 slot
  const buildSlots = (stage, feeders) => {
    const api = byStage[stage];
    const slots = [];
    const n = stage === 'LAST_16' ? 8 : stage === 'QUARTER_FINALS' ? 4 : stage === 'SEMI_FINALS' ? 2 : 1;
    for (let i = 0; i < n; i++) {
      slots.push({
        apiMatch: api[i] || null,
        feeders: feeders ? feeders[i] || [] : [],
      });
    }
    return slots;
  };

  // R32 feeders for R16: pair [0,1], [2,3], [4,5], …
  const r16Feeders = [];
  for (let i = 0; i < 16; i += 2) r16Feeders.push([r32[i], r32[i + 1]]);

  const r16Slots = buildSlots('LAST_16', r16Feeders);

  // QF feeders: each QF slot is fed by 2 R16 slots
  const qfFeeders = [];
  for (let i = 0; i < 8; i += 2) qfFeeders.push([r16Slots[i], r16Slots[i + 1]]);

  const qfSlots = buildSlots('QUARTER_FINALS', qfFeeders);

  const sfFeeders = [[qfSlots[0], qfSlots[1]], [qfSlots[2], qfSlots[3]]];
  const sfSlots = buildSlots('SEMI_FINALS', sfFeeders);

  const finalSlots = buildSlots('FINAL', [[sfSlots[0], sfSlots[1]]]);

  return {
    LAST_32:        r32.map(m => ({ apiMatch: m, feeders: [] })),
    LAST_16:        r16Slots,
    QUARTER_FINALS: qfSlots,
    SEMI_FINALS:    sfSlots,
    FINAL:          finalSlots,
  };
}

export default function WallChart({ matches }) {
  const bracket = buildBracket(matches);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 0, minWidth: 960 }}>
        {STAGE_ORDER.map(stage => {
          const slots = bracket[stage] || [];
          const expected = { LAST_32: 16, LAST_16: 8, QUARTER_FINALS: 4, SEMI_FINALS: 2, FINAL: 1 }[stage];
          // Pad if we somehow have fewer
          while (slots.length < expected) slots.push({ apiMatch: null, feeders: [] });

          return (
            <div key={stage} style={{ flex: 1, minWidth: stage === 'LAST_32' ? 200 : 180 }}>
              <div style={{
                padding: '8px 12px',
                background: 'var(--raised)',
                borderBottom: '2px solid var(--accent)',
                fontWeight: 700, fontSize: '0.75rem',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                color: 'var(--accent)', textAlign: 'center',
              }}>
                {STAGE_LABELS[stage]}
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column',
                padding: '12px 8px', gap: 8,
                justifyContent: 'space-around', minHeight: 640,
              }}>
                {slots.map((slot, i) => (
                  <MatchCard key={i} slot={slot} stage={stage} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Derive the best available name for a slot: real team name, or "W: X vs Y" from feeders
function slotLabel(slot) {
  if (!slot) return 'TBD';
  const m = slot.apiMatch;
  if (m?.homeTeam?.name) return null; // has real teams, handled per-side
  // No real teams yet — try to describe from feeders
  if (slot.feeders?.length === 2) {
    const [f1, f2] = slot.feeders;
    const n1 = matchShortName(f1);
    const n2 = matchShortName(f2);
    if (n1 && n2) return `W: ${n1} · ${n2}`;
  }
  return 'TBD';
}

function matchShortName(feeder) {
  if (!feeder) return null;
  // feeder is either an apiMatch object or a slot object
  const m = feeder.apiMatch || feeder;
  if (!m) return null;
  const home = m.homeTeam?.name || m.homeTeam?.shortName;
  const away = m.awayTeam?.name || m.awayTeam?.shortName;
  if (home && away) {
    // shorten: use TLA or first word
    const h = m.homeTeam?.tla || home.split(' ')[0];
    const a = m.awayTeam?.tla || away.split(' ')[0];
    return `${h}/${a}`;
  }
  return null;
}

function MatchCard({ slot, stage }) {
  const m = slot?.apiMatch;
  const hasTeams = m?.homeTeam?.name && m?.awayTeam?.name;
  const homeScore = m?.score?.fullTime?.home;
  const awayScore = m?.score?.fullTime?.away;
  const finished  = m?.status === 'FINISHED';

  if (hasTeams) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', fontSize: '0.78rem' }}>
        <TeamSlot name={m.homeTeam.name} score={homeScore} won={finished && homeScore > awayScore} />
        <div style={{ height: 1, background: 'var(--border)' }} />
        <TeamSlot name={m.awayTeam.name} score={awayScore} won={finished && awayScore > homeScore} />
      </div>
    );
  }

  // No real teams — show routing labels from feeders
  const [f1, f2] = slot?.feeders || [];
  const label1 = feederLabel(f1);
  const label2 = feederLabel(f2);

  return (
    <div style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 6, overflow: 'hidden', fontSize: '0.72rem' }}>
      <PlaceholderSlot label={label1} />
      <div style={{ height: 1, background: 'var(--border)' }} />
      <PlaceholderSlot label={label2} />
    </div>
  );
}

function feederLabel(feeder) {
  if (!feeder) return 'TBD';
  // feeder is a slot ({ apiMatch, feeders }) or an apiMatch directly
  const m = feeder.apiMatch || (feeder.homeTeam !== undefined ? feeder : null);
  if (!m) return 'TBD';

  if (m.homeTeam?.name && m.awayTeam?.name) {
    // It's a resolved match — show "W: Home vs Away"
    const h = m.homeTeam.tla || m.homeTeam.name.split(' ')[0];
    const a = m.awayTeam.tla || m.awayTeam.name.split(' ')[0];
    return `W: ${h} vs ${a}`;
  }

  // It's a slot with its own feeders — recurse one level
  if (feeder.feeders?.length === 2) {
    const [f1, f2] = feeder.feeders;
    const n1 = matchShortName(f1.apiMatch || f1);
    const n2 = matchShortName(f2.apiMatch || f2);
    if (n1 && n2) return `W: ${n1} · ${n2}`;
  }

  return 'TBD';
}

function PlaceholderSlot({ label }) {
  return (
    <div style={{ padding: '5px 8px', color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.68rem' }}>
      {label}
    </div>
  );
}

function TeamSlot({ name, score, won }) {
  const alloc  = getTeamAllocation(name);
  const color  = alloc ? getPlayerColor(alloc.player) : null;
  const player = alloc ? PLAYER_MAP[alloc.player] : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px',
      background: won ? (color ? color + '22' : 'var(--raised)') : 'transparent',
    }}>
      {player && (
        <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '1px 3px', borderRadius: 3, background: color + '33', color, flexShrink: 0 }}>
          {player.id}
        </span>
      )}
      <span style={{ flex: 1, color: color || 'var(--text)', fontWeight: won ? 700 : 400 }}>{name}</span>
      {alloc && <TierBadge tier={alloc.tier} />}
      {score != null && (
        <span style={{ fontWeight: 700, minWidth: 14, textAlign: 'right', color: won ? 'var(--text)' : 'var(--muted)' }}>{score}</span>
      )}
    </div>
  );
}
