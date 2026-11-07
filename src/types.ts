export interface Team {
  id: string;
  code: string; // e.g. "A", "B", "C"
  name: string; // e.g. "ลิม - รอน"
  player1: string;
  player2: string;
}

export interface Match {
  id: number;
  matchNumber: number;
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  status: 'upcoming' | 'live' | 'finished';
  winnerId: string | null;
  restingTeamIds: string[];
  durationMinutes?: number;
}

export interface TournamentSession {
  id: string; // Room ID e.g. "badminton-20261107-abc"
  cloudObjectId?: string; // ID on public sync service
  title: string;
  date: string;
  targetPoints: number; // default 21
  courtName: string; // default "คอร์ต 1"
  teams: Team[];
  matches: Match[];
  activeMatchId: number | null;
  lastUpdated: number;
}

export interface TeamStats {
  team: Team;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  rank: number;
}
