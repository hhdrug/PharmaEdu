'use client';

/**
 * /calculator — 조제료 계산기 페이지 (컨테이너)
 * Phase 3에서 4개 전문 컴포넌트로 분해됨:
 *   - DrugTable              (약품 목록 입력)
 *   - ScenarioPanel          (19개 시나리오 프리셋)
 *   - CalculationResult      (계산 결과 요약)
 *   - ResultAnalysisPanel    (단계별 분석 + 관련 레슨 링크)
 *
 * 이 파일은 전역 상태 + 계산 API 호출 + 입력 폼 조립만 담당.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import type { CalcResult, DrugItem } from '@/lib/calc-engine';
import { SCENARIOS, SCENARIO_GROUPS } from '@/components/calculator/scenarios';
import DrugTable, { type DrugRow, defaultDrugRow, nextDrugId } from '@/components/calculator/DrugTable';
import ScenarioPanel from '@/components/calculator/ScenarioPanel';
import CalculationResult from '@/components/calculator/CalculationResult';
import ResultAnalysisPanel from '@/components/calculator/ResultAnalysisPanel';

// ─── 드롭다운 옵션 ─────────────────────────────────────────────────────

const INSU_CODE_OPTIONS = [
  { value: 'C10', label: 'C10 — 건강보험 일반' },
  { value: 'C11', label: 'C11 — 건강보험 (기타)' },
  { value: 'C20', label: 'C20 — 공무원재해보상' },
  { value: 'C21', label: 'C21 — 공상' },
  { value: 'C31', label: 'C31 — 차상위' },
  { value: 'C32', label: 'C32 — 차상위 (기타)' },
  { value: 'C80', label: 'C80 — 건강보험 (기타2)' },
  { value: 'C90', label: 'C90 — 건강보험 (기타3)' },
  { value: 'D10', label: 'D10 — 의료급여 1종' },
  { value: 'D20', label: 'D20 — 의료급여 2종' },
  { value: 'D40', label: 'D40 — 의료급여 4종' },
  { value: 'D80', label: 'D80 — 의료급여 8종 (행려)' },
  { value: 'D90', label: 'D90 — 의료급여 기타' },
  { value: 'G10', label: 'G10 — 보훈 (직접)' },
  { value: 'G20', label: 'G20 — 보훈 (위탁)' },
  { value: 'F10', label: 'F10 — 자동차보험' },
  { value: 'E10', label: 'E10 — 산재 요양급여' },
  { value: 'E20', label: 'E20 — 산재 후유증' },
];

const BOHUN_CODE_OPTIONS = [
  { value: '',    label: '(없음)' },
  { value: 'M10', label: 'M10 — 전액면제' },
  { value: 'M20', label: 'M20 — 일부면제' },
  { value: 'M30', label: 'M30 — 30% 감면' },
  { value: 'M50', label: 'M50 — 50% 감면' },
  { value: 'M60', label: 'M60 — 60% 감면' },
  { value: 'M61', label: 'M61 — 60% 감면 (기타)' },
  { value: 'M81', label: 'M81 — 보훈특례A' },
  { value: 'M82', label: 'M82 — 보훈특례B' },
  { value: 'M83', label: 'M83 — 보훈특례C' },
  { value: 'M90', label: 'M90 — 보훈 기타' },
];

const SBRDN_TYPE_OPTIONS = [
  { value: '',     label: '(없음/기본)' },
  { value: 'B001', label: 'B001' },
  { value: 'B014', label: 'B014 — 희귀질환 30%' },
  { value: 'B030', label: 'B030' },
  { value: 'V103', label: 'V103 — 결핵 면제' },
];

const GENDER_OPTIONS = [
  { value: '',  label: '무관' },
  { value: 'M', label: '남(M)' },
  { value: 'F', label: '여(F)' },
];

const MT038_OPTIONS = [
  { value: '',  label: '(해당 없음)' },
  { value: '2', label: '2 — 국비환자 타질환 조제분' },
  { value: 'A', label: 'A — 60% 감면 (도서벽지 내 약국)' },
];

const NPAY_ROUND_OPTIONS = [
  { value: '',          label: '(기본값)' },
  { value: 'None',      label: 'None — 반올림 없음' },
  { value: 'Floor10',   label: 'Floor10 — 10원 절사' },
  { value: 'Floor100',  label: 'Floor100 — 100원 절사' },
  { value: 'Round10',   label: 'Round10 — 10원 반올림' },
  { value: 'Round100',  label: 'Round100 — 100원 반올림' },
  { value: 'Ceil100',   label: 'Ceil100 — 100원 올림' },
];

const SPECIAL_PUB_OPTIONS = [
  { value: '',    label: '(해당 없음)' },
  { value: '302', label: '302 — 100% 본인부담약품 공비 전환' },
  { value: '101', label: '101 — 특수공비 분리 A' },
  { value: '102', label: '102 — 특수공비 분리 B' },
];

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────

export default function CalculatorPage() {
  const toast = useToast();

  // ── 기본 입력 ──
  const [dosDate, setDosDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [insuCode, setInsuCode] = useState('C10');
  const [bohunCode, setBohunCode] = useState('');
  const [sbrdnType, setSbrdnType] = useState('');
  const [age, setAge] = useState('40');
  const [gender, setGender] = useState('');
  const [mediIllness, setMediIllness] = useState('');
  const [mediIllnessB, setMediIllnessB] = useState('');
  const [drugs, setDrugs] = useState<DrugRow[]>([defaultDrugRow()]);

  // ── 가산 체크박스 ──
  const [isNight, setIsNight] = useState(false);
  const [isHolyDay, setIsHolyDay] = useState(false);
  const [isSaturday, setIsSaturday] = useState(false);
  const [isMidNight, setIsMidNight] = useState(false);
  const [isDirectDispensing, setIsDirectDispensing] = useState(false);
  const [isNonFace, setIsNonFace] = useState(false);
  const [hasCounseling, setHasCounseling] = useState(false);
  const [isDalbitPharmacy, setIsDalbitPharmacy] = useState(false);

  // ── 고급 옵션 ──
  const [selfInjYN, setSelfInjYN] = useState('');
  const [mt038, setMt038] = useState('');
  const [nPayRoundType, setNPayRoundType] = useState('');
  const [specialPub, setSpecialPub] = useState('');
  const [isChadungExempt, setIsChadungExempt] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── 결과 ──
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── 시나리오 탭 + 선택 상태 ──
  const [activeGroup, setActiveGroup] = useState(0);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | undefined>(undefined);

  // ── 파생값 ──
  const isBohunInsu = useMemo(
    () => insuCode.startsWith('G') || insuCode.startsWith('C'),
    [insuCode]
  );
  const parsedAge = parseInt(age, 10) || 0;
  const isUnder6 = parsedAge >= 0 && parsedAge < 6;

  // ── 약품 행 조작 ──
  const addDrugRow = useCallback(() => {
    setDrugs((prev) => [...prev, defaultDrugRow()]);
  }, []);

  const removeDrugRow = useCallback((id: number) => {
    setDrugs((prev) => (prev.length <= 1 ? prev : prev.filter((d) => d.id !== id)));
  }, []);

  const updateDrug = useCallback((id: number, field: keyof DrugRow, value: string) => {
    setDrugs((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  }, []);

  // ── 시나리오 프리셋 적용 ──
  const applyScenario = useCallback((id: string) => {
    const sc = SCENARIOS.find((s) => s.id === id);
    if (!sc) return;

    setSelectedScenarioId(id);
    setInsuCode(sc.insuCode);
    setBohunCode(sc.bohunCode ?? '');
    setAge(sc.age);
    setSbrdnType(sc.sbrdnType ?? '');
    setIsNight(sc.isNight);
    setIsSaturday(sc.isSaturday);
    setIsHolyDay(sc.isHolyDay);
    setIsMidNight(sc.isMidNight);
    setIsDirectDispensing(sc.isDirectDispensing);
    setIsDalbitPharmacy(sc.isDalbitPharmacy);
    setHasCounseling(false);
    setIsNonFace(false);
    setMediIllness('');
    setMediIllnessB('');
    setGender('');
    setSelfInjYN('');
    setMt038('');
    setNPayRoundType('');
    setSpecialPub('');
    setIsChadungExempt(false);

    setDrugs(
      sc.drugs.map((d) => ({
        id: nextDrugId(),
        code: d.code,
        price: String(d.price),
        dose: String(d.dose),
        dNum: String(d.dNum),
        dDay: String(d.dDay),
        insuPay: d.insuPay,
        take: d.take,
        isPowder: d.isPowder ?? '',
      }))
    );

    setResult(null);
    setError(null);
  }, []);

  // ── 계산 실행 ──
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
          isPowder: d.isPowder || undefined,
          insuDrug: d.insuPay === 'covered',
        }));

      if (drugList.length === 0) {
        setError('약품을 1개 이상 입력해주세요.');
        setLoading(false);
        return;
      }

      const body: Record<string, unknown> = {
        dosDate: dosDate.replace(/-/g, ''),
        insuCode,
        age: parsedAge,
        sex: gender || undefined,
        drugList,
        isNight: isNight || undefined,
        isHolyDay: isHolyDay || undefined,
        isSaturday: isSaturday || undefined,
        isMidNight: isMidNight || undefined,
        isDirectDispensing: isDirectDispensing || undefined,
        isNonFace: isNonFace || undefined,
        hasCounseling: hasCounseling || undefined,
        isDalbitPharmacy: isDalbitPharmacy || undefined,
        bohunCode: bohunCode || undefined,
        sbrdnType: sbrdnType || undefined,
        mediIllness: mediIllness || undefined,
        mediIllnessB: mediIllnessB || undefined,
        selfInjYN: selfInjYN || undefined,
        mt038: mt038 || undefined,
        nPayRoundType: nPayRoundType || undefined,
        specialPub: specialPub || undefined,
        isChadungExempt: isChadungExempt || undefined,
      };

      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as CalcResult & { error?: string };

      if (!res.ok || data.error) {
        const msg = data.error ?? '계산 중 오류가 발생했습니다.';
        setError(msg);
        toast.show({ variant: 'error', message: msg });
      } else {
        setResult(data);
        toast.show({
          variant: 'success',
          message: `계산 완료 — 총액1 ${data.totalPrice.toLocaleString()}원`,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : '네트워크 오류';
      setError(msg);
      toast.show({ variant: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [
    drugs, dosDate, insuCode, bohunCode, sbrdnType, parsedAge, gender,
    isNight, isHolyDay, isSaturday, isMidNight,
    isDirectDispensing, isNonFace, hasCounseling, isDalbitPharmacy,
    mediIllness, mediIllnessB,
    selfInjYN, mt038, nPayRoundType, specialPub, isChadungExempt,
    toast,
  ]);

  // ── URL query ?scenario=S01 자동 적용 (Phase 4C) ──
  const searchParams = useSearchParams();
  useEffect(() => {
    const scParam = searchParams.get('scenario');
    if (scParam && SCENARIOS.some((s) => s.id === scParam)) {
      // 이미 같은 시나리오가 선택되어 있으면 재적용 스킵
      if (selectedScenarioId !== scParam) {
        applyScenario(scParam);
        // 해당 시나리오가 속한 그룹 탭도 전환
        const gi = SCENARIO_GROUPS.findIndex((g) => g.ids.includes(scParam));
        if (gi >= 0) setActiveGroup(gi);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── 결과 패널 컨텍스트 ──
  const resultContext = useMemo(() => ({
    insuCode, bohunCode, isNight, isHolyDay, isSaturday,
    isDirectDispensing, isDalbitPharmacy, parsedAge, isUnder6,
  }), [
    insuCode, bohunCode, isNight, isHolyDay, isSaturday,
    isDirectDispensing, isDalbitPharmacy, parsedAge, isUnder6,
  ]);

  return (
    <div className="min-h-screen bg-bg-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

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
          <div className="mt-2 ml-13 flex flex-wrap gap-1.5">
            <Badge variant="info">C/D/G/E/F 전 보험코드</Badge>
            <Badge variant="neutral">19개 시나리오 프리셋</Badge>
            <Badge variant="primary">단계별 분석 + 관련 레슨 링크</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ────────────── 입력 패널 ────────────── */}
          <div className="space-y-5">

            {/* 시나리오 프리셋 */}
            <ScenarioPanel
              activeGroup={activeGroup}
              onGroupChange={setActiveGroup}
              onApply={applyScenario}
              selectedScenarioId={selectedScenarioId}
            />

            {/* 처방 기본 정보 */}
            <Card variant="standard">
              <h2 className="text-base font-semibold text-text-primary mb-4">처방 기본 정보</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Select
                  label="보훈코드"
                  value={bohunCode}
                  onChange={(e) => setBohunCode(e.target.value)}
                  options={BOHUN_CODE_OPTIONS}
                  disabled={!isBohunInsu}
                  helperText={isBohunInsu ? undefined : 'G계열/C계열 보험코드에서 활성'}
                />
                <Select
                  label="수급권자유형 (sbrdnType)"
                  value={sbrdnType}
                  onChange={(e) => setSbrdnType(e.target.value)}
                  options={SBRDN_TYPE_OPTIONS}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  label="환자 나이 (세)"
                  type="number"
                  min="0"
                  max="150"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="예: 40"
                />
                <Select
                  label="성별"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  options={GENDER_OPTIONS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input
                  label="질병코드 (mediIllness)"
                  value={mediIllness}
                  onChange={(e) => setMediIllness(e.target.value)}
                  placeholder="예: V252"
                  helperText="산정특례 등록코드"
                />
                <Input
                  label="2차 질병코드 (mediIllnessB)"
                  value={mediIllnessB}
                  onChange={(e) => setMediIllnessB(e.target.value)}
                  placeholder="예: F008"
                  helperText="코로나 등 B코드"
                />
              </div>

              {/* 가산 체크박스 */}
              <div className="pt-4 border-t border-border-light">
                <p className="text-xs font-semibold text-text-muted mb-3">시간/특수 가산</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'isNight',    label: '야간',    desc: '평일 18시~, 토요 13시~',   value: isNight,    setter: setIsNight },
                    { id: 'isHolyDay', label: '공휴일', desc: '법정 공휴일',               value: isHolyDay,  setter: setIsHolyDay },
                    { id: 'isSaturday',label: '토요',    desc: '토요일 09~13시 별도 행',   value: isSaturday, setter: setIsSaturday },
                    { id: 'isMidNight',label: '심야',    desc: '0시~6시 (6세미만 전용)',   value: isMidNight, setter: setIsMidNight },
                  ].map(({ id, label, desc, value, setter }) => (
                    <CheckChip key={id} id={id} label={label} description={desc} checked={value} onChange={setter} />
                  ))}
                </div>

                <p className="text-xs font-semibold text-text-muted mt-3 mb-2">조제 방식</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label
                    className={[
                      'flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg border text-xs',
                      isUnder6
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-border-light bg-bg-panel text-text-disabled',
                    ].join(' ')}
                    title="나이 입력 시 자동 적용됨"
                  >
                    <input
                      type="checkbox"
                      checked={isUnder6}
                      readOnly
                      disabled
                      className="accent-primary-500"
                      aria-label="6세 미만 (자동)"
                    />
                    <span className="font-medium">6세미만 (자동)</span>
                  </label>

                  {[
                    { id: 'isDirectDispensing', label: '직접조제',    desc: 'Z4200/Z4201 사용',    value: isDirectDispensing, setter: setIsDirectDispensing },
                    { id: 'isNonFace',          label: '비대면',      desc: '비대면 조제',          value: isNonFace,          setter: setIsNonFace },
                    { id: 'hasCounseling',      label: '복약상담료',  desc: 'Z7001 추가',          value: hasCounseling,      setter: setHasCounseling },
                    { id: 'isDalbitPharmacy',   label: '달빛어린이',  desc: '달빛어린이 약국',     value: isDalbitPharmacy,   setter: setIsDalbitPharmacy },
                  ].map(({ id, label, desc, value, setter }) => (
                    <CheckChip key={id} id={id} label={label} description={desc} checked={value} onChange={setter} />
                  ))}
                </div>

                {(isNight || isHolyDay || isSaturday || isMidNight || isDirectDispensing
                  || isDalbitPharmacy || isNonFace || hasCounseling || isUnder6) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {isNight          && <Badge variant="info">야간가산</Badge>}
                    {isHolyDay        && <Badge variant="warning">공휴가산</Badge>}
                    {isSaturday       && <Badge variant="neutral">토요가산</Badge>}
                    {isMidNight       && <Badge variant="info">심야가산</Badge>}
                    {isUnder6         && <Badge variant="primary">6세미만(21%)</Badge>}
                    {isDirectDispensing && <Badge variant="primary">직접조제</Badge>}
                    {isDalbitPharmacy && <Badge variant="success">달빛어린이</Badge>}
                    {isNonFace        && <Badge variant="neutral">비대면</Badge>}
                    {hasCounseling    && <Badge variant="neutral">복약상담료</Badge>}
                  </div>
                )}
              </div>
            </Card>

            {/* 약품 목록 + 계산 실행 버튼 */}
            <DrugTable
              drugs={drugs}
              onAddRow={addDrugRow}
              onRemoveRow={removeDrugRow}
              onUpdateCell={updateDrug}
              onCalculate={handleCalculate}
              loading={loading}
            />

            {/* 고급 옵션 */}
            <Card variant="outlined">
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="w-full flex items-center justify-between text-sm font-semibold text-text-secondary"
                aria-expanded={showAdvanced}
              >
                <span>고급 옵션 (Phase A+B+C 신규 기능)</span>
                {showAdvanced
                  ? <ChevronUp className="w-4 h-4 text-text-muted" />
                  : <ChevronDown className="w-4 h-4 text-text-muted" />}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  <p className="text-xs text-text-muted">
                    기본 사용자는 무시해도 됩니다. calc-engine의 세부 동작을 제어합니다.
                  </p>

                  <div className="flex items-center justify-between py-2 border-b border-border-light">
                    <div>
                      <p className="text-sm font-medium text-text-primary">자가투여주사제 (selfInjYN)</p>
                      <p className="text-xs text-text-muted">Z4130 수가 활성화 — 자가주사제 처방 시</p>
                    </div>
                    <CheckChip id="selfInjYN" label="Y" description="자가투여주사제 여부"
                      checked={selfInjYN === 'Y'} onChange={(v) => setSelfInjYN(v ? 'Y' : '')} />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-border-light">
                    <div>
                      <p className="text-sm font-medium text-text-primary">차등수가 면제 (isChadungExempt)</p>
                      <p className="text-xs text-text-muted">영업시간 기반 차등수가 면제 여부 (C계열 건강보험)</p>
                    </div>
                    <CheckChip id="isChadungExempt" label="면제" description="차등수가 면제 여부"
                      checked={isChadungExempt} onChange={setIsChadungExempt} />
                  </div>

                  <Select
                    label="보훈 MT038 특정내역 (G20 위탁 전용)"
                    value={mt038}
                    onChange={(e) => setMt038(e.target.value)}
                    options={MT038_OPTIONS}
                    disabled={insuCode !== 'G20'}
                    helperText={insuCode === 'G20' ? undefined : 'G20 (보훈 위탁) 보험코드에서만 활성'}
                  />

                  <Select
                    label="비급여 반올림 유형 (nPayRoundType)"
                    value={nPayRoundType}
                    onChange={(e) => setNPayRoundType(e.target.value)}
                    options={NPAY_ROUND_OPTIONS}
                  />

                  <Select
                    label="특수공비 (specialPub)"
                    value={specialPub}
                    onChange={(e) => setSpecialPub(e.target.value)}
                    options={SPECIAL_PUB_OPTIONS}
                  />
                </div>
              )}
            </Card>
          </div>

          {/* ────────────── 결과 패널 ────────────── */}
          <div className="space-y-5">
            <CalculationResult
              result={result}
              loading={loading}
              error={error}
              context={resultContext}
            />
            {result && <ResultAnalysisPanel result={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 서브 컴포넌트: 체크 칩 ───────────────────────────────────────────────

interface CheckChipProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function CheckChip({ id, label, description, checked, onChange }: CheckChipProps) {
  return (
    <label
      className={[
        'flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg border cursor-pointer transition-colors text-xs',
        checked
          ? 'border-primary-400 bg-primary-50 text-primary-700'
          : 'border-border-light bg-bg-surface text-text-secondary hover:bg-bg-panel',
      ].join(' ')}
      title={description}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary-500"
        aria-label={label}
      />
      <span className="font-medium">{label}</span>
    </label>
  );
}
