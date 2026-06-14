export const PLAYERS = [
  { id: 'AJ', name: 'Ash Jacobs',         color: '#3B82F6' },
  { id: 'RB', name: 'Richard Balmforth',  color: '#F59E0B' },
  { id: 'JJ', name: 'Jake Jennings',      color: '#10B981' },
  { id: 'WD', name: 'William Darracott',  color: '#EF4444' },
  { id: 'MB', name: 'Mike Burke',         color: '#A855F7' },
];

// tier: 'T1'|'T2'|'T3'|'T4'|'DH'
export const ALLOCATIONS = [
  { player: 'AJ', team: 'Spain',       tier: 'T1' },
  { player: 'AJ', team: 'Belgium',     tier: 'T2' },
  { player: 'AJ', team: 'Senegal',     tier: 'T3' },
  { player: 'AJ', team: 'Switzerland', tier: 'T4' },
  { player: 'AJ', team: 'Austria',     tier: 'DH' },
  { player: 'AJ', team: 'Bosnia',      tier: 'DH' },

  { player: 'RB', team: 'England',     tier: 'T1' },
  { player: 'RB', team: 'Morocco',     tier: 'T2' },
  { player: 'RB', team: 'Mexico',      tier: 'T3' },
  { player: 'RB', team: 'Japan',       tier: 'T4' },
  { player: 'RB', team: 'Ecuador',     tier: 'DH' },
  { player: 'RB', team: 'Tunisia',     tier: 'DH' },

  { player: 'JJ', team: 'France',      tier: 'T1' },
  { player: 'JJ', team: 'Netherlands', tier: 'T2' },
  { player: 'JJ', team: 'Uruguay',     tier: 'T3' },
  { player: 'JJ', team: 'USA',         tier: 'T4' },
  { player: 'JJ', team: 'Ghana',       tier: 'DH' },
  { player: 'JJ', team: 'Canada',      tier: 'DH' },

  { player: 'WD', team: 'Argentina',   tier: 'T1' },
  { player: 'WD', team: 'Brazil',      tier: 'T2' },
  { player: 'WD', team: 'Colombia',    tier: 'T3' },
  { player: 'WD', team: 'Iran',        tier: 'T4' },
  { player: 'WD', team: 'South Korea', tier: 'DH' },
  { player: 'WD', team: 'DR Congo',    tier: 'DH' },

  { player: 'MB', team: 'Portugal',    tier: 'T1' },
  { player: 'MB', team: 'Germany',     tier: 'T2' },
  { player: 'MB', team: 'Croatia',     tier: 'T3' },
  { player: 'MB', team: 'Turkey',      tier: 'T4' },
  { player: 'MB', team: 'Norway',      tier: 'DH' },
  { player: 'MB', team: 'New Zealand', tier: 'DH' },
];

// Top 10 FIFA ranked teams for DH bonus
export const TOP_10_FIFA = [
  'Argentina', 'Spain', 'France', 'England', 'Portugal',
  'Brazil', 'Morocco', 'Netherlands', 'Belgium', 'Germany',
];

export const PLAYER_MAP = Object.fromEntries(PLAYERS.map(p => [p.id, p]));

// API name → our sweepstake name (for cases where they differ)
const API_NAME_MAP = {
  'united states': 'usa',
  'bosnia-herzegovina': 'bosnia',
  'congo dr': 'dr congo',
};

// Build a quick lookup: team name -> { player, tier }
export const TEAM_LOOKUP = Object.fromEntries(
  ALLOCATIONS.map(a => [a.team.toLowerCase(), a])
);

export function getTeamAllocation(teamName) {
  if (!teamName) return null;
  const lower = teamName.toLowerCase();
  const mapped = API_NAME_MAP[lower] || lower;
  return TEAM_LOOKUP[mapped] || null;
}

export function getPlayerColor(playerId) {
  return PLAYER_MAP[playerId]?.color || '#888';
}
