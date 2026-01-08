import * as Phaser from "phaser";
import { AssetGenerator } from "../utils/AssetGenerator";
import { GameConfig } from "../config/GameConfig";

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: "BootScene" });
    }

    preload() {
        const { width, height } = this.cameras.main;
        const { colors, fonts } = GameConfig;

        // Loading background
        this.cameras.main.setBackgroundColor(colors.abyssDark);

        // Title text
        const titleText = this.add
            .text(width / 2, height / 2 - 100, "ZOMBIE SHOOTER", {
                fontFamily: fonts.nosifer,
                fontSize: "48px",
                color: "#8B0000",
            })
            .setOrigin(0.5);

        titleText.setShadow(0, 0, "#8B0000", 20, true, true);

        // Loading bar background
        const progressBox = this.add.graphics();
        progressBox.fillStyle(colors.abyssLight, 1);
        progressBox.fillRoundedRect(width / 2 - 160, height / 2, 320, 30, 8);
        progressBox.lineStyle(2, colors.bloodRed, 1);
        progressBox.strokeRoundedRect(width / 2 - 160, height / 2, 320, 30, 8);

        // Loading bar fill
        const progressBar = this.add.graphics();

        // Loading text
        const loadingText = this.add
            .text(width / 2, height / 2 + 60, "Awakening the dead...", {
                fontFamily: fonts.special,
                fontSize: "18px",
                color: "#e8e4d9",
            })
            .setOrigin(0.5);

        // Update loading bar
        this.load.on("progress", (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(colors.bloodRed, 1);
            progressBar.fillRoundedRect(
                width / 2 - 155,
                height / 2 + 5,
                310 * value,
                20,
                5
            );
        });

        this.load.on("complete", () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Generate all game graphics using AssetGenerator
        const assetGenerator = new AssetGenerator(this);
        assetGenerator.generateAll();
    }

    create() {
        // Transition to start scene
        this.scene.start("StartScene");
    }
}
