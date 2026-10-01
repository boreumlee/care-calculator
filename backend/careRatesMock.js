// backend/careRatesMock.js

export const MOCK_CARE_DATA_2026 = {
  applyYear: 2026,
  
  // 1. 재가급여 월 한도액 (제13조 기준)
  monthlyLimits: {
    GRADE_1: 2512900,
    GRADE_2: 2331200,
    GRADE_3: 1528200,
    GRADE_4: 1409700,
    GRADE_5: 1208900,
    COGNITIVE: 676320,
  },

  // 2. 방문요양 1회 이용시간별 수가 (제18조 기준)[cite: 45]
  visitCareRates: {
    MIN_30: 17450,
    MIN_60: 25320,
    MIN_90: 34120,
    MIN_120: 43430,
    MIN_150: 50640,
    MIN_180: 57020,
    MIN_210: 63530,
    MIN_240: 70080,
  },

  // 3. 노인요양시설(요양원) 1일 수가 (제44조 기준 - 요양보호사 2.1:1 배치)[cite: 87]
  facilityDailyRates: {
    GRADE_1: 93070,
    GRADE_2: 86340,
    GRADE_3_TO_5: 81540,
  },
  
  // 4. 본인부담율 (%)
  copayRates: {
    GENERAL: 0.15,      // 일반 (15%)
    REDUCED_9: 0.09,     // 경감 대상자 (9%)
    REDUCED_6: 0.06,     // 경감 대상자 (6%)
    BASIC_LIVING: 0.0,  // 기초생활수급자 (0%)
  }
};