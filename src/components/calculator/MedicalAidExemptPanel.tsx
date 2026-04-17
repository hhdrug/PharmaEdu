'use client';

/**
 * MedicalAidExemptPanel.tsx
 * 의료급여 1종(D10) 수급권자 면제 8종 체크 패널 — CH05 §12.4.
 *
 * 보험코드 D10 선택 시에만 노출되며, 사용자가 하나라도 체크하면
 * calc-engine(medical-aid.ts Step 0) 이 본인부담금을 0원으로 처리한다.
 *
 * 8종 중 "나이 < 18 세"는 계산기의 age 입력과 중복되므로 '18세 미만 (자동)' 표시로
 * readonly 로 제공. 나머지 7개는 체크박스로 선택.
 */

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// ─── Props ─────────────────────────────────────────────────────────────

export interface MedicalAidExemptState {
  /** 18세 미만 — 나이 자동 판정 (readonly) */
  isUnder18Auto: boolean;
  /** 20세 미만 재학생 */
  isStudent: boolean;
  /** 임산부 */
  isPregnant: boolean;
  /** 가정간호 대상자 */
  isHomeCare: boolean;
  /** 선택의료급여기관 이용자 */
  isSelectMedi: boolean;
  /** 행려/노숙인 */
  isHomeless: boolean;
  /** 결핵·희귀난치·중증질환 */
  isExemptDisease: boolean;
  /** 등록 장애인 */
  isDisabled: boolean;
}

export interface MedicalAidExemptPanelProps {
  state: MedicalAidExemptState;
  onChange: (key: keyof MedicalAidExemptState, value: boolean) => void;
  /** 패널 전체 활성 여부 (D10 아니면 false 권장) */
  active: boolean;
}

// ─── 메인 ──────────────────────────────────────────────────────────────

export default function MedicalAidExemptPanel({
  state,
  onChange,
  active,
}: MedicalAidExemptPanelProps) {
  const anyChecked = useMemo(
    () =>
      state.isUnder18Auto ||
      state.isStudent ||
      state.isPregnant ||
      state.isHomeCare ||
      state.isSelectMedi ||
      state.isHomeless ||
      state.isExemptDisease ||
      state.isDisabled,
    [state],
  );

  if (!active) return null;

  const items: Array<{ key: keyof MedicalAidExemptState; label: string; desc: string }> = [
    { key: 'isStudent',       label: '20세 미만 재학생', desc: '중·고등학교 재학 증명 (2/8)' },
    { key: 'isPregnant',      label: '임산부',          desc: '임신 확인된 수급권자 (3/8)' },
    { key: 'isHomeCare',      label: '가정간호',        desc: '가정간호 대상자 (4/8)' },
    { key: 'isSelectMedi',    label: '선택의료급여기관', desc: '선택기관 이용 (5/8)' },
    { key: 'isHomeless',      label: '행려/노숙인',     desc: '행려·노숙인 (6/8)' },
    { key: 'isExemptDisease', label: '결핵/희귀/중증',  desc: '결핵·희귀난치·중증질환 (7/8)' },
    { key: 'isDisabled',      label: '등록 장애인',     desc: '등록 장애인 (8/8)' },
  ];

  return (
    <Card variant="outlined">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">의료급여 1종 면제 사유 (CH05 §12.4)</p>
          <p className="text-xs text-text-secondary mt-0.5">
            아래 8종 중 하나라도 해당하면 본인부담금이 <strong>0원</strong>으로 면제됩니다.
          </p>
        </div>
        {anyChecked && <Badge variant="success">면제 대상</Badge>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* 18세 미만: 나이 자동 판정 */}
        <label
          className={[
            'flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg border text-xs',
            state.isUnder18Auto
              ? 'border-primary-400 bg-primary-50 text-primary-700'
              : 'border-border-light bg-bg-panel text-text-disabled',
          ].join(' ')}
          title="나이 입력에 따라 자동 판정 (1/8)"
        >
          <input
            type="checkbox"
            checked={state.isUnder18Auto}
            readOnly
            disabled
            className="accent-primary-500"
            aria-label="18세 미만 (자동)"
          />
          <span className="font-medium">18세 미만 (자동)</span>
        </label>

        {items.map(({ key, label, desc }) => (
          <label
            key={key}
            className={[
              'flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg border cursor-pointer transition-colors text-xs',
              state[key]
                ? 'border-primary-400 bg-primary-50 text-primary-700'
                : 'border-border-light bg-bg-surface text-text-secondary hover:bg-bg-panel',
            ].join(' ')}
            title={desc}
          >
            <input
              type="checkbox"
              checked={state[key]}
              onChange={(e) => onChange(key, e.target.checked)}
              className="accent-primary-500"
              aria-label={label}
            />
            <span className="font-medium">{label}</span>
          </label>
        ))}
      </div>
    </Card>
  );
}
