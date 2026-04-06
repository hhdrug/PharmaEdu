-- ============================================================
-- 약제비 계산 교육 플랫폼 — 기준 데이터 테이블
-- ============================================================

-- 1. 수가 단가 마스터 (Z코드별 금액, ~282행/연)
CREATE TABLE suga_fee (
  id          BIGSERIAL PRIMARY KEY,
  apply_year  SMALLINT     NOT NULL,
  code        VARCHAR(12)  NOT NULL,
  name        VARCHAR(60)  NOT NULL,
  price       NUMERIC(10,0) NOT NULL,
  group_cd    VARCHAR(20)  NOT NULL,
  UNIQUE (apply_year, code)
);

COMMENT ON TABLE suga_fee IS 'Z코드 수가 단가 마스터 (U0M121)';

-- 2. 수가 기본 파라미터 (연도당 1행)
CREATE TABLE fee_base_params (
  apply_year         SMALLINT PRIMARY KEY,
  relative_unit      NUMERIC(6,2)  NOT NULL DEFAULT 105.5,
  store_manage_fee   NUMERIC(10,0) NOT NULL,
  dosage_tech_fee    NUMERIC(10,0) NOT NULL,
  drug_guide_fee     NUMERIC(10,0) NOT NULL,
  drug_manage_fee    NUMERIC(10,0) NOT NULL,
  night_inc_rate     NUMERIC(5,1)  NOT NULL DEFAULT 30.0,
  baby_add_tech_cost NUMERIC(10,0) NOT NULL,
  presc_rate         NUMERIC(5,1)  NOT NULL DEFAULT 30.0,
  presc_burden_cost  NUMERIC(10,0) NOT NULL DEFAULT 1000
);

COMMENT ON TABLE fee_base_params IS '조제료 수가 기본 파라미터 (U0M120)';

-- 3. 보험요율
CREATE TABLE insu_rate (
  id                 BIGSERIAL PRIMARY KEY,
  insu_code          VARCHAR(4)   NOT NULL UNIQUE,
  rate               NUMERIC(5,1) NOT NULL,
  six_age_rate       NUMERIC(5,1) NOT NULL DEFAULT 0,
  fix_cost           NUMERIC(10,0) NOT NULL DEFAULT 0,
  mcode              NUMERIC(10,0) NOT NULL DEFAULT 0,
  bcode              NUMERIC(10,0) NOT NULL DEFAULT 0,
  v2520              NUMERIC(5,1) NOT NULL DEFAULT 0,
  v2521              NUMERIC(5,1) NOT NULL DEFAULT 0,
  age65_12000_less   NUMERIC(5,1) NOT NULL DEFAULT 0
);

COMMENT ON TABLE insu_rate IS '보험유형별 요율 테이블';

-- 4. 공휴일
CREATE TABLE holiday (
  id            BIGSERIAL PRIMARY KEY,
  holiday_date  DATE     NOT NULL,
  year          SMALLINT NOT NULL,
  description   VARCHAR(30),
  UNIQUE (holiday_date)
);

COMMENT ON TABLE holiday IS '공휴일 마스터 (U0T130)';

-- 5. 투약일수별 처방조제료
CREATE TABLE presc_dosage_fee (
  id          BIGSERIAL PRIMARY KEY,
  apply_year  SMALLINT     NOT NULL,
  min_days    SMALLINT     NOT NULL,
  max_days    SMALLINT     NOT NULL,
  suga_code   VARCHAR(10)  NOT NULL,
  fee         NUMERIC(10,0) NOT NULL,
  UNIQUE (apply_year, min_days)
);

COMMENT ON TABLE presc_dosage_fee IS '투약일수별 처방조제료';

-- ============================================================
-- RLS (Row Level Security) — 기준 데이터는 공개 읽기 허용
-- ============================================================

ALTER TABLE suga_fee ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_base_params ENABLE ROW LEVEL SECURITY;
ALTER TABLE insu_rate ENABLE ROW LEVEL SECURITY;
ALTER TABLE holiday ENABLE ROW LEVEL SECURITY;
ALTER TABLE presc_dosage_fee ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공개 읽기" ON suga_fee FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON fee_base_params FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON insu_rate FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON holiday FOR SELECT USING (true);
CREATE POLICY "공개 읽기" ON presc_dosage_fee FOR SELECT USING (true);
