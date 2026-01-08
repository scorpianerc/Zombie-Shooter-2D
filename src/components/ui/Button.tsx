"use client";

import React, { useState } from "react";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    className?: string;
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = "primary",
    size = "md",
    className = "",
    disabled = false,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    const sizeStyles = {
        sm: { fontSize: "0.875rem", padding: "0.5rem 1rem" },
        md: { fontSize: "1.125rem", padding: "0.75rem 2rem" },
        lg: { fontSize: "1.25rem", padding: "1rem 2.5rem" },
    };

    const getVariantStyles = () => {
        const base = {
            primary: {
                background: `linear-gradient(180deg, var(--blood-red), var(--blood-dark))`,
                color: "var(--bone-white)",
                boxShadow: "var(--glow-red)",
            },
            secondary: {
                background: "var(--abyss-light)",
                color: "var(--bone-white)",
            },
            ghost: {
                background: "transparent",
                color: "var(--blood-red)",
                border: "2px solid transparent",
            },
        };

        const hover = {
            primary: {
                background: `linear-gradient(180deg, var(--blood-light), var(--blood-red))`,
                boxShadow: "var(--glow-red), var(--glow-red-lg)",
                transform: "scale(1.1)",
            },
            secondary: {
                background: "var(--blood-dark)",
                transform: "scale(1.05)",
            },
            ghost: {
                color: "var(--blood-light)",
                textDecoration: "underline",
            },
        };

        const active = {
            primary: { transform: "scale(0.95)" },
            secondary: { transform: "scale(0.95)" },
            ghost: { transform: "scale(0.95)" },
        };

        let styles = { ...base[variant] };
        if (isHovered && !disabled) {
            styles = { ...styles, ...hover[variant] };
        }
        if (isActive && !disabled) {
            styles = { ...styles, ...active[variant] };
        }
        return styles;
    };

    const baseStyles: React.CSSProperties = {
        fontFamily: "'Creepster', cursive",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.3s ease-in-out",
        border: "2px solid var(--blood-red)",
        borderRadius: "0.5rem",
        opacity: disabled ? 0.5 : 1,
        ...sizeStyles[size],
        ...getVariantStyles(),
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={className}
            style={baseStyles}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setIsActive(false);
            }}
            onMouseDown={() => setIsActive(true)}
            onMouseUp={() => setIsActive(false)}
        >
            {children}
        </button>
    );
};

export default Button;
