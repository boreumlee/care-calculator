// simulatorMock.js - 건보공단 52개 조사항목 기반 압축 설문 및 판정 알고리즘

export const SIMULATOR_QUESTIONS = [
  {
    id: 'p1',
    category: '신체기능',
    question: '식사하기 (음식을 입에 넣고 씹고 삼키는 과정)',
    options: [
      { text: '완전 자립 (혼자서 가능)', score: 0 },
      { text: '부분 수발 (도움이 일부 필요)', score: 12 },
      { text: '완전 수발 (전적으로 떠먹여 줘야 함)', score: 25 },
    ],
  },
  {
    id: 'p2',
    category: '신체기능',
    question: '체위변경 및 일어서기 (침대에서 일어나 앉거나 서기)',
    options: [
      { text: '완전 자립', score: 0 },
      { text: '부분 수발', score: 10 },
      { text: '완전 수발', score: 20 },
    ],
  },
  {
    id: 'p3',
    category: '신체기능',
    question: '화장실 이용하기 (화장실 이동, 옷 내리기/올리기, 뒷처리)',
    options: [
      { text: '완전 자립', score: 0 },
      { text: '부분 수발', score: 12 },
      { text: '완전 수발', score: 25 },
    ],
  },
  {
    id: 'c1',
    category: '인지기능',
    question: '오늘이 몇 월며칠인지, 계절이나 지금 있는 장소를 알고 계신가요?',
    options: [
      { text: '잘 알고 계심', score: 0 },
      { text: '가끔 헷갈려함', score: 8 },
      { text: '전혀 인지하지 못함', score: 15 },
    ],
  },
  {
    id: 'b1',
    category: '행동변화',
    question:
      '길을 잃거나 밖으로 나갔다가 돌아오지 못하는 증상(길헤맴)이 있나요?',
    options: [
      { text: '없음', score: 0 },
      { text: '가끔 있음', score: 8 },
      { text: '자주 발생함', score: 15 },
    ],
  },
];

// 점수 합산 기반 예상 등급 판정 함수
export function predictGrade(answers) {
  // answers: { p1: 12, p2: 10, ... } 형태
  let totalScore = 0;

  Object.keys(answers).forEach((key) => {
    totalScore += Number(answers[key]) || 0;
  });

  let predictedGrade = '';
  let description = '';
  let estimatedMonthlyLimit = 0;

  if (totalScore >= 95) {
    predictedGrade = '1등급';
    description =
      '최중증 (일상생활에서 전적으로 다른 사람의 도움이 필요한 상태)';
    estimatedMonthlyLimit = 2270000;
  } else if (totalScore >= 75) {
    predictedGrade = '2등급';
    description =
      '중증 (일상생활에서 상당 부분 다른 사람의 도움이 필요한 상태)';
    estimatedMonthlyLimit = 2030000;
  } else if (totalScore >= 60) {
    predictedGrade = '3등급';
    description =
      '중등도 (일상생활에서 부분적으로 다른 사람의 도움이 필요한 상태)';
    estimatedMonthlyLimit = 1450000;
  } else if (totalScore >= 51) {
    predictedGrade = '4등급';
    description =
      '경증 (일상생활에서 일정 부분 다른 사람의 도움이 필요한 상태)';
    estimatedMonthlyLimit = 1300000;
  } else if (totalScore >= 45) {
    predictedGrade = '5등급';
    description =
      '치매 (치매환자로서 장기요양인정 점수가 45점 이상 51점 미만인 상태)';
    estimatedMonthlyLimit = 1150000;
  } else {
    predictedGrade = '등급외 (인지지원등급 또는 지원대상)';
    description =
      '장기요양 인정 점수 미달이나, 지자체/보건소 노인돌봄서비스 이용 가능';
    estimatedMonthlyLimit = 0;
  }

  return {
    totalScore,
    predictedGrade,
    description,
    estimatedMonthlyLimit,
  };
}
