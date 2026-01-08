// Get responsive dimensions
const getResponsiveDimensions = () => {
    if (typeof window !== 'undefined') {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }
    return { width: 1280, height: 720 };
};

const dimensions = getResponsiveDimensions();

export const GameConfig = {
    // Display settings - now responsive
    width: dimensions.width,
    height: dimensions.height,
    backgroundColor: 0x0a0a0a,

    // Player settings
    player: {
        speed: 200,
        maxHealth: 100,
        scale: 1.2,
        hitboxRadius: 18,
        fireRate: 200, // ms between shots
    },

    // Zombie settings
    zombie: {
        baseHealth: 50,
        baseSpeed: 80,
        speedVariation: { min: 60, max: 100 },
        scale: 1.3,
        hitboxRadius: 20,
        attackDamage: 10,
        attackCooldown: 1000,
        eliteChance: 0.1, // 10% chance to spawn elite
    },

    // Difficulty Scaling (Multipliers per wave)
    difficulty: {
        healthMultiplier: 1.1, // +10% health per wave
        speedMultiplier: 1.05, // +5% speed per wave
        spawnDelayDecrement: 100, // -100ms spawn delay per wave
        minSpawnDelay: 500, // Minimum delay between spawns
    },

    // Bullet settings
    bullet: {
        speed: 600,
        damage: 25,
        lifetime: 2000,
    },

    // Wave settings
    wave: {
        initialZombies: 5,
        zombiesIncreasePerWave: 3, // Increased from 2
        spawnDelay: 2000, // Initial spawn delay
        waveDelay: 3000,
    },

    // Power-up settings
    powerUp: {
        dropChance: 0.05, // Reduced from 0.25 (5% chance)
        types: {
            health: { heal: 30, duration: 0 },
            speed: { multiplier: 1.5, duration: 10000 },
            rapidFire: { multiplier: 2, duration: 8000 },
            shield: { duration: 5000 },
        },
    },

    // Scoring
    scoring: {
        zombieKill: 100,
        waveBonus: 500,
        healPerWave: 20,
    },

    // Colors (hex for Phaser)
    colors: {
        bloodRed: 0x8b0000,
        bloodDark: 0x4a0000,
        bloodLight: 0xa00000,
        zombieGreen: 0x3d5c3d,
        zombieRotten: 0x4a5c23,
        boneWhite: 0xe8e4d9,
        abyssDark: 0x0a0a0a,
        abyssLight: 0x1a1a1a,
        bulletYellow: 0xffcc00,
        flashOrange: 0xff8800,
        healthGreen: 0x00ff00,
        speedBlue: 0x00bfff,
        rapidFireOrange: 0xff6600,
        shieldPurple: 0x9933ff,
    },

    // Font families
    fonts: {
        nosifer: "Nosifer, cursive",
        creepster: "Creepster, cursive",
        special: "Special Elite, cursive",
    },
} as const;

export type GameConfigType = typeof GameConfig;
export default GameConfig;
