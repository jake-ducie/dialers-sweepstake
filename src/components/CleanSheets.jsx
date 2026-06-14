import { getTeamAllocation, getPlayerColor, PLAYER_MAP } from '../data/sweepstake.js';
import { calcGoldenGlove } from '../utils/points.js';

export default function CleanSheets({ matches, pointsData }) {
  const cleanSheets = calcGoldenGlove(matches || []);

  const sorted = Object.entries(cleanSheets)
    .sort(([, a], [, b]) => b - a)
    .map(([teamLower, count]) => ({ teamLower, count }));

  const maxCS = sorted[0]?.count || 0;
  const total = Object.values(cleanSheets).reduce((s, v) => s + v, 0);

  const gloveLeaders = sorted.filter(t => t.count === maxCS && maxCS > 0);
  const glovePlayerIds = new Set(
    gloveLeaders.map(t => {
      const alloc = getTeamAllocation(t.teamLower);
      return alloc?.player;
    }).filter(Boolean)
  );
  const glovePlayerNames = [...glovePlayerIds].map(id => PLAYER_MAP[id]?.name).join(', ');
  const gloveTeamNames = gloveLeaders.map(t => {
    // Find the original cased name from allocations
    const alloc = getTeamAllocation(t.teamLower);
    return alloc?.team || t.teamLower;
  }).join(', ');

  if (!matches) return <div style={{ color: 'var(--muted)', padding: 20 }}>No match data yet.</div>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <StatCard label="Golden Glove Leader" value={gloveTeamNames || '—'} sub={maxCS > 0 ? `${maxCS} clean sheets` : ''} color="var(--tier-t1)" />
        <StatCard label="Bonus Point Earner" value={glovePlayerNames || '—'} sub="Owns the glove leader's team" color="var(--accent)" />
        <StatCard label="Total Clean Sheets" value={total} sub="in tournament" color="var(--muted)" />
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'center' }}>#</th>
              <th>Team</th>
              <th style={{ textAlign: 'right' }}>Clean Sheets</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ teamLower, count }, i) => {
              const alloc = getTeamAllocation(teamLower);
              const color = alloc ? getPlayerColor(alloc.player) : null;
              const player = alloc ? PLAYER_MAP[alloc.player] : null;
              const isLeader = count === maxCS && maxCS > 0;
              const displayName = alloc?.team || teamLower;

              return (
                <tr key={teamLower} style={{
                  background: alloc ? color + '11' : 'transparent',
                  borderBottom: '1px solid var(--border)22',
                  borderLeft: isLeader ? '3px solid var(--tier-t1)' : '3px solid transparent',
                }}>
                  <td style={{ textAlign: 'center', color: 'var(--muted)' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {player && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: color + '33', color }}>{player.id}</span>
                      )}
                      <span style={{ color: color || 'var(--text)' }}>{displayName}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: isLeader ? 700 : 400, color: isLeader ? 'var(--tier-t1)' : 'var(--text)' }}>{count}</td>
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
