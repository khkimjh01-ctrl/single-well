import {
  findBoundStateEnergies,
  sampleWaveFunction,
  potentialAt,
} from './physics.js';

const canvas = document.getElementById('chart');
const ctx = canvas.getContext('2d');
const widthInput = document.getElementById('width');
const depthInput = document.getElementById('depth');
const runBtn = document.getElementById('run');
const energyLevelsEl = document.getElementById('energy-levels');

// Plot layout: margins, axis range
const MARGIN = { top: 24, right: 24, bottom: 36, left: 52 };
const PLOT_WIDTH = canvas.width - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = canvas.height - MARGIN.top - MARGIN.bottom;

// Wave function amplitude in "energy" units for display (so it fits nicely)
const WAVE_SCALE = 0.08;

function run() {
  const L_ang = Number(widthInput.value) || 100;
  const V0_eV = Number(depthInput.value) || 0.3;
  if (L_ang <= 0 || V0_eV <= 0) return;

  const states = findBoundStateEnergies(V0_eV, L_ang);
  const xRange = Math.max(L_ang * 1.6, 80);
  const xMin = -xRange / 2;
  const xMax = xRange / 2;
  const yMin = -0.02 * V0_eV;
  const yMax = V0_eV * 1.05;

  // Clear and draw
  ctx.fillStyle = '#0c0c14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const toX = (x) => MARGIN.left + ((x - xMin) / (xMax - xMin)) * PLOT_WIDTH;
  const toY = (e) => MARGIN.top + PLOT_HEIGHT - ((e - yMin) / (yMax - yMin)) * PLOT_HEIGHT;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let ex = xMin; ex <= xMax; ex += xRange / 4) {
    ctx.beginPath();
    ctx.moveTo(toX(ex), MARGIN.top);
    ctx.lineTo(toX(ex), MARGIN.top + PLOT_HEIGHT);
    ctx.stroke();
  }
  for (let ey = 0; ey <= V0_eV; ey += V0_eV / 4) {
    ctx.beginPath();
    ctx.moveTo(MARGIN.left, toY(ey));
    ctx.lineTo(MARGIN.left + PLOT_WIDTH, toY(ey));
    ctx.stroke();
  }

  // Potential well: V=0 inside |x| < L/2, V=V0 outside. Draw barriers (filled) and well edges.
  const half = L_ang / 2;
  const xLeft = toX(-half);
  const xRight = toX(half);
  const yWell = toY(0);       // energy 0 (well bottom)
  const yBarrier = toY(V0_eV); // energy V0 (top of barrier)
  ctx.fillStyle = 'rgba(59, 130, 246, 0.22)';
  ctx.fillRect(MARGIN.left, yBarrier, xLeft - MARGIN.left, yWell - yBarrier);
  ctx.fillRect(xRight, yBarrier, MARGIN.left + PLOT_WIDTH - xRight, yWell - yBarrier);
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(xLeft, toY(yMin));
  ctx.lineTo(xLeft, toY(V0_eV));
  ctx.moveTo(xRight, toY(yMin));
  ctx.lineTo(xRight, toY(V0_eV));
  ctx.moveTo(MARGIN.left, yWell);
  ctx.lineTo(xLeft, yWell);
  ctx.moveTo(xRight, yWell);
  ctx.lineTo(MARGIN.left + PLOT_WIDTH, yWell);
  ctx.stroke();

  // Energy levels (horizontal lines)
  const colors = ['#f59e0b', '#22c55e', '#ec4899', '#8b5cf6', '#06b6d4'];
  states.forEach((s, i) => {
    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(MARGIN.left, toY(s.E));
    ctx.lineTo(MARGIN.left + PLOT_WIDTH, toY(s.E));
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Wave functions (offset by energy)
  states.forEach((s, i) => {
    const pts = sampleWaveFunction(s.E, s.parity, V0_eV, L_ang, xMin, xMax, 500);
    const color = colors[i % colors.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (const p of pts) {
      const yVal = s.E + WAVE_SCALE * V0_eV * p.psi;
      if (first) {
        ctx.moveTo(toX(p.x), toY(yVal));
        first = false;
      } else {
        ctx.lineTo(toX(p.x), toY(yVal));
      }
    }
    ctx.stroke();
  });

  // Axes and labels
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(MARGIN.left, MARGIN.top);
  ctx.lineTo(MARGIN.left, MARGIN.top + PLOT_HEIGHT);
  ctx.lineTo(MARGIN.left + PLOT_WIDTH, MARGIN.top + PLOT_HEIGHT);
  ctx.stroke();

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('x (Å)', MARGIN.left + PLOT_WIDTH / 2, canvas.height - 8);
  ctx.save();
  ctx.translate(14, MARGIN.top + PLOT_HEIGHT / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillText('에너지 (eV)', 0, 0);
  ctx.restore();

  ctx.textAlign = 'right';
  ctx.fillText('0', MARGIN.left - 8, toY(0) + 4);
  ctx.fillText(V0_eV.toFixed(2), MARGIN.left - 8, toY(V0_eV) + 4);

  // Energy levels list
  if (states.length === 0) {
    energyLevelsEl.innerHTML = '<p>이 우물에서 bound state가 없습니다. 깊이를 늘리거나 너비를 넓혀 보세요.</p>';
  } else {
    energyLevelsEl.innerHTML = states
      .map(
        (s, i) =>
          `<span class="level">n = ${i + 1} (${s.parity === 'even' ? '짝수' : '홀수'}): E = ${s.E.toFixed(4)} eV</span>`
      )
      .join('');
  }
}

runBtn.addEventListener('click', run);
widthInput.addEventListener('keydown', (e) => e.key === 'Enter' && run());
depthInput.addEventListener('keydown', (e) => e.key === 'Enter' && run());

// Initial draw
run();
