# PhysicsLab — Visualization Module for Laws of Physics

This is a web app that explores 125 laws across 6 fields of physics through mathematical formulas, parameter inputs, and real-time simulations.

| Field | Number of laws | Classification |
|---|---|---|
| Classical mechanics | 34 | Newton's Laws of Motion · Kinematics · Momentum and Collisions · Work and Energy · Rotational Motion · Gravity · Oscillations · Waves · Fluid Mechanics · Analytical Mechanics |
| Thermodynamics · Statistical Mechanics | 17 | Laws of Thermodynamics · Ideal Gas · Heat Engines and Heat Transfer · Statistical Mechanics |
| Electromagnetism · Optics | 19 | Electrostatics · Electric Current and Circuits · Magnetic Fields · Electromagnetic Induction · Electromagnetic Waves · Optics |
| Theory of Relativity | 17 | Special relativity · Relativistic energy · General relativity · Cosmology |
| Quantum mechanics | 16 | Origins of Quantum Theory · Atomic Structure · Wave Mechanics · Spin and Quantum Information |
| Quantum Field Theory · Particle Physics · Condensed Matter Physics | 22 | Quantum Field Theory · Particle Physics · Nuclear Physics · Condensed Matter Physics |

## How to run

- The simplest method: double-click the `index.html` file or visit `https://juwon003.github.io/physicslab/` to open it in a web browser (such as Chrome or Edge). No additional installation or build process is required.
- Mathematical formulas are rendered by loading KaTeX from the internet. If you are offline, the formulas will appear as raw LaTeX code, while the simulations will continue to function as usual.
- To open it on a local server, run the following command in this folder, then access `http://localhost:8000`.

```powershell
python -m http.server 8000
```

## How to use

1. Select a field on the home screen to view all the laws within that category, organized by classification.
2. Click on a specific law to display its formula, explanation, input fields, simulation, and calculation results.
3. Adjust the sliders or enter values ​​directly into the input boxes (followed by the Enter key) to apply these values ​​to the formula and instantly update the visualization.
4. Use the controls below the simulation to pause (spacebar), resume, adjust the speed, or reset to default values.
5. In some simulations, you can drag on the canvas to move charges or objects, or rotate 3D scenes.
6. Use the search bar at the top (or press the `/` key) to find laws by name in either Korean or English.

## Folder structure

```
index.html              Entry point
css/style.css           Screen style
js/engine.js            Physical constants, numerical tools (such as RK4), plotting and graphing tools, and a simulation runner
js/app.js               Screen layout (Home, Category, Principle), value input, search, and URL (#/category/principle) handling
js/fields/*.js          Definition of Laws and Simulation by Field
```

## Add a rule

Register rules using `PL.add(fieldId, {...})` within the files located in `js/fields/`. The simulation is rendered on a 900×560 coordinate system.

```js
PL.add('classical', {
  id: 'momentum', cat: '운동량과 충돌', name: '운동량', en: 'Linear Momentum',
  tex: '\\vec p = m\\vec v',                       // KaTeX 수식 (배열이면 여러 줄)
  desc: '설명 문장…',
  params: [PL.R('m', '질량 m', 'kg', 0.1, 10, 0.1, 2), PL.R('v', '속도 v', 'm/s', -10, 10, 0.1, 3)],
  out: (P, S) => [['운동량 p', P.m * P.v, 'kg·m/s']],             // 계산 결과
  sub: (P) => `p = (${P.m})(${P.v}) = ${P.m * P.v}`,               // 값 대입 수식 (선택)
  init(S, P) { /* 상태 초기화 */ },
  step(S, P, dt) { /* 시간 진행 */ },
  draw(d, S, P) { d.clear(); /* d.arrow, d.ball, d.plot … */ },
});
```

Input value types: `PL.R` (slider + numeric input; `{ log: 1 }` enables a logarithmic scale, while `{ reset: 1 }` triggers a simulation restart whenever the value changes), `PL.Sel` (selection list), and `PL.Chk` (on/off toggle).
