import * as Phaser from "phaser";
import { Player } from "../objects/Player";
import { Zombie } from "../objects/Zombie";
import { PowerUp, PowerUpType } from "../objects/PowerUp";
import { GameConfig } from "../config/GameConfig";
import { SoundManager } from "../managers/SoundManager";
import { UIManager } from "../managers/UIManager";
import { InputManager } from "../managers/InputManager";

export class GameScene extends Phaser.Scene {
    public player!: Player; // Public for managers/zombies
    public zombies!: Phaser.GameObjects.Group;
    private bullets!: Phaser.GameObjects.Group;
    private powerUps!: Phaser.GameObjects.Group;
    public isPaused: boolean = false; // Public for managers

    private score: number = 0;
    private wave: number = 1;
    private zombiesKilled: number = 0;
    private zombiesPerWave: number = 5;
    private spawnTimer!: Phaser.Time.TimerEvent;

    // Managers
    private soundManager!: SoundManager;
    private uiManager!: UIManager;
    private inputManager!: InputManager;

    private crosshair!: Phaser.GameObjects.Image;
    private bloodSplatters!: Phaser.GameObjects.Group;
    private lastFireTime: number = 0;

    constructor() {
        super({ key: "GameScene" });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Reset state
        this.score = 0;
        this.wave = 1;
        this.zombiesKilled = 0;
        this.zombiesPerWave = 5;
        this.isPaused = false;
        this.lastFireTime = 0;

        this.cameras.main.setBackgroundColor("#0a0a0a");
        this.createTiledBackground();

        this.bloodSplatters = this.add.group();

        this.bullets = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            maxSize: 50,
            runChildUpdate: true,
        });

        this.zombies = this.physics.add.group({
            classType: Zombie,
            runChildUpdate: true,
        });

        this.powerUps = this.physics.add.group({
            classType: PowerUp,
            runChildUpdate: true,
        });

        this.player = new Player(this, width / 2, height / 2);

        this.crosshair = this.add.image(0, 0, "crosshair").setDepth(100);

        // Layers
        this.physics.add.overlap(this.bullets, this.zombies, this.bulletHitZombie as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.add.overlap(this.player, this.zombies, this.zombieHitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

        // Managers
        this.soundManager = new SoundManager(this);
        this.soundManager.generateSounds();

        this.uiManager = new UIManager(this);
        this.uiManager.createUI(width, height);

        this.inputManager = new InputManager(this);
        this.inputManager.setupInput();

        // Listen for resume/exit events from UIManager
        this.events.on("resumeGame", () => this.togglePause());
        this.events.on("exitGame", () => this.scene.start("StartScene"));

        // Visibility check for mobile
        if (this.inputManager.isMobile()) {
            this.crosshair.setVisible(false);
        }

        this.startWave();
        this.cameras.main.fadeIn(500);
        this.scale.on("resize", this.handleResize, this);
    }

    update() {
        if (this.isPaused) return;

        // Input
        const movement = this.inputManager.getMovementVector();
        const speed = this.player.getSpeed();
        this.player.setVelocity(movement.x * speed, movement.y * speed);

        // Rotation
        if (!this.inputManager.isMobile()) {
            this.crosshair.setPosition(this.input.x, this.input.y);
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.x, this.input.y);
            this.player.setRotation(angle + Math.PI / 2);
        }

        // UI Updates
        this.uiManager.updatePowerUpIndicators(this.player.getActiveEffects());
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
        this.cameras.main.setSize(gameSize.width, gameSize.height);
        this.physics.world.setBounds(0, 0, gameSize.width, gameSize.height);
    }

    startWave(spawnDelay: number = GameConfig.wave.spawnDelay) {
        this.uiManager.showWaveAnnouncement(this.wave);
        this.soundManager.play("wave");

        let zombiesSpawned = 0;
        this.spawnTimer = this.time.addEvent({
            delay: spawnDelay,
            callback: () => {
                if (zombiesSpawned < this.zombiesPerWave) {
                    this.spawnZombie();
                    zombiesSpawned++;
                    if (this.wave % 5 === 0 && zombiesSpawned === this.zombiesPerWave) {
                        this.spawnBoss();
                    }
                }
            },
            repeat: this.zombiesPerWave - 1,
        });
    }

    spawnZombie() {
        const { width, height } = this.cameras.main;
        const side = Phaser.Math.Between(0, 3);
        let x = 0, y = 0;

        switch (side) {
            case 0: x = Phaser.Math.Between(0, width); y = -30; break;
            case 1: x = width + 30; y = Phaser.Math.Between(0, height); break;
            case 2: x = Phaser.Math.Between(0, width); y = height + 30; break;
            default: x = -30; y = Phaser.Math.Between(0, height);
        }

        const zombie = new Zombie(this, x, y);
        zombie.setTarget(this.player);

        let type: "normal" | "exploder" | "boss" = "normal";
        const isElite = Math.random() < GameConfig.zombie.eliteChance;

        if (Math.random() < GameConfig.zombie.exploder.chance) {
            type = "exploder";
        }
        zombie.initialize(this.wave, isElite, type);
        this.zombies.add(zombie);
    }

    spawnBoss() {
        const { width } = this.cameras.main;
        const zombie = new Zombie(this, width / 2, -100);
        zombie.setTarget(this.player);
        zombie.initialize(this.wave, true, "boss");
        this.zombies.add(zombie);

        // Simple boss sound reusing wave for now
        this.soundManager.play("wave");
    }

    shoot() {
        const currentTime = this.time.now;
        const fireRate = this.player.getFireRate();
        if (currentTime - this.lastFireTime < fireRate) return;
        this.lastFireTime = currentTime;

        this.soundManager.play("shoot");

        const bullet = this.bullets.get(this.player.x, this.player.y, "bullet") as Phaser.Physics.Arcade.Image;
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setScale(1);

            let angle = this.player.rotation - Math.PI / 2;

            // If mobile, shoot in facing direction (already set by joystick or auto-aim)
            // If mouse, calculate angle
            if (!this.inputManager.isMobile()) {
                angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.x, this.input.y);
            }

            const speed = GameConfig.bullet.speed;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            bullet.setVelocity(velocityX, velocityY);
            bullet.setRotation(angle);

            this.showMuzzleFlash(angle);

            this.time.delayedCall(GameConfig.bullet.lifetime, () => {
                if (bullet.active) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            });
        }
    }

    shootTowardsNearestZombie() {
        // Auto-aim logic for mobile
        let nearestZombie: Zombie | null = null;
        let nearestDist = Infinity;

        this.zombies.getChildren().forEach((child) => {
            const zombie = child as Zombie;
            if (zombie.active) {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, zombie.x, zombie.y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestZombie = zombie;
                }
            }
        });

        if (nearestZombie) {
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, (nearestZombie as Zombie).x, (nearestZombie as Zombie).y);
            this.player.setRotation(angle + Math.PI / 2);
        }

        this.shoot();
    }

    showMuzzleFlash(angle: number) {
        const offsetX = Math.cos(angle) * 30;
        const offsetY = Math.sin(angle) * 30;
        const flash = this.add.image(this.player.x + offsetX, this.player.y + offsetY, "muzzleFlash").setScale(0.6).setRotation(angle);

        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 1,
            duration: 100,
            onComplete: () => flash.destroy(),
        });
    }

    bulletHitZombie(bullet: Phaser.Physics.Arcade.Image, zombie: Zombie) {
        bullet.setActive(false);
        bullet.setVisible(false);

        const killed = zombie.takeDamage(GameConfig.bullet.damage);
        this.createBloodSplatter(zombie.x, zombie.y);

        if (killed) {
            this.score += GameConfig.scoring.zombieKill;
            this.zombiesKilled++;
            this.uiManager.updateScore(this.score);
            this.soundManager.play("zombieDeath");
            this.trySpawnPowerUp(zombie.x, zombie.y);

            if (this.zombiesKilled >= this.zombiesPerWave) {
                this.nextWave();
            }
        }
        this.cameras.main.shake(50, 0.002);
    }

    trySpawnPowerUp(x: number, y: number) {
        if (Math.random() < GameConfig.powerUp.dropChance) {
            const type = PowerUp.getRandomType();
            const powerUp = new PowerUp(this, x, y, type);
            this.powerUps.add(powerUp);
        }
    }

    collectPowerUp(player: Player, powerUp: PowerUp) {
        const type = powerUp.getType();
        player.applyPowerUp(type);
        powerUp.collect();
        this.uiManager.showPowerUpText(powerUp.x, powerUp.y, type);
        this.soundManager.play("powerUp");
        this.uiManager.updateHealthBar(this.player.getHealth(), this.player.getMaxHealth());
        this.uiManager.updatePowerUpIndicators(this.player.getActiveEffects());
    }

    zombieHitPlayer(player: Player, zombie: Zombie) {
        if (zombie.canAttack()) {
            zombie.attack();
            player.takeDamage(GameConfig.zombie.attackDamage);
            this.uiManager.updateHealthBar(this.player.getHealth(), this.player.getMaxHealth());

            if (!player.isInvincible()) {
                this.cameras.main.flash(100, 139, 0, 0);
            }
            if (player.getHealth() <= 0) {
                this.gameOver();
            }
        }
    }

    createBloodSplatter(x: number, y: number) {
        const blood = this.add.image(x, y, "blood").setScale(0.5).setAlpha(0.8);
        this.bloodSplatters.add(blood);
        this.tweens.add({ targets: blood, scale: Phaser.Math.FloatBetween(0.8, 1.2), alpha: 0.4, duration: 500 });
        this.time.delayedCall(10000, () => {
            this.tweens.add({ targets: blood, alpha: 0, duration: 2000, onComplete: () => blood.destroy() });
        });
    }

    nextWave() {
        this.wave++;
        this.zombiesKilled = 0;

        if (this.wave % 5 === 0) {
            this.zombiesPerWave = 5 + Math.floor(this.wave * 0.5);
        } else {
            this.zombiesPerWave += GameConfig.wave.zombiesIncreasePerWave;
        }

        this.player.heal(GameConfig.scoring.healPerWave);
        this.uiManager.updateHealthBar(this.player.getHealth(), this.player.getMaxHealth());

        const delayDecrease = (this.wave - 1) * GameConfig.difficulty.spawnDelayDecrement;
        const newSpawnDelay = Math.max(GameConfig.difficulty.minSpawnDelay, GameConfig.wave.spawnDelay - delayDecrease);

        this.time.delayedCall(GameConfig.wave.waveDelay, () => {
            this.startWave(newSpawnDelay);
        });
    }

    gameOver() {
        this.isPaused = true;
        if (this.spawnTimer) this.spawnTimer.destroy();
        this.cameras.main.fade(1000, 139, 0, 0, false, (_: Phaser.Cameras.Scene2D.Camera, progress: number) => {
            if (progress === 1) {
                this.scene.start("GameOverScene", { score: this.score, wave: this.wave });
            }
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.physics.pause();
            this.uiManager.togglePauseMenu(true);
            if (this.spawnTimer) this.spawnTimer.paused = true;
            this.crosshair.setVisible(false);
        } else {
            this.physics.resume();
            this.uiManager.togglePauseMenu(false);
            if (this.spawnTimer) this.spawnTimer.paused = false;
            if (!this.inputManager.isMobile()) {
                this.crosshair.setVisible(true);
            }
        }
    }
}
