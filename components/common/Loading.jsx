"use client";

export default function Loading({
    variant = "spinner",
    fullPage = false,
    size = "md",
    text = "",
    count = 3,
    className = "",
}) {
    const content = (() => {
        switch (variant) {
            case "dots":
                return <DotsLoader size={size} text={text} className={className} />;
            case "shimmer":
                return <ShimmerBar className={className} />;
            case "skeleton-card":
                return <SkeletonCard count={count} className={className} />;
            case "skeleton-text":
                return <SkeletonText lines={count} className={className} />;
            default:
                return <SpinnerLoader size={size} text={text} className={className} />;
        }
    })();

    if (fullPage) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay-white-80)] backdrop-blur-sm"
                style={{ animation: "fade-slide-in 0.2s ease-out" }}
            >
                {content}
            </div>
        );
    }

    return content;
}

function SpinnerLoader({ size, text, className }) {
    const s = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12", xl: "h-16 w-16" }[size];

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div className={`${s} relative`}>
                <div
                    className={`${s} rounded-full border-2 border-[var(--color-gray-100)] border-t-[var(--color-primary)] animate-spin`}
                />
            </div>
            {text && <p className="text-sm text-[var(--color-gray-500)] font-medium">{text}</p>}
        </div>
    );
}

function DotsLoader({ size, text, className }) {
    const s = { sm: "h-1.5 w-1.5", md: "h-2 w-2", lg: "h-3 w-3", xl: "h-4 w-4" }[size];

    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`${s} rounded-full bg-[var(--color-primary)]`}
                        style={{
                            animation: `bounce-dot 1.4s ease-in-out infinite`,
                            animationDelay: `${i * 0.16}s`,
                        }}
                    />
                ))}
            </div>
            {text && (
                <p className="text-sm text-[var(--color-gray-500)] font-medium tracking-wide">{text}</p>
            )}
        </div>
    );
}

function ShimmerBar({ className }) {
    return (
        <div
            className={`h-1 w-full max-w-[200px] rounded-full bg-[var(--color-gray-100)] overflow-hidden ${className}`}
        >
            <div
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-[var(--color-primary-30)] to-transparent"
                style={{
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s ease-in-out infinite",
                }}
            />
        </div>
    );
}

function SkeletonCard({ count = 3, className }) {
    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-[var(--color-gray-100)] bg-[var(--color-white)] p-5 shadow-sm"
                    style={{ animation: `fade-slide-in 0.3s ease-out ${i * 0.08}s both` }}
                >
                    <div className="mb-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[var(--color-gray-100)] overflow-hidden">
                            <ShimmerBlock />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-3/5 rounded bg-[var(--color-gray-100)] overflow-hidden">
                                <ShimmerBlock />
                            </div>
                            <div className="h-2.5 w-2/5 rounded bg-[var(--color-gray-100)] overflow-hidden">
                                <ShimmerBlock />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        <div className="h-2.5 w-full rounded bg-[var(--color-gray-100)] overflow-hidden">
                            <ShimmerBlock />
                        </div>
                        <div className="h-2.5 w-4/5 rounded bg-[var(--color-gray-100)] overflow-hidden">
                            <ShimmerBlock />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function SkeletonText({ lines = 3, className }) {
    return (
        <div className={`flex flex-col gap-2.5 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`h-3 rounded bg-[var(--color-gray-100)] overflow-hidden ${
                        i === lines - 1 ? "w-3/5" : "w-full"
                    }`}
                    style={{ animation: `fade-slide-in 0.3s ease-out ${i * 0.06}s both` }}
                >
                    <ShimmerBlock />
                </div>
            ))}
        </div>
    );
}

function ShimmerBlock() {
    return (
        <div
            className="h-full w-full"
            style={{
                background:
                    "linear-gradient(90deg, transparent 0%, var(--color-shimmer) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.8s ease-in-out infinite",
            }}
        />
    );
}
