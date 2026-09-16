"use client";

const STATUS_COLORS = {
    healthy: "var(--color-success)",
    unhealthy: "var(--color-danger)",
    degraded: "var(--color-warning)",
    warning: "var(--color-warning)",
    critical: "var(--color-danger)",
    ok: "var(--color-success)",
    down: "var(--color-danger)",
};

function getValueColor(item) {
    if (item.color) return item.color;
    if (typeof item.value === "string") {
        const key = item.value.toLowerCase();
        return STATUS_COLORS[key] || "var(--color-text-muted)";
    }
    if (typeof item.value === "number") {
        if (item.value >= 90) return "var(--color-danger)";
        if (item.value >= 70) return "var(--color-warning)";
        return "var(--color-success)";
    }
    return "var(--color-text-muted)";
}

function renderValue(item) {
    const { value, suffix } = item;
    if (typeof value === "string") return value;
    if (typeof value === "number") {
        const formatted = value % 1 === 0 ? value.toString() : value.toFixed(2);
        return suffix ? `${formatted}${suffix}` : formatted;
    }
    return value ?? "-";
}

export default function ReactKPICard({
    data = [],
    title = "",
    height = "auto",
    className = "",
    loading = false,
    valueFormatter,
    gridCols = 2,
}) {

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{
                width: "100%",
                height,
                backgroundColor: "var(--color-white)",
                borderRadius: 12,
                boxShadow: "0 2px 8px var(--color-shadow-slate)",
                padding: 20,
            }}
        >
            {title && (
                <h3
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        marginBottom: 16,
                    }}
                >
                    {title}
                </h3>
            )}

            {loading ? (
                <div
                    className="grid gap-3"
                    style={{
                        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                    }}
                >
                    {Array.from({ length: data.length || 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="animate-pulse"
                            style={{
                                padding: 14,
                                borderRadius: 10,
                                backgroundColor: "var(--color-bg-subtle)",
                                border: "1px solid var(--color-bg-muted)",
                            }}
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <div
                                    style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: "50%",
                                        backgroundColor: "var(--color-border)",
                                    }}
                                />
                                <div
                                    style={{
                                        width: "60%",
                                        height: 12,
                                        borderRadius: 4,
                                        backgroundColor: "var(--color-border)",
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    width: "40%",
                                    height: 20,
                                    borderRadius: 4,
                                    backgroundColor: "var(--color-border)",
                                    marginLeft: 20,
                                }}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div
                    className="grid gap-3"
                    style={{
                        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                    }}
                >
                    {data.map((item, index) => {
                        const color = getValueColor(item);

                        return (
                            <div
                                key={item.name || index}
                                style={{
                                    padding: 14,
                                    borderRadius: 10,
                                    backgroundColor: "var(--color-bg-subtle)",
                                    border: `1px solid ${color}`,
                                    borderLeft: `3px solid ${color}`,
                                }}
                            >
                                <div className="mb-1 flex items-center gap-2">
                                    <span
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            backgroundColor: color,
                                            display: "inline-block",
                                            flexShrink: 0,
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: 12,
                                            color: "var(--color-text-muted)",
                                        }}
                                    >
                                        {item.name}
                                    </span>
                                </div>

                                <div className="flex items-end justify-between">
                                    <span
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 700,
                                            color: color,
                                        }}
                                    >
                                        {valueFormatter
                                            ? valueFormatter(item.value)
                                            : renderValue(item)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
