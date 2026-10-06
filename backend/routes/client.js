import express from 'express';
import { MOCK_CARE_DATA_2026 } from '../careRatesMock.js';

const router = express.Router();

// [GET] 수가표 및 월 한도액 조회
router.get('/rates', (req, res) => {
  res.json({
    success: true,
    data: MOCK_CARE_DATA_2026,
  });
});

// [POST] 급여 및 본인부담금 자동 계산
router.post('/calculate', (req, res) => {
  try {
    const { grade, copayType, serviceType, timeCode, days } = req.body;

    if (!grade || !copayType || !serviceType || !days) {
      return res.status(400).json({
        success: false,
        message: '필수 입력값이 누락되었습니다.',
      });
    }

    const monthlyLimit = MOCK_CARE_DATA_2026.monthlyLimits[grade] || 0;

    let unitPrice = 0;
    if (serviceType === 'VISIT_CARE') {
      unitPrice = MOCK_CARE_DATA_2026.visitCareRates[timeCode] || 0;
    } else if (serviceType === 'FACILITY') {
      unitPrice =
        grade === 'GRADE_1'
          ? MOCK_CARE_DATA_2026.facilityDailyRates.GRADE_1
          : grade === 'GRADE_2'
            ? MOCK_CARE_DATA_2026.facilityDailyRates.GRADE_2
            : MOCK_CARE_DATA_2026.facilityDailyRates.GRADE_3_TO_5;
    }

    const totalCost = unitPrice * Number(days);
    const copayRate = MOCK_CARE_DATA_2026.copayRates[copayType] ?? 0.15;
    const copayAmount = Math.floor(totalCost * copayRate);
    const nhisAmount = totalCost - copayAmount;

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

export default router;
