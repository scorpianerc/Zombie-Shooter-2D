import * as Phaser from "phaser";

export class StartScene extends Phaser.Scene {
    private titleText!: Phaser.GameObjects.Text;
    private particles!: Phaser.GameObjects.Graphics[];
    private floatingZombies!: Phaser.GameObjects.Image[];

    constructor() {
        super({ key: "StartScene" });
        this.particles = [];
        this.floatingZombies = [];
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark atmospheric background
        this.cameras.main.setBackgroundColor("#0a0a0a");

        // Create tiled background
        for (let x = 0; x < width; x += 64) {
            for (let y = 0; y < height; y += 64) {
                this.add.image(x + 32, y + 32, "background").setAlpha(0.5);
            }
        }

        // Create fog overlay
        this.createFogEffect();

        // Create floating zombie silhouettes in background
        this.createFloatingZombies();

        // Blood drip effects at top
        this.createBloodDrips();

        // Main title with dramatic effect
        this.titleText = this.add
            .text(width / 2, height / 3, "ZOMBIE\nSHOOTER", {
                fontFamily: "Nosifer, cursive",
                fontSize: "72px",
                color: "#8B0000",
                align: "center",
                lineSpacing: 10,
            })
            .setOrigin(0.5);

        // Glow effect for title
        this.titleText.setShadow(0, 0, "#8B0000", 30, true, true);

        // Pulsing animation for title
        this.tweens.add({
            targets: this.titleText,
            scale: { from: 1, to: 1.05 },
            alpha: { from: 1, to: 0.8 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        // Subtitle
        const subtitle = this.add
            .text(width / 2, height / 2 + 40, "SURVIVE THE HORDE", {
                fontFamily: "Creepster, cursive",
                fontSize: "28px",
                color: "#e8e4d9",
                letterSpacing: 8,
            })
            .setOrigin(0.5);

        this.tweens.add({
            targets: subtitle,
            alpha: { from: 0.5, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
        });

        // Create menu buttons
        this.createMenuButton(width / 2, height / 2 + 140, "PLAY", () => {
            this.scene.start("TutorialScene");
        });

        this.createMenuButton(width / 2, height / 2 + 220, "SKIP TUTORIAL", () => {
            this.scene.start("GameScene");
        });

        // Footer text
        this.add
            .text(width / 2, height - 40, "Use WASD to move • Click to shoot", {
                fontFamily: "Special Elite, cursive",
                fontSize: "16px",
                color: "#e8e4d9",
            })
            .setOrigin(0.5)
            .setAlpha(0.6);

        // Creepy ambient particles
        this.createAmbientParticles();
    }

    createMenuButton(
        x: number,
        y: number,
        text: string,
        callback: () => void
    ): Phaser.GameObjects.Container {
        const container = this.add.container(x, y);

        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(0x4a0000, 0.9);
        bg.fillRoundedRect(-120, -30, 240, 60, 12);
        bg.lineStyle(3, 0x8b0000, 1);
        bg.strokeRoundedRect(-120, -30, 240, 60, 12);

        // Button text
        const buttonText = this.add
            .text(0, 0, text, {
                fontFamily: "Creepster, cursive",
                fontSize: "28px",
                color: "#e8e4d9",
            })
            .setOrigin(0.5);

        container.add([bg, buttonText]);

        // Make interactive
        container.setSize(240, 60);
        container.setInteractive({ useHandCursor: true });

        // Hover effects
        container.on("pointerover", () => {
            this.tweens.add({
                targets: container,
                scale: 1.1,
                duration: 150,
                ease: "Power2",
            });
            buttonText.setColor("#ff6666");
            bg.clear();
            bg.fillStyle(0x6a0000, 1);
            bg.fillRoundedRect(-120, -30, 240, 60, 12);
            bg.lineStyle(4, 0xff0000, 1);
            bg.strokeRoundedRect(-120, -30, 240, 60, 12);
        });

        container.on("pointerout", () => {
            this.tweens.add({
                targets: container,
                scale: 1,
                duration: 150,
                ease: "Power2",
            });
            buttonText.setColor("#e8e4d9");
            bg.clear();
            bg.fillStyle(0x4a0000, 0.9);
            bg.fillRoundedRect(-120, -30, 240, 60, 12);
            bg.lineStyle(3, 0x8b0000, 1);
            bg.strokeRoundedRect(-120, -30, 240, 60, 12);
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

        return container;
    }

    createFogEffect() {
        const { width, height } = this.cameras.main;

        // Fog layers
        for (let i = 0; i < 3; i++) {
            const fog = this.add.graphics();
            fog.fillStyle(0x333333, 0.1);
            fog.fillRect(0, 0, width, height);

            this.tweens.add({
                targets: fog,
                alpha: { from: 0.05, to: 0.15 },
                duration: 3000 + i * 1000,
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
            });
        }
    }

    createFloatingZombies() {
        const { width, height } = this.cameras.main;

        // Create zombie silhouettes
        for (let i = 0; i < 5; i++) {
            const zombie = this.add
                .image(
                    Phaser.Math.Between(50, width - 50),
                    Phaser.Math.Between(100, height - 100),
                    "zombie"
                )
                .setAlpha(0.15)
                .setScale(Phaser.Math.FloatBetween(1.5, 3))
                .setTint(0x000000);

            this.floatingZombies.push(zombie);

            // Floating animation
            this.tweens.add({
                targets: zombie,
                y: zombie.y + Phaser.Math.Between(-30, 30),
                x: zombie.x + Phaser.Math.Between(-20, 20),
                alpha: { from: 0.1, to: 0.25 },
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: "Sine.easeInOut",
            });
        }
    }

    createBloodDrips() {
        const { width } = this.cameras.main;

        // Blood drips from top
        for (let i = 0; i < 8; i++) {
            const x = (width / 9) * (i + 1);
            this.createSingleBloodDrip(x, Phaser.Math.Between(0, 3000));
        }
    }

    createSingleBloodDrip(x: number, delay: number) {
        const drip = this.add.graphics();
        drip.fillStyle(0x8b0000, 0.8);
        drip.fillRoundedRect(x - 3, -20, 6, 20, 3);
        drip.setAlpha(0);

        this.time.delayedCall(delay, () => {
            this.tweens.add({
                targets: drip,
                y: 150,
                alpha: { from: 1, to: 0 },
                duration: 3000,
                ease: "Cubic.easeIn",
                repeat: -1,
                repeatDelay: Phaser.Math.Between(2000, 5000),
            });
        });
    }

    createAmbientParticles() {
        const { width, height } = this.cameras.main;

        // Dust/ash particles
        for (let i = 0; i < 30; i++) {
            const particle = this.add.graphics();
            particle.fillStyle(0x666666, 0.5);
            particle.fillCircle(0, 0, Phaser.Math.Between(1, 3));
            particle.setPosition(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height)
            );

            this.particles.push(particle);

            // Floating up animation
            this.tweens.add({
                targets: particle,
                y: -50,
                x: particle.x + Phaser.Math.Between(-100, 100),
                alpha: 0,
                duration: Phaser.Math.Between(5000, 10000),
                repeat: -1,
                onRepeat: () => {
                    particle.setPosition(
                        Phaser.Math.Between(0, width),
                        height + 20
                    );
                    particle.setAlpha(0.5);
                },
            });
        }
    }
}
