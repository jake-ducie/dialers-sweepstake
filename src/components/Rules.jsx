import { PLAYERS, ALLOCATIONS } from '../data/sweepstake.js';

export default function Rules() {
  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>

      <Section title="The Draw">
        <p>Each player was randomly allocated 6 teams across four seeded tiers plus two dark horse picks:</p>
        <table style={{ marginTop: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th>Player</th>
              <th>T1</th>
              <th>T2</th>
              <th>T3</th>
              <th>T4</th>
              <th>DH 1</th>
              <th>DH 2</th>
            </tr>
          </thead>
          <tbody>
            {PLAYERS.map(p => {
              const teams = ALLOCATIONS.filter(a => a.player === p.id);
              const byTier = t => teams.find(a => a.tier === t)?.team || '—';
              const dhs = teams.filter(a => a.tier === 'DH');
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)22' }}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                      {p.name}
                    </span>
                  </td>
                  <td style={{ color: 'var(--tier-t1)', fontWeight: 600 }}>{byTier('T1')}</td>
                  <td style={{ color: 'var(--tier-t2)' }}>{byTier('T2')}</td>
                  <td style={{ color: 'var(--tier-t3)' }}>{byTier('T3')}</td>
                  <td style={{ color: 'var(--tier-t4)' }}>{byTier('T4')}</td>
                  <td style={{ color: 'var(--tier-dh)' }}>{dhs[0]?.team || '—'}</td>
                  <td style={{ color: 'var(--tier-dh)' }}>{dhs[1]?.team || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      <Section title="Group Stage Points">
        <p>At the end of the group stage, each of your 6 teams earns sweepstake points based on how they finish in their group:</p>
        <ul>
          <li><strong>1st in group</strong> — 3 pts</li>
          <li><strong>2nd in group</strong> — 2 pts</li>
          <li><strong>Qualify as best 3rd</strong> — 1 pt</li>
          <li><strong>Eliminated</strong> — 0 pts</li>
        </ul>
        <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: '0.85rem' }}>
          During the group stage, positions are provisional and update live as matches are played.
        </p>
      </Section>

      <Section title="Knockout Round Points">
        <p>Teams earn additional cumulative points for each knockout round they reach:</p>
        <ul>
          <li><strong>Reach Round of 16</strong> — +2 pts</li>
          <li><strong>Reach Quarter-finals</strong> — +3 pts</li>
          <li><strong>Reach Semi-finals</strong> — +4 pts</li>
          <li><strong>Reach the Final</strong> — +5 pts</li>
          <li><strong>Win the tournament</strong> — +7 pts</li>
        </ul>
      </Section>

      <Section title="Bonus Points">
        <p>Three types of bonus point are available:</p>

        <h4 style={{ color: 'var(--tier-t1)', margin: '12px 0 6px' }}>Golden Boot</h4>
        <p>
          +1 pt if one of your teams produces the tournament's top scorer, measured by <strong>non-penalty goals</strong>.
          If two or more players are tied on non-penalty goals, all of their teams' owners earn the point.
        </p>

        <h4 style={{ color: 'var(--tier-t1)', margin: '12px 0 6px' }}>Golden Glove</h4>
        <p>
          +1 pt if one of your teams keeps the most clean sheets in the tournament.
          If tied, all owners of teams with the joint-highest tally earn the point.
        </p>

        <h4 style={{ color: 'var(--tier-dh)', margin: '12px 0 6px' }}>Dark Horse Bonus</h4>
        <p>
          +1 pt <em>each time</em> one of your dark horse (DH) teams beats a top-10 FIFA-ranked nation
          in the knockout rounds. This can stack — multiple upsets from the same team earn multiple points.
        </p>
        <p style={{ marginTop: 6, color: 'var(--muted)', fontSize: '0.85rem' }}>
          Top 10 FIFA nations: Argentina, Spain, France, England, Portugal, Brazil, Morocco, Netherlands, Belgium, Germany.
        </p>

        <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--raised)', borderRadius: 6, borderLeft: '3px solid var(--tier-dh)', fontSize: '0.85rem' }}>
          <strong style={{ color: 'var(--tier-dh)' }}>* Provisional bonus</strong>
          <p style={{ marginTop: 4, color: 'var(--muted)' }}>
            Golden Boot and Golden Glove bonuses are marked with an asterisk (*) because the leader can
            change as the tournament progresses. The Dark Horse bonus has no asterisk — once earned, those
            points are locked in.
          </p>
        </div>
      </Section>

      <Section title="How Your Total Is Calculated">
        <p>
          Your total score = the sum of all six teams' <strong>group stage pts</strong> + <strong>knockout pts</strong> + <strong>bonus pts</strong>.
          The player with the highest total at the end of the tournament wins.
        </p>
      </Section>

    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>{title}</h2>
      <div style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}
