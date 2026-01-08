"use client";

import * as Phaser from "phaser";
import { GameConfig } from "../config/GameConfig";
import { GameScene } from "../scenes/GameScene";

export class InputManager {
    private scene: GameScene;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    private escKey!: Phaser.Input.Keyboard.Key;

    // Mobile controls
    private isTouchDevice: boolean = false;
    private joystickBase!: Phaser.GameObjects.Graphics;
    private joystickThumb!: Phaser.GameObjects.Graphics;
    private joystickPointer: Phaser.Input.Pointer | null = null;
    private fireButton!: Phaser.GameObjects.Container;
    private joystickVector: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);

    constructor(scene: GameScene) {
        this.scene = scene;
        this.isTouchDevice = this.scene.sys.game.device.input.touch;
    }

    setupInput() {
        if (this.scene.input.keyboard) {
            this.cursors = this.scene.input.keyboard.createCursorKeys();
            this.wasd = {
                W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            };
            this.escKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

            this.escKey.on("down", () => this.scene.togglePause());
        }

        // Mobile Controls
        if (this.isTouchDevice) {
            this.scene.input.setDefaultCursor("none");
            this.createMobileControls();
        }

        // Mouse shooting
        this.scene.input.on("pointerdown", () => {
            if (!this.scene.isPaused && !this.isTouchDevice) {
                this.scene.shoot();
            }
        });
    }

    getMovementVector(): Phaser.Math.Vector2 {
        const vector = new Phaser.Math.Vector2(0, 0);

        if (this.isTouchDevice && (this.joystickVector.x !== 0 || this.joystickVector.y !== 0)) {
            vector.x = this.joystickVector.x;
            vector.y = this.joystickVector.y;
            return vector;
        }

        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            vector.x = -1;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            vector.x = 1;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            vector.y = -1;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            vector.y = 1;
        }

        return vector;
    }

    getPointer(): Phaser.Math.Vector2 {
        return new Phaser.Math.Vector2(this.scene.input.x, this.scene.input.y);
    }

    isMobile(): boolean {
        return this.isTouchDevice;
    }

    private createMobileControls() {
        const { width, height } = this.scene.cameras.main;
        const { fonts } = GameConfig;

        // Joystick base (left side)
        const joystickX = 80;
        const joystickY = height - 80;
        const baseRadius = 40;
        const thumbRadius = 20;

        this.joystickBase = this.scene.add.graphics();
        this.joystickBase.fillStyle(0x333333, 0.5);
        this.joystickBase.fillCircle(joystickX, joystickY, baseRadius);
        this.joystickBase.lineStyle(2, 0x8b0000, 0.8);
        this.joystickBase.strokeCircle(joystickX, joystickY, baseRadius);
        this.joystickBase.setDepth(200);
        this.joystickBase.setScrollFactor(0);

        this.joystickThumb = this.scene.add.graphics();
        this.joystickThumb.fillStyle(0x8b0000, 0.8);
        this.joystickThumb.fillCircle(joystickX, joystickY, thumbRadius);
        this.joystickThumb.setDepth(201);
        this.joystickThumb.setScrollFactor(0);

        // Fire button (right side)
        const fireX = width - 70;
        const fireY = height - 70;
        const fireRadius = 35;

        this.fireButton = this.scene.add.container(fireX, fireY);
        this.fireButton.setDepth(200);
        this.fireButton.setScrollFactor(0);

        const fireBg = this.scene.add.graphics();
        fireBg.fillStyle(0x8b0000, 0.7);
        fireBg.fillCircle(0, 0, fireRadius);
        fireBg.lineStyle(2, 0xff0000, 0.8);
        fireBg.strokeCircle(0, 0, fireRadius);

        const fireText = this.scene.add.text(0, 0, "FIRE", {
            fontFamily: fonts.creepster,
            fontSize: "14px",
            color: "#ffffff"
        }).setOrigin(0.5);

        this.fireButton.add([fireBg, fireText]);
        this.fireButton.setSize(fireRadius * 2, fireRadius * 2);
        this.fireButton.setInteractive();

        // Joystick touch handling
        this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (pointer.x < width / 2 && !this.joystickPointer) {
                this.joystickPointer = pointer;
            }
        });

        this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            if (this.joystickPointer && pointer.id === this.joystickPointer.id) {
                const dx = pointer.x - joystickX;
                const dy = pointer.y - joystickY;
                const distance = Math.min(baseRadius, Math.sqrt(dx * dx + dy * dy));
                const angle = Math.atan2(dy, dx);

                const thumbX = joystickX + Math.cos(angle) * distance;
                const thumbY = joystickY + Math.sin(angle) * distance;

                this.joystickThumb.clear();
                this.joystickThumb.fillStyle(0x8b0000, 0.8);
                this.joystickThumb.fillCircle(thumbX, thumbY, thumbRadius);

                // Normalize vector
                this.joystickVector.x = distance > 10 ? Math.cos(angle) : 0;
                this.joystickVector.y = distance > 10 ? Math.sin(angle) : 0;
            }
        });

        this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
            if (this.joystickPointer && pointer.id === this.joystickPointer.id) {
                this.joystickPointer = null;
                this.joystickVector.set(0, 0);

                // Reset thumb position
                this.joystickThumb.clear();
                this.joystickThumb.fillStyle(0x8b0000, 0.8);
                this.joystickThumb.fillCircle(joystickX, joystickY, thumbRadius);
            }
        });

        // Fire button handling
        this.fireButton.on("pointerdown", () => {
            if (!this.scene.isPaused) {
                this.scene.shootTowardsNearestZombie();
            }
        });
    }
}
