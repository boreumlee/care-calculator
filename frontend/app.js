const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.protocol === 'file:';

console.log('isLocal:', isLocal);
const API_BASE_URL = isLocal
  ? 'http://localhost:4000/api/v1'
  : 'https://care-calculator-api.onrender.com/api/v1';

// 탭 전환
function switchTab(tabName) {
  document
    .querySelectorAll('.tab-btn')
    .forEach((btn) => btn.classList.remove('active'));
  document
    .querySelectorAll('.tab-content')
    .forEach((content) => content.classList.remove('active'));

  if (tabName === 'client') {
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.getElementById('tab-client').classList.add('active');
  } else if (tabName === 'institution') {
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('tab-institution').classList.add('active');
  } else if (tabName === 'simulator') {
    document.querySelectorAll('.tab-btn')[2].classList.add('active');
    document.getElementById('tab-simulator').classList.add('active');
    loadQuestions(); // 시뮬레이터 탭 클릭 시 문항 로드
  }
}

// 1. 보호자용 계산 API
async function calculateClient() {
  const grade = document.getElementById('client-grade').value;
  const copayType = document.getElementById('client-rate').value;

  try {
    const res = await fetch(`${API_BASE_URL}/client/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grade: `GRADE_${grade}`,
        copayType: copayType,
        serviceType: 'VISIT_CARE',
        timeCode: 'TIME_180_OVER',
        days: 20,
      }),
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('res-max-amount').innerText =
        data.result.monthlyLimit.toLocaleString() + '원';
      document.getElementById('res-copay').innerText =
        data.result.copayAmount.toLocaleString() + '원';
      document.getElementById('client-result').style.display = 'block';
    }
  } catch (err) {
    alert('보호자용 계산 API 통신 실패');
  }
}

// 2. 원장님용 계산 API
async function calculateInstitution() {
  const payload = {
    type: document.getElementById('inst-type').value,
    countG12: Number(document.getElementById('count-g12').value),
    countG35: Number(document.getElementById('count-g35').value),
    staffCaregiver: Number(document.getElementById('staff-caregiver').value),
    staffNurse: Number(document.getElementById('staff-nurse').value),
    totalPayroll: Number(document.getElementById('total-payroll').value),
  };

  try {
    const res = await fetch(`${API_BASE_URL}/institution/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      const result = data.result;
      document.getElementById('res-total-revenue').innerText =
        result.totalRevenue.toLocaleString() + '원';

      const staffEl = document.getElementById('res-staff-status');
      staffEl.innerText = result.staffStatusText;
      staffEl.className = `status-badge ${result.isStaffOk ? 'status-pass' : 'status-warn'}`;

      document.getElementById('res-payroll-ratio').innerText =
        result.currentRatio + '% (기준: ' + result.targetRatio + '%)';
      const ratioEl = document.getElementById('res-ratio-status');
      ratioEl.innerText = result.isRatioOk ? '충족 (안전)' : '미달 (추징 위험)';
      ratioEl.className = `status-badge ${result.isRatioOk ? 'status-pass' : 'status-warn'}`;

      document.getElementById('inst-result').style.display = 'block';
    }
  } catch (err) {
    alert('원장님용 계산 API 통신 실패');
  }
}

// 3-1. [시뮬레이터] 백엔드에서 문항 불러와서 HTML 생성
async function loadQuestions() {
  const container = document.getElementById('questions-container');
  if (container.dataset.loaded === 'true') return; // 이미 로드했으면 재요청 안함

  try {
    const res = await fetch(`${API_BASE_URL}/simulator/questions`);
    const data = await res.json();

    if (data.success) {
      let html = '';
      data.questions.forEach((q, idx) => {
        html += `
          <div class="form-group" style="margin-bottom: 20px;">
            <label style="font-size: 15px;">${idx + 1}. [${q.category}] ${q.question}</label>
            <select name="${q.id}" class="sim-select" style="margin-top: 6px;">
        `;
        q.options.forEach((opt) => {
          html += `<option value="${opt.score}">${opt.text}</option>`;
        });
        html += `</select></div>`;
      });

      container.innerHTML = html;
      container.dataset.loaded = 'true';
    }
  } catch (err) {
    container.innerHTML = '문항을 불러오는데 실패했습니다.';
  }
}

// 3-2. [시뮬레이터] 선택된 답변 수집 후 예상 등급 산출 API 호출
async function predictGrade() {
  const selects = document.querySelectorAll('.sim-select');
  const answers = {};

  selects.forEach((select) => {
    answers[select.name] = Number(select.value);
  });

  try {
    const res = await fetch(`${API_BASE_URL}/simulator/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();

    if (data.success) {
      const result = data.result;
      document.getElementById('res-sim-score').innerText =
        result.totalScore + '점';
      document.getElementById('res-sim-grade').innerText =
        result.predictedGrade;
      document.getElementById('res-sim-limit').innerText =
        result.estimatedMonthlyLimit.toLocaleString() + '원';
      document.getElementById('res-sim-desc').innerText = result.description;

      document.getElementById('sim-result').style.display = 'block';
    }
  } catch (err) {
    alert('등급 판정 시뮬레이션 통신 실패');
  }
}
