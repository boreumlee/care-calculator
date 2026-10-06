const isLocal =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal
  ? 'http://localhost:4000/api/v1'
  : 'https://care-calculator-api.onrender.com/api/v1';

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
  } else {
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('tab-institution').classList.add('active');
  }
}

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
    alert('보호자용 계산 API 통신에 실패했습니다.');
  }
}

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
    alert('원장님용 계산 API 통신에 실패했습니다.');
  }
}
