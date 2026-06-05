module.exports = [
"[project]/token-burn-dashboard/data/daily-burn.json.[json].cjs [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = [
    {
        "date": "2026-05-24",
        "codex_tokens": 184320,
        "claude_code_tokens": 512880,
        "claude_code_calls": 47,
        "api_tokens": 45000,
        "antigravity_tokens": 120000,
        "chatgpt_conversations": 12,
        "chatgpt_messages": 84,
        "chatgpt_files": 3,
        "claude_chat_conversations": 0,
        "claude_chat_messages": 0,
        "vscode_chat_conversations": 2,
        "vscode_chat_messages": 10,
        "chat_tokens_low": 30000,
        "chat_tokens_high": 45000,
        "confidence": "floor",
        "driver": "shipping",
        "evidence": "dashboard build and review"
    }
];
}),
"[project]/token-burn-dashboard/lib/burn-data.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "normalizeRows",
    ()=>normalizeRows
]);
function normalizeRows(rows) {
    return rows.map((row)=>{
        const codex = asNumber(row.codex_tokens);
        const claudeCode = asNumber(row.claude_code_tokens);
        const api = asNumber(row.api_tokens);
        const antigravity = asNumber(row.antigravity_tokens);
        const exact_total = codex + claudeCode + api + antigravity;
        return {
            date: row.date || "",
            codex_tokens: codex,
            claude_code_tokens: claudeCode,
            claude_code_calls: asNumber(row.claude_code_calls),
            api_tokens: api,
            antigravity_tokens: antigravity,
            chatgpt_conversations: asNumber(row.chatgpt_conversations),
            chatgpt_messages: asNumber(row.chatgpt_messages),
            chatgpt_files: asNumber(row.chatgpt_files),
            claude_chat_conversations: asNumber(row.claude_chat_conversations),
            claude_chat_messages: asNumber(row.claude_chat_messages),
            vscode_chat_conversations: asNumber(row.vscode_chat_conversations),
            vscode_chat_messages: asNumber(row.vscode_chat_messages),
            chat_tokens_low: asNumber(row.chat_tokens_low),
            chat_tokens_high: asNumber(row.chat_tokens_high),
            confidence: row.confidence || "rough",
            driver: row.driver || "unlabeled",
            evidence: row.evidence || "",
            exact_total
        };
    }).sort((a, b)=>a.date.localeCompare(b.date));
}
function asNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
}
}),
"[project]/token-burn-dashboard/lib/date-windows.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getWindowRows",
    ()=>getWindowRows,
    "toUtcDate",
    ()=>toUtcDate,
    "windows",
    ()=>windows
]);
const windows = [
    {
        key: "90",
        label: "90d"
    },
    {
        key: "180",
        label: "180d"
    },
    {
        key: "365",
        label: "1y"
    },
    {
        key: "all",
        label: "all"
    }
];
function getWindowRows(rows, windowKey) {
    if (windowKey === "all" || rows.length === 0) return rows;
    const lastDate = toUtcDate(rows[rows.length - 1].date);
    const firstDate = new Date(lastDate);
    firstDate.setUTCDate(firstDate.getUTCDate() - Number(windowKey) + 1);
    return rows.filter((row)=>toUtcDate(row.date) >= firstDate);
}
function toUtcDate(date) {
    return new Date(`${date}T00:00:00.000Z`);
}
}),
"[project]/token-burn-dashboard/lib/token-math.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fermiScale",
    ()=>fermiScale,
    "formatTokens",
    ()=>formatTokens,
    "logHeatLevel",
    ()=>logHeatLevel,
    "movingAverageExact7",
    ()=>movingAverageExact7,
    "sumEstimateHigh",
    ()=>sumEstimateHigh,
    "sumEstimateLow",
    ()=>sumEstimateLow,
    "sumExactTokens",
    ()=>sumExactTokens,
    "weeklyTotalsExact",
    ()=>weeklyTotalsExact
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$date$2d$windows$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/token-burn-dashboard/lib/date-windows.ts [app-ssr] (ecmascript)");
;
function formatTokens(value) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return `${Math.round(value)}`;
}
function sumExactTokens(rows) {
    return rows.reduce((sum, row)=>sum + row.exact_total, 0);
}
function sumEstimateLow(rows) {
    return rows.reduce((sum, row)=>sum + row.chat_tokens_low, 0);
}
function sumEstimateHigh(rows) {
    return rows.reduce((sum, row)=>sum + row.chat_tokens_high, 0);
}
function logHeatLevel(value, max) {
    if (value <= 0 || max <= 0) return 0;
    const level = Math.ceil(Math.log10(value + 1) / Math.log10(max + 1) * 5);
    return Math.max(0, Math.min(5, level));
}
function movingAverageExact7(rows, index) {
    const start = Math.max(0, index - 6);
    const windowRows = rows.slice(start, index + 1);
    return sumExactTokens(windowRows) / windowRows.length;
}
function weeklyTotalsExact(rows) {
    const totals = new Map();
    for (const row of rows){
        const week = startOfIsoWeek(row.date);
        totals.set(week, (totals.get(week) || 0) + row.exact_total);
    }
    return Array.from(totals, ([week, total])=>({
            week,
            total
        })).sort((a, b)=>a.week.localeCompare(b.week));
}
function fermiScale(exactTokens) {
    const words = exactTokens * 0.75;
    const readingHours = words / 250 / 60;
    const novels = words / 90_000;
    return [
        {
            label: "Approx. words",
            value: `${formatTokens(words)}`,
            note: "tokens x 0.75 words"
        },
        {
            label: "Reading time",
            value: `${readingHours.toFixed(1)}h`,
            note: "250 words per minute"
        },
        {
            label: "Novel equivalents",
            value: `${novels.toFixed(2)}`,
            note: "90k words per novel"
        }
    ];
}
function startOfIsoWeek(date) {
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$date$2d$windows$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toUtcDate"])(date);
    const day = (value.getUTCDay() + 6) % 7;
    value.setUTCDate(value.getUTCDate() - day);
    return value.toISOString().slice(0, 10);
}
}),
"[project]/token-burn-dashboard/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TokenBurnDashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/token-burn-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/token-burn-dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$data$2f$daily$2d$burn$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/token-burn-dashboard/data/daily-burn.json.[json].cjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$burn$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/token-burn-dashboard/lib/burn-data.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$date$2d$windows$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/token-burn-dashboard/lib/date-windows.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/token-burn-dashboard/lib/token-math.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$burn$2d$data$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeRows"])(__TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$data$2f$daily$2d$burn$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]);
function TokenBurnDashboard() {
    const [windowKey, setWindowKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("180");
    const selectedRows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$date$2d$windows$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getWindowRows"])(rows, windowKey), [
        windowKey
    ]);
    // EXACT lane calculations
    const totalExact = (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sumExactTokens"])(selectedRows);
    const maxExactDay = Math.max(...selectedRows.map((row)=>row.exact_total), 1);
    const peakExactDay = selectedRows.reduce((peak, row)=>row.exact_total > peak.exact_total ? row : peak, selectedRows[0] || rows[0]);
    const lastExactAverage = selectedRows.length > 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["movingAverageExact7"])(selectedRows, selectedRows.length - 1) : 0;
    // ESTIMATE lane calculations (summing ranges)
    const totalEstimateLow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sumEstimateLow"])(selectedRows);
    const totalEstimateHigh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sumEstimateHigh"])(selectedRows);
    // ACTIVITY lane calculations (summing counts)
    const totalChatGPTConversations = selectedRows.reduce((sum, r)=>sum + r.chatgpt_conversations, 0);
    const totalChatGPTMessages = selectedRows.reduce((sum, r)=>sum + r.chatgpt_messages, 0);
    const totalChatGPTFiles = selectedRows.reduce((sum, r)=>sum + r.chatgpt_files, 0);
    const totalClaudeChatConversations = selectedRows.reduce((sum, r)=>sum + r.claude_chat_conversations, 0);
    const totalClaudeChatMessages = selectedRows.reduce((sum, r)=>sum + r.claude_chat_messages, 0);
    const totalVSCodeConversations = selectedRows.reduce((sum, r)=>sum + r.vscode_chat_conversations, 0);
    const totalVSCodeMessages = selectedRows.reduce((sum, r)=>sum + r.vscode_chat_messages, 0);
    // Exact sources
    const totalCodex = selectedRows.reduce((sum, r)=>sum + r.codex_tokens, 0);
    const totalClaudeCode = selectedRows.reduce((sum, r)=>sum + r.claude_code_tokens, 0);
    const totalAPI = selectedRows.reduce((sum, r)=>sum + r.api_tokens, 0);
    const totalAntigravity = selectedRows.reduce((sum, r)=>sum + r.antigravity_tokens, 0);
    const totalClaudeCodeCalls = selectedRows.reduce((sum, r)=>sum + r.claude_code_calls, 0);
    // Top days (by exact total)
    const topDays = (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return [
            ...selectedRows
        ].sort((a, b)=>b.exact_total - a.exact_total).slice(0, 5);
    }, [
        selectedRows
    ]);
    // Same-day strip (latest day)
    const latestDay = selectedRows[selectedRows.length - 1] || null;
    // Drivers calculations (based on exact tokens)
    const drivers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const totals = new Map();
        for (const r of selectedRows){
            const current = totals.get(r.driver) || {
                exact: 0,
                low: 0,
                high: 0
            };
            totals.set(r.driver, {
                exact: current.exact + r.exact_total,
                low: current.low + r.chat_tokens_low,
                high: current.high + r.chat_tokens_high
            });
        }
        return Array.from(totals, ([label, vals])=>({
                label,
                exact: vals.exact,
                low: vals.low,
                high: vals.high,
                share: totalExact ? Math.round(vals.exact / totalExact * 100) : 0
            })).sort((a, b)=>b.exact - a.exact);
    }, [
        selectedRows,
        totalExact
    ]);
    // Weekly trend line of exact totals
    const weekly = (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["weeklyTotalsExact"])(selectedRows);
    const path = buildTrendPath(weekly.map((week)=>week.total));
    // Table rows for moving-average view
    const tableRows = selectedRows.slice(-30).reverse();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "page",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "hero",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "eyebrow",
                                children: "Token burn dashboard (EST Timezone)"
                            }, void 0, false, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 97,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                children: "AI usage by day, source, and driver."
                            }, void 0, false, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 98,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "lead",
                                children: "Tracking exact local session logs alongside estimated web chat bands. Measured logs, activity metrics, and estimates are strictly separated."
                            }, void 0, false, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 99,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 96,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "range",
                        "aria-label": "Select time range",
                        children: __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$date$2d$windows$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["windows"].map((windowOption)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                className: windowKey === windowOption.key ? "active" : "",
                                "aria-pressed": windowKey === windowOption.key,
                                onClick: ()=>setWindowKey(windowOption.key),
                                children: windowOption.label
                            }, windowOption.key, false, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 105,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "fidelity-legend-card",
                "aria-label": "Fidelity categories",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        children: "Data Fidelity Lanes"
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fidelity-badge-grid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "fidelity-badge-item",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "pill exact",
                                        children: "EXACT lane"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 123,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Measured logs: Codex, Claude Code, OpenRouter (API), and Antigravity. Real token counts."
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 124,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 122,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "fidelity-badge-item",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "pill activity-badge",
                                        children: "ACTIVITY lane"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 127,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Measured counts (conversations, messages, files) from web/app interfaces without token APIs: ChatGPT, Claude Chat, and VSCode Chat."
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 128,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 126,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "fidelity-badge-item",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "pill estimated",
                                        children: "ESTIMATE lane"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 131,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "Calculated range bands based on message lengths. Always rendered as a low-to-high interval."
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 132,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 130,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "stats",
                "aria-label": "Exact token burn summary",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                        label: "Total Exact Burn",
                        value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(totalExact),
                        note: "Measured tokens only"
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 139,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                        label: "Peak Exact Day",
                        value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(peakExactDay?.exact_total || 0),
                        note: peakExactDay?.date || "n/a"
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                        label: "7d Exact Average",
                        value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(lastExactAverage),
                        note: "Moving average"
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Metric, {
                        label: "Active Days",
                        value: `${selectedRows.length}`,
                        note: "Rows in view"
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 138,
                columnNumber: 7
            }, this),
            latestDay && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "panel same-day-strip",
                "aria-label": "Current day status",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panelHeader",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "label",
                                        children: "Current Day Status"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 150,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: [
                                            "Latest Logs: ",
                                            latestDay.date
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 151,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 149,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "pill exact",
                                children: "Active"
                            }, void 0, false, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 153,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 148,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "strip-grid",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "strip-col",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "muted",
                                        children: "EXACT LANE"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 157,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(latestDay.exact_total)
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 158,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "muted-details",
                                        children: [
                                            "Codex: ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(latestDay.codex_tokens),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 161,
                                                columnNumber: 17
                                            }, this),
                                            "Claude Code: ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(latestDay.claude_code_tokens),
                                            " (",
                                            latestDay.claude_code_calls,
                                            " calls)",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 163,
                                                columnNumber: 17
                                            }, this),
                                            "OpenRouter API: ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(latestDay.api_tokens),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 165,
                                                columnNumber: 17
                                            }, this),
                                            "Antigravity: ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(latestDay.antigravity_tokens)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 159,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "strip-col border-left",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "muted",
                                        children: "ACTIVITY LANE"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 170,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: [
                                            latestDay.chatgpt_messages + latestDay.claude_chat_messages + latestDay.vscode_chat_messages,
                                            " msgs"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 171,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "muted-details",
                                        children: [
                                            "ChatGPT: ",
                                            latestDay.chatgpt_conversations,
                                            "c, ",
                                            latestDay.chatgpt_messages,
                                            "m, ",
                                            latestDay.chatgpt_files,
                                            "f",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 176,
                                                columnNumber: 17
                                            }, this),
                                            "Claude Chat: ",
                                            latestDay.claude_chat_conversations,
                                            "c, ",
                                            latestDay.claude_chat_messages,
                                            "m",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 178,
                                                columnNumber: 17
                                            }, this),
                                            "VSCode Chat: ",
                                            latestDay.vscode_chat_conversations,
                                            "c, ",
                                            latestDay.vscode_chat_messages,
                                            "m"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 174,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 169,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "strip-col border-left",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "muted",
                                        children: "ESTIMATE LANE"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 183,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: [
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(latestDay.chat_tokens_low),
                                            " - ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(latestDay.chat_tokens_high)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 184,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "confidence-pill",
                                        "data-confidence": latestDay.confidence,
                                        children: [
                                            "Fidelity: ",
                                            latestDay.confidence
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 187,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 182,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "strip-col border-left",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "muted",
                                        children: "DRIVER"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 192,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        className: "driver-text",
                                        children: latestDay.driver
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 193,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "evidence-text",
                                        children: latestDay.evidence || "No evidence logged"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 194,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 191,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 155,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 147,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Panel, {
                        label: "Daily exact burn",
                        title: "Daily Heatmap",
                        note: "Colored strictly by exact measured tokens on a logarithmic scale.",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "heatmap",
                                "aria-label": "Daily exact token burn heatmap",
                                children: selectedRows.map((row)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `cell heat${(0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["logHeatLevel"])(row.exact_total, maxExactDay)}`,
                                        title: `${row.date}: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(row.exact_total)} exact tokens, driver: ${row.driver}`
                                    }, row.date, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 208,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 206,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "legend",
                                "aria-hidden": true,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "less"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 216,
                                        columnNumber: 13
                                    }, this),
                                    [
                                        0,
                                        1,
                                        2,
                                        3,
                                        4,
                                        5
                                    ].map((level)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                            className: `heat${level}`
                                        }, level, false, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 218,
                                            columnNumber: 15
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "more"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 220,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 215,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 201,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Panel, {
                        label: "Weekly trend",
                        title: "Log-Scaled Trend",
                        note: "Weekly totals computed strictly from exact measured tokens.",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "trend",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                viewBox: "0 0 720 260",
                                role: "img",
                                "aria-label": "Weekly exact token burn trend line",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M30 40H690M30 120H690M30 200H690",
                                        stroke: "rgba(240,236,228,0.12)"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 231,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: path,
                                        fill: "none",
                                        stroke: "var(--accent)",
                                        strokeWidth: "5",
                                        strokeLinecap: "round"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 232,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 230,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                            lineNumber: 229,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 224,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Panel, {
                        label: "Lanes & Sources",
                        title: "Distribution & Estimations",
                        note: "Keeping exact, activity, and estimate bands strictly separated.",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "sourceGrid",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "distribution-block",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            children: "Exact Lanes (Measured)"
                                        }, void 0, false, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 246,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "source-item",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "pill exact",
                                                    children: "Codex Exact"
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 248,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(totalCodex)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 249,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 247,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "source-item",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "pill exact",
                                                    children: "Claude Code Exact"
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 252,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: [
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(totalClaudeCode),
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                            children: [
                                                                "(",
                                                                totalClaudeCodeCalls,
                                                                " calls)"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                            lineNumber: 253,
                                                            columnNumber: 57
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 251,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "source-item",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "pill exact",
                                                    children: "OpenRouter API Exact"
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 256,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(totalAPI)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 257,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 255,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "source-item",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "pill exact",
                                                    children: "Antigravity Exact"
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 260,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(totalAntigravity)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 261,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 259,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                    lineNumber: 245,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "distribution-block border-left-p",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            children: "Estimated Bands (Range)"
                                        }, void 0, false, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 266,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "source-item",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "pill estimated",
                                                    children: "Estimates Band"
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 268,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: [
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(totalEstimateLow),
                                                        " - ",
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(totalEstimateHigh)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 269,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "muted",
                                                    children: "Sum of low-high estimates"
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 272,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 267,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "measured-activities-header",
                                            children: "Measured Activities"
                                        }, void 0, false, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 275,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "activity-list",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "ChatGPT: ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                            children: totalChatGPTConversations
                                                        }, void 0, false, {
                                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                            lineNumber: 277,
                                                            columnNumber: 31
                                                        }, this),
                                                        " conversations, ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                            children: totalChatGPTMessages
                                                        }, void 0, false, {
                                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                            lineNumber: 277,
                                                            columnNumber: 81
                                                        }, this),
                                                        " messages, ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                            children: totalChatGPTFiles
                                                        }, void 0, false, {
                                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                            lineNumber: 277,
                                                            columnNumber: 121
                                                        }, this),
                                                        " files"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 277,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "Claude Chat: ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                            children: totalClaudeChatConversations
                                                        }, void 0, false, {
                                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                            lineNumber: 278,
                                                            columnNumber: 35
                                                        }, this),
                                                        " conversations, ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                            children: totalClaudeChatMessages
                                                        }, void 0, false, {
                                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                            lineNumber: 278,
                                                            columnNumber: 88
                                                        }, this),
                                                        " messages"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 278,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "VSCode Chat: ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                            children: totalVSCodeConversations
                                                        }, void 0, false, {
                                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                            lineNumber: 279,
                                                            columnNumber: 35
                                                        }, this),
                                                        " conversations, ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                                            children: totalVSCodeMessages
                                                        }, void 0, false, {
                                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                            lineNumber: 279,
                                                            columnNumber: 84
                                                        }, this),
                                                        " messages"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 279,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 276,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                    lineNumber: 265,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                            lineNumber: 244,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Panel, {
                        label: "Drivers",
                        title: "What is driving exact burn",
                        note: "Burn driver categories and their exact shares.",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "driverGrid",
                            children: drivers.map((driver, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "driver",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                                            children: `.driver-bar-${idx} { width: ${driver.share}%; }`
                                        }, void 0, false, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 293,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "driver-info",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: driver.label
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 295,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "muted-range",
                                                    children: [
                                                        "(",
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(driver.low),
                                                        " - ",
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(driver.high),
                                                        " est)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 296,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 294,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "track",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("i", {
                                                className: `driver-bar-${idx}`
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 299,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 298,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(driver.exact),
                                                " (",
                                                driver.share,
                                                "%)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 301,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, driver.label, true, {
                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                    lineNumber: 292,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                            lineNumber: 290,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 285,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "grid",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Panel, {
                        label: "Scale equivalents",
                        title: "Making exact tokens human",
                        note: "Approximate read of exact measured tokens with formula details.",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "equivalents",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fermiScale"])(totalExact).map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "equivalent",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "muted",
                                            children: item.label
                                        }, void 0, false, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 317,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: item.value
                                        }, void 0, false, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 318,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: item.note
                                        }, void 0, false, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 319,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, item.label, true, {
                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                    lineNumber: 316,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                            lineNumber: 314,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 309,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Panel, {
                        label: "Top days",
                        title: "Peak Usage Events",
                        note: "Days driven by large shipping or feature spikes.",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "top-days-list",
                            children: topDays.map((day, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "top-day-item",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "rank-num",
                                            children: [
                                                "#",
                                                idx + 1
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 333,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "top-day-main",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: day.date
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 335,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: day.evidence
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 336,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 334,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "top-day-right",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: [
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(day.exact_total),
                                                        " exact"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "muted",
                                                    children: [
                                                        "Driver: ",
                                                        day.driver
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 340,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 338,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, day.date, true, {
                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                    lineNumber: 332,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                            lineNumber: 330,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 325,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 308,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "panel",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "panelHeader",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "label",
                                        children: "Moving-average table"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 351,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: "Daily Operating Table (Last 30 Days)"
                                    }, void 0, false, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 352,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 350,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "Strict lane separation: exact tokens, activity counts, and estimate range bands."
                            }, void 0, false, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 354,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 349,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "tableWrap",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "table",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Date"
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 360,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Exact Total"
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 361,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "7d Exact Avg"
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 362,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Codex Ex."
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 363,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Claude Code Ex."
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 364,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "OpenRouter Ex."
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 365,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Antigravity Ex."
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 366,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "ChatGPT Activity"
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 367,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Claude Chat Act."
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 368,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "VSCode Activity"
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 369,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Estimate Band"
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 370,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Fidelity"
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 371,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                children: "Driver"
                                            }, void 0, false, {
                                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                lineNumber: 372,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                        lineNumber: 359,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                    lineNumber: 358,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: tableRows.map((row)=>{
                                        const originalIndex = selectedRows.findIndex((candidate)=>candidate.date === row.date);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        children: row.date
                                                    }, void 0, false, {
                                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                        lineNumber: 381,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 380,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(row.exact_total)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 383,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["movingAverageExact7"])(selectedRows, originalIndex))
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 384,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(row.codex_tokens)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 385,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: [
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(row.claude_code_tokens),
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                                            children: [
                                                                "(",
                                                                row.claude_code_calls,
                                                                ")"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                            lineNumber: 386,
                                                            columnNumber: 64
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 386,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(row.api_tokens)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 387,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(row.antigravity_tokens)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 388,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "count-group",
                                                        children: [
                                                            row.chatgpt_conversations,
                                                            "c / ",
                                                            row.chatgpt_messages,
                                                            "m / ",
                                                            row.chatgpt_files,
                                                            "f"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                        lineNumber: 390,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 389,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "count-group",
                                                        children: [
                                                            row.claude_chat_conversations,
                                                            "c / ",
                                                            row.claude_chat_messages,
                                                            "m"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                        lineNumber: 395,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 394,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "count-group",
                                                        children: [
                                                            row.vscode_chat_conversations,
                                                            "c / ",
                                                            row.vscode_chat_messages,
                                                            "m"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                        lineNumber: 400,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 399,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: [
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(row.chat_tokens_low),
                                                        " - ",
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$lib$2f$token$2d$math$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatTokens"])(row.chat_tokens_high)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 404,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "fidelity-tag",
                                                        "data-fidelity": row.confidence,
                                                        children: row.confidence
                                                    }, void 0, false, {
                                                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                        lineNumber: 408,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 407,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    children: row.driver
                                                }, void 0, false, {
                                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                                    lineNumber: 412,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, row.date, true, {
                                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                            lineNumber: 379,
                                            columnNumber: 19
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                    lineNumber: 375,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                            lineNumber: 357,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 356,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 348,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "footerNote",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    children: [
                        "Data sourced locally from ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            children: "data/daily-burn.json"
                        }, void 0, false, {
                            fileName: "[project]/token-burn-dashboard/app/page.tsx",
                            lineNumber: 423,
                            columnNumber: 37
                        }, this),
                        ". Commits contain normalized daily totals only. All private logs and path names are scrubbed."
                    ]
                }, void 0, true, {
                    fileName: "[project]/token-burn-dashboard/app/page.tsx",
                    lineNumber: 422,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 421,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/token-burn-dashboard/app/page.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
}
function Metric({ label, value, note }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "stat",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "label",
                children: label
            }, void 0, false, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 433,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                children: value
            }, void 0, false, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 434,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: note
            }, void 0, false, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 435,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/token-burn-dashboard/app/page.tsx",
        lineNumber: 432,
        columnNumber: 5
    }, this);
}
function Panel({ label, title, note, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "panel",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "panelHeader",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "label",
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 455,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                                lineNumber: 456,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 454,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$token$2d$burn$2d$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: note
                    }, void 0, false, {
                        fileName: "[project]/token-burn-dashboard/app/page.tsx",
                        lineNumber: 458,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/token-burn-dashboard/app/page.tsx",
                lineNumber: 453,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/token-burn-dashboard/app/page.tsx",
        lineNumber: 452,
        columnNumber: 5
    }, this);
}
function buildTrendPath(values) {
    if (values.length === 0) return "";
    const width = 660;
    const height = 190;
    const left = 30;
    const top = 35;
    const max = Math.max(...values, 1);
    const points = values.map((value, index)=>{
        const x = left + (values.length === 1 ? width / 2 : index / (values.length - 1) * width);
        const normalized = Math.log10(value + 1) / Math.log10(max + 1);
        const y = top + height - normalized * height;
        return `${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return `M${points.join(" L")}`;
}
}),
];

//# sourceMappingURL=token-burn-dashboard_192k70x._.js.map