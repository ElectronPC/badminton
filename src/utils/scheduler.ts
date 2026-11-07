import type { Team, Match } from '../types';

/**
 * Pre-computed optimal schedule for 6 teams (Round-Robin 15 matches)
 * Ensures:
 * 1. Zero consecutive matches for any team (every team rests >= 1 match)
 * 2. Uniform rest intervals (every team rests at most 3 matches)
 * (Indexes are 0-based: 0=A, 1=B, 2=C, 3=D, 4=E, 5=F)
 */
const OPTIMAL_6_SCHEDULE: [number, number][] = [
  [1, 2], // 1: B vs C (นัส-ดาว vs ซิม-อัย)
  [0, 4], // 2: A vs E (ลิม-รอน vs ลัน-อาบิ)
  [3, 5], // 3: D vs F (ฟารุต-แว vs อาท-มัง)
  [0, 2], // 4: A vs C (ลิม-รอน vs ซิม-อัย)
  [1, 4], // 5: B vs E (นัส-ดาว vs ลัน-อาบิ)
  [2, 3], // 6: C vs D (ซิม-อัย vs ฟารุต-แว)
  [0, 5], // 7: A vs F (ลิม-รอน vs อาท-มัง)
  [1, 3], // 8: B vs D (นัส-ดาว vs ฟารุต-แว)
  [2, 4], // 9: C vs E (ซิม-อัย vs ลัน-อาบิ)
  [0, 1], // 10: A vs B (ลิม-รอน vs นัส-ดาว)
  [2, 5], // 11: C vs F (ซิม-อัย vs อาท-มัง)
  [3, 4], // 12: D vs E (ฟารุต-แว vs ลัน-อาบิ)
  [1, 5], // 13: B vs F (นัส-ดาว vs อาท-มัง)
  [0, 3], // 14: A vs D (ลิม-รอน vs ฟารุต-แว)
  [4, 5], // 15: E vs F (ลัน-อาบิ vs อาท-มัง)
];

/**
 * Generate a fair schedule for any N teams
 */
export function generateSchedule(teams: Team[]): Match[] {
  const n = teams.length;
  if (n < 2) return [];

  let pairs: [number, number][] = [];

  if (n === 6) {
    pairs = OPTIMAL_6_SCHEDULE;
  } else {
    // Generate all pairs
    const allPairs: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        allPairs.push([i, j]);
      }
    }

    // Heuristic ordering to minimize consecutive matches and balance rest times
    pairs = orderPairsFairly(allPairs, n);
  }

  // Create match objects
  return pairs.map((pair, index) => {
    const teamA = teams[pair[0]];
    const teamB = teams[pair[1]];
    const playingIds = new Set([teamA.id, teamB.id]);
    const restingTeamIds = teams.filter(t => !playingIds.has(t.id)).map(t => t.id);

    return {
      id: index + 1,
      matchNumber: index + 1,
      teamAId: teamA.id,
      teamBId: teamB.id,
      scoreA: 0,
      scoreB: 0,
      status: 'upcoming',
      winnerId: null,
      restingTeamIds,
    };
  });
}

function orderPairsFairly(allPairs: [number, number][], numTeams: number): [number, number][] {
  const remaining = [...allPairs];
  const ordered: [number, number][] = [];
  const teamLastPlayed = new Array(numTeams).fill(-10);

  while (remaining.length > 0) {
    const step = ordered.length;
    const lastTeams = step > 0 ? new Set([ordered[step - 1][0], ordered[step - 1][1]]) : new Set<number>();

    // Filter candidate pairs that don't play back-to-back if possible
    let candidates = remaining.filter(p => !lastTeams.has(p[0]) && !lastTeams.has(p[1]));
    if (candidates.length === 0) {
      // Fallback if unavoidable (e.g. small number of teams)
      candidates = remaining;
    }

    // Pick candidate pair whose teams have been waiting the longest
    candidates.sort((a, b) => {
      const waitA = (step - teamLastPlayed[a[0]]) + (step - teamLastPlayed[a[1]]);
      const waitB = (step - teamLastPlayed[b[0]]) + (step - teamLastPlayed[b[1]]);
      return waitB - waitA; // higher wait gets priority
    });

    const chosen = candidates[0];
    ordered.push(chosen);
    teamLastPlayed[chosen[0]] = step;
    teamLastPlayed[chosen[1]] = step;

    const chosenIndex = remaining.indexOf(chosen);
    remaining.splice(chosenIndex, 1);
  }

  return ordered;
}
