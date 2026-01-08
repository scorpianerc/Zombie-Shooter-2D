import * as Phaser from "phaser";
import { Player } from "./Player";
import { GameConfig } from "../config/GameConfig";

export type ZombieType = "normal" | "exploder" | "boss";

export class Zombie extends Phaser.Physics.Arcade.Sprite {
    private health: number = 50;
    private maxHealth: number = 50;
    private speed: number = 80;
    public zombieType: ZombieType = "normal";
    private target: Player | null = null;
    private lastAttackTime: number = 0;
    private attackCooldown: number = 1000; // 1 second between attacks

    constructor(scene: Phaser.Scene, x: number, y: number) {
        // Register all spritesheets from raw textures if animations don't exist yet
        ["zombie", "exploder", "boss"].forEach(type => {
            const rawKey = `${type}_spritesheet`;      // Raw texture from AssetGenerator
            const animKey = `${type}_anim`;            // Spritesheet with frames

            // Only convert if we haven't already and the raw texture exists
            if (!scene.textures.exists(animKey) && scene.textures.exists(rawKey)) {
                const texture = scene.textures.get(rawKey);
                scene.textures.addSpriteSheet(animKey, texture.getSourceImage() as any, {
                    frameWidth: 48,
                    frameHeight: 48,
                });
            }
        });

        // Create animations if not exist
        ["normal", "exploder", "boss"].forEach(type => {
            const animKey = type === "normal" ? "zombie_anim" : `${type}_anim`;

            if (!scene.anims.exists(`${type}_walk`)) {
                scene.anims.create({
                    key: `${type}_walk`,
                    frames: scene.anims.generateFrameNumbers(animKey, { start: 0, end: 2 }),
                    frameRate: type === "boss" ? 4 : (type === "exploder" ? 8 : 6),
                    repeat: -1,
                });
            }
        });

        super(scene, x, y, "zombie_anim");

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.sys.updateList.add(this); // Ensure preUpdate runs

        // Setup physics body
        this.setScale(1.3);
        this.setDepth(5);
        this.play("normal_walk");

        // Set circular hitbox
        if (this.body) {
            this.body.setCircle(20, 4, 4);
        }

        this.speed = Phaser.Math.Between(GameConfig.zombie.speedVariation.min, GameConfig.zombie.speedVariation.max);
    }

    initialize(wave: number, isElite: boolean, type: ZombieType = "normal") {
        this.zombieType = type;

        // Base multipliers
        let healthMult = Math.pow(GameConfig.difficulty.healthMultiplier, wave - 1);
        let speedMult = Math.pow(GameConfig.difficulty.speedMultiplier, wave - 1);

        // Type specific adjustments
        if (this.zombieType === "exploder") {
            healthMult *= GameConfig.zombie.exploder.healthMultiplier;
            speedMult *= GameConfig.zombie.exploder.speedMultiplier;
            this.setScale(GameConfig.zombie.exploder.scale);
        } else if (this.zombieType === "boss") {
            healthMult *= GameConfig.zombie.boss.healthMultiplier;
            speedMult *= GameConfig.zombie.boss.speedMultiplier;
            this.setScale(GameConfig.zombie.boss.scale);
        }

        // Play correct animation
        this.play(`${this.zombieType}_walk`, true);

        this.maxHealth = Math.floor(GameConfig.zombie.baseHealth * healthMult);
        this.speed = Math.floor(this.speed * speedMult);

        // Apply elite status (only to normal and exploder, boss is already elite enough)
        if (isElite && this.zombieType !== "boss") {
            this.prepareElite();
        }

        this.health = this.maxHealth;
    }

    prepareElite() {
        this.maxHealth *= 2;
        this.speed *= 1.2;
        this.setScale(1.6); // Larger
        this.setTint(0xff0000); // Red tint
    }

    setTarget(player: Player): void {
        this.target = player;
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        // Ensure animation is playing
        if (!this.anims.isPlaying) {
            this.play(`${this.zombieType}_walk`, true);
        }

        if (!this.target || !this.active) return;

        // Chase player
        const angle = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            this.target.x,
            this.target.y
        );

        const velocityX = Math.cos(angle) * this.speed;
        const velocityY = Math.sin(angle) * this.speed;

        this.setVelocity(velocityX, velocityY);

        // Rotate towards player
        this.setRotation(angle + Math.PI / 2);

        // Wobble animation (reduced slightly to mix with frame animation)
        const wobble = Math.sin(time / 150) * 1.5; // Slower, less intense wobble
        this.setAngle(this.angle + wobble);
    }

    takeDamage(amount: number): boolean {
        this.health -= amount;

        // Flash white
        this.setTint(0xffffff);
        this.scene.time.delayedCall(50, () => {
            if (this.active) {
                this.clearTint();
            }
        });

        if (this.health <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    die(): void {
        if (this.zombieType === "exploder") {
            this.explode();
        }

        // Death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.5,
            angle: this.angle + 360,
            duration: 300,
            onComplete: () => {
                this.destroy();
            },
        });
    }

    explode() {
        // Create explosion visual
        const explosion = this.scene.add.circle(this.x, this.y, 10, 0xffa500, 1);
        this.scene.tweens.add({
            targets: explosion,
            scale: 15,
            alpha: 0,
            duration: 300,
            onComplete: () => explosion.destroy()
        });

        // Flash camera
        this.scene.cameras.main.shake(200, 0.01);

        // Check distance to player
        if (this.target && this.target.active) {
            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            if (dist < GameConfig.zombie.exploder.explosionRange) {
                this.target.takeDamage(GameConfig.zombie.exploder.explosionDamage);
            }
        }
    }

    canAttack(): boolean {
        const currentTime = this.scene.time.now;
        return currentTime - this.lastAttackTime >= this.attackCooldown;
    }

    attack(): void {
        this.lastAttackTime = this.scene.time.now;

        // Attack animation (lunge forward)
        const originalX = this.x;
        const originalY = this.y;

        this.scene.tweens.add({
            targets: this,
            x: this.x + (this.target ? (this.target.x - this.x) * 0.1 : 0),
            y: this.y + (this.target ? (this.target.y - this.y) * 0.1 : 0),
            duration: 100,
            yoyo: true,
        });
    }
}
