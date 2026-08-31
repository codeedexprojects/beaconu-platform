"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type CalculatorMode = "basic" | "financial" | "scientific";

interface CalculatorPanelProps {
  open: boolean;
  onClose: () => void;
}

const MODES: { key: CalculatorMode; label: string }[] = [
  { key: "basic", label: "Basic" },
  { key: "financial", label: "Financial" },
  { key: "scientific", label: "Scientific" },
];

function CalcButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 items-center justify-center rounded-xl bg-field text-sm font-medium text-foreground transition-colors hover:bg-field-focus active:scale-95",
        className,
      )}
    >
      {label}
    </button>
  );
}

// Small recursive-descent parser for +, -, *, /, %, and parentheses —
// avoids Function()/eval() entirely so arbitrary code can never run here.
function safeEvaluate(expression: string): number | null {
  const sanitized = expression.replace(/[^0-9+\-*/.()%]/g, "");
  if (!sanitized) return null;

  let pos = 0;

  function peek(): string | undefined {
    return sanitized[pos];
  }

  function parseNumber(): number {
    const start = pos;
    while (pos < sanitized.length && /[0-9.]/.test(sanitized[pos]!)) pos++;
    const token = sanitized.slice(start, pos);
    if (!token || token === ".") throw new Error("Invalid number");
    const value = Number(token);
    if (!Number.isFinite(value)) throw new Error("Invalid number");
    if (peek() === "%") {
      pos++;
      return value / 100;
    }
    return value;
  }

  function parseFactor(): number {
    if (peek() === "(") {
      pos++;
      const value = parseExpression();
      if (peek() !== ")") throw new Error("Missing closing parenthesis");
      pos++;
      return value;
    }
    if (peek() === "-") {
      pos++;
      return -parseFactor();
    }
    if (peek() === "+") {
      pos++;
      return parseFactor();
    }
    return parseNumber();
  }

  function parseTerm(): number {
    let value = parseFactor();
    while (peek() === "*" || peek() === "/") {
      const op = sanitized[pos]!;
      pos++;
      const next = parseFactor();
      value = op === "*" ? value * next : value / next;
    }
    return value;
  }

  function parseExpression(): number {
    let value = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = sanitized[pos]!;
      pos++;
      const next = parseTerm();
      value = op === "+" ? value + next : value - next;
    }
    return value;
  }

  try {
    const result = parseExpression();
    if (pos !== sanitized.length) return null;
    return Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

function BasicCalculator() {
  const [expression, setExpression] = useState("");

  function press(token: string) {
    setExpression((prev) => prev + token);
  }

  function clear() {
    setExpression("");
  }

  function backspace() {
    setExpression((prev) => prev.slice(0, -1));
  }

  function evaluate() {
    const result = safeEvaluate(expression);
    setExpression(result !== null ? String(result) : "Error");
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-field px-4 py-3 text-right">
        <p className="min-h-6 truncate text-lg font-semibold text-foreground">
          {expression || "0"}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <CalcButton
          label="C"
          onClick={clear}
          className="bg-destructive/10 text-destructive"
        />
        <CalcButton label="⌫" onClick={backspace} />
        <CalcButton label="%" onClick={() => press("%")} />
        <CalcButton label="÷" onClick={() => press("/")} />

        <CalcButton label="7" onClick={() => press("7")} />
        <CalcButton label="8" onClick={() => press("8")} />
        <CalcButton label="9" onClick={() => press("9")} />
        <CalcButton label="×" onClick={() => press("*")} />

        <CalcButton label="4" onClick={() => press("4")} />
        <CalcButton label="5" onClick={() => press("5")} />
        <CalcButton label="6" onClick={() => press("6")} />
        <CalcButton label="−" onClick={() => press("-")} />

        <CalcButton label="1" onClick={() => press("1")} />
        <CalcButton label="2" onClick={() => press("2")} />
        <CalcButton label="3" onClick={() => press("3")} />
        <CalcButton label="+" onClick={() => press("+")} />

        <CalcButton
          label="0"
          onClick={() => press("0")}
          className="col-span-2"
        />
        <CalcButton label="." onClick={() => press(".")} />
        <CalcButton
          label="="
          onClick={evaluate}
          className="bg-headerTeal-dark text-white hover:opacity-90"
        />
      </div>
    </div>
  );
}

function ScientificCalculator() {
  const [expression, setExpression] = useState("");

  function press(token: string) {
    setExpression((prev) => prev + token);
  }

  function clear() {
    setExpression("");
  }

  function backspace() {
    setExpression((prev) => prev.slice(0, -1));
  }

  function applyFunction(fn: (n: number) => number) {
    const current = safeEvaluate(expression);
    if (current === null) return;
    setExpression(String(fn(current)));
  }

  function evaluate() {
    const result = safeEvaluate(expression);
    setExpression(result !== null ? String(result) : "Error");
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-field px-4 py-3 text-right">
        <p className="min-h-6 truncate text-lg font-semibold text-foreground">
          {expression || "0"}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <CalcButton
          label="sin"
          onClick={() => applyFunction((n) => Math.sin(n))}
        />
        <CalcButton
          label="cos"
          onClick={() => applyFunction((n) => Math.cos(n))}
        />
        <CalcButton
          label="tan"
          onClick={() => applyFunction((n) => Math.tan(n))}
        />
        <CalcButton
          label="C"
          onClick={clear}
          className="bg-destructive/10 text-destructive"
        />

        <CalcButton
          label="√"
          onClick={() => applyFunction((n) => Math.sqrt(n))}
        />
        <CalcButton label="x²" onClick={() => applyFunction((n) => n * n)} />
        <CalcButton
          label="1/x"
          onClick={() => applyFunction((n) => (n !== 0 ? 1 / n : 0))}
        />
        <CalcButton label="⌫" onClick={backspace} />

        <CalcButton label="7" onClick={() => press("7")} />
        <CalcButton label="8" onClick={() => press("8")} />
        <CalcButton label="9" onClick={() => press("9")} />
        <CalcButton label="÷" onClick={() => press("/")} />

        <CalcButton label="4" onClick={() => press("4")} />
        <CalcButton label="5" onClick={() => press("5")} />
        <CalcButton label="6" onClick={() => press("6")} />
        <CalcButton label="×" onClick={() => press("*")} />

        <CalcButton label="1" onClick={() => press("1")} />
        <CalcButton label="2" onClick={() => press("2")} />
        <CalcButton label="3" onClick={() => press("3")} />
        <CalcButton label="−" onClick={() => press("-")} />

        <CalcButton label="0" onClick={() => press("0")} />
        <CalcButton label="." onClick={() => press(".")} />
        <CalcButton label="π" onClick={() => press(String(Math.PI))} />
        <CalcButton label="+" onClick={() => press("+")} />

        <CalcButton
          label="="
          onClick={evaluate}
          className="col-span-4 bg-headerTeal-dark text-white hover:opacity-90"
        />
      </div>
    </div>
  );
}

function FinancialCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [compoundFrequency, setCompoundFrequency] = useState("1");

  const parsed = useMemo(() => {
    const p = Number(principal);
    const r = Number(rate);
    const t = Number(time);
    const n = Number(compoundFrequency) || 1;
    return { p, r, t, n };
  }, [principal, rate, time, compoundFrequency]);

  const simpleInterest =
    Number.isFinite(parsed.p) &&
    Number.isFinite(parsed.r) &&
    Number.isFinite(parsed.t)
      ? (parsed.p * parsed.r * parsed.t) / 100
      : null;

  const compoundAmount =
    Number.isFinite(parsed.p) &&
    Number.isFinite(parsed.r) &&
    Number.isFinite(parsed.t)
      ? parsed.p * Math.pow(1 + parsed.r / 100 / parsed.n, parsed.n * parsed.t)
      : null;

  function inputCls() {
    return "h-10 w-full rounded-lg border-0 bg-field px-3 text-sm text-foreground outline-none focus:bg-field-focus";
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Principal
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="e.g. 10000"
            className={inputCls()}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Rate (% per year)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 8"
            className={inputCls()}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Time (years)
          </label>
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. 2"
            className={inputCls()}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Compounds / Year
          </label>
          <input
            type="number"
            value={compoundFrequency}
            onChange={(e) => setCompoundFrequency(e.target.value)}
            placeholder="e.g. 1"
            className={inputCls()}
          />
        </div>
      </div>

      <div className="space-y-2 rounded-xl bg-field p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Simple Interest</span>
          <span className="font-semibold text-foreground">
            {simpleInterest !== null ? simpleInterest.toFixed(2) : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Compound Amount</span>
          <span className="font-semibold text-foreground">
            {compoundAmount !== null ? compoundAmount.toFixed(2) : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Compound Interest</span>
          <span className="font-semibold text-foreground">
            {compoundAmount !== null && Number.isFinite(parsed.p)
              ? (compoundAmount - parsed.p).toFixed(2)
              : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CalculatorPanel({ open, onClose }: CalculatorPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<CalculatorMode>("basic");

  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border/60 bg-background p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Calculator
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-foreground"
            aria-label="Close calculator"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 rounded-full bg-field p-1">
          {MODES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMode(item.key)}
              className={cn(
                "flex-1 rounded-full py-2 text-xs font-medium transition-colors",
                mode === item.key
                  ? "bg-headerTeal-dark text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {mode === "basic" ? <BasicCalculator /> : null}
        {mode === "scientific" ? <ScientificCalculator /> : null}
        {mode === "financial" ? <FinancialCalculator /> : null}
      </div>
    </div>,
    document.body,
  );
}
