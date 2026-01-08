"use client";

import React from "react";

interface LoadingScreenProps {
    title?: string;
    loadingText?: string;
    progress?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    title = "ZOMBIE SHOOTER",
    loadingText = "Loading the nightmare...",
    progress = 60,
}) => {
    return (
        <div className="loading-screen">
            <h1 className="loading-title">{title}</h1>
            <div className="loading-bar-container">
                <div
                    className="loading-bar"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="loading-text">{loadingText}</p>
        </div>
    );
};

export default LoadingScreen;
