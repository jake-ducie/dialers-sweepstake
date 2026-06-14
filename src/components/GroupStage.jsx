import { getTeamAllocation, getPlayerColor, PLAYER_MAP } from '../data/sweepstake.js';
import TierBadge from './TierBadge.jsx';

export default function GroupStage({ standings }) {
  if (!standings) {
    return <div style={{ color: 'var(--muted)', padding: 20 }}>No group data yet.</div>;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: 16,
    }}>
      {standings.map(group => <GroupTable key={group.group} group={group} />)}
    </div>
  );
}

function GroupTable({ group }) {
  const label = group.group?.replace('GROUP_', 'Group ') || group.stage;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', background: 'var(--raised)', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem' }}>
        {label}
      </div>
      <table>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ width: 28 }}>#</th>
            <th>Team</th>
            <th style={{ textAlign: 'center' }}>P</th>
            <th style={{ textAlign: 'center' }}>W</th>
            <th style={{ textAlign: 'center' }}>D</th>
            <th style={{ textAlign: 'center' }}>L</th>
            <th style={{ textAlign: 'center' }}>GD</th>
            <th style={{ textAlign: 'center', color: 'var(--accent)' }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {(group.table || []).map(row => <TeamRow key={row.team?.id} row={row} pos={row.position} />)}
        </tbody>
      </table>
    </div>
  );
}

function TeamRow({ row, pos }) {
  const teamName = row.team?.name;
  const alloc = getTeamAllocation(teamName);
  const color = alloc ? getPlayerColor(alloc.player) : null;
  const player = alloc ? PLAYER_MAP[alloc.player] : null;

  const rowBg = pos === 1 || pos === 2
    ? color ? color + '22' : 'var(--raised)'
    : pos === 3
    ? color ? color + '11' : 'transparent'
    : 'transparent';

  const textOpacity = pos === 4 ? 0.45 : 1;

  return (
    <tr style={{
      background: rowBg,
      borderBottom: '1px solid var(--border)22',
      opacity: textOpacity,
    }}>
      <td style={{ color: 'var(--muted)', fontSize: '0.75rem', textAlign: 'center' }}>{pos}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {player && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '1px 4px',
              borderRadius: 3, background: color + '33', color: color,
            }}>{player.id}</span>
          )}
          <span style={{ fontSize: '0.85rem' }}>{teamName}</span>
          {alloc && <TierBadge tier={alloc.tier} />}
        </div>
      </td>
      <td style={{ textAlign: 'center', color: 'var(--muted)' }}>{row.playedGames}</td>
      <td style={{ textAlign: 'center' }}>{row.won}</td>
      <td style={{ textAlign: 'center', color: 'var(--muted)' }}>{row.draw}</td>
      <td style={{ textAlign: 'center', color: 'var(--muted)' }}>{row.lost}</td>
      <td style={{ textAlign: 'center', color: row.goalDifference > 0 ? '#4ade80' : row.goalDifference < 0 ? '#f87171' : 'var(--muted)' }}>
        {row.goalDifference > 0 ? '+' : ''}{row.goalDifference}
      </td>
      <td style={{ textAlign: 'center', fontWeight: 700 }}>{row.points}</td>
    </tr>
  );
}
