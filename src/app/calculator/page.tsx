'use client';

/**
 * /calculator — 조제료 계산기 페이지
 * Phase B: Calculator UI
 */

import { useState, useCallback } from 'react';
import { Plus, Trash2, Calculator, ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import type { CalcResult, DrugItem } from '@/lib/calc-engine';

// ─── 타입 ──────────────────────────────────────────────────────────────────

interface DrugRow {
  id: number;
  code: string;
  price: string;
  dose: string;
  dNum: string;
  dDay: string;
  insuPay: string;
  take: string;
}

// ─── 상수 ──────────────────────────────────────────────────────────────────

const INSU_PAY_OPTIONS = [
  { value: 'covered', label: '급여' },
  { value: 'nonCovered', label: '비급여' },
  { value: 'fullSelf', label: '100%본인' },
  { value: 'partial50', label: '선별50%' },
  { value: 'partial80', label: '선별80%' },
];

const TAKE_OPTIONS = [
  { value: 'internal', label: '내복' },
  { value: 'external', label: '외용' },
  { value: 'injection', label: '주사' },
];

const INSU_CODE_OPTIONS = [
  { value: 'C10', label: 'C10 — 건강보험 일반' },
  { value: 'C21', label: 'C21 — 공상' },
  { value: 'C31', label: 'C31 — 차상위' },
];

// ─── 프리셋 ────────────────────────────────────────────────────────────────

interface Preset {
  label: string;
  description: string;
  age: string;
  insuCode: string;
  drugs: Omit<DrugRow, 'id'>[];
}

const PRESETS: Preset[] = [
  {
    label: '3일 내복약 샘플',
    description: 'C10, 40세, 내복약 1종, 3일',
    age: '40',
    insuCode: 'C10',
    drugs: [
      { code: 'sample001', price: '500', dose: '1', dNum: '3', dDay: '3', insuPay: 'covered', take: 'internal' },
    ],
  },
  {
    label: 'S01 검증 시나리오',
    description: 'C10, 40세, 내복약 1종, 7일 (약품금액 10,500 / 조제료 8,660 / 총액 19,160 / 본인부담 5,700)',
    age: '40',
    insuCode: 'C10',
    drugs: [
      { code: 'S01drug', price: '500', dose: '1', dNum: '3', dDay: '7', insuPay: 'covered', take: 'internal' },
    ],
  },
  {
    label: '65세 정액 시나리오',
    description: 'C10, 70세, 내복약 1종, 7일 (총액 <= 10,000 → 본인부담 1,000원)',
    age: '70',
    insuCode: 'C10',
    drugs: [
      { code: 'E65drug', price: '100', dose: '1', dNum: '2', dDay: '7', insuPay: 'covered', take: 'internal' },
    ],
  },
  {
    label: '6세미만 소아',
    description: 'C10, 4세, 내복약 1종, 5일 (본인부담율 21%)',
    age: '4',
    insuCode: 'C10',
    drugs: [
      { code: 'childDrug', price: '300', dose: '1', dNum: '3', dDay: '5', insuPay: 'covered', take: 'internal' },
    ],
  },
];

// ─── 유틸 ──────────────────────────────────────────────────────────────────

function formatWon(n: number): string {
  return n.toLocaleString('ko-KR') + '원';
}

let _idSeq = 0;
function nextId() {
  return ++_idSeq;
}

function defaultDrugRow(): DrugRow {
  return {
    id: nextId(),
    code: '',
    price: '',
    dose: '1',
    dNum: '3',
    dDay: '7',
    insuPay: 'covered',
    take: 'internal',
  };
}

// ─── 컴포넌트 ──────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  // 폼 상태
  const [dosDate, setDosDate] = useState(
    () => new Date().toISOString().substring(0, 10)
  );
  const [insuCode, setInsuCode] = useState('C10');
  const [age, setAge] = useState('40');
  const [drugs, setDrugs] = useState<DrugRow[]>([defaultDrugRow()]);

  // 결과 상태
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(true);

  // ── 약품 행 조작 ──────────────────────────────────────────────────────────

  const addDrugRow = useCallback(() => {
    setDrugs((prev) => [...prev, defaultDrugRow()]);
  }, []);

  const removeDrugRow = useCallback((id: number) => {
    setDrugs((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((d) => d.id !== id);
    });
  }, []);

  const updateDrug = useCallback((id: number, field: keyof DrugRow, value: string) => {
    setDrugs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  }, []);

  // ── 프리셋 적용 ───────────────────────────────────────────────────────────

  const applyPreset = useCallback((preset: Preset) => {
    setAge(preset.age);
    setInsuCode(preset.insuCode);
    setDrugs(preset.drugs.map((d) => ({ ...d, id: nextId() })));
    setResult(null);
    setError(null);
  }, []);

  // ── 계산 실행 ─────────────────────────────────────────────────────────────

  const handleCalculate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const drugList: DrugItem[] = drugs
        .filter((d) => d.price !== '' && parseFloat(d.price) >= 0)
        .map((d) => ({
          code: d.code || 'unknown',
          insuPay: d.insuPay as DrugItem['insuPay'],
          take: d.take as DrugItem['take'],
          price: parseFloat(d.price) || 0,
          dose: parseFloat(d.dose) || 1,
          dNum: parseFloat(d.dNum) || 1,
          dDay: parseFloat(d.dDay) || 1,
          pack: 0,
        }));

      if (drugList.length === 0) {
        setError('약품을 1개 이상 입력해주세요.');
        setLoading(false);
        return;
      }

      const doseDateFormatted = dosDate.replace(/-/g, '');

      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dosDate: doseDateFormatted,
          insuCode,
          age: parseInt(age, 10) || 0,
          drugList,
        }),
      });

      const data = (await res.json()) as CalcResult & { error?: string };

      if (!res.ok || data.error) {
        setError(data.error ?? '계산 중 오류가 발생했습니다.');
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '네트워크 오류');
    } finally {
      setLoading(false);
    }
  }, [drugs, dosDate, insuCode, age]);

  // ── 렌더링 ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary-500" aria-hidden="true" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              조제료 계산기
            </h1>
          </div>
          <p className="text-text-secondary text-sm ml-13">
            처방전 정보를 입력하면 약품금액·조제료·본인부담금을 단계별로 계산합니다.
          </p>
          <div className="mt-2 ml-13">
            <Badge variant="info">MVP: C10 건강보험 처방조제 기본형</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ── 입력 패널 ── */}
          <div className="space-y-5">

            {/* 프리셋 버튼 */}
            <Card variant="outlined">
              <p className="text-xs font-medium text-text-muted mb-3 uppercase tracking-wide">
                빠른 테스트 프리셋
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p)}
                    className="text-left px-3 py-2.5 rounded-lg border border-border-light bg-bg-surface hover:bg-primary-50 hover:border-primary-300 transition-colors text-xs"
                    title={p.description}
                  >
                    <span className="flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                      <span className="font-medium text-text-primary line-clamp-1">{p.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* 처방 기본 정보 */}
            <Card variant="standard">
              <h2 className="text-base font-semibold text-text-primary mb-4">처방 기본 정보</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="조제일자"
                  type="date"
                  value={dosDate}
                  onChange={(e) => setDosDate(e.target.value)}
                />
                <Select
                  label="보험코드"
                  value={insuCode}
                  onChange={(e) => setInsuCode(e.target.value)}
                  options={INSU_CODE_OPTIONS}
                />
                <Input
                  label="환자 나이 (세)"
                  type="number"
                  min="0"
                  max="150"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="예: 40"
                  className="col-span-2 sm:col-span-1"
                />
              </div>
            </Card>

            {/* 약품 입력 */}
            <Card variant="standard">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-text-primary">약품 목록</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addDrugRow}
                  aria-label="약품 행 추가"
                >
                  <Plus className="w-4 h-4" />
                  추가
                </Button>
              </div>

              <div className="space-y-4">
                {drugs.map((drug, idx) => (
                  <div
                    key={drug.id}
                    className="p-3 rounded-lg bg-bg-panel border border-border-light"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-text-muted">
                        약품 {idx + 1}
                      </span>
                      {drugs.length > 1 && (
                        <button
                          onClick={() => removeDrugRow(drug.id)}
                          aria-label={`약품 ${idx + 1} 삭제`}
                          className="text-text-muted hover:text-error-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* 1행: 코드 + 단가 */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input
                        label="약품코드"
                        value={drug.code}
                        onChange={(e) => updateDrug(drug.id, 'code', e.target.value)}
                        placeholder="선택사항"
                      />
                      <Input
                        label="단가 (원)"
                        type="number"
                        min="0"
                        value={drug.price}
                        onChange={(e) => updateDrug(drug.id, 'price', e.target.value)}
                        placeholder="예: 500"
                        required
                      />
                    </div>

                    {/* 2행: 1회투약량 + 1일횟수 + 총일수 */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <Input
                        label="1회투약량"
                        type="number"
                        min="0"
                        step="0.5"
                        value={drug.dose}
                        onChange={(e) => updateDrug(drug.id, 'dose', e.target.value)}
                      />
                      <Input
                        label="1일투여횟수"
                        type="number"
                        min="1"
                        value={drug.dNum}
                        onChange={(e) => updateDrug(drug.id, 'dNum', e.target.value)}
                      />
                      <Input
                        label="총투여일수"
                        type="number"
                        min="1"
                        value={drug.dDay}
                        onChange={(e) => updateDrug(drug.id, 'dDay', e.target.value)}
                      />
                    </div>

                    {/* 3행: 급여구분 + 복용구분 */}
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        label="급여구분"
                        value={drug.insuPay}
                        onChange={(e) => updateDrug(drug.id, 'insuPay', e.target.value)}
                        options={INSU_PAY_OPTIONS}
                      />
                      <Select
                        label="복용구분"
                        value={drug.take}
                        onChange={(e) => updateDrug(drug.id, 'take', e.target.value)}
                        options={TAKE_OPTIONS}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCalculate}
                  loading={loading}
                  className="w-full"
                >
                  <Calculator className="w-5 h-5" />
                  계산하기
                </Button>
              </div>
            </Card>
          </div>

          {/* ── 결과 패널 ── */}
          <div className="space-y-5">
            {/* 오류 */}
            {error && (
              <div className="bg-error-100 border border-error-500/30 rounded-xl p-4 text-sm text-error-500">
                <strong>오류:</strong> {error}
              </div>
            )}

            {/* 결과 없음 (초기 상태) */}
            {!result && !error && !loading && (
              <Card variant="outlined" className="text-center py-12">
                <Calculator className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted text-sm">
                  왼쪽 폼을 작성하고 계산하기를 누르면<br />
                  결과가 여기에 표시됩니다.
                </p>
              </Card>
            )}

            {/* 계산 결과 */}
            {result && (
              <>
                {/* 요약 카드 */}
                <Card variant="standard">
                  <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
                    계산 결과
                    <Badge variant="success">완료</Badge>
                  </h2>

                  <div className="space-y-3">
                    <ResultRow
                      label="약품금액 (01항)"
                      value={result.sumInsuDrug}
                      variant="neutral"
                    />
                    <ResultRow
                      label="조제료 (02항)"
                      value={result.sumWage}
                      variant="neutral"
                    />
                    <div className="border-t border-border-light pt-3">
                      <ResultRow
                        label="요양급여비용총액1"
                        value={result.totalPrice}
                        variant="primary"
                        bold
                      />
                    </div>
                    <div className="border-t border-border-light pt-3 space-y-3">
                      <ResultRow
                        label="본인일부부담금"
                        value={result.userPrice}
                        variant="warning"
                        bold
                      />
                      <ResultRow
                        label="청구액 (공단부담)"
                        value={result.pubPrice}
                        variant="success"
                        bold
                      />
                    </div>
                    {/* 항등식 확인 */}
                    <div className="bg-bg-panel rounded-lg px-3 py-2 text-xs text-text-muted">
                      항등식: {formatWon(result.totalPrice)} = {formatWon(result.userPrice)} + {formatWon(result.pubPrice)}{' '}
                      {result.totalPrice === result.userPrice + result.pubPrice ? '✓' : '✗'}
                    </div>
                  </div>
                </Card>

                {/* 조제료 세부내역 */}
                {result.wageList.length > 0 && (
                  <Card variant="standard">
                    <h2 className="text-base font-semibold text-text-primary mb-4">
                      조제료 수가 내역
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border-light text-left text-text-muted">
                            <th className="py-2 font-medium">Z코드</th>
                            <th className="py-2 font-medium">수가명</th>
                            <th className="py-2 text-right font-medium">단가</th>
                            <th className="py-2 text-right font-medium">금액</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.wageList.map((w, i) => (
                            <tr key={i} className="border-b border-border-light">
                              <td className="py-2 font-mono text-xs text-primary-600">{w.sugaCd}</td>
                              <td className="py-2 text-text-secondary text-xs">{w.name}</td>
                              <td className="py-2 text-right font-mono text-xs">{w.price.toLocaleString()}</td>
                              <td className="py-2 text-right font-mono text-xs font-medium">{w.sum.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="py-2 text-right text-xs font-semibold text-text-primary">
                              합계
                            </td>
                            <td className="py-2 text-right font-mono text-sm font-bold text-primary-600">
                              {result.sumWage.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </Card>
                )}

                {/* 단계별 계산 과정 (교육 모드) */}
                {result.steps.length > 0 && (
                  <Card variant="standard">
                    <button
                      onClick={() => setShowSteps((v) => !v)}
                      className="w-full flex items-center justify-between text-base font-semibold text-text-primary mb-0"
                    >
                      단계별 계산 과정
                      {showSteps ? (
                        <ChevronUp className="w-4 h-4 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                      )}
                    </button>

                    {showSteps && (
                      <div className="mt-4 space-y-3">
                        {result.steps.map((step, i) => (
                          <div
                            key={i}
                            className="bg-bg-panel rounded-lg p-3 border border-border-light"
                          >
                            <p className="text-xs font-medium text-text-primary mb-1">
                              Step {i + 1}: {step.title}
                            </p>
                            <p className="text-xs text-text-muted font-mono mb-1.5">
                              = {step.formula}
                            </p>
                            <p className="text-sm font-bold text-primary-600">
                              {step.result.toLocaleString()}
                              {step.unit}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 결과 행 컴포넌트 ──────────────────────────────────────────────────────

interface ResultRowProps {
  label: string;
  value: number;
  variant: 'neutral' | 'primary' | 'warning' | 'success';
  bold?: boolean;
}

function ResultRow({ label, value, variant, bold = false }: ResultRowProps) {
  const colorMap: Record<string, string> = {
    neutral: 'text-text-primary',
    primary: 'text-primary-600',
    warning: 'text-warning-500',
    success: 'text-success-500',
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
