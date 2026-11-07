import type { TournamentSession, TeamStats } from '../types';

const STORAGE_KEY = 'badminton_tournament_session_v1';
const API_BASE = 'https://api.restful-api.dev/objects';

export function loadLocalSession(): TournamentSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TournamentSession;
  } catch (e) {
    console.error('Error loading local session:', e);
    return null;
  }
}

export function saveLocalSession(session: TournamentSession): void {
  try {
    session.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving local session:', e);
  }
}

export function clearLocalSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing session:', e);
  }
}

/**
 * Sync session to the free cloud database so anyone with the link can view/sync
 */
export async function syncSessionToCloud(session: TournamentSession): Promise<string | null> {
  try {
    const payload = {
      name: `badminton_${session.id}`,
      data: session,
    };

    if (session.cloudObjectId) {
      // Update existing
      const res = await fetch(`${API_BASE}/${session.cloudObjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return session.cloudObjectId;
      }
    }

    // Otherwise create new object
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const result = await res.json();
      session.cloudObjectId = result.id;
      saveLocalSession(session);
      return result.id;
    }
  } catch (err) {
    console.warn('Cloud sync error (fallback to local):', err);
  }
  return session.cloudObjectId || null;
}

/**
 * Fetch remote session from cloud using cloudObjectId
 */
export async function fetchRemoteSession(cloudObjectId: string): Promise<TournamentSession | null> {
  try {
    const res = await fetch(`${API_BASE}/${cloudObjectId}`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.data) {
      return json.data as TournamentSession;
    }
  } catch (err) {
    console.warn('Error fetching remote session:', err);
  }
  return null;
}

/**
 * Calculate standings / leaderboard table
 */
export function calculateStandings(session: TournamentSession): TeamStats[] {
  const statsMap: Record<string, TeamStats> = {};

  session.teams.forEach(team => {
    statsMap[team.id] = {
      team,
      played: 0,
      won: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      rank: 1,
    };
  });

  session.matches.forEach(match => {
    if (match.status === 'finished' && match.winnerId) {
      const statsA = statsMap[match.teamAId];
      const statsB = statsMap[match.teamBId];

      if (statsA && statsB) {
        statsA.played += 1;
        statsB.played += 1;

        statsA.pointsFor += match.scoreA;
        statsA.pointsAgainst += match.scoreB;
        statsA.pointDiff = statsA.pointsFor - statsA.pointsAgainst;

        statsB.pointsFor += match.scoreB;
        statsB.pointsAgainst += match.scoreA;
        statsB.pointDiff = statsB.pointsFor - statsB.pointsAgainst;

        if (match.winnerId === match.teamAId) {
          statsA.won += 1;
          statsB.lost += 1;
        } else if (match.winnerId === match.teamBId) {
          statsB.won += 1;
          statsA.lost += 1;
        }
      }
    }
  });

  const list = Object.values(statsMap);

  // Sort by: Won desc, PointDiff desc, PointsFor desc
  list.sort((a, b) => {
    if (b.won !== a.won) return b.won - a.won;
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff;
    return b.pointsFor - a.pointsFor;
  });

  // Assign ranks
  list.forEach((item, index) => {
    item.rank = index + 1;
  });

  return list;
}
