"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

const DEFAULT_COLORS = [
    "#0DB8F5",
    "#E91E63",
    "#FFA854",
    "#795548",
    "#607D8B",
    "#E91E63",
];

const fadeInScale = `
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
`;

export default function ReactPieChart({
    data = [],
    title = "",
    height = 360,
    className = "",
    loading = false,
    colors = [],
    radius = "50%",
    name = "Access From",
}) {
    const chartRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        if (loading || !data?.length) return;

        const dom = chartRef.current;
        if (!dom) return;

        if (!instanceRef.current) {
            instanceRef.current = echarts.init(dom, null, { renderer: 'canvas', devicePixelRatio: window.devicePixelRatio || 2 });
        }

        const option = {
            title: {
                text: title,
                left: "center",
                textStyle: {
                    fontFamily: "Manrope, sans-serif",
                },
            },

            tooltip: {
                trigger: "item",
                textStyle: {
                    fontFamily: "Manrope, sans-serif",
                },
            },

            legend: {
                orient: "vertical",
                left: "left",
                textStyle: {
                    fontFamily: "Manrope, sans-serif",
                },
            },

            color: colors.length
                ? colors
                : data.map((item) => item.color).filter(Boolean).length
                    ? data.map((item) => item.color).filter(Boolean)
                    : DEFAULT_COLORS,

            series: [
                {
                    name,
                    type: "pie",
                    radius,
                    data,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: "rgba(0, 0, 0, 0.5)",
                        },
                    },
                },
            ],
        };

        instanceRef.current.setOption(option);

        const handleResize = () => {
            instanceRef.current?.resize();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (instanceRef.current && dom.isConnected) {
                try {
                    instanceRef.current.dispose();
                } catch {}
                instanceRef.current = null;
            }
        };
    }, [data, loading, title, colors, radius, name]);

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{
                width: "100%",
                height,
                backgroundColor: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
                padding: 8,
            }}
        >
            <style>{fadeInScale}</style>

            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="animate-pulse rounded-full"
                        style={{
                            width: "60%",
                            height: "60%",
                            maxWidth: 200,
                            maxHeight: 200,
                            background:
                                "conic-gradient(#e5e7eb 0deg 90deg, #f3f4f6 90deg 180deg, #e5e7eb 180deg 270deg, #f3f4f6 270deg 360deg)",
                            borderRadius: "50%",
                        }}
                    />
                </div>
            ) : (
                <div
                    ref={chartRef}
                    style={{
                        width: "100%",
                        height: "100%",
                        animation: "fadeInScale 0.45s ease-out",
                    }}
                />
            )}
        </div>
    );
}
