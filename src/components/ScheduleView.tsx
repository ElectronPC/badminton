import React, { useState } from 'react';
import type { TournamentSession, Match, Team } from '../types';
import { Play, CheckCircle, Trophy, Edit3, Coffee } from 'lucide-react';

interface ScheduleViewProps {
  session: TournamentSession;
  onOpenScorer: (match: Match) => void;
  onGoToSetup: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  session,
  onOpenScorer,
  onGoToSetup,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'finished'>('all');

  const getTeam = (teamId: string): Team | undefined => {
    return session.teams.find(t => t.id === teamId);
  };

  const finishedCount = session.matches.filter(m => m.status === 'finished').length;
  const totalMatches = session.matches.length;
  const progressPercent = totalMatches > 0 ? Math.round((finishedCount / totalMatches) * 100) : 0;

  // Find the next upcoming or current match
  const currentMatch = session.matches.find(m => m.status === 'live') || session.matches.find(m => m.status === 'upcoming');

  const filteredMatches = session.matches.filter(m => {
    if (filter === 'upcoming') return m.status === 'upcoming' || m.status === 'live';
    if (filter === 'finished') return m.status === 'finished';
    return true;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Session Progress Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{session.title}</span>
            </h2>
            <p className="text-xs text-slate-400">
              วันที่ {session.date} • {session.courtName} • จบเกมที่ {session.targetPoints} แต้ม
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl w-fit">
            <Trophy className="w-4 h-4" />
            <span>จบแล้ว {finishedCount} / {totalMatches} แมตช์ ({progressPercent}%)</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700/40">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Featured Current/Next Match Highlight */}
      {currentMatch && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-800 to-teal-950/40 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {currentMatch.status === 'live' ? '🔥 กำลังแข่งขันอยู่' : '🏸 แมตช์ถัดไปที่ต้องลงเล่น'}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg">
              แมตช์ที่ {currentMatch.matchNumber} / {totalMatches}
            </span>
          </div>

          {/* Teams Confrontation Card */}
          <div className="grid grid-cols-2 gap-3 items-center py-2">
            {/* Team A */}
            <div className="text-center sm:text-left bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
              <span className="inline-block w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs leading-6 text-center mb-1">
                {getTeam(currentMatch.teamAId)?.code}
              </span>
              <div className="font-bold text-sm sm:text-base text-white">
                {getTeam(currentMatch.teamAId)?.name}
              </div>
              <div className="text-[11px] text-slate-400">
                {getTeam(currentMatch.teamAId)?.player1} &amp; {getTeam(currentMatch.teamAId)?.player2}
              </div>
            </div>

            {/* Team B */}
            <div className="text-center sm:text-right bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
              <span className="inline-block w-6 h-6 rounded-md bg-teal-500/20 text-teal-400 font-bold text-xs leading-6 text-center mb-1">
                {getTeam(currentMatch.teamBId)?.code}
              </span>
              <div className="font-bold text-sm sm:text-base text-white">
                {getTeam(currentMatch.teamBId)?.name}
              </div>
              <div className="text-[11px] text-slate-400">
                {getTeam(currentMatch.teamBId)?.player1} &amp; {getTeam(currentMatch.teamBId)?.player2}
              </div>
            </div>
          </div>

          {/* Resting teams banner */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800">
            <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-medium text-slate-300">ทีมที่ได้พักช่วงนี้:</span>
            <span className="text-slate-400 truncate">
              {currentMatch.restingTeamIds.map(id => getTeam(id)?.name).filter(Boolean).join(', ')}
            </span>
          </div>

          {/* Quick Action Button */}
          <div className="mt-4">
            <button
              onClick={() => onOpenScorer(currentMatch)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/20 transition active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{currentMatch.status === 'live' ? 'เปิดกระดานนับแต้มต่อ' : 'ลงสนาม & เริ่มนับแต้มคู่นี้'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ทั้งหมด ({session.matches.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'upcoming'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ยังไม่แข่ง ({session.matches.filter(m => m.status !== 'finished').length})
          </button>
          <button
            onClick={() => setFilter('finished')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === 'finished'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            จบแล้ว ({finishedCount})
          </button>
        </div>

        <button
          onClick={onGoToSetup}
          className="text-xs text-slate-400 hover:text-emerald-400 transition"
        >
          แก้ไขสมาชิก / ตั้งค่า
        </button>
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        {filteredMatches.map((match) => {
          const teamA = getTeam(match.teamAId);
          const teamB = getTeam(match.teamBId);
          if (!teamA || !teamB) return null;

          const isFinished = match.status === 'finished';
          const isLive = match.status === 'live';
          const isWinnerA = isFinished && match.winnerId === teamA.id;
          const isWinnerB = isFinished && match.winnerId === teamB.id;

          const restingNames = match.restingTeamIds
            .map(id => getTeam(id)?.name)
            .filter(Boolean)
            .join(', ');

          return (
            <div
              key={match.id}
              className={`rounded-2xl border p-3.5 sm:p-4 transition ${
                isLive
                  ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : isFinished
                  ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between text-xs mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">แมตช์ที่ {match.matchNumber}</span>
                  {isLive && (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      กำลังแข่ง
                    </span>
                  )}
                  {isFinished && (
                    <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      จบแล้ว
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onOpenScorer(match)}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition active:scale-95 ${
                    isLive
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      : isFinished
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {isFinished ? (
                    <>
                      <Edit3 className="w-3 h-3" />
                      <span>แก้คะแนน</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isLive ? 'นับแต้มต่อ' : 'เริ่มแข่ง'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Match Score & Teams */}
              <div
                onClick={() => onOpenScorer(match)}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 py-2 cursor-pointer group"
              >
                {/* Team A */}
                <div className={`p-2 rounded-xl transition ${isWinnerA ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-900/40'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {teamA.code}
                    </span>
                    <div className="min-w-0">
                      <div className={`font-semibold text-xs sm:text-sm truncate ${isWinnerA ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                        {teamA.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {teamA.player1} / {teamA.player2}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score or VS */}
                <div className="text-center px-2">
                  {isFinished || isLive ? (
                    <div className="font-mono font-black text-lg sm:text-2xl text-white tracking-wider">
                      <span className={isWinnerA ? 'text-emerald-400' : ''}>{match.scoreA}</span>
                      <span className="text-slate-500 mx-1.5">-</span>
                      <span className={isWinnerB ? 'text-teal-400' : ''}>{match.scoreB}</span>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-slate-500 bg-slate-900/80 px-2 py-1 rounded-md">
                      VS
                    </div>
                  )}
                </div>

                {/* Team B */}
                <div className={`p-2 rounded-xl transition text-right ${isWinnerB ? 'bg-teal-500/10 border border-teal-500/30' : 'bg-slate-900/40'}`}>
                  <div className="flex items-center justify-end gap-2">
                    <div className="min-w-0">
                      <div className={`font-semibold text-xs sm:text-sm truncate ${isWinnerB ? 'text-teal-400 font-bold' : 'text-white'}`}>
                        {teamB.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {teamB.player1} / {teamB.player2}
                      </div>
                    </div>
                    <span className="w-6 h-6 rounded-md bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {teamB.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resting Teams Footer */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Coffee className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-slate-400 font-medium shrink-0">ทีมที่พัก:</span>
                <span className="text-slate-300 truncate">{restingNames}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
