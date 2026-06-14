import { getTeamAllocation, getPlayerColor, PLAYER_MAP } from '../data/sweepstake.js';
import { calcGoldenBoot } from '../utils/points.js';

export default function TopScorers({ scorers, pointsData }) {
  if (!scorers) return <div style={{ color: 'var(--muted)', padding: 20 }}>No scorer data yet.</div>;

  const { leaders, maxNpg } = calcGoldenBoot(scorers);
  const totalGoals = scorers.reduce((s, sc) => s + (sc.goals || 0), 0);

  // Which players earn the boot bonus?
  const bootPlayerIds = new Set(
    leaders.map(l => {
      const alloc = getTeamAllocation(l.team?.name);
      return alloc?.player;
    }).filter(Boolean)
  );
  const bootPlayerNames = [...bootPlayerIds].map(id => PLAYER_MAP[id]?.name).join(', ');

  return (
    <div>
      {/* Header cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="Golden Boot Leader" value={leaders[0] ? leaders[0].playerName : '—'} sub={leaders[0] ? `${maxNpg} non-pen goals` : ''} color="var(--tier-t1)" />
        <StatCard label="Bonus Point Earner" value={bootPlayerNames || '—'} sub="Owns the boot leader's team" color="var(--accent)" />
        <StatCard label="Total Goals" value={totalGoals} sub="in tournament" color="var(--muted)" />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'center' }}>#</th>
              <th>Player</th>
              <th>Team</th>
              <th style={{ textAlign: 'right' }}>Goals</th>
              <th style={{ textAlign: 'right' }}>Pen</th>
              <th style={{ textAlign: 'right' }}>Non-Pen</th>
            </tr>
          </thead>
          <tbody>
            {scorers.map((s, i) => {
              const alloc = getTeamAllocation(s.team?.name);
              const color = alloc ? getPlayerColor(alloc.player) : null;
              const player = alloc ? PLAYER_MAP[alloc.player] : null;
              const npg = (s.goals || 0) - (s.penalties || 0);
              const isLeader = npg === maxNpg && maxNpg > 0;

              return (
                <tr key={s.player?.id || i} style={{
                  background: alloc ? color + '11' : 'transparent',
                  borderBottom: '1px solid var(--border)22',
                  borderLeft: isLeader ? `3px solid var(--tier-t1)` : '3px solid transparent',
                }}>
                  <td style={{ textAlign: 'center', color: 'var(--muted)' }}>{i + 1}</td>
                  <td style={{ fontWeight: isLeader ? 700 : 400 }}>{s.player?.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {player && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: color + '33', color }}>{player.id}</span>
                      )}
                      <span style={{ color: color || 'var(--text)' }}>{s.team?.name}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{s.goals}</td>
                  <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{s.penalties || 0}</td>
                  <td style={{ textAlign: 'right', color: isLeader ? 'var(--tier-t1)' : 'var(--text)', fontWeight: isLeader ? 700 : 400 }}>{npg}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '12px 16px',
      minWidth: 180,
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
