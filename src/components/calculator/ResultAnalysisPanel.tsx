'use client';

/**
 * ResultAnalysisPanel.tsx
 * 계산 결과의 "왜" 를 풀어주는 패널:
 *   - 조제료 수가 내역 (wageList)
 *   - 단계별 계산 과정 (steps)
 *
 * Phase 1 메타데이터 연동 — 각 step 의 제목 키워드를 분석해서 관련 학습 챕터를 추론하고
 * "이 개념을 레슨으로 복습하기 →" 링크를 노출한다.
 */

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { CalcResult, CalcStep } from '@/lib/calc-engine';
import { getLessonsForChapter } from '@/lib/learning/cross-refs';

// ─── 단계 제목 → 관련 챕터 추론 ──────────────────────────────────────

/**
 * CalcStep.title 에 포함된 키워드로 관련 Chapter 번호를 추정.
 * 엔진이 직접 relatedChapter 필드를 제공할 때까지의 중간 표현.
 */
function inferChapter(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes('약품금액') || t.includes('01항')) return 'CH01';
  if (t.includes('조제료') || t.includes('z코드') || t.includes('수가') || t.includes('02항')) return 'CH03';
  if (t.includes('산제') || t.includes('야간') || t.includes('토요') || t.includes('공휴') ||
      t.includes('가산') || t.includes('직접조제')) return 'CH04';
  if (t.includes('본인부담') || t.includes('본인일부') || t.includes('정률') || t.includes('정액') ||
      t.includes('보험요율') || t.includes('산정특례')) return 'CH05';
  if (t.includes('보훈') || t.includes('3자') || t.includes('mpva') || t.includes('공단')) return 'CH06';
  if (t.includes('trunc') || t.includes('round') || t.includes('반올림') || t.includes('절사') ||
      t.includes('사사오입')) return 'CH07';
  if (t.includes('648') || t.includes('상한제') || t.includes('특수') || t.includes('명절')) return 'CH08';
  if (t.includes('총액')) return 'CH07'; // 총액1/2 는 반올림(절사) 단계
  return null;
}

// ─── Props ─────────────────────────────────────────────────────────────

export interface ResultAnalysisPanelProps {
  result: CalcResult;
}

export default function ResultAnalysisPanel({ result }: ResultAnalysisPanelProps) {
  const [showWageList, setShowWageList] = useState(true);
  const [showSteps, setShowSteps] = useState(true);

  return (
    <>
      {/* 조제료 수가 내역 */}
      {result.wageList.length > 0 && (
        <Card variant="standard">
          <button
            onClick={() => setShowWageList((v) => !v)}
            className="w-full flex items-center justify-between text-base font-semibold text-text-primary"
          >
            조제료 수가 내역
            {showWageList
              ? <ChevronUp className="w-4 h-4 text-text-muted" />
              : <ChevronDown className="w-4 h-4 text-text-muted" />}
          </button>

          {showWageList && (
            <>
              {/* 가산 뱃지 */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {result.wageList.some(w => w.sugaCd.endsWith('010')) && (
                  <Badge variant="info">야간가산 적용</Badge>
                )}
                {result.wageList.some(w => w.sugaCd.endsWith('030')) && (
                  <Badge variant="neutral">토요 분리 적용</Badge>
                )}
                {result.wageList.some(w => w.sugaCd === 'Z4010') && (
                  <Badge variant="warning">산제(가루약) 가산</Badge>
                )}
                {result.wageList.some(w => w.sugaCd === 'Z7001') && (
                  <Badge variant="success">복약상담료 (Z7001)</Badge>
                )}
                {result.wageList.some(w => w.sugaCd === 'ZE100') && (
                  <Badge variant="primary">명절가산 (ZE100)</Badge>
                )}
                {result.wageList.some(w => w.sugaCd.startsWith('Z4200') || w.sugaCd === 'Z4201') && (
                  <Badge variant="primary">직접조제 (Z4200)</Badge>
                )}
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-light text-left text-text-muted">
                      <th className="py-2 font-medium">Z코드</th>
                      <th className="py-2 font-medium">수가명</th>
                      <th className="py-2 text-right font-medium">단가</th>
                      <th className="py-2 text-right font-medium">횟수</th>
                      <th className="py-2 text-right font-medium">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.wageList.map((w, i) => (
                      <tr key={i} className="border-b border-border-light">
                        <td className="py-2 font-mono text-xs text-primary-600">{w.sugaCd}</td>
                        <td className="py-2 text-text-secondary text-xs">{w.name}</td>
                        <td className="py-2 text-right font-mono text-xs">{w.price.toLocaleString()}</td>
                        <td className="py-2 text-right font-mono text-xs">{w.cnt}</td>
                        <td className="py-2 text-right font-mono text-xs font-medium">{w.sum.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="py-2 text-right text-xs font-semibold text-text-primary">합계</td>
                      <td className="py-2 text-right font-mono text-sm font-bold text-primary-600">
                        {result.sumWage.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </Card>
      )}

      {/* 단계별 계산 과정 (관련 레슨 링크 포함) */}
      {result.steps.length > 0 && (
        <Card variant="standard">
          <button
            onClick={() => setShowSteps((v) => !v)}
            className="w-full flex items-center justify-between text-base font-semibold text-text-primary"
          >
            단계별 계산 과정
            {showSteps
              ? <ChevronUp className="w-4 h-4 text-text-muted" />
              : <ChevronDown className="w-4 h-4 text-text-muted" />}
          </button>

          {showSteps && (
            <div className="mt-4 space-y-3">
              {result.steps.map((step, i) => (
                <StepRow key={i} step={step} index={i} />
              ))}
            </div>
          )}
        </Card>
      )}
    </>
  );
}

// ─── 단계별 행 컴포넌트 ───────────────────────────────────────────────

interface StepRowProps {
  step: CalcStep;
  index: number;
}

function StepRow({ step, index }: StepRowProps) {
  const chapter = inferChapter(step.title);
  const lessons = chapter ? getLessonsForChapter(chapter) : [];
  const firstLesson = lessons[0];

  return (
    <div className="bg-bg-panel rounded-lg p-3 border border-border-light">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-primary mb-1 flex items-center gap-2 flex-wrap">
            <span>Step {index + 1}: {step.title}</span>
            {chapter && (
              <Badge variant="neutral" className="text-[10px] px-1.5 py-0 font-mono">
                {chapter}
              </Badge>
            )}
          </p>
          <p className="text-xs text-text-muted font-mono mb-1.5 break-all">
            = {step.formula}
          </p>
        </div>
        <span className="text-sm font-bold text-primary-600 whitespace-nowrap flex-shrink-0">
          {step.result.toLocaleString()}{step.unit}
        </span>
      </div>

      {/* 모듈 힌트 */}
      <div className="flex flex-wrap gap-1 mt-1">
        {step.title.includes('보훈') && (
          <Badge variant="info" className="text-xs">보훈 모듈</Badge>
        )}
        {step.title.includes('산제') && (
          <Badge variant="warning" className="text-xs">산제 가산</Badge>
        )}
        {step.title.includes('trunc') && (
          <Badge variant="neutral" className="text-xs">반올림/절사</Badge>
        )}
        {step.title.includes('의료급여') && (
          <Badge variant="warning" className="text-xs">의료급여 규칙</Badge>
        )}
      </div>

      {/* 관련 레슨 링크 */}
      {firstLesson && (
        <Link
          href={`/learn/lesson/${firstLesson.slug}`}
          className="mt-2 inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline"
        >
          <BookOpen className="w-3 h-3" />
          복습: Lesson {firstLesson.number} — {firstLesson.title}
        </Link>
      )}
    </div>
  );
}
