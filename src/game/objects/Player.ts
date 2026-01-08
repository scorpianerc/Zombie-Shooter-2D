import * as Phaser from "phaser";
import { GameConfig } from "../config/GameConfig";
import { PowerUpType } from "./PowerUp";

export class Player extends Phaser.Physics.Arcade.Sprite {
    private health: number = 100;
    private maxHealth: number = 100;

    // Power-up states
    private speedMultiplier: number = 1;
    private fireRateMultiplier: number = 1;
    private isShielded: boolean = false;
    private shieldGraphics?: Phaser.GameObjects.Graphics;
    private activeEffects: Map<PowerUpType, Phaser.Time.TimerEvent> = new Map();

    constructor(scene: Phaser.Scene, x: number, y: number) {
        // Register spritesheet if not exists
        if (!scene.textures.exists("player_anim")) {
            const texture = scene.textures.get("player_spritesheet");
            if (texture) {
                scene.textures.addSpriteSheet("player_anim", texture.getSourceImage() as any, {
                    frameWidth: 48,
                    frameHeight: 48,
                });
            }
        }

        // Create animations if not exist
        if (!scene.anims.exists("player_idle")) {
            scene.anims.create({
                key: "player_idle",
                frames: scene.anims.generateFrameNumbers("player_anim", { start: 0, end: 0 }),
                frameRate: 1,
                repeat: -1,
            });
            scene.anims.create({
                key: "player_walk",
                frames: scene.anims.generateFrameNumbers("player_anim", { start: 1, end: 2 }),
                frameRate: 8,
                repeat: -1,
            });
        }

        super(scene, x, y, "player_anim");

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Ensure preUpdate is called for animations
        scene.sys.updateList.add(this);

        // Setup physics body
        this.setCollideWorldBounds(true);
        this.setScale(1.2);
        this.setDepth(10);
        this.play("player_idle");

        // Set circular hitbox
        if (this.body) {
            this.body.setCircle(18, 6, 6);
        }
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        // Handle animation based on movement
        if (this.body) {
            const speed = this.body.velocity.length();
            if (speed > 10) {
                this.play("player_walk", true);
            } else {
                this.play("player_idle", true);
            }
        }
    }

    getHealth(): number {
        return this.health;
    }

    getMaxHealth(): number {
        return this.maxHealth;
    }

    getSpeed(): number {
        return GameConfig.player.speed * this.speedMultiplier;
    }

    getFireRate(): number {
        return GameConfig.player.fireRate / this.fireRateMultiplier;
    }

    isInvincible(): boolean {
        return this.isShielded;
    }

    takeDamage(amount: number): void {
        if (this.isShielded) {
            // Shield blocks damage - flash blue
            this.setTint(0x00bfff);
            this.scene.time.delayedCall(100, () => {
                this.clearTint();
            });
            return;
        }

        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }

        // Flash red
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
    }

    heal(amount: number): void {
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }

        // Flash green
        this.setTint(0x00ff00);
        this.scene.time.delayedCall(200, () => {
            this.clearTint();
        });
    }

    isDead(): boolean {
        return this.health <= 0;
    }

    applyPowerUp(type: PowerUpType): void {
        const { powerUp } = GameConfig;

        // Clear existing effect of same type
        if (this.activeEffects.has(type)) {
            this.activeEffects.get(type)?.destroy();
        }

        switch (type) {
            case "health":
                this.heal(powerUp.types.health.heal);
                break;

            case "speed":
                this.speedMultiplier = powerUp.types.speed.multiplier;
                this.setTint(GameConfig.colors.speedBlue);
                const speedTimer = this.scene.time.delayedCall(
                    powerUp.types.speed.duration,
                    () => {
                        this.speedMultiplier = 1;
                        this.clearTint();
                        this.activeEffects.delete("speed");
                    }
                );
                this.activeEffects.set("speed", speedTimer);
                break;

            case "rapidFire":
                this.fireRateMultiplier = powerUp.types.rapidFire.multiplier;
                this.setTint(GameConfig.colors.rapidFireOrange);
                const fireTimer = this.scene.time.delayedCall(
                    powerUp.types.rapidFire.duration,
                    () => {
                        this.fireRateMultiplier = 1;
                        this.clearTint();
                        this.activeEffects.delete("rapidFire");
                    }
                );
                this.activeEffects.set("rapidFire", fireTimer);
                break;

            case "shield":
                // IMPORTANT: Remove existing shield graphics first before creating new one
                this.removeShieldEffect();

                this.isShielded = true;
                this.createShieldEffect();
                const shieldTimer = this.scene.time.delayedCall(
                    powerUp.types.shield.duration,
                    () => {
                        this.isShielded = false;
                        this.removeShieldEffect();
                        this.activeEffects.delete("shield");
                    }
                );
                this.activeEffects.set("shield", shieldTimer);
                break;
        }
    }

    private createShieldEffect(): void {
        // Ensure no duplicate graphics
        if (this.shieldGraphics) {
            this.shieldGraphics.clear();
            this.shieldGraphics.destroy();
        }

        this.shieldGraphics = this.scene.add.graphics();
        this.shieldGraphics.setDepth(11);

        // Update shield position in preUpdate
        this.scene.events.on("update", this.updateShieldPosition, this);
    }

    private updateShieldPosition(): void {
        if (this.shieldGraphics && this.isShielded) {
            this.shieldGraphics.clear();
            this.shieldGraphics.lineStyle(3, GameConfig.colors.shieldPurple, 0.8);
            this.shieldGraphics.strokeCircle(this.x, this.y, 35);
            this.shieldGraphics.lineStyle(2, 0xffffff, 0.3);
            this.shieldGraphics.strokeCircle(this.x, this.y, 30);
        }
    }

    private removeShieldEffect(): void {
        if (this.shieldGraphics) {
            this.shieldGraphics.clear(); // Clear any drawn graphics first
            this.shieldGraphics.destroy();
            this.shieldGraphics = undefined;
        }
        if (this.scene) {
            this.scene.events.off("update", this.updateShieldPosition, this);
        }
    }

    getActiveEffects(): PowerUpType[] {
        return Array.from(this.activeEffects.keys());
    }

    destroy(fromScene?: boolean): void {
        this.removeShieldEffect();
        this.activeEffects.forEach(timer => timer.destroy());
        super.destroy(fromScene);
    }
}
