import React from 'react';

// Scale: 1 m = 58 px, plan origin at svg (200, 150)
const S = 58;
const OX = 200;
const OY = 150;
const P = (mx: number, mz: number): [number, number] => [OX + mx * S, OY + mz * S];

const C = {
  wall: '#c7d2e0',
  wallFill: '#3a4a63',
  axis: '#00e5ff',
  electrical: '#ffb800',
  sanitary: '#00a8e8',
  aci: '#e63946',
  hvac: '#b0b8c8',
  text: '#d7e0ea',
  muted: '#8aa0b8',
  dim: '#7f9ab5',
  section: '#e879f9',
};

function AxisBubble({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="9" fill="#0a1628" stroke={C.axis} strokeWidth="1" />
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize="10" fontWeight="bold" fill={C.axis} fontFamily="JetBrains Mono, monospace">{label}</text>
    </g>
  );
}

function Column({ x, y }: { x: number; y: number }) {
  const [px, py] = P(x, y);
  const r = 0.15 * S;
  return (
    <g>
      <rect x={px - r} y={py - r} width={r * 2} height={r * 2} fill="#0d1b30" stroke={C.wall} strokeWidth="1" />
      <line x1={px - r} y1={py - r} x2={px + r} y2={py + r} stroke={C.wall} strokeWidth="0.7" />
      <line x1={px - r} y1={py + r} x2={px + r} y2={py - r} stroke={C.wall} strokeWidth="0.7" />
    </g>
  );
}

function LightFixture({ x, y }: { x: number; y: number }) {
  const [px, py] = P(x, y);
  return (
    <g stroke={C.electrical} strokeWidth="0.9" fill="none" opacity="0.9">
      <circle cx={px} cy={py} r="3.6" />
      <line x1={px - 3.6} y1={py} x2={px + 3.6} y2={py} />
      <line x1={px} y1={py - 3.6} x2={px} y2={py + 3.6} />
    </g>
  );
}

function Diffuser({ x, y, size = 8 }: { x: number; y: number; size?: number }) {
  const [px, py] = P(x, y);
  const r = size / 2;
  return (
    <g transform={`rotate(45 ${px} ${py})`} fill="none" stroke={C.hvac} strokeWidth="1">
      <rect x={px - r} y={py - r} width={size} height={size} />
      <line x1={px - r} y1={py} x2={px + r} y2={py} />
    </g>
  );
}

function FloorDrain({ x, y }: { x: number; y: number }) {
  const [px, py] = P(x, y);
  return (
    <g stroke={C.sanitary} strokeWidth="0.9" fill="none">
      <circle cx={px} cy={py} r="4" />
      <line x1={px - 4} y1={py - 4} x2={px + 4} y2={py + 4} />
      <line x1={px - 4} y1={py + 4} x2={px + 4} y2={py - 4} />
    </g>
  );
}

function DimH({ x1, x2, y, value }: { x1: number; x2: number; y: number; value: string }) {
  const mid = (x1 + x2) / 2;
  return (
    <g stroke={C.dim} strokeWidth="0.7" fill={C.dim}>
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 3} x2={x1} y2={y + 3} />
      <line x1={x2} y1={y - 3} x2={x2} y2={y + 3} />
      <text x={mid} y={y - 4} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono, monospace">{value}</text>
    </g>
  );
}

function DimV({ y1, y2, x, value }: { y1: number; y2: number; x: number; value: string }) {
  const mid = (y1 + y2) / 2;
  return (
    <g stroke={C.dim} strokeWidth="0.7" fill={C.dim}>
      <line x1={x} y1={y1} x2={x} y2={y2} />
      <line x1={x - 3} y1={y1} x2={x + 3} y2={y1} />
      <line x1={x - 3} y1={y2} x2={x + 3} y2={y2} />
      <text x={x - 4} y={mid + 3} textAnchor="end" fontSize="9" fontFamily="JetBrains Mono, monospace">{value}</text>
    </g>
  );
}

export function MepFloorPlan2D() {
  const W = 6.0;
  const H = 5.5;
  const t = 0.24;
  const axesX = [0.5, 3.0, 5.5];
  const axesZ = [0.6, 2.75, 4.9];

  // plan (scaled) coordinates
  const [w0, w1] = P(0, 0);
  const [wE, wS] = P(W, H);

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 900 640" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="fpg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#16324f" strokeWidth="0.4" />
        </pattern>
        <pattern id="fpg-grid-major" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M100 0H0V100" fill="none" stroke="#1d3a5c" strokeWidth="0.6" />
        </pattern>
      </defs>

      {/* Sheet */}
      <rect x="0" y="0" width="900" height="640" fill="#0a1628" />
      <rect x="8" y="8" width="884" height="624" fill="none" stroke="#2c4a6e" strokeWidth="1.4" />
      <rect x="14" y="14" width="872" height="612" fill="url(#fpg-grid)" stroke="#2c4a6e" strokeWidth="0.6" />
      <rect x="14" y="14" width="872" height="612" fill="url(#fpg-grid-major)" />

      {/* Sheet number stamp */}
      <g transform="translate(24 24)">
        <rect x="0" y="0" width="64" height="40" fill="#E63946" />
        <text x="32" y="15" textAnchor="middle" fontSize="8" fill="#fff" fontFamily="JetBrains Mono, monospace" letterSpacing="1">LÁMINA</text>
        <text x="32" y="32" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff" fontFamily="JetBrains Mono, monospace">04</text>
      </g>
      <text x="100" y="50" fontSize="11" fill={C.muted} fontFamily="JetBrains Mono, monospace" letterSpacing="2">
        PLANO DE INSTALACIONES MECÁNICAS, ELÉCTRICAS Y SANITARIAS — PLANTA GENERAL (MEP)
      </text>

      {/* Grid extension lines */}
      {axesX.map((x) => {
        const [px] = P(x, 0);
        return <line key={`ex-${x}`} x1={px} y1={OY - 42} x2={px} y2={OY + H * S + 34} stroke={C.axis} strokeWidth="0.5" strokeDasharray="5 4" opacity="0.55" />;
      })}
      {axesZ.map((z) => {
        const [, py] = P(0, z);
        return <line key={`ez-${z}`} x1={OX - 34} y1={py} x2={OX + W * S + 38} y2={py} stroke={C.axis} strokeWidth="0.5" strokeDasharray="5 4" opacity="0.55" />;
      })}

      {/* ── PLAN (scaled) ── */}
      <g transform={`translate(${OX} ${OY}) scale(${S})`}>
        {/* Perimeter walls – double line */}
        <rect x={0} y={-t / 2} width={W} height={t} fill={C.wallFill} stroke={C.wall} strokeWidth="0.02" />
        <rect x={0} y={H - t / 2} width={W} height={t} fill={C.wallFill} stroke={C.wall} strokeWidth="0.02" />
        <rect x={-t / 2} y={0} width={t} height={H} fill={C.wallFill} stroke={C.wall} strokeWidth="0.02" />
        <rect x={W - t / 2} y={0} width={t} height={H} fill={C.wallFill} stroke={C.wall} strokeWidth="0.02" />
        {/* Interior wall with door opening */}
        <rect x={0} y={1.15 - t / 2} width={1.3 - t / 2} height={t} fill={C.wallFill} stroke={C.wall} strokeWidth="0.02" />
        <rect x={1.7} y={1.15 - t / 2} width={W - 1.7 - t / 2} height={t} fill={C.wallFill} stroke={C.wall} strokeWidth="0.02" />
        {/* Door swing */}
        <path d={`M ${0.9} ${1.15} A 0.9 0.9 0 0 1 0 1.15`} fill="none" stroke={C.wall} strokeWidth="0.03" strokeDasharray="0.06 0.05" />
        <line x1={0} y1={1.15} x2={0.9} y2={1.15} stroke={C.wall} strokeWidth="0.03" />

        {/* HVAC supply duct (double line) */}
        <line x1={-0.15} y1={1.9} x2={5.2} y2={1.9} stroke={C.hvac} strokeWidth="0.45" opacity="0.5" />
        <line x1={-0.15} y1={2.28} x2={5.2} y2={2.28} stroke={C.hvac} strokeWidth="0.45" opacity="0.5" />
        <line x1={2.4} y1={2.09} x2={2.4} y2={4.8} stroke={C.hvac} strokeWidth="0.3" opacity="0.6" />
        {/* AHU unit */}
        <rect x={0.5} y={0.55} width={1.3} height={0.85} fill="#1a2838" stroke={C.hvac} strokeWidth="0.05" />
        <text x={1.15} y={1.05} textAnchor="middle" fontSize="0.22" fill={C.hvac} fontFamily="JetBrains Mono, monospace" fontWeight="bold">AHU-01</text>

        {/* Sanitary water supply */}
        <line x1={0.5} y1={-0.2} x2={0.5} y2={5.5} stroke={C.sanitary} strokeWidth="0.12" />
        <line x1={0.5} y1={3.0} x2={5.5} y2={3.0} stroke={C.sanitary} strokeWidth="0.12" />
        <line x1={5.5} y1={3.0} x2={5.5} y2={5.5} stroke={C.sanitary} strokeWidth="0.12" />
        {/* Water heater */}
        <circle cx={0.5} cy={3.55} r={0.32} fill="#0d1b30" stroke={C.sanitary} strokeWidth="0.05" />
        <text x={0.5} y={3.62} textAnchor="middle" fontSize="0.22" fill={C.sanitary} fontFamily="JetBrains Mono, monospace">T-01</text>
        {/* ACI sprinkler main */}
        <line x1={3.0} y1={-0.2} x2={3.0} y2={5.5} stroke={C.aci} strokeWidth="0.1" strokeDasharray="0.3 0.18" />
        <line x1={3.0} y1={4.4} x2={5.5} y2={4.4} stroke={C.aci} strokeWidth="0.1" strokeDasharray="0.3 0.18" />

        {/* Electrical cable tray (dashed gold) */}
        <line x1={2.1} y1={-0.2} x2={2.1} y2={5.5} stroke={C.electrical} strokeWidth="0.14" strokeDasharray="0.35 0.22" />
        {/* Panelboard */}
        <rect x={5.05} y={4.55} width={0.7} height={0.7} fill="#1a2838" stroke={C.electrical} strokeWidth="0.06" />
        <text x={5.4} y={5.0} textAnchor="middle" fontSize="0.18" fill={C.electrical} fontFamily="JetBrains Mono, monospace" fontWeight="bold">PLC-01</text>
        <line x1={2.1} y1={4.9} x2={5.05} y2={4.9} stroke={C.electrical} strokeWidth="0.06" strokeDasharray="0.2 0.15" />
      </g>

      {/* Overlay symbols (px space) */}
      <Column x={0.5} y={0.6} /> <Column x={3.0} y={0.6} /> <Column x={5.5} y={0.6} />
      <Column x={0.5} y={2.75} /> <Column x={3.0} y={2.75} /> <Column x={5.5} y={2.75} />
      <Column x={0.5} y={4.9} /> <Column x={3.0} y={4.9} /> <Column x={5.5} y={4.9} />

      <LightFixture x={2.1} y={1.2} /> <LightFixture x={2.1} y={2.75} /> <LightFixture x={2.1} y={4.3} />
      <Diffuser x={2.4} y={2.7} /> <Diffuser x={2.4} y={3.9} /> <Diffuser x={0.8} y={2.9} />
      <FloorDrain x={1.6} y={4.4} /> <FloorDrain x={4.5} y={1.5} /> <FloorDrain x={4.5} y={4.9} />

      {/* Room labels */}
      <text x={P(0, 2.0)[0] + 14} y={P(0, 2.0)[1]} fontSize="11" fill={C.text} fontFamily="Inter, sans-serif" fontWeight="600" transform={`rotate(-90 ${P(0, 2.0)[0] + 14} ${P(0, 2.0)[1]})`}>PATIO DE MÁQUINAS</text>
      <text x={P(4.3, 0.8)[0]} y={P(4.3, 0.8)[1]} fontSize="11" fill={C.text} fontFamily="Inter, sans-serif" fontWeight="600" textAnchor="middle">SALA ELÉCTRICA</text>
      <text x={P(4.3, 3.8)[0]} y={P(4.3, 3.8)[1]} fontSize="11" fill={C.text} fontFamily="Inter, sans-serif" fontWeight="600" textAnchor="middle">SALA BIM / CÓMPUTO</text>
      <text x={P(0.95, 2.1)[0]} y={P(0.95, 2.1)[1]} fontSize="9" fill={C.muted} fontFamily="Inter, sans-serif" transform={`rotate(-90 ${P(0.95, 2.1)[0]} ${P(0.95, 2.1)[1]})`}>CIRCULACIÓN</text>

      {/* Dimensions */}
      <DimH x1={w0} x2={wE} y={OY - 30} value="6.000" />
      <DimH x1={P(0.5, 0)[0]} x2={P(3.0, 0)[0]} y={OY - 48} value="2.500" />
      <DimH x1={P(3.0, 0)[0]} x2={P(5.5, 0)[0]} y={OY - 48} value="2.500" />
      <DimV y1={w1} y2={wS} x={OX - 24} value="5.500" />
      <DimV y1={P(0, 0.6)[1]} y2={P(0, 2.75)[1]} x={OX - 42} value="2.150" />
      <DimV y1={P(0, 2.75)[1]} y2={P(0, 4.9)[1]} x={OX - 42} value="2.150" />

      {/* Axis bubbles */}
      {axesX.map((x, i) => {
        const [px] = P(x, 0);
        return <AxisBubble key={`bx-${i}`} x={px} y={OY + H * S + 26} label={String(i + 1)} />;
      })}
      {axesZ.map((z, i) => {
        const [, py] = P(0, z);
        return <AxisBubble key={`bz-${i}`} x={OX + W * S + 26} y={py} label={String.fromCharCode(65 + i)} />;
      })}

      {/* Section cut A-A */}
      <g stroke={C.section} strokeWidth="1.2" fill={C.section}>
        <line x1={P(0.2, 2.6)[0]} y1={P(0.2, 2.6)[1]} x2={P(5.8, 2.6)[0]} y2={P(5.8, 2.6)[1]} strokeDasharray="7 4" />
        <polygon points={`${P(0.2, 2.6)[0] - 7},${P(0.2, 2.6)[1]} ${P(0.2, 2.6)[0]},${P(0.2, 2.6)[1] - 4} ${P(0.2, 2.6)[0]},${P(0.2, 2.6)[1] + 4}`} />
        <polygon points={`${P(5.8, 2.6)[0] + 7},${P(5.8, 2.6)[1]} ${P(5.8, 2.6)[0]},${P(5.8, 2.6)[1] - 4} ${P(5.8, 2.6)[0]},${P(5.8, 2.6)[1] + 4}`} />
        <text x={P(0.2, 2.6)[0] - 16} y={P(0.2, 2.6)[1] + 4} fontSize="11" fontWeight="900">A</text>
        <text x={P(5.8, 2.6)[0] + 10} y={P(5.8, 2.6)[1] + 4} fontSize="11" fontWeight="900">A'</text>
      </g>

      {/* North arrow */}
      <g transform="translate(840 96)">
        <circle r="22" fill="#0d1b30" stroke={C.axis} strokeWidth="1" />
        <polygon points="0,-15 -8,10 0,3 8,10" fill={C.axis} />
        <text y="-26" textAnchor="middle" fontSize="12" fontWeight="900" fill={C.axis} fontFamily="JetBrains Mono, monospace">N</text>
      </g>

      {/* Legend */}
      <g transform="translate(648 96)">
        <rect x="0" y="0" width="214" height="176" fill="#0d1b30" stroke="#2c4a6e" strokeWidth="1" />
        <text x="8" y="16" fontSize="9" fontWeight="800" fill={C.text} fontFamily="JetBrains Mono, monospace" letterSpacing="1">LEYENDA</text>
        <line x1={8} y1={22} x2={206} y2={22} stroke="#2c4a6e" />
        <line x1={12} y1={34} x2={56} y2={34} stroke={C.electrical} strokeWidth="2" strokeDasharray="6 4" />
        <text x={62} y={37} fontSize="8.5" fill={C.muted} fontFamily="JetBrains Mono, monospace">RED ELÉCTRICA / BANDEJA</text>
        <line x1={12} y1={56} x2={56} y2={56} stroke={C.sanitary} strokeWidth="2" />
        <text x={62} y={59} fontSize="8.5" fill={C.muted} fontFamily="JetBrains Mono, monospace">AGUA FRÍA / SANITARIA</text>
        <line x1={12} y1={78} x2={56} y2={78} stroke={C.aci} strokeWidth="1.6" strokeDasharray="5 3" />
        <text x={62} y={81} fontSize="8.5" fill={C.muted} fontFamily="JetBrains Mono, monospace">RED ACI C. INCENDIO</text>
        <line x1={12} y1={100} x2={56} y2={100} stroke={C.hvac} strokeWidth="5" opacity="0.5" />
        <text x={62} y={103} fontSize="8.5" fill={C.muted} fontFamily="JetBrains Mono, monospace">DUCTO HVAC (SUPPLY)</text>
        <g transform={`translate(34 128) rotate(45)`}><rect x={-4} y={-4} width={8} height={8} fill="none" stroke={C.hvac} strokeWidth="1" /></g>
        <text x={62} y={131} fontSize="8.5" fill={C.muted} fontFamily="JetBrains Mono, monospace">DIFUSOR / REJILLA</text>
        <circle cx={34} cy={152} r={4} fill="none" stroke={C.sanitary} strokeWidth="1" />
        <line x1={30} y1={148} x2={38} y2={156} stroke={C.sanitary} strokeWidth="0.8" />
        <line x1={38} y1={148} x2={30} y2={156} stroke={C.sanitary} strokeWidth="0.8" />
        <text x={62} y={155} fontSize="8.5" fill={C.muted} fontFamily="JetBrains Mono, monospace">SUMIDERO / DESAGÜE</text>
      </g>

      {/* General notes */}
      <g transform="translate(20 486)">
        <rect x="0" y="0" width="330" height="84" fill="#0d1b30" stroke="#2c4a6e" strokeWidth="1" />
        <text x="8" y="15" fontSize="9" fontWeight="800" fill={C.text} fontFamily="JetBrains Mono, monospace" letterSpacing="1">NOTAS GENERALES</text>
        <line x1={8} y1={20} x2={322} y2={20} stroke="#2c4a6e" />
        <text x="8" y="34" fontSize="8" fill={C.muted} fontFamily="JetBrains Mono, monospace">1. TODAS LAS COTAS EN METROS. NIVEL TERMINADO NPT ±0.00.</text>
        <text x="8" y="46" fontSize="8" fill={C.muted} fontFamily="JetBrains Mono, monospace">2. MODELO FEDERADO MEP LOD 400 · ISO 19650 · COORD -12.043, -77.028.</text>
        <text x="8" y="58" fontSize="8" fill={C.muted} fontFamily="JetBrains Mono, monospace">3. PENDIENTES DE RED SANITARIA AL 2.0% DIRECCIÓN DE LA FLECHA.</text>
        <text x="8" y="70" fontSize="8" fill={C.muted} fontFamily="JetBrains Mono, monospace">4. VER DETALLE DE CRUCES CRÍTICOS EN PLANO 04-MEP-02 (CLASH).</text>
      </g>

      {/* Title block */}
      <g transform="translate(14 586)">
        <rect x="0" y="0" width="872" height="40" fill="#0d1b30" stroke="#2c4a6e" strokeWidth="1" />
        <line x1={220} y1={0} x2={220} y2={40} stroke="#2c4a6e" />
        <line x1={520} y1={0} x2={520} y2={40} stroke="#2c4a6e" />
        <line x1={620} y1={0} x2={620} y2={40} stroke="#2c4a6e" />
        <line x1={740} y1={0} x2={740} y2={40} stroke="#2c4a6e" />
        <line x1={812} y1={0} x2={812} y2={40} stroke="#2c4a6e" />
        <line x1={520} y1={20} x2={812} y2={20} stroke="#2c4a6e" />

        {/* Company */}
        <rect x="0" y="0" width="220" height="40" fill="#FFB800" />
        <text x="10" y="17" fontSize="13" fontWeight="900" fill="#0B0F17" fontFamily="Montserrat, sans-serif" letterSpacing="0.5">TESLA</text>
        <text x="10" y="28" fontSize="6.5" fill="#0B0F17" fontFamily="JetBrains Mono, monospace" fontWeight="700">ELECTRICIDAD Y AUTOMATIZACIÓN S.A.C.</text>
        <text x="10" y="37" fontSize="6" fill="#0B0F17" fontFamily="JetBrains Mono, monospace">MEP COORDINATION DIVISION · ISO 19650</text>

        {/* Title */}
        <text x="232" y="15" fontSize="9" fontWeight="700" fill={C.text} fontFamily="JetBrains Mono, monospace">PLANO DE INSTALACIONES MECÁNICAS, ELÉCTRICAS Y SANITARIAS</text>
        <text x="232" y="29" fontSize="8" fill={C.muted} fontFamily="JetBrains Mono, monospace">PLANTA GENERAL · NIVEL 04 · MODELO FEDERADO LOD 400</text>
        <text x="232" y="38" fontSize="6" fill={C.muted} fontFamily="JetBrains Mono, monospace">GENERADO EN FASE DIGITAL · CERO RE-TRABAJO EN OBRA</text>

        {/* Scale */}
        <text x="530" y="15" fontSize="8" fill={C.muted} fontFamily="JetBrains Mono, monospace">ESCALA</text>
        <text x="530" y="30" fontSize="13" fontWeight="900" fill={C.text} fontFamily="JetBrains Mono, monospace">1:50</text>
        <text x="630" y="15" fontSize="8" fill={C.muted} fontFamily="JetBrains Mono, monospace">N° LÁMINA</text>
        <text x="630" y="30" fontSize="13" fontWeight="900" fill={C.electrical} fontFamily="JetBrains Mono, monospace">04-MEP-01</text>
        <text x="750" y="15" fontSize="8" fill={C.muted} fontFamily="JetBrains Mono, monospace">FECHA</text>
        <text x="750" y="30" fontSize="11" fontWeight="700" fill={C.text} fontFamily="JetBrains Mono, monospace">08-2026</text>
        <text x="818" y="15" fontSize="8" fill={C.muted} fontFamily="JetBrains Mono, monospace">REV</text>
        <text x="818" y="30" fontSize="11" fontWeight="700" fill={C.text} fontFamily="JetBrains Mono, monospace">00</text>
        <text x="530" y="38" fontSize="6" fill={C.muted} fontFamily="JetBrains Mono, monospace">LOD 400 · ISO 19650 · PRECISIÓN ±0.5mm</text>
      </g>
    </svg>
  );
}

export default MepFloorPlan2D;
