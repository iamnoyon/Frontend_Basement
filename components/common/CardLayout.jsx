"use client";
import {
    List,
} from "lucide-react";
import NextLink from "next/link";
import { useSelector } from "react-redux";

export default function CardLayout({
    title,
    titleIcon,
    buttonText,
    buttonHref,
    buttonIcon,
    buttonPermission,
    children,
    className = "",
}) {
    const ButtonIcon = buttonIcon;
    const TitleIcon = titleIcon;
    const userPermissions = useSelector((state) => state?.user?.permissions) || [];
    const hasPermission = (perm) =>
        userPermissions.some((p) =>
            (typeof p === "string" ? p : p.value) === perm
        );
    const canRenderButton = buttonPermission
        ? hasPermission(buttonPermission)
        : !!buttonText;

    return (
        <div
            className={`w-full border min-h-full border-[var(--color-gray-200)] rounded-lg bg-[var(--color-white)] ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between bg-[var(--color-primary)] px-4 py-3 border-b rounded-t-lg">
                {/* Left: Title */}
                <div className="flex items-center gap-2">
                    {titleIcon && <TitleIcon className='text-[var(--color-white)]' size={22} />}
                    <div className="text-lg xl:text-xl text-[var(--color-white)]">
                        {title}
                    </div>
                </div>

                {/* Right: Actions */}
                {
                    canRenderButton && (
                        <div className="flex items-center gap-2">
                            <NextLink
                                href={buttonHref || ''}
                                className="bg-[var(--color-white)] text-[var(--color-primary-dark)] flex items-center gap-1 px-3 py-1 text-base rounded hover:bg-[var(--color-amber-100)]"
                            >
                                {buttonIcon && <ButtonIcon size={20} />}
                                <span>{buttonText}</span>
                            </NextLink>
                        </div>
                    )
                }
            </div>

            {/* Content */}
            <div className="p-4">{children}</div>
        </div>
    );
}