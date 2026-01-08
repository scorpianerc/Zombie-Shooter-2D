"use client";

import { useEffect, useRef, useState } from "react";
import { GameConfig } from "@/game/config/GameConfig";

export default function GameComponent() {
    const gameRef = useRef<Phaser.Game | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 1280, height: 720 });

    // Handle window resize
    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    useEffect(() => {
        // Dynamic import Phaser only on client side
        const initGame = async () => {
            const Phaser = (await import("phaser")).default;
            const { BootScene } = await import("@/game/scenes/BootScene");
            const { StartScene } = await import("@/game/scenes/StartScene");
            const { TutorialScene } = await import("@/game/scenes/TutorialScene");
            const { GameScene } = await import("@/game/scenes/GameScene");
            const { GameOverScene } = await import("@/game/scenes/GameOverScene");

            if (gameRef.current) {
                // Update existing game size on resize
                gameRef.current.scale.resize(dimensions.width, dimensions.height);
                return;
            }

            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                width: dimensions.width,
                height: dimensions.height,
                parent: containerRef.current || undefined,
                backgroundColor: GameConfig.backgroundColor,
                physics: {
                    default: "arcade",
                    arcade: {
                        gravity: { x: 0, y: 0 },
                        debug: false,
                    },
                },
                scene: [BootScene, StartScene, TutorialScene, GameScene, GameOverScene],
                scale: {
                    mode: Phaser.Scale.RESIZE,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                    width: "100%",
                    height: "100%",
                },
                render: {
                    pixelArt: false,
                    antialias: true,
                },
            };

            gameRef.current = new Phaser.Game(config);
        };

        initGame();

        // Cleanup on unmount
        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [dimensions]);

    return (
        <div
            ref={containerRef}
            id="game-container"
            style={{
                width: '100vw',
                height: '100vh',
                overflow: 'hidden'
            }}
        />
    );
}
