import { useState } from 'react';
import { useApi } from './hooks/useFootballData.js';
import { calcAllPoints } from './utils/points.js';
import PointsTable from './components/PointsTable.jsx';
import GroupStage from './components/GroupStage.jsx';
import WallChart from './components/WallChart.jsx';
import TopScorers from './components/TopScorers.jsx';
import CleanSheets from './components/CleanSheets.jsx';
import Rules from './components/Rules.jsx';

const TABS = ['Points Table', 'Group Stage', 'Top Scorers', 'Wall Chart', 'Clean Sheets', 'Rules'];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  const { data: standingsData, loading: lStandings } = useApi('competitions/WC/standings');
  const { data: matchesData,   loading: lMatches   } = useApi('competitions/WC/matches');
  const { data: scorersData,   loading: lScorers   } = useApi('competitions/WC/scorers');

  const standings = standingsData?.standings;
  const matches   = matchesData?.matches;
  const scorers   = scorersData?.scorers;

  const pointsData = calcAllPoints({ standings, matches, scorers });

  const loading = lStandings || lMatches || lScorers;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 20px 0' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--accent)' }}>⚽</span>
          Dialers World Cup 2026
        </h1>
        <nav style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '8px 14px',
                fontSize: '0.85rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                borderRadius: '6px 6px 0 0',
                background: activeTab === i ? 'var(--bg)' : 'transparent',
                color: activeTab === i ? 'var(--accent)' : 'var(--muted)',
                borderBottom: activeTab === i ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'color 0.15s',
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '0.9rem' }}>
          Loading live data...
        </div>
      )}

      <main style={{ flex: 1, padding: '20px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
        {activeTab === 0 && <PointsTable pointsData={pointsData} />}
        {activeTab === 1 && <GroupStage standings={standings} />}
        {activeTab === 2 && <TopScorers scorers={scorers} pointsData={pointsData} />}
        {activeTab === 3 && <WallChart matches={matches} standings={standings} />}
        {activeTab === 4 && <CleanSheets matches={matches} pointsData={pointsData} />}
        {activeTab === 5 && <Rules />}
      </main>
    </div>
  );
}
