'use client';

import { useEffect, useState } from 'react';

const InputModal = ({
    isOpen,
    onClose,
    title,
    inputLabel,
    inputType = 'number',
    inputPlaceholder = 'Enter value',
    buttonText = 'Submit',
    onSubmit,
}) => {
    const [value, setValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setValue('');
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (value !== '') {
            onSubmit(value);
            onClose();
        }
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
                {inputLabel && (
                    <label className="mt-4 block font-['DM_Sans',sans-serif] text-sm text-[var(--color-text-secondary)]">
                        {inputLabel}
                    </label>
                )}
                <input
                    type={inputType}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={inputPlaceholder}
                    className="mt-2 w-full rounded-lg border border-[var(--color-gray-300)] px-3 py-2 font-['DM_Sans',sans-serif] text-sm focus:border-[var(--color-gray-300)] focus:ring-1 focus:ring-[var(--color-gray-300)] focus:outline-none"
                    autoFocus
                    required
                />
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={onClose}
                        className="rounded border border-[var(--color-gray-300)] px-4 py-1.5 font-['DM_Sans',sans-serif] text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-gray-100)] hover:cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="rounded bg-[var(--color-primary-light)] px-4 py-1.5 font-['DM_Sans',sans-serif] text-sm font-medium text-[var(--color-white)] transition-colors hover:bg-[var(--color-primary)] hover:cursor-pointer"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputModal;
