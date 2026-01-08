"use client";

import React from "react";

interface GameContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const GameContainer: React.FC<GameContainerProps> = ({
    children,
    className = "",
}) => {
    return (
        <main className={`game-container ${className}`}>
            <div className="game-canvas-wrapper">
                {children}
            </div>
        </main>
    );
};

export default GameContainer;
