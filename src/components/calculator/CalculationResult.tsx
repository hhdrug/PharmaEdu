'use client';

/**
 * CalculationResult.tsx
 * 계산 결과 요약 카드 — 주요 금액 (약품금액/조제료/총액1/본인부담/청구액) + 3자배분 + 선별급여.
 * 단계별 분석이나 Z코드 내역은 ResultAnalysisPanel 에서 분리 처리.
 */

import { useState } from 'react';
import { Calculator, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { CalcResult } from '@/lib/calc-engine';

// ─── 공용 ResultRow ────────────────────────────────────────────────────

interface ResultRowProps {
  label: string;
  value: number;
  variant: 'neutral' | 'primary' | 'warning' | 'success' | 'info';
  bold?: boolean;
}

export function ResultRow({ label, value, variant, bold = false }: ResultRowProps) {
  const colorMap: Record<string, string> = {
    neutral: 'text-text-primary',
    primary: 'text-primary-600',
    warning: 'text-warning-500',
    success: 'text-success-500',
    info:    'text-info-500',
  };

  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-semibold' : ''} text-text-secondary`}>
        {label}
      </span>
      <span className={`font-mono ${bold ? 'text-base font-bold' : 'text-sm'} ${colorMap[variant]}`}>
        {value.toLocaleString('ko-KR')}원
      </span>
    </div>
  );
}

function formatWon(n: number): string {
  return n.toLocaleString('ko-KR') + '원';
}

// ─── Props ─────────────────────────────────────────────────────────────

export interface CalculationResultProps {
  result: CalcResult | null;
  loading: boolean;
  error: string | null;
  /** 결과 상단 뱃지 생성을 위한 컨텍스트 */
  context: {
    insuCode: string;
    bohunCode?: string;
    isNight: boolean;
    isHolyDay: boolean;
    isSaturday: boolean;
    isDirectDispensing: boolean;
    isDalbitPharmacy: boolean;
    parsedAge: number;
    isUnder6: boolean;
  };
}

export default function CalculationResult({
  result,
  loading,
  error,
  context,
}: CalculationResultProps) {
  const [showNewFields, setShowNewFields] = useState(true);

  // 오류 표시
  if (error) {
    return (
      <div className="flex items-start gap-2 bg-error-100 border border-error-500/30 rounded-xl p-4 text-sm text-error-500">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div><strong>오류:</strong> {error}</div>
      </div>
    );
  }

  // 초기 빈 상태
  if (!result && !loading) {
    return (
      <Card variant="outlined" className="text-center py-12">
        <Calculator className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary text-sm">
          왼쪽 폼을 작성하고 계산하기를 누르면<br />결과가 여기에 표시됩니다.
        </p>
        <p className="text-text-muted text-xs mt-2">
          시나리오 프리셋을 선택하면 빠르게 테스트할 수 있습니다.
        </p>
      </Card>
    );
  }

  if (!result) return null;

  const {
    insuCode, bohunCode, isNight, isHolyDay, isSaturday,
    isDirectDispensing, isDalbitPharmacy, parsedAge, isUnder6,
  } = context;

  const isVeteran = insuCode.startsWith('G') || !!bohunCode;
  const hasSbrdn =
    result.sumInsuDrug50 !== undefined ||
    result.sumInsuDrug80 !== undefined ||
    result.sumInsuDrug30 !== undefined ||
    result.sumInsuDrug90 !== undefined;

  return (
    <>
      {/* 요약 카드 */}
      <Card variant="standard">
        <h2 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2 flex-wrap">
          계산 결과
          <Badge variant="success">완료</Badge>
          {result.formNumber && <Badge variant="neutral">{result.formNumber}</Badge>}
          {insuCode.startsWith('D') && <Badge variant="warning">의료급여</Badge>}
          {(insuCode.startsWith('G') || bohunCode) && <Badge variant="info">보훈</Badge>}
          {insuCode.startsWith('E') && <Badge variant="neutral">산재</Badge>}
          {insuCode.startsWith('F') && <Badge variant="error">자동차보험</Badge>}
          {isNight      && <Badge variant="info">야간가산</Badge>}
          {isHolyDay    && <Badge variant="warning">공휴가산</Badge>}
          {isSaturday   && <Badge variant="neutral">토요가산</Badge>}
          {isUnder6     && <Badge variant="primary">6세미만(21%)</Badge>}
          {parsedAge >= 65 && <Badge variant="primary">65세이상</Badge>}
          {isDirectDispensing && <Badge variant="primary">직접조제</Badge>}
          {isDalbitPharmacy   && <Badge variant="success">달빛어린이</Badge>}
        </h2>

        <div className="space-y-3">
          <ResultRow label="약품금액 (01항)"       value={result.sumInsuDrug} variant="neutral" />
          <ResultRow label="조제료 (02항)"         value={result.sumWage}     variant="neutral" />
          <div className="border-t border-border-light pt-3">
            <ResultRow label="요양급여비용총액1"   value={result.totalPrice}  variant="primary" bold />
          </div>
          <div className="border-t border-border-light pt-3 space-y-3">
            <ResultRow label="본인일부부담금"      value={result.userPrice}   variant="warning" bold />
            <ResultRow label="청구액 (공단부담)"   value={result.pubPrice}    variant="success" bold />
          </div>

          {result.mpvaPrice !== undefined && result.mpvaPrice > 0 && (
            <div className="border-t border-border-light pt-3">
              <ResultRow label="보훈청 청구액 (mpvaPrice)" value={result.mpvaPrice} variant="info" bold />
            </div>
          )}

          {result.premium !== undefined && result.premium > 0 && (
            <div className="border-t border-border-light pt-3">
              <ResultRow label="자동차보험 할증액 (premium)" value={result.premium} variant="warning" bold />
            </div>
          )}

          {result.overUserPrice !== undefined && result.overUserPrice > 0 && (
            <div className="border-t border-border-light pt-3">
              <ResultRow label="본인부담상한제 초과분" value={result.overUserPrice} variant="info" bold />
            </div>
          )}

          {/* 항등식 */}
          <div className="bg-bg-panel rounded-lg px-3 py-2 text-xs text-text-muted font-mono">
            {result.mpvaPrice && result.mpvaPrice > 0
              ? <>항등식: {formatWon(result.totalPrice)} = {formatWon(result.mpvaPrice)} + {formatWon(result.userPrice)} + {formatWon(result.pubPrice)}{' '}
                  {result.totalPrice === result.mpvaPrice + result.userPrice + result.pubPrice ? '✓' : '✗ (불일치)'}</>
              : <>항등식: {formatWon(result.totalPrice)} = {formatWon(result.userPrice)} + {formatWon(result.pubPrice)}{' '}
                  {result.totalPrice === result.userPrice + result.pubPrice ? '✓' : '✗ (불일치)'}</>
            }
          </div>

          {result.totalPrice2 !== undefined && (
            <div className="border-t border-border-light pt-3">
              <ResultRow label="요양급여비용총액2 (전자청구용)" value={result.totalPrice2} variant="primary" bold />
            </div>
          )}

          {(result.sumUser !== undefined || result.sumInsure !== undefined || result.realPrice !== undefined) && (
            <div className="border-t border-border-light pt-3 space-y-2">
              <p className="text-xs font-semibold text-text-muted">3자배분 최종값</p>
              {result.sumUser    !== undefined && <ResultRow label="최종 환자수납액 (sumUser)"    value={result.sumUser}    variant="warning" />}
              {result.realPrice  !== undefined && <ResultRow label="실수납금 (realPrice)"         value={result.realPrice}  variant="warning" />}
              {result.insuPrice  !== undefined && <ResultRow label="공단부담금 (insuPrice)"       value={result.insuPrice}  variant="success" />}
              {result.sumInsure  !== undefined && <ResultRow label="최종 공단청구액 (sumInsure)"  value={result.sumInsure}  variant="success" />}
            </div>
          )}
        </div>
      </Card>

      {/* 신규 상세 정보 (보훈/선별급여) */}
      {(isVeteran || hasSbrdn) && (
        <Card variant="standard">
          <button
            onClick={() => setShowNewFields((v) => !v)}
            className="w-full flex items-center justify-between text-base font-semibold text-text-primary"
          >
            신규 상세 정보
            {showNewFields
              ? <ChevronUp className="w-4 h-4 text-text-muted" />
              : <ChevronDown className="w-4 h-4 text-text-muted" />}
          </button>

          {showNewFields && (
            <div className="mt-3 space-y-3">
              {isVeteran && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-text-muted">보훈 전용</p>
                  {result.gsCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">공상등구분 (gsCode)</span>
                      <Badge variant="info">{result.gsCode}</Badge>
                    </div>
                  )}
                  {result.mt038 !== undefined && result.mt038 !== '' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">MT038 (출력)</span>
                      <Badge variant="neutral">{result.mt038}</Badge>
                    </div>
                  )}
                  {result.mpvaComm !== undefined && result.mpvaComm > 0 && (
                    <ResultRow label="보훈 비급여 감면분 (mpvaComm)" value={result.mpvaComm} variant="info" />
                  )}
                </div>
              )}

              {hasSbrdn && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-text-muted">선별급여 항별 약품금액</p>
                  {result.sumInsuDrug50 !== undefined && result.sumInsuDrug50 > 0 && (
                    <ResultRow label="A항 선별급여 50%" value={result.sumInsuDrug50} variant="neutral" />
                  )}
                  {result.sumInsuDrug80 !== undefined && result.sumInsuDrug80 > 0 && (
                    <ResultRow label="B항 선별급여 80%" value={result.sumInsuDrug80} variant="neutral" />
                  )}
                  {result.sumInsuDrug30 !== undefined && result.sumInsuDrug30 > 0 && (
                    <ResultRow label="D항 선별급여 30%" value={result.sumInsuDrug30} variant="neutral" />
                  )}
                  {result.sumInsuDrug90 !== undefined && result.sumInsuDrug90 > 0 && (
                    <ResultRow label="E항 선별급여 90%" value={result.sumInsuDrug90} variant="neutral" />
                  )}
                  {result.underUser !== undefined && (
                    <ResultRow label="선별급여 본인부담 합계 (underUser)" value={result.underUser} variant="warning" />
                  )}
                  {result.underInsu !== undefined && (
                    <ResultRow label="선별급여 공단부담 합계 (underInsu)" value={result.underInsu} variant="success" />
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* 100% 본인부담 약품 */}
      {(result.sumInsuDrug100 !== undefined ||
        result.sumInsuDrug100_302 !== undefined ||
        result.totalPrice100 !== undefined ||
        result.userPrice100 !== undefined ||
        result.pub100Price !== undefined ||
        result.incentive !== undefined) && (
        <Card variant="standard">
          <h3 className="text-base font-semibold text-text-primary mb-3">
            100% 본인부담 약품
          </h3>
          <div className="space-y-2">
            {result.sumInsuDrug100 !== undefined && (
              <ResultRow label="100% 본인부담 약품금액 (sumInsuDrug100)" value={result.sumInsuDrug100} variant="neutral" />
            )}
            {result.sumInsuDrug100_302 !== undefined && (
              <ResultRow label="302 공비전환 약품금액 (sumInsuDrug100_302)" value={result.sumInsuDrug100_302} variant="neutral" />
            )}
            {result.totalPrice100 !== undefined && (
              <ResultRow label="100% 급여비용총액 (totalPrice100)" value={result.totalPrice100} variant="primary" />
            )}
            {result.userPrice100 !== undefined && (
              <ResultRow label="100% 본인부담금 (userPrice100)" value={result.userPrice100} variant="warning" bold />
            )}
            {result.pub100Price !== undefined && (
              <ResultRow label="100% 공단부담금 (pub100Price)" value={result.pub100Price} variant="success" />
            )}
            {result.incentive !== undefined && (
              <ResultRow label="인센티브 (incentive)" value={result.incentive} variant="info" />
            )}
          </div>
        </Card>
      )}
    </>
  );
}
