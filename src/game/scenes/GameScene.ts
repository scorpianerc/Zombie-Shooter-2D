import * as Phaser from "phaser";
import { Player } from "../objects/Player";
import { Zombie } from "../objects/Zombie";
import { PowerUp, PowerUpType } from "../objects/PowerUp";
import { GameConfig } from "../config/GameConfig";
import { SoundManager } from "../managers/SoundManager";

export class GameScene extends Phaser.Scene {
    private player!: Player;
    private zombies!: Phaser.GameObjects.Group;
    private bullets!: Phaser.GameObjects.Group;
    private powerUps!: Phaser.GameObjects.Group;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    private score: number = 0;
    private wave: number = 1;
    private zombiesKilled: number = 0;
    private zombiesPerWave: number = 5;
    private spawnTimer!: Phaser.Time.TimerEvent;
    private scoreText!: Phaser.GameObjects.Text;
    private waveText!: Phaser.GameObjects.Text;
    private healthBar!: Phaser.GameObjects.Graphics;
    private crosshair!: Phaser.GameObjects.Image;
    private bloodSplatters!: Phaser.GameObjects.Group;
    private isPaused: boolean = false;
    private lastFireTime: number = 0;
    private powerUpIndicators!: Phaser.GameObjects.Container;
    private pauseMenu!: Phaser.GameObjects.Container;
    private escKey!: Phaser.Input.Keyboard.Key;
    private soundManager!: SoundManager;

    constructor() {
        super({ key: "GameScene" });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Reset game state
        this.score = 0;
        this.wave = 1;
        this.zombiesKilled = 0;
        this.zombiesPerWave = 5;
        this.isPaused = false;
        this.lastFireTime = 0;

        // Dark background
        this.cameras.main.setBackgroundColor("#0a0a0a");

        // Create tiled floor
        this.createTiledBackground();

        // Blood splatters group (for effects)
        this.bloodSplatters = this.add.group();

        // Create bullets group
        this.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 50,
            runChildUpdate: true,
        });

        // Create zombies group
        this.zombies = this.physics.add.group({
            classType: Zombie,
            runChildUpdate: true,
        });

        // Create power-ups group
        this.powerUps = this.physics.add.group({
            classType: PowerUp,
            runChildUpdate: true,
        });

        // Create player
        this.player = new Player(this, width / 2, height / 2);

        // Setup input
        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = {
                W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            };
        }

        // Mouse shooting (with fire rate)
        this.input.on("pointerdown", () => {
            if (!this.isPaused) {
                this.shoot();
            }
        });

        // Create crosshair
        this.crosshair = this.add.image(0, 0, "crosshair").setDepth(100);
        this.input.setDefaultCursor("none");

        // Create UI
        this.createUI();

        // Setup collisions
        this.physics.add.overlap(
            this.bullets,
            this.zombies,
            this.bulletHitZombie as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.zombies,
            this.zombieHitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.powerUps,
            this.collectPowerUp as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

        // Initialize sound manager FIRST (before startWave)
        this.soundManager = new SoundManager(this);
        this.soundManager.generateSounds();

        // Start spawning zombies
        this.startWave();

        // Camera effects
        this.cameras.main.fadeIn(500);

        // Handle resize
        this.scale.on("resize", this.handleResize, this);

        // Setup pause key (ESC)
        if (this.input.keyboard) {
            this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
            this.escKey.on("down", () => this.togglePause());
        }

        // Create pause menu (hidden initially)
        this.createPauseMenu();
    }

    createTiledBackground() {
        const { width, height } = this.cameras.main;
        for (let x = 0; x < width + 64; x += 64) {
            for (let y = 0; y < height + 64; y += 64) {
                this.add.image(x + 32, y + 32, "background").setAlpha(0.6);
            }
        }
    }

    handleResize(gameSize: Phaser.Structs.Size) {
        // Update camera and world bounds on resize
        this.cameras.main.setSize(gameSize.width, gameSize.height);
        this.physics.world.setBounds(0, 0, gameSize.width, gameSize.height);
    }

    createUI() {
        const { width } = this.cameras.main;
        const { fonts } = GameConfig;

        // Score display
        this.add
            .text(20, 20, "SCORE", {
                fontFamily: fonts.creepster,
                fontSize: "18px",
                color: "#8B0000",
            })
            .setShadow(0, 0, "#8B0000", 5);

        this.scoreText = this.add
            .text(20, 45, "0", {
                fontFamily: fonts.nosifer,
                fontSize: "32px",
                color: "#e8e4d9",
            })
            .setShadow(0, 0, "#8B0000", 10);

        // Wave display
        this.waveText = this.add
            .text(width / 2, 30, `WAVE ${this.wave}`, {
                fontFamily: fonts.nosifer,
                fontSize: "28px",
                color: "#8B0000",
            })
            .setOrigin(0.5)
            .setShadow(0, 0, "#8B0000", 10);

        // Health display
        this.add
            .text(width - 180, 20, "HEALTH", {
                fontFamily: fonts.creepster,
                fontSize: "18px",
                color: "#8B0000",
            })
            .setShadow(0, 0, "#8B0000", 5);

        // Health bar background
        const healthBg = this.add.graphics();
        healthBg.fillStyle(0x1a1a1a, 1);
        healthBg.fillRoundedRect(width - 180, 45, 160, 25, 5);
        healthBg.lineStyle(2, 0x8b0000);
        healthBg.strokeRoundedRect(width - 180, 45, 160, 25, 5);

        // Health bar fill
        this.healthBar = this.add.graphics();
        this.updateHealthBar();

        // Power-up indicators container
        this.powerUpIndicators = this.add.container(width - 180, 80);
    }

    updateHealthBar() {
        const { width } = this.cameras.main;
        const healthPercent = this.player.getHealth() / this.player.getMaxHealth();

        this.healthBar.clear();
        this.healthBar.fillStyle(
            healthPercent > 0.5 ? 0x4a7c59 : healthPercent > 0.25 ? 0xcc7700 : 0x8b0000,
            1
        );
        this.healthBar.fillRoundedRect(
            width - 175,
            50,
            150 * healthPercent,
            15,
            3
        );
    }

    updatePowerUpIndicators() {
        this.powerUpIndicators.removeAll(true);

        const effects = this.player.getActiveEffects();
        effects.forEach((effect, index) => {
            const icon = this.add.image(index * 35, 10, `powerup_${effect}`).setScale(0.8);
            this.powerUpIndicators.add(icon);
        });
    }

    startWave(spawnDelay: number = GameConfig.wave.spawnDelay) {
        // Show wave announcement
        this.showWaveAnnouncement();

        let zombiesSpawned = 0;

        this.spawnTimer = this.time.addEvent({
            delay: spawnDelay,
            callback: () => {
                if (zombiesSpawned < this.zombiesPerWave) {
                    this.spawnZombie();
                    zombiesSpawned++;

                    // Spawn boss on last spawn of boss wave
                    if (this.wave % 5 === 0 && zombiesSpawned === this.zombiesPerWave) {
                        this.spawnBoss();
                    }
                }
            },
            repeat: this.zombiesPerWave - 1,
        });
    }

    showWaveAnnouncement() {
        const { width, height } = this.cameras.main;
        const { fonts } = GameConfig;

        const announcement = this.add
            .text(width / 2, height / 2, `WAVE ${this.wave}`, {
                fontFamily: fonts.nosifer,
                fontSize: "72px",
                color: "#8B0000",
            })
            .setOrigin(0.5)
            .setShadow(0, 0, "#8B0000", 30)
            .setAlpha(0);

        this.tweens.add({
            targets: announcement,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 1.2 },
            duration: 500,
            yoyo: true,
            hold: 1000,
            onComplete: () => announcement.destroy(),
        });

        // Update wave text
        this.waveText.setText(`WAVE ${this.wave}`);

        // Play wave sound
        this.soundManager.play("wave");
    }

    spawnZombie() {
        const { width, height } = this.cameras.main;

        // Spawn from edges
        let x: number, y: number;
        const side = Phaser.Math.Between(0, 3);

        switch (side) {
            case 0: // Top
                x = Phaser.Math.Between(0, width);
                y = -30;
                break;
            case 1: // Right
                x = width + 30;
                y = Phaser.Math.Between(0, height);
                break;
            case 2: // Bottom
                x = Phaser.Math.Between(0, width);
                y = height + 30;
                break;
            default: // Left
                x = -30;
                y = Phaser.Math.Between(0, height);
        }

        const zombie = new Zombie(this, x, y);
        zombie.setTarget(this.player);

        // Determine type
        let type: "normal" | "exploder" | "boss" = "normal";
        const isElite = Math.random() < GameConfig.zombie.eliteChance;

        if (Math.random() < GameConfig.zombie.exploder.chance) {
            type = "exploder";
        }

        zombie.initialize(this.wave, isElite, type);

        this.zombies.add(zombie);
    }

    spawnBoss() {
        const { width, height } = this.cameras.main;

        // Spawn boss at top center
        const zombie = new Zombie(this, width / 2, -100);
        zombie.setTarget(this.player);

        // Initialize as boss
        zombie.initialize(this.wave, true, "boss");

        this.zombies.add(zombie);

        // Boss announcement
        const announcement = this.add
            .text(width / 2, height / 2, "BOSS APPROACHING!", {
                fontFamily: GameConfig.fonts.nosifer,
                fontSize: "48px",
                color: "#800080",
            })
            .setOrigin(0.5)
            .setShadow(0, 0, "#800080", 20)
            .setAlpha(0);

        this.tweens.add({
            targets: announcement,
            alpha: { from: 0, to: 1 },
            scale: { from: 0.5, to: 1.2 },
            duration: 1000,
            yoyo: true,
            hold: 2000,
            onComplete: () => announcement.destroy(),
        });

        // Boss sound
        this.soundManager.play("wave"); // Reuse wave sound for now or add boss sound
    }

    shoot() {
        const currentTime = this.time.now;
        const fireRate = this.player.getFireRate();

        if (currentTime - this.lastFireTime < fireRate) {
            return; // Rate limited
        }

        this.lastFireTime = currentTime;

        // Play shoot sound
        this.soundManager.play("shoot");

        const bullet = this.bullets.get(
            this.player.x,
            this.player.y,
            "bullet"
        ) as Phaser.Physics.Arcade.Image;

        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setScale(1);

            // Calculate direction
            const angle = Phaser.Math.Angle.Between(
                this.player.x,
                this.player.y,
                this.input.x,
                this.input.y
            );

            const speed = GameConfig.bullet.speed;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            bullet.setVelocity(velocityX, velocityY);
            bullet.setRotation(angle);

            // Muzzle flash
            this.showMuzzleFlash(angle);

            // Auto-destroy bullet after lifetime
            this.time.delayedCall(GameConfig.bullet.lifetime, () => {
                if (bullet.active) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            });
        }
    }

    showMuzzleFlash(angle: number) {
        const offsetX = Math.cos(angle) * 30;
        const offsetY = Math.sin(angle) * 30;

        const flash = this.add
            .image(this.player.x + offsetX, this.player.y + offsetY, "muzzleFlash")
            .setScale(0.6)
            .setRotation(angle);

        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1,
            duration: 100,
            onComplete: () => flash.destroy(),
        });
    }

    bulletHitZombie(
        bullet: Phaser.Physics.Arcade.Image,
        zombie: Zombie
    ) {
        // Disable bullet
        bullet.setActive(false);
        bullet.setVisible(false);

        // Damage zombie
        const killed = zombie.takeDamage(GameConfig.bullet.damage);

        // Blood effect
        this.createBloodSplatter(zombie.x, zombie.y);

        if (killed) {
            this.score += GameConfig.scoring.zombieKill;
            this.zombiesKilled++;
            this.scoreText.setText(this.score.toString());

            // Play zombie death sound
            this.soundManager.play("zombieDeath");

            // Chance to spawn power-up
            this.trySpawnPowerUp(zombie.x, zombie.y);

            // Check wave completion
            if (this.zombiesKilled >= this.zombiesPerWave) {
                this.nextWave();
            }
        }

        // Camera shake
        this.cameras.main.shake(50, 0.002);
    }

    trySpawnPowerUp(x: number, y: number) {
        if (Math.random() < GameConfig.powerUp.dropChance) {
            const type = PowerUp.getRandomType();
            const powerUp = new PowerUp(this, x, y, type);
            this.powerUps.add(powerUp);
        }
    }

    collectPowerUp(
        player: Player,
        powerUp: PowerUp
    ) {
        const type = powerUp.getType();
        player.applyPowerUp(type);
        powerUp.collect();

        // Show pickup text
        this.showPowerUpText(powerUp.x, powerUp.y, type);

        // Play power-up sound
        this.soundManager.play("powerUp");

        // Update UI
        this.updateHealthBar();
        this.updatePowerUpIndicators();
    }

    showPowerUpText(x: number, y: number, type: PowerUpType) {
        const { fonts, colors } = GameConfig;

        const texts: Record<PowerUpType, string> = {
            health: "HEALTH +30",
            speed: "SPEED BOOST",
            rapidFire: "RAPID FIRE",
            shield: "SHIELD ACTIVE",
        };

        const colorMap: Record<PowerUpType, number> = {
            health: colors.healthGreen,
            speed: colors.speedBlue,
            rapidFire: colors.rapidFireOrange,
            shield: colors.shieldPurple,
        };

        const text = this.add
            .text(x, y, texts[type], {
                fontFamily: fonts.creepster,
                fontSize: "24px",
                color: `#${colorMap[type].toString(16).padStart(6, "0")}`,
            })
            .setOrigin(0.5)
            .setDepth(50);

        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => text.destroy(),
        });
    }

    zombieHitPlayer(
        player: Player,
        zombie: Zombie
    ) {
        // Cooldown check
        if (zombie.canAttack()) {
            zombie.attack();
            player.takeDamage(GameConfig.zombie.attackDamage);
            this.updateHealthBar();

            // Red flash on hit (only if not shielded)
            if (!player.isInvincible()) {
                this.cameras.main.flash(100, 139, 0, 0);
            }

            // Check if player died
            if (player.getHealth() <= 0) {
                this.gameOver();
            }
        }
    }

    createBloodSplatter(x: number, y: number) {
        const blood = this.add.image(x, y, "blood").setScale(0.5).setAlpha(0.8);
        this.bloodSplatters.add(blood);

        this.tweens.add({
            targets: blood,
            scale: Phaser.Math.FloatBetween(0.8, 1.2),
            alpha: 0.4,
            duration: 500,
        });

        // Fade out over time
        this.time.delayedCall(10000, () => {
            this.tweens.add({
                targets: blood,
                alpha: 0,
                duration: 2000,
                onComplete: () => blood.destroy(),
            });
        });
    }

    nextWave() {
        this.wave++;
        this.wave++;
        this.zombiesKilled = 0;

        // Boss wave check (every 5 waves)
        const isBossWave = this.wave % 5 === 0;

        if (isBossWave) {
            // For boss wave, fewer minions but one big boss
            this.zombiesPerWave = 5 + Math.floor(this.wave * 0.5);
        } else {
            this.zombiesPerWave += GameConfig.wave.zombiesIncreasePerWave;
        }

        // Heal player slightly
        this.player.heal(GameConfig.scoring.healPerWave);
        this.updateHealthBar();

        // Calculate new spawn delay (faster spawning)
        const delayDecrease = (this.wave - 1) * GameConfig.difficulty.spawnDelayDecrement;
        const newSpawnDelay = Math.max(
            GameConfig.difficulty.minSpawnDelay,
            GameConfig.wave.spawnDelay - delayDecrease
        );

        // Start next wave after delay
        this.time.delayedCall(GameConfig.wave.waveDelay, () => {
            this.startWave(newSpawnDelay);
        });
    }

    gameOver() {
        this.isPaused = true;

        // Stop spawning
        if (this.spawnTimer) {
            this.spawnTimer.destroy();
        }

        // Fade to game over
        this.cameras.main.fade(1000, 139, 0, 0, false, (_: Phaser.Cameras.Scene2D.Camera, progress: number) => {
            if (progress === 1) {
                this.scene.start("GameOverScene", {
                    score: this.score,
                    wave: this.wave,
                });
            }
        });
    }

    update() {
        if (this.isPaused) return;

        // Update crosshair position
        this.crosshair.setPosition(this.input.x, this.input.y);

        // Player movement with speed multiplier
        let velocityX = 0;
        let velocityY = 0;
        const speed = this.player.getSpeed();

        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -speed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = speed;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = speed;
        }

        this.player.setVelocity(velocityX, velocityY);

        // Rotate player towards mouse
        const angle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            this.input.x,
            this.input.y
        );
        this.player.setRotation(angle + Math.PI / 2);

        // Update power-up indicators
        this.updatePowerUpIndicators();
    }

    createPauseMenu() {
        const { width, height } = this.cameras.main;
        const { fonts } = GameConfig;

        this.pauseMenu = this.add.container(width / 2, height / 2);
        this.pauseMenu.setDepth(200);
        this.pauseMenu.setVisible(false);

        // Dark overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(-width / 2, -height / 2, width, height);
        this.pauseMenu.add(overlay);

        // Pause title
        const title = this.add
            .text(0, -120, "PAUSED", {
                fontFamily: fonts.nosifer,
                fontSize: "64px",
                color: "#8B0000",
            })
            .setOrigin(0.5)
            .setShadow(0, 0, "#8B0000", 20);
        this.pauseMenu.add(title);

        // Resume button
        this.createPauseButton(0, -20, "RESUME", () => this.togglePause());

        // Main Menu button
        this.createPauseButton(0, 50, "MAIN MENU", () => {
            this.scene.start("StartScene");
        });

        // Instructions
        const instructions = this.add
            .text(0, 140, "Press ESC to resume", {
                fontFamily: fonts.special,
                fontSize: "18px",
                color: "#888888",
            })
            .setOrigin(0.5);
        this.pauseMenu.add(instructions);
    }

    createPauseButton(x: number, y: number, text: string, callback: () => void) {
        const { fonts } = GameConfig;
        const container = this.add.container(x, y);

        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(0x4a0000, 0.9);
        bg.fillRoundedRect(-120, -25, 240, 50, 10);
        bg.lineStyle(2, 0x8b0000);
        bg.strokeRoundedRect(-120, -25, 240, 50, 10);

        // Button text
        const buttonText = this.add
            .text(0, 0, text, {
                fontFamily: fonts.creepster,
                fontSize: "24px",
                color: "#e8e4d9",
            })
            .setOrigin(0.5);

        container.add([bg, buttonText]);
        container.setSize(240, 50);
        container.setInteractive({ useHandCursor: true });

        // Hover effects
        container.on("pointerover", () => {
            buttonText.setColor("#ff6666");
            container.setScale(1.05);
        });

        container.on("pointerout", () => {
            buttonText.setColor("#e8e4d9");
            container.setScale(1);
        });

        container.on("pointerdown", callback);

        this.pauseMenu.add(container);
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            // Pause game
            this.physics.pause();
            this.pauseMenu.setVisible(true);
            this.input.setDefaultCursor("default");
            this.crosshair.setVisible(false);

            // Pause all timers
            if (this.spawnTimer) {
                this.spawnTimer.paused = true;
            }
        } else {
            // Resume game
            this.physics.resume();
            this.pauseMenu.setVisible(false);
            this.input.setDefaultCursor("none");
            this.crosshair.setVisible(true);

            // Resume timers
            if (this.spawnTimer) {
                this.spawnTimer.paused = false;
            }
        }
    }
}
