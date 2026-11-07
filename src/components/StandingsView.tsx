import React from 'react';
import type { TournamentSession } from '../types';
import { calculateStandings } from '../utils/storage';
import { Trophy, Flame } from 'lucide-react';

interface StandingsViewProps {
  session: TournamentSession;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ session }) => {
  const standings = calculateStandings(session);
  const finishedCount = session.matches.filter(m => m.status === 'finished').length;

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold text-xs flex items-center justify-center shadow-xs">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center justify-center shadow-xs">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-bold text-xs flex items-center justify-center shadow-xs">
          🥉
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between transition-colors">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>ตารางคะแนนรวม (Leaderboard)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            คำนวณจากผลการแข่งที่บันทึกแล้ว ({finishedCount} แมตช์)
          </p>
        </div>

        {finishedCount > 0 && standings.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-3 py-1.5 rounded-xl text-orange-700 dark:text-orange-300 text-xs font-bold">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>ผู้นำ: {standings[0].team.name}</span>
          </div>
        )}
      </div>

      {/* Standings Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-3 sm:px-4 text-center w-12">อันดับ</th>
                <th className="py-3 px-3 sm:px-4">ทีม / สมาชิก</th>
                <th className="py-3 px-2 sm:px-3 text-center">แข่ง</th>
                <th className="py-3 px-2 sm:px-3 text-center text-orange-600 dark:text-orange-400">ชนะ</th>
                <th className="py-3 px-2 sm:px-3 text-center text-rose-600 dark:text-rose-400">แพ้</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">ได้</th>
                <th className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">เสีย</th>
                <th className="py-3 px-3 sm:px-4 text-center font-black">+/-</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {standings.map((stat) => {
                const isLeader = stat.rank === 1 && stat.played > 0;
                return (
                  <tr
                    key={stat.team.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                      isLeader ? 'bg-orange-50/40 dark:bg-orange-950/20' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 sm:px-4 text-center">
                      <div className="flex items-center justify-center">
                        {getRankBadge(stat.rank)}
                      </div>
                    </td>

                    {/* Team info */}
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-md bg-slate-800 dark:bg-slate-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {stat.team.code}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {stat.team.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {stat.team.player1} &amp; {stat.team.player2}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Played */}
                    <td className="py-3 px-2 sm:px-3 text-center font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {stat.played}
                    </td>

                    {/* Won */}
                    <td className="py-3 px-2 sm:px-3 text-center font-mono font-bold text-orange-600 dark:text-orange-400">
                      {stat.won}
                    </td>

                    {/* Lost */}
                    <td className="py-3 px-2 sm:px-3 text-center font-mono font-semibold text-slate-500 dark:text-slate-400">
                      {stat.lost}
                    </td>

                    {/* Points For */}
                    <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                      {stat.pointsFor}
                    </td>

                    {/* Points Against */}
                    <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {stat.pointsAgainst}
                    </td>

                    {/* Point Difference */}
                    <td className="py-3 px-3 sm:px-4 text-center font-mono font-black">
                      <span
                        className={
                          stat.pointDiff > 0
                            ? 'text-orange-600 dark:text-orange-400'
                            : stat.pointDiff < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-500'
                        }
                      >
                        {stat.pointDiff > 0 ? `+${stat.pointDiff}` : stat.pointDiff}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {finishedCount === 0 && (
          <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
            ยังไม่มีแมตช์ที่แข่งจบ ผลคะแนนจะปรากฏที่นี่หลังบันทึกผลการแข่งขัน
          </div>
        )}
      </div>

      {/* Rules Notice */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1 shadow-xs transition-colors">
        <div className="font-bold text-slate-800 dark:text-slate-200">📌 กติกาการจัดอันดับ:</div>
        <p>1. จำนวนแมตช์ที่ชนะ (Won) มากที่สุด</p>
        <p>2. ผลต่างคะแนน (+/- Point Difference)</p>
        <p>3. แต้มได้รวม (Points For)</p>
      </div>
    </div>
  );
};
