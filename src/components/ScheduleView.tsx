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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{session.title}</span>
            </h2>
            <p className="text-xs text-slate-500">
              วันที่ {session.date} • {session.courtName} • จบเกมที่ {session.targetPoints} แต้ม
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl w-fit">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>จบแล้ว {finishedCount} / {totalMatches} แมตช์ ({progressPercent}%)</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Featured Current/Next Match Highlight */}
      {currentMatch && (
        <div className="bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {currentMatch.status === 'live' ? '🔥 กำลังแข่งขันอยู่' : '🏸 แมตช์ถัดไปที่ต้องลงเล่น'}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-xs">
              แมตช์ที่ {currentMatch.matchNumber} / {totalMatches}
            </span>
          </div>

          {/* Teams Confrontation Card */}
          <div className="grid grid-cols-2 gap-3 items-center py-2">
            {/* Team A */}
            <div className="text-center sm:text-left bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="inline-block w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs leading-6 text-center mb-1">
                {getTeam(currentMatch.teamAId)?.code}
              </span>
              <div className="font-bold text-sm sm:text-base text-slate-900">
                {getTeam(currentMatch.teamAId)?.name}
              </div>
              <div className="text-[11px] text-slate-500">
                {getTeam(currentMatch.teamAId)?.player1} &amp; {getTeam(currentMatch.teamAId)?.player2}
              </div>
            </div>

            {/* Team B */}
            <div className="text-center sm:text-right bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="inline-block w-6 h-6 rounded-md bg-teal-100 text-teal-800 font-bold text-xs leading-6 text-center mb-1">
                {getTeam(currentMatch.teamBId)?.code}
              </span>
              <div className="font-bold text-sm sm:text-base text-slate-900">
                {getTeam(currentMatch.teamBId)?.name}
              </div>
              <div className="text-[11px] text-slate-500">
                {getTeam(currentMatch.teamBId)?.player1} &amp; {getTeam(currentMatch.teamBId)?.player2}
              </div>
            </div>
          </div>

          {/* Resting teams banner */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-700 bg-white/80 px-3 py-1.5 rounded-lg border border-slate-200">
            <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-bold text-slate-800">ทีมที่ได้พักช่วงนี้:</span>
            <span className="text-slate-600 truncate">
              {currentMatch.restingTeamIds.map(id => getTeam(id)?.name).filter(Boolean).join(', ')}
            </span>
          </div>

          {/* Quick Action Button */}
          <div className="mt-4">
            <button
              onClick={() => onOpenScorer(currentMatch)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-md shadow-emerald-600/30 transition active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{currentMatch.status === 'live' ? 'เปิดกระดานนับแต้มต่อ' : 'ลงสนาม &amp; เริ่มนับแต้มคู่นี้'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด ({session.matches.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'upcoming'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ยังไม่แข่ง ({session.matches.filter(m => m.status !== 'finished').length})
          </button>
          <button
            onClick={() => setFilter('finished')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'finished'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            จบแล้ว ({finishedCount})
          </button>
        </div>

        <button
          onClick={onGoToSetup}
          className="text-xs font-medium text-slate-500 hover:text-emerald-700 transition"
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
                  ? 'bg-amber-50/70 border-amber-400 shadow-md'
                  : isFinished
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between text-xs mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">แมตช์ที่ {match.matchNumber}</span>
                  {isLive && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                      กำลังแข่ง
                    </span>
                  )}
                  {isFinished && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      จบแล้ว
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onOpenScorer(match)}
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition active:scale-95 ${
                    isLive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : isFinished
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
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
                <div className={`p-2.5 rounded-xl border transition ${isWinnerA ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {teamA.code}
                    </span>
                    <div className="min-w-0">
                      <div className={`font-bold text-xs sm:text-sm truncate ${isWinnerA ? 'text-emerald-800' : 'text-slate-900'}`}>
                        {teamA.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {teamA.player1} / {teamA.player2}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score or VS */}
                <div className="text-center px-2">
                  {isFinished || isLive ? (
                    <div className="font-mono font-black text-xl sm:text-3xl text-slate-900 tracking-wider">
                      <span className={isWinnerA ? 'text-emerald-700' : ''}>{match.scoreA}</span>
                      <span className="text-slate-400 mx-1.5">-</span>
                      <span className={isWinnerB ? 'text-teal-700' : ''}>{match.scoreB}</span>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                      VS
                    </div>
                  )}
                </div>

                {/* Team B */}
                <div className={`p-2.5 rounded-xl border transition text-right ${isWinnerB ? 'bg-teal-50 border-teal-400' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-end gap-2">
                    <div className="min-w-0">
                      <div className={`font-bold text-xs sm:text-sm truncate ${isWinnerB ? 'text-teal-800' : 'text-slate-900'}`}>
                        {teamB.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {teamB.player1} / {teamB.player2}
                      </div>
                    </div>
                    <span className="w-6 h-6 rounded-md bg-teal-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {teamB.code}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resting Teams Footer */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-semibold text-slate-700 shrink-0">ทีมที่พัก:</span>
                <span className="text-slate-600 truncate">{restingNames}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
