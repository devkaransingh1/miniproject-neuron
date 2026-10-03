import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("typescript", typescript);

function CodeBlock({ className = "", children, ...props }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const language = /language-(\w+)/.exec(className)?.[1] || "text";
  const code = String(children).replace(/\n$/, "");

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div className="my-5 overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-[11px] text-white/45">{language}</span>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copyError ? "Copy failed" : copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "#0a0a0a",
          fontSize: "0.8rem",
          lineHeight: 1.7,
        }}
        codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function ChatMarkdown({ content }) {
  return (
    <div className="chat-markdown min-w-0 text-[15px] leading-7 text-white/85">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
              {...props}
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) =>
            className ? (
              <CodeBlock className={className} {...props}>
                {children}
              </CodeBlock>
            ) : (
              <code
                className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[0.85em] text-white/90"
                {...props}
              >
                {children}
              </code>
            ),
          h1: ({ children }) => (
            <h1 className="mb-4 mt-8 text-2xl font-semibold tracking-tight text-white first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-7 text-xl font-semibold tracking-tight text-white first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 text-lg font-semibold text-white first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="my-4 first:mt-0 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="my-4 list-disc space-y-1 pl-6 marker:text-white/40">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 list-decimal space-y-1 pl-6 marker:text-white/40">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-5 border-l-2 border-white/20 pl-4 text-white/60">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-7 border-white/10" />,
          table: ({ children }) => (
            <div className="my-5 overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-white/10 bg-white/[0.03] px-3 py-2 font-medium text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-white/5 px-3 py-2 text-white/70">
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
