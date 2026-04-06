/** 수가 단가 마스터 (Z코드별 금액) */
export interface SugaFee {
  id: number;
  apply_year: number;
  code: string;
  name: string;
  price: number;
  group_cd: string;
}

/** 수가 기본 파라미터 (연도별 정책값) */
export interface FeeBaseParams {
  apply_year: number;
  relative_unit: number;
  store_manage_fee: number;
  dosage_tech_fee: number;
  drug_guide_fee: number;
  drug_manage_fee: number;
  night_inc_rate: number;
  baby_add_tech_cost: number;
  presc_rate: number;
  presc_burden_cost: number;
}

/** 보험요율 */
export interface InsuRate {
  id: number;
  insu_code: string;
  rate: number;
  six_age_rate: number;
  fix_cost: number;
  mcode: number;
  bcode: number;
  v2520: number;
  v2521: number;
  age65_12000_less: number;
}

/** 공휴일 */
export interface Holiday {
  id: number;
  holiday_date: string;
  year: number;
  description: string;
}
