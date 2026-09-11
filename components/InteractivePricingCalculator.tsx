import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

interface PricingCalculatorProps {
    primaryColor: string
    accentColor: string
    backgroundColor: string
    cardBorderColor: string
    textColor: string
    mutedTextColor: string
    annualDiscount: number
    ctaText: string
    ctaLink: string
}

export default function InteractivePricingCalculator(props: PricingCalculatorProps) {
    const {
        primaryColor = "#00F0FF",
        accentColor = "#8B5CF6",
        backgroundColor = "#0E0E12",
        cardBorderColor = "rgba(255, 255, 255, 0.08)",
        textColor = "#F9FAFB",
        mutedTextColor = "#9CA3AF",
        annualDiscount = 20,
        ctaText = "Deploy Your Gateway",
        ctaLink = "#pricing",
    } = props

    // State for request volume (in thousands of requests)
    const [requestsK, setRequestsK] = React.useState<number>(500)
    const [isAnnual, setIsAnnual] = React.useState<boolean>(true)

    // Calculation logic
    // Base cost without caching: ~$0.0004 per raw un-cached call
    // With Nexus: 55% average cache hit rate saves 55% of upstream API costs
    const monthlyCalls = requestsK * 1000
    const vanillaMonthlyCost = monthlyCalls * 0.00035
    
    // Nexus Gateway Tier Pricing
    let basePlanCost = 0
    let planName = "Developer"
    if (requestsK <= 100) {
        basePlanCost = 0
        planName = "Hobby Free"
    } else if (requestsK <= 1500) {
        basePlanCost = isAnnual ? 39 : 49
        planName = "Pro Starter"
    } else if (requestsK <= 5000) {
        basePlanCost = isAnnual ? 159 : 199
        planName = "Scale Pro"
    } else {
        basePlanCost = isAnnual ? 399 : 499
        planName = "Enterprise Edge"
    }

    const estimatedSavings = Math.max(0, Math.round(vanillaMonthlyCost * 0.58 - basePlanCost))
    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}M`
        }
        return `${num}K`
    }

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "760px",
                margin: "0 auto",
                padding: "36px 32px",
                borderRadius: "20px",
                background: backgroundColor,
                border: `1px solid ${cardBorderColor}`,
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                color: textColor,
                fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                boxSizing: "border-box",
            }}
        >
            {/* Header with Title & Annual/Monthly Toggle */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginBottom: "28px",
                }}
            >
                <div>
                    <span
                        style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: primaryColor,
                            textTransform: "uppercase",
                        }}
                    >
                        ROI & COST ESTIMATOR
                    </span>
                    <h3
                        style={{
                            fontSize: "22px",
                            fontWeight: 700,
                            margin: "6px 0 0 0",
                            color: textColor,
                        }}
                    >
                        Estimate Your Savings
                    </h3>
                </div>

                {/* Billing Toggle Switch */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        background: "rgba(255, 255, 255, 0.05)",
                        padding: "4px",
                        borderRadius: "30px",
                        border: `1px solid ${cardBorderColor}`,
                    }}
                >
                    <button
                        onClick={() => setIsAnnual(false)}
                        style={{
                            background: !isAnnual ? "rgba(255, 255, 255, 0.12)" : "transparent",
                            color: !isAnnual ? textColor : mutedTextColor,
                            border: "none",
                            borderRadius: "20px",
                            padding: "6px 14px",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setIsAnnual(true)}
                        style={{
                            background: isAnnual ? primaryColor : "transparent",
                            color: isAnnual ? "#08080A" : mutedTextColor,
                            border: "none",
                            borderRadius: "20px",
                            padding: "6px 14px",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        Annual
                        <span
                            style={{
                                background: isAnnual ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 240, 255, 0.15)",
                                color: isAnnual ? "#08080A" : primaryColor,
                                padding: "2px 6px",
                                borderRadius: "10px",
                                fontSize: "10px",
                                fontWeight: 800,
                            }}
                        >
                            SAVE {annualDiscount}%
                        </span>
                    </button>
                </div>
            </div>

            {/* Slider Section */}
            <div style={{ marginBottom: "32px" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        marginBottom: "12px",
                    }}
                >
                    <span style={{ fontSize: "14px", color: mutedTextColor, fontWeight: 500 }}>
                        Estimated Monthly LLM Requests
                    </span>
                    <span
                        style={{
                            fontSize: "24px",
                            fontWeight: 800,
                            color: primaryColor,
                            fontFamily: "JetBrains Mono, monospace",
                        }}
                    >
                        {formatNumber(requestsK)}
                        <span style={{ fontSize: "14px", fontWeight: 500, color: mutedTextColor, marginLeft: "4px" }}>
                            calls / mo
                        </span>
                    </span>
                </div>

                <input
                    type="range"
                    min="50"
                    max="8000"
                    step="50"
                    value={requestsK}
                    onChange={(e) => setRequestsK(Number(e.target.value))}
                    style={{
                        width: "100%",
                        height: "8px",
                        borderRadius: "4px",
                        background: `linear-gradient(to right, ${primaryColor} 0%, ${accentColor} ${(requestsK / 8000) * 100}%, rgba(255, 255, 255, 0.1) ${(requestsK / 8000) * 100}%)`,
                        appearance: "none",
                        outline: "none",
                        cursor: "pointer",
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        color: mutedTextColor,
                        marginTop: "8px",
                    }}
                >
                    <span>50K Calls</span>
                    <span>2M Calls</span>
                    <span>5M Calls</span>
                    <span>8M+ Calls</span>
                </div>
            </div>

            {/* Dynamic Results Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    marginBottom: "28px",
                }}
            >
                {/* Result Card 1: Plan */}
                <div
                    style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        border: `1px solid ${cardBorderColor}`,
                        padding: "16px",
                        borderRadius: "14px",
                    }}
                >
                    <div style={{ fontSize: "12px", color: mutedTextColor, marginBottom: "4px" }}>
                        Recommended Tier
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: textColor }}>
                        {planName}
                    </div>
                    <div style={{ fontSize: "13px", color: primaryColor, marginTop: "4px", fontWeight: 600 }}>
                        ${basePlanCost} / month
                    </div>
                </div>

                {/* Result Card 2: Estimated Savings */}
                <div
                    style={{
                        background: "linear-gradient(135deg, rgba(0, 240, 255, 0.06) 0%, rgba(139, 92, 246, 0.06) 100%)",
                        border: "1px solid rgba(0, 240, 255, 0.25)",
                        padding: "16px",
                        borderRadius: "14px",
                    }}
                >
                    <div style={{ fontSize: "12px", color: primaryColor, fontWeight: 600, marginBottom: "4px" }}>
                        Estimated Net Savings
                    </div>
                    <div
                        style={{
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "#10B981",
                            fontFamily: "JetBrains Mono, monospace",
                        }}
                    >
                        +${estimatedSavings.toLocaleString()}
                        <span style={{ fontSize: "12px", fontWeight: 500, color: mutedTextColor }}> / mo</span>
                    </div>
                    <div style={{ fontSize: "11px", color: mutedTextColor, marginTop: "4px" }}>
                        Via semantic edge caching (55% avg hit)
                    </div>
                </div>
            </div>

            {/* CTA Button */}
            <a
                href={ctaLink}
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    padding: "14px 20px",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                    color: "#08080A",
                    fontSize: "14px",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 20px rgba(0, 240, 255, 0.3)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    cursor: "pointer",
                    boxSizing: "border-box",
                }}
            >
                {ctaText} →
            </a>
        </div>
    )
}

addPropertyControls(InteractivePricingCalculator, {
    primaryColor: {
        type: ControlType.Color,
        title: "Primary Color",
        defaultValue: "#00F0FF",
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent Glow",
        defaultValue: "#8B5CF6",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#0E0E12",
    },
    cardBorderColor: {
        type: ControlType.Color,
        title: "Border Color",
        defaultValue: "rgba(255, 255, 255, 0.08)",
    },
    annualDiscount: {
        type: ControlType.Number,
        title: "Discount %",
        defaultValue: 20,
        min: 0,
        max: 50,
        step: 5,
    },
    ctaText: {
        type: ControlType.String,
        title: "Button Text",
        defaultValue: "Deploy Your Gateway",
    },
    ctaLink: {
        type: ControlType.String,
        title: "Button URL",
        defaultValue: "#pricing",
    },
})
