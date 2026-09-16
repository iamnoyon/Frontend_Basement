"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

const DEFAULT_COLORS = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-success)",
    "var(--color-chart-5)",
    "var(--color-chart-6)",
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

export default function ReactLineChart({
    data = { labels: [], datasets: [] },
    title = "",
    height = 360,
    className = "",
    loading = false,
    colors = [],
    smooth = true,
    showArea = false,
    showLegend = true,
    yAxisName = "",
    xAxisName = "",
}) {
    const chartRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        if (loading || !data?.labels?.length || !data?.datasets?.length) return;

        const dom = chartRef.current;
        if (!dom) return;

        if (!instanceRef.current) {
            instanceRef.current = echarts.init(dom, null, {
                renderer: "canvas",
                devicePixelRatio: window.devicePixelRatio || 2,
            });
        }

        const palette = colors.length ? colors : DEFAULT_COLORS;

        const series = data.datasets.map((ds, i) => ({
            name: ds.name,
            type: "line",
            data: ds.data,
            smooth,
            symbol: "circle",
            symbolSize: 6,
            showSymbol: ds.data.length <= 30,
            lineStyle: {
                width: 2.5,
                color: palette[i % palette.length],
            },
            itemStyle: {
                color: palette[i % palette.length],
            },
            areaStyle: showArea
                ? {
                      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                          { offset: 0, color: `${palette[i % palette.length]}40` },
                          { offset: 1, color: `${palette[i % palette.length]}05` },
                      ]),
                  }
                : undefined,
            emphasis: {
                focus: "series",
            },
        }));

        const option = {
            title: title
                ? {
                      text: title,
                      left: 0,
                      top: 0,
                      textStyle: {
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                          fontFamily: "Manrope, sans-serif",
                      },
                  }
                : undefined,

            tooltip: {
                trigger: "axis",
                backgroundColor: "var(--color-tooltip-bg)",
                textStyle: {
                    color: "var(--color-white)",
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 12,
                },
                axisPointer: {
                    type: "cross",
                    crossStyle: {
                        color: "var(--color-mid-gray)",
                    },
                },
            },

            legend: showLegend
                ? {
                      data: data.datasets.map((ds) => ds.name),
                      bottom: 0,
                      textStyle: {
                          fontFamily: "Manrope, sans-serif",
                          fontSize: 11,
                          color: "var(--color-text-body)",
                      },
                      itemWidth: 14,
                      itemHeight: 8,
                      itemGap: 16,
                  }
                : undefined,

            grid: {
                left: 18,
                right: 18,
                top: title ? 45 : 18,
                bottom: showLegend ? 40 : 22,
                containLabel: true,
            },

            xAxis: {
                type: "category",
                data: data.labels,
                boundaryGap: false,
                axisLabel: {
                    color: "var(--color-text-body)",
                    fontSize: 11,
                    fontFamily: "Manrope, sans-serif",
                    rotate: data.labels.length > 12 ? 45 : 0,
                },
                axisLine: {
                    lineStyle: { color: "var(--color-border)" },
                },
                axisTick: { show: false },
                name: xAxisName,
                nameLocation: "middle",
                nameGap: 26,
                nameTextStyle: {
                    color: "var(--color-text-heading)",
                    fontSize: 12,
                    fontFamily: "Manrope, sans-serif",
                },
            },

            yAxis: {
                type: "value",
                axisLabel: {
                    color: "var(--color-text-body)",
                    fontSize: 11,
                    fontFamily: "Manrope, sans-serif",
                },
                axisLine: {
                    lineStyle: { color: "var(--color-border)" },
                },
                splitLine: {
                    lineStyle: { color: "var(--color-bg-muted)" },
                },
                name: yAxisName,
                nameTextStyle: {
                    color: "var(--color-text-heading)",
                    fontSize: 12,
                    fontFamily: "Manrope, sans-serif",
                },
            },

            series,
        };

        instanceRef.current.setOption(option, true);

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
    }, [data, loading, title, colors, smooth, showArea, showLegend, yAxisName, xAxisName]);

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{
                width: "100%",
                height,
                backgroundColor: "var(--color-white)",
                borderRadius: 12,
                boxShadow: "0 2px 8px var(--color-shadow-slate)",
                padding: 8,
            }}
        >
            <style>{fadeInScale}</style>

            {loading ? (
                <div className="absolute inset-0 animate-pulse p-5">
                    {title && (
                        <div className="mb-5 h-4 w-32 rounded bg-[var(--color-gray-200)]" />
                    )}
                    <div className="flex h-[calc(100%-45px)] items-end justify-between gap-3 px-4 pb-8">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-2 rounded-t bg-[var(--color-gray-200)]"
                                style={{ height: `${30 + Math.random() * 50}%` }}
                            />
                        ))}
                    </div>
                    <div className="absolute bottom-4 left-8 right-8 h-px bg-[var(--color-gray-200)]" />
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
