"use client";

import { useState, useEffect } from "react";

export const OrientationPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            // Only show on mobile devices in portrait mode
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const isPortrait = window.innerHeight > window.innerWidth;
            setShowPrompt(isMobile && isPortrait);
        };

        checkOrientation();
        window.addEventListener("resize", checkOrientation);
        window.addEventListener("orientationchange", checkOrientation);

        return () => {
            window.removeEventListener("resize", checkOrientation);
            window.removeEventListener("orientationchange", checkOrientation);
        };
    }, []);

    if (!showPrompt) return null;

    return (
        <div className="orientation-prompt">
            <div className="orientation-content">
                <div className="phone-icon">[  ]</div>
                <div className="rotate-arrow">⟳</div>
                <h2>Putar Perangkat Anda</h2>
                <p>Game ini lebih baik dimainkan dalam mode landscape</p>
            </div>
            <style jsx>{`
                .orientation-prompt {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(10, 10, 10, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                .orientation-content {
                    text-align: center;
                    color: #e8e4d9;
                    font-family: 'Creepster', cursive;
                }
                .phone-icon {
                    font-size: 80px;
                    animation: rotate 2s ease-in-out infinite;
                }
                .rotate-icon {
                    font-size: 40px;
                    color: #8b0000;
                    margin: 20px 0;
                }
                h2 {
                    font-size: 28px;
                    color: #8b0000;
                    margin-bottom: 10px;
                }
                p {
                    font-size: 16px;
                    opacity: 0.8;
                }
                @keyframes rotate {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(90deg); }
                }
            `}</style>
        </div>
    );
};

export default OrientationPrompt;
