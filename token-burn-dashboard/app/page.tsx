"use client";

import { useMemo, useState } from "react";

import rawRows from "../data/daily-burn.json";
import { normalizeRows, type BurnRow } from "../lib/burn-data";
import { getWindowRows, type WindowKey, windows } from "../lib/date-windows";
import {
  fermiScale,
  formatTokens,
  logHeatLevel,
  movingAverageExact7,
  sumExactTokens,
  sumEstimateLow,
  sumEstimateHigh,
  weeklyTotalsExact,
} from "../lib/token-math";

const rows = normalizeRows(rawRows);

export default function TokenBurnDashboard() {
  const [windowKey, setWindowKey] = useState<WindowKey>("180");

  const selectedRows = useMemo(() => getWindowRows(rows, windowKey), [windowKey]);
  
  // EXACT lane calculations
  const totalExact = sumExactTokens(selectedRows);
  const maxExactDay = Math.max(...selectedRows.map((row) => row.exact_total), 1);
  const peakExactDay = selectedRows.reduce(
    (peak, row) => (row.exact_total > peak.exact_total ? row : peak),
    selectedRows[0] || rows[0],
  );
  const lastExactAverage =
    selectedRows.length > 0 ? movingAverageExact7(selectedRows, selectedRows.length - 1) : 0;

  // ESTIMATE lane calculations (summing ranges)
  const totalEstimateLow = sumEstimateLow(selectedRows);
  const totalEstimateHigh = sumEstimateHigh(selectedRows);

  // ACTIVITY lane calculations (summing counts)
  const totalChatGPTConversations = selectedRows.reduce((sum, r) => sum + r.chatgpt_conversations, 0);
  const totalChatGPTMessages = selectedRows.reduce((sum, r) => sum + r.chatgpt_messages, 0);
  const totalChatGPTFiles = selectedRows.reduce((sum, r) => sum + r.chatgpt_files, 0);
  const totalClaudeChatConversations = selectedRows.reduce((sum, r) => sum + r.claude_chat_conversations, 0);
  const totalClaudeChatMessages = selectedRows.reduce((sum, r) => sum + r.claude_chat_messages, 0);
  const totalVSCodeConversations = selectedRows.reduce((sum, r) => sum + r.vscode_chat_conversations, 0);
  const totalVSCodeMessages = selectedRows.reduce((sum, r) => sum + r.vscode_chat_messages, 0);

  // Exact sources
  const totalCodex = selectedRows.reduce((sum, r) => sum + r.codex_tokens, 0);
  const totalClaudeCode = selectedRows.reduce((sum, r) => sum + r.claude_code_tokens, 0);
  const totalAPI = selectedRows.reduce((sum, r) => sum + r.api_tokens, 0);
  const totalAntigravity = selectedRows.reduce((sum, r) => sum + r.antigravity_tokens, 0);
  const totalClaudeCodeCalls = selectedRows.reduce((sum, r) => sum + r.claude_code_calls, 0);

  // Top days (by exact total)
  const topDays = useMemo(() => {
    return [...selectedRows]
      .sort((a, b) => b.exact_total - a.exact_total)
      .slice(0, 5);
  }, [selectedRows]);

  // Same-day strip (latest day)
  const latestDay = selectedRows[selectedRows.length - 1] || null;

  // Drivers calculations (based on exact tokens)
  const drivers = useMemo(() => {
    const totals = new Map<string, { exact: number; low: number; high: number }>();
    for (const r of selectedRows) {
      const current = totals.get(r.driver) || { exact: 0, low: 0, high: 0 };
      totals.set(r.driver, {
        exact: current.exact + r.exact_total,
        low: current.low + r.chat_tokens_low,
        high: current.high + r.chat_tokens_high,
      });
    }
    return Array.from(totals, ([label, vals]) => ({
      label,
      exact: vals.exact,
      low: vals.low,
      high: vals.high,
      share: totalExact ? Math.round((vals.exact / totalExact) * 100) : 0,
    })).sort((a, b) => b.exact - a.exact);
  }, [selectedRows, totalExact]);

  // Weekly trend line of exact totals
  const weekly = weeklyTotalsExact(selectedRows);
  const path = buildTrendPath(weekly.map((week) => week.total));

  // Table rows for moving-average view
  const tableRows = selectedRows.slice(-30).reverse();

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Token burn dashboard (EST Timezone)</p>
          <h1>AI usage by day, source, and driver.</h1>
          <p className="lead">
            Tracking exact local session logs alongside estimated web chat bands. Measured logs, activity metrics, and estimates are strictly separated.
          </p>
        </div>
        <div className="range" aria-label="Select time range">
          {windows.map((windowOption) => (
            <button
              key={windowOption.key}
              type="button"
              aria-pressed={windowKey === windowOption.key}
              onClick={() => setWindowKey(windowOption.key)}
            >
              {windowOption.label}
            </button>
          ))}
        </div>
      </header>

      {/* Fidelity Legend (Always visible) */}
      <section className="fidelity-legend-card" aria-label="Fidelity categories">
        <h3>Data Fidelity Lanes</h3>
        <div className="fidelity-badge-grid">
          <div className="fidelity-badge-item">
            <span className="pill exact">EXACT lane</span>
            <p>Measured logs: Codex, Claude Code, OpenRouter (API), and Antigravity. Real token counts.</p>
          </div>
          <div className="fidelity-badge-item">
            <span className="pill activity-badge">ACTIVITY lane</span>
            <p>Measured counts (conversations, messages, files) from web/app interfaces without token APIs: ChatGPT, Claude Chat, and VSCode Chat.</p>
          </div>
          <div className="fidelity-badge-item">
            <span className="pill estimated">ESTIMATE lane</span>
            <p>Calculated range bands based on message lengths. Always rendered as a low-to-high interval.</p>
          </div>
        </div>
      </section>

      {/* Main summary numbers (EXACT lane) */}
      <section className="stats" aria-label="Exact token burn summary">
        <Metric label="Total Exact Burn" value={formatTokens(totalExact)} note="Measured tokens only" />
        <Metric label="Peak Exact Day" value={formatTokens(peakExactDay?.exact_total || 0)} note={peakExactDay?.date || "n/a"} />
        <Metric label="7d Exact Average" value={formatTokens(lastExactAverage)} note="Moving average" />
        <Metric label="Active Days" value={`${selectedRows.length}`} note="Rows in view" />
      </section>

      {/* Same-day strip (current day) */}
      {latestDay && (
        <section className="panel same-day-strip" aria-label="Current day status">
          <div className="panelHeader">
            <div>
              <p className="label">Current Day Status</p>
              <h2>Latest Logs: {latestDay.date}</h2>
            </div>
            <span className="pill exact">Active</span>
          </div>
          <div className="strip-grid">
            <div className="strip-col">
              <span className="muted">EXACT LANE</span>
              <strong>{formatTokens(latestDay.exact_total)}</strong>
              <span style={{ fontSize: "11px", lineHeight: "1.4" }}>
                Codex: {formatTokens(latestDay.codex_tokens)}
                <br />
                Claude Code: {formatTokens(latestDay.claude_code_tokens)} ({latestDay.claude_code_calls} calls)
                <br />
                OpenRouter API: {formatTokens(latestDay.api_tokens)}
                <br />
                Antigravity: {formatTokens(latestDay.antigravity_tokens)}
              </span>
            </div>
            <div className="strip-col border-left">
              <span className="muted">ACTIVITY LANE</span>
              <strong>
                {latestDay.chatgpt_messages + latestDay.claude_chat_messages + latestDay.vscode_chat_messages} msgs
              </strong>
              <span style={{ fontSize: "11px", lineHeight: "1.4" }}>
                ChatGPT: {latestDay.chatgpt_conversations}c, {latestDay.chatgpt_messages}m, {latestDay.chatgpt_files}f
                <br />
                Claude Chat: {latestDay.claude_chat_conversations}c, {latestDay.claude_chat_messages}m
                <br />
                VSCode Chat: {latestDay.vscode_chat_conversations}c, {latestDay.vscode_chat_messages}m
              </span>
            </div>
            <div className="strip-col border-left">
              <span className="muted">ESTIMATE LANE</span>
              <strong>
                {formatTokens(latestDay.chat_tokens_low)} - {formatTokens(latestDay.chat_tokens_high)}
              </strong>
              <span className="confidence-pill" data-confidence={latestDay.confidence}>
                Fidelity: {latestDay.confidence}
              </span>
            </div>
            <div className="strip-col border-left">
              <span className="muted">DRIVER</span>
              <strong className="driver-text">{latestDay.driver}</strong>
              <span className="evidence-text">{latestDay.evidence || "No evidence logged"}</span>
            </div>
          </div>
        </section>
      )}

      <section className="grid">
        <Panel
          label="Daily exact burn"
          title="Daily Heatmap"
          note="Colored strictly by exact measured tokens on a logarithmic scale."
        >
          <div className="heatmap" aria-label="Daily exact token burn heatmap">
            {selectedRows.map((row) => (
              <span
                key={row.date}
                className={`cell heat${logHeatLevel(row.exact_total, maxExactDay)}`}
                title={`${row.date}: ${formatTokens(row.exact_total)} exact tokens, driver: ${row.driver}`}
              />
            ))}
          </div>
          <div className="legend" aria-hidden>
            <span>less</span>
            {[0, 1, 2, 3, 4, 5].map((level) => (
              <i key={level} className={`heat${level}`} />
            ))}
            <span>more</span>
          </div>
        </Panel>

        <Panel
          label="Weekly trend"
          title="Log-Scaled Trend"
          note="Weekly totals computed strictly from exact measured tokens."
        >
          <div className="trend">
            <svg viewBox="0 0 720 260" role="img" aria-label="Weekly exact token burn trend line">
              <path d="M30 40H690M30 120H690M30 200H690" stroke="rgba(240,236,228,0.12)" />
              <path d={path} fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
        </Panel>
      </section>

      <section className="grid">
        <Panel
          label="Lanes & Sources"
          title="Distribution & Estimations"
          note="Keeping exact, activity, and estimate bands strictly separated."
        >
          <div className="sourceGrid">
            <div className="distribution-block">
              <h3>Exact Lanes (Measured)</h3>
              <div className="source-item">
                <span className="pill exact">Codex Exact</span>
                <strong>{formatTokens(totalCodex)}</strong>
              </div>
              <div className="source-item">
                <span className="pill exact">Claude Code Exact</span>
                <strong>{formatTokens(totalClaudeCode)} <small>({totalClaudeCodeCalls} calls)</small></strong>
              </div>
              <div className="source-item">
                <span className="pill exact">OpenRouter API Exact</span>
                <strong>{formatTokens(totalAPI)}</strong>
              </div>
              <div className="source-item">
                <span className="pill exact">Antigravity Exact</span>
                <strong>{formatTokens(totalAntigravity)}</strong>
              </div>
            </div>

            <div className="distribution-block border-left-p">
              <h3>Estimated Bands (Range)</h3>
              <div className="source-item">
                <span className="pill estimated">Estimates Band</span>
                <strong>
                  {formatTokens(totalEstimateLow)} - {formatTokens(totalEstimateHigh)}
                </strong>
                <span className="muted">Sum of low-high estimates</span>
              </div>
              
              <h3 style={{ marginTop: "16px" }}>Measured Activities</h3>
              <div className="activity-list">
                <div>ChatGPT: <b>{totalChatGPTConversations}</b> conversations, <b>{totalChatGPTMessages}</b> messages, <b>{totalChatGPTFiles}</b> files</div>
                <div>Claude Chat: <b>{totalClaudeChatConversations}</b> conversations, <b>{totalClaudeChatMessages}</b> messages</div>
                <div>VSCode Chat: <b>{totalVSCodeConversations}</b> conversations, <b>{totalVSCodeMessages}</b> messages</div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          label="Drivers"
          title="What is driving exact burn"
          note="Burn driver categories and their exact shares."
        >
          <div className="driverGrid">
            {drivers.map((driver) => (
              <div key={driver.label} className="driver">
                <div className="driver-info">
                  <strong>{driver.label}</strong>
                  <span className="muted-range">({formatTokens(driver.low)} - {formatTokens(driver.high)} est)</span>
                </div>
                <span className="track">
                  <i style={{ width: `${driver.share}%` }} />
                </span>
                <span>{formatTokens(driver.exact)} ({driver.share}%)</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid">
        <Panel
          label="Scale equivalents"
          title="Making exact tokens human"
          note="Approximate read of exact measured tokens with formula details."
        >
          <div className="equivalents">
            {fermiScale(totalExact).map((item) => (
              <div key={item.label} className="equivalent">
                <span className="muted">{item.label}</span>
                <strong>{item.value}</strong>
                <span>{item.note}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          label="Top days"
          title="Peak Usage Events"
          note="Days driven by large shipping or feature spikes."
        >
          <div className="top-days-list">
            {topDays.map((day, idx) => (
              <div key={day.date} className="top-day-item">
                <span className="rank-num">#{idx + 1}</span>
                <div className="top-day-main">
                  <strong>{day.date}</strong>
                  <span>{day.evidence}</span>
                </div>
                <div className="top-day-right">
                  <strong>{formatTokens(day.exact_total)} exact</strong>
                  <span className="muted">Driver: {day.driver}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <p className="label">Moving-average table</p>
            <h2>Daily Operating Table (Last 30 Days)</h2>
          </div>
          <p>Strict lane separation: exact tokens, activity counts, and estimate range bands.</p>
        </div>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Exact Total</th>
                <th>7d Exact Avg</th>
                <th>Codex Ex.</th>
                <th>Claude Code Ex.</th>
                <th>OpenRouter Ex.</th>
                <th>Antigravity Ex.</th>
                <th>ChatGPT Activity</th>
                <th>Claude Chat Act.</th>
                <th>VSCode Activity</th>
                <th>Estimate Band</th>
                <th>Fidelity</th>
                <th>Driver</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => {
                const originalIndex = selectedRows.findIndex((candidate) => candidate.date === row.date);
                return (
                  <tr key={row.date}>
                    <td>
                      <strong>{row.date}</strong>
                    </td>
                    <td>{formatTokens(row.exact_total)}</td>
                    <td>{formatTokens(movingAverageExact7(selectedRows, originalIndex))}</td>
                    <td>{formatTokens(row.codex_tokens)}</td>
                    <td>{formatTokens(row.claude_code_tokens)} <small>({row.claude_code_calls})</small></td>
                    <td>{formatTokens(row.api_tokens)}</td>
                    <td>{formatTokens(row.antigravity_tokens)}</td>
                    <td>
                      <span className="count-group">
                        {row.chatgpt_conversations}c / {row.chatgpt_messages}m / {row.chatgpt_files}f
                      </span>
                    </td>
                    <td>
                      <span className="count-group">
                        {row.claude_chat_conversations}c / {row.claude_chat_messages}m
                      </span>
                    </td>
                    <td>
                      <span className="count-group">
                        {row.vscode_chat_conversations}c / {row.vscode_chat_messages}m
                      </span>
                    </td>
                    <td>
                      {formatTokens(row.chat_tokens_low)} - {formatTokens(row.chat_tokens_high)}
                    </td>
                    <td>
                      <span className="fidelity-tag" data-fidelity={row.confidence}>
                        {row.confidence}
                      </span>
                    </td>
                    <td>{row.driver}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="footerNote">
        <p>
          Data sourced locally from <code>data/daily-burn.json</code>. Commits contain normalized daily totals only. All private logs and path names are scrubbed.
        </p>
      </footer>
    </main>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="stat">
      <span className="label">{label}</span>
      <strong>{value}</strong>
      <span>{note}</span>
    </div>
  );
}

function Panel({
  label,
  title,
  note,
  children,
}: {
  label: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <article className="panel">
      <div className="panelHeader">
        <div>
          <p className="label">{label}</p>
          <h2>{title}</h2>
        </div>
        <p>{note}</p>
      </div>
      {children}
    </article>
  );
}

function buildTrendPath(values: number[]) {
  if (values.length === 0) return "";

  const width = 660;
  const height = 190;
  const left = 30;
  const top = 35;
  const max = Math.max(...values, 1);

  const points = values.map((value, index) => {
    const x = left + (values.length === 1 ? width / 2 : (index / (values.length - 1)) * width);
    const normalized = Math.log10(value + 1) / Math.log10(max + 1);
    const y = top + height - normalized * height;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });

  return `M${points.join(" L")}`;
}
