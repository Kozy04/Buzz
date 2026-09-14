import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

interface CodeSnippetTabsProps {
    primaryColor: string
    backgroundColor: string
    borderColor: string
    fontSize: number
}

const SNIPPETS = {
    typescript: {
        label: "TypeScript / Node.js",
        filename: "client.ts",
        lines: [
            { num: 1, text: `import { OpenAI } from "openai";`, color: "#8B5CF6" },
            { num: 2, text: ``, color: "#9CA3AF" },
            { num: 3, text: `// ⚡ Point baseURL to your Nexus edge gateway`, color: "#6B7280" },
            { num: 4, text: `const client = new OpenAI({`, color: "#F9FAFB" },
            { num: 5, text: `  apiKey: process.env.NEXUS_API_KEY,`, color: "#00F0FF" },
            { num: 6, text: `  baseURL: "https://gateway.nexus.ai/v1",`, color: "#10B981" },
            { num: 7, text: `  defaultHeaders: {`, color: "#F9FAFB" },
            { num: 8, text: `    "x-nexus-cache": "semantic", // sub-15ms hits`, color: "#F59E0B" },
            { num: 9, text: `    "x-nexus-fallback": "claude-3-5-sonnet",`, color: "#F59E0B" },
            { num: 10, text: `  },`, color: "#F9FAFB" },
            { num: 11, text: `});`, color: "#F9FAFB" },
            { num: 12, text: ``, color: "#9CA3AF" },
            { num: 13, text: `const response = await client.chat.completions.create({`, color: "#8B5CF6" },
            { num: 14, text: `  model: "gpt-4o",`, color: "#00F0FF" },
            { num: 15, text: `  messages: [{ role: "user", content: "Analyze user churn risk." }],`, color: "#10B981" },
            { num: 16, text: `});`, color: "#F9FAFB" },
        ],
        rawText: `import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.NEXUS_API_KEY,
  baseURL: "https://gateway.nexus.ai/v1",
  defaultHeaders: {
    "x-nexus-cache": "semantic",
    "x-nexus-fallback": "claude-3-5-sonnet",
  },
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Analyze user churn risk." }],
});`,
    },
    python: {
        label: "Python",
        filename: "main.py",
        lines: [
            { num: 1, text: `from openai import OpenAI`, color: "#8B5CF6" },
            { num: 2, text: `import os`, color: "#8B5CF6" },
            { num: 3, text: ``, color: "#9CA3AF" },
            { num: 4, text: `# ⚡ Nexus auto-caching and failover gateway`, color: "#6B7280" },
            { num: 5, text: `client = OpenAI(`, color: "#F9FAFB" },
            { num: 6, text: `    api_key=os.environ["NEXUS_API_KEY"],`, color: "#00F0FF" },
            { num: 7, text: `    base_url="https://gateway.nexus.ai/v1",`, color: "#10B981" },
            { num: 8, text: `    default_headers={`, color: "#F9FAFB" },
            { num: 9, text: `        "x-nexus-cache": "semantic",`, color: "#F59E0B" },
            { num: 10, text: `        "x-nexus-fallback": "anthropic/claude-3-5-sonnet",`, color: "#F59E0B" },
            { num: 11, text: `    }`, color: "#F9FAFB" },
            { num: 12, text: `)`, color: "#F9FAFB" },
            { num: 13, text: ``, color: "#9CA3AF" },
            { num: 14, text: `completion = client.chat.completions.create(`, color: "#8B5CF6" },
            { num: 15, text: `    model="gpt-4o",`, color: "#00F0FF" },
            { num: 16, text: `    messages=[{"role": "user", "content": "Analyze user churn risk."}]`, color: "#10B981" },
            { num: 17, text: `)`, color: "#F9FAFB" },
        ],
        rawText: `from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ["NEXUS_API_KEY"],
    base_url="https://gateway.nexus.ai/v1",
    default_headers={
        "x-nexus-cache": "semantic",
        "x-nexus-fallback": "anthropic/claude-3-5-sonnet",
    }
)

completion = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Analyze user churn risk."}]
)`,
    },
    curl: {
        label: "cURL",
        filename: "request.sh",
        lines: [
            { num: 1, text: `curl -X POST "https://gateway.nexus.ai/v1/chat/completions" \\`, color: "#00F0FF" },
            { num: 2, text: `  -H "Authorization: Bearer $NEXUS_API_KEY" \\`, color: "#F9FAFB" },
            { num: 3, text: `  -H "Content-Type: application/json" \\`, color: "#F9FAFB" },
            { num: 4, text: `  -H "x-nexus-cache: semantic" \\`, color: "#F59E0B" },
            { num: 5, text: `  -H "x-nexus-fallback: mistral-large" \\`, color: "#F59E0B" },
            { num: 6, text: `  -d '{`, color: "#10B981" },
            { num: 7, text: `    "model": "gpt-4o",`, color: "#10B981" },
            { num: 8, text: `    "messages": [{"role": "user", "content": "Summarize logs"}]`, color: "#10B981" },
            { num: 9, text: `  }'`, color: "#10B981" },
        ],
        rawText: `curl -X POST "https://gateway.nexus.ai/v1/chat/completions" \\
  -H "Authorization: Bearer $NEXUS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "x-nexus-cache: semantic" \\
  -H "x-nexus-fallback: mistral-large" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Summarize logs"}]
  }'`,
    },
}

export default function CodeSnippetTabs(props: CodeSnippetTabsProps) {
    const {
        primaryColor = "#00F0FF",
        backgroundColor = "#08080A",
        borderColor = "rgba(255, 255, 255, 0.08)",
        fontSize = 13,
    } = props

    const [activeLang, setActiveLang] = React.useState<"typescript" | "python" | "curl">("typescript")
    const [copied, setCopied] = React.useState<boolean>(false)

    const currentSnippet = SNIPPETS[activeLang]

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(currentSnippet.rawText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "760px",
                margin: "0 auto",
                borderRadius: "16px",
                overflow: "hidden",
                background: backgroundColor,
                border: `1px solid ${borderColor}`,
                boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
                boxSizing: "border-box",
            }}
        >
            {/* Top Bar with Tabs and Copy Button */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 16px",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderBottom: `1px solid ${borderColor}`,
                }}
            >
                {/* Language Tabs */}
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {(["typescript", "python", "curl"] as const).map((lang) => {
                        const isActive = activeLang === lang
                        return (
                            <button
                                key={lang}
                                onClick={() => setActiveLang(lang)}
                                style={{
                                    background: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                                    color: isActive ? primaryColor : "#9CA3AF",
                                    border: isActive ? `1px solid rgba(0, 240, 255, 0.3)` : "1px solid transparent",
                                    borderRadius: "8px",
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {SNIPPETS[lang].label}
                            </button>
                        )
                    })}
                </div>

                {/* Filename & Copy Button */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "11px", color: "#6B7280" }}>{currentSnippet.filename}</span>
                    <button
                        onClick={handleCopy}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            background: copied ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.06)",
                            color: copied ? "#10B981" : "#E5E7EB",
                            border: copied ? "1px solid rgba(16, 185, 129, 0.4)" : `1px solid ${borderColor}`,
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                    >
                        {copied ? (
                            <>
                                <span>✓</span>
                                <span>Copied</span>
                            </>
                        ) : (
                            <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                <span>Copy Code</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Code Viewport with Line Numbers */}
            <div
                style={{
                    padding: "20px 16px",
                    overflowX: "auto",
                    lineHeight: 1.6,
                    fontSize: `${fontSize}px`,
                }}
            >
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <tbody>
                        {currentSnippet.lines.map((line) => (
                            <tr key={line.num}>
                                <td
                                    style={{
                                        width: "36px",
                                        textAlign: "right",
                                        paddingRight: "16px",
                                        color: "rgba(255, 255, 255, 0.18)",
                                        userSelect: "none",
                                        fontSize: "12px",
                                        verticalAlign: "top",
                                    }}
                                >
                                    {line.num}
                                </td>
                                <td
                                    style={{
                                        whiteSpace: "pre",
                                        color: line.color,
                                        fontFamily: "'JetBrains Mono', monospace",
                                    }}
                                >
                                    {line.text}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

addPropertyControls(CodeSnippetTabs, {
    primaryColor: {
        type: ControlType.Color,
        title: "Accent Color",
        defaultValue: "#00F0FF",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#08080A",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border Color",
        defaultValue: "rgba(255, 255, 255, 0.08)",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 13,
        min: 11,
        max: 18,
        step: 1,
    },
})
