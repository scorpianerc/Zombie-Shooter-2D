"use client";

import dynamic from "next/dynamic";
import { GameContainer, LoadingScreen } from "@/components";

// Dynamically import Phaser game component (client-side only)
const GameComponent = dynamic(() => import("@/components/GameComponent"), {
    ssr: false,
    loading: () => <LoadingScreen />,
});

export default function Home() {
    return (
        <GameContainer>
            <GameComponent />
        </GameContainer>
    );
}
