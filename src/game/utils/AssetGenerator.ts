import * as Phaser from "phaser";
import { GameConfig } from "../config/GameConfig";

export class AssetGenerator {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    generateAll(): void {
        this.generatePlayer();
        this.generateZombie();
        this.generateBullet();
        this.generateCrosshair();
        this.generateHealth();
        this.generateBackground();
        this.generateBlood();
        this.generateMuzzleFlash();
        this.generatePowerUps();
    }

    private generatePlayer(): void {
        const size = 48;
        const width = size * 3; // 3 frames
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });

        // Frame 0: Idle
        this.drawPlayerFrame(graphics, 0, 0);

        // Frame 1: Left leg forward
        this.drawPlayerFrame(graphics, size, 1);

        // Frame 2: Right leg forward
        this.drawPlayerFrame(graphics, size * 2, 2);

        graphics.generateTexture("player_spritesheet", width, size);
        graphics.destroy();
    }

    private drawPlayerFrame(graphics: Phaser.GameObjects.Graphics, offsetX: number, frame: number): void {
        const size = 48;
        const center = size / 2;
        const x = offsetX + center;
        const y = center;

        // Legs animation
        graphics.fillStyle(0x2a3a2a);

        if (frame === 0) { // Idle
            graphics.fillRect(x - 8, y + 12, 6, 10);
            graphics.fillRect(x + 2, y + 12, 6, 10);
            // Boots
            graphics.fillStyle(0x1a1a1a);
            graphics.fillRect(x - 9, y + 20, 8, 4);
            graphics.fillRect(x + 1, y + 20, 8, 4);
        } else if (frame === 1) { // Left forward
            graphics.fillRect(x - 8, y + 10, 6, 12); // Left forward
            graphics.fillRect(x + 2, y + 14, 6, 8);  // Right back
            // Boots
            graphics.fillStyle(0x1a1a1a);
            graphics.fillRect(x - 9, y + 20, 8, 4);
            graphics.fillRect(x + 1, y + 20, 8, 4);
        } else { // Right forward
            graphics.fillRect(x - 8, y + 14, 6, 8);  // Left back
            graphics.fillRect(x + 2, y + 10, 6, 12); // Right forward
            // Boots
            graphics.fillStyle(0x1a1a1a);
            graphics.fillRect(x - 9, y + 20, 8, 4);
            graphics.fillRect(x + 1, y + 20, 8, 4);
        }

        // Bobbing effect
        const bob = frame === 0 ? 0 : -1;

        // Body (torso)
        graphics.fillStyle(0x2d4a3e); // Dark military green
        graphics.fillRoundedRect(x - 10, y - 8 + bob, 20, 22, 4);

        // Head
        graphics.fillStyle(0xd4a574); // Skin tone
        graphics.fillCircle(x, y - 12 + bob, 8);

        // Helmet
        graphics.fillStyle(0x3d5c3d); // Military green helmet
        graphics.fillCircle(x, y - 14 + bob, 9);
        graphics.fillRect(x - 9, y - 14 + bob, 18, 6);

        // Arms
        graphics.fillStyle(0x2d4a3e);
        graphics.fillRect(x - 14, y - 4 + bob, 6, 14);
        graphics.fillRect(x + 8, y - 4 + bob, 6, 14);

        // Gun
        graphics.fillStyle(0x333333);
        graphics.fillRect(x + 4, y - 20 + bob, 4, 16);
        graphics.fillRect(x + 2, y - 22 + bob, 8, 4);
    }

    private generateZombie(): void {
        const size = 48;
        const width = size * 3; // 3 frames
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });

        // Frame 0: Idle
        this.drawZombieFrame(graphics, 0, 0);

        // Frame 1: Left leg forward
        this.drawZombieFrame(graphics, size, 1);

        // Frame 2: Right leg forward
        this.drawZombieFrame(graphics, size * 2, 2);

        graphics.generateTexture("zombie_spritesheet", width, size);
        graphics.destroy();
    }

    private drawZombieFrame(graphics: Phaser.GameObjects.Graphics, offsetX: number, frame: number): void {
        const size = 48;
        const center = size / 2;
        const x = offsetX + center;
        const y = center;

        // Legs animation (shuffling)
        graphics.fillStyle(0x3a4c13);

        if (frame === 0) { // Idle
            graphics.fillRect(x - 7, y + 16, 5, 8);
            graphics.fillRect(x + 2, y + 16, 5, 8);
        } else if (frame === 1) { // Left forward
            graphics.fillRect(x - 7, y + 14, 5, 10);
            graphics.fillRect(x + 2, y + 18, 5, 6);
        } else { // Right forward
            graphics.fillRect(x - 7, y + 18, 5, 6);
            graphics.fillRect(x + 2, y + 14, 5, 10);
        }

        // Shambling/Bobbing effect
        const bob = frame === 0 ? 0 : Math.sin(frame * Math.PI) * 2;
        // Side sway for zombie walk
        const sway = frame === 0 ? 0 : (frame === 1 ? -1 : 1);

        // Tattered body
        graphics.fillStyle(0x4a5c23); // Rotten green
        graphics.fillRoundedRect(x - 10 + sway, y - 6 + bob, 20, 24, 3);

        // Torn clothes patches
        graphics.fillStyle(0x3a3a2a);
        graphics.fillRect(x - 8 + sway, y + bob, 6, 8);
        graphics.fillRect(x + 2 + sway, y + 4 + bob, 5, 6);

        // Head - deformed
        graphics.fillStyle(0x5a6c33); // Sickly green
        graphics.fillCircle(x - 2 + sway, y - 10 + bob, 10);
        graphics.fillCircle(x + 3 + sway, y - 8 + bob, 8);

        // Red glowing eyes
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(x - 4 + sway, y - 12 + bob, 3);
        graphics.fillCircle(x + 4 + sway, y - 10 + bob, 3);

        // Dark eye pupils (crazy look)
        graphics.fillStyle(0x000000);
        graphics.fillCircle(x - 4 + sway, y - 12 + bob, 1);
        graphics.fillCircle(x + 4.5 + sway, y - 10 + bob, 1);

        // Open mouth
        graphics.fillStyle(0x2a1a1a);
        graphics.fillRect(x - 4 + sway, y - 4 + bob, 8, 4);

        // Blood drips (mouth)
        graphics.fillStyle(0x8b0000);
        graphics.fillRect(x + 2 + sway, y - 4 + bob, 2, 6);
        graphics.fillRect(x - 3 + sway, y - 2 + bob, 2, 4);

        // Decayed arms (raised forward)
        graphics.fillStyle(0x4a5c23);
        graphics.fillRect(x - 16 + sway, y - 8 + bob, 8, 4);
        graphics.fillRect(x + 8 + sway, y - 6 + bob, 8, 4);

        // Clawed hands
        graphics.fillStyle(0x3a4c13);
        graphics.fillTriangle(
            x - 18 + sway, y - 8 + bob,
            x - 16 + sway, y - 2 + bob,
            x - 20 + sway, y - 4 + bob
        );
        graphics.fillTriangle(
            x + 16 + sway, y - 6 + bob,
            x + 18 + sway, y + bob,
            x + 14 + sway, y - 2 + bob
        );
    }

    private generateBullet(): void {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });

        // Bullet casing
        graphics.fillStyle(0xccaa00);
        graphics.fillRoundedRect(0, 2, 12, 4, 2);

        // Bullet tip
        graphics.fillStyle(0xffcc00);
        graphics.fillTriangle(12, 2, 16, 4, 12, 6);

        // Trail effect
        graphics.fillStyle(0xff8800, 0.5);
        graphics.fillCircle(2, 4, 3);

        graphics.generateTexture("bullet", 16, 8);
        graphics.destroy();
    }

    private generateCrosshair(): void {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        const size = 32;
        const center = size / 2;

        // Outer ring
        graphics.lineStyle(2, 0xff0000, 0.8);
        graphics.strokeCircle(center, center, 12);

        // Inner dot
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(center, center, 2);

        // Crosshair lines
        graphics.lineStyle(2, 0xff0000);
        graphics.lineBetween(center, 0, center, center - 14);
        graphics.lineBetween(center, center + 14, center, size);
        graphics.lineBetween(0, center, center - 14, center);
        graphics.lineBetween(center + 14, center, size, center);

        graphics.generateTexture("crosshair", size, size);
        graphics.destroy();
    }

    private generateHealth(): void {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        const { colors } = GameConfig;

        graphics.fillStyle(colors.bloodRed);
        graphics.fillCircle(10, 10, 8);
        graphics.fillCircle(22, 10, 8);
        graphics.fillTriangle(2, 12, 30, 12, 16, 28);
        graphics.generateTexture("health", 32, 32);
        graphics.destroy();
    }

    private generateBackground(): void {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        const { colors } = GameConfig;

        // Concrete floor texture
        graphics.fillStyle(colors.abyssLight);
        graphics.fillRect(0, 0, 64, 64);

        // Darker patches for texture
        graphics.fillStyle(colors.abyssDark, 0.5);
        graphics.fillRect(0, 0, 32, 32);
        graphics.fillRect(32, 32, 32, 32);

        // Cracks/details
        graphics.lineStyle(1, 0x1a1a1a, 0.3);
        graphics.lineBetween(10, 0, 15, 64);
        graphics.lineBetween(45, 0, 50, 64);
        graphics.lineBetween(0, 20, 64, 25);
        graphics.lineBetween(0, 48, 64, 45);

        // Border
        graphics.lineStyle(1, 0x2a2a2a);
        graphics.strokeRect(0, 0, 64, 64);

        graphics.generateTexture("background", 64, 64);
        graphics.destroy();
    }

    private generateBlood(): void {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        const { colors } = GameConfig;

        // Main splatter
        graphics.fillStyle(colors.bloodRed, 0.9);
        graphics.fillCircle(16, 16, 10);

        // Smaller splatters
        graphics.fillStyle(colors.bloodRed, 0.7);
        graphics.fillCircle(24, 12, 6);
        graphics.fillCircle(8, 22, 5);
        graphics.fillCircle(26, 22, 4);
        graphics.fillCircle(6, 10, 4);

        // Darker center
        graphics.fillStyle(colors.bloodDark, 0.6);
        graphics.fillCircle(16, 16, 5);

        graphics.generateTexture("blood", 32, 32);
        graphics.destroy();
    }

    private generateMuzzleFlash(): void {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });

        // Outer glow
        graphics.fillStyle(0xffff00, 0.6);
        graphics.fillCircle(16, 16, 14);

        // Middle
        graphics.fillStyle(0xff8800, 0.8);
        graphics.fillCircle(16, 16, 10);

        // Core
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(16, 16, 5);

        // Rays
        graphics.fillStyle(0xffff00, 0.5);
        graphics.fillTriangle(16, 0, 14, 10, 18, 10);
        graphics.fillTriangle(32, 16, 22, 14, 22, 18);
        graphics.fillTriangle(16, 32, 14, 22, 18, 22);
        graphics.fillTriangle(0, 16, 10, 14, 10, 18);

        graphics.generateTexture("muzzleFlash", 32, 32);
        graphics.destroy();
    }

    private generatePowerUps(): void {
        this.generateHealthPowerUp();
        this.generateSpeedPowerUp();
        this.generateRapidFirePowerUp();
        this.generateShieldPowerUp();
    }

    private generateHealthPowerUp(): void {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        const size = 32;
        const center = size / 2;

        // Background circle
        graphics.fillStyle(0x00ff00, 0.3);
        graphics.fillCircle(center, center, 14);

        // Border
        graphics.lineStyle(2, 0x00ff00);
        graphics.strokeCircle(center, center, 14);

        // Plus sign
        graphics.fillStyle(0x00ff00);
        graphics.fillRect(center - 8, center - 3, 16, 6);
        graphics.fillRect(center - 3, center - 8, 6, 16);

        graphics.generateTexture("powerup_health", size, size);
        graphics.destroy();
    }

    private generateSpeedPowerUp(): void {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        const size = 32;
        const center = size / 2;

        // Background circle
        graphics.fillStyle(0x00bfff, 0.3);
        graphics.fillCircle(center, center, 14);

        // Border
        graphics.lineStyle(2, 0x00bfff);
        graphics.strokeCircle(center, center, 14);

        // Lightning bolt
        graphics.fillStyle(0x00bfff);
        graphics.fillTriangle(center + 4, 6, center - 2, center, center + 6, center);
        graphics.fillTriangle(center - 4, center, center + 2, center, center - 6, 26);

        graphics.generateTexture("powerup_speed", size, size);
        graphics.destroy();
    }

    private generateRapidFirePowerUp(): void {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        const size = 32;
        const center = size / 2;

        // Background circle
        graphics.fillStyle(0xff6600, 0.3);
        graphics.fillCircle(center, center, 14);

        // Border
        graphics.lineStyle(2, 0xff6600);
        graphics.strokeCircle(center, center, 14);

        // Double bullet icon
        graphics.fillStyle(0xff6600);
        graphics.fillRect(center - 8, center - 4, 8, 3);
        graphics.fillTriangle(center, center - 4, center + 4, center - 2.5, center, center - 1);
        graphics.fillRect(center - 8, center + 1, 8, 3);
        graphics.fillTriangle(center, center + 1, center + 4, center + 2.5, center, center + 4);

        graphics.generateTexture("powerup_rapidFire", size, size);
        graphics.destroy();
    }

    private generateShieldPowerUp(): void {
        const graphics = this.scene.make.graphics({ x: 0, y: 0 });
        const size = 32;
        const center = size / 2;

        // Background circle
        graphics.fillStyle(0x9933ff, 0.3);
        graphics.fillCircle(center, center, 14);

        // Border
        graphics.lineStyle(2, 0x9933ff);
        graphics.strokeCircle(center, center, 14);

        // Shield icon
        graphics.fillStyle(0x9933ff);
        graphics.fillRoundedRect(center - 7, center - 9, 14, 16, { tl: 2, tr: 2, bl: 6, br: 6 });

        // Inner shield detail
        graphics.fillStyle(0xcc66ff, 0.5);
        graphics.fillRoundedRect(center - 4, center - 6, 8, 10, { tl: 1, tr: 1, bl: 4, br: 4 });

        graphics.generateTexture("powerup_shield", size, size);
        graphics.destroy();
    }
}

export default AssetGenerator;
