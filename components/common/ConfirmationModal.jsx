'use client';

import { useEffect } from 'react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    title,
    description,
    firstButtonText = 'Confirm',
    secondButtonText = 'Cancel',
    firstButtonAction,
    secondButtonAction,
    firstButtonVariant = 'primary',
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const variantClasses = {
        primary: 'bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] text-[var(--color-white)]',
        danger: 'bg-[var(--color-danger)] hover:bg-[var(--color-danger-strong)] text-[var(--color-white)]',
    };

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-[var(--color-overlay-black-50)]"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm rounded-lg bg-[var(--color-white)] p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-['DM_Sans',sans-serif] text-lg font-semibold text-[var(--color-primary)]">
                    {title}
                </h3>
                {description && (
                    <p className="mt-2 font-['DM_Sans',sans-serif] text-sm text-[var(--color-text-secondary)]">
                        {description}
                    </p>
                )}
                <div className="mt-6 flex items-center justify-end gap-5">
                    <button
                        onClick={secondButtonAction || onClose}
                        className="rounded border border-[var(--color-gray-300)] px-3 py-1.5 font-['DM_Sans',sans-serif] text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-gray-100)] hover:cursor-pointer"
                    >
                        {secondButtonText}
                    </button>
                    <button
                        onClick={firstButtonAction}
                        className={`rounded px-4 py-1.5 font-['DM_Sans',sans-serif] hover:cursor-pointer text-sm font-medium transition-colors ${variantClasses[firstButtonVariant]}`}
                    >
                        {firstButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
