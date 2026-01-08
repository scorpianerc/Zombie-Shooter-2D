import * as Phaser from "phaser";
import { Player } from "./Player";

export class Zombie extends Phaser.Physics.Arcade.Sprite {
    private health: number = 50;
    private speed: number = 80;
    private target: Player | null = null;
    private lastAttackTime: number = 0;
    private attackCooldown: number = 1000; // 1 second between attacks

    constructor(scene: Phaser.Scene, x: number, y: number) {
        // Register spritesheet if not exists
        if (!scene.textures.exists("zombie_anim")) {
            const texture = scene.textures.get("zombie_spritesheet");
            if (texture) {
                scene.textures.addSpriteSheet("zombie_anim", texture.getSourceImage() as any, {
                    frameWidth: 48,
                    frameHeight: 48,
                });
            }
        }

        // Create animations if not exist
        if (!scene.anims.exists("zombie_walk")) {
            scene.anims.create({
                key: "zombie_walk",
                frames: scene.anims.generateFrameNumbers("zombie_anim", { start: 1, end: 2 }),
                frameRate: 6, // Slower shambling
                repeat: -1,
            });
            scene.anims.create({
                key: "zombie_idle",
                frames: scene.anims.generateFrameNumbers("zombie_anim", { start: 0, end: 0 }),
                frameRate: 1,
                repeat: -1,
            });
        }

        super(scene, x, y, "zombie_anim");

        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.sys.updateList.add(this); // Ensure preUpdate runs

        // Setup physics body
        this.setScale(1.3);
        this.setDepth(5);
        this.play("zombie_walk");

        // Set circular hitbox
        if (this.body) {
            this.body.setCircle(20, 4, 4);
        }

        // Random speed variation
        this.speed = Phaser.Math.Between(60, 100);
    }

    setTarget(player: Player): void {
        this.target = player;
    }

    preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        // Ensure animation is playing
        if (!this.anims.isPlaying) {
            this.play("zombie_walk", true);
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
