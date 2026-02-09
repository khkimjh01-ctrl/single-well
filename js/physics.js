/**
 * Single Quantum Well - Finite Square Well Physics
 * Units: energy in eV, length in Angstrom (Å)
 */

// Physical constants (SI): hbar in J·s, m in kg, e in J/eV
const HBAR = 1.054571817e-34;      // J·s
const M_E = 9.1093837e-31;         // kg
const E_CHARGE = 1.602176634e-19;  // J/eV

// 2m/hbar^2 in (1/(J·m²))
const TWO_M_OVER_HBAR_SQ = (2 * M_E) / (HBAR * HBAR);

// Convert E (eV) to k (1/m): k = sqrt(2mE/hbar^2), E in J
function kFromEnergy(E_eV) {
  const E_J = E_eV * E_CHARGE;
  return Math.sqrt(TWO_M_OVER_HBAR_SQ * E_J);
}

// Convert (V0 - E) (eV) to kappa (1/m)
function kappaFromEnergy(V0_eV, E_eV) {
  return kFromEnergy(V0_eV - E_eV);
}

// L_ang in Angstrom -> L in meters
function L_to_m(L_ang) {
  return L_ang * 1e-10;
}

/**
 * Finite square well: V=0 for -L/2 < x < L/2, V=V0 outside.
 * Find bound state energies 0 < E < V0.
 * Returns array of { E, parity: 'even'|'odd' }.
 */
function findBoundStateEnergies(V0_eV, L_ang) {
  if (V0_eV <= 0) return [];
  const L_m = L_to_m(L_ang);
  const energies = [];
  const de = V0_eV / 500;
  let prevEven = null;
  let prevOdd = null;

  for (let E = de; E < V0_eV - 1e-10; E += de) {
    const k = kFromEnergy(E);
    const kappa = kappaFromEnergy(V0_eV, E);
    const halfL = L_m / 2;
    const xi = k * halfL;
    const eta = kappa * halfL;

    // Even: tan(xi) = eta/xi  =>  f_even = xi*tan(xi) - eta
    const tanXi = Math.tan(xi);
    const fEven = xi * tanXi - eta;

    // Odd: tan(xi) = -xi/eta  =>  f_odd = eta*tan(xi) + xi
    const fOdd = eta * tanXi + xi;

    if (prevEven !== null && (prevEven > 0) !== (fEven > 0)) {
      const E_found = bisectEnergy(E - de, E, V0_eV, L_m, 'even');
      if (E_found != null) energies.push({ E: E_found, parity: 'even' });
    }
    if (prevOdd !== null && (prevOdd > 0) !== (fOdd > 0)) {
      const E_found = bisectEnergy(E - de, E, V0_eV, L_m, 'odd');
      if (E_found != null) energies.push({ E: E_found, parity: 'odd' });
    }
    prevEven = fEven;
    prevOdd = fOdd;
  }

  return energies.sort((a, b) => a.E - b.E);
}

function bisectEnergy(E_lo, E_hi, V0_eV, L_m, parity) {
  for (let i = 0; i < 60; i++) {
    const E = (E_lo + E_hi) / 2;
    const k = kFromEnergy(E);
    const kappa = kappaFromEnergy(V0_eV, E);
    const xi = k * (L_m / 2);
    const eta = kappa * (L_m / 2);
    const tanXi = Math.tan(xi);
    const f = parity === 'even' ? xi * tanXi - eta : eta * tanXi + xi;
    if (Math.abs(f) < 1e-12) return E;
    if (f > 0) E_hi = E;
    else E_lo = E;
  }
  return (E_lo + E_hi) / 2;
}

/**
 * Normalized wave function value at x (in Angstrom).
 * Well is from -L/2 to L/2 (symmetric).
 */
function waveFunctionAt(x_ang, E_eV, parity, V0_eV, L_ang) {
  const L_m = L_to_m(L_ang);
  const halfL_ang = L_ang / 2;
  const k = kFromEnergy(E_eV);
  const kappa = kappaFromEnergy(V0_eV, E_eV);
  const x_m = x_ang * 1e-10;
  const halfL_m = L_m / 2;

  let psi, psiInside;
  if (parity === 'even') {
    psiInside = (x) => Math.cos(k * x);
  } else {
    psiInside = (x) => Math.sin(k * x);
  }

  let A, B; // normalization: inside A*psiInside, outside B*exp(-kappa*|x|)
  if (Math.abs(x_ang) <= halfL_ang) {
    return psiInside(x_m);
  }
  const sign = x_ang > 0 ? 1 : -1;
  return Math.exp(-kappa * (Math.abs(x_m) - halfL_m));
}

/**
 * Get wave function scaling factor so that max|psi| = 1 inside well.
 * Returns { A_inside, B_outside } for even: A*cos(kx), B*exp(-kappa*|x|).
 */
function waveFunctionAmplitudes(E_eV, parity, V0_eV, L_ang) {
  const L_m = L_to_m(L_ang);
  const halfL_m = L_m / 2;
  const k = kFromEnergy(E_eV);
  const kappa = kappaFromEnergy(V0_eV, E_eV);

  const cosHalf = Math.cos(k * halfL_m);
  const sinHalf = Math.sin(k * halfL_m);
  const expHalf = Math.exp(-kappa * halfL_m);

  let A = 1;
  let B;
  if (parity === 'even') {
    B = A * cosHalf / expHalf;
  } else {
    B = A * sinHalf / expHalf;
  }
  // Normalize so max absolute value is 1
  const maxInside = parity === 'even' ? A : A * Math.abs(Math.sin(k * halfL_m));
  const maxOutside = B;
  const scale = Math.max(maxInside, maxOutside);
  return { A: A / scale, B: B / scale };
}

/**
 * Sample wave function for plotting. Returns array of { x_ang, psi, potential }.
 */
function sampleWaveFunction(E_eV, parity, V0_eV, L_ang, xMin_ang, xMax_ang, nPoints = 400) {
  const L_m = L_to_m(L_ang);
  const halfL_ang = L_ang / 2;
  const halfL_m = L_m / 2;
  const k = kFromEnergy(E_eV);
  const kappa = kappaFromEnergy(V0_eV, E_eV);
  const { A, B } = waveFunctionAmplitudes(E_eV, parity, V0_eV, L_ang);

  const points = [];
  for (let i = 0; i <= nPoints; i++) {
    const x_ang = xMin_ang + (xMax_ang - xMin_ang) * (i / nPoints);
    const x_m = x_ang * 1e-10;
    const V = Math.abs(x_ang) <= halfL_ang ? 0 : V0_eV;

    let psi;
    if (Math.abs(x_ang) <= halfL_ang) {
      psi = parity === 'even' ? A * Math.cos(k * x_m) : A * Math.sin(k * x_m);
    } else {
      psi = B * Math.exp(-kappa * (Math.abs(x_m) - halfL_m));
      if (parity === 'odd' && x_ang < 0) psi = -psi;
    }
    points.push({ x: x_ang, psi, V });
  }
  return points;
}

/**
 * Potential at x (Angstrom). Symmetric well: V=0 for |x| <= L/2, V=V0 otherwise.
 */
function potentialAt(x_ang, V0_eV, L_ang) {
  const half = L_ang / 2;
  return Math.abs(x_ang) <= half ? 0 : V0_eV;
}

export {
  findBoundStateEnergies,
  sampleWaveFunction,
  potentialAt,
  L_to_m,
};
