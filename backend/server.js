// backend/server.js
import express from 'express';
import cors from 'cors';
import { MOCK_CARE_DATA_2026 } from './careRatesMock.js';

const app = express();
const PORT = 4000;

// 미들웨어 세팅
app.use(cors());
app.use(express.json());

// 1. [GET] 수가표 및 월 한도액 전체 조회 API (상단 표표시용)
app.get('/api/v1/rates', (req, res) => {
  res.json({
    success: true,
    data: MOCK_CARE_DATA_2026,
  });
});

// 2. [POST] 급여 및 본인부담금 자동 계산 API (하단 계산기 실행용)
app.post('/api/v1/calculate', (req, res) => {
  try {
    const { grade, copayType, serviceType, timeCode, days } = req.body;

    // 입력값 검증
    if (!grade || !copayType || !serviceType || !days) {
      return res.status(400).json({
        success: false,
        message: '필수 입력값이 누락되었습니다.',
      });
    }

    // 1) 월 한도액 조회[cite: 37]
    const monthlyLimit = MOCK_CARE_DATA_2026.monthlyLimits[grade] || 0;

    // 2) 1회/1일 수가 조회[cite: 45, 87]
    let unitPrice = 0;
    if (serviceType === 'VISIT_CARE') {
      unitPrice = MOCK_CARE_DATA_2026.visitCareRates[timeCode] || 0;
    } else if (serviceType === 'FACILITY') {
      unitPrice = (grade === 'GRADE_1') ? MOCK_CARE_DATA_2026.facilityDailyRates.GRADE_1 
                : (grade === 'GRADE_2') ? MOCK_CARE_DATA_2026.facilityDailyRates.GRADE_2 
                : MOCK_CARE_DATA_2026.facilityDailyRates.GRADE_3_TO_5;
    }

    // 3) 총 급여비용 (단가 × 일수/횟수)
    const totalCost = unitPrice * Number(days);

    // 4) 본인부담금 및 공단부담금 계산
    const copayRate = MOCK_CARE_DATA_2026.copayRates[copayType] ?? 0.15;
    const copayAmount = Math.floor(totalCost * copayRate); // 본인 부담금
    const nhisAmount = totalCost - copayAmount;            // 공단 부담금

    // 5) 남은 한도액 및 초과금액 계산
    const remainingLimit = monthlyLimit - totalCost;
    const isOverLimit = remainingLimit < 0;

    return res.json({
      success: true,
      result: {
        applyYear: MOCK_CARE_DATA_2026.applyYear,
        grade,
        serviceType,
        unitPrice,
        days: Number(days),
        monthlyLimit,
        totalCost,
        copayRate: `${copayRate * 100}%`,
        copayAmount,
        nhisAmount,
        remainingLimit: isOverLimit ? 0 : remainingLimit,
        overLimitAmount: isOverLimit ? Math.abs(remainingLimit) : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '계산 중 서버 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Care Calculator Backend Server running on http://localhost:${PORT}`);
});