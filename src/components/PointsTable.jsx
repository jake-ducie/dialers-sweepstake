import { useState } from 'react';
import { PLAYERS } from '../data/sweepstake.js';
import TierBadge from './TierBadge.jsx';

export default function PointsTable({ pointsData }) {
  const { playerTotals } = pointsData;
  const [expanded, setExpanded] = useState({});

  const sorted = [...PLAYERS].sort((a, b) => {
    const pa = playerTotals[a.id]?.total ?? 0;
    const pb = playerTotals[b.id]?.total ?? 0;
    return pb - pa;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map((player, rank) => {
        const data = playerTotals[player.id] || { gsPts: 0, koPts: 0, bonusPts: 0, total: 0, teams: [] };
        const isOpen = expanded[player.id];

        return (
          <div
            key={player.id}
            style={{
              background: 'var(--surface)',
              border: `1px solid ${player.color}44`,
              borderLeft: `3px solid ${player.color}`,
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setExpanded(e => ({ ...e, [player.id]: !e[player.id] }))}
              style={{
                width: '100%',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
                background: 'transparent',
              }}
            >
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: player.color + '22',
                color: player.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.75rem', flexShrink: 0,
              }}>
                #{rank + 1}
              </span>
              <span style={{ flex: 1, fontWeight: 600 }}>{player.name}</span>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <Stat label="GS" value={data.gsPts} />
                <Stat label="KO" value={data.koPts} />
                <Stat label="Bonus" value={data.bonusPts} />
                <span style={{
                  fontSize: '1.3rem', fontWeight: 800, color: player.color, minWidth: 36, textAlign: 'right',
                }}>{data.total}</span>
              </div>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem', marginLeft: 8 }}>{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <table>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th>Team</th>
                      <th>Tier</th>
                      <th style={{ textAlign: 'right' }}>GS</th>
                      <th style={{ textAlign: 'right' }}>KO</th>
                      <th style={{ textAlign: 'right' }}>Bonus</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.teams.map(t => (
                      <tr key={t.team} style={{ borderBottom: '1px solid var(--border)22' }}>
                        <td style={{ color: 'var(--text)' }}>{t.team}</td>
                        <td><TierBadge tier={t.tier} /></td>
                        <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{t.gs}</td>
                        <td style={{ textAlign: 'right', color: 'var(--muted)' }}>{t.ko}</td>
                        <td style={{ textAlign: 'right', color: t.bonus > 0 ? 'var(--accent)' : 'var(--muted)' }}>{t.bonus}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: player.color }}>{t.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{value}</div>
    </div>
  );
}
