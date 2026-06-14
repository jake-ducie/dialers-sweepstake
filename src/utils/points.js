import { ALLOCATIONS, TOP_10_FIFA } from '../data/sweepstake.js';

// ── Group stage points ────────────────────────────────────────────────────────
// standings: array of groups from API response
export function calcGroupPoints(standings) {
  const teamPoints = {}; // teamName (lower) -> pts

  if (!standings) return teamPoints;

  standings.forEach(group => {
    const table = group.table || [];
    // Determine qualified teams: top 2 always qualify; best 3rds also qualify
    // We only know definitive qualification after group stage ends.
    // Use position in the group table.
    table.forEach(row => {
      const name = row.team?.name;
      if (!name) return;
      const pos = row.position;
      let pts = 0;
      if (pos === 1) pts = 3;
      else if (pos === 2) pts = 2;
      else if (pos === 3) pts = 1; // potential best 3rd — we'll treat as 1pt
      teamPoints[name.toLowerCase()] = pts;
    });
  });

  return teamPoints;
}

// ── Knockout points ───────────────────────────────────────────────────────────
// Derive round reached per team from match results
const ROUND_PTS = {
  'ROUND_OF_32':   2,
  'ROUND_OF_16':   3, // cumulative above group, but we map directly
  'QUARTER_FINALS': 4,
  'SEMI_FINALS':    5,
  'FINAL':          6, // +5 for reaching final, +7 for winning
};

// API stage names
const STAGE_ORDER = [
  'ROUND_OF_32',
  'ROUND_OF_16',
  'QUARTER_FINALS',
  'SEMI_FINALS',
  'FINAL',
];

export function calcKnockoutPoints(matches) {
  // Find the furthest round each team reached and whether they won the final
  const teamBestRound = {}; // teamName lower -> stage string
  const champion = { name: null };

  if (!matches) return { teamBestRound, champion };

  const koMatches = matches.filter(m =>
    STAGE_ORDER.includes(m.stage) &&
    (m.status === 'FINISHED' || m.status === 'IN_PLAY')
  );

  koMatches.forEach(m => {
    const home = m.homeTeam?.name?.toLowerCase();
    const away = m.awayTeam?.name?.toLowerCase();
    const stage = m.stage;

    if (home) {
      if (!teamBestRound[home] || STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(teamBestRound[home])) {
        teamBestRound[home] = stage;
      }
    }
    if (away) {
      if (!teamBestRound[away] || STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(teamBestRound[away])) {
        teamBestRound[away] = stage;
      }
    }

    // Find champion from finished Final
    if (stage === 'FINAL' && m.status === 'FINISHED') {
      const homeScore = m.score?.fullTime?.home ?? 0;
      const awayScore = m.score?.fullTime?.away ?? 0;
      const penHome = m.score?.penalties?.home;
      const penAway = m.score?.penalties?.away;
      let winner = null;
      if (penHome != null) {
        winner = penHome > penAway ? home : away;
      } else {
        winner = homeScore > awayScore ? home : away;
      }
      champion.name = winner;
    }
  });

  return { teamBestRound, champion };
}

export function knockoutPts(teamName, teamBestRound, champion) {
  const key = teamName?.toLowerCase();
  const round = teamBestRound[key];
  if (!round) return 0;

  const idx = STAGE_ORDER.indexOf(round);
  // +2 R32, +3 R16, +4 QF, +5 SF, +5 Final reached, +7 winner
  const basePts = [2, 3, 4, 5, 5][idx] ?? 0;
  const winBonus = champion.name === key ? 2 : 0; // 5+2=7 for winner
  return basePts + winBonus;
}

// ── Bonus points ──────────────────────────────────────────────────────────────
export function calcGoldenBoot(scorers) {
  if (!scorers?.length) return { leaders: [], nonPenGoals: 0 };
  // Non-penalty goals
  const withNpg = scorers.map(s => ({
    ...s,
    npg: (s.goals || 0) - (s.penalties || 0),
  }));
  const maxNpg = Math.max(...withNpg.map(s => s.npg));
  const leaders = withNpg.filter(s => s.npg === maxNpg && maxNpg > 0);
  return { leaders, maxNpg };
}

export function calcGoldenGlove(matches) {
  // Derive clean sheets per team from match results
  const cleanSheets = {}; // teamName lower -> count

  if (!matches) return cleanSheets;

  matches.filter(m => m.status === 'FINISHED').forEach(m => {
    const homeGoals = m.score?.fullTime?.home ?? null;
    const awayGoals = m.score?.fullTime?.away ?? null;
    const home = m.homeTeam?.name?.toLowerCase();
    const away = m.awayTeam?.name?.toLowerCase();

    if (homeGoals === null || awayGoals === null) return;

    if (awayGoals === 0 && home) cleanSheets[home] = (cleanSheets[home] || 0) + 1;
    if (homeGoals === 0 && away) cleanSheets[away] = (cleanSheets[away] || 0) + 1;
  });

  return cleanSheets;
}

// ── Dark horse bonus ──────────────────────────────────────────────────────────
export function calcDarkHorseBonus(matches) {
  // +1 per DH team per KO win vs top-10 team
  const dhAllocations = ALLOCATIONS.filter(a => a.tier === 'DH');
  const dhTeams = dhAllocations.map(a => a.team.toLowerCase());
  const top10Lower = TOP_10_FIFA.map(t => t.toLowerCase());

  const bonusMap = {}; // playerId -> count

  if (!matches) return bonusMap;

  const koMatches = matches.filter(m =>
    STAGE_ORDER.includes(m.stage) && m.status === 'FINISHED'
  );

  koMatches.forEach(m => {
    const home = m.homeTeam?.name?.toLowerCase();
    const away = m.awayTeam?.name?.toLowerCase();

    // Determine winner
    const homeGoals = m.score?.fullTime?.home ?? 0;
    const awayGoals = m.score?.fullTime?.away ?? 0;
    const penHome = m.score?.penalties?.home;
    const penAway = m.score?.penalties?.away;
    let winner, loser;
    if (penHome != null) {
      winner = penHome > penAway ? home : away;
      loser = penHome > penAway ? away : home;
    } else if (homeGoals !== awayGoals) {
      winner = homeGoals > awayGoals ? home : away;
      loser = homeGoals > awayGoals ? away : home;
    } else return;

    // Check if winner is a DH team beating a top-10 team
    if (dhTeams.includes(winner) && top10Lower.includes(loser)) {
      const alloc = dhAllocations.find(a => a.team.toLowerCase() === winner);
      if (alloc) {
        bonusMap[alloc.player] = (bonusMap[alloc.player] || 0) + 1;
      }
    }
  });

  return bonusMap;
}

// ── Aggregate all points per player ──────────────────────────────────────────
export function calcAllPoints({ standings, matches, scorers }) {
  const groupPts = calcGroupPoints(standings);
  const { teamBestRound, champion } = calcKnockoutPoints(matches);
  const cleanSheets = calcGoldenGlove(matches);
  const { leaders: bootLeaders } = calcGoldenBoot(scorers);
  const darkHorseBonus = calcDarkHorseBonus(matches);

  // Golden boot bonus: teams that have the boot leader
  const bootTeams = new Set(bootLeaders.map(s => s.team?.name?.toLowerCase()));
  // Golden glove: team with most clean sheets
  let maxCS = 0;
  Object.values(cleanSheets).forEach(v => { if (v > maxCS) maxCS = v; });
  const gloveTeams = new Set(
    Object.entries(cleanSheets).filter(([, v]) => v === maxCS && maxCS > 0).map(([k]) => k)
  );

  const playerTotals = {}; // playerId -> { gsPts, koPts, bonusPts, total, teams[] }

  ALLOCATIONS.forEach(({ player, team, tier }) => {
    const key = team.toLowerCase();
    const gs = groupPts[key] ?? 0;
    const ko = knockoutPts(team, teamBestRound, champion);
    let bonus = 0;
    if (bootTeams.has(key)) bonus += 1;
    if (gloveTeams.has(key)) bonus += 1;

    if (!playerTotals[player]) {
      playerTotals[player] = { gsPts: 0, koPts: 0, bonusPts: 0, total: 0, teams: [] };
    }
    playerTotals[player].gsPts += gs;
    playerTotals[player].koPts += ko;
    playerTotals[player].bonusPts += bonus;
    playerTotals[player].total += gs + ko + bonus;
    playerTotals[player].teams.push({ team, tier, gs, ko, bonus, total: gs + ko + bonus });
  });

  // Add DH bonus at player level
  Object.entries(darkHorseBonus).forEach(([playerId, pts]) => {
    if (playerTotals[playerId]) {
      playerTotals[playerId].bonusPts += pts;
      playerTotals[playerId].total += pts;
    }
  });

  return { playerTotals, groupPts, teamBestRound, champion, bootTeams, gloveTeams, cleanSheets, bootLeaders };
}
