"use client";

import { AEMRequestError, AEMErrorCode } from "@/lib/aem/errors";
import type { ReactElement } from "react";

interface Props {
  error: AEMRequestError | Error | string;
  onRetry?: () => void;
}

const ICONS: Record<AEMErrorCode, ReactElement> = {
  network: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3H8v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" />
    </svg>
  ),
  unauthorized: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  not_found: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  server: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M2 4.75A2.75 2.75 0 0 1 4.75 2h10.5A2.75 2.75 0 0 1 18 4.75v2a2.75 2.75 0 0 1-1.5 2.45v.55A2.75 2.75 0 0 1 13.75 12.5h-.25v2.75a.75.75 0 0 1-1.5 0V12.5H8v2.75a.75.75 0 0 1-1.5 0V12.5h-.25A2.75 2.75 0 0 1 3.5 9.75v-.55A2.75 2.75 0 0 1 2 6.75v-2Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  unknown: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

const TITLES: Record<AEMErrorCode, string> = {
  network: "Cannot reach AEM",
  unauthorized: "Authentication failed",
  not_found: "Content not found",
  server: "AEM server error",
  unknown: "Something went wrong",
};

const HINTS: Record<AEMErrorCode, string> = {
  network:
    "Make sure AEM Author/Publish is running and NEXT_PUBLIC_AEM_HOST points to the correct host.",
  unauthorized:
    "Set AEM_BASIC_AUTH=user:password in .env.local and restart the dev server.",
  not_found:
    "Create a persisted GraphQL query in AEM GraphiQL or verify the Content Fragment path exists.",
  server: "Check the AEM error.log for details.",
  unknown: "",
};

const ChevronIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    className="w-3 h-3 transition-transform duration-200 group-open:rotate-90"
  >
    <path
      fillRule="evenodd"
      d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);

const RetryIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
    <path
      fillRule="evenodd"
      d="M13.836 2.477a.75.75 0 0 1 .75.75V6.75a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1 0-1.5h2.588a3.517 3.517 0 0 0-5.468-.588.75.75 0 1 1-1.078-1.044A5.017 5.017 0 0 1 14.25 6.65V3.227a.75.75 0 0 1-.414-.75ZM1.75 9.5a.75.75 0 0 1 .75-.75H6.25a.75.75 0 0 1 0 1.5H3.662a3.517 3.517 0 0 0 5.468.588.75.75 0 1 1 1.078 1.044A5.017 5.017 0 0 1 1.75 9.35V9.5Z"
      clipRule="evenodd"
    />
  </svg>
);

export function AEMErrorAlert({ error, onRetry }: Props) {
  const aemError = error instanceof AEMRequestError ? error : null;
  const code: AEMErrorCode = aemError?.code ?? "unknown";
  const rawMessage =
    typeof error === "string" ? error : (error as Error).message;
  const description = aemError?.description ?? rawMessage;
  const hint = HINTS[code];
  const hasTechnicalDetails = !!(aemError?.url || rawMessage !== description);

  return (
    <div
      role="alert"
      className="flex overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-900 shadow-xl shadow-black/40"
    >
      {/* Left accent bar */}
      <div className="w-1 shrink-0 bg-red-500" />

      <div className="flex-1 min-w-0 p-5 space-y-4">
        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <span className="text-red-400 shrink-0">{ICONS[code]}</span>
          <span className="text-red-300 font-semibold text-base leading-snug tracking-tight">
            {TITLES[code]}
          </span>
          {aemError?.status && (
            <span className="ml-auto shrink-0 font-mono text-xs bg-red-950 text-red-400 border border-red-800/50 px-2 py-0.5 rounded-full">
              {aemError.status}
            </span>
          )}
        </div>

        {/* ── Human-friendly description ── */}
        <p className="text-zinc-100 text-sm leading-relaxed pl-8">
          {description}
        </p>

        {/* ── What to do ── */}
        {hint && (
          <div className="pl-8 space-y-1">
            <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest">
              What to do
            </p>
            <p className="text-zinc-400 text-xs leading-relaxed">{hint}</p>
          </div>
        )}

        {/* ── Collapsible technical details ── */}
        {hasTechnicalDetails && (
          <div className="pl-8">
            <details className="group">
              <summary className="flex cursor-pointer select-none list-none items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 transition-colors w-fit">
                <ChevronIcon />
                Technical details
              </summary>
              <div className="mt-2 rounded-lg bg-zinc-950 border border-zinc-800 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-zinc-600 text-[10px] font-mono mt-0.5 shrink-0">
                    MSG
                  </span>
                  <p className="font-mono text-xs text-zinc-400 leading-relaxed break-all">
                    {rawMessage}
                  </p>
                </div>
                {aemError?.url && (
                  <div className="flex items-start gap-2">
                    <span className="text-zinc-600 text-[10px] font-mono mt-0.5 shrink-0">
                      URL
                    </span>
                    <p className="font-mono text-xs text-zinc-500 break-all leading-relaxed">
                      {aemError.url}
                    </p>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        {/* ── Retry button ── */}
        {onRetry && (
          <div className="pl-8">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/40 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-900/60 hover:text-red-200 hover:border-red-700 active:scale-[0.97] transition-all duration-150"
            >
              <RetryIcon />
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
