"use client";

import React from "react";

interface BloodDripProps {
    position: string; // CSS left position, e.g., "10%", "25%"
    delay?: number; // Animation delay in seconds
}

export const BloodDrip: React.FC<BloodDripProps> = ({
    position,
    delay = 0,
}) => {
    return (
        <div
            className="blood-drip"
            style={{
                left: position,
                animationDelay: `${delay}s`,
            }}
        />
    );
};

interface BloodDripsContainerProps {
    count?: number;
}

export const BloodDripsContainer: React.FC<BloodDripsContainerProps> = ({
    count = 5,
}) => {
    const positions = ["10%", "25%", "50%", "75%", "90%"];
    const delays = [0, 1, 2, 0.5, 1.5];

    return (
        <>
            {Array.from({ length: Math.min(count, positions.length) }).map((_, i) => (
                <BloodDrip
                    key={i}
                    position={positions[i]}
                    delay={delays[i]}
                />
            ))}
        </>
    );
};

export default BloodDrip;
