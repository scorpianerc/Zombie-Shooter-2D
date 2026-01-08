"use client";

import * as Phaser from "phaser";
import { GameConfig } from "../config/GameConfig";
import { PowerUpType } from "../objects/PowerUp";

export class UIManager {
    private scene: Phaser.Scene;
    private scoreText!: Phaser.GameObjects.Text;
    private waveText!: Phaser.GameObjects.Text;
    private healthBar!: Phaser.GameObjects.Graphics;
    private pauseMenu!: Phaser.GameObjects.Container;
    private powerUpIndicators!: Phaser.GameObjects.Container;
    private crosshair!: Phaser.GameObjects.Image; // Managed here for visibility

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    createUI(width: number, height: number) {
        // Score Text
        this.scoreText = this.scene.add.text(20, 20, "Score: 0", {
            fontFamily: GameConfig.fonts.nosifer,
            fontSize: "32px",
            color: "#ff0000",
        });
        this.scoreText.setShadow(2, 2, "#000000", 2, true, true);
        this.scoreText.setDepth(100);

        // Wave Text
        this.waveText = this.scene.add
            .text(width / 2, 40, "WAVE 1", {
                fontFamily: GameConfig.fonts.creepster,
                fontSize: "48px",
                color: "#e8e4d9",
            })
            .setOrigin(0.5);
        this.waveText.setShadow(2, 2, "#000000", 4, true, true);
        this.waveText.setDepth(100);

        // Health Bar
        this.healthBar = this.scene.add.graphics();
        this.healthBar.setDepth(100);
        this.updateHealthBar(100, 100);

        // PowerUp Indicators
        this.powerUpIndicators = this.scene.add.container(20, 80);
        this.powerUpIndicators.setDepth(100);

        // Pause Menu
        this.createPauseMenu(width, height);
    }

    updateScore(score: number) {
        this.scoreText.setText(`Score: ${score}`);
    }

    updateWave(wave: number) {
        this.waveText.setText(`WAVE ${wave}`);
    }

    updateHealthBar(current: number, max: number) {
        this.healthBar.clear();

        // Background
        this.healthBar.fillStyle(0x000000, 0.5);
        this.healthBar.fillRect(20, 60, 200, 20);

        // Health
        const percent = Phaser.Math.Clamp(current / max, 0, 1);

        if (percent > 0.6) {
            this.healthBar.fillStyle(0x00ff00, 1);
        } else if (percent > 0.3) {
            this.healthBar.fillStyle(0xffff00, 1);
        } else {
            this.healthBar.fillStyle(0xff0000, 1);
        }

        this.healthBar.fillRect(20, 60, 200 * percent, 20);
    }

    createPauseMenu(width: number, height: number) {
        this.pauseMenu = this.scene.add.container(0, 0);
        this.pauseMenu.setDepth(1000); // Highest depth
        this.pauseMenu.setVisible(false);
        this.pauseMenu.setScrollFactor(0); // Fixed position

        // Overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, width, height);

        // Menu Panel
        const panel = this.scene.add.graphics();
        panel.fillStyle(0x1a1a1a, 0.9);
        panel.fillRoundedRect(width / 2 - 150, height / 2 - 150, 300, 300, 20);
        panel.lineStyle(4, 0x8b0000, 1);
        panel.strokeRoundedRect(width / 2 - 150, height / 2 - 150, 300, 300, 20);

        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 100, "PAUSED", {
            fontFamily: GameConfig.fonts.nosifer,
            fontSize: "48px",
            color: "#e8e4d9",
        }).setOrigin(0.5);

        this.pauseMenu.add([overlay, panel, title]);

        // Resume Button
        this.createPauseButton(width / 2, height / 2, "RESUME", () => {
            // We need to trigger the scene resume
            this.scene.events.emit("resumeGame");
        });

        // Exit Button
        this.createPauseButton(width / 2, height / 2 + 80, "EXIT", () => {
            this.scene.events.emit("exitGame");
        });
    }

    private createPauseButton(x: number, y: number, text: string, callback: () => void) {
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x8b0000, 1);
        bg.fillRoundedRect(-100, -30, 200, 60, 10);

        const btnText = this.scene.add.text(0, 0, text, {
            fontFamily: GameConfig.fonts.creepster,
            fontSize: "32px",
            color: "#e8e4d9",
        }).setOrigin(0.5);

        const container = this.scene.add.container(x, y, [bg, btnText]);
        container.setSize(200, 60);
        container.setInteractive({ useHandCursor: true });

        container.on("pointerover", () => {
            btnText.setColor("#ffffff");
            container.setScale(1.1);
        });

        container.on("pointerout", () => {
            btnText.setColor("#e8e4d9");
            container.setScale(1);
        });

        container.on("pointerdown", callback);

        this.pauseMenu.add(container);
    }

    togglePauseMenu(show: boolean) {
        this.pauseMenu.setVisible(show);
    }

    updatePowerUpIndicators(activeEffects: string[]) {
        this.powerUpIndicators.removeAll(true);

        activeEffects.forEach((effect, index) => {
            const icon = this.scene.add.image(index * 35, 10, `powerup_${effect}`).setScale(0.8);
            this.powerUpIndicators.add(icon);
        });
    }

    showWaveAnnouncement(wave: number, onComplete?: () => void) {
        const { width, height } = this.scene.cameras.main;
        const announcement = this.scene.add
            .text(width / 2, height / 2 - 50, `WAVE ${wave}`, {
                fontFamily: GameConfig.fonts.nosifer,
                fontSize: "72px",
                color: "#ff0000",
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(200);

        announcement.setShadow(4, 4, "#000000", 5, true, true);

        // Entrance
        this.scene.tweens.add({
            targets: announcement,
            alpha: 1,
            scale: { from: 0.5, to: 1.2 },
            duration: 1000,
            ease: "Bounce.easeOut",
            onComplete: () => {
                // Exit
                this.scene.tweens.add({
                    targets: announcement,
                    alpha: 0,
                    scale: 2,
                    duration: 500,
                    delay: 1000,
                    onComplete: () => {
                        announcement.destroy();
                        if (onComplete) onComplete();
                    }
                });
            },
        });
    }

    showPowerUpText(x: number, y: number, type: PowerUpType) {
        let textStr = "";
        let color = "";

        if (type === "health") { textStr = "+HEALTH"; color = "#00ff00"; }
        else if (type === "speed") { textStr = "SPEED UP"; color = "#ffff00"; }
        else if (type === "rapidFire") { textStr = "RAPID FIRE"; color = "#ff0000"; }
        else if (type === "shield") { textStr = "SHIELD"; color = "#00ffff"; }

        const text = this.scene.add.text(x, y - 20, textStr, {
            fontFamily: GameConfig.fonts.special,
            fontSize: "16px",
            color: color,
            stroke: "#000000",
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(150);

        this.scene.tweens.add({
            targets: text,
            y: y - 70,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy()
        });
    }
}
