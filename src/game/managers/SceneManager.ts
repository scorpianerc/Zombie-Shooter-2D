import * as Phaser from "phaser";

export type SceneName =
    | "BootScene"
    | "StartScene"
    | "TutorialScene"
    | "GameScene"
    | "GameOverScene";

export interface SceneTransitionData {
    score?: number;
    wave?: number;
    fromScene?: SceneName;
}

export class SceneManager {
    private game: Phaser.Game;
    private currentScene: SceneName | null = null;
    private sceneHistory: SceneName[] = [];

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    /**
     * Transition to a new scene
     */
    goTo(sceneName: SceneName, data?: SceneTransitionData): void {
        if (this.currentScene) {
            this.sceneHistory.push(this.currentScene);
            this.game.scene.stop(this.currentScene);
        }

        this.currentScene = sceneName;
        this.game.scene.start(sceneName, {
            ...data,
            fromScene: this.sceneHistory[this.sceneHistory.length - 1],
        });
    }

    /**
     * Go back to previous scene
     */
    goBack(data?: SceneTransitionData): void {
        const previousScene = this.sceneHistory.pop();
        if (previousScene) {
            if (this.currentScene) {
                this.game.scene.stop(this.currentScene);
            }
            this.currentScene = previousScene;
            this.game.scene.start(previousScene, data);
        }
    }

    /**
     * Restart current scene
     */
    restartScene(data?: SceneTransitionData): void {
        if (this.currentScene) {
            this.game.scene.stop(this.currentScene);
            this.game.scene.start(this.currentScene, data);
        }
    }

    /**
     * Get current active scene name
     */
    getCurrentScene(): SceneName | null {
        return this.currentScene;
    }

    /**
     * Check if can go back
     */
    canGoBack(): boolean {
        return this.sceneHistory.length > 0;
    }

    /**
     * Clear scene history
     */
    clearHistory(): void {
        this.sceneHistory = [];
    }
}

export default SceneManager;
