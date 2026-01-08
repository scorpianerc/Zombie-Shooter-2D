import * as Phaser from "phaser";

interface TutorialStep {
    title: string;
    description: string;
    icon?: string;
    highlight?: string;
}

export class TutorialScene extends Phaser.Scene {
    private currentStep: number = 0;
    private tutorialSteps: TutorialStep[] = [];
    private stepContainer!: Phaser.GameObjects.Container;
    private player!: Phaser.GameObjects.Image;
    private demoZombie!: Phaser.GameObjects.Image;
    private crosshair!: Phaser.GameObjects.Image;

    constructor() {
        super({ key: "TutorialScene" });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Dark background with grid
        this.cameras.main.setBackgroundColor("#0a0a0a");

        for (let x = 0; x < width; x += 64) {
            for (let y = 0; y < height; y += 64) {
                this.add.image(x + 32, y + 32, "background").setAlpha(0.3);
            }
        }

        // Setup tutorial steps
        this.tutorialSteps = [
            {
                title: "WELCOME SURVIVOR",
                description:
                    "The zombie apocalypse has begun!\nYou are humanity's last hope.\nLearn the basics to survive...",
            },
            {
                title: "MOVEMENT",
                description:
                    "Use W A S D or ARROW KEYS to move.\n\nW / ↑ = Move Up\nS / ↓ = Move Down\nA / ← = Move Left\nD / → = Move Right",
                highlight: "movement",
            },
            {
                title: "AIM & SHOOT",
                description:
                    "Move your MOUSE to aim.\n\nLEFT CLICK to shoot zombies.\n\nAim for the head for maximum damage!",
                highlight: "shooting",
            },
            {
                title: "SURVIVE",
                description:
                    "Zombies will chase you relentlessly!\n\nKeep moving and shooting.\nDon't let them get too close!\n\nYour health is shown at the top.",
                highlight: "survival",
            },
            {
                title: "READY?",
                description:
                    "You know what you need to survive.\n\nKill zombies to earn points.\nSurvive as long as possible!\n\nGood luck, survivor...",
            },
        ];

        // Create demo area
        this.createDemoArea();

        // Create step display
        this.stepContainer = this.add.container(width / 2, height / 2);
        this.showStep(0);

        // Navigation buttons
        this.createNavigationButtons();

        // Skip button
        this.add
            .text(width - 20, 20, "SKIP →", {
                fontFamily: "Creepster, cursive",
                fontSize: "20px",
                color: "#8B0000",
            })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => this.scene.start("GameScene"))
            .on("pointerover", function (this: Phaser.GameObjects.Text) {
                this.setColor("#ff0000");
            })
            .on("pointerout", function (this: Phaser.GameObjects.Text) {
                this.setColor("#8B0000");
            });

        // Progress dots
        this.createProgressDots();

        // Hide cursor in tutorial
        this.input.setDefaultCursor("crosshair");
    }

    createDemoArea() {
        const { width, height } = this.cameras.main;

        // Demo player
        this.player = this.add
            .image(width / 2 - 200, height / 2 + 100, "player")
            .setScale(2)
            .setAlpha(0);

        // Demo zombie
        this.demoZombie = this.add
            .image(width / 2 + 200, height / 2 + 100, "zombie")
            .setScale(2)
            .setAlpha(0);

        // Demo crosshair
        this.crosshair = this.add
            .image(width / 2, height / 2 + 100, "crosshair")
            .setScale(1.5)
            .setAlpha(0);
    }

    showStep(index: number) {
        const step = this.tutorialSteps[index];
        const { width, height } = this.cameras.main;

        // Clear previous content
        this.stepContainer.removeAll(true);

        // Background panel
        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x1a1a1a, 0.95);
        panelBg.fillRoundedRect(-300, -180, 600, 360, 20);
        panelBg.lineStyle(4, 0x8b0000, 1);
        panelBg.strokeRoundedRect(-300, -180, 600, 360, 20);

        // Blood corner decorations
        const bloodCorner1 = this.add.graphics();
        bloodCorner1.fillStyle(0x8b0000, 0.6);
        bloodCorner1.fillTriangle(-300, -180, -240, -180, -300, -120);

        const bloodCorner2 = this.add.graphics();
        bloodCorner2.fillStyle(0x8b0000, 0.6);
        bloodCorner2.fillTriangle(300, -180, 240, -180, 300, -120);

        // Title
        const title = this.add
            .text(0, -140, step.title, {
                fontFamily: "Nosifer, cursive",
                fontSize: "36px",
                color: "#8B0000",
            })
            .setOrigin(0.5);
        title.setShadow(0, 0, "#8B0000", 15, true, true);

        // Description
        const description = this.add
            .text(0, 20, step.description, {
                fontFamily: "Special Elite, cursive",
                fontSize: "22px",
                color: "#e8e4d9",
                align: "center",
                lineSpacing: 12,
            })
            .setOrigin(0.5);

        this.stepContainer.add([
            panelBg,
            bloodCorner1,
            bloodCorner2,
            title,
            description,
        ]);

        // Animate step in
        this.stepContainer.setAlpha(0);
        this.stepContainer.setScale(0.8);
        this.tweens.add({
            targets: this.stepContainer,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: "Back.easeOut",
        });

        // Show demo based on step
        this.hideAllDemos();
        if (step.highlight === "movement") {
            this.showMovementDemo();
        } else if (step.highlight === "shooting") {
            this.showShootingDemo();
        } else if (step.highlight === "survival") {
            this.showSurvivalDemo();
        }

        // Update progress dots
        this.updateProgressDots();
    }

    hideAllDemos() {
        this.player.setAlpha(0);
        this.demoZombie.setAlpha(0);
        this.crosshair.setAlpha(0);
        this.tweens.killTweensOf(this.player);
        this.tweens.killTweensOf(this.demoZombie);
        this.tweens.killTweensOf(this.crosshair);
    }

    showMovementDemo() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const bottomY = height - 100;

        this.player.setPosition(centerX, bottomY);
        this.player.setAlpha(1);

        // Movement animation
        this.tweens.add({
            targets: this.player,
            x: { from: centerX - 80, to: centerX + 80 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        this.tweens.add({
            targets: this.player,
            y: { from: bottomY - 40, to: bottomY + 40 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });
    }

    showShootingDemo() {
        const { width, height } = this.cameras.main;
        const playerX = width / 2 - 150;
        const zombieX = width / 2 + 150;
        const y = height - 100;

        this.player.setPosition(playerX, y);
        this.player.setAlpha(1);

        this.demoZombie.setPosition(zombieX, y);
        this.demoZombie.setAlpha(1);

        this.crosshair.setPosition(zombieX, y);
        this.crosshair.setAlpha(1);

        // Crosshair movement
        this.tweens.add({
            targets: this.crosshair,
            x: { from: zombieX - 30, to: zombieX + 30 },
            y: { from: y - 20, to: y + 20 },
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        // Zombie shake on "hit"
        this.time.addEvent({
            delay: 1200,
            callback: () => {
                this.tweens.add({
                    targets: this.demoZombie,
                    x: this.demoZombie.x + 10,
                    duration: 50,
                    yoyo: true,
                    repeat: 3,
                });
                // Show muzzle flash
                const flash = this.add
                    .image(playerX + 30, y, "muzzleFlash")
                    .setScale(0.8);
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    scale: 1.5,
                    duration: 200,
                    onComplete: () => flash.destroy(),
                });
            },
            loop: true,
        });
    }

    showSurvivalDemo() {
        const { width, height } = this.cameras.main;
        const playerStartX = width / 2 - 100;
        const y = height - 100;

        this.player.setPosition(playerStartX, y);
        this.player.setAlpha(1);

        this.demoZombie.setPosition(width / 2 + 200, y);
        this.demoZombie.setAlpha(1);

        // Zombie chasing player
        this.tweens.add({
            targets: this.demoZombie,
            x: { from: width / 2 + 200, to: width / 2 - 50 },
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        // Player escaping
        this.tweens.add({
            targets: this.player,
            x: { from: playerStartX, to: width / 2 - 200 },
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });
    }

    createNavigationButtons() {
        const { width, height } = this.cameras.main;

        // Previous button
        const prevBtn = this.add.container(width / 2 - 120, height - 60);
        const prevBg = this.add.graphics();
        prevBg.fillStyle(0x4a0000, 0.9);
        prevBg.fillRoundedRect(-60, -25, 120, 50, 10);
        prevBg.lineStyle(2, 0x8b0000);
        prevBg.strokeRoundedRect(-60, -25, 120, 50, 10);

        const prevText = this.add
            .text(0, 0, "← BACK", {
                fontFamily: "Creepster, cursive",
                fontSize: "22px",
                color: "#e8e4d9",
            })
            .setOrigin(0.5);

        prevBtn.add([prevBg, prevText]);
        prevBtn.setSize(120, 50);
        prevBtn.setInteractive({ useHandCursor: true });
        prevBtn.on("pointerdown", () => this.previousStep());
        prevBtn.on("pointerover", () => {
            prevText.setColor("#ff6666");
        });
        prevBtn.on("pointerout", () => {
            prevText.setColor("#e8e4d9");
        });

        // Next button
        const nextBtn = this.add.container(width / 2 + 120, height - 60);
        const nextBg = this.add.graphics();
        nextBg.fillStyle(0x4a0000, 0.9);
        nextBg.fillRoundedRect(-60, -25, 120, 50, 10);
        nextBg.lineStyle(2, 0x8b0000);
        nextBg.strokeRoundedRect(-60, -25, 120, 50, 10);

        const nextText = this.add
            .text(0, 0, "NEXT →", {
                fontFamily: "Creepster, cursive",
                fontSize: "22px",
                color: "#e8e4d9",
            })
            .setOrigin(0.5);

        nextBtn.add([nextBg, nextText]);
        nextBtn.setSize(120, 50);
        nextBtn.setInteractive({ useHandCursor: true });
        nextBtn.on("pointerdown", () => this.nextStep());
        nextBtn.on("pointerover", () => {
            nextText.setColor("#ff6666");
        });
        nextBtn.on("pointerout", () => {
            nextText.setColor("#e8e4d9");
        });
    }

    createProgressDots() {
        const { width } = this.cameras.main;

        for (let i = 0; i < this.tutorialSteps.length; i++) {
            const dot = this.add.graphics();
            dot.setName(`dot_${i}`);
            const x = width / 2 - ((this.tutorialSteps.length - 1) * 20) / 2 + i * 20;
            dot.fillStyle(i === 0 ? 0x8b0000 : 0x4a0000, 1);
            dot.fillCircle(x, 30, 6);
        }
    }

    updateProgressDots() {
        const { width } = this.cameras.main;

        for (let i = 0; i < this.tutorialSteps.length; i++) {
            const dot = this.children.getByName(`dot_${i}`) as Phaser.GameObjects.Graphics;
            if (dot) {
                dot.clear();
                const x = width / 2 - ((this.tutorialSteps.length - 1) * 20) / 2 + i * 20;
                dot.fillStyle(i === this.currentStep ? 0x8b0000 : 0x4a0000, 1);
                dot.fillCircle(x, 30, i === this.currentStep ? 8 : 6);
            }
        }
    }

    nextStep() {
        if (this.currentStep < this.tutorialSteps.length - 1) {
            this.currentStep++;
            this.showStep(this.currentStep);
        } else {
            // Start game
            this.cameras.main.fade(500, 0, 0, 0, false, (_: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                if (progress === 1) {
                    this.scene.start("GameScene");
                }
            });
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }
}
