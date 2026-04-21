'use client';

/**
 * /dashboard — 학습 대시보드
 *
 * 데이터 소스 (모두 localStorage 기반):
 *   - loadQuizHistory(): 퀴즈 세션 기록 (최근 20개)
 *   - getWrongAnswers(): 오답 노트
 *   - getLearningState(): 레슨 진도
 *
 * 표시 요소:
 *   - 누적 통계 (푼 문제, 정답률, 완료 레슨)
 *   - 연속 학습일 (streak)
 *   - 챕터별 정답률 heatmap
 *   - 미해결 오답 목록 (짧게)
 *   - 최근 퀴즈 세션 기록
 */

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity, Award, BookOpen, CheckCircle, Flame, TrendingUp, ChevronRight, AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { loadQuizHistory, type QuizHistoryEntry, formatRelativeTime } from '@/lib/quiz/history';
import { getWrongAnswers, type WrongAnswerEntry } from '@/lib/quiz/wrong-notes';
import { getLearningState } from '@/lib/learning/progress';
import { LESSONS } from '@/content/lessons';
import { CHAPTERS } from '@/content/chapters';

// ─── 통계 계산 ────────────────────────────────────────────────

interface DashboardStats {
  totalSolved: number;
  totalCorrect: number;
  overallAccuracy: number; // 0-100
  streak: number; // 연속 학습일
  completedLessons: number;
  totalLessons: number;
  unresolvedWrongs: number;
  chapterAccuracy: Map<string, { solved: number; wrong: number; pct: number }>;
}

function calculateStreak(history: QuizHistoryEntry[]): number {
  if (history.length === 0) return 0;
  const dates = new Set<string>();
  for (const h of history) {
    const d = new Date(h.timestamp);
    dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const probe = new Date(today);
    probe.setDate(probe.getDate() - i);
    const key = `${probe.getFullYear()}-${probe.getMonth()}-${probe.getDate()}`;
    if (dates.has(key)) {
      streak++;
    } else {
      if (i === 0) continue; // 오늘 안 했어도 streak 유지 (어제까지)
      break;
    }
  }
  return streak;
}

function calculateStats(
  history: QuizHistoryEntry[],
  wrongs: WrongAnswerEntry[],
): DashboardStats {
  const totalSolved = history.reduce((sum, h) => sum + h.total, 0);
  const totalCorrect = history.reduce((sum, h) => sum + h.score, 0);
  const overallAccuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

  // 챕터별 정답률 (오답노트에 남은 chapter 기준 역산)
  const chapterAccuracy = new Map<string, { solved: number; wrong: number; pct: number }>();
  for (let i = 0; i <= 12; i++) {
    const ch = `CH${String(i).padStart(2, '0')}`;
    chapterAccuracy.set(ch, { solved: 0, wrong: 0, pct: 100 });
  }
  for (const w of wrongs) {
    const s = chapterAccuracy.get(w.chapter) ?? { solved: 0, wrong: 0, pct: 100 };
    s.wrong += 1;
    chapterAccuracy.set(w.chapter, s);
  }
  // history 로 solved 추정 (category 가 chapter 인 경우)
  for (const h of history) {
    if (h.category && h.category.match(/^CH\d+$/)) {
      const s = chapterAccuracy.get(h.category) ?? { solved: 0, wrong: 0, pct: 100 };
      s.solved += h.total;
      chapterAccuracy.set(h.category, s);
    }
  }
  // 정답률 계산 (wrong count 로만 추정)
  chapterAccuracy.forEach((s) => {
    if (s.solved > 0) {
      s.pct = Math.max(0, Math.round(((s.solved - s.wrong) / s.solved) * 100));
    } else if (s.wrong > 0) {
      s.pct = 0;
    }
  });

  return {
    totalSolved,
    totalCorrect,
    overallAccuracy,
    streak: calculateStreak(history),
    completedLessons: 0, // useEffect 에서 업데이트
    totalLessons: LESSONS.length,
    unresolvedWrongs: wrongs.filter((w) => !w.resolved).length,
    chapterAccuracy,
  };
}

// ─── 컴포넌트 ────────────────────────────────────────────────

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [wrongs, setWrongs] = useState<WrongAnswerEntry[]>([]);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setHistory(loadQuizHistory());
    setWrongs(getWrongAnswers());
    setNow(Date.now());

    // 레슨 진도
    const state = getLearningState();
    const done = Object.values(state.lessons ?? {}).filter((p) => p.status === 'completed').length;
    setCompletedLessons(done);
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const stats = useMemo(() => calculateStats(history, wrongs), [history, wrongs]);
  const unresolvedList = useMemo(() => wrongs.filter((w) => !w.resolved).slice(0, 5), [wrongs]);
  const dueCount = useMemo(
    () => wrongs.filter((w) => (w.nextReviewAt ?? 0) <= now).length,
    [wrongs, now],
  );

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
          <div className="h-32 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* 헤더 */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-2">
          <Activity className="w-7 h-7 text-primary-500" aria-hidden="true" />
          학습 대시보드
        </h1>
        <p className="text-sm text-text-secondary">
          지금까지의 학습 현황과 약점을 한눈에.
        </p>
      </div>

      {/* 오늘 복습 배너 */}
      {dueCount > 0 && (
        <Card variant="outlined" className="bg-warning-100 border-warning-500/40">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-warning-500 flex items-center gap-2">
              <Flame className="w-5 h-5" aria-hidden="true" />
              <span>
                오늘 복습할 문제 <strong>{dueCount}건</strong> 이 있습니다. 간격 반복으로 장기기억 굳히기!
              </span>
            </p>
            <Link href="/quiz/wrong-notes?due=1">
              <Button variant="primary" size="sm">
                복습 시작
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 요약 4카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Flame className="w-5 h-5 text-warning-500" />}
          label="연속 학습"
          value={`${stats.streak}일`}
          sub={stats.streak >= 7 ? '🔥 불타는 중!' : '매일 조금씩'}
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-info-500" />}
          label="완료 레슨"
          value={`${completedLessons} / ${stats.totalLessons}`}
          sub={`${Math.round((completedLessons / stats.totalLessons) * 100)}%`}
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-success-500" />}
          label="누적 정답률"
          value={`${stats.overallAccuracy}%`}
          sub={`${stats.totalCorrect} / ${stats.totalSolved} 문제`}
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-error-500" />}
          label="미해결 오답"
          value={`${stats.unresolvedWrongs}건`}
          sub={stats.unresolvedWrongs > 0 ? '복습 추천' : '완전 정리'}
        />
      </div>

      {/* 챕터별 Heatmap */}
      <Card variant="standard">
        <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-500" aria-hidden="true" />
          챕터별 정답률
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 lg:[grid-template-columns:repeat(13,minmax(0,1fr))]">
          {CHAPTERS.map((ch) => {
            const s = stats.chapterAccuracy.get(ch.number) ?? { solved: 0, wrong: 0, pct: 100 };
            const intensity =
              s.solved === 0 && s.wrong === 0
                ? 'bg-neutral-100 text-text-muted'
                : s.pct >= 80
                ? 'bg-success-500 text-white'
                : s.pct >= 60
                ? 'bg-success-100 text-success-500'
                : s.pct >= 40
                ? 'bg-warning-100 text-warning-500'
                : 'bg-error-100 text-error-500';
            const title =
              s.solved === 0 && s.wrong === 0
                ? `${ch.number} — 미응시`
                : `${ch.number} ${ch.title}: ${s.pct}% (오답 ${s.wrong}건 / 누적 ${s.solved}문)`;
            return (
              <Link
                key={ch.number}
                href={`/quiz/play?chapter=${ch.number}`}
                className={[
                  'aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold',
                  'hover:ring-2 hover:ring-primary-500 hover:ring-offset-2 transition-all',
                  intensity,
                ].join(' ')}
                title={title}
              >
                <span className="font-mono">{ch.number.replace('CH', '')}</span>
                <span className="text-[10px] opacity-80">
                  {s.solved === 0 && s.wrong === 0 ? '—' : `${s.pct}%`}
                </span>
              </Link>
            );
          })}
        </div>
        <p className="text-xs text-text-muted mt-2">
          클릭하면 해당 챕터 퀴즈로 이동. 정답률 색상: 초록(80%+) / 연두(60-80) / 황(40-60) / 빨강(40 미만) / 회색(미응시)
        </p>
      </Card>

      {/* 두 카드 병렬: 오답 / 기록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 미해결 오답 */}
        <Card variant="standard">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-error-500" aria-hidden="true" />
              미해결 오답 (최근 5)
            </h2>
            <Link href="/quiz/wrong-notes">
              <Button variant="ghost" size="sm">
                전체 보기
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          {unresolvedList.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-6">
              🎉 미해결 오답이 없습니다.
            </p>
          ) : (
            <ul className="space-y-2">
              {unresolvedList.map((w) => (
                <li
                  key={w.questionId}
                  className="flex items-start gap-2 text-sm p-2 rounded-lg hover:bg-neutral-50"
                >
                  <Badge variant="error">{w.chapter}</Badge>
                  <span className="text-text-primary line-clamp-1 flex-1">{w.question}</span>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatRelativeTime(w.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* 최근 퀴즈 기록 */}
        <Card variant="standard">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Award className="w-5 h-5 text-warning-500" aria-hidden="true" />
              최근 퀴즈 기록
            </h2>
            <Link href="/quiz">
              <Button variant="ghost" size="sm">
                새 퀴즈
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-6">
              아직 퀴즈 기록이 없습니다.
            </p>
          ) : (
            <ul className="space-y-2">
              {history.slice(0, 5).map((h) => (
                <li
                  key={h.id}
                  className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-neutral-50"
                >
                  <Badge variant={h.pct >= 80 ? 'success' : h.pct >= 60 ? 'warning' : 'error'}>
                    {h.pct}%
                  </Badge>
                  <span className="text-text-primary flex-1 line-clamp-1">
                    {h.categoryLabel}
                  </span>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {h.score}/{h.total}
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatRelativeTime(h.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* 학습 경로 추천 */}
      {stats.overallAccuracy < 60 && stats.totalSolved > 10 && (
        <Card variant="outlined" className="bg-info-100 border-info-500/30">
          <p className="text-sm text-info-500 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>정답률이 낮네요.</strong> 먼저 <Link href="/learn" className="underline">Lesson</Link> 을 차근차근 읽고
              오신 뒤 <Link href="/quiz/play?random=5" className="underline">퀴즈 5문</Link> 부터 다시 시도해보세요.
            </span>
          </p>
        </Card>
      )}
    </div>
  );
}

// ─── 헬퍼 ────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card variant="standard" className="space-y-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted">{sub}</div>
    </Card>
  );
}
