import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./Prediction.css";
import { useCurrency } from "../../context/CurrencyContext";
import { useAllPortfolios } from "../../hooks/useAllPortfolios";
import { formatCurrency } from "../../utils/money";
import { combinedNetWorth } from "../../finance/valuation";
import { expectedAnnualRate, MARKET_RATE, project } from "../../finance/prediction";

const STORAGE_KEY = "invapp.prediction";
const MAX_YEARS = 40;
const CHART_HEIGHT = 240;
const PAD = { top: 12, right: 12, bottom: 28, left: 56 };

type RateSource = "holdings" | "market";

type Inputs = {
  currency: string;
  contribution: number;
  withdrawal: number;
  oneTimeAmount: number;
  oneTimeYear: number;
  years: number;
  rateSource: RateSource;
};

type SeriesKey = "keep" | "stop" | "withdraw";

const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: "keep", label: "Keep contributing", color: "var(--decorative-green)" },
  { key: "stop", label: "Stop contributing", color: "var(--decorative-blue)" },
  { key: "withdraw", label: "Withdraw", color: "var(--decorative-orange)" },
];

function niceRound(value: number): number {
  if (value <= 0) return 0;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / magnitude;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * magnitude;
}

function loadInputs(): Partial<Inputs> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Inputs>) : null;
  } catch {
    return null;
  }
}

function saveInputs(inputs: Inputs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    return;
  }
}

function useWidth() {
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver | null>(null);
  const ref = useCallback((el: HTMLDivElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) return;
    observer.current = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.current.observe(el);
  }, []);
  return { ref, width };
}

export function Prediction() {
  const { defaultCurrency, fromUsd, toUsd, convert } = useCurrency();
  const portfolios = useAllPortfolios();

  const contributionMax = niceRound(fromUsd(10_000, defaultCurrency));
  const withdrawalMax = niceRound(fromUsd(20_000, defaultCurrency));

  const [inputs, setInputs] = useState<Inputs>(() => {
    const saved = loadInputs();
    return {
      currency: saved?.currency ?? defaultCurrency,
      contribution: saved?.contribution ?? niceRound(fromUsd(500, defaultCurrency)),
      withdrawal: saved?.withdrawal ?? 0,
      oneTimeAmount: saved?.oneTimeAmount ?? 0,
      oneTimeYear: Math.max(new Date().getFullYear(), saved?.oneTimeYear ?? new Date().getFullYear() + 5),
      years: saved?.years ?? 20,
      rateSource: saved?.rateSource === "market" ? "market" : "holdings",
    };
  });

  useEffect(() => {
    setInputs((prev) => {
      if (prev.currency === defaultCurrency) return prev;
      const move = (v: number) => Math.round(convert(v, prev.currency, defaultCurrency));
      return {
        ...prev,
        currency: defaultCurrency,
        contribution: move(prev.contribution),
        withdrawal: move(prev.withdrawal),
        oneTimeAmount: move(prev.oneTimeAmount),
      };
    });
  }, [defaultCurrency, convert]);

  useEffect(() => saveInputs(inputs), [inputs]);

  const update = (patch: Partial<Inputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  const startValue = useMemo(() => (portfolios ? combinedNetWorth(portfolios, toUsd).total : 0), [portfolios, toUsd]);
  const holdingsRate = useMemo(() => (portfolios ? expectedAnnualRate(portfolios, toUsd) : 0), [portfolios, toUsd]);
  const rate = inputs.rateSource === "market" ? MARKET_RATE : holdingsRate;

  const projection = useMemo(
    () =>
      project({
        startValue,
        annualRate: rate,
        monthlyContribution: toUsd(inputs.contribution, inputs.currency),
        monthlyWithdrawal: toUsd(inputs.withdrawal, inputs.currency),
        oneTimeWithdrawal: {
          amount: toUsd(inputs.oneTimeAmount, inputs.currency),
          atYear: Math.min(inputs.oneTimeYear - new Date().getFullYear(), inputs.years),
        },
        years: inputs.years,
      }),
    [startValue, rate, inputs, toUsd],
  );

  const visible = SERIES.filter(
    (s) => s.key === "stop" || (s.key === "keep" && inputs.contribution > 0) || (s.key === "withdraw" && (inputs.withdrawal > 0 || inputs.oneTimeAmount > 0)),
  );

  const { ref, width } = useWidth();
  const [hover, setHover] = useState<number | null>(null);

  if (!portfolios) return null;

  const money = (usd: number) => formatCurrency(fromUsd(usd, defaultCurrency), defaultCurrency);
  const thisYear = new Date().getFullYear();

  const seriesMax = Math.max(1, ...visible.flatMap((s) => projection[s.key]));
  const yMax = niceRound(seriesMax * 1.05);

  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;
  const x = (year: number) => PAD.left + (year / inputs.years) * plotW;
  const y = (value: number) => PAD.top + plotH - (value / yMax) * plotH;

  const path = (values: number[]) => values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);
  const xStep = inputs.years <= 10 ? 2 : inputs.years <= 20 ? 5 : 10;
  const xTicks = Array.from({ length: Math.floor(inputs.years / xStep) + 1 }, (_, i) => i * xStep);

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const year = Math.round(((e.clientX - rect.left - PAD.left) / plotW) * inputs.years);
    setHover(Math.min(inputs.years, Math.max(0, year)));
  };

  const note = (key: SeriesKey) =>
    key === "withdraw" && projection.runsOutAtYear != null
      ? `Runs out in ${thisYear + Math.ceil(projection.runsOutAtYear)}`
      : "";

  return (
    <section className="section-container">
      <div className="prediction">
        <div className="prediction-header">
          <span className="prediction-label">Projection</span>
        </div>

        <div className="prediction-rates" role="radiogroup" aria-label="Expected return">
          <label className="prediction-rate">
            <input
              type="radio"
              name="prediction-rate"
              checked={inputs.rateSource === "holdings"}
              onChange={() => update({ rateSource: "holdings" })}
            />
            Expected return {(holdingsRate * 100).toFixed(1)}% a year, based on your holdings
          </label>
          <label className="prediction-rate">
            <input
              type="radio"
              name="prediction-rate"
              checked={inputs.rateSource === "market"}
              onChange={() => update({ rateSource: "market" })}
            />
            Realistic return ~{Math.round(MARKET_RATE * 100)}% a year, based on the S&amp;P 500 long-term average
          </label>
        </div>

        <div className="prediction-legend">
          {visible.map((s) => (
            <div key={s.key} className="prediction-legend-item">
              <span className="prediction-swatch" style={{ backgroundColor: s.color }} />
              <span className="prediction-legend-label">{s.label}</span>
              <span className="prediction-legend-value">{money(projection[s.key][inputs.years])}</span>
              <span className="prediction-legend-note">{note(s.key)}</span>
            </div>
          ))}
        </div>

        <div className="prediction-chart" ref={ref}>
          {width > 0 && (
            <svg
              width={width}
              height={CHART_HEIGHT}
              role="img"
              aria-label={`Projected net worth over ${inputs.years} years`}
              onPointerMove={handlePointer}
              onPointerLeave={() => setHover(null)}
            >
              {yTicks.map((t) => (
                <g key={t}>
                  <line className="prediction-grid" x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} />
                  <text className="prediction-axis" x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle">
                    {money(t)}
                  </text>
                </g>
              ))}
              {xTicks.map((t) => (
                <text
                  key={t}
                  className="prediction-axis"
                  x={x(t)}
                  y={CHART_HEIGHT - 8}
                  textAnchor={t === inputs.years ? "end" : t === 0 ? "start" : "middle"}
                >
                  {thisYear + t}
                </text>
              ))}

              {visible.map((s) => (
                <path key={s.key} d={path(projection[s.key])} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
              ))}

              {hover != null && (
                <g>
                  <line className="prediction-hover" x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} />
                  {visible.map((s) => (
                    <circle key={s.key} cx={x(hover)} cy={y(projection[s.key][hover])} r={4} fill={s.color} />
                  ))}
                </g>
              )}
            </svg>
          )}

          {hover != null && (
            <div
              className="prediction-tooltip"
              style={{ left: Math.min(Math.max(x(hover), 80), width - 80) }}
            >
              <span className="prediction-tooltip-year">{thisYear + hover}</span>
              {visible.map((s) => (
                <span key={s.key} className="prediction-tooltip-row">
                  <span className="prediction-swatch" style={{ backgroundColor: s.color }} />
                  {money(projection[s.key][hover])}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="prediction-controls">
          <Slider
            label="Monthly contribution"
            value={inputs.contribution}
            max={contributionMax}
            display={formatCurrency(inputs.contribution, defaultCurrency)}
            onChange={(v) => update({ contribution: v })}
          />
          <Slider
            label="Monthly withdrawal"
            value={inputs.withdrawal}
            max={withdrawalMax}
            display={formatCurrency(inputs.withdrawal, defaultCurrency)}
            onChange={(v) => update({ withdrawal: v })}
          />
          <Slider
            label="Years"
            value={inputs.years}
            min={1}
            max={MAX_YEARS}
            step={1}
            display={String(inputs.years)}
            onChange={(v) => update({ years: v })}
          />
          <div className="prediction-one-time">
            <label className="field">
              <span className="field-label">One-time withdrawal</span>
              <input
                className="input"
                type="number"
                min={0}
                inputMode="decimal"
                value={inputs.oneTimeAmount || ""}
                placeholder="0"
                onChange={(e) => update({ oneTimeAmount: Math.max(0, Number(e.target.value) || 0) })}
              />
            </label>
            <label className="field">
              <span className="field-label">In year</span>
              <select
                className="input"
                value={Math.min(inputs.oneTimeYear, thisYear + inputs.years)}
                onChange={(e) => update({ oneTimeYear: Number(e.target.value) })}
              >
                {Array.from({ length: inputs.years + 1 }, (_, k) => thisYear + k).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  min = 0,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max: number;
  step?: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="prediction-slider">
      <span className="prediction-slider-head">
        <span className="field-label">{label}</span>
        <span className="prediction-slider-value">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={Math.max(max, value)}
        step={step ?? Math.max(1, max / 100)}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
