'use client';

/**
 * /calculator/history — 계산 이력 페이지
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, RotateCcw, Download, ClockIcon, FileText } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  getCalcHistory,
  deleteCalcHistory,
  clearCalcHistory,
} from '@/lib/calculator-history/storage';
import type { CalcHistoryEntry } from '@/lib/calculator-history/types';

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────

/** 상대 시간 포맷 ("3분 전", "2시간 전", "3일 전") */
function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return '방금 전';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}일 전`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}달 전`;
  return `${Math.floor(diffMonth / 12)}년 전`;
}

/** 원화 포맷 */
function formatWon(n: number): string {
  return n.toLocaleString('ko-KR') + '원';
}

/** 재실행용 쿼리 파라미터 생성 */
function buildRerunQuery(entry: CalcHistoryEntry): string {
  const { options } = entry;
  const params = new URLSearchParams();

  params.set('insuCode', options.insuCode);
  params.set('age', String(options.age));
  params.set('dosDate', options.dosDate);
  if (options.dosTime) params.set('dosTime', options.dosTime);
  if (options.isSaturday) params.set('isSaturday', '1');
  if (options.isNight) params.set('isNight', '1');
  if (options.isHolyDay) params.set('isHolyDay', '1');
  if (options.mediIllness) params.set('mediIllness', options.mediIllness);

  // 약품 리스트는 JSON 직렬화
  params.set('drugs', JSON.stringify(options.drugList));

  if (entry.scenarioName) params.set('scenario', entry.scenarioName);

  return params.toString();
}

// ─── 빈 상태 컴포넌트 ──────────────────────────────────────────────────────

function EmptyState() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <FileText className="w-16 h-16 text-neutral-300 mb-4" />
      <p className="text-lg font-medium text-text-secondary mb-2">
        아직 계산 이력이 없습니다
      </p>
      <p className="text-sm text-text-muted mb-6">
        계산기에서 계산을 실행하면 이곳에 자동으로 저장됩니다.
      </p>
      <Button variant="primary" onClick={() => router.push('/calculator')}>
        계산기로 이동
      </Button>
    </div>
  );
}

// ─── 이력 카드 ─────────────────────────────────────────────────────────────

interface HistoryCardProps {
  entry: CalcHistoryEntry;
  onDelete: (id: string) => void;
  onRerun: (entry: CalcHistoryEntry) => void;
}

function HistoryCard({ entry, onDelete, onRerun }: HistoryCardProps) {
  const { result, options } = entry;

  return (
    <Card variant="elevated">
      {/* 헤더 */}
      <CardHeader>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <ClockIcon className="w-4 h-4 text-text-muted shrink-0" />
            <span className="text-sm text-text-muted">
              {formatRelativeTime(entry.timestamp)}
            </span>
            {entry.scenarioName && (
              <Badge variant="primary">{entry.scenarioName}</Badge>
            )}
          </div>
          <Badge variant="neutral">{options.insuCode}</Badge>
        </div>
      </CardHeader>

      {/* 본문 */}
      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 왼쪽: 환자 정보 + 약품 요약 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted w-16 shrink-0">보험코드</span>
              <span className="text-sm font-medium text-text-primary">
                {options.insuCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted w-16 shrink-0">나이</span>
              <span className="text-sm font-medium text-text-primary">
                {options.age}세
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted w-16 shrink-0">약품</span>
              <span className="text-sm font-medium text-text-primary">
                {entry.drugSummary}
              </span>
            </div>
            {options.mediIllness && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted w-16 shrink-0">특례</span>
                <Badge variant="warning">{options.mediIllness}</Badge>
              </div>
            )}
          </div>

          {/* 오른쪽: 계산 결과 요약 */}
          <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">요양급여비용 총액</span>
              <span className="text-sm font-semibold text-text-primary">
                {formatWon(result.totalPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">본인부담금</span>
              <span className="text-sm font-semibold text-warning-500">
                {formatWon(result.userPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-border-light pt-2 mt-1">
              <span className="text-xs font-medium text-text-secondary">청구액</span>
              <span className="text-sm font-bold text-primary-600">
                {formatWon(result.pubPrice)}
              </span>
            </div>
            {result.mpvaPrice !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-muted">보훈청 청구액</span>
                <span className="text-sm font-medium text-info-500">
                  {formatWon(result.mpvaPrice)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardBody>

      {/* 액션 */}
      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(entry.id)}
          className="text-error-500 hover:bg-error-50"
        >
          <Trash2 className="w-4 h-4" />
          삭제
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onRerun(entry)}
        >
          <RotateCcw className="w-4 h-4" />
          재실행
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── 메인 페이지 ───────────────────────────────────────────────────────────

export default function CalculatorHistoryPage() {
  const router = useRouter();
  // null = 아직 마운트 전(SSR), [] = 마운트 후 이력 없음
  const [history, setHistory] = useState<CalcHistoryEntry[] | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setHistory(getCalcHistory());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteCalcHistory(id);
    setHistory(getCalcHistory());
  }, []);

  const handleClearAll = useCallback(() => {
    if (!window.confirm('전체 계산 이력을 삭제하시겠습니까?')) return;
    clearCalcHistory();
    setHistory([]);
  }, []);

  const handleRerun = useCallback(
    (entry: CalcHistoryEntry) => {
      const query = buildRerunQuery(entry);
      router.push(`/calculator?${query}`);
    },
    [router]
  );

  const handleExportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calc-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  // 하이드레이션 불일치 방지 (null = 아직 마운트 전)
  if (history === null) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="h-8 bg-neutral-100 rounded animate-pulse w-40 mb-4" />
        <div className="h-48 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">계산 이력</h1>
          <p className="text-sm text-text-muted mt-1">
            최근 {history.length}건 (최대 100건 보관)
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={handleExportJson}>
              <Download className="w-4 h-4" />
              내보내기 (JSON)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-error-500 hover:bg-error-50"
            >
              <Trash2 className="w-4 h-4" />
              전체 삭제
            </Button>
          </div>
        )}
      </div>

      {/* 이력 목록 또는 빈 상태 */}
      {history.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onDelete={handleDelete}
              onRerun={handleRerun}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/*
 * ─── 다른 팀에게: 계산기 페이지 연동 방법 ──────────────────────────────────
 *
 * ## 1. saveCalcHistory() 호출 방법
 *
 * /calculator/page.tsx 에서 계산 성공 후 아래와 같이 저장합니다:
 *
 * ```ts
 * import { saveCalcHistory, generateHistoryId } from '@/lib/calculator-history';
 * import type { CalcHistoryEntry } from '@/lib/calculator-history';
 *
 * // 계산 완료 핸들러 내부에서:
 * const entry: CalcHistoryEntry = {
 *   id: generateHistoryId(),
 *   timestamp: Date.now(),
 *   scenarioName: activeScenario?.name,          // 프리셋 선택 시
 *   options: calcOptions,                         // CalcOptions 전체
 *   result: {
 *     sumInsuDrug: calcResult.sumInsuDrug,
 *     sumWage:     calcResult.sumWage,
 *     totalPrice:  calcResult.totalPrice,
 *     userPrice:   calcResult.userPrice,
 *     pubPrice:    calcResult.pubPrice,
 *     mpvaPrice:   calcResult.mpvaPrice,          // 보훈 시에만
 *   },
 *   drugSummary: buildDrugSummary(calcOptions.drugList),
 *   // drugSummary 예시: "3종 내복 7일"
 *   // → 내복 약품 수, 가장 긴 dDay 사용
 * };
 * saveCalcHistory(entry);
 * ```
 *
 * ## 2. drugSummary 빌드 헬퍼 예시
 *
 * ```ts
 * function buildDrugSummary(drugs: DrugItem[]): string {
 *   const count = drugs.length;
 *   const maxDay = Math.max(...drugs.map((d) => d.dDay), 0);
 *   const takeLabel = drugs.some((d) => d.take === 'internal') ? '내복' :
 *                     drugs.some((d) => d.take === 'external') ? '외용' : '주사';
 *   return `${count}종 ${takeLabel} ${maxDay}일`;
 * }
 * ```
 *
 * ## 3. 재실행 (재실행 버튼) 쿼리 파라미터 수신 방법
 *
 * /calculator/page.tsx 상단에서 useSearchParams()로 읽습니다:
 *
 * ```ts
 * import { useSearchParams } from 'next/navigation';
 *
 * const params = useSearchParams();
 * const insuCode  = params.get('insuCode') ?? 'C10';
 * const age       = Number(params.get('age') ?? 30);
 * const dosDate   = params.get('dosDate') ?? '';
 * const scenario  = params.get('scenario');      // 시나리오 이름
 * const drugsJson = params.get('drugs');         // JSON.parse 후 DrugItem[]
 *
 * // useEffect 내부에서 초기 상태 세팅:
 * useEffect(() => {
 *   if (!drugsJson) return;
 *   const drugs = JSON.parse(drugsJson) as DrugItem[];
 *   setDrugRows(drugs.map(drugItemToDrugRow)); // 내부 변환 함수
 *   setInsuCode(insuCode);
 *   setAge(String(age));
 * }, []);
 * ```
 *
 * 전달되는 파라미터 목록:
 *   insuCode   — 보험코드 (C10, D10, ...)
 *   age        — 환자 나이 (숫자)
 *   dosDate    — 조제일자 (yyyyMMdd)
 *   dosTime    — 조제시간 (HHmm), 선택
 *   isSaturday — "1" 이면 true
 *   isNight    — "1" 이면 true
 *   isHolyDay  — "1" 이면 true
 *   mediIllness — 산정특례코드, 선택
 *   drugs      — DrugItem[] JSON 직렬화 문자열
 *   scenario   — 시나리오 이름, 선택
 * ──────────────────────────────────────────────────────────────────────────
 */
