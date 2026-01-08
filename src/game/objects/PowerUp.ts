import * as Phaser from "phaser";
import { GameConfig } from "../config/GameConfig";

export type PowerUpType = "health" | "speed" | "rapidFire" | "shield";

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
    private powerUpType: PowerUpType;
    private floatTween?: Phaser.Tweens.Tween;

    constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
        super(scene, x, y, `powerup_${type}`);
        this.powerUpType = type;

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Setup
        this.setScale(1);
        this.setDepth(3);

        // Floating animation
        this.floatTween = scene.tweens.add({
            targets: this,
            y: y - 10,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        // Glow effect based on type
        this.setTint(this.getTypeColor());

        // Pulse animation
        scene.tweens.add({
            targets: this,
            scale: { from: 1, to: 1.2 },
            alpha: { from: 1, to: 0.8 },
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        // Auto-destroy after 15 seconds
        scene.time.delayedCall(15000, () => {
            this.destroy();
        });
    }

    getType(): PowerUpType {
        return this.powerUpType;
    }

    private getTypeColor(): number {
        const { colors } = GameConfig;
        switch (this.powerUpType) {
            case "health":
                return colors.healthGreen;
            case "speed":
                return colors.speedBlue;
            case "rapidFire":
                return colors.rapidFireOrange;
            case "shield":
                return colors.shieldPurple;
            default:
                return 0xffffff;
        }
    }

    collect(): void {
        // Stop floating animation
        if (this.floatTween) {
            this.floatTween.stop();
        }

        // Collection effect
        this.scene.tweens.add({
            targets: this,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.destroy();
            },
        });
    }

    static getRandomType(): PowerUpType {
        const types: PowerUpType[] = ["health", "speed", "rapidFire", "shield"];
        return types[Phaser.Math.Between(0, types.length - 1)];
    }
}

export default PowerUp;
