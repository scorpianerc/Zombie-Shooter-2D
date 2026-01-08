import * as Phaser from "phaser";
import { GameConfig } from "../config/GameConfig";

interface GameOverData {
    score: number;
    wave: number;
}

interface ScoreRecord {
    score: number;
    wave: number;
    date: string;
}

export class GameOverScene extends Phaser.Scene {
    private finalScore: number = 0;
    private finalWave: number = 1;
    private scoreHistory: ScoreRecord[] = [];

    constructor() {
        super({ key: "GameOverScene" });
    }

    init(data: GameOverData) {
        this.finalScore = data.score || 0;
        this.finalWave = data.wave || 1;

        // Save score to history
        this.saveScore();
    }

    saveScore() {
        // Load existing history from localStorage
        try {
            const saved = localStorage.getItem("zombieShooterScores");
            this.scoreHistory = saved ? JSON.parse(saved) : [];
        } catch {
            this.scoreHistory = [];
        }

        // Add new score
        const newRecord: ScoreRecord = {
            score: this.finalScore,
            wave: this.finalWave,
            date: new Date().toLocaleDateString(),
        };
        this.scoreHistory.unshift(newRecord);

        // Keep only top 5 scores
        this.scoreHistory = this.scoreHistory
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        // Save back to localStorage
        try {
            localStorage.setItem("zombieShooterScores", JSON.stringify(this.scoreHistory));
        } catch {
            // localStorage not available
        }
    }

    create() {
        const { width, height } = this.cameras.main;
        const { fonts } = GameConfig;

        // Detect mobile for responsive sizing
        const isMobile = width < 600 || this.sys.game.device.input.touch;
        const scale = isMobile ? 0.7 : 1;

        // Dark red background
        this.cameras.main.setBackgroundColor("#1a0000");

        // Create blood drip effects
        for (let i = 0; i < 12; i++) {
            const x = (width / 13) * (i + 1);
            this.createBloodDrip(x);
        }

        // "YOU DIED" title with dramatic effect
        const titleSize = isMobile ? "36px" : "64px";
        const gameOverText = this.add
            .text(width / 2, 60, "YOU DIED", {
                fontFamily: fonts.nosifer,
                fontSize: titleSize,
                color: "#8B0000",
            })
            .setOrigin(0.5)
            .setAlpha(0);

        gameOverText.setShadow(0, 0, "#8B0000", isMobile ? 20 : 40, true, true);

        // Dramatic entrance animation
        this.tweens.add({
            targets: gameOverText,
            alpha: 1,
            y: isMobile ? 70 : 100,
            duration: 1000,
            ease: "Bounce.easeOut",
        });

        // Pulsing animation
        this.tweens.add({
            targets: gameOverText,
            scale: { from: 1, to: 1.05 },
            alpha: { from: 1, to: 0.7 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            delay: 1000,
        });

        // Current game stats
        this.time.delayedCall(500, () => {
            this.createCurrentStats(isMobile);
        });

        // Score history
        this.time.delayedCall(800, () => {
            this.createScoreHistory(isMobile);
        });

        // Buttons
        this.time.delayedCall(1200, () => {
            this.createButtons(isMobile);
        });
    }

    createBloodDrip(x: number) {
        const drip = this.add.graphics();
        drip.fillStyle(0x8b0000, 0.7);

        const dripHeight = Phaser.Math.Between(80, 200);
        drip.fillRoundedRect(x - 4, 0, 8, dripHeight, 4);

        drip.setAlpha(0);

        this.tweens.add({
            targets: drip,
            alpha: 1,
            duration: 500,
            delay: Phaser.Math.Between(0, 500),
        });
    }

    createCurrentStats(isMobile: boolean) {
        const { width } = this.cameras.main;
        const { fonts } = GameConfig;
        const centerY = isMobile ? 150 : 200;
        const panelW = isMobile ? 260 : 360;
        const panelH = isMobile ? 70 : 100;

        // Panel background
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a1a, 0.9);
        panel.fillRoundedRect(width / 2 - panelW / 2, centerY - panelH / 2, panelW, panelH, isMobile ? 10 : 15);
        panel.lineStyle(isMobile ? 2 : 3, 0x8b0000);
        panel.strokeRoundedRect(width / 2 - panelW / 2, centerY - panelH / 2, panelW, panelH, isMobile ? 10 : 15);

        // "YOUR SCORE" label
        this.add
            .text(width / 2, centerY - (isMobile ? 15 : 25), "YOUR SCORE", {
                fontFamily: fonts.creepster,
                fontSize: isMobile ? "14px" : "20px",
                color: "#8B0000",
            })
            .setOrigin(0.5);

        // Animated score counter
        const scoreValue = this.add
            .text(width / 2, centerY + (isMobile ? 5 : 10), "0", {
                fontFamily: fonts.nosifer,
                fontSize: isMobile ? "28px" : "42px",
                color: "#e8e4d9",
            })
            .setOrigin(0.5);

        this.tweens.addCounter({
            from: 0,
            to: this.finalScore,
            duration: 1500,
            ease: "Power2",
            onUpdate: (tween) => {
                scoreValue.setText(Math.floor(tween.getValue() ?? 0).toString());
            },
        });

        // Wave info
        this.add
            .text(width / 2, centerY + (isMobile ? 25 : 40), `Survived to Wave ${this.finalWave}`, {
                fontFamily: fonts.special,
                fontSize: isMobile ? "12px" : "16px",
                color: "#888888",
            })
            .setOrigin(0.5);
    }

    createScoreHistory(isMobile: boolean) {
        const { width } = this.cameras.main;
        const { fonts } = GameConfig;
        const startY = isMobile ? 230 : 320;
        const panelW = isMobile ? 280 : 400;
        const panelH = isMobile ? 100 : 150;

        // History title
        this.add
            .text(width / 2, startY, "HIGH SCORES", {
                fontFamily: fonts.creepster,
                fontSize: isMobile ? "16px" : "24px",
                color: "#cc9900",
            })
            .setOrigin(0.5);

        // History panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a1a, 0.8);
        panel.fillRoundedRect(width / 2 - panelW / 2, startY + 15, panelW, panelH, isMobile ? 6 : 10);
        panel.lineStyle(isMobile ? 1 : 2, 0x666666);
        panel.strokeRoundedRect(width / 2 - panelW / 2, startY + 15, panelW, panelH, isMobile ? 6 : 10);

        if (this.scoreHistory.length === 0) {
            this.add
                .text(width / 2, startY + 15 + panelH / 2, "No scores yet!", {
                    fontFamily: fonts.special,
                    fontSize: isMobile ? "12px" : "18px",
                    color: "#666666",
                })
                .setOrigin(0.5);
        } else {
            const rowHeight = isMobile ? 18 : 25;
            const fontSize = isMobile ? "11px" : "16px";

            this.scoreHistory.forEach((record, index) => {
                const y = startY + 30 + index * rowHeight;
                const isCurrentScore = index === 0 && record.score === this.finalScore;
                const color = isCurrentScore ? "#ffcc00" : "#e8e4d9";
                const rankColor = index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "#888888";

                // Rank
                this.add
                    .text(width / 2 - panelW / 2 + 15, y, `${index + 1}.`, {
                        fontFamily: fonts.special,
                        fontSize: fontSize,
                        color: rankColor,
                    })
                    .setOrigin(0, 0.5);

                // Score
                this.add
                    .text(width / 2 - panelW / 2 + 40, y, `${record.score}`, {
                        fontFamily: fonts.special,
                        fontSize: fontSize,
                        color: color,
                    })
                    .setOrigin(0, 0.5);

                // Wave
                this.add
                    .text(width / 2, y, `Wave ${record.wave}`, {
                        fontFamily: fonts.special,
                        fontSize: isMobile ? "10px" : "14px",
                        color: "#888888",
                    })
                    .setOrigin(0, 0.5);
            });
        }
    }

    createButtons(isMobile: boolean) {
        const { width, height } = this.cameras.main;
        const buttonY = isMobile ? height - 50 : height - 80;
        const buttonSpacing = isMobile ? 80 : 130;

        // Try Again button (green)
        this.createButton(width / 2 - buttonSpacing, buttonY, "TRY AGAIN", 0x006600, isMobile, () => {
            this.cameras.main.fade(500, 0, 0, 0, false, (_: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                if (progress === 1) {
                    this.scene.start("GameScene");
                }
            });
        });

        // Exit button (red)
        this.createButton(width / 2 + buttonSpacing, buttonY, "EXIT", 0x660000, isMobile, () => {
            this.cameras.main.fade(500, 0, 0, 0, false, (_: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                if (progress === 1) {
                    this.scene.start("StartScene");
                }
            });
        });
    }

    createButton(x: number, y: number, text: string, bgColor: number, isMobile: boolean, callback: () => void) {
        const { fonts } = GameConfig;
        const container = this.add.container(x, y);
        const btnW = isMobile ? 120 : 200;
        const btnH = isMobile ? 40 : 60;
        const fontSize = isMobile ? "14px" : "22px";
        const radius = isMobile ? 8 : 12;

        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(bgColor, 0.9);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, radius);
        bg.lineStyle(isMobile ? 2 : 3, 0x8b0000, 1);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, radius);

        // Button text
        const buttonText = this.add
            .text(0, 0, text, {
                fontFamily: fonts.creepster,
                fontSize: fontSize,
                color: "#e8e4d9",
            })
            .setOrigin(0.5);

        container.add([bg, buttonText]);

        // Make interactive
        container.setSize(btnW, btnH);
        container.setInteractive({ useHandCursor: true });

        // Initial fade in
        container.setAlpha(0);
        this.tweens.add({
            targets: container,
            alpha: 1,
            duration: 500,
        });

        // Hover effects
        container.on("pointerover", () => {
            this.tweens.add({
                targets: container,
                scale: 1.1,
                duration: 150,
                ease: "Power2",
            });
            buttonText.setColor("#ffffff");
        });

        container.on("pointerout", () => {
            this.tweens.add({
                targets: container,
                scale: 1,
                duration: 150,
                ease: "Power2",
            });
            buttonText.setColor("#e8e4d9");
        });

        container.on("pointerdown", () => {
            this.tweens.add({
                targets: container,
                scale: 0.95,
                duration: 50,
                yoyo: true,
                onComplete: callback,
            });
        });
    }
}
