import express from 'express';
import { SIMULATOR_QUESTIONS, predictGrade } from '../simulatorMock.js';

const router = express.Router();

// [GET] /api/v1/simulator/questions - 설문 문항 전체 조회
router.get('/questions', (req, res) => {
  res.json({
    success: true,
    questions: SIMULATOR_QUESTIONS,
  });
});

// [POST] /api/v1/simulator/predict - 선택 답변 기반 예상 등급 산출
router.post('/predict', (req, res) => {
  try {
    const { answers } = req.body; // { p1: 12, p2: 0, c1: 8, ... }

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({
        success: false,
        message: '답변 데이터가 입력되지 않았습니다.',
      });
    }

    const result = predictGrade(answers);

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: '시뮬레이션 처리 중 오류가 발생했습니다.',
      error: error.message,
    });
  }
});

export default router;
