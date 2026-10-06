import express from 'express';

const router = express.Router();

// [POST] 원장님용 인건비 비율 및 배치 가감산 산출
router.post('/calculate', (req, res) => {
  try {
    const {
      type,
      countG12,
      countG35,
      staffCaregiver,
      staffNurse,
      totalPayroll,
    } = req.body;

    // 총 예상 수가 산출 (임시 산식)
    const totalRevenue =
      Number(countG12) * 1500000 + Number(countG35) * 1200000;
    const totalElderly = Number(countG12) + Number(countG35);

    // 인력 배치 검증 (주야간보호: 어르신 7명당 요양보호사 1명)
    let requiredCaregivers = 0;
    let isStaffOk = true;
    let staffStatusText = '정상 배치';

    if (type === 'daycare') {
      requiredCaregivers = Math.ceil(totalElderly / 7);
      if (Number(staffCaregiver) < requiredCaregivers) {
        isStaffOk = false;
        const shortage = requiredCaregivers - Number(staffCaregiver);
        staffStatusText = `요양보호사 ${shortage}명 부족 (감산 위험!)`;
      } else {
        staffStatusText = `정상 배치 (필수 ${requiredCaregivers}명 / 현재 ${staffCaregiver}명)`;
      }
    }

    // 인건비 비율 검증 (주야간보호: 48.4%, 방문요양: 86.6%)
    const targetRatio = type === 'daycare' ? 48.4 : 86.6;
    const currentRatio =
      totalRevenue > 0
        ? Number(((Number(totalPayroll) / totalRevenue) * 100).toFixed(1))
        : 0;
    const isRatioOk = currentRatio >= targetRatio;

    return res.json({
      success: true,
      result: {
        totalRevenue,
        totalElderly,
        requiredCaregivers,
        isStaffOk,
        staffStatusText,
        currentRatio,
        targetRatio,
        isRatioOk,
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
