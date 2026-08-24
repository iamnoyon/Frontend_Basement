"use client";

const STATUS_COLORS = {
    healthy: "#16A34A",
    unhealthy: "#EF4444",
    degraded: "#F59E0B",
    warning: "#F59E0B",
    critical: "#EF4444",
    ok: "#16A34A",
    down: "#EF4444",
};

function getValueColor(item) {
    if (item.color) return item.color;
    if (typeof item.value === "string") {
        const key = item.value.toLowerCase();
        return STATUS_COLORS[key] || "#6b7280";
    }
    if (typeof item.value === "number") {
        if (item.value >= 90) return "#EF4444";
        if (item.value >= 70) return "#F59E0B";
        return "#16A34A";
    }
    return "#6b7280";
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
                backgroundColor: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
                padding: 20,
            }}
        >
            {title && (
                <h3
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#111827",
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
                                backgroundColor: "#f9fafb",
                                border: "1px solid #f3f4f6",
                            }}
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <div
                                    style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: "50%",
                                        backgroundColor: "#e5e7eb",
                                    }}
                                />
                                <div
                                    style={{
                                        width: "60%",
                                        height: 12,
                                        borderRadius: 4,
                                        backgroundColor: "#e5e7eb",
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    width: "40%",
                                    height: 20,
                                    borderRadius: 4,
                                    backgroundColor: "#e5e7eb",
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
                                    backgroundColor: "#f9fafb",
                                    border: `1px solid ${color}20`,
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
                                            color: "#6b7280",
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
