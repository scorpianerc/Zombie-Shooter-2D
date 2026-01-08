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

        // Dark red background
        this.cameras.main.setBackgroundColor("#1a0000");

        // Create blood drip effects
        for (let i = 0; i < 12; i++) {
            const x = (width / 13) * (i + 1);
            this.createBloodDrip(x);
        }

        // "YOU DIED" title with dramatic effect
        const gameOverText = this.add
            .text(width / 2, 80, "YOU DIED", {
                fontFamily: fonts.nosifer,
                fontSize: "64px",
                color: "#8B0000",
            })
            .setOrigin(0.5)
            .setAlpha(0);

        gameOverText.setShadow(0, 0, "#8B0000", 40, true, true);

        // Dramatic entrance animation
        this.tweens.add({
            targets: gameOverText,
            alpha: 1,
            y: 100,
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
            this.createCurrentStats();
        });

        // Score history
        this.time.delayedCall(800, () => {
            this.createScoreHistory();
        });

        // Buttons
        this.time.delayedCall(1200, () => {
            this.createButtons();
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

    createCurrentStats() {
        const { width } = this.cameras.main;
        const { fonts } = GameConfig;
        const centerY = 200;

        // Panel background
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a1a, 0.9);
        panel.fillRoundedRect(width / 2 - 180, centerY - 50, 360, 100, 15);
        panel.lineStyle(3, 0x8b0000);
        panel.strokeRoundedRect(width / 2 - 180, centerY - 50, 360, 100, 15);

        // "YOUR SCORE" label
        this.add
            .text(width / 2, centerY - 25, "YOUR SCORE", {
                fontFamily: fonts.creepster,
                fontSize: "20px",
                color: "#8B0000",
            })
            .setOrigin(0.5);

        // Animated score counter
        const scoreValue = this.add
            .text(width / 2, centerY + 10, "0", {
                fontFamily: fonts.nosifer,
                fontSize: "42px",
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
            .text(width / 2, centerY + 40, `Survived to Wave ${this.finalWave}`, {
                fontFamily: fonts.special,
                fontSize: "16px",
                color: "#888888",
            })
            .setOrigin(0.5);
    }

    createScoreHistory() {
        const { width } = this.cameras.main;
        const { fonts } = GameConfig;
        const startY = 320;

        // History title
        this.add
            .text(width / 2, startY, "HIGH SCORES", {
                fontFamily: fonts.creepster,
                fontSize: "24px",
                color: "#cc9900",
            })
            .setOrigin(0.5);

        // History panel
        const panel = this.add.graphics();
        panel.fillStyle(0x1a1a1a, 0.8);
        panel.fillRoundedRect(width / 2 - 200, startY + 20, 400, 150, 10);
        panel.lineStyle(2, 0x666666);
        panel.strokeRoundedRect(width / 2 - 200, startY + 20, 400, 150, 10);

        if (this.scoreHistory.length === 0) {
            this.add
                .text(width / 2, startY + 95, "No scores yet!", {
                    fontFamily: fonts.special,
                    fontSize: "18px",
                    color: "#666666",
                })
                .setOrigin(0.5);
        } else {
            // Display top 5 scores
            this.scoreHistory.forEach((record, index) => {
                const y = startY + 45 + index * 25;
                const isCurrentScore = index === 0 && record.score === this.finalScore;
                const color = isCurrentScore ? "#ffcc00" : "#e8e4d9";
                const rankColor = index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "#888888";

                // Rank
                this.add
                    .text(width / 2 - 170, y, `${index + 1}.`, {
                        fontFamily: fonts.special,
                        fontSize: "16px",
                        color: rankColor,
                    })
                    .setOrigin(0, 0.5);

                // Score
                this.add
                    .text(width / 2 - 130, y, `${record.score}`, {
                        fontFamily: fonts.special,
                        fontSize: "16px",
                        color: color,
                    })
                    .setOrigin(0, 0.5);

                // Wave
                this.add
                    .text(width / 2 + 30, y, `Wave ${record.wave}`, {
                        fontFamily: fonts.special,
                        fontSize: "14px",
                        color: "#888888",
                    })
                    .setOrigin(0, 0.5);

                // Date
                this.add
                    .text(width / 2 + 140, y, record.date, {
                        fontFamily: fonts.special,
                        fontSize: "12px",
                        color: "#666666",
                    })
                    .setOrigin(0, 0.5);
            });
        }
    }

    createButtons() {
        const { width, height } = this.cameras.main;
        const buttonY = height - 80;

        // Try Again button (green)
        this.createButton(width / 2 - 130, buttonY, "TRY AGAIN", 0x006600, () => {
            this.cameras.main.fade(500, 0, 0, 0, false, (_: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                if (progress === 1) {
                    this.scene.start("GameScene");
                }
            });
        });

        // Exit button (red)
        this.createButton(width / 2 + 130, buttonY, "EXIT", 0x660000, () => {
            this.cameras.main.fade(500, 0, 0, 0, false, (_: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                if (progress === 1) {
                    this.scene.start("StartScene");
                }
            });
        });
    }

    createButton(x: number, y: number, text: string, bgColor: number, callback: () => void) {
        const { fonts } = GameConfig;
        const container = this.add.container(x, y);

        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(bgColor, 0.9);
        bg.fillRoundedRect(-100, -30, 200, 60, 12);
        bg.lineStyle(3, 0x8b0000, 1);
        bg.strokeRoundedRect(-100, -30, 200, 60, 12);

        // Button text
        const buttonText = this.add
            .text(0, 0, text, {
                fontFamily: fonts.creepster,
                fontSize: "22px",
                color: "#e8e4d9",
            })
            .setOrigin(0.5);

        container.add([bg, buttonText]);

        // Make interactive
        container.setSize(200, 60);
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
