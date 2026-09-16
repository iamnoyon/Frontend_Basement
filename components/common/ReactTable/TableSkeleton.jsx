'use client';

/**
 * TableSkeleton Component
 * 
 * Displays a loading skeleton for tables with customizable column and row counts.
 * 
 * @param {number} columnLength - Number of columns to display (default: 5)
 * @param {number} rowLength - Number of rows to display (default: 5)
 * 
 * @example
 * <TableSkeleton columnLength={5} rowLength={8} />
 */
export default function TableSkeleton({ columnLength = 5, rowLength = 5 }) {
    return (
        <div className="w-full rounded-lg overflow-hidden border border-[var(--color-border)]">
            {/* Table Header Skeleton */}
            <div className="bg-gradient-to-r from-[var(--color-skeleton-1)] to-[var(--color-skeleton-2)] border-b border-[var(--color-skeleton-border)]">
                <div className="flex">
                    {Array.from({ length: columnLength }).map((_, colIndex) => (
                        <div
                            key={`header-${colIndex}`}
                            className="flex-1 px-4 py-4 sm:px-6 sm:py-5"
                        >
                            <div className="h-4 bg-[var(--color-skeleton-accent)] rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Table Body Skeleton */}
            <div className="divide-y divide-[var(--color-border)]">
                {Array.from({ length: rowLength }).map((_, rowIndex) => (
                    <div
                        key={`row-${rowIndex}`}
                        className={`flex ${rowIndex % 2 === 0 ? 'bg-[var(--color-white)]' : 'bg-[var(--color-bg-subtle)]'
                            } hover:bg-[var(--color-bg-muted)] transition-colors`}
                    >
                        {Array.from({ length: columnLength }).map((_, colIndex) => (
                            <div
                                key={`cell-${rowIndex}-${colIndex}`}
                                className="flex-1 px-4 py-4 sm:px-6 sm:py-5"
                            >
                                <div className="h-4 bg-[var(--color-border)] rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="bg-[var(--color-bg-subtle)] px-4 py-4 sm:px-6 sm:py-5 border-t border-[var(--color-border)] flex items-center justify-between">
                <div className="h-4 w-32 bg-[var(--color-border)] rounded animate-pulse"></div>
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-[var(--color-border)] rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-[var(--color-border)] rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-[var(--color-border)] rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
