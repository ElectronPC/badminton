import { useState, useEffect, useCallback, useRef } from 'react';
import type { TournamentSession, Match, Team } from './types';
import { generateSchedule } from './utils/scheduler';
import {
  loadLocalSession,
  saveLocalSession,
  syncSessionToCloud,
  fetchRemoteSession,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { SetupView } from './components/SetupView';
import { ScheduleView } from './components/ScheduleView';
import { StandingsView } from './components/StandingsView';
import { LiveScorer } from './components/LiveScorer';
import { ShareModal } from './components/ShareModal';

const DEFAULT_INITIAL_TEAMS: Team[] = [
  { id: 'team-1', code: 'A', name: 'ลิม - รอน', player1: 'ลิม', player2: 'รอน' },
  { id: 'team-2', code: 'B', name: 'นัส - ดาว', player1: 'นัส', player2: 'ดาว' },
  { id: 'team-3', code: 'C', name: 'ซิม - อัย', player1: 'ซิม', player2: 'อัย' },
  { id: 'team-4', code: 'D', name: 'ฟารุต - แว', player1: 'ฟารุต', player2: 'แว' },
  { id: 'team-5', code: 'E', name: 'ลัน - อาบิ', player1: 'ลัน', player2: 'อาบิ' },
  { id: 'team-6', code: 'F', name: 'อาท - มัง', player1: 'อาท', player2: 'มัง' },
];

export function App() {
  const [session, setSession] = useState<TournamentSession | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'schedule' | 'standings'>('schedule');
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize or fetch from cloud
  useEffect(() => {
    async function init() {
      const params = new URLSearchParams(window.location.search);
      const roomId = params.get('room');

      if (roomId) {
        setIsRefreshing(true);
        const remote = await fetchRemoteSession(roomId);
        setIsRefreshing(false);
        if (remote) {
          setSession(remote);
          saveLocalSession(remote);
          setActiveTab('schedule');
          return;
        }
      }

      // Fallback to local session
      const local = loadLocalSession();
      if (local && local.teams && local.teams.length > 0) {
        setSession(local);
        // Ensure it's synced to cloud if not already
        if (!local.cloudObjectId) {
          syncSessionToCloud(local).then((id) => {
            if (id) {
              setSession((prev) => (prev ? { ...prev, cloudObjectId: id } : prev));
            }
          });
        }
      } else {
        // Create initial default tournament with the 6 pairs
        const defaultMatches = generateSchedule(DEFAULT_INITIAL_TEAMS);
        const initial: TournamentSession = {
          id: `room-${Date.now().toString(36)}`,
          title: 'ก๊วนแบดมินตัน (6 ทีม 15 แมตช์)',
          date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }),
          targetPoints: 21,
          courtName: 'คอร์ต 1',
          teams: DEFAULT_INITIAL_TEAMS,
          matches: defaultMatches,
          activeMatchId: null,
          lastUpdated: Date.now(),
        };
        setSession(initial);
        saveLocalSession(initial);
        syncSessionToCloud(initial).then((id) => {
          if (id) {
            setSession((prev) => (prev ? { ...prev, cloudObjectId: id } : prev));
          }
        });
      }
    }

    init();
  }, []);

  // Background polling for live sync (every 4 seconds)
  useEffect(() => {
    if (!session?.cloudObjectId) return;

    const interval = setInterval(async () => {
      // Don't overwrite if actively scoring locally to prevent jumpiness
      if (scoringMatch) return;

      const remote = await fetchRemoteSession(session.cloudObjectId!);
      if (remote && remote.lastUpdated > (session.lastUpdated || 0)) {
        setSession(remote);
        saveLocalSession(remote);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [session?.cloudObjectId, session?.lastUpdated, scoringMatch]);

  // Save session & debounce cloud sync
  const handleSaveSession = useCallback((updated: TournamentSession) => {
    updated.lastUpdated = Date.now();
    setSession(updated);
    saveLocalSession(updated);

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = setTimeout(() => {
      syncSessionToCloud(updated).then((id) => {
        if (id && updated.cloudObjectId !== id) {
          setSession((prev) => (prev ? { ...prev, cloudObjectId: id } : prev));
        }
      });
    }, 500);
  }, []);

  // Update match score live
  const handleUpdateMatchScore = useCallback(
    (
      matchId: number,
      scoreA: number,
      scoreB: number,
      isFinished: boolean,
      winnerId: string | null
    ) => {
      if (!session) return;

      const updatedMatches = session.matches.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            scoreA,
            scoreB,
            status: isFinished ? ('finished' as const) : ('live' as const),
            winnerId,
          };
        }
        return m;
      });

      const updatedSession: TournamentSession = {
        ...session,
        matches: updatedMatches,
        activeMatchId: isFinished ? null : matchId,
      };

      handleSaveSession(updatedSession);

      // Keep scoringMatch updated in state so modal stays sync
      if (scoringMatch && scoringMatch.id === matchId) {
        setScoringMatch((prev) =>
          prev
            ? {
                ...prev,
                scoreA,
                scoreB,
                status: isFinished ? 'finished' : 'live',
                winnerId,
              }
            : null
        );
      }
    },
    [session, scoringMatch, handleSaveSession]
  );

  const handleManualRefresh = async () => {
    if (!session?.cloudObjectId) return;
    setIsRefreshing(true);
    const remote = await fetchRemoteSession(session.cloudObjectId);
    setIsRefreshing(false);
    if (remote) {
      setSession(remote);
      saveLocalSession(remote);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCloudSynced={Boolean(session?.cloudObjectId)}
        onShareClick={() => setShareModalOpen(true)}
        onRefreshClick={session?.cloudObjectId ? handleManualRefresh : undefined}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-5">
        {!session ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm">กำลังโหลดข้อมูลก๊วนแบด...</p>
          </div>
        ) : (
          <>
            {activeTab === 'schedule' && (
              <ScheduleView
                session={session}
                onOpenScorer={(match) => setScoringMatch(match)}
                onGoToSetup={() => setActiveTab('setup')}
              />
            )}

            {activeTab === 'standings' && (
              <StandingsView session={session} />
            )}

            {activeTab === 'setup' && (
              <SetupView
                session={session}
                onSaveSession={handleSaveSession}
                onGoToSchedule={() => setActiveTab('schedule')}
              />
            )}
          </>
        )}
      </main>

      {/* Live Match Scorer Modal */}
      {scoringMatch && session && (
        <LiveScorer
          match={scoringMatch}
          session={session}
          onUpdateMatchScore={handleUpdateMatchScore}
          onClose={() => setScoringMatch(null)}
        />
      )}

      {/* Share / QR Code Modal */}
      {shareModalOpen && session && (
        <ShareModal
          session={session}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
