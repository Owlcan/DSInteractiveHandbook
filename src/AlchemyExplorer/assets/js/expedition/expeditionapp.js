// Zone Patrol - Rail Shooter Mini-Game
class AlchemyBlaster {
    constructor(options = {}) {
        // Save options
        this.options = options;
        this.container = options.container || document.getElementById('expedition-container');
        this.sounds = options.sounds || {};
        this.onRewardsCollected = options.onRewardsCollected;
        this.onReturnToMenu = options.onReturnToMenu;
        this.onExit = options.onExit;
        this.enemyStyle = options.enemyStyle || 'default';
        this.zoneId = (options.zoneId && typeof options.zoneId === 'string') ? options.zoneId : 'lissome-plains';

        // Logical game resolution (gameplay math should use these, not the backing canvas size)
        this.baseWidth = Number(options.width) || 640;
        this.baseHeight = Number(options.height) || 800;
        this.baseAspect = this.baseHeight > 0 ? (this.baseWidth / this.baseHeight) : (640 / 800);

        // Current logical resolution (may resize to fit the modal/container)
        this.width = this.baseWidth;
        this.height = this.baseHeight;
        this.dpr = Math.max(1, window.devicePixelRatio || 1);
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.cursor = 'none';

        // HiDPI rendering: keep game coordinates in logical pixels, scale backing store for crisp rendering.
        this.applyCanvasResolution();
        
        // Add canvas to container if provided
        if (this.container) {
            this.container.innerHTML = '';
            this.container.appendChild(this.canvas);
        }

        // Track container sizing to avoid non-uniform CSS stretching; scale uniformly by resizing the logical canvas.
        this._lastContainerW = 0;
        this._lastContainerH = 0;
        this._handleWindowResize = () => this.maybeResizeToContainer();
        window.addEventListener('resize', this._handleWindowResize);

        // Do an initial resize after layout settles.
        setTimeout(() => this.maybeResizeToContainer(true), 0);

        this.gameState = 'loading';
        this.selectedCharacter = null; // Add character selection state
        // Run mode: 'zonePatrol' (default) | 'zonePatrolHard' | 'bossRush'
        this.runMode = 'zonePatrol';
        // Menu stage: select mode first, then character.
        this.menuStage = 'mode';
        this.isPaused = false;
        this.score = 0;
        this.round = 1;
        this.wave = 1;
        // Boss Rush mode progression
        this.bossRushBossIndex = 1;
        this._bossRushPendingRoundAdvance = false;
        this._bossRushLastAlchemyRewardScore = 0;
        this.assets = {
            images: {},
            sounds: {},
            loaded: 0,
            total: 0
        };
        this.player = null;
        this.projectiles = [];
        this.enemies = [];
        this.particles = [];
        this.powerups = [];
        this.loot = [];
        // Extra item drops earned during a run (queued and awarded only at end screen).
        this._queuedEndRewards = [];

        // Combo system: increases drop score by +0.01% per combo point.
        // Combo breaks if any drop that entered the playfield falls off uncollected.
        this.comboCount = 0;

        // Boss Rush reward: combo-rate bonus multiplier (option 4)
        this.comboRateMultiplier = 1;

        // Extra lives (earned during a run)
        this.lives = 0;
        this.maxLives = 3;

        // Dark Empress progression (Zone Patrol)
        this.empressForm = 0; // 0 = not encountered yet; otherwise 1..7
        this.lastEmpressDefeatedAtRound = null;
        this.nextEmpressDueRound = 5;
        this._greenseaEmpressCycleIndex = 0;

        // Advanced power progression (green potions)
        this.specialCharge = 0;
        this.specialChargeMax = 100;
        this.specialChargesStored = 0;
        this._lastSpecialUseAt = 0;

        // Lightweight screen overlay effects (flashes / wipes)
        this._screenFlashUntil = 0;
        this._screenFlashColor = null;
        this._screenFlashStartedAt = 0;
        this._kikiHeartWipeStartedAt = 0;
        this._kikiHeartWipeDurationMs = 0;

        // Hard-mode start flow: defer first wave until the player picks the level-30 upgrade.
        this._pendingStartWaveAfterPowerChoice = false;

        // Space-invaders formation controller (used when enemyStyle === 'invaders')
        this.invaderFormation = {
            dx: 0,
            dy: -180,
            dir: 1,
            speedPxPerMs: 0.055,
            stepDownPx: 22,
            paddingPx: 20,
            maxBottomRatio: 0.55,
            bounceCooldownMs: 0
        };
        this._lastEnemyUpdateTime = 0;
        
        // Initialize input handling
        this.keys = {
            left: false,
            right: false
        };
        this.mousePosition = { x: 0, y: 0 };
        this.isShooting = false;

        // Bind event handlers to this instance
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleContextMenu = (e) => e.preventDefault();

        this._isDestroyed = false;
        this._rafId = null;

        this.setupEventListeners();
        
        // Load assets after events are set up
        this.loadAssets();
    }

    getComboMultiplier() {
        const c = Math.max(0, Number(this.comboCount) || 0);
        // Zone Patrol design: combo is a *multiplier* that increases by a fixed amount per collected drop.
        // Nerf: ~25% slower gain.
        const rate = Math.max(0.01, Number(this.comboRateMultiplier) || 1);
        return 1 + c * 0.1875 * rate;
    }

    breakCombo() {
        this.comboCount = 0;
    }

    noteDropEnteredPlayfield(drop) {
        if (!drop) return;
        drop._comboEntered = true;
    }

    noteDropMissed(drop) {
        if (!drop) return;
        // Potions should never break combo when missed.
        if (typeof Powerup !== 'undefined' && drop instanceof Powerup) return;
        if (drop._comboEntered && !drop._comboCollected) {
            this.breakCombo();
        }
    }

    noteDropCollected(drop, baseScore = 0) {
        if (!drop) return;
        drop._comboCollected = true;
        this.comboCount = (Number(this.comboCount) || 0) + 1;
        const score = Math.max(0, Number(baseScore) || 0);
        if (score > 0) {
            this.score += Math.round(score * this.getComboMultiplier());
        }
    }

    getLegendaryRewardIds() {
        try {
            if (typeof ingredients !== 'undefined' && Array.isArray(ingredients)) {
                return ingredients
                    .filter(i => i && i.id && typeof i.category === 'string' && i.category.toLowerCase().includes('legendary'))
                    .map(i => i.id);
            }
        } catch (_) {
            // ignore
        }

        return ['night-sky', 'azure-cream', 'star-sugar', 'lunar-egg', 'starsoaked-vanilla', 'legendary1'];
    }

    getVrp100RewardIds() {
        // No explicit VRP values exist in the current item datasets; use the common Zone Patrol pool.
        const list = (typeof this.getZoneCommonItemIds === 'function') ? this.getZoneCommonItemIds() : [];
        return Array.isArray(list) && list.length ? list : ['egg', 'cream', 'rock-salt', 'savour-herb'];
    }

    getZoneConfig() {
        if (window.ZonePatrolZones && typeof window.ZonePatrolZones.getZoneConfig === 'function') {
            return window.ZonePatrolZones.getZoneConfig(this.zoneId);
        }
        return { id: this.zoneId || 'lissome-plains', displayName: 'Lissome Plains' };
    }

    isGreenseaExpanse() {
        return String(this.zoneId || '') === 'greensea-expanse';
    }

    getZoneCommonItemIds() {
        // Default: Lissome Plains common pool.
        const base = (typeof this.getLissomePlainsItemIds === 'function') ? this.getLissomePlainsItemIds() : [];
        if (!this.isGreenseaExpanse()) return base;

        // Greensea Expanse: reuse general basics, exclude any explicit "lissome" items, and add Greensea staples.
        const filtered = (Array.isArray(base) ? base : []).filter(id => id && !String(id).toLowerCase().includes('lissome'));
        const add = [
            'rice',
            'royalrice',
            'planarcherry',
            'greensea-cacao',
            'bronzewood',
            'greenwood',
            'robusca'
        ];

        return Array.from(new Set([...filtered, ...add].filter(Boolean)));
    }

    getZoneCommonDropWeights() {
        const ids = (typeof this.getZoneCommonItemIds === 'function') ? this.getZoneCommonItemIds() : [];
        const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
        // Default weight = 1; make sugar notably less frequent than other commons.
        return list.map((id) => ({ id, w: id === 'white-sugar' ? 0.35 : 1 }));
    }

    getCurrentBackgroundImage() {
        if (!this.assets || !this.assets.images) return null;

        if (this.isGreenseaExpanse()) {
            const r = Math.max(1, Number(this.round) || 1);
            const key = (r <= 5) ? 'greenseaBG1' : (r <= 10) ? 'greenseaBG2' : 'greenseaBG3';
            return this.assets.images[key] || this.assets.images.background || null;
        }

        return this.assets.images.background || null;
    }

    getCurrentForegroundImage() {
        if (!this.assets || !this.assets.images) return null;
        // Greensea Expanse has no foreground overlay.
        if (this.isGreenseaExpanse()) return null;
        return this.assets.images.foreground || null;
    }

    getWipeOutBossDamage() {
        // Damage dealt to bosses/midbosses when a wipe-out special is used.
        // Returned value is intended as *effective* damage after boss mitigation.
        const power = Math.max(1, Number(this.player?.powerLevel) || 1);
        if (power < 50) return 0;
        const steps = Math.max(0, Math.floor((power - 50) / 20));
        return Math.min(28, 8 + steps * 2);
    }

    getPotionPickupScore(type) {
        switch (type) {
            case 'health': return 35;
            case 'power': return 35;
            case 'shield': return 45;
            case 'life': return 120;
            case 'projectile': return 55;
            case 'mystic': return 85;
            default: return 0;
        }
    }

    getPowerupOnScreenLimit(type) {
        // Gameplay caps:
        // - Blue (shield) potions: max 1 on screen at a time
        // - Red (health) potions: max 2 on screen at a time
        // - Extra lives: max 1 on screen at a time
        // - Green (power) potions: no on-screen cap (but power progression caps at 200)
        if (type === 'shield') return 1;
        if (type === 'health') return 2;
        if (type === 'life') return 1;
        if (type === 'projectile') return 1;
        if (type === 'mystic') return 1;
        return Infinity;
    }

    countPowerupsOnScreen(type) {
        if (!this.powerups || !this.powerups.length) return 0;
        return this.powerups.reduce((count, p) => (p && p.type === type ? count + 1 : count), 0);
    }

    canSpawnPowerupType(type) {
        // Hard gate: don't spawn green potions once capped.
        if (type === 'power') {
            const power = Number(this.player?.powerLevel) || 1;
            if (power >= 200) return false;
        }

        // Purple (projectile) potions should not appear until charge unlock (Power 25).
        if (type === 'projectile') {
            const hasInnate = !!this.player?.hasInnateChargeShot;
            const power = Number(this.player?.powerLevel) || 1;
            if (!hasInnate && power < 25) return false;
        }

        // Hard cap: don't spawn extra lives if the player is already holding the max.
        if (type === 'life') {
            const cap = Number(this.maxLives) || 0;
            const held = Number(this.lives) || 0;
            if (cap > 0 && held >= cap) return false;
        }
        const limit = this.getPowerupOnScreenLimit(type);
        if (!Number.isFinite(limit)) return true;
        return this.countPowerupsOnScreen(type) < limit;
    }

    getLissomePlainsItemIds() {
        // Common items as defined in the design doc.
        return [
            'cotton-fluff', 'egg', 'butter', 'cream', 'birch-syrup',
            'fractal-copper', 'flour', 'rock-salt', 'savour-herb',
            'sweetleaf', 'water', 'barkgum', 'berrimaters',
            // Semi-rare common drop.
            'white-sugar'
        ];
    }

    getLissomePlainsCommonDropWeights() {
        const ids = (typeof this.getLissomePlainsItemIds === 'function') ? this.getLissomePlainsItemIds() : [];
        const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
        // Default weight = 1; make sugar notably less frequent than other commons.
        return list.map((id) => ({ id, w: id === 'white-sugar' ? 0.35 : 1 }));
    }

    queueEndRewards(rewards = []) {
        const aggregated = (rewards || [])
            .filter(r => r && r.id && (Number(r.amount) || 0) > 0)
            .map(r => ({ id: r.id, amount: Number(r.amount) || 1 }));
        if (!aggregated.length) return;
        if (!Array.isArray(this._queuedEndRewards)) this._queuedEndRewards = [];
        this._queuedEndRewards.push(...aggregated);
    }

    queueEndRewardItem(id, amount = 1) {
        if (!id) return;
        this.queueEndRewards([{ id, amount }]);
    }

    getLootBaseValue(round = this.round) {
        // Scale per-loot value from 100 (early) up to 10000 (late).
        const r = Math.max(1, Number(round) || 1);
        const t = Math.max(0, Math.min(1, (r - 1) / 39)); // round 1..40 => 0..1
        return Math.round(100 + (10000 - 100) * t);
    }

    pickTreasureTier() {
        // Order (common -> rare): bronze, silver, pamp ("diaper"), gold, scepter, chest, grimoire
        const tiers = [
            { tier: 'bronze', w: 5.0 },
            { tier: 'silver', w: 3.2 },
            { tier: 'pamp', w: 2.4 },
            { tier: 'gold', w: 1.8 },
            { tier: 'scepter', w: 1.0 },
            { tier: 'chest', w: 0.75 },
            { tier: 'grimoire', w: 0.35 }
        ];
        const totalW = tiers.reduce((sum, t) => sum + t.w, 0);
        let r = Math.random() * totalW;
        for (const t of tiers) {
            r -= t.w;
            if (r <= 0) return t.tier;
        }
        return 'bronze';
    }

    pickTreasureSpriteKeyForTier(tier) {
        const map = {
            bronze: ['bronzepile', 'bronzecrown'],
            silver: ['silverpile', 'silvercrown'],
            pamp: ['treasurepamp'],
            gold: ['goldpile', 'goldcrown'],
            scepter: ['rattlescepter'],
            chest: ['treasurechest'],
            grimoire: ['treasuregrimoire']
        };
        const options = map[tier] || map.bronze;
        return options[Math.floor(Math.random() * options.length)];
    }

    getTreasureTierValueMultiplier(tier) {
        return {
            bronze: 0.75,
            silver: 0.90,
            pamp: 1.00,
            gold: 1.05,
            scepter: 1.12,
            chest: 1.18,
            grimoire: 1.25
        }[tier] || 1.0;
    }

    spawnTreasureDrop(x, y, { countMin = 1, countMax = 1 } = {}) {
        const count = Math.max(1, Math.floor(countMin + Math.random() * (countMax - countMin + 1)));
        for (let i = 0; i < count; i++) {
            const tier = this.pickTreasureTier();
            const spriteKey = this.pickTreasureSpriteKeyForTier(tier);
            const base = this.getLootBaseValue();
            const mult = this.getTreasureTierValueMultiplier(tier);
            const jitter = 0.85 + Math.random() * 0.30;
            const value = Math.max(1, Math.min(10000, Math.round(base * mult * jitter)));

            const ox = (Math.random() - 0.5) * 240;
            const oy = (Math.random() - 0.5) * 60;
            this.loot.push(new Loot(this, x + ox, y + oy, spriteKey, value));
        }
    }

    pickWeightedPowerupType(weights) {
        const allowed = (weights || []).filter((item) => item && item.type && this.canSpawnPowerupType(item.type));
        if (!allowed.length) return null;

        const totalW = allowed.reduce((sum, item) => sum + (Number(item.w) || 0), 0);
        if (!(totalW > 0)) return null;

        let r = Math.random() * totalW;
        for (const item of allowed) {
            r -= (Number(item.w) || 0);
            if (r <= 0) return item.type;
        }
        return allowed[allowed.length - 1].type;
    }

    applyCanvasResolution() {
        // Backing-store pixels
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        this.dpr = dpr;

        this.canvas.width = Math.round(this.width * dpr);
        this.canvas.height = Math.round(this.height * dpr);

        // CSS size (actual on-screen size is controlled by CSS, but this is a sensible default)
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        // Reset any prior transforms then scale so drawing uses logical pixels.
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.ctx.imageSmoothingEnabled = true;
        try {
            this.ctx.imageSmoothingQuality = 'high';
        } catch (_) {
            // ignore
        }
    }

    handleMouseUp(e) {
        if (e.button === 0) { // Left click
            this.isShooting = false;
        }

        if (e.button === 2) { // Right click release (charge shot)
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
            if (this.gameState === 'playing' && this.player && typeof this.player.releaseChargeShot === 'function') {
                this.player.releaseChargeShot();
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('contextmenu', this.handleContextMenu);
    }

    removeEventListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mousedown', this.handleMouseDown);
            this.canvas.removeEventListener('mouseup', this.handleMouseUp);
            this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
        }
    }

    destroy() {
        if (this._isDestroyed) return;
        this._isDestroyed = true;
        if (this._rafId != null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        this.removeEventListeners();
        if (this._handleWindowResize) {
            window.removeEventListener('resize', this._handleWindowResize);
            this._handleWindowResize = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    maybeResizeToContainer(force = false) {
        if (!this.container) return;
        const cw = Math.max(0, this.container.clientWidth || 0);
        const ch = Math.max(0, this.container.clientHeight || 0);
        if (!(cw > 0 && ch > 0)) return;

        if (!force && cw === this._lastContainerW && ch === this._lastContainerH) return;
        this._lastContainerW = cw;
        this._lastContainerH = ch;

        // Fill the available space (no letterboxing). This makes the game itself
        // occupy the full expedition modal area.
        let targetW = cw;
        let targetH = ch;

        // Avoid tiny canvases when layout is mid-transition.
        targetW = Math.max(320, Math.floor(targetW));
        targetH = Math.max(400, Math.floor(targetH));

        if (!force && targetW === this.width && targetH === this.height) return;

        this.width = targetW;
        this.height = targetH;
        this.applyCanvasResolution();
    }

    async loadAssets() {
        const imagesToLoad = {
            'playerLeft': './assets/images/darklings/dereleft.webp',
            'playerRight': './assets/images/darklings/dereright.webp',
            'playerHP1': './assets/images/darklings/derehp1.webp',
            'playerHP2': './assets/images/darklings/derehp2.webp',
            'playerHP3': './assets/images/darklings/derehp3.webp',
            'shot1': './assets/images/darklings/shot1.webp',
            'shot1a': './assets/images/darklings/shot1a.webp',
            'shot1b': './assets/images/darklings/shot1b.webp',
            'shotImpact1': './assets/images/darklings/shotimpact1.webp',
            'shotImpact2': './assets/images/darklings/shotimpact2.webp',
            // Dere charged shot sprite
            'dereShotCharge': './assets/images/darklings/dereshotcharge.webp',
            'background': './assets/images/darklings/lissomeplainsBG.webp',
            'foreground': './assets/images/darklings/lissomeplainsFG.webp',
            // Greensea Expanse backgrounds
            'greenseaBG1': './assets/images/darklings/greenseaBG1.webp',
            'greenseaBG2': './assets/images/darklings/greenseaBG2.webp',
            'greenseaBG3': './assets/images/darklings/greenseaBG3.webp',
            'gameOver': './assets/images/darklings/deregameover.webp',
            // Aliza character sprites
            'alizaLeft': './assets/images/darklings/alizaleft.webp',
            'alizaRight': './assets/images/darklings/alizaright.webp',
            'alizaShot1': './assets/images/darklings/alizashot1.webp',
            'alizaShot2': './assets/images/darklings/alizashot2.webp',
            'alizaShot3': './assets/images/darklings/alizashot3.webp',
            'alizaShotImpact1': './assets/images/darklings/alizashotimpact1.webp',
            'alizaShotImpact2': './assets/images/darklings/alizashotimpact2.webp',
            // Character select images
            'dereharacterselect': './assets/images/darklings/dereharacterselect.webp',
            'alizacharacterselect': './assets/images/darklings/alizacharacterselect.webp',
            'kaskitcharacterselect': './assets/images/darklings/kaskitselect.webp',
            'kikicharacterselect': './assets/images/darklings/kikicharacterselect.webp',
            // Add potion images
            'healthPotion': './assets/images/darklings/health_potion.webp',
            'powerPotion': './assets/images/darklings/power_potion.webp',
            'shieldPotion': './assets/images/darklings/shield_potion.webp',
            'projectilePotion': './assets/images/darklings/projectile_potion.webp',
            'mysticTonic': './assets/images/Mystic Surge Tonic.webp',
            // Treasure (score loot)
            'bronzecrown': './assets/images/treasure/bronzecrown.webp',
            'bronzepile': './assets/images/treasure/bronzepile.webp',
            'silvercrown': './assets/images/treasure/silvercrown.webp',
            'silverpile': './assets/images/treasure/silverpile.webp',
            'goldcrown': './assets/images/treasure/goldcrown.webp',
            'goldpile': './assets/images/treasure/goldpile.webp',
            'rattlescepter': './assets/images/treasure/rattlescepter.webp',
            'treasurechest': './assets/images/treasure/treasurechest.webp',
            'treasuregrimoire': './assets/images/treasure/treasuregrimoire.webp',
            'treasurepamp': './assets/images/treasure/treasurepamp.webp',
            // Enemy sprites with correct paths using darklingmob filenames
            'darkling1': './assets/images/darklings/darklingmob1.webp',
            'darkling2': './assets/images/darklings/darklingmob2.webp',
            'darkling3': './assets/images/darklings/darklingmob3.webp',
            'darkling4': './assets/images/darklings/darklingmob4.webp',
            'darkling5': './assets/images/darklings/darklingmob5.webp',
            'darkling6': './assets/images/darklings/darklingmob6.webp',
            'darkling7': './assets/images/darklings/darklingmob7.webp',
            'darkling8': './assets/images/darklings/darklingmob8.webp',
            'darkling9': './assets/images/darklings/darklingmob9.webp',
            'darkling10': './assets/images/darklings/darklingmob10.webp',
            'darkling11': './assets/images/darklings/darklingmob11.webp',
            'darkling12': './assets/images/darklings/darklingmob12.webp',
            'darkling13': './assets/images/darklings/darklingmob13.webp',
            'darkling14': './assets/images/darklings/darklingmob14.webp',
            'darkling15': './assets/images/darklings/darklingmob15.webp',
            'darkling16': './assets/images/darklings/darklingmob16.webp',
            'darkling17': './assets/images/darklings/darklingmob17.webp',
            'darkling18': './assets/images/darklings/darklingmob18.webp',
            'darkling19': './assets/images/darklings/darklingmob19.webp',
            'darkling20': './assets/images/darklings/darklingmob20.webp',
            'darkling21': './assets/images/darklings/darklingmob21.webp',
            'darkling22': './assets/images/darklings/darklingmob22.webp',
            'darkling23': './assets/images/darklings/darklingmob23.webp',
            'darkling24': './assets/images/darklings/darklingmob24.webp',
            'darkling25': './assets/images/darklings/darklingmob25.webp',
            'darkling26': './assets/images/darklings/darklingmob26.webp',
            'darkling27': './assets/images/darklings/darklingmob27.webp',

            // Greensea Expanse mobs (use filenames directly as type keys)
            'darklingmob33': './assets/images/darklings/darklingmob33.webp',
            'darklingmob34': './assets/images/darklings/darklingmob34.webp',
            'darklingmob35': './assets/images/darklings/darklingmob35.webp',
            'darklingmob36': './assets/images/darklings/darklingmob36.webp',
            'darklingmob37': './assets/images/darklings/darklingmob37.webp',
            'darklingmob38': './assets/images/darklings/darklingmob38.webp',
            'darklingmob39': './assets/images/darklings/darklingmob39.webp',
            'darklingmob40': './assets/images/darklings/darklingmob40.webp',
            'darklingmob41': './assets/images/darklings/darklingmob41.webp',
            'darklingmob42': './assets/images/darklings/darklingmob42.webp',
            'darklingmob43': './assets/images/darklings/darklingmob43.webp',
            'darklingmob44': './assets/images/darklings/darklingmob44.webp',
            'darklingmob45': './assets/images/darklings/darklingmob45.webp',
            'darklingmob46': './assets/images/darklings/darklingmob46.webp',
            'darklingmob47': './assets/images/darklings/darklingmob47.webp',
            'darklingmob48': './assets/images/darklings/darklingmob48.webp',
            'darklingmob49': './assets/images/darklings/darklingmob49.webp',
            'darklingmob50': './assets/images/darklings/darklingmob50.webp',
            'darklingmob51': './assets/images/darklings/darklingmob51.webp',
            // Infantry set (also used as late-round mobs)
            'darklingmob52': './assets/images/darklings/darklingmob52.webp',
            'darklingmob53': './assets/images/darklings/darklingmob53.webp',
            'darklingmob54': './assets/images/darklings/darklingmob54.webp',
            'darklingmob55': './assets/images/darklings/darklingmob55.webp',
            'darklingmob56': './assets/images/darklings/darklingmob56.webp',
            'darklingmob57': './assets/images/darklings/darklingmob57.webp',
            'darklingmob58': './assets/images/darklings/darklingmob58.webp',
            'darklingmob59': './assets/images/darklings/darklingmob59.webp',
            'darklingmob60': './assets/images/darklings/darklingmob60.webp',
            // Late Greensea mobs
            'darklingmob61': './assets/images/darklings/darklingmob61.webp',
            'darklingmob62': './assets/images/darklings/darklingmob62.webp',
            'darklingmob63': './assets/images/darklings/darklingmob63.webp',

            'darklingboss1': './assets/images/darklings/darklingboss1.webp',
            'darklingboss2': './assets/images/darklings/darklingboss2.webp',
            'darklingboss3': './assets/images/darklings/darklingboss3.webp',

            // Greensea Expanse bosses
            'darklingboss4': './assets/images/darklings/darklingboss4.webp',
            'darklingboss5': './assets/images/darklings/darklingboss5.webp',
            'darklingboss6': './assets/images/darklings/darklingboss6.webp',
            'darklingboss7': './assets/images/darklings/darklingboss7.webp',
            'darklingboss8': './assets/images/darklings/darklingboss8.webp',
            'darklingboss9': './assets/images/darklings/darklingboss9.webp',
            'darklingboss10': './assets/images/darklings/darklingboss10.webp',
            // Darkling Dragon (animated frames)
            'darkdragon1': './assets/images/darklings/darkdragon1.webp',
            'darkdragon2': './assets/images/darklings/darkdragon2.webp',
            'darkdragon3': './assets/images/darklings/darkdragon3.webp',
            'darkdragon4': './assets/images/darklings/darkdragon4.webp',
            'darkdragon5': './assets/images/darklings/darkdragon5.webp',
            'darkdragon6': './assets/images/darklings/darkdragon6.webp',
            'darkdragon7': './assets/images/darklings/darkdragon7.webp',
            'darkdragon8': './assets/images/darklings/darkdragon8.webp',
            'darkdragon9': './assets/images/darklings/darkdragon9.webp',
            'darkdragon10': './assets/images/darklings/darkdragon10.webp',
            'darkdragon11': './assets/images/darklings/darkdragon11.webp',
            'darkdragon12': './assets/images/darklings/darkdragon12.webp',
            // New bosses / midbosses
            'darkempress0': './assets/images/darklings/darkempress0.webp',
            'darkempress1': './assets/images/darklings/darkempress1.webp',
            'darkempress2': './assets/images/darklings/darkempress2.webp',
            'darkempress3': './assets/images/darklings/darkempress3.webp',
            'darkempress4': './assets/images/darklings/darkempress4.webp',
            'darkempress5': './assets/images/darklings/darkempress5.webp',
            'darkempress6': './assets/images/darklings/darkempress6.webp',
            'darkempress7': './assets/images/darklings/darkempress7.webp',
            'darkempress8': './assets/images/darklings/darkempress8.webp',

            // Darkling Princesses
            'darkprincess1': './assets/images/darklings/darkprincess1.webp',
            'darkprincess2': './assets/images/darklings/darkprincess2.webp',
            'darkprincess3': './assets/images/darklings/darkprincess3.webp',
            // Zone Patrol bosses (midboss set)
            'darkmidboss1': './assets/images/darklings/darkmidboss1.webp',
            'darkmidboss2': './assets/images/darklings/darkmidboss2.webp',
            'darkmidboss3': './assets/images/darklings/darkmidboss3.webp',
            'darkmidboss4': './assets/images/darklings/darkmidboss4.webp',
            'darkmidboss5': './assets/images/darklings/darkmidboss5.webp',
            'darkmidboss6': './assets/images/darklings/darkmidboss6.webp',
            'darkmidboss7': './assets/images/darklings/darkmidboss7.webp',
            'darkmidboss8': './assets/images/darklings/darkmidboss8.webp',
            'darkmidboss9': './assets/images/darklings/darkmidboss9.webp',
            'darkmidboss10': './assets/images/darklings/darkmidboss10.webp',
            'darkmidboss11': './assets/images/darklings/darkmidboss11.webp',
            'darkmidboss12': './assets/images/darklings/darkmidboss12.webp',
            'darkmidboss13': './assets/images/darklings/darkmidboss13.webp',
            'darkmidboss14': './assets/images/darklings/darkmidboss14.webp',
            'darkmidboss15': './assets/images/darklings/darkmidboss15.webp',
            'darkforgedtitans1': './assets/images/darklings/darkforgedtitans (1).webp',
            'darkforgedtitans2': './assets/images/darklings/darkforgedtitans (2).webp',
            'darkforgedtitans3': './assets/images/darklings/darkforgedtitans (3).webp',
            'darkforgedtitans4': './assets/images/darklings/darkforgedtitans (4).webp',
            'darkforgedtitans5': './assets/images/darklings/darkforgedtitans (5).webp',
            'darkforgedtitans6': './assets/images/darklings/darkforgedtitans (6).webp',
            'darklingcolossus': './assets/images/darklings/darklingcolossus.webp',
            'darklingcolossusascendant': './assets/images/darklings/darklingcolossusascendant.webp',
            // Enemy projectile sprites
            'darklingshot1': './assets/images/darklings/darklingshot1.webp',
            'darklingshot2': './assets/images/darklings/darklingshot2.webp',
            'darklingshot3': './assets/images/darklings/darklingshot3.webp',
            'darklingshot4': './assets/images/darklings/darklingshot4.webp',
            'darklingshot5': './assets/images/darklings/darklingshot5.webp',
            'darklingshot6': './assets/images/darklings/darklingshot6.webp',
            'darklingshot7': './assets/images/darklings/darklingshot7.webp',
            'darklingshot8': './assets/images/darklings/darklingshot8.webp',
            'darklingshotimpact': './assets/images/darklings/darklingshotimpact.webp',
            'deregameover': './assets/images/darklings/deregameover.webp',
            'alizagameover': './assets/images/darklings/alizagameover.webp',

            // Kaskit character sprites
            'kaskitLeft': './assets/images/darklings/kaskit_left.webp',
            'kaskitRight': './assets/images/darklings/kaskit_right.webp',
            'kaskitDagger1': './assets/images/darklings/kaskitdaggers1.webp',
            'kaskitDagger2': './assets/images/darklings/kaskitdaggers2.webp',
            'kaskitDagger3': './assets/images/darklings/kaskitdaggers3.webp',
            'kaskitDagger4': './assets/images/darklings/kaskitdaggers4.webp',
            'kaskitgameover': './assets/images/darklings/kaskitgameover.webp',

            // Kiki character sprites
            'kikiLeft': './assets/images/darklings/kiki_left.webp',
            'kikiRight': './assets/images/darklings/kiki_right.webp',
            'kikiShot1': './assets/images/darklings/kikishot1.webp',
            'kikiShot2': './assets/images/darklings/kikishot2.webp',
            'kikiShot3': './assets/images/darklings/kikishot3.webp',
            'kikiShot4': './assets/images/darklings/kikishot4.webp',
            'kikiBeam': './assets/images/darklings/kikibeam.webp',
            'kikigameover': './assets/images/darklings/kikigameover.webp',

            // UI overlay
            'pauseUpgradeOverlay': './assets/images/darklings/pauseandupgrademenuoverlay.webp',

            // HUD bars (10-segment visuals)
            'hpbar10full': './assets/images/darklings/hpbar10full.webp',
            'hpbar9': './assets/images/darklings/hpbar9.webp',
            'hpbar8': './assets/images/darklings/hpbar8.webp',
            'hpbar7': './assets/images/darklings/hpbar7.webp',
            'hpbar6': './assets/images/darklings/hpbar6.webp',
            'hpbar5': './assets/images/darklings/hpbar5.webp',
            'hpbar4': './assets/images/darklings/hpbar4.webp',
            'hpbar3': './assets/images/darklings/hpbar3.webp',
            'hpbar2': './assets/images/darklings/hpbar2.webp',
            'hpbar1': './assets/images/darklings/hpbar1.webp',

            'powerbar10full': './assets/images/darklings/powerbar10full.webp',
            'powerbar9': './assets/images/darklings/powerbar9.webp',
            'powerbar8': './assets/images/darklings/powerbar8.webp',
            'powerbar7': './assets/images/darklings/powerbar7.webp',
            'powerbar6': './assets/images/darklings/powerbar6.webp',
            'powerbar5': './assets/images/darklings/powerbar5.webp',
            'powerbar4': './assets/images/darklings/powerbar4.webp',
            'powerbar3': './assets/images/darklings/powerbar3.webp',
            'powerbar2': './assets/images/darklings/powerbar2.webp',
            'powerbar1': './assets/images/darklings/powerbar1.webp',
            'powerbar0empty': './assets/images/darklings/powerbar0empty.webp',

            'shieldbar10full': './assets/images/darklings/shieldbar10full.webp',
            'shieldbar9': './assets/images/darklings/shieldbar9.webp',
            'shieldbar8': './assets/images/darklings/shieldbar8.webp',
            'shieldbar7': './assets/images/darklings/shieldbar7.webp',
            'shieldbar6': './assets/images/darklings/shieldbar6.webp',
            'shieldbar5': './assets/images/darklings/shieldbar5.webp',
            'shieldbar4': './assets/images/darklings/shieldbar4.webp',
            'shieldbar3': './assets/images/darklings/shieldbar3.webp',
            'shieldbar2': './assets/images/darklings/shieldbar2.webp',
            'shieldbar1': './assets/images/darklings/shieldbar1.webp',
            'shieldbar0empty': './assets/images/darklings/shieldbar0empty.webp',

            'specialbar': './assets/images/darklings/specialbar.webp',
        };

        // Print out all image paths to confirm they exist
        console.log("Loading the following image paths:", Object.values(imagesToLoad));

        const soundsToLoad = {
            hit1: 'hit1.wav',
            hit2: 'hit2.wav',
            shoot: 'shoot.wav',
            victory: 'victory.wav',
            victory1: 'victory1.wav',
            victory2: 'victory2.wav',
            gameOver: 'gameover.wav',
            gameOver1: 'gameover1.wav',
            spellfire: ['spellfire.wav', 'spellfire1.mp3', 'spellfire2.mp3', 'spellfire3.mp3'],
            // Add potion sounds
            potion1: 'potion1.wav',
            potion2: 'potion2.wav',
            potion3: 'potion3.wav',
            potion4: 'potion4.wav',
            // Add Aliza's sounds
            alizaVictory1: 'alizavictory1.wav',
            alizaVictory2: 'alizavictory2.wav',
            alizaGameOver1: 'alizagameover1.wav',
            alizaGameOver2: 'alizagameover2.wav',
            alizaHit1: 'alizahit1.wav',
            alizaHit2: 'alizahit2.wav',

            // Kaskit sounds
            kaskitHit1: 'oh come on kaskit.wav',
            kaskitHit2: 'watch the diaper dark dorks kaskit.wav',
            kaskitHitRare: 'we are all shadow kin here kaskit.wav',
            kaskitGameOver: 'kaskitgameover.wav',

            // Kiki sounds
            kikiHit: 'ouchkiki.wav',
            kikiGameOver1: 'kikivictoryORgameover.wav',
            kikiGameOver2: 'gameoverkiki.wav'
        };

        this.assets.total = Object.keys(imagesToLoad).length + Object.keys(soundsToLoad).length;

        // Load images
        for (const [key, path] of Object.entries(imagesToLoad)) {
            this.loadImage(key, path);
        }

        // Load sounds
        for (const [key, path] of Object.entries(soundsToLoad)) {
            if (Array.isArray(path)) {
                this.assets.sounds[key] = path.map(p => this.loadSound(p));
            } else {
                this.assets.sounds[key] = this.loadSound(path);
            }
        }
    }

    loadImage(key, path) {
        const img = new Image();
        img.src = path;
        console.log(`Loading image: ${key} from path: ${path}`);
        img.onload = () => {
            console.log(`Successfully loaded image: ${key}`);
            this.assets.images[key] = img;
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
        img.onerror = (error) => {
            console.error(`Failed to load image: ${key} from path: ${path}`, error);
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
    }

    loadSound(path) {
        const fullPath = `assets/sounds/${path}`;
        const resolved = (window.__PORTABLE_ASSET_URLS && window.__PORTABLE_ASSET_URLS[fullPath]) ? window.__PORTABLE_ASSET_URLS[fullPath] : fullPath;
        const audio = new Audio(resolved);
        audio.oncanplaythrough = () => {
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
        audio.onerror = () => {
            console.error(`Failed to load sound: ${path}`);
            this.assets.loaded++;
            this.checkAllAssetsLoaded();
        };
        return audio;
    }

    checkAllAssetsLoaded() {
        if (this.assets.loaded === this.assets.total) {
            this.initGame();
        }
    }

    initGame() {
        this.gameState = 'menu';
        this.player = new Player(this);

        // Default menu stage when starting a new run.
        this.menuStage = 'mode';
        this.runMode = 'zonePatrol';
        this.bossRushBossIndex = 1;
        this._bossRushPendingRoundAdvance = false;
        this._bossRushLastAlchemyRewardScore = 0;

        // Reset formation state when (re)starting the game
        this.invaderFormation.dx = 0;
        this.invaderFormation.dy = -180;
        this.invaderFormation.dir = 1;
        this.invaderFormation.bounceCooldownMs = 0;

        this.startGameLoop();
    }

    startGameLoop() {
        const tick = () => {
            if (this._isDestroyed) return;
            this.update();
            this.draw();
            this._rafId = requestAnimationFrame(tick);
        };

        if (this._rafId != null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }

        tick();
    }

    closeEndScreen() {
        const parent = this.canvas && this.canvas.parentElement;
        if (!parent) return;
        const existing = parent.querySelectorAll('.game-over-screen');
        existing.forEach((el) => el && el.remove && el.remove());
    }

    escapeHtml(text) {
        return String(text)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    getIngredientInfoById(id) {
        try {
            if (typeof ingredients !== 'undefined' && Array.isArray(ingredients)) {
                const found = ingredients.find(i => i && i.id === id);
                if (found) return found;
            }
        } catch (_) {
            // ignore
        }
        return null;
    }

    showEndScreen({ title, subtitle } = {}) {
        // Ensure we never stack multiple overlays.
        this.closeEndScreen();
        const rewards = arguments[0] && Array.isArray(arguments[0].rewardsOverride)
            ? arguments[0].rewardsOverride
            : this.distributeRewards();

        const endScreen = document.createElement('div');
        endScreen.className = 'game-over-screen';
        endScreen.style.maxHeight = 'calc(100% - 24px)';
        endScreen.style.overflow = 'hidden';
        // Make sure the overlay is actually on top (expedition.html doesn't define this CSS).
        endScreen.style.position = 'absolute';
        endScreen.style.top = '50%';
        endScreen.style.left = '50%';
        endScreen.style.transform = 'translate(-50%, -50%)';
        endScreen.style.zIndex = '2000';
        endScreen.style.minWidth = '320px';
        endScreen.style.maxWidth = 'min(560px, calc(100% - 16px))';
        endScreen.style.background = 'rgba(0, 0, 0, 0.9)';
        endScreen.style.borderRadius = '10px';
        endScreen.style.padding = '16px';

        const receivedItemsHTML = (rewards || [])
            .map((reward) => {
                const itemId = reward && reward.id ? reward.id : null;
                const amount = reward && typeof reward.amount === 'number' ? reward.amount : 0;
                if (!itemId || amount <= 0) return '';

                const meta = this.getIngredientInfoById(itemId);
                const name = meta && meta.name ? meta.name : itemId;
                const label = amount > 1 ? `${name} x${amount}` : name;
                const img = meta && meta.image ? meta.image : null;

                if (img) {
                    return `<div class="received-item"><img src="${this.escapeHtml(img)}" alt="${this.escapeHtml(name)}"><span>${this.escapeHtml(label)}</span></div>`;
                }
                return `<div class="received-item"><span>${this.escapeHtml(label)}</span></div>`;
            })
            .filter(Boolean)
            .join('');

        const safeTitle = title ? this.escapeHtml(title) : 'Run Complete';
        const safeSubtitle = subtitle ? this.escapeHtml(subtitle) : '';

        endScreen.innerHTML = `
            <div class="game-over-content">
                <div style="margin: 0 0 8px 0;">
                    <h2 style="margin: 0; font-size: 28px;">${safeTitle}</h2>
                    ${safeSubtitle ? `<p style="margin: 6px 0 0 0; opacity: 0.9;">${safeSubtitle}</p>` : ''}
                </div>
                <div style="margin: 6px 0 10px 0;">
                    <h3 style="margin: 0; font-size: 20px;">Final Score: ${this.score}</h3>
                    ${rewards.length > 0 ?
                        `<div class="received-items" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 10px; max-height: 220px; overflow-y: auto; padding: 4px; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px;">
                            ${receivedItemsHTML}
                        </div>`
                        : '<p style="margin: 10px 0 0 0;">No items were collected.</p>'
                    }
                </div>
                <div class="game-over-buttons" style="margin-top: 10px;">
                    <button class="retry-btn">Try Again</button>
                    <button class="menu-btn">Return to Menu</button>
                    <button class="exit-btn">Exit</button>
                </div>
            </div>
        `;

        // Add CSS for received items (once)
        if (!document.getElementById('expedition-received-items-style')) {
            const style = document.createElement('style');
            style.id = 'expedition-received-items-style';
            style.textContent = `
                .received-item {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    margin: 2px;
                    font-size: 10px;
                    color: #fff;
                }
                .received-item img {
                    width: 28px;
                    height: 28px;
                    object-fit: contain;
                }
                .received-item span {
                    margin-top: 2px;
                    white-space: nowrap;
                    max-width: 90px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .received-items::-webkit-scrollbar {
                    width: 8px;
                }
                .received-items::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.25);
                    border-radius: 8px;
                }
                .received-items::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.2);
                }
            `;
            document.head.appendChild(style);
        }

        this.canvas.parentElement.appendChild(endScreen);

        const retryBtn = endScreen.querySelector('.retry-btn');
        const menuBtn = endScreen.querySelector('.menu-btn');
        const exitBtn = endScreen.querySelector('.exit-btn');

        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.closeEndScreen();
                this.resetGame();
            });
        }

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.closeEndScreen();
                if (typeof this.onReturnToMenu === 'function') {
                    this.onReturnToMenu();
                } else {
                    this.gameState = 'menu';
                }
            });
        }

        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                this.closeEndScreen();
                if (typeof this.onExit === 'function') {
                    this.onExit();
                } else if (typeof this.onReturnToMenu === 'function') {
                    this.onReturnToMenu();
                }
            });
        }
    }

    update() {
        if (this.gameState !== 'playing' || this.isPaused) return;

        if (this.player) {
            this.player.update();
            this.updateProjectiles();
            this.updateEnemies();
            this.updateParticles();
            this.updateLoot();
            this.updatePowerups();
            this.checkCollisions();
            this.checkWaveProgress();
        }
    }

    draw() {
        this.maybeResizeToContainer();

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background
        const bg = this.getCurrentBackgroundImage();
        if (bg) {
            this.ctx.drawImage(bg, 0, 0, this.width, this.height);
        }

        // Draw the game world (enemies/projectiles/powerups/player) for gameplay states
        if (this.gameState === 'playing' || this.gameState === 'paused' || this.gameState === 'powerChoice') {
            this.drawGameState();
        }

        // Draw foreground as a world overlay, but keep HUD/UI above it.
        const fg = this.getCurrentForegroundImage();
        if (fg && (this.gameState === 'playing' || this.gameState === 'paused' || this.gameState === 'powerChoice')) {
            this.ctx.drawImage(fg, 0, 0, this.width, this.height);
        }

        // Handle different game states (UI/overlays are always drawn last)
        switch(this.gameState) {
            case 'menu':
                // Draw mode selection, then character selection
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
                this.ctx.fillRect(0, 0, this.width, this.height);
                if (this.assets.images.pauseUpgradeOverlay) {
                    this.ctx.drawImage(this.assets.images.pauseUpgradeOverlay, 0, 0, this.width, this.height);
                }
                this.ctx.restore();

                // Gold Cinzel styling (matches pause/upgrade overlays)
                this.ctx.fillStyle = '#d4af37';
                this.ctx.strokeStyle = '#6b4e00';
                this.ctx.lineWidth = 5;
                this.ctx.textAlign = 'center';
                this.ctx.font = 'bold 42px Cinzel, serif';

                if (this.menuStage === 'mode') {
                    // Move the mode menu down ~30%, but clamp so all boxes fit on-screen.
                    const desiredShiftY = Math.round(this.height * 0.30);
                    const title = 'Select Mode';
                    const boxW = 440;
                    const boxH = 140;
                    const gap = 30;
                    const x = (this.width - boxW) / 2;
                    const baseY1 = 180;
                    const groupH = (3 * boxH) + (2 * gap);
                    const maxY1 = Math.max(20, Math.round(this.height - groupH - 20));
                    const y1 = Math.min(baseY1 + desiredShiftY, maxY1);
                    const appliedShiftY = y1 - baseY1;
                    const y2 = y1 + boxH + gap;
                    const y3 = y2 + boxH + gap;

                    this.ctx.strokeText(title, this.width/2, 64 + appliedShiftY);
                    this.ctx.fillText(title, this.width/2, 64 + appliedShiftY);

                    this.ctx.font = 'bold 22px Cinzel, serif';
                    this.ctx.strokeText('1) Zone Patrol', this.width / 2, 104 + appliedShiftY);
                    this.ctx.fillText('1) Zone Patrol', this.width / 2, 104 + appliedShiftY);
                    this.ctx.strokeText('2) Boss Rush', this.width / 2, 136 + appliedShiftY);
                    this.ctx.fillText('2) Boss Rush', this.width / 2, 136 + appliedShiftY);
                    this.ctx.strokeText('3) Zone Patrol (Hard)', this.width / 2, 168 + appliedShiftY);
                    this.ctx.fillText('3) Zone Patrol (Hard)', this.width / 2, 168 + appliedShiftY);

                    const drawModeBox = (label, desc, y, selected) => {
                        this.ctx.save();
                        this.ctx.fillStyle = selected ? 'rgba(40, 140, 255, 0.25)' : 'rgba(255,255,255,0.08)';
                        this.ctx.strokeStyle = selected ? 'rgba(160, 220, 255, 0.95)' : 'rgba(255,255,255,0.55)';
                        this.ctx.lineWidth = selected ? 4 : 2;
                        this.ctx.fillRect(x, y, boxW, boxH);
                        this.ctx.strokeRect(x, y, boxW, boxH);

                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.strokeStyle = 'rgba(0,0,0,0.85)';
                        this.ctx.lineWidth = 4;
                        this.ctx.font = 'bold 28px Cinzel, serif';
                        this.ctx.strokeText(label, this.width / 2, y + 42);
                        this.ctx.fillText(label, this.width / 2, y + 42);

                        this.ctx.font = 'bold 16px Cinzel, serif';
                        this.ctx.lineWidth = 3;
                        this.ctx.strokeText(desc, this.width / 2, y + 88);
                        this.ctx.fillText(desc, this.width / 2, y + 88);
                        this.ctx.restore();
                    };

                    drawModeBox('Zone Patrol', 'Waves of mobs with a boss at the end of every round.', y1, this.runMode === 'zonePatrol');
                    drawModeBox('Boss Rush', 'Boss after boss. Starts at Power 10 with 2 lives.', y2, this.runMode === 'bossRush');
                    drawModeBox('Zone Patrol (Hard)', 'Start at Round 5 with 50 Power and full shield.', y3, this.runMode === 'zonePatrolHard');
                } else {
                    const title = 'Select Your Character';
                    this.ctx.strokeText(title, this.width/2, 64);
                    this.ctx.fillText(title, this.width/2, 64);

                    // Draw character options (2x2 grid)
                    const charWidth = 200;
                    const charHeight = 240;
                    const spacingX = 90;
                    const spacingY = 80;
                    const cols = 2;
                    const totalW = cols * charWidth + (cols - 1) * spacingX;
                    const startX = (this.width - totalW) / 2;
                    const startY = 105;

                    const cards = [
                        { id: 'dere', name: 'Dere', img: 'dereharacterselect' },
                        { id: 'aliza', name: 'Aliza', img: 'alizacharacterselect' },
                        { id: 'kaskit', name: 'Kaskit', img: 'kaskitcharacterselect' },
                        { id: 'kiki', name: 'Kiki', img: 'kikicharacterselect' }
                    ];

                    this.ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                    this.ctx.lineWidth = 2;
                    this.ctx.font = 'bold 22px Cinzel, serif';

                    for (let i = 0; i < cards.length; i++) {
                        const col = i % cols;
                        const row = Math.floor(i / cols);
                        const x = startX + col * (charWidth + spacingX);
                        const y = startY + row * (charHeight + spacingY);

                        const imgKey = cards[i].img;
                        if (this.assets.images[imgKey]) {
                            this.ctx.drawImage(this.assets.images[imgKey], x, y, charWidth, charHeight);
                        }
                        this.ctx.strokeRect(x, y, charWidth, charHeight);
                        this.ctx.save();
                        this.ctx.fillStyle = '#d4af37';
                        this.ctx.strokeStyle = '#6b4e00';
                        this.ctx.lineWidth = 4;
                        this.ctx.strokeText(cards[i].name, x + charWidth / 2, y + charHeight + 34);
                        this.ctx.fillText(cards[i].name, x + charWidth / 2, y + charHeight + 34);
                        this.ctx.restore();
                    }
                }

                // Draw a cursor/reticle in menu because the canvas cursor is hidden
                this.ctx.save();
                this.ctx.strokeStyle = 'rgba(255, 80, 80, 0.95)';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 16, 0, Math.PI * 2);
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.moveTo(this.mousePosition.x - 10, this.mousePosition.y);
                this.ctx.lineTo(this.mousePosition.x + 10, this.mousePosition.y);
                this.ctx.moveTo(this.mousePosition.x, this.mousePosition.y - 10);
                this.ctx.lineTo(this.mousePosition.x, this.mousePosition.y + 10);
                this.ctx.stroke();
                this.ctx.restore();
                break;

            case 'bossRushRewardChoice':
                // Freeze gameplay, show end-of-round boss rush choice overlay
                this.drawUI();

                this.ctx.save();
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                this.ctx.fillRect(0, 0, this.width, this.height);

                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = '#ffffff';
                this.ctx.strokeStyle = 'rgba(0,0,0,0.85)';
                this.ctx.lineWidth = 4;

                this.ctx.font = 'bold 32px Arial';
                this.ctx.strokeText('Boss Rush Reward', this.width / 2, this.height / 2 - 140);
                this.ctx.fillText('Boss Rush Reward', this.width / 2, this.height / 2 - 140);

                const boxW = 290;
                const boxH = 104;
                const gap = 22;
                const totalW = boxW * 2 + gap;
                const x1 = (this.width - totalW) / 2;
                const x2 = x1 + boxW + gap;
                const y1 = this.height / 2 - boxH - Math.floor(gap / 2);
                const y2 = y1 + boxH + gap;

                const drawChoiceBox = (label, sub, x, y) => {
                    this.ctx.save();
                    this.ctx.fillStyle = 'rgba(255,255,255,0.08)';
                    this.ctx.strokeStyle = 'rgba(255,255,255,0.6)';
                    this.ctx.lineWidth = 2;
                    this.ctx.fillRect(x, y, boxW, boxH);
                    this.ctx.strokeRect(x, y, boxW, boxH);

                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.strokeStyle = 'rgba(0,0,0,0.85)';
                    this.ctx.lineWidth = 3;
                    this.ctx.font = 'bold 22px Arial';
                    this.ctx.strokeText(label, x + boxW / 2, y + 40);
                    this.ctx.fillText(label, x + boxW / 2, y + 40);

                    this.ctx.font = '16px Arial';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeText(sub, x + boxW / 2, y + 76);
                    this.ctx.fillText(sub, x + boxW / 2, y + 76);
                    this.ctx.restore();
                };

                drawChoiceBox('1) Fill HP', 'Restore to full health.', x1, y1);
                drawChoiceBox('2) +10 Power', 'Gain 10 power levels.', x2, y1);
                drawChoiceBox('3) Bigger + Faster Charge', '+8% projectile size, +10% charge speed.', x1, y2);
                drawChoiceBox('4) +5% Combo Rate', 'Boost combo multiplier growth.', x2, y2);

                this.ctx.font = '16px Arial';
                this.ctx.lineWidth = 3;
                this.ctx.strokeText('Press 1-4 (or click).', this.width / 2, y2 + boxH + 44);
                this.ctx.fillText('Press 1-4 (or click).', this.width / 2, y2 + boxH + 44);

                this.ctx.restore();
                break;

            case 'playing':
                // Draw targeting reticle
                if (this.selectedCharacter === 'aliza') {
                    // Aliza's targeting reticle - larger and more ornate
                    this.ctx.strokeStyle = '#ff69b4'; // Hot pink
                    this.ctx.lineWidth = 3;
                    
                    // Outer circle
                    this.ctx.beginPath();
                    this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 25, 0, Math.PI * 2);
                    this.ctx.stroke();
                    
                    // Inner circle
                    this.ctx.beginPath();
                    this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 12, 0, Math.PI * 2);
                    this.ctx.stroke();
                    
                    // Diagonal crosshairs
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.mousePosition.x - 18, this.mousePosition.y - 18);
                    this.ctx.lineTo(this.mousePosition.x + 18, this.mousePosition.y + 18);
                    this.ctx.moveTo(this.mousePosition.x + 18, this.mousePosition.y - 18);
                    this.ctx.lineTo(this.mousePosition.x - 18, this.mousePosition.y + 18);
                    this.ctx.stroke();
                } else {
                    // Dere's original targeting reticle
                    this.ctx.strokeStyle = 'red';
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 18, 0, Math.PI * 2);
                    this.ctx.stroke();
                    
                    // Draw crosshair
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.mousePosition.x - 12, this.mousePosition.y);
                    this.ctx.lineTo(this.mousePosition.x + 12, this.mousePosition.y);
                    this.ctx.moveTo(this.mousePosition.x, this.mousePosition.y - 12);
                    this.ctx.lineTo(this.mousePosition.x, this.mousePosition.y + 12);
                    this.ctx.stroke();
                }

                this.drawUI();
                break;

            case 'powerChoice':
                // Freeze gameplay, show upgrade choice overlay
                this.drawUI();
                this.drawPowerChoiceOverlay();
                break;

            case 'powerChoice130':
                // Freeze gameplay, show perk choice overlay
                this.drawUI();
                this.drawPower130ChoiceOverlay();
                break;

            case 'paused':
                // Draw pause overlay using the shared pause/upgrade background.
                this.ctx.save();
                if (this.assets.images.pauseUpgradeOverlay) {
                    this.ctx.drawImage(this.assets.images.pauseUpgradeOverlay, 0, 0, this.width, this.height);
                } else {
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    this.ctx.fillRect(0, 0, this.width, this.height);
                }

                // Draw pause text (gold + dark-gold outline)
                this.ctx.fillStyle = '#d4af37';
                this.ctx.strokeStyle = '#6b4e00';
                this.ctx.lineWidth = 5;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';

                this.ctx.font = 'bold 54px Cinzel, serif';
                this.ctx.strokeText('PAUSED', this.width / 2, this.height / 2 - 92);
                this.ctx.fillText('PAUSED', this.width / 2, this.height / 2 - 92);

                this.ctx.font = 'bold 22px Cinzel, serif';
                const lines = [
                    'PRESS SPACE (or Middle Click) TO RESUME',
                    'PRESS ESC TO QUIT (CLAIM ITEMS)',
                    'RIGHT CLICK (RMB) TO CHARGE (Power 25+)',
                    'PRESS X FOR SPECIAL (Power 50+)',
                    'PRESS R TO RESTART'
                ];
                for (let i = 0; i < lines.length; i++) {
                    const y = (this.height / 2 - 8) + i * 34;
                    this.ctx.strokeText(lines[i], this.width / 2, y);
                    this.ctx.fillText(lines[i], this.width / 2, y);
                }

                this.ctx.restore();
                break;

            case 'gameOver':
                // Use character-specific game over image
                const gameOverKey = (this.player && this.player.gameOverImage) ? this.player.gameOverImage : 'deregameover';
                const gameOverImage = this.assets.images[gameOverKey];
                
                if (gameOverImage) {
                    // Calculate dimensions to fit the screen while maintaining aspect ratio
                    const scale = Math.min(
                        this.width / gameOverImage.width,
                        this.height / gameOverImage.height
                    );
                    const scaledWidth = gameOverImage.width * scale;
                    const scaledHeight = gameOverImage.height * scale;
                    const x = (this.width - scaledWidth) / 2;
                    const y = (this.height - scaledHeight) / 2;

                    this.ctx.drawImage(gameOverImage, x, y, scaledWidth, scaledHeight);
                }
                break;
        }

        // Global screen overlays (flashes / wipes) drawn above everything.
        this.drawScreenOverlays();
    }

    isZonePatrolLikeMode() {
        return this.runMode === 'zonePatrol' || this.runMode === 'zonePatrolHard';
    }

    requestScreenFlash(color, durationMs) {
        const now = Date.now();
        this._screenFlashColor = String(color || 'rgba(120, 220, 255, 0.25)');
        const dur = Math.max(50, Number(durationMs) || 200);
        this._screenFlashStartedAt = now;
        this._screenFlashUntil = now + dur;
    }

    drawScreenOverlays() {
        const now = Date.now();

        // Short full-screen flash
        if (now < (Number(this._screenFlashUntil) || 0) && this._screenFlashColor) {
            const start = Number(this._screenFlashStartedAt) || (now - 1);
            const total = Math.max(1, (Number(this._screenFlashUntil) || 0) - start);
            const t = Math.max(0, Math.min(1, (now - start) / total));
            const alpha = 1 - t;
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            this.ctx.fillStyle = this._screenFlashColor;
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }

        // Kiki heart-wipe (canvas-only animation)
        const wipeStart = Number(this._kikiHeartWipeStartedAt) || 0;
        const wipeDur = Number(this._kikiHeartWipeDurationMs) || 0;
        if (wipeStart > 0 && wipeDur > 0 && now < wipeStart + wipeDur) {
            const t = Math.max(0, Math.min(1, (now - wipeStart) / Math.max(1, wipeDur)));

            // Wipe rises from bottom to top
            const wipeY = Math.round(this.height * (1 - t));
            const fadeH = Math.max(60, Math.round(this.height * 0.18));

            this.ctx.save();

            // Soft pink overlay behind hearts
            const grad = this.ctx.createLinearGradient(0, wipeY - fadeH, 0, wipeY + fadeH);
            grad.addColorStop(0, 'rgba(255, 120, 190, 0)');
            grad.addColorStop(0.5, 'rgba(255, 120, 190, 0.28)');
            grad.addColorStop(1, 'rgba(255, 120, 190, 0)');
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, Math.max(0, wipeY - fadeH), this.width, Math.min(this.height, fadeH * 2));

            // Heart stamps
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.font = 'bold 34px Arial';
            const cols = 8;
            const spacingX = this.width / cols;
            const bob = Math.sin(now * 0.01) * 8;
            for (let i = 0; i < cols; i++) {
                const x = (i + 0.5) * spacingX;
                const y = wipeY + bob + (i % 2 === 0 ? -12 : 12);
                this.ctx.fillStyle = 'rgba(255, 80, 160, 0.75)';
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
                this.ctx.lineWidth = 4;
                this.ctx.strokeText('♥', x, y);
                this.ctx.fillText('♥', x, y);
            }

            this.ctx.restore();
        }
    }

    getSpecialChargeRateMultiplier() {
        // Special gain baseline: +0.8% per defeated enemy, +0.8% per potion (20% slower than before).
        let mult = 0.8;

        // Power 130 perk: +10% special rate
        const bonus = Number(this.player?._specialRateBonus) || 0;
        if (bonus > 0) {
            mult *= (1 + bonus);
        }

        // Purple (projectile) potion: slightly faster special charging.
        const purpleLvl = Math.max(0, Math.min(10, Number(this.player?.projectilePotionLevel) || 0));
        if (purpleLvl > 0) {
            mult *= (1 + purpleLvl * 0.01);
        }

        return mult;
    }

    getMaxSpecialCharges() {
        const power = this.player?.powerLevel || 1;
        // At power level 100, green potions grant a second stored special charge.
        return power >= 100 ? 2 : 1;
    }

    addSpecialCharge(amount) {
        const power = this.player?.powerLevel || 1;
        if (power < 50) return;

        const maxCharges = this.getMaxSpecialCharges();
        if (this.specialChargesStored >= maxCharges) return;

        const scaled = amount * this.getSpecialChargeRateMultiplier();
        this.specialCharge = Math.min(this.specialChargeMax, this.specialCharge + scaled);

        if (this.specialCharge >= this.specialChargeMax) {
            this.specialCharge = 0;
            this.specialChargesStored = Math.min(maxCharges, this.specialChargesStored + 1);
        }
    }

    tryUseSpecialAttack() {
        const now = Date.now();
        if (now - (this._lastSpecialUseAt || 0) < 250) return false;
        if ((this.player?.powerLevel || 1) < 50) return false;
        if (this.specialChargesStored <= 0) return false;

        this._lastSpecialUseAt = now;
        this.specialChargesStored = Math.max(0, this.specialChargesStored - 1);

        const character = this.selectedCharacter;

        if (character === 'kiki') {
            // Kiki special: heart wipe + heal + 20s magnet.
            const damage = 8;
            let killed = 0;
            for (const enemy of [...(this.enemies || [])]) {
                if (!enemy || enemy.isBoss || enemy.isMidBoss) continue;
                const defeated = enemy.takeDamage(damage);
                if (defeated) {
                    killed++;
                    this.enemies = this.enemies.filter(e => e !== enemy);
                }
            }

            if (this.player) {
                this.player.health = Math.min(this.player.maxHealth || 10, (Number(this.player.health) || 0) + 5);
                if (Array.isArray(this.player.healthOverlays)) {
                    for (let i = 0; i < this.player.healthOverlays.length; i++) {
                        if (i < this.player.health) this.player.healthOverlays[i].alpha = 1;
                    }
                }
            }

            this._dropMagnetUntil = now + 20000;
            // During the special duration: move slightly faster + regain 1 shield HP every 2 seconds.
            if (this.player) {
                this.player._kikiSpecialUntil = now + 20000;
                this.player._kikiSpecialNextShieldTickAt = now + 2000;
            }
            // Heart-wipe visuals
            this._kikiHeartWipeStartedAt = now;
            this._kikiHeartWipeDurationMs = 950;
            this.score += killed * 6;
        } else if (character === 'kaskit') {
            // Kaskit special: incorporeal for 15 seconds (invulnerable + rapid auto 200% charge shots).
            if (this.player) {
                this.player._kaskitIncorporealUntil = now + 15000;
                this.player._kaskitAutoFireNextAt = now + 120;
            }
        } else {
            // Default special: wipe-out.
            // Bosses/midbosses are immune to the wipe-out removal; instead they take fixed Power-scaled damage.
            const effectiveBossDmg = this.getWipeOutBossDamage();
            let cleared = 0;

            const kept = [];
            for (const enemy of (this.enemies || [])) {
                if (!enemy) continue;
                if (enemy.isBoss || enemy.isMidBoss) {
                    if (effectiveBossDmg > 0) {
                        const mult = Math.max(0.01, Number(enemy.damageTakenMultiplier) || 1);
                        enemy.takeDamage(effectiveBossDmg / mult);
                    }
                    kept.push(enemy);
                } else {
                    cleared++;
                }
            }

            this.enemies = kept;
            this.enemyProjectiles = [];
            this.score += cleared * 5;
        }

        // Flash feedback (persisted via drawScreenOverlays)
        if (character === 'dere') {
            this.requestScreenFlash('rgba(60, 160, 255, 0.40)', 260);
        } else if (character === 'kiki') {
            this.requestScreenFlash('rgba(255, 120, 190, 0.30)', 240);
        } else {
            this.requestScreenFlash('rgba(120, 220, 255, 0.25)', 220);
        }

        return true;
    }

    drawPowerChoiceOverlay() {
        const w = this.width;
        const h = this.height;
        this.ctx.save();
        const overlay = this.assets.images.pauseUpgradeOverlay;
        if (overlay) {
            this.ctx.drawImage(overlay, 0, 0, w, h);
        } else {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, w, h);
        }

        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#d4af37';
        this.ctx.strokeStyle = '#6b4e00';
        this.ctx.lineWidth = 5;

        this.ctx.font = 'bold 34px Cinzel, serif';
        this.ctx.strokeText('Power Level 30!', w / 2, h / 2 - 120);
        this.ctx.fillText('Power Level 30!', w / 2, h / 2 - 120);

        this.ctx.font = 'bold 22px Cinzel, serif';
        this.ctx.strokeText('Choose an upgrade:', w / 2, h / 2 - 70);
        this.ctx.fillText('Choose an upgrade:', w / 2, h / 2 - 70);

        this.ctx.font = 'bold 20px Cinzel, serif';
        const isKiki = this.selectedCharacter === 'kiki';
        const isAliza = this.selectedCharacter === 'aliza';
        const line1 = isKiki ? '1) Heart Beam' : '1) Persistent Beam';
        const line2 = isAliza ? '2) Homing Shot' : '2) 10-Pellet Spread';
        this.ctx.strokeText(line1, w / 2, h / 2 - 10);
        this.ctx.fillText(line1, w / 2, h / 2 - 10);
        this.ctx.strokeText(line2, w / 2, h / 2 + 25);
        this.ctx.fillText(line2, w / 2, h / 2 + 25);

        this.ctx.font = 'bold 16px Cinzel, serif';
        this.ctx.strokeText('Press 1 or 2 to select.', w / 2, h / 2 + 85);
        this.ctx.fillText('Press 1 or 2 to select.', w / 2, h / 2 + 85);

        this.ctx.restore();
    }

    drawPower130ChoiceOverlay() {
        const w = this.width;
        const h = this.height;
        this.ctx.save();
        const overlay = this.assets.images.pauseUpgradeOverlay;
        if (overlay) {
            this.ctx.drawImage(overlay, 0, 0, w, h);
        } else {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, w, h);
        }

        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#d4af37';
        this.ctx.strokeStyle = '#6b4e00';
        this.ctx.lineWidth = 5;

        this.ctx.font = 'bold 34px Cinzel, serif';
        this.ctx.strokeText('Power Level 130!', w / 2, h / 2 - 140);
        this.ctx.fillText('Power Level 130!', w / 2, h / 2 - 140);

        this.ctx.font = 'bold 22px Cinzel, serif';
        this.ctx.strokeText('Choose a perk:', w / 2, h / 2 - 92);
        this.ctx.fillText('Choose a perk:', w / 2, h / 2 - 92);

        this.ctx.font = 'bold 20px Cinzel, serif';
        this.ctx.strokeText('1) Charge Time -20%', w / 2, h / 2 - 26);
        this.ctx.fillText('1) Charge Time -20%', w / 2, h / 2 - 26);
        this.ctx.strokeText('2) Special Rate +10%', w / 2, h / 2 + 12);
        this.ctx.fillText('2) Special Rate +10%', w / 2, h / 2 + 12);

        this.ctx.font = 'bold 16px Cinzel, serif';
        this.ctx.strokeText('Press 1 or 2 to select.', w / 2, h / 2 + 78);
        this.ctx.fillText('Press 1 or 2 to select.', w / 2, h / 2 + 78);

        this.ctx.restore();
    }

    drawGameState() {
        // Draw enemies, projectiles, particles, and UI
        this.drawEnemies();
        this.drawProjectiles();
        this.drawParticles();
        this.drawLoot();
        this.drawPowerups();
        
        // Draw player last (on top)
        if (this.player) {
            this.player.draw();
        }
    }

    updateProjectiles() {
        // Update player projectiles
        this.projectiles = this.projectiles.filter(proj => !proj.update());
        
        // Update enemy projectiles
        if (!this.enemyProjectiles) this.enemyProjectiles = [];
        this.enemyProjectiles = this.enemyProjectiles.filter(proj => !proj.update());
    }

    updateEnemies() {
        const time = Date.now();
        const dt = this._lastEnemyUpdateTime ? Math.min(60, Math.max(0, time - this._lastEnemyUpdateTime)) : 16;
        this._lastEnemyUpdateTime = time;

        if (this.enemyStyle === 'invaders') {
            this.updateInvaderFormation(dt);
        }

        this.enemies = this.enemies.filter(enemy => !enemy.update(time, dt));
    }

    updateInvaderFormation(dt) {
        const formationEnemies = this.enemies.filter(e => e && e.inFormation);
        if (formationEnemies.length === 0) return;

        const f = this.invaderFormation;
        if (f.bounceCooldownMs > 0) {
            f.bounceCooldownMs = Math.max(0, f.bounceCooldownMs - dt);
        }
        f.dx += f.dir * f.speedPxPerMs * dt;

        let left = Infinity;
        let right = -Infinity;
        let maxBaseBottom = -Infinity;

        for (const e of formationEnemies) {
            left = Math.min(left, (e.baseX - e.width / 2) + f.dx);
            right = Math.max(right, (e.baseX + e.width / 2) + f.dx);
            maxBaseBottom = Math.max(maxBaseBottom, e.baseY + e.height / 2);
        }

        const hitLeft = left <= f.paddingPx;
        const hitRight = right >= (this.width - f.paddingPx);
        if ((hitLeft || hitRight) && f.bounceCooldownMs === 0) {
            // Clamp back inside bounds to avoid rapid flip-flop jitter.
            if (hitLeft) {
                f.dx += (f.paddingPx - left);
            }
            if (hitRight) {
                f.dx -= (right - (this.width - f.paddingPx));
            }

            f.dir *= -1;
            f.bounceCooldownMs = 180;

            const maxBottom = this.height * f.maxBottomRatio;
            const maxDy = maxBottom - maxBaseBottom;
            f.dy = Math.min(f.dy + f.stepDownPx, maxDy);
        }

        // Always enforce the “stop at mid-screen” rule
        const maxBottom = this.height * f.maxBottomRatio;
        const maxDy = maxBottom - maxBaseBottom;
        if (f.dy > maxDy) {
            f.dy = maxDy;
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => !particle.update());
    }

    updatePowerups() {
        const kept = [];
        for (const powerup of this.powerups) {
            if (!powerup) continue;

            if (!powerup._comboEntered && powerup.y >= 0 && powerup.y <= this.height) {
                this.noteDropEnteredPlayfield(powerup);
            }

            const remove = powerup.update();
            if (remove) {
                this.noteDropMissed(powerup);
            } else {
                kept.push(powerup);
            }
        }
        this.powerups = kept;
    }

    updateLoot() {
        const kept = [];
        for (const loot of (this.loot || [])) {
            if (!loot) continue;

            if (!loot._comboEntered && loot.y >= 0 && loot.y <= this.height) {
                this.noteDropEnteredPlayfield(loot);
            }

            const remove = loot.update();
            if (remove) {
                this.noteDropMissed(loot);
            } else {
                kept.push(loot);
            }
        }
        this.loot = kept;
    }

    drawProjectiles() {
        this.projectiles.forEach(proj => proj.draw());
        if (this.enemyProjectiles) {
            this.enemyProjectiles.forEach(proj => proj.draw());
        }
    }

    drawEnemies() {
        this.enemies.forEach(enemy => enemy.draw());
    }

    drawParticles() {
        this.particles.forEach(particle => particle.draw());
    }

    drawPowerups() {
        this.powerups.forEach(powerup => powerup.draw());
    }

    drawLoot() {
        (this.loot || []).forEach(l => l.draw());
    }

    drawUI() {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.font = '24px Arial';
        
        // Draw score
        const scoreText = `Score: ${this.score}`;
        this.ctx.strokeText(scoreText, 10, 30);
        this.ctx.fillText(scoreText, 10, 30);

        // Lives indicator
        if (typeof this.lives === 'number' && this.lives > 0) {
            const livesText = `Lives: ${this.lives}/${this.maxLives || 3}`;
            this.ctx.strokeText(livesText, 10, 60);
            this.ctx.fillText(livesText, 10, 60);
        }
        
        // Draw round and wave info
        const waveText = `Round ${this.round} - Wave ${this.wave}`;
        this.ctx.strokeText(waveText, this.width - 200, 30);
        this.ctx.fillText(waveText, this.width - 200, 30);

        // Combo / multiplier (make it prominent at top-center)
        const combo = Math.max(0, Number(this.comboCount) || 0);
        if (combo > 0) {
            const mult = this.getComboMultiplier();

            this.ctx.save();
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffd36b';
            this.ctx.strokeStyle = 'rgba(0,0,0,0.85)';
            this.ctx.lineWidth = 5;
            this.ctx.font = 'bold 30px Arial';
            const text = `x${mult.toFixed(2)}  (Combo ${combo})`;
            this.ctx.strokeText(text, this.width / 2, 34);
            this.ctx.fillText(text, this.width / 2, 34);
            this.ctx.restore();
        }

        // (Charge % text replaced by a bar HUD)

        // HUD bars (HP / Shield / Power) using 10-segment sprites.
        // No gameplay math changes: this is strictly a visual representation.
        this.drawBottomLeftHudBars();

        // Draw charge + special meters in the lower-right.
        this.drawBottomRightChargeAndSpecialBars();
        
        // (Shield timer UI removed; shield is a HP meter now.)
    }

    drawBottomLeftHudBars() {
        const images = this.assets?.images;
        if (!images) return;

        // Pick a representative image for sizing.
        const sample = images.hpbar10full || images.hpbar9 || images.hpbar8 || images.hpbar7 || images.hpbar6 || images.hpbar5 || images.hpbar4 || images.hpbar3 || images.hpbar2 || images.hpbar1;
        if (!sample) return;

        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

        const maxHp = (this.player && this.player.maxHealth) ? Number(this.player.maxHealth) : 10;
        const hp = (this.player && typeof this.player.health === 'number') ? Number(this.player.health) : 0;
        const shieldHp = (this.player && typeof this.player.shieldHp === 'number') ? Number(this.player.shieldHp) : 0;
        const powerLevel = (this.player && typeof this.player.powerLevel === 'number') ? Number(this.player.powerLevel) : 1;

        // Compute bar indices
        // HP: 10 segments representing % of max HP (no empty sprite provided; if alive, show at least 1 segment).
        let hpSeg = 0;
        if (hp > 0 && maxHp > 0) {
            hpSeg = clamp(Math.ceil((hp / maxHp) * 10), 1, 10);
        }

        // Shield: 0-20 shield points => 0-10 segments (each segment = 2 shield).
        const shieldSeg = clamp(Math.ceil(shieldHp / 2), 0, 10);

        // Power: starts empty; each 20 power levels = +1 segment. (powerLevel starts at 1)
        const gainedPower = Math.max(0, powerLevel - 1);
        const powerSeg = clamp((powerLevel >= 200) ? 10 : Math.floor(gainedPower / 20), 0, 10);

        const pickKey = (prefix, seg, emptyKey) => {
            if (seg <= 0) return emptyKey;
            if (seg >= 10) return `${prefix}10full`;
            return `${prefix}${seg}`;
        };

        const hpKey = hpSeg >= 10 ? 'hpbar10full' : (hpSeg > 0 ? `hpbar${hpSeg}` : null);
        const shieldKey = pickKey('shieldbar', shieldSeg, 'shieldbar0empty');
        const powerKey = pickKey('powerbar', powerSeg, 'powerbar0empty');

        const hpImg = hpKey ? images[hpKey] : null;
        const shieldImg = images[shieldKey];
        const powerImg = images[powerKey];
        if (!hpImg || !shieldImg || !powerImg) return;

        // Scale to ~40% of game width, but also keep height reasonable.
        const desiredW = this.width * 0.40;
        const gapRatio = 0.12;
        const scaleW = desiredW / sample.width;
        const scaleH = (this.height * 0.28) / (sample.height * (3 + 2 * gapRatio));
        const scale = Math.min(scaleW, scaleH);

        const drawW = Math.round(sample.width * scale);
        const drawH = Math.round(sample.height * scale);
        const gap = Math.round(drawH * gapRatio);

        const x = 10;
        const bottomPadding = 10;
        const yPower = this.height - bottomPadding - drawH;
        const yShield = yPower - gap - drawH;
        const yHp = yShield - gap - drawH;

        this.ctx.save();
        // Order matches the provided mockup: red (HP) top, blue (Shield) middle, green (Power) bottom.
        this.ctx.drawImage(hpImg, x, yHp, drawW, drawH);
        this.ctx.drawImage(shieldImg, x, yShield, drawW, drawH);
        this.ctx.drawImage(powerImg, x, yPower, drawW, drawH);
        this.ctx.restore();
    }

    drawBottomRightChargeAndSpecialBars() {
        if (!this.player) return;

        const power = Number(this.player.powerLevel) || 1;
        const canCharge = !!this.player.hasInnateChargeShot || power >= 25;
        const canSpecial = power >= 50;

        // Requested: charge + special bars (and overlays) 50% larger.
        const scale = 0.75 * 1.5;
        const uiScale = scale / 0.75;
        const meterW = Math.round(220 * scale);
        const meterH = Math.max(8, Math.round(12 * scale));
        const gap = Math.max(7, Math.round(10 * scale));

        const pad = 10;
        const bars = [];
        if (canSpecial) bars.push('special');
        if (canCharge) bars.unshift('charge');
        if (!bars.length) return;

        const stackH = bars.length * meterH + (bars.length - 1) * gap;
        const x = this.width - pad - meterW;
        const yBottom = this.height - pad;
        let y = yBottom - stackH;

        const specialbarImg = this.assets?.images?.specialbar;
        const overlayPadding = Math.max(2, Math.round(3 * scale));

        const drawLabeledBar = ({ label, frac, fillStyle, y, suffixText = '' }) => {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            const labelYOffset = Math.max(12, Math.round(18 * uiScale));
            const labelH = Math.max(28, Math.round(34 * uiScale));
            this.ctx.fillRect(x, y - labelYOffset, meterW, labelH);

            this.ctx.strokeStyle = 'rgba(255,255,255,0.85)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, meterW, meterH);

            this.ctx.fillStyle = fillStyle;
            this.ctx.fillRect(x, y, Math.round(meterW * Math.max(0, Math.min(1, frac))), meterH);

            if (specialbarImg) {
                const overlayW = meterW + overlayPadding * 2;
                const overlayH = meterH + overlayPadding * 2;
                const overlayX = x - overlayPadding;
                const overlayY = y - overlayPadding;
                // Overlay should be fully opaque so all pixels are visible.
                this.ctx.globalAlpha = 1.0;
                this.ctx.drawImage(specialbarImg, overlayX, overlayY, overlayW, overlayH);
                this.ctx.globalAlpha = 1.0;
            }

            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 3;
            this.ctx.font = `bold ${Math.max(11, Math.round(14 * scale))}px Arial`;
            const text = suffixText ? `${label} ${suffixText}` : label;
            this.ctx.strokeText(text, x + 8, y - 4);
            this.ctx.fillText(text, x + 8, y - 4);
            this.ctx.restore();
        };

        for (const kind of bars) {
            if (kind === 'special') {
                const frac = this.specialChargeMax > 0 ? (this.specialCharge / this.specialChargeMax) : 0;
                const maxCharges = this.getMaxSpecialCharges();
                const label = 'Special:';
                const suffix = `${this.specialChargesStored}/${maxCharges} (X)`;
                drawLabeledBar({ label, frac, fillStyle: '#77d1ff', y, suffixText: suffix });
                y += meterH + gap;
                continue;
            }

            if (kind === 'charge') {
                const charging = !!this.player.isChargingShot;
                const now = Date.now();
                const start = Number(this.player.chargeStartTime) || now;
                const ms = charging ? Math.max(0, now - start) : 0;
                const timeMult = (typeof this.player.getChargeTimeMultiplier === 'function')
                    ? this.player.getChargeTimeMultiplier()
                    : (Number(this.player.chargeTimeMultiplier) || 1);

                // Fill based on damage charge window (5s baseline).
                const frac = charging ? Math.max(0, Math.min(1, ms / Math.max(1, 5000 * timeMult))) : 0;

                // Color shifts as it charges; high power gives a rainbow shimmer.
                let fill = '#b35cff';
                if ((Number(this.player.powerLevel) || 1) >= 150 && charging) {
                    const hue = (now * 0.08) % 360;
                    fill = `hsl(${hue}, 90%, 60%)`;
                } else if (frac >= 0.85) {
                    fill = '#ffd36b';
                } else if (frac >= 0.45) {
                    fill = '#ff6bd6';
                }

                const label = charging ? 'Charge:' : 'Charge:';
                const suffix = charging ? '(RMB)' : '(RMB)';
                drawLabeledBar({ label, frac, fillStyle: fill, y, suffixText: suffix });
                y += meterH + gap;
            }
        }
    }
    
    checkWaveProgress() {
        if (this.gameState !== 'playing' || this.isSpawningWave) return;

        // Initialize wave start time if not set
        if (!this.waveStartTime) {
            this.waveStartTime = Date.now();
        }

        const currentTime = Date.now();
        const waveElapsedTime = currentTime - this.waveStartTime;

        // For boss waves, wait for boss defeat
        if (this.isBossWave()) {
            const bossesRemaining = this.enemies.filter(e => e && e.isBoss).length;
            if (bossesRemaining === 0) {
                console.log(`Boss wave ${this.wave} completed in round ${this.round}`);

                // Greensea: boss waves can include escorts/infantry. Don't advance until the screen is clear.
                if (this.isGreenseaExpanse()) {
                    const anyRemaining = this.enemies.filter(e => e).length;
                    if (anyRemaining > 0) {
                        return;
                    }
                }

                // Zone Patrol: spawn Dark Empress encounters on a special cadence.
                if (this.isZonePatrolLikeMode() && typeof this.shouldSpawnDarkEmpressAfterBossDefeat === 'function' && this.shouldSpawnDarkEmpressAfterBossDefeat()) {
                    this.spawnDarkEmpressEncounter();
                    return;
                }

                this.advanceWave();
            }
            return;
        }

        // For mid-boss waves, wait for the mid-boss defeat
        if (this.enemies && this.enemies.some(e => e && e.isMidBoss)) {
            const midBossesRemaining = this.enemies.filter(e => e && e.isMidBoss).length;
            if (midBossesRemaining === 0) {
                console.log(`Mid-boss wave ${this.wave} completed in round ${this.round}`);
                this.advanceWave();
            }
            return;
        }

        // Invaders-style waves: the wave ends when all enemies are defeated.
        // (No timer-based wave advancing.)
        if (this.enemyStyle === 'invaders') {
            const remaining = this.enemies.filter(e => e && !e.isBoss && !e.isMidBoss).length;
            if (remaining === 0) {
                console.log(`Invaders wave ${this.wave} cleared in round ${this.round}`);
                this.advanceWave();
            }
            return;
        }

        // For normal waves, use 30 second timer
        if (waveElapsedTime >= 30000) {
            console.log(`Wave ${this.wave} time completed in round ${this.round}`);
            this.advanceWave();
        }
    }

    getInvaderEnemyTypesForWave() {
        if (this.isGreenseaExpanse()) {
            return this.getGreenseaMobTypePool();
        }
        // Keep formation enemies mostly low-HP so larger formations are actually finishable.
        if (this.round === 1) return ['darkling1', 'darkling2', 'darkling3', 'darkling11', 'darkling12'];
        if (this.round === 2) return ['darkling2', 'darkling3', 'darkling5', 'darkling6', 'darkling13', 'darkling14', 'darkling15'];
        return ['darkling5', 'darkling6', 'darkling8', 'darkling10', 'darkling16', 'darkling17', 'darkling18', 'darkling19'];
    }

    getGreenseaFormationSpec(round = this.round) {
        const r = Math.max(1, Number(round) || 1);
        if (r === 1) return { cols: 5, rows: 4 };
        if (r <= 5) return { cols: 5, rows: 5 };
        if (r <= 10) return { cols: 6, rows: 5 };
        // Rounds 11+ use 5 rows of 7 mobs.
        return { cols: 7, rows: 5 };
    }

    getGreenseaMobTypePool(round = this.round) {
        // Greensea mobs live in darklingmob33..63.
        const r = Math.max(1, Number(round) || 1);
        const early = [33, 34, 35, 36, 37, 38, 39, 40, 41, 42];
        const mid = [43, 44, 45, 46, 47, 48, 49, 50, 51];
        const late = [61, 62, 63];
        const base = (r <= 3) ? early
            : (r <= 10) ? [...early, ...mid]
            : [...early, ...mid, ...late];

        return base.map(n => `darklingmob${n}`);
    }

    getGreenseaInfantryTypePool() {
        // Infantry set: 52..60.
        const nums = [52, 53, 54, 55, 56, 57, 58, 59, 60];
        return nums.map(n => `darklingmob${n}`);
    }

    getGreenseaMobHealthOverride(round = this.round) {
        // Target baseline: ~3–5 hits at Power 0.
        // Requested tuning:
        // - rounds 4+: +1–2 HP (use +2)
        // - rounds 7+: +3 more
        // - rounds 10+: +5 more
        const r = Math.max(1, Number(round) || 1);
        let base;
        if (r <= 2) base = 4;
        else if (r <= 6) base = 5;
        else if (r <= 10) base = 6;
        else if (r <= 15) base = 7;
        else base = 8;

        let bonus = 0;
        if (r >= 4) bonus += 2;
        if (r >= 7) bonus += 3;
        if (r >= 10) bonus += 5;
        return base + bonus;
    }

    getGreenseaInfantryHealthOverride(round = this.round) {
        // Infantry are tougher: designed to take longer even once Power ramps.
        const r = Math.max(1, Number(round) || 1);
        let base;
        if (r <= 10) base = 10;
        else if (r <= 15) base = 12;
        else base = 14;

        // Apply the same post-round-3 scaling to infantry as well.
        let bonus = 0;
        if (r >= 4) bonus += 2;
        if (r >= 7) bonus += 3;
        if (r >= 10) bonus += 5;
        return base + bonus;
    }

    getGreenseaBossHealthOverride(type, bossEncounterIndex = 0) {
        const idx = Math.max(0, Number(bossEncounterIndex) || 0);
        if (!type) return null;
        const t = String(type);

        // High-power scaling: keep bosses alive long enough to execute patterns.
        // Power 1 => 1.00x, Power 130+ => ~2.25x.
        const power = Math.max(1, Number(this.player?.powerLevel) || 1);
        const tp = Math.max(0, Math.min(1, (power - 1) / 130));
        const powerMult = 1 + tp * 1.25;

        let hp = null;

        // Greensea bosses should be on parity (or stronger) than later Lissome bosses.
        // These are raw HP values; Greensea also applies strong mitigation.
        if (t.startsWith('darkmidboss')) hp = 110 + idx * 14;
        else if (t.startsWith('darkprincess')) hp = 150 + idx * 18;
        else if (t.startsWith('darklingboss')) hp = 130 + idx * 16;
        else if (t.startsWith('darkempress')) {
            const m = t.match(/^darkempress(\d+)$/);
            const form = m ? Math.max(0, Math.min(8, Number(m[1]) || 0)) : 0;
            const formBonus = (form === 8) ? 35 : (form >= 1 ? 15 + (form - 1) * 6 : 0);
            hp = 170 + idx * 18 + formBonus;
        }

        return (typeof hp === 'number') ? Math.round(hp * powerMult) : null;
    }

    getGreenseaBossWaveEnemies(width = this.width) {
        const enemies = [];
        const round = Math.max(1, Number(this.round) || 1);
        const bossEncounterIndex = this.getBossEncounterIndexForRound(round);

        const pickFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        let bossTypes = [];
        if (round === 1) bossTypes = ['darklingboss4'];
        else if (round === 2) bossTypes = ['darkmidboss13'];
        else if (round === 3) bossTypes = ['darkmidboss14'];
        else if (round === 4) bossTypes = ['darkmidboss15'];
        else if (round === 5) bossTypes = ['darklingboss5'];
        else if (round === 6) bossTypes = ['darklingboss6'];
        else if (round === 7) bossTypes = ['darklingboss7'];
        else if (round === 8) bossTypes = ['darklingboss8'];
        else if (round === 9) bossTypes = ['darklingboss9'];
        else if (round === 10) bossTypes = ['darklingboss10'];
        else if (round === 11) bossTypes = ['darklingboss4'];
        else if (round === 12) bossTypes = ['darklingboss5', 'darklingboss6'];
        else if (round === 13) bossTypes = ['darkprincess1'];
        else if (round === 14) bossTypes = ['darkprincess2'];
        else if (round === 15) bossTypes = ['darkprincess3'];
        else {
            // Rounds 16+: 50% chance to use a Greensea midboss 13-15 instead of the normal cycle.
            const midbosses = ['darkmidboss13', 'darkmidboss14', 'darkmidboss15'];
            const cycle = [
                'darklingboss4',
                'darklingboss5',
                'darklingboss6',
                'darklingboss7',
                'darklingboss8',
                'darklingboss9',
                'darklingboss10',
                'darkprincess1',
                'darkprincess2',
                'darkprincess3'
            ];

            if (Math.random() < 0.5) {
                bossTypes = [pickFrom(midbosses)];
            } else {
                const idx = (round - 16) % cycle.length;
                bossTypes = [cycle[idx]];
            }
        }

        // Spawn bosses (supporting 2-boss rematch in round 12).
        for (let i = 0; i < bossTypes.length; i++) {
            const type = bossTypes[i];
            const spread = bossTypes.length === 1 ? 0 : ((i / (bossTypes.length - 1)) - 0.5) * (this.width * 0.42);
            const healthOverride = this.getGreenseaBossHealthOverride(type, bossEncounterIndex);
            let empressForm = null;
            let empressDamageMult = null;
            let empressSpawnAnim = null;
            if (typeof type === 'string' && type.startsWith('darkempress')) {
                const m = type.match(/^darkempress(\d+)$/);
                empressForm = m ? Math.max(0, Math.min(8, Number(m[1]) || 0)) : 0;
                empressDamageMult = (empressForm === 0) ? 1.05 : 1.0;
                empressSpawnAnim = 'descend';
            }
            enemies.push({
                type,
                x: width / 2 + spread,
                spawnCenterX: width / 2 + spread,
                y: -120 - i * 40,
                isBoss: true,
                bossEncounterIndex,
                healthOverride,
                empressForm,
                empressDamageMult,
                empressSpawnAnim
            });
        }

        // Infantry escorts for certain rounds.
        let escortRows = 0;
        if (round === 11) escortRows = 3;
        if (round >= 13 && round <= 15) escortRows = 1;

        if (escortRows > 0) {
            const spec = this.getGreenseaFormationSpec(round);
            const cols = Math.max(5, Math.min(7, Number(spec.cols) || 7));
            const infantryTypes = this.getGreenseaInfantryTypePool();

            const maxHalfWidth = 70;
            const leftMargin = 40 + maxHalfWidth;
            const rightMargin = (width - 40) - maxHalfWidth;
            const spacingX = cols > 1 ? ((rightMargin - leftMargin) / (cols - 1)) : 0;
            const startX = cols > 1 ? leftMargin : (width / 2);
            const startY = 140;
            const spacingY = 70;

            for (let r = 0; r < escortRows; r++) {
                for (let c = 0; c < cols; c++) {
                    const type = infantryTypes[Math.floor(Math.random() * infantryTypes.length)];
                    enemies.push({
                        type,
                        x: startX + c * spacingX,
                        y: startY + r * spacingY,
                        inFormation: true,
                        healthOverride: this.getGreenseaInfantryHealthOverride(round)
                    });
                }
            }
        }

        return enemies;
    }

    advanceWave() {
        this.isSpawningWave = false;

        // Boss Rush mode: at the end of each round, pause and offer a choice.
        if (this.runMode === 'bossRush' && this.wave >= this.getWavesInRound()) {
            this._bossRushPendingRoundAdvance = true;
            this.gameState = 'bossRushRewardChoice';
            // Reset wave start time while the choice is shown.
            this.waveStartTime = null;
            return;
        }
        
        if (this.wave < this.getWavesInRound()) {
            this.wave++;
            console.log(`Advancing to wave ${this.wave} in round ${this.round}`);
            this.showWaveDialog(`Get Ready for Wave ${this.wave}!`);
        } else {
            // Endless progression: keep advancing rounds forever.
            this.round++;
            this.wave = 1;
            console.log(`Advancing to round ${this.round}, wave 1`);
            this.showWaveDialog(`Round ${this.round} Start!`);
        }

        // Reset wave start time for next wave
        this.waveStartTime = null;
    }

    showWaveDialog(message) {
        const dialog = document.createElement('div');
        dialog.style.position = 'absolute';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        dialog.style.border = '2px solid #d4af37';
        dialog.style.borderRadius = '8px';
        dialog.style.padding = '20px';
        dialog.style.color = '#fff';
        dialog.style.textAlign = 'center';
        dialog.style.zIndex = '1000';
        dialog.style.fontSize = '24px';
        dialog.textContent = message;

        this.canvas.parentNode.appendChild(dialog);
        
        // Pause spawning until timer expires
        this.isSpawningWave = true;
        
        // Automatically remove dialog and start wave after 2 seconds
        setTimeout(() => {
            dialog.remove();
            this.spawnWave();
        }, 2000);
    }

    getWavesInRound() {
        // Boss Rush mode: fixed bosses-per-round cadence.
        if (this.runMode === 'bossRush') {
            // Greensea Boss Rush: do NOT ramp into multi-boss pacing until after the
            // full solo roster is cleared and the princess trio fight happens.
            if (this.isGreenseaExpanse()) {
                const idx = Math.max(1, Number(this.bossRushBossIndex) || 1);
                const roster = (typeof this.getGreenseaBossRushRoster === 'function')
                    ? this.getGreenseaBossRushRoster()
                    : [];
                const rosterLen = Math.max(1, Array.isArray(roster) ? roster.length : 1);

                // Encounter (rosterLen + 1) is the trio fight; keep 1 wave/round until it's done.
                if (idx <= (rosterLen + 1)) return 1;

                // After the trio fight, speed up.
                return 4;
            }
            return (this.round <= 10 ? 1 : 4);
        }

        // Greensea Expanse cadence (Zone Patrol).
        if (this.isGreenseaExpanse()) {
            const r = Math.max(1, Number(this.round) || 1);
            if (r === 1) return 4;
            if (r <= 10) return 5;
            if (r <= 15) return 7;
            return 10;
        }

        // Endless: keep the wave count growing slowly, but cap it so rounds don't become unreasonably long.
        if (this.round <= 1) return 5;
        if (this.round <= 2) return 7;
        return Math.min(12, 8 + Math.floor((this.round - 3) / 3));
    }

    getBossRushBossType() {
        const idx = Math.max(1, Number(this.bossRushBossIndex) || 1);

        // Greensea Boss Rush: fall back to the Greensea roster (solo fights only).
        if (this.isGreenseaExpanse()) {
            const roster = (typeof this.getGreenseaBossRushRoster === 'function')
                ? this.getGreenseaBossRushRoster()
                : [];
            const list = Array.isArray(roster) && roster.length ? roster : ['darkmidboss13'];
            return list[(idx - 1) % list.length];
        }

        // Boss Rush tweak: show the Queen (Dark Empress) every 2 levels,
        // cycling her 7 forms: darkempress1 .. darkempress7.
        if (idx % 2 === 0) {
            const queenEncounterIndex = Math.max(1, Math.floor(idx / 2));
            const form = ((queenEncounterIndex - 1) % 7) + 1;
            return `darkempress${form}`;
        }

        // Odd encounters: rotate through midbosses for variety.
        const nonQueenCount = 12;
        const oddIndex = Math.floor((idx - 1) / 2); // 0,1,2,... for encounters 1,3,5,...
        const pick = (oddIndex % nonQueenCount) + 1; // 1..12
        return `darkmidboss${pick}`;
    }

    advanceBossRushBossIndex() {
        this.bossRushBossIndex = (Number(this.bossRushBossIndex) || 1) + 1;
    }

    spawnBossPotionExplosion(x, y, { countMin = 7, countMax = 13, maxGreen = 3 } = {}) {
        // Boss Rush mode: bosses explode into potions, favoring green (power).
        // Cap green drops per boss so rewards don't spiral.
        const count = Math.max(1, Math.floor(countMin + Math.random() * (countMax - countMin + 1)));
        let greenSpawned = 0;
        for (let i = 0; i < count; i++) {
            const weights = [
                { type: 'power', w: (greenSpawned < maxGreen) ? 2.6 : 0 },
                { type: 'health', w: 1.0 },
                { type: 'shield', w: 0.9 },
                // Extra lives should be much rarer than potions.
                { type: 'life', w: 0.06 }
            ];
            const chosen = this.pickWeightedPowerupType(weights);
            if (!chosen) break;

            // Respect caps (power progression, lives, etc.).
            if (typeof this.canSpawnPowerupType === 'function' && !this.canSpawnPowerupType(chosen)) {
                continue;
            }

            const ox = (Math.random() - 0.5) * 220;
            const oy = (Math.random() - 0.5) * 80;
            this.powerups.push(new Powerup(this, x + ox, y + oy, chosen));
            if (chosen === 'power') greenSpawned++;
        }
    }

    isBossRushRound(round = this.round) {
        // After round 15, every 4th round is a boss rush: 16, 20, 24, 28, ...
        return round >= 16 && round % 4 === 0;
    }

    getBossEncounterIndexForRound(round = this.round) {
        // Zone Patrol: a boss appears at the end of every round.
        if (round < 1) return -1;
        return Math.max(0, Math.floor(round - 1));
    }

    getGreenseaBossRushRoster() {
        // Solo progression roster (in order). The trio fight is handled separately.
        return [
            // Midbosses
            'darkmidboss13',
            'darkmidboss14',
            'darkmidboss15',
            // Darkling bosses
            'darklingboss4',
            'darklingboss5',
            'darklingboss6',
            'darklingboss7',
            'darklingboss8',
            'darklingboss9',
            'darklingboss10',
            // Solo princess fights
            'darkprincess1',
            'darkprincess2',
            'darkprincess3',
            // Empress forms (Greensea cycle)
            'darkempress0',
            'darkempress8',
            'darkempress1',
            'darkempress2',
            'darkempress3',
            'darkempress4',
            'darkempress5',
            'darkempress6',
            'darkempress7'
        ];
    }

    getGreenseaBossRushBossTypes(encounterIndex = null) {
        const idx = Math.max(1, Number(encounterIndex != null ? encounterIndex : (this.bossRushBossIndex || 1)) || 1);
        const roster = (typeof this.getGreenseaBossRushRoster === 'function') ? this.getGreenseaBossRushRoster() : [];
        const list = Array.isArray(roster) && roster.length ? roster : ['darkmidboss13'];
        const rosterLen = list.length;

        // After clearing the full solo roster, trigger the princess trio fight.
        if (idx === rosterLen + 1) {
            return ['darkprincess1', 'darkprincess2', 'darkprincess3'];
        }

        // Otherwise, spawn a single boss.
        if (idx <= rosterLen) {
            return [list[idx - 1]];
        }

        // After the trio fight, loop the solo roster.
        const afterTrio = idx - (rosterLen + 1);
        return [list[(afterTrio - 1) % rosterLen]];
    }

    isBossWave(round = this.round, wave = this.wave) {
        // Boss is the final wave of every round.
        // Boss rush rounds: every wave is a boss.
        if (round < 1) return false;
        if (this.isBossRushRound(round)) return true;
        return wave === this.getWavesInRound();
    }

    getBossTypeForRound(round = this.round, wave = this.wave) {
        const idx0 = (Math.max(1, round) - 1) + (Math.max(1, wave) - 1);

        // Greensea boss-rush rounds (16/20/24/28...): use Greensea bosses + midbosses.
        if (this.isGreenseaExpanse() && this.isBossRushRound(round)) {
            const cycle = [
                'darkmidboss13',
                'darkmidboss14',
                'darkmidboss15',
                'darklingboss4',
                'darklingboss5',
                'darklingboss6',
                'darklingboss7',
                'darklingboss8',
                'darklingboss9',
                'darklingboss10',
                'darkprincess1',
                'darkprincess2',
                'darkprincess3'
            ];
            return cycle[idx0 % cycle.length];
        }

        // Default: use darkmidboss1..12 for end-of-round bosses and boss rush.
        const pick = (idx0 % 12) + 1;
        return `darkmidboss${pick}`;
    }

    shouldSpawnDarkEmpressAfterBossDefeat(round = this.round) {
        // Dark Empress is a Zone Patrol-only special encounter.
        if (!this.isZonePatrolLikeMode()) return false;
        // Greensea uses this cadence to spawn its Empress encounters.
        if (this.isBossRushRound(round)) return false;

        const due = Number(this.nextEmpressDueRound) || 0;
        if (due <= 0) return false;
        if (round < due) return false;

        // Don't spawn if an empress is already on screen (safety).
        if (Array.isArray(this.enemies) && this.enemies.some(e => e && typeof e.type === 'string' && e.type.startsWith('darkempress'))) {
            return false;
        }

        // Only spawn after the end-of-round boss is defeated.
        return true;
    }

    spawnDarkEmpressEncounter() {
        if (this.isGreenseaExpanse()) {
            this.spawnGreenseaEmpressEncounter();
            return;
        }
        const form = Math.min(7, Math.max(1, (Number(this.empressForm) || 0) + 1));

        // Base stats tuned to feel like a special boss without being absurdly tanky.
        const round = Math.max(1, Number(this.round) || 1);
        const baseHp = 140 + Math.max(0, round - 5) * 6;
        const formMult = (form >= 7) ? 2.0 : (1.0 + (form - 1) * 0.10);
        const hp = Math.round(baseHp * formMult);

        const damageMult = (form >= 7) ? 2.0 : (1.0 + (form - 1) * 0.10);
        const damageTakenMultiplier = (form >= 7) ? 0.25 : 0.4; // final form: 75% reduction

        const enemy = new Enemy(
            this,
            `darkempress${form}`,
            this.width / 2,
            -220,
            {
                isBoss: true,
                bossEncounterIndex: this.getBossEncounterIndexForRound(round),
                spawnCenterX: this.width / 2,
                healthOverride: hp,
                damageTakenMultiplier,
                empressForm: form,
                empressDamageMult: damageMult,
                empressSpawnAnim: 'descend'
            }
        );

        this.enemies.push(enemy);
        this.empressForm = form;
        this.lastEmpressDefeatedAtRound = null;

        // After the first Empress (triggered at round 5), the next forms appear every 3 rounds.
        this.nextEmpressDueRound = round + 3;
    }

    spawnGreenseaEmpressEncounter() {
        const cycle = [0, 8, 1, 2, 3, 4, 5, 6, 7];
        const idx = Math.max(0, Number(this._greenseaEmpressCycleIndex) || 0);
        const form = cycle[idx % cycle.length];
        this._greenseaEmpressCycleIndex = idx + 1;

        const round = Math.max(1, Number(this.round) || 1);
        const bossEncounterIndex = this.getBossEncounterIndexForRound(round);

        // Base stats tuned to feel like a special boss encounter.
        const baseHp = 120 + Math.max(0, round - 5) * 7;
        const hp = Math.round(baseHp * (form === 8 ? 1.15 : 1.0));

        // Greensea rule: bosses take 25% damage (75% damage reduction).
        const damageTakenMultiplier = 0.25;
        const damageMult = (form === 0) ? 1.05 : 1.0;

        const enemy = new Enemy(
            this,
            `darkempress${form}`,
            this.width / 2,
            -220,
            {
                isBoss: true,
                bossEncounterIndex,
                spawnCenterX: this.width / 2,
                healthOverride: hp,
                damageTakenMultiplier,
                empressForm: form,
                empressDamageMult: damageMult,
                empressSpawnAnim: 'descend'
            }
        );

        this.enemies.push(enemy);
        this.empressForm = form;
        this.lastEmpressDefeatedAtRound = null;

        // Infantry rows: Empress0 => 1 row, Empress8 => 2 rows, later Empresses => 3 rows.
        const infantryRows = (form === 0) ? 1 : (form === 8) ? 2 : 3;
        const infantryTypes = this.getGreenseaInfantryTypePool();
        const cols = Math.max(5, Math.min(7, (this.getGreenseaFormationSpec(round).cols || 7)));

        const maxHalfWidth = 70;
        const leftMargin = 40 + maxHalfWidth;
        const rightMargin = (this.width - 40) - maxHalfWidth;
        const spacingX = cols > 1 ? ((rightMargin - leftMargin) / (cols - 1)) : 0;
        const startX = cols > 1 ? leftMargin : (this.width / 2);
        const startY = 170;
        const spacingY = 70;

        for (let r = 0; r < infantryRows; r++) {
            for (let c = 0; c < cols; c++) {
                const t = infantryTypes[Math.floor(Math.random() * infantryTypes.length)];
                this.enemies.push(new Enemy(
                    this,
                    t,
                    startX + c * spacingX,
                    startY + r * spacingY,
                    {
                        inFormation: true,
                        healthOverride: this.getGreenseaInfantryHealthOverride(round)
                    }
                ));
            }
        }

        // Greensea cadence: special Empress encounter every 5 rounds.
        this.nextEmpressDueRound = round + 5;
    }

    getMobInitialShotDelayMs(round = this.round) {
        // After round 3, mobs start firing earlier each round until they reach 0.5s at round 15.
        // This is the *initial delay before the first shot* after spawning.
        if (round <= 3) return null;
        if (round >= 15) return 500;

        const startRound = 4;
        const endRound = 15;
        const startDelay = 2000;
        const endDelay = 500;
        const t = Math.max(0, Math.min(1, (round - startRound) / (endRound - startRound)));
        return Math.round(startDelay + (endDelay - startDelay) * t);
    }

    getEnemyShotCooldownMult(isBoss = false) {
        // Mobs: start firing faster at round 3 and scale each round.
        // Bosses: keep a slightly later ramp (round 4+) to avoid early spikes.
        const startRound = isBoss ? 4 : 3;
        const roundsPast = Math.max(0, (this.round || 1) - startRound + 1);
        if (roundsPast <= 0) return 1;

        // Faster scaling for bosses.
        const step = isBoss ? 0.08 : 0.06;
        const min = isBoss ? 0.25 : 0.45;
        let mult = Math.max(min, 1 - roundsPast * step);
        if (!isBoss && this.isGreenseaExpanse()) {
            mult *= 0.85;
        }
        return mult;
    }

    getEnemyProjectileSpeedMult(isBoss = false) {
        const roundsPast = Math.max(0, (this.round || 1) - 4);
        const step = isBoss ? 0.05 : 0.035;
        return Math.min(isBoss ? 2.2 : 1.9, 1 + roundsPast * step);
    }

    shouldSpawnColossusThisWave(round = this.round, wave = this.wave) {
        // Mid-boss: starts showing up round 5+, not on boss waves, not in invaders formation mode.
        if (this.enemyStyle === 'invaders') return false;
        if (round < 5) return false;
        if (this.isBossWave(round, wave)) return false;

        // Midpoint wave (roughly), capped for early rounds.
        const midpoint = Math.min(4, Math.max(2, Math.ceil(this.getWavesInRound() / 2)));
        return wave === midpoint;
    }

    spawnWave() {
        this.isSpawningWave = true;
        const enemies = this.generateWaveEnemies();
        let spawned = 0;

        const isInvadersWave = this.enemyStyle === 'invaders' && enemies.some(e => e && e.inFormation);
        if (isInvadersWave) {
            // If a formation already exists on-screen, do not hard-reset it (avoids jerky motion).
            const hasExistingFormation = this.enemies.some(e => e && e.inFormation);
            if (!hasExistingFormation) {
                this.invaderFormation.dx = 0;
                this.invaderFormation.dy = -180;
                this.invaderFormation.dir = 1;
            }

            // Spawn the full formation at once so it reads as a single invaders group.
            for (const enemy of enemies) {
                const newEnemy = new Enemy(
                    this,
                    enemy.type,
                    enemy.x,
                    enemy.y,
                    {
                        inFormation: !!enemy.inFormation,
                        isBoss: !!enemy.isBoss,
                        isMidBoss: !!enemy.isMidBoss,
                        damageTakenMultiplier: enemy.damageTakenMultiplier,
                        healthOverride: enemy.healthOverride,
                        bossEncounterIndex: enemy.bossEncounterIndex,
                        empressForm: enemy.empressForm,
                        empressDamageMult: enemy.empressDamageMult,
                        empressSpawnAnim: enemy.empressSpawnAnim
                    }
                );
                this.enemies.push(newEnemy);
            }
            this.isSpawningWave = false;
            return;
        }
        
        console.log(`Starting to spawn wave ${this.wave} of round ${this.round} with ${enemies.length} enemies`);
        
        // Store reference to this interval so we can clear it if needed
        this.spawnInterval = setInterval(() => {
            if (spawned >= enemies.length || this.gameState !== 'playing') {
                clearInterval(this.spawnInterval);
                this.isSpawningWave = false;
                console.log(`Finished spawning wave ${this.wave}, waiting for enemies to be defeated`);
                return;
            }

            const enemy = enemies[spawned];
            const newEnemy = new Enemy(
                this,
                enemy.type,
                enemy.x,
                enemy.y,
                {
                    inFormation: !!enemy.inFormation,
                    isBoss: !!enemy.isBoss,
                    isMidBoss: !!enemy.isMidBoss,
                    damageTakenMultiplier: enemy.damageTakenMultiplier,
                    healthOverride: enemy.healthOverride,
                    bossEncounterIndex: enemy.bossEncounterIndex,
                    spawnCenterX: enemy.spawnCenterX,
                    bossGroupIndex: enemy.bossGroupIndex,
                    bossGroupCount: enemy.bossGroupCount,
                    empressForm: enemy.empressForm,
                    empressDamageMult: enemy.empressDamageMult,
                    empressSpawnAnim: enemy.empressSpawnAnim
                }
            );
            
            this.enemies.push(newEnemy);
            spawned++;
        }, 2000); // Increased from 1000 to 2000ms to space out enemy spawns more
    }

    generateWaveEnemies() {
        const enemies = [];
        const width = this.width;

        // Boss Rush mode: every wave is a boss, in strict order.
        if (this.runMode === 'bossRush') {
            const encounterIndex = Math.max(1, Number(this.bossRushBossIndex) || 1);
            const bossTypes = (this.isGreenseaExpanse() && typeof this.getGreenseaBossRushBossTypes === 'function')
                ? this.getGreenseaBossRushBossTypes(encounterIndex)
                : [this.getBossRushBossType()];

            // In Boss Rush, scale boss difficulty by encounter count.
            const bossEncounterIndex = Math.max(0, encounterIndex - 1);

            const count = Math.max(1, bossTypes.length);
            for (let i = 0; i < bossTypes.length; i++) {
                const bossType = bossTypes[i];
                const spread = count === 1 ? 0 : ((i / (count - 1)) - 0.5) * (this.width * 0.42);

                let empressForm = null;
                let empressDamageMult = null;
                let empressSpawnAnim = null;
                if (typeof bossType === 'string' && bossType.startsWith('darkempress')) {
                    const m = bossType.match(/^darkempress(\d+)$/);
                    empressForm = m ? Math.max(0, Math.min(8, Number(m[1]) || 0)) : 0;
                    empressDamageMult = (empressForm === 0) ? 1.05 : 1.0;
                    // Make Queen encounters feel like a true boss arrival.
                    empressSpawnAnim = 'descend';
                }

                enemies.push({
                    type: bossType,
                    x: width / 2 + spread,
                    spawnCenterX: width / 2 + spread,
                    y: -120 - i * 40,
                    isBoss: true,
                    bossEncounterIndex,
                    bossGroupIndex: (count === 1 ? null : i),
                    bossGroupCount: (count === 1 ? null : count),
                    empressForm,
                    empressDamageMult,
                    empressSpawnAnim
                });
            }
            this.advanceBossRushBossIndex();
            return enemies;
        }

        // Boss rush rounds: every wave is a boss.
        if (this.isBossRushRound()) {
            const bossEncounterIndex = this.getBossEncounterIndexForRound(this.round);

            // Starting at round 28, later waves spawn multiple bosses.
            let bossesToSpawn = 1;
            if ((this.round || 1) >= 28) {
                bossesToSpawn = Math.min(4, 1 + Math.floor((Math.max(1, this.wave) - 1) / 2));
            }

            for (let i = 0; i < bossesToSpawn; i++) {
                const bossType = this.getBossTypeForRound(this.round, this.wave + i);
                const spread = bossesToSpawn === 1 ? 0 : ((i / (bossesToSpawn - 1)) - 0.5) * (this.width * 0.42);
                enemies.push({
                    type: bossType,
                    x: width / 2 + spread,
                    spawnCenterX: width / 2 + spread,
                    y: -120 - i * 40,
                    isBoss: true,
                    bossEncounterIndex,
                    bossGroupIndex: i,
                    bossGroupCount: bossesToSpawn
                });
            }
            return enemies;
        }

        // Boss at end of every round: final wave.
        if (this.isBossWave()) {
            if (this.isGreenseaExpanse()) {
                return this.getGreenseaBossWaveEnemies(width);
            }
            const bossType = this.getBossTypeForRound(this.round, this.wave);
            const bossEncounterIndex = this.getBossEncounterIndexForRound(this.round);
            enemies.push({
                type: bossType,
                x: width / 2,
                y: -120,
                isBoss: true,
                bossEncounterIndex
            });
            return enemies;
        }
        
        // Enemy count
        const baseEnemyCount = this.round === 1 ? 3 + Math.min(2, this.wave) :
                               this.round === 2 ? 4 + Math.min(2, this.wave) :
                               5 + Math.min(2, this.wave);

        const types = this.getEnemyTypesForWave();

        // Space-invaders formation (including round 1 wave 1)
        if (this.enemyStyle === 'invaders') {
            // Greensea Expanse uses explicit formation sizes.
            if (this.isGreenseaExpanse()) {
                const spec = this.getGreenseaFormationSpec(this.round);
                const cols = Math.max(3, Number(spec.cols) || 5);
                const rows = Math.max(1, Number(spec.rows) || 4);
                const enemyCount = Math.min(70, cols * rows);

                const mobTypes = this.getGreenseaMobTypePool(this.round);
                const infantryTypes = this.getGreenseaInfantryTypePool();

                // Ensure the formation fits even for wide sprites.
                const maxHalfWidth = 70;
                const leftMargin = 40 + maxHalfWidth;
                const rightMargin = (width - 40) - maxHalfWidth;
                const spacingX = cols > 1 ? ((rightMargin - leftMargin) / (cols - 1)) : 0;
                const spacingY = 70;
                const startX = cols > 1 ? leftMargin : (width / 2);
                const startY = 110;

                for (let r = 0; r < rows; r++) {
                    let infantryInRow = 0;
                    for (let c = 0; c < cols; c++) {
                        // In later Greensea rounds, allow limited infantry mixed into formations.
                        let type = mobTypes[Math.floor(Math.random() * mobTypes.length)];
                        if ((this.round || 1) >= 11 && infantryInRow < 2 && Math.random() < 0.14) {
                            type = infantryTypes[Math.floor(Math.random() * infantryTypes.length)];
                            infantryInRow++;
                        }

                        const hp = infantryTypes.includes(type)
                            ? this.getGreenseaInfantryHealthOverride(this.round)
                            : this.getGreenseaMobHealthOverride(this.round);

                        enemies.push({
                            type,
                            x: startX + c * spacingX,
                            y: startY + r * spacingY,
                            inFormation: true,
                            healthOverride: hp
                        });
                    }
                }

                return enemies;
            }

            // Default invaders mode.
            const enemyCount = Math.min(60, 24 + (this.round - 1) * 12 + (this.wave - 1) * 6);
            const invaderTypes = this.getInvaderEnemyTypesForWave();
            const cols = 8;
            // Ensure the formation fits even for the widest invader sprite (darkling2 width ~= 126).
            const maxHalfWidth = 63;
            const leftMargin = 40 + maxHalfWidth;
            const rightMargin = (width - 40) - maxHalfWidth;
            const spacingX = (rightMargin - leftMargin) / (cols - 1);
            const spacingY = 70;
            const startX = leftMargin;
            const startY = 110;

            for (let i = 0; i < enemyCount; i++) {
                const type = invaderTypes[Math.floor(Math.random() * invaderTypes.length)];
                const row = Math.floor(i / cols);
                const col = i % cols;
                enemies.push({
                    type,
                    x: startX + col * spacingX,
                    y: startY + row * spacingY,
                    inFormation: true
                });
            }

            return enemies;
        }

        // First wave of round 1 - very few enemies
        if (this.round === 1 && this.wave === 1) {
            const maxEnemiesWave1 = 3;
            for (let i = 0; i < maxEnemiesWave1; i++) {
                const type = ['darkling1', 'darkling2', 'darkling3'][Math.floor(Math.random() * 3)];
                const x = width * (i + 1) / (maxEnemiesWave1 + 1);
                const yOffset = type === 'darkling1' ? -130 :
                              type === 'darkling2' ? -100 :
                              type === 'darkling3' ? -70 : -100;
                
                enemies.push({ type, x, y: -50 + yOffset });
            }
            return enemies;
        }

        // Mid-boss Colossus wave (extra threat mixed into a normal wave)
        if (this.shouldSpawnColossusThisWave()) {
            const isAscendant = this.round >= 10 && Math.random() < 0.55;
            const colossusType = isAscendant ? 'darklingcolossusascendant' : 'darklingcolossus';
            const baseHp = isAscendant ? 280 : 220;
            const hp = baseHp + Math.max(0, this.round - 5) * (isAscendant ? 22 : 16);
            enemies.push({
                type: colossusType,
                x: width / 2,
                y: -160,
                isMidBoss: true,
                damageTakenMultiplier: 0.4,
                healthOverride: hp
            });
        }

        // Other regular waves - reduced enemy counts
        const enemyCount = baseEnemyCount;

        for (let i = 0; i < enemyCount; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const x = width * (i + 1) / (enemyCount + 1);
            const yOffset = type === 'darkling1' ? -130 :
                          type === 'darkling2' ? -100 :
                          type === 'darkling3' ? -70 : -100;
            
            enemies.push({ type, x, y: -50 + yOffset });
        }

        return enemies;
    }

    getEnemyTypesForWave() {
        // Debug the selected enemy types for current round and wave
        const types = this.round === 1 ? 
            ['darkling1', 'darkling2', 'darkling3', 'darkling11', 'darkling12', 'darkling13'] :
            this.round === 2 ? 
            ['darkling2', 'darkling3', 'darkling4', 'darkling5', 'darkling6', 'darkling14', 'darkling15', 'darkling16'] :
            // Later rounds: broaden the roster substantially.
            ['darkling4', 'darkling5', 'darkling6', 'darkling7', 'darkling8', 'darkling10',
             'darkdragon1',
             'darkling17', 'darkling18', 'darkling19', 'darkling20', 'darkling21', 'darkling22',
             'darkling23', 'darkling24', 'darkling25', 'darkling26', 'darkling27'];
        
        console.log(`Available enemy types for Round ${this.round}, Wave ${this.wave}:`, types);
        return types;
    }

    checkCollisions() {
        // Check player projectiles vs enemies
        for (const proj of this.projectiles) {
            for (const enemy of this.enemies) {
                if (this.checkCollision(proj, enemy)) {
                    // Some projectiles should only hit each enemy once (e.g., Dere charge wave).
                    if (proj && proj.hitOncePerEnemy && enemy && typeof enemy.uid === 'number') {
                        if (!proj._hitEnemyUids) proj._hitEnemyUids = {};
                        if (proj._hitEnemyUids[enemy.uid]) continue;
                        proj._hitEnemyUids[enemy.uid] = true;
                    }

                    // Beams can be persistent; throttle damage ticks so they don't melt everything instantly.
                    if (proj && proj.isBeam && typeof proj.hitIntervalMs === 'number' && proj.hitIntervalMs > 0 && enemy && typeof enemy.uid === 'number') {
                        if (!proj._lastHitAtByEnemyUid) proj._lastHitAtByEnemyUid = {};
                        const now = Date.now();
                        const last = Number(proj._lastHitAtByEnemyUid[enemy.uid]) || 0;
                        if (now - last < proj.hitIntervalMs) {
                            continue;
                        }
                        proj._lastHitAtByEnemyUid[enemy.uid] = now;
                    }

                    let hitDamage = (proj && proj.damage != null) ? proj.damage : 1;
                    // Kiki heart beam: +20% overall, but falls off across multiple enemies hit in the same tick-window.
                    if (proj && proj.isKikiHeartBeam) {
                        hitDamage = (Number(hitDamage) || 0) * 1.2;
                        const now = Date.now();
                        const windowMs = Math.max(60, Number(proj.hitIntervalMs) || 120);
                        const lastWindowAt = Number(proj._beamWindowAt) || 0;
                        if (now - lastWindowAt >= windowMs) {
                            proj._beamWindowAt = now;
                            proj._beamWindowHits = 0;
                        }
                        const idx = Math.max(0, Math.floor(Number(proj._beamWindowHits) || 0));
                        const mult = idx === 0 ? 1.35 : idx === 1 ? 1.0 : idx === 2 ? 0.75 : idx === 3 ? 0.55 : 0.40;
                        hitDamage = hitDamage * mult;
                        proj._beamWindowHits = idx + 1;
                    }

                    const defeated = enemy.takeDamage(hitDamage);
                    this.particles.push(new Particle(this, proj.x, proj.y, defeated ? 'defeat' : 'hit'));

                    // Pierce handling:
                    // - `true` => infinite pierce
                    // - number => remaining extra penetrations (1 means hit 2 enemies total)
                    // - falsy/undefined => removed after first hit
                    if (proj) {
                        const p = proj.pierce;
                        const infinite = (p === true);
                        if (!infinite) {
                            const remaining = (typeof p === 'number' && Number.isFinite(p)) ? Math.max(0, Math.floor(p)) : 0;
                            if (remaining <= 0) {
                                this.projectiles = this.projectiles.filter(pp => pp !== proj);
                            } else {
                                proj.pierce = remaining - 1;
                            }
                        }
                    }

                    if (defeated) {
                        this.enemies = this.enemies.filter(e => e !== enemy);
                        // Charge special on kills (unlocks at power >= 50).
                        this.addSpecialCharge(1);
                    }
                    break;
                }
            }
        }

        // Check enemy projectiles vs player
        for (const proj of this.enemyProjectiles || []) {
            if (this.checkCollision(proj, this.player)) {
                // Persistent enemy beams should tick damage instead of disappearing on first hit.
                if (proj && proj.isBeam) {
                    const now = Date.now();
                    const interval = Math.max(120, Number(proj.hitIntervalMs) || 280);
                    const last = Number(proj._lastHitAt) || 0;
                    if (now - last >= interval) {
                        proj._lastHitAt = now;
                        this.player.takeDamage((proj && proj.damage != null) ? proj.damage : 1);
                        this.particles.push(new Particle(this, this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 'hit'));
                    }
                    continue;
                }

                this.enemyProjectiles = this.enemyProjectiles.filter(p => p !== proj);
                this.player.takeDamage((proj && proj.damage != null) ? proj.damage : 1);
                this.particles.push(new Particle(this, proj.x, proj.y, 'hit'));
            }
        }

        // Check powerups vs player
        for (const powerup of this.powerups) {
            if (this.checkCollision(powerup, this.player)) {
                this.powerups = this.powerups.filter(p => p !== powerup);
                this.noteDropCollected(powerup, this.getPotionPickupScore(powerup.type));
                powerup.collect(this.player);
            }
        }

        // Check loot vs player
        for (const loot of this.loot || []) {
            if (this.checkCollision(loot, this.player)) {
                this.loot = this.loot.filter(l => l !== loot);
                this.noteDropCollected(loot, loot && typeof loot.value === 'number' ? loot.value : 0);
                loot.collect(this.player);
            }
        }
    }

    checkCollision(a, b) {
        // Many entities in this game store x/y as *center* coordinates (enemies, projectiles, powerups),
        // while the Player stores x/y as *top-left*. Use correct bounds for each.
        const getBounds = (obj, shrinkRatioX = 0, shrinkRatioY = shrinkRatioX) => {
            const isCenterBased =
                obj instanceof Enemy ||
                obj instanceof Projectile ||
                (typeof EnemyProjectile !== 'undefined' && obj instanceof EnemyProjectile) ||
                (typeof Powerup !== 'undefined' && obj instanceof Powerup) ||
                (typeof Loot !== 'undefined' && obj instanceof Loot);

            let left;
            let top;
            let right;
            let bottom;

            if (isCenterBased) {
                left = obj.x - obj.width / 2;
                top = obj.y - obj.height / 2;
                right = obj.x + obj.width / 2;
                bottom = obj.y + obj.height / 2;
            } else {
                left = obj.x;
                top = obj.y;
                right = obj.x + obj.width;
                bottom = obj.y + obj.height;
            }

            const shrinkX = (right - left) * (Number(shrinkRatioX) || 0) * 0.5;
            const shrinkY = (bottom - top) * (Number(shrinkRatioY) || 0) * 0.5;

            return {
                left: left + shrinkX,
                top: top + shrinkY,
                right: right - shrinkX,
                bottom: bottom - shrinkY
            };
        };

        // Arcade-friendly tuning:
        // - Player shots should connect a bit more easily.
        // - Enemy shots should feel slightly more forgiving on the player.
        // Positive values shrink hitboxes; negative values expand them.
        let shrinkA = 0.04;
        let shrinkB = 0.04;

        const isPlayerProjectile = a instanceof Projectile && !(typeof EnemyProjectile !== 'undefined' && a instanceof EnemyProjectile);
        const isEnemyProjectile = (typeof EnemyProjectile !== 'undefined' && a instanceof EnemyProjectile);
        const isEnemy = b instanceof Enemy;
        const isPlayer = b instanceof Player;

        if (isPlayerProjectile && isEnemy) {
            shrinkA = -0.06;
            shrinkB = -0.02;
        } else if (isEnemyProjectile && isPlayer) {
            shrinkA = 0.08;
            shrinkB = 0.18;
        } else if ((typeof Powerup !== 'undefined' && a instanceof Powerup) && isPlayer) {
            shrinkA = 0;
            shrinkB = 0;
        } else if ((typeof Loot !== 'undefined' && a instanceof Loot) && isPlayer) {
            shrinkA = 0;
            shrinkB = 0;
        }

        // Character-specific player hitbox tuning (slightly smaller than sprite).
        if (isPlayer && this.player && typeof this.player.hitboxExtraShrink === 'number') {
            shrinkB = Math.min(0.35, shrinkB + Math.max(0, this.player.hitboxExtraShrink));
        }

        // Requested: add 10% horizontal grace for all characters against harmful collisions.
        // Apply only when the *player* is the thing being hit (enemy projectile/enemy), not when collecting loot/potions.
        const playerHorizGrace = 0.10;
        let shrinkAx = shrinkA;
        let shrinkAy = shrinkA;
        let shrinkBx = shrinkB;
        let shrinkBy = shrinkB;

        if ((isEnemyProjectile || (a instanceof Enemy)) && isPlayer) {
            shrinkBx = Math.min(0.60, shrinkBx + playerHorizGrace);
        }

        const A = getBounds(a, shrinkAx, shrinkAy);
        const B = getBounds(b, shrinkBx, shrinkBy);

        return A.left < B.right &&
               A.right > B.left &&
               A.top < B.bottom &&
               A.bottom > B.top;
    }

    distributeRewards({ scoreOverride = null, callCallback = true } = {}) {
        const rewards = [];
        
        // Zone-aware common pool
        const commonZoneItems = (typeof this.getZoneCommonItemIds === 'function') ? this.getZoneCommonItemIds() : [];
        
        const scoreForRewards = (typeof scoreOverride === 'number') ? scoreOverride : this.score;

        const RAW_SCORE = Math.max(0, Number(scoreForRewards) || 0);

        // Score-based drops (end-of-run) are capped by rarity.
        // NOTE: caps do NOT apply to in-run pickups queued via _queuedEndRewards.
        const SCORE_DROP_CAPS = {
            common: 150,
            uncommon: 100,
            rare: 50,
            legendary: 25
        };

        // Drop rate plateau: after 50M score, additional score yields diminishing returns
        // until it reaches a max drop-rate threshold.
        const SOFTCAP_START = 50_000_000;
        const MAX_EFFECTIVE_SCORE = 200_000_000;
        const SOFTCAP_TAU = 120_000_000;

        // Ensure the maximum is reachable at a finite score.
        // (The exponential approach alone asymptotes and never quite hits the max.)
        let effectiveScore = RAW_SCORE;
        if (RAW_SCORE >= MAX_EFFECTIVE_SCORE) {
            effectiveScore = MAX_EFFECTIVE_SCORE;
        } else if (RAW_SCORE > SOFTCAP_START) {
            const excess = RAW_SCORE - SOFTCAP_START;
            const maxExcess = Math.max(1, MAX_EFFECTIVE_SCORE - SOFTCAP_START);
            const easedExcess = maxExcess * (1 - Math.exp(-excess / SOFTCAP_TAU));
            effectiveScore = SOFTCAP_START + easedExcess;
        }
        effectiveScore = Math.min(MAX_EFFECTIVE_SCORE, Math.max(0, effectiveScore));

        // Total score-based drop count is limited by the sum of rarity caps.
        const MAX_SCORE_DROPS = Object.values(SCORE_DROP_CAPS).reduce((s, n) => s + (Number(n) || 0), 0);
        const ratio = Math.min(1, effectiveScore / MAX_EFFECTIVE_SCORE);
        // Concave curve: grows quickly early, slows at high score.
        const rewardCount = Math.max(0, Math.floor(MAX_SCORE_DROPS * Math.pow(ratio, 0.65)));

        console.log(`Distributing ${rewardCount} score-based rewards (effectiveScore=${Math.round(effectiveScore)}, rawScore=${RAW_SCORE})`);

        const pickWeighted = (items) => {
            const list = (items || []).filter(x => x && x.id && (Number(x.w) || 0) > 0);
            const total = list.reduce((s, x) => s + x.w, 0);
            if (total <= 0) return null;
            let r = Math.random() * total;
            for (const it of list) {
                r -= it.w;
                if (r <= 0) return it.id;
            }
            return list[list.length - 1].id;
        };

        const buildPoolFromIngredientCategories = (predicate) => {
            try {
                if (typeof ingredients !== 'undefined' && Array.isArray(ingredients)) {
                    return ingredients
                        .filter(i => i && i.id && Array.isArray(i.category) && predicate(i.category))
                        .map(i => i.id);
                }
            } catch (_) {
                // ignore
            }
            return [];
        };

        const commonPool = Array.isArray(commonZoneItems) ? commonZoneItems : [];
        const commonWeights = (typeof this.getZoneCommonDropWeights === 'function')
            ? this.getZoneCommonDropWeights()
            : commonPool.map((id) => ({ id, w: id === 'white-sugar' ? 0.35 : 1 }));
        const rarePool = Array.from(new Set([
            ...buildPoolFromIngredientCategories((cats) => cats.some(c => String(c).toLowerCase() === 'rare')),
            // Zone Patrol additions (rare-in-all-zones)
            'greensea-cacao',
            'turbonado-sugar'
        ].filter(Boolean)));

        const veryRarePool = Array.from(new Set([
            ...buildPoolFromIngredientCategories((cats) => cats.some(c => String(c).toLowerCase() === 'exotic')),
        ].filter(Boolean)));

        const ultraRarePool = Array.from(new Set([
            ...buildPoolFromIngredientCategories((cats) => cats.some(c => String(c).toLowerCase() === 'legendary')),
        ].filter(Boolean))).filter(id => id !== 'touch-of-love' && id !== 'dreamvapor' && id !== 'turbonado-sugar');

        const uncommonSet = new Set(rarePool);
        const rareSet = new Set(veryRarePool);
        const legendarySet = new Set(ultraRarePool);

        const rarityCounts = { common: 0, uncommon: 0, rare: 0, legendary: 0 };

        const getRarityForId = (id) => {
            if (!id) return 'common';
            if (id === 'touch-of-love') return 'legendary';
            if (legendarySet.has(id)) return 'legendary';
            if (rareSet.has(id)) return 'rare';
            if (uncommonSet.has(id)) return 'uncommon';
            return 'common';
        };

        const tryAddRewardId = (id) => {
            const rarity = getRarityForId(id);
            if ((rarityCounts[rarity] || 0) >= (SCORE_DROP_CAPS[rarity] || 0)) return false;
            rarityCounts[rarity] = (rarityCounts[rarity] || 0) + 1;
            rewards.push(id);
            return true;
        };

        // Rarity shift after 1.5M score: every +500k adds
        // +3% rare, +2% very rare, +1% ultra-rare (capped at +9/+6/+3).
        const score = Math.max(0, Number(effectiveScore) || 0);
        const steps = score > 1500000 ? Math.floor((score - 1500000) / 500000) : 0;
        const extraRare = Math.min(0.09, steps * 0.03);
        const extraVery = Math.min(0.06, steps * 0.02);
        const extraUltra = Math.min(0.03, steps * 0.01);

        const baseRare = 0.07;
        const baseVery = 0.03;
        const baseUltra = 0.01;

        const rareP = baseRare + extraRare;
        const veryP = baseVery + extraVery;
        const ultraP = baseUltra + extraUltra;
        const commonP = Math.max(0.10, 1 - rareP - veryP - ultraP);

        // Randomly select rewards from tiered pools.
        const tierOrder = ['legendary', 'rare', 'uncommon', 'common'];
        const pickTierWithCaps = (preferred) => {
            const pref = String(preferred || 'common');
            // Try preferred first; if it's capped, fall back to the remaining tiers.
            const sequence = [pref, ...tierOrder.filter(t => t !== pref)];
            for (const t of sequence) {
                if ((rarityCounts[t] || 0) < (SCORE_DROP_CAPS[t] || 0)) return t;
            }
            return null;
        };

        let added = 0;
        let attempts = 0;
        const maxAttempts = Math.max(50, rewardCount * 10);
        while (added < rewardCount && attempts < maxAttempts) {
            attempts++;
            const preferred = pickWeighted([
                { id: 'common', w: commonP },
                { id: 'uncommon', w: rareP },
                { id: 'rare', w: veryP },
                { id: 'legendary', w: ultraP }
            ]) || 'common';

            const tier = pickTierWithCaps(preferred);
            if (!tier) break;

            if (tier === 'common') {
                const id = pickWeighted(commonWeights) || (commonPool.length ? commonPool[Math.floor(Math.random() * commonPool.length)] : null);
                if (id && tryAddRewardId(id)) added++;
                continue;
            }

            let pool = commonPool;
            if (tier === 'uncommon') pool = rarePool;
            else if (tier === 'rare') pool = veryRarePool;
            else if (tier === 'legendary') pool = ultraRarePool;

            if (Array.isArray(pool) && pool.length) {
                const id = pool[Math.floor(Math.random() * pool.length)];
                if (id && tryAddRewardId(id)) added++;
            } else {
                // Pool missing: fall back to common
                const id = pickWeighted(commonWeights) || (commonPool.length ? commonPool[Math.floor(Math.random() * commonPool.length)] : null);
                if (id && tryAddRewardId(id)) added++;
            }
        }

        // Milestone guarantee: for every 50,000 points, guarantee at least one "100vrp" item.
        // (10% chance the guaranteed milestone item is legendary.)
        const milestones = Math.floor(Math.max(0, Number(scoreForRewards) || 0) / 50000);
        if (milestones > 0) {
            const vrpPool = this.getVrp100RewardIds();
            const legendaryPool = this.getLegendaryRewardIds();
            const isIn = (id, pool) => Array.isArray(pool) && pool.includes(id);

            const alreadyCount = rewards.reduce((n, id) => n + (isIn(id, vrpPool) || isIn(id, legendaryPool) ? 1 : 0), 0);
            const need = Math.max(0, milestones - alreadyCount);

            for (let i = 0; i < need; i++) {
                const useLegendary = Math.random() < 0.10;
                const pool = useLegendary ? legendaryPool : vrpPool;
                if (Array.isArray(pool) && pool.length) {
                    const id = pool[Math.floor(Math.random() * pool.length)];
                    if (id) tryAddRewardId(id);
                }
            }
        }
        
        // Guaranteed Touch of Love every 750,000 points (and again each additional 750,000).
        const touchMilestones = Math.floor(Math.max(0, Number(scoreForRewards) || 0) / 750000);
        if (touchMilestones > 0) {
            for (let i = 0; i < touchMilestones; i++) {
                if (!tryAddRewardId('touch-of-love')) break;
            }
        }
        
        // (Legendary ingredients are handled as rare boss drops instead.)

        // Aggregate duplicates into { id, amount } so UI and inventory can display "Egg x2".
        const counts = {};
        for (const id of rewards) {
            if (!id) continue;
            counts[id] = (counts[id] || 0) + 1;
        }

        // Merge in any queued end-of-run drops (earned during the run).
        if (Array.isArray(this._queuedEndRewards)) {
            for (const item of this._queuedEndRewards) {
                const id = item && item.id ? item.id : null;
                const amount = item && typeof item.amount === 'number' ? item.amount : 0;
                if (!id || amount <= 0) continue;
                counts[id] = (counts[id] || 0) + amount;
            }
        }

        const aggregatedRewards = Object.entries(counts)
            .map(([id, amount]) => ({ id, amount }))
            .sort((a, b) => String(a.id).localeCompare(String(b.id)));
        
        // Call callback with rewards if it exists
        if (callCallback && this.onRewardsCollected) {
            this.onRewardsCollected(aggregatedRewards);
        }
        
        console.log("Final rewards:", aggregatedRewards);
        return aggregatedRewards;
    }

    awardBossRushAlchemyRewardsIfAny() {
        if (this.runMode !== 'bossRush') return [];
        const last = Number(this._bossRushLastAlchemyRewardScore) || 0;
        const delta = Math.max(0, (Number(this.score) || 0) - last);
        if (delta <= 0) return [];

        const rewards = this.distributeRewards({ scoreOverride: delta, callCallback: true });
        this._bossRushLastAlchemyRewardScore = Number(this.score) || 0;
        return rewards;
    }

    gameOver() {
        // Prevent double-triggering (multiple bullets can collide in the same frame).
        if (this.gameState === 'gameOver' || this.gameState === 'endScreen') return;
        this.gameState = 'endScreen';
        
        // Use character-specific game over sound and image
        const gameOverKey = (this.player && this.player.gameOverImage) ? this.player.gameOverImage : 'deregameover';
        const gameOverImage = this.assets.images[gameOverKey];
        
        if (!gameOverImage) {
            console.error('Game over image not found:', gameOverKey);
            return;
        }

        // Play game over sound
        const keys = (this.player && this.player.sounds && Array.isArray(this.player.sounds.gameOver))
            ? this.player.sounds.gameOver
            : ['gameOver', 'gameOver1'];
        const pickKey = keys[Math.floor(Math.random() * keys.length)];
        const gameoverSound = this.assets.sounds[pickKey];
        
        if (gameoverSound) {
            gameoverSound.currentTime = 0;
            gameoverSound.play().catch(() => {});
        }

        this.showEndScreen({ title: 'Game Over', subtitle: 'Better luck next time.' });
    }

    respawnPlayerAfterLifeLoss() {
        if (!this.player) return;

        // Full heal
        const maxHp = this.player.maxHealth || 10;
        this.player.health = maxHp;
        if (Array.isArray(this.player.healthOverlays)) {
            for (let i = 0; i < this.player.healthOverlays.length; i++) {
                this.player.healthOverlays[i].alpha = 1;
            }
        }

        // Clear shield HP on respawn (prevents confusing partial bars)
        if (typeof this.player.shieldHp === 'number') {
            this.player.shieldHp = 0;
        }

        // Reposition to a safe default
        this.player.x = this.width / 2 - this.player.width / 2;
        this.player.y = this.height - this.player.height - 60;

        // Clear enemy bullets so the respawn isn't instantly unfair
        if (this.enemyProjectiles) {
            this.enemyProjectiles = [];
        }

        // Brief invulnerability window
        this.player.invulnerableUntil = Date.now() + 2000;

        // Break combo on death
        if (typeof this.breakCombo === 'function') {
            this.breakCombo();
        }

        // Quick flash
        try {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        } catch (_) {
            // ignore
        }
    }

    handleClick(e) {
        if (this.gameState === 'playing') {
            this.fireProjectile(e);
        }
    }

    takeDamage() {
        // Check for invincibility from shield potion
        if (this.shieldActive) {
            console.log("Shield active - damage prevented!");
            // Create a shield flash effect to show impact
            this.game.ctx.save();
            this.game.ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
            this.game.ctx.fillRect(0, 0, this.game.width, this.game.height);
            this.game.ctx.restore();
            
            // Play a shield block sound
            const hitSound = this.game.assets.sounds.hit1;
            if (hitSound) {
                hitSound.currentTime = 0;
                hitSound.volume = 0.3;
                hitSound.play();
            }
            
            return; // Prevent damage while shield is active
        }
        
        // Only reduce health and play damage sound if not shielded
        this.health--;
        const hitSound = Math.random() < 0.5 ? this.game.assets.sounds.hit1 : this.game.assets.sounds.hit2;
        hitSound.play();

        // Update health overlays regardless of shield status
        if (this.healthOverlays) {
            for (let i = 0; i < this.healthOverlays.length; i++) {
                this.healthOverlays[i].alpha = i < this.health ? 1 : Math.max(0, this.healthOverlays[i].alpha - this.fadeSpeed);
            }
        }

        if (this.health <= 0) {
            // Extra lives: continue where you left off
            if (this.game && typeof this.game.lives === 'number' && this.game.lives > 0) {
                this.game.lives = Math.max(0, this.game.lives - 1);

                // Restore health
                this.health = this.maxHealth || 10;
                if (this.healthOverlays) {
                    for (let i = 0; i < this.healthOverlays.length; i++) {
                        this.healthOverlays[i].alpha = i < this.health ? 1 : 0;
                    }
                }

                // Clear enemy bullets so the respawn isn't instantly unfair
                if (this.game.enemyProjectiles) {
                    this.game.enemyProjectiles = [];
                }

                // Brief invulnerability
                this.shieldActive = true;
                this.shieldEndTime = Date.now() + 2000;

                // Quick flash
                try {
                    this.game.ctx.save();
                    this.game.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                    this.game.ctx.fillRect(0, 0, this.game.width, this.game.height);
                    this.game.ctx.restore();
                } catch (_) {
                    // ignore
                }

                return;
            }

            this.game.gameOver();
        }
    }

    resetGame() {
        // Reset game state variables
        this.score = 0;
        this.round = 1;
        this.wave = 1;
        this.gameState = 'menu';
        this.isPaused = false;
        this.isSpawningWave = false;

        // Reset extra lives
        this.lives = 0;
        
        // Clear all game entities
        this.projectiles = [];
        this.enemies = [];
        this.particles = [];
        this.powerups = [];
        this.loot = [];
        this._queuedEndRewards = [];
        if (this.enemyProjectiles) {
            this.enemyProjectiles = [];
        }
        
        // Reset player position and health
        if (this.player) {
            this.player.x = this.width / 2 - this.player.width / 2;
            this.player.y = this.height - this.player.height - 60;
            this.player.health = this.player.maxHealth || 10;
            this.player.isLeft = false;
            this.player.lastShot = 0;

            // Clear temporary effects
            this.player.shieldHp = 0;
            this.player.bonusMaxShieldHp = 0;
            this.player.mysticSurgeTonicCount = 0;
            this.player.isChargingShot = false;
            this.player.chargeStartTime = 0;
            this.player.invulnerableUntil = 0;

            // Reset power progression for the new run
            if (typeof this.player.setPowerLevel === 'function') {
                this.player.setPowerLevel(1);
            } else {
                this.player.powerLevel = 1;
                if (typeof this.player.applyPowerLevel === 'function') this.player.applyPowerLevel();
            }

            this.player.powerChoice = null;
            this.specialCharge = 0;
            this.specialChargesStored = 0;

            // Reset health overlays
            for (const overlay of this.player.healthOverlays) {
                overlay.alpha = 1;
            }
        } else {
            // If player doesn't exist, create a new one
            this.player = new Player(this);
        }
        
        // Clear any active intervals or timeouts
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
            this.spawnInterval = null;
        }
        
        // Clear the canvas
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }

        // Clear UI timers (legacy shield UI still uses a timer)
        this.shieldUI = null;
        
        console.log('Game reset complete - starting new game');
        
        // Start a new game
        this.gameState = 'playing';
        this.spawnWave();
    }
}

class Player {
    constructor(game) {
        this.game = game;
        this.maxHealth = 10;
        this.width = 85;
        this.height = 200;
        this.x = game.width / 2 - this.width / 2;
        this.y = game.height - this.height - 60;
        this.speed = 5;
        this.health = this.maxHealth;
        this.isLeft = false;
        this.lastShot = 0;
        this.shotCooldown = 175; // milliseconds (a bit faster than before)
        this.fadeSpeed = 0.1;

        // Persistent power system (green potions stack): Power Level 1..200
        this.powerLevel = 1;
        this._powerProgress = 1; // allows half-step progression after 100
        this.powerChoice = null; // 'beam' | 'spread10' | 'homing'
        this.baseProjectileSize = 1.1;
        this.baseProjectileSpeed = 15;
        this.projectileSize = 1.1;
        this.projectileSpeed = 15;
        this.powerExtraProjectileChance = 0;

        // Burst-speed/slowdown mechanic: encourages controlled burst firing.
        // First 12 pellets travel faster, then speed ramps down quickly if you hold fire.
        this._burstPelletsFired = 0;
        this._wasShooting = false;

        // Health overlays will be set in initializeSelectedCharacter
        this.healthOverlays = [];

        // Shield-as-HP (blue stars)
        this.baseMaxShieldHp = 20;
        this.bonusMaxShieldHp = 0;
        this.shieldHp = 0;

        // Mystic Surge Tonic: every 3 increases max shield capacity by +4.
        this.mysticSurgeTonicCount = 0;

        // Projectile potion (purple): improves charge scaling (levels 0..10)
        this.projectilePotionLevel = 0;
        this.isChargingShot = false;
        this.chargeStartTime = 0;

        // Power 130 perk selection
        this._power130ChoiceMade = false;
        this.chargeTimeMultiplier = 1;
        this._specialRateBonus = 0;

        // Power 25 unlock notice + power 200 extra-life milestone
        this._chargeUnlockNotified = false;
        this._power200LifeGranted = false;

        // Brief invulnerability window (e.g., after spending a life)
        this.invulnerableUntil = 0;

        // Character tuning (set by initializeSelectedCharacter)
        this.damageMultiplier = 1.0;
        this.projectilePierceDefault = false;
        this.hitboxExtraShrink = 0;
        this.hasInnateChargeShot = false;

        // Kiki beam state
        this._kikiBeamProjectile = null;
        this._kikiBeamExtended = false;
        this._kikiBeamStartedAt = 0;

        // Kaskit rare voice state
        this._kaskitRarePlayedRound = 0;
        this._kaskitPainLockUntil = 0;
    }

    update() {
        const now = Date.now();
        // Kiki special: slight move speed buff + shield trickle.
        let moveSpeed = this.speed;
        if (this.game && this.game.selectedCharacter === 'kiki' && now < (Number(this._kikiSpecialUntil) || 0)) {
            moveSpeed = moveSpeed * 1.12;
            const nextTickAt = Number(this._kikiSpecialNextShieldTickAt) || 0;
            if (now >= nextTickAt) {
                this.addShieldHp(1);
                this._kikiSpecialNextShieldTickAt = now + 2000;
            }
        }

        // Handle movement
        if (this.game.keys.left && this.x > 0) {
            this.x -= moveSpeed;
            this.isLeft = true;
        }
        if (this.game.keys.right && this.x < this.game.width - this.width) {
            this.x += moveSpeed;
            this.isLeft = false;
        }

        // Detect a new "shooting session" (mouse pressed this frame)
        const shootingNow = !!this.game.isShooting;
        if (shootingNow && !this._wasShooting) {
            this._burstPelletsFired = 0;
        }
        if (!shootingNow && this._wasShooting) {
            this._burstPelletsFired = 0;
        }
        this._wasShooting = shootingNow;

        // Handle shooting
        if (this.game.isShooting) {
            // Kiki's Heart Beam replaces normal firing while held.
            if (this.isKikiHeartBeamMode()) {
                this.updateKikiHeartBeam(true);
            } else {
                const now = Date.now();
                if (now - this.lastShot >= this.shotCooldown) {
                    this.shoot();
                    this.lastShot = now;
                }
            }
        } else {
            // If beam mode is active, releasing fire ends the beam quickly.
            if (this.isKikiHeartBeamMode()) {
                this.updateKikiHeartBeam(false);
            }
        }

        // Kaskit special: incorporeal auto-fire (200% overcharge) while active.
        if (this.game && this.game.selectedCharacter === 'kaskit') {
            const now = Date.now();
            if (now < (Number(this._kaskitIncorporealUntil) || 0) && this.game.gameState === 'playing') {
                const nextAt = Number(this._kaskitAutoFireNextAt) || 0;
                if (now >= nextAt) {
                    this.shootCharged(3000);
                    this._kaskitAutoFireNextAt = now + 450;
                }
            }
        }
        
        // Update powerup effects
        this.updatePowerupEffects();
    }
    
    updatePowerupEffects() {
        // Legacy timed shield removed; shield is now HP-based.
    }
    
    draw() {
        // Use character-specific sprites
        const sprite = this.isLeft ? 
            this.game.assets.images[this.game.player.sprites.left] : 
            this.game.assets.images[this.game.player.sprites.right];

        if (sprite) {
            // Kaskit special: translucent while incorporeal.
            if (this.game && this.game.selectedCharacter === 'kaskit') {
                const now = Date.now();
                if (now < (Number(this._kaskitIncorporealUntil) || 0)) {
                    this.game.ctx.save();
                    this.game.ctx.globalAlpha = 0.55;
                }
            }
            // Subtle shield aura based on shield HP
            if ((Number(this.shieldHp) || 0) > 0) {
                const maxShield = this.getMaxShieldHp();
                const frac = maxShield > 0 ? Math.min(1, (Number(this.shieldHp) || 0) / maxShield) : 0;
                const now = Date.now();
                const alpha = 0.10 + 0.22 * frac + Math.abs(Math.sin(now * 0.003)) * 0.05;
                const shieldRadius = this.width * (0.7 + 0.25 * frac);
                const centerX = Math.floor(this.x + this.width / 2);
                const centerY = Math.floor(this.y + this.height / 2);

                this.game.ctx.save();
                const gradient = this.game.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.floor(shieldRadius));
                gradient.addColorStop(0, 'rgba(100, 200, 255, 0)');
                gradient.addColorStop(0.65, `rgba(100, 200, 255, ${alpha})`);
                gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
                this.game.ctx.fillStyle = gradient;
                this.game.ctx.beginPath();
                this.game.ctx.arc(centerX, centerY, shieldRadius, 0, Math.PI * 2);
                this.game.ctx.fill();
                this.game.ctx.restore();
            }
            
            // Draw the player sprite
            this.game.ctx.drawImage(sprite, Math.round(this.x), Math.round(this.y), this.width, this.height);

            // Restore alpha if we saved for incorporeal.
            if (this.game && this.game.selectedCharacter === 'kaskit') {
                const now = Date.now();
                if (now < (Number(this._kaskitIncorporealUntil) || 0)) {
                    this.game.ctx.restore();
                }
            }
            
            // Draw power level effect if boosted
            if (this.powerLevel && this.powerLevel > 1) {
                this.game.ctx.save();
                
                const now = Date.now();
                // Green glow effect around player
                this.game.ctx.shadowColor = 'rgba(0, 255, 0, 0.7)';
                const intensity = Math.min(1, (this.powerLevel - 1) / 99);
                this.game.ctx.shadowBlur = (15 + intensity * 15) + Math.sin(now * 0.01) * 5;
                
                // Show power particles occasionally
                if (Math.random() < 0.2) {
                    const particleX = this.x + Math.random() * this.width;
                    const particleY = this.y + Math.random() * this.height;
                    this.game.ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
                    this.game.ctx.beginPath();
                    this.game.ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
                    this.game.ctx.fill();
                }
                
                this.game.ctx.restore();
            }
        }

        // Only draw health overlays if not ignored
        if (!this.ignoreVisualOverlays && this.healthOverlays) {
            for (let i = 0; i < this.healthOverlays.length; i++) {
                const overlay = this.healthOverlays[i];
                overlay.alpha = i < this.health ? 1 : Math.max(0, overlay.alpha - this.fadeSpeed);
                if (overlay.alpha > 0) {
                    const healthSprite = this.game.assets.images[overlay.sprite];
                    if (healthSprite) {
                        this.game.ctx.globalAlpha = overlay.alpha;
                        this.game.ctx.drawImage(healthSprite, this.x, this.y, this.width, this.height);
                        this.game.ctx.globalAlpha = 1;
                    }
                }
            }
        }
    }

    getMaxShieldHp() {
        return Math.max(0, (Number(this.baseMaxShieldHp) || 0) + (Number(this.bonusMaxShieldHp) || 0));
    }

    addShieldHp(amount) {
        const add = Math.max(0, Number(amount) || 0);
        if (add <= 0) return;
        const max = this.getMaxShieldHp();
        this.shieldHp = Math.min(max, (Number(this.shieldHp) || 0) + add);
    }

    startChargeShot() {
        const power = Number(this.powerLevel) || 1;
        if (power < 25 && !this.hasInnateChargeShot) return;
        if (this.game && this.game.gameState !== 'playing') return;
        this.isChargingShot = true;
        this.chargeStartTime = Date.now();
    }

    releaseChargeShot() {
        if (!this.isChargingShot) return;
        this.isChargingShot = false;
        const power = Number(this.powerLevel) || 1;
        if (power < 25 && !this.hasInnateChargeShot) return;
        const elapsed = Math.max(0, Date.now() - (Number(this.chargeStartTime) || Date.now()));
        this.chargeStartTime = 0;
        // Require minimum hold to prevent spam-fire exploit (reduced by charge-time bonuses)
        const timeMult = this.getChargeTimeMultiplier();
        const minHold = Math.max(300, Math.round(1000 * timeMult));
        if (elapsed < minHold) return;
        this.shootCharged(elapsed);
    }

    getChargeTimeMultiplier() {
        return Math.max(0.55, Math.min(2.5, Number(this.chargeTimeMultiplier) || 1));
    }

    getChargeSizeMultiplier(elapsedMs) {
        const lvl = Math.max(0, Math.min(10, Number(this.projectilePotionLevel) || 0));
        const timeMult = this.getChargeTimeMultiplier();
        const t = Math.max(0, Math.min(1, (Number(elapsedMs) || 0) / Math.max(1, 3000 * timeMult)));
        return 1 + (lvl * 0.1) * t;
    }

    getChargeDamageMultiplier(elapsedMs) {
        const timeMult = this.getChargeTimeMultiplier();
        const t = Math.max(0, Math.min(1, (Number(elapsedMs) || 0) / Math.max(1, 5000 * timeMult)));
        return 1 + 4 * t; // up to 500% at 5s
    }

    shootCharged(elapsedMs) {
        // Dere: charged attack is a full-screen wave that damages all enemies it passes through.
        if (this.game && this.game.selectedCharacter === 'dere') {
            const originX = this.game.width / 2;
            const originY = this.y;

            const dmgMult = this.getChargeDamageMultiplier(elapsedMs);
            const sizeMult = this.getChargeSizeMultiplier(elapsedMs);

            // Create a wide, slightly thick wave that travels upward and hits each enemy once.
            const wave = new Projectile(this.game, originX, originY, originX, originY - 1);
            wave.sprite = 'dereShotCharge';
            wave.dx = 0;
            wave.dy = -Math.max(9, (this.projectileSpeed || 15) * 0.75);
            // Width scales by charge level:
            // - 100% (1.0x) => ~30% of screen
            // - 300%+ (3.0x+) => full width
            const chargeT = Math.max(0, Math.min(1, (Number(dmgMult) - 1) / 2));
            const widthRatio = 0.30 + 0.70 * chargeT;
            wave.width = Math.round(this.game.width * widthRatio);

            // Preserve sprite aspect ratio to avoid squish.
            const sprite = this.game.assets?.images?.dereShotCharge;
            if (sprite && sprite.width && sprite.height) {
                const scale = wave.width / sprite.width;
                const thicknessMult = Math.max(0.85, Math.min(1.6, Number(sizeMult) || 1));
                wave.height = Math.max(12, Math.round(sprite.height * scale * thicknessMult));
            } else {
                wave.height = Math.round(70 * Math.max(1, sizeMult));
            }
            wave.pierce = true;
            wave.hitOncePerEnemy = true;
            wave.damage = (Number(wave.damage) || 1) * dmgMult;

            this.game.projectiles.push(wave);
            return;
        }

        // Kaskit: charged volley of 3 penetrating daggers, scaling with hold (max 3s).
        if (this.game && this.game.selectedCharacter === 'kaskit') {
            const t = Math.max(0, Math.min(1, (Number(elapsedMs) || 0) / 3000));
            const baseScale = 0.6 + 1.4 * t; // 0.6..2.0
            const offsetX = this.isLeft ? -10 : 10;
            const originX = this.x + this.width / 2 + offsetX;
            const originY = this.y;
            const targetX = this.game.mousePosition.x;
            const targetY = this.game.mousePosition.y;

            const originSpread = 10;
            const targetSpread = 24;
            const per = [0.85, 1.0, 1.22];
            const lateral = [-1, 0, 1];

            for (let i = 0; i < 3; i++) {
                const projectile = new Projectile(
                    this.game,
                    originX + lateral[i] * originSpread,
                    originY,
                    targetX + lateral[i] * targetSpread,
                    targetY
                );
                projectile.pierce = true;
                projectile.damage = (Number(projectile.damage) || 1) * baseScale * per[i];
                // Charged shots ignore the row-penetration limit.
                // Only shots charged >120% get full-screen range.
                const fullScreen = baseScale > 1.2;
                const diag = Math.hypot(this.game.width, this.game.height);
                projectile.maxDistance = fullScreen ? Math.round(diag + 240) : 900;
                this.game.projectiles.push(projectile);
            }
            return;
        }

        const sizeMult = this.getChargeSizeMultiplier(elapsedMs);
        const dmgMult = this.getChargeDamageMultiplier(elapsedMs);
        const offsetX = this.isLeft ? -10 : 10;
        const originX = this.x + this.width / 2 + offsetX;
        const originY = this.y;
        const targetX = this.game.mousePosition.x;
        const targetY = this.game.mousePosition.y;

        const powerLevel = this.powerLevel || 1;
        const usesSpreadProgression = (this.game.selectedCharacter === 'dere' || this.game.selectedCharacter === 'kiki');

        const fire = (originOffsetX, targetOffsetX, { isBeam = false } = {}) => {
            const projectile = new Projectile(
                this.game,
                originX + originOffsetX,
                originY,
                targetX + targetOffsetX,
                targetY
            );

            if (isBeam) {
                projectile.pierce = true;
                // Match baseline beam feel
                projectile.width = Math.round(projectile.width * 1.8);
                projectile.height = Math.round(projectile.height * 2.6);
                projectile.dx *= 1.2;
                projectile.dy *= 1.2;
                const dist = Math.hypot(targetX - originX, targetY - originY);
                const approxFrames = dist / Math.max(1, (this.projectileSpeed || 15) * 1.2);
                const approxMs = (approxFrames * 1000) / 60;
                projectile.ttlMs = Math.max(520, Math.min(1900, Math.round(approxMs + 360)));
                projectile.createdAt = Date.now();
            }

            projectile.damage = (Number(projectile.damage) || 1) * dmgMult;
            projectile.width = Math.round(projectile.width * sizeMult * (isBeam ? 1.35 : 1));
            projectile.height = Math.round(projectile.height * sizeMult);

            this.game.projectiles.push(projectile);
        };

        if (powerLevel >= 30 && this.powerChoice === 'beam') {
            fire(0, 0, { isBeam: true });
        } else if (powerLevel >= 30 && this.powerChoice === 'homing') {
            // Aliza only
            const projectile = new Projectile(this.game, originX, originY, targetX, targetY);
            projectile.isHoming = true;
            projectile.homingReachedTarget = false;
            projectile.initialTargetX = targetX;
            projectile.initialTargetY = targetY;
            this.game.projectiles.push(projectile);
        } else if (powerLevel >= 30 && this.powerChoice === 'spread10') {
            // Dere/Kiki option
            const pellets = 10;
            const targetSpread = 90;
            const originSpread = 26;
            for (let i = 0; i < pellets; i++) {
                const t = pellets === 1 ? 0 : (i / (pellets - 1)) * 2 - 1;
                fire(t * originSpread, t * targetSpread);
            }
        } else {
            if (usesSpreadProgression && powerLevel >= 20) {
                const originGaps = [-12, -4, 4, 12];
                const targetGaps = [-24, -8, 8, 24];
                for (let i = 0; i < 4; i++) fire(originGaps[i], targetGaps[i]);
            } else if (usesSpreadProgression && powerLevel >= 10) {
                fire(-6, -10);
                fire(6, 10);
            } else {
                fire(0, 0);
            }
        }

        if (this.powerExtraProjectileChance > 0 && Math.random() < this.powerExtraProjectileChance) {
            const jitterX = (Math.random() < 0.5 ? -1 : 1) * (16 + Math.random() * 14);
            fire(0, jitterX);
        }
    }

    shoot() {
        const offsetX = this.isLeft ? -10 : 10;
        const originX = this.x + this.width/2 + offsetX;
        const originY = this.y;
        const targetX = this.game.mousePosition.x;
        const targetY = this.game.mousePosition.y;

        const powerLevel = this.powerLevel || 1;
        const usesSpreadProgression = (this.game.selectedCharacter === 'dere' || this.game.selectedCharacter === 'kiki');
        const isKaskit = this.game.selectedCharacter === 'kaskit';

        const getPelletSpeedMult = (pelletIndex) => {
            const idx = Math.max(1, Number(pelletIndex) || 1);
            if (idx <= 12) return 1.6;
            const over = idx - 12;
            // Fast ramp-down after 12 pellets; clamp so it never becomes unusably slow.
            return Math.max(0.75, 1.6 - over * 0.07);
        };

        const fire = (originOffsetX, targetOffsetX) => {
            const projectile = new Projectile(
                this.game,
                originX + originOffsetX,
                originY,
                targetX + targetOffsetX,
                targetY
            );

            const pelletIndex = (this._burstPelletsFired || 0) + 1;
            this._burstPelletsFired = pelletIndex;
            const mult = getPelletSpeedMult(pelletIndex);
            if (mult !== 1.0) {
                projectile.dx *= mult;
                projectile.dy *= mult;
            }
            this.game.projectiles.push(projectile);
        };

        // Kaskit: always single dagger (no spread upgrades). Pierce is applied in Projectile ctor.
        if (isKaskit) {
            fire(0, 0);
        } else if (this.game.selectedCharacter === 'kiki' && powerLevel >= 30 && this.powerChoice === 'beam') {
            // Kiki beam is handled in updateKikiHeartBeam() so we don't spawn normal pellets here.
            // (This path is mostly a safeguard; update() should bypass calling shoot() in beam mode.)
        } else {

        // Level 30: choice-based firing mode
        if (powerLevel >= 30 && this.powerChoice === 'beam') {
            const projectile = new Projectile(
                this.game,
                originX,
                originY,
                targetX,
                targetY
            );
            projectile.pierce = true;
            // TTL is distance-based so the beam can actually reach enemies.
            // (Projectile speed is per-frame; TTL is real-time.)
            const dist = Math.hypot(targetX - originX, targetY - originY);
            const approxFrames = dist / Math.max(1, (this.projectileSpeed || 15) * 1.2);
            const approxMs = (approxFrames * 1000) / 60;
            projectile.ttlMs = Math.max(420, Math.min(1600, Math.round(approxMs + 260)));
            projectile.createdAt = Date.now();
            projectile.width = Math.round(projectile.width * 1.8);
            projectile.height = Math.round(projectile.height * 2.6);
            // Slightly faster beam feel
            projectile.dx *= 1.2;
            projectile.dy *= 1.2;

            const pelletIndex = (this._burstPelletsFired || 0) + 1;
            this._burstPelletsFired = pelletIndex;
            const mult = getPelletSpeedMult(pelletIndex);
            if (mult !== 1.0) {
                projectile.dx *= mult;
                projectile.dy *= mult;
            }
            this.game.projectiles.push(projectile);
        } else if (powerLevel >= 30 && this.powerChoice === 'homing') {
            // Aliza only
            const projectile = new Projectile(this.game, originX, originY, targetX, targetY);
            projectile.isHoming = true;
            projectile.homingReachedTarget = false;
            projectile.initialTargetX = targetX;
            projectile.initialTargetY = targetY;
            this.game.projectiles.push(projectile);
        } else if (powerLevel >= 30 && this.powerChoice === 'spread10') {
            const pellets = 10;
            const targetSpread = 90;
            const originSpread = 26;
            for (let i = 0; i < pellets; i++) {
                const t = pellets === 1 ? 0 : (i / (pellets - 1)) * 2 - 1; // -1..1
                fire(t * originSpread, t * targetSpread);
            }
        } else {
            // Baseline progression:
            // - <10: single shot
            // - >=10: 2-shot
            // - >=20: 4-shot spread
            if (usesSpreadProgression && powerLevel >= 20) {
                const originGaps = [-12, -4, 4, 12];
                const targetGaps = [-24, -8, 8, 24];
                for (let i = 0; i < 4; i++) fire(originGaps[i], targetGaps[i]);
            } else if (usesSpreadProgression && powerLevel >= 10) {
                fire(-6, -10);
                fire(6, 10);
            } else {
                fire(0, 0);
            }
        }

        }

        // Small bonus chance for an extra projectile at higher power.
        if (this.powerExtraProjectileChance > 0 && Math.random() < this.powerExtraProjectileChance) {
            const jitterX = (Math.random() < 0.5 ? -1 : 1) * (16 + Math.random() * 14);
            fire(0, jitterX);
        }
        
        // Play shoot sound with cooldown
        if (!this.lastSoundTime || Date.now() - this.lastSoundTime > 3000) {
            const spellSounds = this.game.assets.sounds.spellfire;
            const randomSound = spellSounds[Math.floor(Math.random() * spellSounds.length)];
            if (randomSound) {
                randomSound.currentTime = 0;
                randomSound.play().catch(() => {});
            }
            this.lastSoundTime = Date.now();
        }
    }

    takeDamage(amount = 1) {
        const now = Date.now();
        // Kaskit special: incorporeal (invulnerable)
        if (this.game && this.game.selectedCharacter === 'kaskit' && now < (Number(this._kaskitIncorporealUntil) || 0)) return;
        if (now < (Number(this.invulnerableUntil) || 0)) return;

        // Damage must be applied as an integer (hearts). Allow scaled values by stochastically rounding.
        const raw = Math.max(0, Number(amount) || 1);
        const whole = Math.floor(raw);
        const frac = raw - whole;
        let dmg = whole;
        if (frac > 0 && Math.random() < frac) dmg += 1;
        dmg = Math.max(1, dmg);

        // Shield HP absorbs damage first
        if ((Number(this.shieldHp) || 0) > 0) {
            this.shieldHp = Math.max(0, (Number(this.shieldHp) || 0) - dmg);

            try {
                this.game.ctx.save();
                this.game.ctx.fillStyle = 'rgba(100, 200, 255, 0.22)';
                this.game.ctx.fillRect(0, 0, this.game.width, this.game.height);
                this.game.ctx.restore();
            } catch (_) {
                // ignore
            }

            const hitSound = this.game.assets.sounds.hit1;
            if (hitSound) {
                hitSound.currentTime = 0;
                hitSound.volume = 0.25;
                hitSound.play().catch(() => {});
            }
            return;
        }

        // Main HP
        this.health = (Number(this.health) || 0) - dmg;
        this.playCharacterHitSound();

        if (this.healthOverlays) {
            for (let i = 0; i < this.healthOverlays.length; i++) {
                this.healthOverlays[i].alpha = i < this.health ? 1 : Math.max(0, this.healthOverlays[i].alpha - this.fadeSpeed);
            }
        }

        if (this.health <= 0) {
            // Extra lives: continue where you left off
            if (this.game && typeof this.game.lives === 'number' && this.game.lives > 0) {
                this.game.lives = Math.max(0, this.game.lives - 1);

                if (typeof this.game.respawnPlayerAfterLifeLoss === 'function') {
                    this.game.respawnPlayerAfterLifeLoss();
                } else {
                    this.health = this.maxHealth || 10;
                    if (this.healthOverlays) {
                        for (let i = 0; i < this.healthOverlays.length; i++) {
                            this.healthOverlays[i].alpha = i < this.health ? 1 : 0;
                        }
                    }
                    if (this.game.enemyProjectiles) {
                        this.game.enemyProjectiles = [];
                    }
                    this.invulnerableUntil = Date.now() + 2000;
                }
                return;
            }

            this.game.gameOver();
        }
    }

    setPowerLevel(level) {
        const prev = Math.max(1, Math.floor(Number(this.powerLevel) || 1));
        const clamped = Math.max(1, Math.min(200, Number(level) || 1));
        this.powerLevel = clamped;
        this._powerProgress = clamped;
        this.applyPowerLevel();

        // Level 30: offer the choice once (character-specific).
        const c = this.game && this.game.selectedCharacter;
        const hasLevel30Choice = (c === 'dere' || c === 'kiki' || c === 'aliza');
        if (hasLevel30Choice && this.powerLevel >= 30 && !this.powerChoice && this.game.gameState === 'playing') {
            this.game.isShooting = false;
            this.game.gameState = 'powerChoice';
        }

        // Power 25: charge shot unlock notice
        if (!this._chargeUnlockNotified && this.powerLevel >= 25 && this.game && typeof this.game.showTransientDialog === 'function') {
            // Avoid spamming if restarting from a higher power.
            if (prev < 25) {
                this.game.showTransientDialog('Charge Shot Unlocked! Hold Right Click (RMB) and release to fire.', 2000);
            }
            this._chargeUnlockNotified = true;
        }

        // Power 130: offer a new choice once
        if (!this._power130ChoiceMade && this.powerLevel >= 130 && this.game && this.game.gameState === 'playing') {
            if (prev < 130) {
                this.game.isShooting = false;
                this.game.gameState = 'powerChoice130';
            }
        }

        // Power 200: grant a second extra life slot and award +1 life
        if (!this._power200LifeGranted && this.powerLevel >= 200 && this.game) {
            if (prev < 200) {
                this.game.maxLives = Math.max(2, Number(this.game.maxLives) || 0);
                if (typeof this.game.lives === 'number') {
                    const cap = Number(this.game.maxLives) || 2;
                    this.game.lives = Math.min(cap, Math.max(0, Number(this.game.lives) || 0) + 1);
                }
                if (typeof this.game.showTransientDialog === 'function') {
                    this.game.showTransientDialog('Milestone! Extra Life +1 (Power 200).', 1800);
                }
            }
            this._power200LifeGranted = true;
        }
    }

    applyPowerLevel() {
        const level = this.powerLevel || 1;
        // Extend scaling beyond 100 at 50% rate up to 200.
        const effective = level <= 100 ? level : (100 + (level - 100) * 0.5);
        const t = Math.max(0, Math.min(1.5, (effective - 1) / 99)); // 0..1.5

        // Scale up to the previously requested buff at level 10: +20% size, +40% speed
        const sizeMult = 1 + 0.20 * t;
        const speedMult = 1 + 0.40 * t;
        this.projectileSize = (this.baseProjectileSize || 1) * sizeMult;
        this.projectileSpeed = (this.baseProjectileSpeed || 15) * speedMult;

        // Scale up to +5% extra projectiles at level 100
        this.powerExtraProjectileChance = 0.05 * t;
    }

    gainPowerFromGreenPotion(count = 1) {
        const n = Math.max(0, Math.floor(Number(count) || 0));
        if (n <= 0) return;

        if (!Number.isFinite(Number(this._powerProgress))) {
            this._powerProgress = Number(this.powerLevel) || 1;
        }

        const prevLevel = Math.floor(Number(this.powerLevel) || 1);

        for (let i = 0; i < n; i++) {
            const p = Number(this._powerProgress) || 1;
            const delta = p < 100 ? 1 : 0.5;
            this._powerProgress = Math.min(200, p + delta);
        }

        const newLevel = Math.max(1, Math.min(200, Math.floor((Number(this._powerProgress) || 1) + 1e-6)));
        this.powerLevel = newLevel;
        this.applyPowerLevel();

        // Reuse milestone logic (without clobbering fractional progress).
        const prev = Math.max(1, prevLevel);
        if (!this._chargeUnlockNotified && this.powerLevel >= 25 && this.game && typeof this.game.showTransientDialog === 'function') {
            if (prev < 25) {
                this.game.showTransientDialog('Charge Shot Unlocked! Hold Right Click (RMB) and release to fire.', 2000);
            }
            this._chargeUnlockNotified = true;
        }

        const c = this.game && this.game.selectedCharacter;
        const hasLevel30Choice = (c === 'dere' || c === 'kiki' || c === 'aliza');
        if (hasLevel30Choice && this.powerLevel >= 30 && !this.powerChoice && this.game && this.game.gameState === 'playing') {
            this.game.isShooting = false;
            this.game.gameState = 'powerChoice';
        }

        if (!this._power130ChoiceMade && this.powerLevel >= 130 && this.game && this.game.gameState === 'playing') {
            if (prev < 130) {
                this.game.isShooting = false;
                this.game.gameState = 'powerChoice130';
            }
        }

        if (!this._power200LifeGranted && this.powerLevel >= 200 && this.game) {
            if (prev < 200) {
                this.game.maxLives = Math.max(2, Number(this.game.maxLives) || 0);
                if (typeof this.game.lives === 'number') {
                    const cap = Number(this.game.maxLives) || 2;
                    this.game.lives = Math.min(cap, Math.max(0, Number(this.game.lives) || 0) + 1);
                }
                if (typeof this.game.showTransientDialog === 'function') {
                    this.game.showTransientDialog('Milestone! Extra Life +1 (Power 200).', 1800);
                }
            }
            this._power200LifeGranted = true;
        }
    }

    playCharacterHitSound() {
        const keys = (this.sounds && Array.isArray(this.sounds.hit) && this.sounds.hit.length)
            ? this.sounds.hit
            : ['hit1', 'hit2'];

        // Kaskit rare line rules: only once per round, and while it plays, don't start another pain sound.
        if (this.game && this.game.selectedCharacter === 'kaskit') {
            const now = Date.now();
            if (now < (Number(this._kaskitPainLockUntil) || 0)) return;

            const rareKey = 'kaskitHitRare';
            const canPlayRare = (this.game.round || 0) !== (Number(this._kaskitRarePlayedRound) || 0);
            const rollRare = Math.random() < 0.08;

            if (canPlayRare && rollRare && keys.includes(rareKey)) {
                const audio = this.game.assets.sounds[rareKey];
                if (audio) {
                    this._kaskitRarePlayedRound = this.game.round || 0;
                    audio.currentTime = 0;
                    audio.play().catch(() => {});
                    const fallback = 5000;
                    const dur = (Number(audio.duration) && Number.isFinite(audio.duration)) ? Math.round(audio.duration * 1000) : fallback;
                    this._kaskitPainLockUntil = now + Math.max(1200, Math.min(12000, dur));
                    return;
                }
            }

            const nonRare = keys.filter(k => k && k !== rareKey);
            const pick = nonRare.length ? nonRare[Math.floor(Math.random() * nonRare.length)] : keys[Math.floor(Math.random() * keys.length)];
            const audio = this.game.assets.sounds[pick];
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
            return;
        }

        const pick = keys[Math.floor(Math.random() * keys.length)];
        const audio = this.game && this.game.assets && this.game.assets.sounds ? this.game.assets.sounds[pick] : null;
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    }

    isKikiHeartBeamMode() {
        return !!(this.game && this.game.selectedCharacter === 'kiki' && (this.powerLevel || 1) >= 30 && this.powerChoice === 'beam');
    }

    updateKikiHeartBeam(isHoldingFire) {
        const now = Date.now();

        // If not holding fire, end the beam quickly.
        if (!isHoldingFire) {
            if (this._kikiBeamProjectile && this._kikiBeamProjectile.ttlMs != null && this._kikiBeamProjectile.createdAt != null) {
                const elapsed = now - this._kikiBeamProjectile.createdAt;
                this._kikiBeamProjectile.ttlMs = Math.min(this._kikiBeamProjectile.ttlMs, elapsed + 140);
            }
            return;
        }

        const alive = this._kikiBeamProjectile && this.game && Array.isArray(this.game.projectiles) && this.game.projectiles.includes(this._kikiBeamProjectile);

        if (!alive) {
            // Start a new beam
            const originX = this.x + this.width / 2;
            const originY = this.y;
            const beam = new Projectile(this.game, originX, originY, originX, originY - 1);
            beam.sprite = 'kikiBeam';
            beam.pierce = true;
            beam.isBeam = true;
            beam.isKikiHeartBeam = true;
            beam.hitIntervalMs = 120;
            beam.anchorToPlayer = true;
            // Visual was getting squished too thin; make the beam match the sprite's intended thickness.
            beam.width = 78;
            // Height is dynamically adjusted in Projectile.update() to fill from player to top.
            beam.height = Math.round(this.game.height);
            beam.dx = 0;
            beam.dy = 0;
            beam.createdAt = now;
            beam.ttlMs = 3000;
            beam.damage = (Number(beam.damage) || 1) * 0.5; // ~50% baseline

            this.game.projectiles.push(beam);
            this._kikiBeamProjectile = beam;
            this._kikiBeamExtended = false;
            this._kikiBeamStartedAt = now;
            return;
        }

        // Extend to 6 seconds if the player keeps holding before it ends.
        if (!this._kikiBeamExtended && this._kikiBeamProjectile && (now - (this._kikiBeamProjectile.createdAt || now)) >= 2000) {
            this._kikiBeamProjectile.ttlMs = 6000;
            this._kikiBeamExtended = true;
        }
    }

    pickProjectileVisual() {
        const character = this.game ? this.game.selectedCharacter : null;
        const power = this.powerLevel || 1;

        if (character === 'kaskit') {
            // Tiered daggers: 1 (start), 2 (10), 3 (30), 4 (50)
            let sprite = 'kaskitDagger1';
            let sizeMult = 1.0;
            if (power >= 50) {
                sprite = 'kaskitDagger4';
                sizeMult = 1.85;
            } else if (power >= 30) {
                sprite = 'kaskitDagger3';
                sizeMult = 1.55;
            } else if (power >= 10) {
                sprite = 'kaskitDagger2';
                sizeMult = 1.15;
            }
            return { sprite, sizeMult };
        }

        if (character === 'kiki') {
            const sprites = Array.isArray(this.projectileSprites) && this.projectileSprites.length
                ? this.projectileSprites
                : ['kikiShot1', 'kikiShot2', 'kikiShot3', 'kikiShot4'];

            const t = Math.max(0, Math.min(1, ((power - 1) / 99)));
            const bias = 1 + 3.0 * t; // stronger bias at higher power
            const weights = sprites.map((_, i) => Math.pow(i + 1, bias));
            const total = weights.reduce((s, w) => s + w, 0);
            let r = Math.random() * total;
            for (let i = 0; i < sprites.length; i++) {
                r -= weights[i];
                if (r <= 0) return { sprite: sprites[i] };
            }
            return { sprite: sprites[sprites.length - 1] };
        }

        if (character === 'aliza') {
            const sprites = Array.isArray(this.projectileSprites) && this.projectileSprites.length
                ? this.projectileSprites
                : ['alizaShot1', 'alizaShot2', 'alizaShot3'];
            const sprite = sprites[Math.floor(Math.random() * sprites.length)];
            if (sprite === 'alizaShot2') {
                // Preserve the original "shot2 alternates size" feel.
                const sizeOverride = Math.random() < 0.5 ? 3 : 2;
                return { sprite, sizeOverride };
            }
            return { sprite };
        }

        // Default/Dere
        const sprites = Array.isArray(this.projectileSprites) && this.projectileSprites.length
            ? this.projectileSprites
            : ['shot1', 'shot1a', 'shot1b'];
        return { sprite: sprites[Math.floor(Math.random() * sprites.length)] };
    }
}

class Projectile {
    constructor(game, x, y, targetX, targetY) {
        this.game = game;
        this.x = x;
        this.y = y;
        // Use character-specific settings
        let projectileSize = (this.game.player && this.game.player.projectileSize) ? this.game.player.projectileSize : 1;
        
        this.width = 40 * projectileSize;
        this.height = 40 * projectileSize;
        this.speed = this.game.player.projectileSpeed || 15;
        const dmgMult = (this.game.player && typeof this.game.player.damageMultiplier === 'number') ? this.game.player.damageMultiplier : 1.0;
        this.damage = 1 * dmgMult;

        // Default pierce behavior
        if (this.game && this.game.selectedCharacter === 'kaskit' && this.game.player) {
            // Kaskit row-penetration progression:
            // - Starts by penetrating 1 row (hits 2 enemies)
            // - +1 row every 10 power levels
            // - At high power, reaches screen-clearing penetration.
            const power = Number(this.game.player.powerLevel) || 1;
            const rowsHit = 2 + Math.floor(Math.max(0, power) / 10);
            if (rowsHit >= 8) {
                this.pierce = true;
            } else {
                this.pierce = Math.max(0, rowsHit - 1);
            }
        } else if (this.game.player && this.game.player.projectilePierceDefault) {
            this.pierce = true;
        }
        
        const angle = Math.atan2(targetY - y, targetX - x);
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;

        // Character-specific projectile visuals
        if (this.game.player && typeof this.game.player.pickProjectileVisual === 'function') {
            const v = this.game.player.pickProjectileVisual() || {};
            if (v.sizeOverride != null) {
                projectileSize = Number(v.sizeOverride) || projectileSize;
            } else if (v.sizeMult != null) {
                projectileSize = projectileSize * (Number(v.sizeMult) || 1);
            }
            this.width = 40 * projectileSize;
            this.height = 40 * projectileSize;
            this.sprite = v.sprite || this.sprite;
        }

        // Safety: Kaskit's daggers should not travel forever.
        if (this.game && this.game.selectedCharacter === 'kaskit') {
            this.startX = x;
            this.startY = y;
            this.maxDistance = 1550;
        }
    }

    update() {
        if (this.ttlMs != null) {
            if (this.createdAt == null) this.createdAt = Date.now();
            if (Date.now() - this.createdAt >= this.ttlMs) return true;
        }
        if (this.anchorToEnemy && this.enemyRef) {
            // Anchor beam/projectile to an enemy while it exists.
            const ox = Number(this.anchorOffsetX) || 0;
            const oy = Number(this.anchorOffsetY) || 0;

            // If this is a beam, allow it to sweep/track to be more threatening.
            if (this.isBeam) {
                const now = Date.now();
                if (this.createdAt == null) this.createdAt = now;
                const t = now - this.createdAt;

                const maxOff = Number(this.beamMaxOffset) || 0;
                const strength = Number(this.beamTrackStrength) || 0;
                const swayAmp = Number(this.beamSwayAmp) || 0;
                const swayMs = Number(this.beamSwayMs) || 250;
                const sway = swayAmp ? (Math.sin((t / Math.max(1, swayMs)) * Math.PI * 2) * swayAmp) : 0;

                let targetOff = 0;
                if (this.game && this.game.player && typeof this.game.player.x === 'number') {
                    const playerCenterX = this.game.player.x + (this.game.player.width || 0) / 2;
                    targetOff = playerCenterX - this.enemyRef.x;
                }
                if (maxOff > 0) targetOff = Math.max(-maxOff, Math.min(maxOff, targetOff));

                const cur = Number(this.anchorOffsetX) || 0;
                const next = strength > 0 ? (cur + (targetOff - cur) * Math.max(0, Math.min(1, strength))) : cur;
                this.anchorOffsetX = next;

                this.x = this.enemyRef.x + next + sway;
            } else {
                this.x = this.enemyRef.x + ox;
            }

            this.y = this.enemyRef.y + (this.enemyRef.height * 0.35) + oy;
        } else if (this.anchorToPlayer && this.game && this.game.player) {
            // Anchor beam/projectile to the player while it exists.
            this.x = this.game.player.x + this.game.player.width / 2;
            if (this.isBeam) {
                // Beam spans from the top of the screen down to the player.
                // Use player center so the beam visually connects cleanly.
                const originY = Math.max(0, Math.round(this.game.player.y + (this.game.player.height || 0) * 0.5));
                this.height = Math.max(1, originY);
                this.y = this.height / 2;
            } else {
                this.y = this.game.player.y - (this.height / 2);
            }
        } else if (this.isHoming) {
            // Homing shot: first travel to initial target (reticle), then track nearest enemy
            if (!this.homingReachedTarget) {
                // Travel toward initial reticle position
                const distToTarget = Math.hypot(this.initialTargetX - this.x, this.initialTargetY - this.y);
                if (distToTarget < 10) {
                    this.homingReachedTarget = true;
                } else {
                    this.x += this.dx;
                    this.y += this.dy;
                }
            } else {
                // Now home to nearest enemy
                let nearestEnemy = null;
                let nearestDist = Infinity;
                if (this.game && this.game.enemies) {
                    for (const enemy of this.game.enemies) {
                        if (enemy && typeof enemy.x === 'number' && typeof enemy.y === 'number') {
                            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                            if (dist < nearestDist) {
                                nearestDist = dist;
                                nearestEnemy = enemy;
                            }
                        }
                    }
                }
                if (nearestEnemy) {
                    // Steer toward nearest enemy
                    const targetX = nearestEnemy.x;
                    const targetY = nearestEnemy.y + (nearestEnemy.height || 0) * 0.35;
                    const angle = Math.atan2(targetY - this.y, targetX - this.x);
                    const speed = Math.hypot(this.dx, this.dy);
                    this.dx = Math.cos(angle) * speed;
                    this.dy = Math.sin(angle) * speed;
                }
                this.x += this.dx;
                this.y += this.dy;
            }
        } else {
            this.x += this.dx;
            this.y += this.dy;
        }

        if (this.maxDistance != null && this.startX != null && this.startY != null) {
            const dist = Math.hypot(this.x - this.startX, this.y - this.startY);
            if (dist >= this.maxDistance) return true;
        }
        return this.isOffscreen();
    }

    draw() {
        const sprite = this.game.assets.images[this.sprite];
        if (sprite) {
            // Beam sprites look better when tiled (avoids extreme vertical stretching).
            if (this.isBeam && this.anchorToPlayer) {
                const drawX = Math.round(this.x - this.width / 2);
                const totalH = Math.max(1, Math.round(this.height));

                // Kiki beam is already long enough; draw it once (no visible tiling).
                if (this.sprite === 'kikiBeam') {
                    this.game.ctx.drawImage(sprite, drawX, 0, this.width, totalH);
                    return;
                }

                const scaleX = (sprite.width > 0) ? (this.width / sprite.width) : 1;
                const segH = Math.max(1, Math.round(sprite.height * scaleX));
                let y = 0;
                while (y < totalH) {
                    const h = Math.min(segH, totalH - y);
                    const srcH = Math.max(1, Math.round(sprite.height * (h / segH)));
                    this.game.ctx.drawImage(sprite, 0, 0, sprite.width, srcH, drawX, y, this.width, h);
                    y += h;
                }
                return;
            }

            const drawX = Math.round(this.x - this.width / 2);
            const drawY = Math.round(this.y - this.height / 2);
            this.game.ctx.drawImage(sprite, drawX, drawY, this.width, this.height);
        }
    }

    isOffscreen() {
        if (this.anchorToPlayer || this.anchorToEnemy) return false;
        return this.x < 0 || this.x > this.game.width || 
               this.y < 0 || this.y > this.game.height;
    }
}

class Enemy {
    constructor(game, type, x, y, options = {}) {
        this.game = game;
        this.type = type;
        this.x = x;
        this.y = y;
        if (typeof Enemy._nextUid !== 'number') Enemy._nextUid = 1;
        this.uid = Enemy._nextUid++;
        console.log(`Creating enemy of type: ${type} at position (${x}, ${y})`);

        this.isBoss = !!options.isBoss || type.includes('boss') || type.startsWith('darkempress') || type.startsWith('darkforgedtitans') || type.startsWith('darkmidboss');
        this.isMidBoss = !!options.isMidBoss || type.startsWith('darklingcolossus');
        this.damageTakenMultiplier = (typeof options.damageTakenMultiplier === 'number') ? options.damageTakenMultiplier : 1;

        const isGreensea = !!(this.game && typeof this.game.isGreenseaExpanse === 'function' && this.game.isGreenseaExpanse());
        const isBossRush = !!(this.game && this.game.runMode === 'bossRush');
        const infantryMatch = /^darklingmob(\d+)$/.exec(String(type || ''));
        const isInfantry = !!(infantryMatch && Number(infantryMatch[1]) >= 52 && Number(infantryMatch[1]) <= 60);

        // Infantry: 30% damage reduction (take 70% damage).
        if (isInfantry && typeof options.damageTakenMultiplier !== 'number') {
            this.damageTakenMultiplier = 0.7;
        }

        // Bosses and midbosses: default mitigation.
        // - Non-Greensea: 60% DR (take 40% damage)
        // - Greensea: 75% DR (take 25% damage)
        if ((this.isBoss || this.isMidBoss) && typeof options.damageTakenMultiplier !== 'number') {
            // Boss Rush: 70% DR (take 30% damage) as a safer baseline.
            this.damageTakenMultiplier = isBossRush ? 0.3 : (isGreensea ? 0.25 : 0.4);
        }
        this.bossEncounterIndex = (typeof options.bossEncounterIndex === 'number') ? options.bossEncounterIndex : this.game.getBossEncounterIndexForRound(this.game.round);
        this.spawnCenterX = (typeof options.spawnCenterX === 'number') ? options.spawnCenterX : null;
        this.bossGroupIndex = (typeof options.bossGroupIndex === 'number') ? options.bossGroupIndex : null;
        this.bossGroupCount = (typeof options.bossGroupCount === 'number') ? options.bossGroupCount : null;

        // Dark Empress form tuning (optional)
        this.empressForm = (typeof options.empressForm === 'number') ? options.empressForm : null;
        this.empressDamageMult = (typeof options.empressDamageMult === 'number') ? options.empressDamageMult : 1.0;
        this.empressSpawnAnim = options.empressSpawnAnim || null;

        // Set dimensions based on enemy type
        if (type === 'darkling1') {
            this.width = 34;    // 20% smaller (from 42)
            this.height = 67;   // 20% smaller (from 84)
        } else if (type === 'darkling2') {
            this.width = 126;   // 20% larger (from 84)
            this.height = 126;  
        } else if (type.startsWith('darkdragon')) {
            this.width = 120;
            this.height = 120;
        } else if (type.startsWith('darkempress')) {
            this.width = 168;
            this.height = 168;
        } else if (type.startsWith('darkmidboss')) {
            this.width = 176;
            this.height = 176;
        } else if (type.startsWith('darkforgedtitans')) {
            this.width = 190;
            this.height = 190;
        } else if (type.startsWith('darklingcolossus')) {
            this.width = 230;
            this.height = 230;
        } else if (type.startsWith('darkprincess')) {
            this.width = 176;
            this.height = 176;
        } else if (type === 'darklingboss4' || type === 'darklingboss5' || type === 'darklingboss6' || type === 'darklingboss7' || type === 'darklingboss8' || type === 'darklingboss9' || type === 'darklingboss10') {
            this.width = 176;
            this.height = 176;
        } else if (type.startsWith('darklingmob')) {
            // Greensea mob sprites are larger than intended; render them slightly smaller than the default.
            this.width = 74;
            this.height = 74;
        } else {
            this.width = 84;    
            this.height = 84;   
        }
        this.reversePattern = Math.random() > 0.5;
        this.patternOffset = Math.random() * Math.PI * 2;
        this.health = (typeof options.healthOverride === 'number') ? options.healthOverride : this.getInitialHealth();
        this.maxHealth = this.health;

        this.inFormation = !!options.inFormation && !this.isBoss && !this.isMidBoss;
        if (this.inFormation) {
            this.baseX = x;
            this.baseY = y;
            const f = this.game.invaderFormation;
            this.x = this.baseX + (f ? f.dx : 0);
            this.y = this.baseY + (f ? f.dy : 0);
            this.pattern = null;

            // Make invaders formations less "paper thin" so they don't drop instantly.
            const minHp = this.game.round === 1 ? 2 : this.game.round === 2 ? 3 : 4;
            this.health = Math.max(this.health, minHp);
        } else {
            // Allow special boss spawn animations to temporarily override movement.
            this._normalPattern = this.getMovementPattern();
            this.pattern = this._normalPattern;

            if (this.type.startsWith('darkempress') && this.empressSpawnAnim === 'descend') {
                this._empressSpawnStartedAt = Date.now();
                this._empressSpawnDone = false;
                this.isInvulnerable = true;
                const targetY = 150;
                this.pattern = (t) => {
                    if (!this._empressSpawnDone) {
                        // Smooth descent from above.
                        const dt = Math.max(0, t - (this._empressSpawnStartedAt || t));
                        const p = Math.max(0, Math.min(1, dt / 1400));
                        const eased = 1 - Math.pow(1 - p, 3);
                        const yNow = (-220) + (targetY - (-220)) * eased;
                        if (p >= 1) {
                            this._empressSpawnDone = true;
                            this.isInvulnerable = false;
                            // Sneaky opening 3-shot volley, then settle.
                            this.fireEmpressSpawnVolley();
                            this.lastShot = t;
                        }
                        return { x: 0, y: yNow };
                    }
                    return this._normalPattern ? this._normalPattern(t) : { x: 0, y: 150 };
                };
            }
        }

        this.shotCooldown = this.getShotCooldown();
        // De-sync and slow down shooting in formation mode so enemies don't fire in a perfect chorus.
        if (this.inFormation && this.game.enemyStyle === 'invaders') {
            this.shotCooldown = Math.round(this.shotCooldown * 1.8);
        }
        // Add per-enemy cooldown jitter to avoid synchronized volleys.
        const minCooldown = (this.isBoss || this.isMidBoss) ? 320 : 480;
        this.shotCooldown = Math.max(minCooldown, Math.round(this.shotCooldown * (0.8 + Math.random() * 0.6)));
        // Stagger initial shot timing.
        // For mobs (round 4+): control the initial delay so they start firing earlier each round,
        // down to 0.5s by round 15.
        const now = Date.now();
        if (!this.isBoss && !this.isMidBoss && this.game && typeof this.game.getMobInitialShotDelayMs === 'function') {
            const delayBase = this.game.getMobInitialShotDelayMs();
            if (typeof delayBase === 'number') {
                const jitter = Math.floor((Math.random() - 0.5) * 200);
                const delayMs = Math.max(0, delayBase + jitter);
                this.lastShot = now - Math.max(0, this.shotCooldown - delayMs);
            } else {
                this.lastShot = now + Math.floor(Math.random() * this.shotCooldown);
            }
        } else {
            this.lastShot = now + Math.floor(Math.random() * this.shotCooldown);
        }
        this.speed = this.getSpeed();
        this.points = this.getPoints();
        this.fadeAlpha = 1;
        this.shieldActive = false;
        this.shieldCooldown = 0;
        this.lastTeleport = 0;
        this.spawnTime = Date.now();
        this.isInvulnerable = false;
        this.isCharging = false;

        // Boss telegraph + specials
        this._telegraphWindowStart = 0;
        this._telegraphWindowMs = 0;
        this._telegraphPulses = 1;

        // Dark Empress special beam (form 3+)
        this._specialAttack = null;
        this._specialTelegraphStartAt = 0;
        this._specialTelegraphMs = 0;
        this._specialTelegraphPulses = 2;
        this._beamActiveUntil = 0;
        this._lastBeamAt = 0;
        // Check if sprite is available and log result
        if (!this.game.assets.images[this.type]) {
            console.error(`ERROR: Sprite for ${this.type} not found! Available sprites:`, Object.keys(this.game.assets.images));
        } else {
            console.log(`Successfully created ${this.type} enemy with image:`, this.game.assets.images[this.type].src);
        }
    }

    getInitialHealth() {
        if (this.type === 'darklingboss1') return 25;
        if (this.type === 'darklingboss2') return 30;
        if (this.type === 'darklingboss3') return 40;
        // Greensea: ensure bosses/midbosses/princesses/empress have correct HP even when not
        // spawned through the Greensea boss-wave helper (e.g., Boss Rush mode / boss rush rounds).
        if (this.game && typeof this.game.isGreenseaExpanse === 'function' && this.game.isGreenseaExpanse()) {
            const isGreenseaBossType =
                this.type.startsWith('darkempress') ||
                this.type.startsWith('darkmidboss') ||
                this.type.startsWith('darkprincess') ||
                this.type.startsWith('darklingboss');
            if (isGreenseaBossType && typeof this.game.getGreenseaBossHealthOverride === 'function') {
                const hp = this.game.getGreenseaBossHealthOverride(this.type, this.bossEncounterIndex || 0);
                if (typeof hp === 'number') return hp;
            }
        }
        if (this.type.startsWith('darkempress')) {
            const idx = Math.max(0, (this.bossEncounterIndex || 0) - 1);
            return 90 + idx * 18;
        }
        if (this.type.startsWith('darkmidboss')) {
            const idx = Math.max(0, (this.bossEncounterIndex || 0));
            return 18 + idx * 6;
        }
        if (this.type.startsWith('darkforgedtitans')) {
            const idx = Math.max(0, (this.bossEncounterIndex || 0) - 1);
            return 150 + idx * 24;
        }
        if (this.type === 'darklingcolossus') return 220;
        if (this.type === 'darklingcolossusascendant') return 280;
        if (this.type === 'darkling4') return 20;
        if (this.type === 'darkling7') return 10;
        if (['darkling6', 'darkling8'].includes(this.type)) return 2;
        if (this.type.startsWith('darkdragon')) return 4;
        return 1;
    }

    getMovementPattern() {
        const randomOffset = this.patternOffset;
        const reverseDirection = this.reversePattern ? -1 : 1;
        const phaseOffset = Math.random() * 1000;
        const verticalOffset = Math.random() * 50 - 25;
        const amplitudeVariation = 0.8 + Math.random() * 0.4;

        const makeJerkPattern = ({
            baseY = 175,
            xRangeFrac = 0.26,
            yRange = 95,
            jumpMinMs = 900,
            jumpMaxMs = 1700,
            burstMinMs = 220,
            burstMaxMs = 380,
            wobbleX = 9,
            wobbleY = 6,
            wobbleSpeedX = 0.0024,
            wobbleSpeedY = 0.0018,
            diveChance = 0.18,
            diveMinMs = 520,
            diveMaxMs = 900,
            diveAmpMin = 80,
            diveAmpMax = 150,
        } = {}) => {
            const maxX = Math.max(60, this.game.width * xRangeFrac);
            const phase1 = Math.random() * Math.PI * 2;
            const phase2 = Math.random() * Math.PI * 2;

            let curX = 0;
            let curY = baseY;
            let fromX = 0;
            let fromY = baseY;
            let toX = 0;
            let toY = baseY;
            let segStart = 0;
            let segBurstMs = 0;
            let nextJumpAt = 0;

            let diveStart = 0;
            let diveMs = 0;
            let diveAmp = 0;

            const pickTarget = () => {
                // Bias toward center so bosses don't constantly hug the walls.
                const u = (Math.random() * 2 - 1);
                const v = (Math.random() * 2 - 1);
                const bx = (u * 0.75 + u * u * u * 0.25) * maxX;
                const by = baseY + v * yRange;
                return { x: bx * reverseDirection, y: by };
            };

            return (t) => {
                if (!nextJumpAt) nextJumpAt = t;
                if (t >= nextJumpAt) {
                    fromX = curX;
                    fromY = curY;

                    const target = pickTarget();
                    toX = target.x;
                    toY = target.y;

                    segStart = t;
                    segBurstMs = burstMinMs + Math.random() * Math.max(1, (burstMaxMs - burstMinMs));
                    nextJumpAt = t + jumpMinMs + Math.random() * Math.max(1, (jumpMaxMs - jumpMinMs));

                    // Occasionally trigger a real dive/swoop downward.
                    if (Math.random() < diveChance) {
                        diveStart = t + 120 + Math.random() * 220;
                        diveMs = diveMinMs + Math.random() * Math.max(1, (diveMaxMs - diveMinMs));
                        diveAmp = diveAmpMin + Math.random() * Math.max(1, (diveAmpMax - diveAmpMin));
                    }
                }

                const p = segBurstMs > 0 ? Math.max(0, Math.min(1, (t - segStart) / segBurstMs)) : 1;

                // Jerky feel: move quickly, then hold.
                const moveFrac = (p < 0.35) ? (p / 0.35) : 1;
                const eased = 1 - Math.pow(1 - moveFrac, 2);

                curX = fromX + (toX - fromX) * eased;
                curY = fromY + (toY - fromY) * eased;

                const wobX = Math.sin(t * wobbleSpeedX + randomOffset + phase1) * wobbleX
                    + Math.sin(t * (wobbleSpeedX * 0.53) + phase2) * (wobbleX * 0.35);
                const wobY = Math.sin(t * wobbleSpeedY + randomOffset + phase2) * wobbleY;

                let diveY = 0;
                if (diveStart && t >= diveStart) {
                    const dp = diveMs > 0 ? Math.max(0, Math.min(1, (t - diveStart) / diveMs)) : 1;
                    diveY = Math.sin(dp * Math.PI) * diveAmp;
                    if (dp >= 1) {
                        diveStart = 0;
                        diveMs = 0;
                        diveAmp = 0;
                    }
                }

                return {
                    x: curX + wobX,
                    y: curY + wobY + diveY
                };
            };
        };

        switch(this.type) {
            case 'darkling1':
                const gridSize = 120;
                const moveSpeed = 0.006;
                let initialX = this.x;
                let initialY = this.y;
                let lastChangeTime = 0;
                let isRandomMove = false;
                let randomAngle = 0;
                let randomDuration = 0;
                return t => {
                    // Check for random direction change (50% chance every 3 seconds)
                    if (!isRandomMove && t - lastChangeTime > 3000 && Math.random() < 0.5) {
                        isRandomMove = true;
                        randomAngle = Math.random() * Math.PI * 2;
                        randomDuration = 500; // Duration of random movement in ms
                        lastChangeTime = t;
                    }
                    // Handle random movement
                    if (isRandomMove) {
                        if (t - lastChangeTime < randomDuration) {
                            // Quick burst in random direction
                            return {
                                x: initialX + Math.cos(randomAngle) * ((t - lastChangeTime) / 100) * gridSize * 0.5,
                                y: initialY + Math.sin(randomAngle) * ((t - lastChangeTime) / 100) * gridSize * 0.5,
                            };
                        } else {
                            // Reset after random movement
                            isRandomMove = false;
                            initialX = this.x;
                            initialY = this.y;
                        }
                    }
                    // Normal movement pattern
                    const normalizedTime = t * moveSpeed;
                    const pattern = Math.floor(normalizedTime / 4) % 8;
                    const progress = (normalizedTime % 4) - 2;
                    let x, y;
                    switch(pattern) {
                        case 0: // Move right
                            x = initialX + progress * gridSize;
                            y = initialY;
                            break;
                        case 1: // Move diagonal down-right
                            x = initialX + progress * gridSize;
                            y = initialY + progress * gridSize;
                            break;
                        case 2: // Move down
                            x = initialX + gridSize;
                            y = initialY + progress * gridSize;
                            break;
                        case 3: // Move diagonal down-left
                            x = initialX + (2 - progress) * gridSize;
                            y = initialY + progress * gridSize;
                            break;
                        case 4: // Move left
                            x = initialX + (2 - progress) * gridSize;
                            y = initialY + gridSize;
                            break;
                        case 5: // Move diagonal up-left
                            x = initialX + (2 - progress) * gridSize;
                            y = initialY + (2 - progress) * gridSize;
                            break;
                        case 6: // Move up
                            x = initialX;
                            y = initialY + (2 - progress) * gridSize;
                            break;
                        case 7: // Move diagonal up-right
                            x = initialX + progress * gridSize;
                            y = initialY + (2 - progress) * gridSize;
                            break;
                    }
                    return {
                        x: x * reverseDirection,
                        y: y + 50 + (Math.sin(t * 0.001 + randomOffset) * 20)
                    };
                };
            case 'darkling2':
                return t => {
                    // Add random direction change similar to darkling1
                    if (!this.lastChangeTime) this.lastChangeTime = t;
                    if (!this.isRandomMove && t - this.lastChangeTime > 3000 && Math.random() < 0.5) {
                        this.isRandomMove = true;
                        this.randomAngle = Math.random() * Math.PI * 2;
                        this.randomDuration = 500;
                        this.initialX = this.x;
                        this.initialY = this.y;
                    }
                    if (this.isRandomMove) {
                        if (t - this.lastChangeTime < this.randomDuration) {
                            return {
                                x: this.initialX + Math.cos(this.randomAngle) * ((t - this.lastChangeTime) / 100) * 80,
                                y: this.initialY + Math.sin(this.randomAngle) * ((t - this.lastChangeTime) / 100) * 80,
                            };
                        } else {
                            this.isRandomMove = false;
                            this.initialX = this.x;
                            this.initialY = this.y;
                        }
                    }
                    // Normal snake-like pattern
                    const rowHeight = 80;
                    const width = this.game.width * 0.45;
                    const normalizedTime = t * 0.01;
                    const row = Math.floor(normalizedTime / width) % 4;
                    const xProgress = (normalizedTime % width);
                    let x = (row % 2 === 0) ? xProgress : (width - xProgress);
                    let y = row * rowHeight + 80 + Math.sin(t * 0.01 + randomOffset) * 40;
                    return {
                        x: x * reverseDirection,
                        y: y + verticalOffset + (Math.sin(t * 0.002 + randomOffset) * 15)
                    };
                };
            case 'darklingboss1':
                return t => ({
                    x: Math.sin(t * 0.0016) * (this.game.width * 0.42),
                    y: 70 + Math.sin(t * 0.0011) * 45
                });

            case 'darklingboss2':
                return t => ({
                    x: Math.sin(t * 0.00125) * (this.game.width * 0.40),
                    y: 85 + Math.cos(t * 0.00095) * 40
                });
            
            case 'darklingboss3':
                // Slow spiral drift + occasional "blink" re-center offset.
                if (!this.lastTeleport || Date.now() - this.lastTeleport > 10000) {
                    this._teleportOffsetX = (Math.random() * 2 - 1) * (this.game.width * 0.18);
                    this._teleportOffsetY = (Math.random() * 2 - 1) * 35;
                    this.lastTeleport = Date.now();
                }
                return {
                    x: (this._teleportOffsetX || 0) + Math.sin(t * 0.00135) * (this.game.width * 0.33),
                    y: 85 + (this._teleportOffsetY || 0) + Math.sin(t * 0.00105) * 40
                };

            // Greensea bosses: explicit non-uniform jerky movement (avoid fast circular defaults).
            case 'darklingboss4':
                return makeJerkPattern({ baseY: 185, xRangeFrac: 0.30, yRange: 90, jumpMinMs: 650, jumpMaxMs: 1150, burstMinMs: 180, burstMaxMs: 300, wobbleX: 12, wobbleY: 8, wobbleSpeedX: 0.0029, wobbleSpeedY: 0.0021, diveChance: 0.22, diveAmpMin: 90, diveAmpMax: 170 });
            case 'darklingboss5':
                return makeJerkPattern({ baseY: 190, xRangeFrac: 0.28, yRange: 95, jumpMinMs: 780, jumpMaxMs: 1350, burstMinMs: 220, burstMaxMs: 360, wobbleX: 10, wobbleY: 8, wobbleSpeedX: 0.0026, wobbleSpeedY: 0.0020, diveChance: 0.20, diveAmpMin: 85, diveAmpMax: 155 });
            case 'darklingboss6':
                return makeJerkPattern({ baseY: 180, xRangeFrac: 0.31, yRange: 110, jumpMinMs: 520, jumpMaxMs: 980, burstMinMs: 160, burstMaxMs: 260, wobbleX: 13, wobbleY: 9, wobbleSpeedX: 0.0031, wobbleSpeedY: 0.0022, diveChance: 0.26, diveAmpMin: 105, diveAmpMax: 190 });
            case 'darklingboss7':
            case 'darklingboss8':
            case 'darklingboss9':
            case 'darklingboss10':
                return makeJerkPattern({ baseY: 195, xRangeFrac: 0.27, yRange: 105, jumpMinMs: 880, jumpMaxMs: 1650, burstMinMs: 240, burstMaxMs: 400, wobbleX: 9, wobbleY: 7, wobbleSpeedX: 0.0023, wobbleSpeedY: 0.0018, diveChance: 0.18, diveAmpMin: 75, diveAmpMax: 140 });
            case 'darkprincess1':
            case 'darkprincess2':
            case 'darkprincess3':
                // Princesses: more hovering, still erratic.
                return makeJerkPattern({ baseY: 210, xRangeFrac: 0.24, yRange: 85, jumpMinMs: 980, jumpMaxMs: 2000, burstMinMs: 260, burstMaxMs: 440, wobbleX: 8, wobbleY: 12, wobbleSpeedX: 0.0020, wobbleSpeedY: 0.0026, diveChance: 0.16, diveAmpMin: 70, diveAmpMax: 130 });
            default:
                if (this.type.startsWith('darkdragon')) {
                    // Medium-slow drift with gentle wave motion.
                    return t => ({
                        x: Math.sin(t * 0.0024 + randomOffset) * (this.game.width * 0.30),
                        y: 125 + Math.sin(t * 0.0017 + randomOffset) * 32
                    });
                }
                if (this.type.startsWith('darkempress')) {
                    // Lower bosses a bit and add sparse swoops.
                    const isGreensea = !!(this.game && typeof this.game.isGreenseaExpanse === 'function' && this.game.isGreenseaExpanse());
                    let nextSwoopAt = 0;
                    let swoopStart = 0;
                    let swoopDur = 0;
                    let swoopAmp = 0;
                    return t => {
                        if (!nextSwoopAt) nextSwoopAt = t + 3500 + Math.random() * 3500;
                        if (t >= nextSwoopAt && !swoopStart) {
                            swoopStart = t;
                            swoopDur = (isGreensea ? 1100 : 900) + Math.random() * (isGreensea ? 900 : 800);
                            swoopAmp = (isGreensea ? 110 : 55) + Math.random() * (isGreensea ? 95 : 55);
                            nextSwoopAt = t + 4500 + Math.random() * 5200;
                        }

                        let swoopY = 0;
                        if (swoopStart) {
                            const p = Math.max(0, Math.min(1, (t - swoopStart) / swoopDur));
                            // Smooth down-and-back-up.
                            swoopY = Math.sin(p * Math.PI) * swoopAmp;
                            if (p >= 1) swoopStart = 0;
                        }

                        const baseY = isGreensea ? 205 : 150;
                        const drift = isGreensea ? 48 : 36;
                        return {
                            x: Math.sin(t * 0.0037 + randomOffset) * (this.game.width * 0.30),
                            y: baseY + Math.sin(t * 0.0023 + randomOffset) * drift + swoopY
                        };
                    };
                }
                if (this.type.startsWith('darkmidboss')) {
                    // Bosses should move around a little less, but add occasional swoops.
                    const isGreensea = !!(this.game && typeof this.game.isGreenseaExpanse === 'function' && this.game.isGreenseaExpanse());
                    let nextSwoopAt = 0;
                    let swoopStart = 0;
                    let swoopDur = 0;
                    let swoopAmp = 0;
                    return t => {
                        if (!nextSwoopAt) nextSwoopAt = t + 3200 + Math.random() * 3200;
                        if (t >= nextSwoopAt && !swoopStart) {
                            swoopStart = t;
                            swoopDur = (isGreensea ? 1000 : 850) + Math.random() * (isGreensea ? 850 : 700);
                            swoopAmp = (isGreensea ? 95 : 45) + Math.random() * (isGreensea ? 80 : 45);
                            nextSwoopAt = t + 4300 + Math.random() * 4800;
                        }

                        let swoopY = 0;
                        if (swoopStart) {
                            const p = Math.max(0, Math.min(1, (t - swoopStart) / swoopDur));
                            swoopY = Math.sin(p * Math.PI) * swoopAmp;
                            if (p >= 1) swoopStart = 0;
                        }

                        const baseY = isGreensea ? 195 : 160;
                        const drift = isGreensea ? 38 : 26;
                        return {
                            x: Math.sin(t * 0.0030 + randomOffset) * (this.game.width * 0.22),
                            y: baseY + Math.sin(t * 0.0018 + randomOffset) * drift + swoopY
                        };
                    };
                }
                if (this.type.startsWith('darkforgedtitans')) {
                    return t => ({
                        x: Math.sin(t * 0.0021 + randomOffset) * (this.game.width * 0.28),
                        // Avoid abs() cusps (looks jittery); use smooth 0..1 wave.
                        y: 110 + ((Math.sin(t * 0.0012 + randomOffset) + 1) * 0.5) * 70
                    });
                }
                if (this.type.startsWith('darklingcolossus')) {
                    return t => ({
                        x: Math.sin(t * 0.0025 + randomOffset) * (this.game.width * 0.24),
                        y: 130 + Math.sin(t * 0.0017 + randomOffset) * 30
                    });
                }
                return ['darkling2', 'darkling5', 'darkling6'].includes(this.type) ?
                    t => ({ 
                        x: Math.sin(t * 0.015) * (this.game.width * 0.4), 
                        y: Math.cos(t * 0.01) * (this.game.height * 0.2) 
                    }) : t => ({ 
                        x: Math.sin(t * 0.01) * (this.game.width * 0.35), 
                        y: Math.sin(t * 0.008) * (this.game.height * 0.15) 
                    });
        }
    }

    getShotCooldown() {
        if (this.type === 'darkling4') return 3000;
        if (this.type.startsWith('darkdragon')) return Math.round(4200 * this.game.getEnemyShotCooldownMult(false));

        // Legacy bosses
        if (this.type === 'darklingboss1') return Math.round(3200 * this.game.getEnemyShotCooldownMult(true));
        if (this.type === 'darklingboss2') return this.health > 25 ? Infinity : Math.round(2600 * this.game.getEnemyShotCooldownMult(true));
        if (this.type === 'darklingboss3') return Math.round(2800 * this.game.getEnemyShotCooldownMult(true));

        // Greensea bosses (4+): ensure boss multipliers are used.
        if (this.type === 'darklingboss4') return Math.round(2600 * this.game.getEnemyShotCooldownMult(true));
        if (this.type === 'darklingboss5') return Math.round(2400 * this.game.getEnemyShotCooldownMult(true));
        if (this.type === 'darklingboss6') return Math.round(2200 * this.game.getEnemyShotCooldownMult(true));
        if (this.type === 'darklingboss7' || this.type === 'darklingboss8' || this.type === 'darklingboss9' || this.type === 'darklingboss10') {
            return Math.round(2400 * this.game.getEnemyShotCooldownMult(true));
        }
        if (this.type.startsWith('darkprincess')) return Math.round(2300 * this.game.getEnemyShotCooldownMult(true));

        // New bosses / midboss
        if (this.type.startsWith('darkempress')) return Math.round(2200 * this.game.getEnemyShotCooldownMult(true));
        if (this.type.startsWith('darkmidboss')) return Math.round(2400 * this.game.getEnemyShotCooldownMult(true));
        if (this.type.startsWith('darkforgedtitans')) return Math.round(2400 * this.game.getEnemyShotCooldownMult(true));
        if (this.type.startsWith('darklingcolossus')) return Math.round(2600 * this.game.getEnemyShotCooldownMult(true));

        const base = {
            'darkling2': 6000,  // Increased from 5000
            'darkling3': 5000,  // Increased from 4000
            'darkling5': 5000,  // Increased from 4000
            'darkling6': 4000,  // Increased from 3000
            'darkling7': 6000,  // Increased from 5000
            'darkling8': 6000,  // Increased from 5000
            'darkling10': 6000  // Increased from 5000
        }[this.type] || 6000;  // Default increased from 5000

        return Math.round(base * this.game.getEnemyShotCooldownMult(false));
    }

    getSpeed() {
        if (this.type === 'darklingboss3' && this.health <= 20) return 2;
        if (this.isBoss) {
            const roundsPast = Math.max(0, (this.game.round || 1) - 4);
            return 1.05 + Math.min(1.1, roundsPast * 0.06);
        }
        if (this.isMidBoss) return 1.1;
        return 1.5;
    }

    getPoints() {
        if (this.isBoss) return 250;
        if (this.isMidBoss) return 150;
        // Greensea mobs: fewer enemies, slightly higher per-kill score.
        if (this.game && typeof this.game.isGreenseaExpanse === 'function' && this.game.isGreenseaExpanse() && this.type && this.type.startsWith('darklingmob')) {
            return 18;
        }
        return 10;
    }

    update(time, dt = 16) {
        // Darkling Dragon: animate frames 1..12.
        if (this.type && this.type.startsWith('darkdragon')) {
            const frame = 1 + (Math.floor((time / 100)) % 12);
            this.type = `darkdragon${frame}`;
        }
        // Check if darkling1 or darkling9 should flee
        if ((this.type === 'darkling1' && time - this.spawnTime > 15000) ||
            (this.type === 'darkling9' && time - this.spawnTime > 10000)) {
            this.fadeAlpha -= 0.05;
            if (this.fadeAlpha <= 0) {
                return true;  // Remove this enemy
            }
        }

        // Boss 3+ teleport behavior: occasional hard reposition to keep fights dynamic.
        if ((this.isBoss || this.isMidBoss) && this.type !== 'darklingboss1' && this.type !== 'darklingboss2' && this.game && !this.inFormation) {
            const teleportMin = this.type.startsWith('darkempress') ? 5200
                : this.type.startsWith('darkmidboss') ? 6200
                : this.type === 'darklingboss3' ? 4800
                : 7000;
            const teleportMax = teleportMin + 3800;
            const nextAt = Number(this._nextTeleportAt) || 0;
            if (nextAt <= 0) {
                this._nextTeleportAt = time + teleportMin + Math.random() * (teleportMax - teleportMin);
            } else if (time >= nextAt && !this.isCharging && !this._specialAttack) {
                this._nextTeleportAt = time + teleportMin + Math.random() * (teleportMax - teleportMin);
                this.lastTeleport = time;

                // Telegraph the blink briefly (uses glow telegraph renderer).
                this._telegraphWindowStart = time;
                this._telegraphWindowMs = 260;
                this._telegraphPulses = 2;

                // New anchor/offset.
                const minX = this.game.width * 0.18;
                const maxX = this.game.width * 0.82;
                this.spawnCenterX = minX + Math.random() * (maxX - minX);
                this._teleportOffsetY = (Math.random() * 2 - 1) * 45;

                // Brief invulnerability while snapping.
                this._teleportInvulnUntil = time + 180;
                this.isInvulnerable = true;
            }
        }

        if (this.inFormation && this.game.enemyStyle === 'invaders') {
            const f = this.game.invaderFormation;
            const fx = this.baseX + (f ? f.dx : 0);
            const fy = this.baseY + (f ? f.dy : 0);

            this.x = Math.max(this.width / 2, Math.min(this.game.width - this.width / 2, fx));
            this.y = Math.min(this.game.height * 0.6, fy);
        } else {
            // Update position based on pattern
            const pos = this.pattern(time);
            const centerX = (typeof this.spawnCenterX === 'number') ? this.spawnCenterX : (this.game.width / 2);
            // Allow full vertical range with no top margin
            this.x = Math.max(this.width/2, Math.min(this.game.width - this.width/2,
                         centerX + pos.x));

            // Keep bosses fully on-screen: do not allow center-Y such that the sprite clips off the top.
            // Also keep them within the top 60% *while fully visible*.
            if (this.isBoss || this.isMidBoss) {
                const minY = this.height / 2;
                const maxY = (this.game.height * 0.6) - (this.height / 2);
                this.y = Math.max(minY, Math.min(maxY, pos.y));
            } else {
                this.y = Math.min(this.game.height * 0.6, pos.y);
            }
        }

        // Clear teleport invulnerability once the blink window has passed.
        if (this._teleportInvulnUntil && time >= this._teleportInvulnUntil && !this.isCharging && !this._specialAttack) {
            this._teleportInvulnUntil = 0;
            this.isInvulnerable = false;
        }

        // Handle shield cooldown for darkling4
        if (this.type === 'darkling4' && this.shieldCooldown > 0) {
            this.shieldCooldown = Math.max(0, this.shieldCooldown - (time - this.lastShot));
            this.shieldActive = false;
        }

        // Handle shooting
        const elapsed = time - this.lastShot;

        // After round 1, normal mobs have a chance to shoot a bit early (or effectively get an extra shot).
        if (!this.isBoss && !this.isMidBoss && (this.game.round || 1) > 1 && !this.isInvulnerable) {
            const windowStart = this.shotCooldown * 0.6;
            if (elapsed >= windowStart && elapsed < this.shotCooldown) {
                // Chance is per-frame; tuned to be "sometimes" across the early-window duration.
                const p = 0.07 * (Math.max(0, dt) / 1000);
                if (Math.random() < p) {
                    this.shoot();
                    this.lastShot = time;
                    return false;
                }
            }
        }

        let effectiveCooldown = this.shotCooldown;
        // Boss Rush rounds can spawn 2+ bosses; slow down their firing so it's fair.
        if ((this.isBoss || this.isMidBoss) && this.game && typeof this.game.isBossRushRound === 'function' && this.game.isBossRushRound()) {
            const bossCount = (this.game.enemies || []).filter(e => e && (e.isBoss || e.isMidBoss)).length;
            const mult = bossCount >= 4 ? 1.9 : bossCount === 3 ? 1.6 : bossCount === 2 ? 1.35 : 1;
            effectiveCooldown = Math.round(effectiveCooldown * mult);
        }

        // Dark Empress form 3+: beam special (telegraphed double pulse)
        if (this.type.startsWith('darkempress') && (Number(this.empressForm) || 1) >= 3) {
            const beamReady = (time - (this._lastBeamAt || 0)) >= 12000;
            const notBusy = !this._specialAttack && (time >= (this._beamActiveUntil || 0));

            if (beamReady && notBusy && (time - (this.spawnTime || 0)) > 2500) {
                this._specialAttack = 'beam';
                this._specialTelegraphStartAt = time;
                this._specialTelegraphMs = 700;
                this._specialTelegraphPulses = 2;
                this.isCharging = true;

                // Drive the normal telegraph overlay renderer.
                this._telegraphWindowStart = this._specialTelegraphStartAt;
                this._telegraphWindowMs = this._specialTelegraphMs;
                this._telegraphPulses = 2;
            }

            if (this._specialAttack === 'beam') {
                const tSince = time - (this._specialTelegraphStartAt || time);
                if (tSince >= (this._specialTelegraphMs || 700)) {
                    this.isCharging = false;
                    this._specialAttack = null;
                    this._lastBeamAt = time;
                    this._beamActiveUntil = time + 3000;

                    // Spawn the downward beam.
                    const dmg = this.getProjectileDamage() * 0.55;
                    const beam = new EnemyProjectile(this.game, this.x, this.y, 0, 0, 'darklingshot7', dmg);
                    beam.isBeam = true;
                    beam.pierce = true;
                    beam.anchorToEnemy = true;
                    beam.enemyRef = this;
                    // Make the beam sweep/track.
                    beam.anchorOffsetX = 0;
                    beam.anchorOffsetY = 0;
                    beam.beamMaxOffset = Math.round(this.game.width * 0.24);
                    beam.beamTrackStrength = 0.06;
                    beam.beamSwayAmp = Math.max(22, Math.round(this.width * 0.14));
                    beam.beamSwayMs = 260;
                    beam.ttlMs = 3000;
                    beam.createdAt = time;
                    beam.width = Math.max(62, Math.round(this.width * 0.42));
                    beam.height = Math.round(this.game.height * 0.62);
                    beam.hitIntervalMs = 320;
                    this.game.enemyProjectiles.push(beam);

                    // While beam is active, lob a single 3-shot volley.
                    const base = 90;
                    const bossShotSprites = ['darklingshot1', 'darklingshot2', 'darklingshot3', 'darklingshot4', 'darklingshot5', 'darklingshot6', 'darklingshot7'];
                    const spriteKey = bossShotSprites[Math.floor(Math.random() * bossShotSprites.length)];
                    const mult = this.game.getEnemyProjectileSpeedMult(true);
                    const speed = 6.6;
                    const baseDamage = this.getProjectileDamage();
                    for (const angle of [base - 15, base, base + 15]) {
                        const rad = angle * Math.PI / 180;
                        const dx = Math.cos(rad) * speed * mult;
                        const dy = Math.sin(rad) * speed * mult;
                        this.game.enemyProjectiles.push(new EnemyProjectile(this.game, this.x, this.y, dx, dy, spriteKey, baseDamage));
                    }

                    // Reset normal shooting cadence.
                    this.lastShot = time;
                }
            }
        }

        // Boss telegraph: a short red flash before firing.
        if ((this.isBoss || this.isMidBoss) && !this.isInvulnerable) {
            const telegraphMs = 520;
            if (elapsed >= (effectiveCooldown - telegraphMs) && elapsed < effectiveCooldown) {
                const start = time - (elapsed - (effectiveCooldown - telegraphMs));
                this._telegraphWindowStart = start;
                this._telegraphWindowMs = telegraphMs;
                // Early bosses pulse twice; Empress beam telegraph is always double.
                const early = (Number(this.bossEncounterIndex) || 0) <= 1;
                const empressSpecial = (this._specialAttack === 'beam') || ((this.type.startsWith('darkempress') && (Number(this.empressForm) || 1) >= 3) && (time - (this._specialTelegraphStartAt || 0)) < (this._specialTelegraphMs || 0));
                this._telegraphPulses = empressSpecial ? 2 : (early ? 2 : 1);
            }
        }

        if (elapsed >= effectiveCooldown && !this.isInvulnerable) {
            // During special telegraph, delay normal shots.
            if (this._specialAttack) return false;
            this.shoot();
            this.lastShot = time;
            this._telegraphWindowStart = 0;
            this._telegraphWindowMs = 0;
        }
        return false;  // Keep this enemy
    }

    draw() {
        const sprite = this.game.assets.images[this.type];
        if (sprite && sprite.complete) {
            this.game.ctx.globalAlpha = this.fadeAlpha;
            if (this.shieldActive) {
                this.game.ctx.shadowColor = 'blue';
                this.game.ctx.shadowBlur = 10;
            }
            if (this.type === 'darklingboss3' && this.health <= 20) {
                this.game.ctx.shadowColor = 'red';
                this.game.ctx.shadowBlur = 15;
            }
            const drawX = Math.round(this.x - this.width/2);
            const drawY = Math.round(this.y - this.height/2);
            this.game.ctx.drawImage(sprite, drawX, drawY, this.width, this.height);

            // Telegraph overlay (red pulses) for bosses.
            const now = Date.now();
            const start = Number(this._telegraphWindowStart) || 0;
            const ms = Number(this._telegraphWindowMs) || 0;
            if (start > 0 && ms > 0 && now >= start && now <= (start + ms) && (this.isBoss || this.isMidBoss)) {
                const p = Math.max(0, Math.min(1, (now - start) / ms));
                const pulses = Math.max(1, Number(this._telegraphPulses) || 1);
                const s = Math.sin(p * Math.PI * pulses);
                const a = Math.max(0, Math.min(0.55, 0.55 * (s * s)));
                this.game.ctx.save();
                this.game.ctx.globalAlpha = a;
                // Glow-only telegraph (no square flash).
                const cx = this.x;
                const cy = this.y;
                const r = Math.max(this.width, this.height) * 0.72;
                const grad = this.game.ctx.createRadialGradient(cx, cy, r * 0.18, cx, cy, r);
                grad.addColorStop(0, 'rgba(255, 80, 80, 0.95)');
                grad.addColorStop(0.45, 'rgba(255, 60, 60, 0.55)');
                grad.addColorStop(1, 'rgba(255, 40, 40, 0)');
                this.game.ctx.shadowColor = 'rgba(255, 70, 70, 1)';
                this.game.ctx.shadowBlur = 26;
                this.game.ctx.fillStyle = grad;
                this.game.ctx.beginPath();
                this.game.ctx.arc(cx, cy, r, 0, Math.PI * 2);
                this.game.ctx.fill();
                this.game.ctx.restore();
            }

            // Boss / midboss HP bar
            if ((this.isBoss || this.isMidBoss) && this.maxHealth > 0) {
                const ratio = Math.max(0, Math.min(1, this.health / this.maxHealth));
                const barW = Math.min(240, Math.max(120, this.width));
                const barH = 10;
                const barX = Math.round(this.x - barW / 2);
                const barY = Math.round(drawY - 18);
                this.game.ctx.save();
                this.game.ctx.globalAlpha = 1;
                this.game.ctx.fillStyle = 'rgba(0,0,0,0.6)';
                this.game.ctx.fillRect(barX, barY, barW, barH);
                this.game.ctx.fillStyle = this.isMidBoss ? '#c9a3ff' : '#ff4d4d';
                this.game.ctx.fillRect(barX, barY, Math.round(barW * ratio), barH);
                this.game.ctx.strokeStyle = 'rgba(255,255,255,0.85)';
                this.game.ctx.lineWidth = 2;
                this.game.ctx.strokeRect(barX, barY, barW, barH);
                this.game.ctx.restore();
            }

            this.game.ctx.shadowBlur = 0;
            this.game.ctx.globalAlpha = 1;
        } else {
            console.error(`Failed to load sprite for enemy type: ${this.type}`);
            this.game.ctx.fillStyle = 'red';
            this.game.ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        }
    }

    shoot() {
        if (this.type === 'darkling1' || this.type === 'darkling9') return;

        const baseDamage = this.getProjectileDamage();
        const createProjectile = (angle, speed = 5, size = 1, spriteKey = null) => {
            const rad = angle * Math.PI / 180;
            const mult = this.game.getEnemyProjectileSpeedMult(this.isBoss || this.isMidBoss);
            const dx = Math.cos(rad) * speed * mult;
            const dy = Math.sin(rad) * speed * mult;
            const proj = new EnemyProjectile(this.game, this.x, this.y, dx, dy, spriteKey, baseDamage);
            proj.width *= size;
            proj.height *= size;
            return proj;
        };

        const bossShotSprites = ['darklingshot1', 'darklingshot2', 'darklingshot3', 'darklingshot4', 'darklingshot5', 'darklingshot6', 'darklingshot7'];
        const pickBossShotSprite = () => bossShotSprites[Math.floor(Math.random() * bossShotSprites.length)];

        // Play boss shooting sound
        if (this.isBoss || this.isMidBoss) {
            const spellSounds = this.game.assets.sounds.spellfire;
            if (Array.isArray(spellSounds) && spellSounds.length) {
                const randomSound = spellSounds[Math.floor(Math.random() * spellSounds.length)];
                if (randomSound) {
                    randomSound.currentTime = 0;
                    randomSound.play().catch(() => {});
                }
            }
        }
        // Match sprite names exactly with loaded assets
        switch(this.type) {
            case 'darkling4':
                if (!this.shieldActive && this.shieldCooldown === 0) {
                    this.shieldActive = true;
                    this.isInvulnerable = true;
                    setTimeout(() => {
                        for (let i = 0; i < 10; i++) {
                            setTimeout(() => {
                                const angle = 90 + (Math.random() * 20 - 10);
                                this.game.enemyProjectiles.push(createProjectile(angle));
                            }, i * 100);
                        }
                        this.shieldActive = false;
                        this.isInvulnerable = false;
                        this.shieldCooldown = 20000;
                    }, 1000);
                } 
                break;
            case 'darkling5':
            case 'darkling6':
                this.game.enemyProjectiles.push(createProjectile(45));
                this.game.enemyProjectiles.push(createProjectile(135));
                break;
            case 'darkling7':
                for (let angle = 75; angle <= 105; angle += 15) {
                    this.game.enemyProjectiles.push(createProjectile(angle));
                }
                break;
            case 'darkling8':
                if (Math.random() < 0.5) {
                    this.game.enemyProjectiles.push(createProjectile(90, 6.25));
                }
                break;
            case 'darkling10':
                const patterns = [
                    () => this.game.enemyProjectiles.push(createProjectile(90)),
                    () => {
                        this.game.enemyProjectiles.push(createProjectile(45));
                        this.game.enemyProjectiles.push(createProjectile(135));
                    },
                    () => {
                        for (let angle = 75; angle <= 105; angle += 15) {
                            this.game.enemyProjectiles.push(createProjectile(angle));
                        }
                    },
                ];
                patterns[Math.floor(Math.random() * patterns.length)]();
                break;
            case 'darklingboss1':
                this.isCharging = true;
                setTimeout(() => {
                    // Boss 1: tighter 3-shot spread to increase threat.
                    for (const angle of [82, 90, 98]) {
                        this.game.enemyProjectiles.push(createProjectile(angle, 7.6, 1.25, pickBossShotSprite()));
                    }
                    this.isCharging = false;
                }, 500);
                break;
            case 'darklingboss2':
                if (this.health <= 25) {
                    this.isCharging = true;
                    setTimeout(() => {
                        // Boss 2: denser fan volley when enraged.
                        for (let angle = 66; angle <= 114; angle += 4) {
                            this.game.enemyProjectiles.push(createProjectile(angle, 6.2, 1.25, pickBossShotSprite()));
                        }
                        this.speed = 4;
                        this.isCharging = false;
                    }, 1000);
                }
                break;
            case 'darklingboss3':
                this.isCharging = true;
                this.isInvulnerable = true;
                setTimeout(() => {
                    if (Math.random() < 0.5) {
                        for (let i = 0; i < 20; i++) {
                            this.game.enemyProjectiles.push(createProjectile(90, 6.25, 1.15, pickBossShotSprite()));
                        }
                    } else {
                        for (let i = 0; i < 3; i++) {
                            for (let angle = 45; angle <= 135; angle += 15) {
                                this.game.enemyProjectiles.push(createProjectile(angle, 5.5, 1.1, pickBossShotSprite()));
                            }
                        }
                    }
                    this.isCharging = false;
                    this.isInvulnerable = false;
                }, 1000);
                break;

            // Greensea bosses (4+): explicitly define firing so they don't silently fall back to a non-boss cadence.
            case 'darklingboss4': {
                const patterns = [
                    // Tight 3-shot
                    () => {
                        for (const angle of [84, 90, 96]) {
                            this.game.enemyProjectiles.push(createProjectile(angle, 6.7, 1.15, pickBossShotSprite()));
                        }
                    },
                    // 5-shot shallow fan
                    () => {
                        for (const angle of [78, 84, 90, 96, 102]) {
                            this.game.enemyProjectiles.push(createProjectile(angle, 6.4, 1.10, pickBossShotSprite()));
                        }
                    },
                    // Double-tap: 3-shot then a single follow-up
                    () => {
                        for (const angle of [84, 90, 96]) {
                            this.game.enemyProjectiles.push(createProjectile(angle, 6.6, 1.12, pickBossShotSprite()));
                        }
                        if (Math.random() < 0.65) {
                            this.game.enemyProjectiles.push(createProjectile(90 + (Math.random() * 10 - 5), 7.2, 1.08, pickBossShotSprite()));
                        }
                    }
                ];
                patterns[Math.floor(Math.random() * patterns.length)]();
                break;
            }
            case 'darklingboss5': {
                const patterns = [
                    // Wider 5-shot fan
                    () => {
                        for (let angle = 70; angle <= 110; angle += 10) {
                            this.game.enemyProjectiles.push(createProjectile(angle, 6.2, 1.18, pickBossShotSprite()));
                        }
                    },
                    // Mixed 3-shot + diagonals
                    () => {
                        for (const angle of [82, 90, 98]) {
                            this.game.enemyProjectiles.push(createProjectile(angle, 6.6, 1.12, pickBossShotSprite()));
                        }
                        if (Math.random() < 0.45) {
                            this.game.enemyProjectiles.push(createProjectile(75, 6.0, 1.05, pickBossShotSprite()));
                            this.game.enemyProjectiles.push(createProjectile(105, 6.0, 1.05, pickBossShotSprite()));
                        }
                    }
                ];
                patterns[Math.floor(Math.random() * patterns.length)]();
                break;
            }
            case 'darklingboss6': {
                // Boss 6: meant to feel fast, but keep projectile speeds sane.
                const patterns = [
                    () => {
                        for (const angle of [86, 90, 94]) {
                            this.game.enemyProjectiles.push(createProjectile(angle, 6.8, 1.10, pickBossShotSprite()));
                        }
                    },
                    () => {
                        // 4-shot staggered spread
                        for (const angle of [80, 88, 92, 100]) {
                            this.game.enemyProjectiles.push(createProjectile(angle, 6.4, 1.08, pickBossShotSprite()));
                        }
                    },
                    () => {
                        // Snappy straight + slight jitter follow-up
                        this.game.enemyProjectiles.push(createProjectile(90, 7.1, 1.12, pickBossShotSprite()));
                        if (Math.random() < 0.75) {
                            this.game.enemyProjectiles.push(createProjectile(90 + (Math.random() * 14 - 7), 6.5, 1.05, pickBossShotSprite()));
                        }
                    }
                ];
                patterns[Math.floor(Math.random() * patterns.length)]();
                break;
            }
            case 'darklingboss7':
            case 'darklingboss8':
            case 'darklingboss9':
            case 'darklingboss10': {
                const base = 90;
                for (const angle of [base - 14, base, base + 14]) {
                    this.game.enemyProjectiles.push(createProjectile(angle, 6.6, 1.18, pickBossShotSprite()));
                }
                if (Math.random() < 0.35) {
                    this.game.enemyProjectiles.push(createProjectile(75, 6.1, 1.05, pickBossShotSprite()));
                    this.game.enemyProjectiles.push(createProjectile(105, 6.1, 1.05, pickBossShotSprite()));
                }
                break;
            }
            case 'darkprincess1':
            case 'darkprincess2':
            case 'darkprincess3': {
                const patterns = [
                    () => {
                        for (let angle = 72; angle <= 108; angle += 9) {
                            this.game.enemyProjectiles.push(createProjectile(angle, 6.0, 1.15, pickBossShotSprite()));
                        }
                    },
                    () => {
                        for (const angle of [82, 90, 98]) {
                            this.game.enemyProjectiles.push(createProjectile(angle, 6.7, 1.20, pickBossShotSprite()));
                        }
                        if (Math.random() < 0.55) {
                            this.game.enemyProjectiles.push(createProjectile(90, 6.4, 1.10, pickBossShotSprite()));
                        }
                    }
                ];
                patterns[Math.floor(Math.random() * patterns.length)]();
                break;
            }
            default:
                if (this.type.startsWith('darkdragon')) {
                    // Faster vertical, slightly larger projectiles.
                    const spriteKey = 'darklingshot6';
                    this.game.enemyProjectiles.push(createProjectile(90, 7.6, 1.18, spriteKey));
                    if (Math.random() < 0.28) {
                        this.game.enemyProjectiles.push(createProjectile(90, 7.2, 1.10, spriteKey));
                    }
                    break;
                }
                if (this.type.startsWith('darkmidboss')) {
                    const base = 90;
                    for (const angle of [base - 15, base, base + 15]) {
                        this.game.enemyProjectiles.push(createProjectile(angle, 6.6, 1.2, pickBossShotSprite()));
                    }
                    if (Math.random() < 0.35) {
                        this.game.enemyProjectiles.push(createProjectile(75, 6.0, 1.05, pickBossShotSprite()));
                        this.game.enemyProjectiles.push(createProjectile(105, 6.0, 1.05, pickBossShotSprite()));
                    }
                    break;
                }
                if (this.type.startsWith('darkempress')) {
                    const base = 90;
                    for (const angle of [base - 15, base, base + 15]) {
                        this.game.enemyProjectiles.push(createProjectile(angle, 6.8, 1.2, pickBossShotSprite()));
                    }
                    if (Math.random() < 0.45) {
                        this.game.enemyProjectiles.push(createProjectile(60, 6.0, 1.05, pickBossShotSprite()));
                        this.game.enemyProjectiles.push(createProjectile(120, 6.0, 1.05, pickBossShotSprite()));
                    }
                    break;
                }
                if (this.type.startsWith('darkforgedtitans')) {
                    this.game.enemyProjectiles.push(createProjectile(90, 6.4, 1.35, pickBossShotSprite()));
                    if (Math.random() < 0.5) {
                        this.game.enemyProjectiles.push(createProjectile(70, 6.0, 1.15, pickBossShotSprite()));
                        this.game.enemyProjectiles.push(createProjectile(110, 6.0, 1.15, pickBossShotSprite()));
                    }
                    break;
                }
                if (this.type.startsWith('darklingcolossus')) {
                    for (let angle = 60; angle <= 120; angle += 15) {
                        this.game.enemyProjectiles.push(createProjectile(angle, 5.9, 1.25, pickBossShotSprite()));
                    }
                    break;
                }
                this.game.enemyProjectiles.push(createProjectile(90));
        }

        // After round 1, normal mobs can occasionally "double-tap" with an extra shot.
        if (!this.isBoss && !this.isMidBoss && (this.game.round || 1) > 1) {
            const excluded = ['darkling4', 'darkling5', 'darkling6', 'darkling7', 'darkling8', 'darkling10'];
            if (!excluded.includes(this.type) && Math.random() < 0.12) {
                const angle = 90 + (Math.random() * 18 - 9);
                this.game.enemyProjectiles.push(createProjectile(angle, 5.35));
            }
        }
    }

    getProjectileDamage() {
        // Default: 1 heart per hit.
        if (this.type.startsWith('darkempress')) {
            // Empress is meant to feel more threatening; forms scale via empressDamageMult.
            return 2 * (Number(this.empressDamageMult) || 1);
        }
        return 1;
    }

    fireEmpressSpawnVolley() {
        if (!this.game || !this.game.enemyProjectiles) return;
        if (!this.type.startsWith('darkempress')) return;

        const baseDamage = this.getProjectileDamage();
        const bossShotSprites = ['darklingshot1', 'darklingshot2', 'darklingshot3', 'darklingshot4', 'darklingshot5', 'darklingshot6', 'darklingshot7'];
        const spriteKey = bossShotSprites[Math.floor(Math.random() * bossShotSprites.length)];
        const mult = this.game.getEnemyProjectileSpeedMult(true);
        const speed = 6.9;

        for (const angle of [75, 90, 105]) {
            const rad = angle * Math.PI / 180;
            const dx = Math.cos(rad) * speed * mult;
            const dy = Math.sin(rad) * speed * mult;
            const proj = new EnemyProjectile(this.game, this.x, this.y, dx, dy, spriteKey, baseDamage);
            proj.width *= 1.2;
            proj.height *= 1.2;
            this.game.enemyProjectiles.push(proj);
        }
    }

    takeDamage(amount = 1) {
        const scaled = (Number(amount) || 1) * (this.damageTakenMultiplier || 1);
        this.health -= scaled;
        
        // If defeated, potentially drop a powerup
        if (this.health <= 0) {
            // Dark Empress death animation: shatter into pieces that float upward.
            if (this.type && this.type.startsWith('darkempress') && this.game) {
                if (Array.isArray(this.game.particles)) {
                    const shardCount = 26;
                    for (let i = 0; i < shardCount; i++) {
                        const ox = (Math.random() - 0.5) * (this.width * 0.7);
                        const oy = (Math.random() - 0.2) * (this.height * 0.55);
                        this.game.particles.push(new ShatterShard(
                            this.game,
                            this.x + ox,
                            this.y + oy,
                            {
                                vx: (Math.random() - 0.5) * 2.6,
                                vy: -2.2 - Math.random() * 3.0,
                                size: 6 + Math.random() * 12,
                                lifeMs: 950 + Math.random() * 650
                            }
                        ));
                    }
                }

                if (typeof this.game.onDarkEmpressDefeated === 'function') {
                    try { this.game.onDarkEmpressDefeated(this); } catch (_) {}
                }
            }

            // Dark Empress: rare Dreamvapor drop (Zone Patrol crafting unlock).
            if (this.type && this.type.startsWith('darkempress') && this.game && typeof this.game.queueEndRewardItem === 'function') {
                if (Math.random() < 0.025) {
                    this.game.queueEndRewardItem('dreamvapor', 1);
                }
            }

            // Bosses and midbosses drop treasure (score loot). Random mobs can rarely drop 1 treasure.
            if (this.game && typeof this.game.spawnTreasureDrop === 'function') {
                if (this.isBoss || this.isMidBoss) {
                    const r = Math.max(1, Number(this.game.round) || 1);
                    const extra = Math.min(6, Math.floor((r - 1) / 10));
                    this.game.spawnTreasureDrop(this.x, this.y, { countMin: 3 + extra, countMax: 6 + extra });
                } else if (this.type && this.type.startsWith('darkdragon') && Math.random() < 0.06) {
                    this.game.spawnTreasureDrop(this.x, this.y, { countMin: 1, countMax: 1 });
                } else if (Math.random() < 0.02) {
                    this.game.spawnTreasureDrop(this.x, this.y, { countMin: 1, countMax: 1 });
                }
            }

            // Legendary ingredient: very rare drop from Empress and Colossus style bosses.
            if (this.game && typeof this.game.queueEndRewardItem === 'function') {
                const isLegendaryBoss = this.type.startsWith('darkempress') || this.type.startsWith('darklingcolossus');
                if ((this.isBoss || this.isMidBoss) && isLegendaryBoss && Math.random() < 0.001) {
                    this.game.queueEndRewardItem('night-sky', 1);
                }

                // Random mobs: small chance to drop 1 common Lissome Plains item.
                if (!this.isBoss && !this.isMidBoss && (this.game.round || 1) > 1 && Math.random() < 0.018) {
                    const list = (typeof this.game.getZoneCommonItemIds === 'function') ? this.game.getZoneCommonItemIds() : [];
                    if (Array.isArray(list) && list.length) {
                        // Semi-rare sugar drop: bias the common pool.
                        let id = null;
                        const weights = (typeof this.game.getZoneCommonDropWeights === 'function')
                            ? this.game.getZoneCommonDropWeights()
                            : list.map((x) => ({ id: x, w: x === 'white-sugar' ? 0.35 : 1 }));
                        const valid = (weights || []).filter(w => w && w.id && (Number(w.w) || 0) > 0);
                        const total = valid.reduce((s, w) => s + w.w, 0);
                        if (total > 0) {
                            let r = Math.random() * total;
                            for (const w of valid) {
                                r -= w.w;
                                if (r <= 0) { id = w.id; break; }
                            }
                            if (!id && valid.length) id = valid[valid.length - 1].id;
                        }
                        if (id) this.game.queueEndRewardItem(id, 1);
                    }
                }
            }

            // Boss Rush mode: bosses explode into potions (favor green).
            if (this.game && this.game.runMode === 'bossRush' && (this.isBoss || this.isMidBoss)) {
                if (typeof this.game.spawnBossPotionExplosion === 'function') {
                    this.game.spawnBossPotionExplosion(this.x, this.y);
                }
            }

            // Boss Rush runMode already rewards via the boss explosion; skip the normal random drop
            // so bosses don't flood the screen with extra potions.
            if (!(this.game && this.game.runMode === 'bossRush' && (this.isBoss || this.isMidBoss))) {
                // Random chance to drop a powerup (higher for bosses)
                let dropChance = (this.isBoss || this.isMidBoss) ? 0.5 : 0.1;
                // Greensea: fewer enemies overall; slightly higher potion rate.
                if (!(this.isBoss || this.isMidBoss) && this.game && typeof this.game.isGreenseaExpanse === 'function' && this.game.isGreenseaExpanse()) {
                    dropChance = 0.18;
                }

                if (Math.random() < dropChance) {
                    // Weight green (power) potions ~10% more often than the others,
                    // except around rounds 6–7 where green should be normalized to match.
                    const r = Math.max(1, Number(this.game && this.game.round) || 1);
                    const powerW = (r >= 6 && r <= 7) ? 1.0 : 1.1;
                    const weights = (this.isBoss || this.isMidBoss)
                        ? [
                            { type: 'health', w: 1 },
                            { type: 'power', w: powerW },
                            // Blue (shield) potions appear 10% less often.
                            { type: 'shield', w: 0.9 },
                            // Rare upgrades
                            { type: 'projectile', w: 0.28 },
                            // Usually boss-awarded
                            { type: 'mystic', w: 0.40 }
                        ]
                        : [
                            { type: 'health', w: 1 },
                            { type: 'power', w: powerW },
                            { type: 'shield', w: 0.9 },
                            // Very rare from normal mobs
                            { type: 'projectile', w: 0.08 }
                        ];
                    const randomType = (this.game && typeof this.game.pickWeightedPowerupType === 'function')
                        ? this.game.pickWeightedPowerupType(weights)
                        : 'health';
                    if (randomType) {
                        const greenseaDouble = (!(this.isBoss || this.isMidBoss) && this.game && typeof this.game.isGreenseaExpanse === 'function' && this.game.isGreenseaExpanse() && Math.random() < 0.22);
                        const count = greenseaDouble ? 2 : 1;
                        for (let i = 0; i < count; i++) {
                            const ox = (i === 0) ? 0 : ((Math.random() - 0.5) * 80);
                            const oy = (i === 0) ? 0 : ((Math.random() - 0.5) * 30);
                            this.game.powerups.push(new Powerup(this.game, this.x + ox, this.y + oy, randomType));
                        }
                    }
                }
            }

            // Extra-life drops (rounds 4+). Uses blended potion sprites.
            if ((this.game.round || 1) >= 4 && typeof this.game.lives === 'number' && this.game.lives < (this.game.maxLives || 3)) {
                // Extra lives should spawn less often and be capped to 1 on screen.
                const lifeChance = (this.isBoss || this.isMidBoss) ? 0.05 : 0.0075;
                const canSpawnLife = this.game && typeof this.game.canSpawnPowerupType === 'function'
                    ? this.game.canSpawnPowerupType('life')
                    : true;
                if (canSpawnLife && Math.random() < lifeChance) {
                    this.game.powerups.push(new Powerup(this.game, this.x, this.y, 'life'));
                }
            }
            
            // Add points to score
            if (this.points) {
                this.game.score += this.points;
            }
            
            return true; // Enemy was defeated
        }
        
        return false; // Enemy survived
    }
}

class EnemyProjectile extends Projectile {
    constructor(game, x, y, dx, dy, spriteKey = null, damage = 1) {
        super(game, x, y, x + dx * 100, y + dy * 100);
        this.dx = dx * 0.7;
        this.dy = dy * 0.7;
        this.width = 38;
        this.height = 38;
        this.sprite = spriteKey || 'shot1';  // Enemy projectiles default to shot1 sprite

        // Enemy projectile damage is independent of player damage.
        this.damage = Number(damage) || 1;
    }
}

class Loot {
    constructor(game, x, y, spriteKey, value = 100) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 42;
        this.height = 42;
        this.spriteKey = spriteKey;
        this.value = Math.max(1, Number(value) || 100);

        // Falls a bit faster than potions, but drifts less (straighter).
        this.fallSpeed = 2.25;
        this.driftAmount = 0.55;
        this.bobAmount = 2.5;
        this.bobSpeed = 0.0035;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.angle = Math.random() * Math.PI * 2;
    }

    update() {
        // Kiki special: temporary magnet pickup effect.
        const magnetUntil = this.game ? (Number(this.game._dropMagnetUntil) || 0) : 0;
        if (magnetUntil && Date.now() < magnetUntil && this.game && this.game.player) {
            const px = this.game.player.x + this.game.player.width / 2;
            const py = this.game.player.y + this.game.player.height / 2;
            const dx = px - this.x;
            const dy = py - this.y;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const pull = Math.min(10, 2.8 + dist * 0.012);
            this.x += (dx / dist) * pull;
            this.y += (dy / dist) * pull;
        }

        this.y += this.fallSpeed;
        // Small lateral drift; much straighter than potions.
        this.x += Math.cos(this.angle) * this.driftAmount;
        this.x += Math.sin(Date.now() * 0.004 + this.bobOffset) * 0.12;

        // Keep drops pinned inside the visible playfield.
        const pad = Math.max(18, this.width / 2);
        this.x = Math.max(pad, Math.min(this.game.width - pad, this.x));

        const bobY = Math.sin(Date.now() * this.bobSpeed + this.bobOffset) * this.bobAmount;
        this.y += bobY * 0.08;

        // Remove if offscreen
        if (this.y > this.game.height + 60) return true;
        return false;
    }

    draw() {
        const sprite = this.game.assets.images[this.spriteKey];
        if (!sprite) return;

        const bob = Math.sin(Date.now() * 0.004 + this.bobOffset) * 2;
        const drawX = Math.round(this.x - this.width / 2);
        const drawY = Math.round(this.y - this.height / 2 + bob);

        this.game.ctx.save();
        this.game.ctx.shadowColor = 'rgba(255, 240, 180, 0.35)';
        this.game.ctx.shadowBlur = 10;
        this.game.ctx.drawImage(sprite, drawX, drawY, this.width, this.height);
        this.game.ctx.restore();
    }

    collect() {
        if (this.game && Array.isArray(this.game.particles)) {
            this.game.particles.push(new Particle(this.game, this.x, this.y, 'defeat'));
        }
    }
}

class ShatterShard {
    constructor(game, x, y, { vx = 0, vy = -2, size = 10, lifeMs = 1200 } = {}) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.lifeMs = lifeMs;
        this.startedAt = Date.now();
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.25;
        this.alpha = 1;
    }

    update() {
        const now = Date.now();
        const age = now - (this.startedAt || now);
        const t = this.lifeMs > 0 ? Math.max(0, Math.min(1, age / this.lifeMs)) : 1;

        this.x += this.vx;
        this.y += this.vy;
        this.vy -= 0.015; // drift upward
        this.rot += this.rotSpeed;
        this.alpha = 1 - t;

        // Remove once faded or far offscreen.
        if (this.alpha <= 0.01) return true;
        if (this.y < -120) return true;
        return false;
    }

    draw() {
        if (!this.game || !this.game.ctx) return;
        const ctx = this.game.ctx;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);

        // Purple glass + faint gold edge
        ctx.fillStyle = 'rgba(160, 70, 255, 0.75)';
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
        ctx.lineWidth = 2;
        const s = this.size;
        ctx.beginPath();
        ctx.rect(-s / 2, -s / 2, s, s);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

class Particle {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.type = type;
        this.alpha = 1;
        this.scale = type === 'defeat' ? 2 : 1;
        this.fadeSpeed = type === 'defeat' ? 0.02 : 0.1;
    }

    update() {
        this.alpha -= this.fadeSpeed;
        return this.alpha <= 0;
    }

    draw() {
        // Get the correct impact sprite based on whether this is a hit or defeat particle
        // Also use character-specific impact sprites
        const character = this.game.selectedCharacter || 'dere';
        let spriteKey;
        
        if (this.type === 'hit') {
            // For hit particles, use character-specific impact sprites
            spriteKey = character === 'aliza' ? 'alizaShotImpact1' : 'alizaShotImpact2';
        } else if (this.type === 'defeat') {
            // For defeat particles, use character-specific larger impact sprites           
            spriteKey = character === 'aliza' ? 'alizaShotImpact2' : 'shotImpact2';
        }
        
        const sprite = this.game.assets.images[spriteKey];
        
        if (sprite) {
            this.game.ctx.save();
            this.game.ctx.globalAlpha = this.alpha;
            
            // Use a larger size for defeat particles
            const size = this.type === 'defeat' ? 80 * this.scale : 40 * this.scale;
            
            this.game.ctx.drawImage(
                sprite,
                this.x - size/2,
                this.y - size/2,
                size,
                size
            );
            
            this.game.ctx.restore();
        } else {
            // Fallback if sprite not found
            this.game.ctx.save();
            this.game.ctx.globalAlpha = this.alpha;
            this.game.ctx.fillStyle = this.type === 'defeat' ? 'orange' : 'yellow';
            const size = this.type === 'defeat' ? 40 : 20;
            this.game.ctx.beginPath();
            this.game.ctx.arc(this.x, this.y, size * this.scale / 2, 0, Math.PI * 2);
            this.game.ctx.fill();
            this.game.ctx.restore();
        }
    }
}

class Powerup {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.type = type; // 'health', 'power', 'shield', 'life', 'projectile', or 'mystic'
        this.speed = 2;
        this.angle = Math.random() * Math.PI * 2; // Random drift angle
        this.driftAmount = 1.5;
        this.fallSpeed = 1.5;
        this.bobAmount = 5;
        this.bobSpeed = 0.05;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.startTime = Date.now();
        
        // Set sprite based on type
        this.sprite = this.type === 'health' ? 'healthPotion' : 
              this.type === 'power' ? 'powerPotion' :
              this.type === 'shield' ? 'shieldPotion' :
              this.type === 'projectile' ? 'projectilePotion' :
              this.type === 'mystic' ? 'mysticTonic' : null;
    }

    update() {
        // Kiki special: temporary magnet pickup effect.
        const magnetUntil = this.game ? (Number(this.game._dropMagnetUntil) || 0) : 0;
        if (magnetUntil && Date.now() < magnetUntil && this.game && this.game.player) {
            const px = this.game.player.x + this.game.player.width / 2;
            const py = this.game.player.y + this.game.player.height / 2;
            const dx = px - this.x;
            const dy = py - this.y;
            const dist = Math.max(1, Math.hypot(dx, dy));
            const pull = Math.min(9, 2.6 + dist * 0.010);
            this.x += (dx / dist) * pull;
            this.y += (dy / dist) * pull;
        }

        // Make the powerup fall downward with a slight bobbing motion
        this.y += this.fallSpeed;
        
        // Add a drifting motion (left/right)
        this.x += Math.cos(this.angle) * this.driftAmount * 
                Math.sin(Date.now() * 0.001 + this.bobOffset);

        // Keep drops pinned inside the visible playfield.
        const pad = Math.max(18, this.width / 2);
        this.x = Math.max(pad, Math.min(this.game.width - pad, this.x));
        
        // Add bobbing motion
        const bobY = Math.sin(Date.now() * this.bobSpeed + this.bobOffset) * this.bobAmount;
        this.y += bobY * 0.1; // Scale the bob amount
        
        // Remove if offscreen
        if (this.y > this.game.height + 50) { 
            return true; // Remove this powerup
        }
        
        return false; // Keep this powerup
    }

    draw() {
        if (this.type === 'life') {
            const hp = this.game.assets.images.healthPotion;
            const pp = this.game.assets.images.powerPotion;
            const sp = this.game.assets.images.shieldPotion;
            if (!hp || !pp || !sp) return;

            const bob = Math.sin(Date.now() * 0.005) * 3;
            const drawX = Math.round(this.x - this.width / 2);
            const drawY = Math.round(this.y - this.height / 2 + bob);

            this.game.ctx.save();
            this.game.ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
            this.game.ctx.shadowBlur = 14 + Math.sin(Date.now() * 0.005) * 5;
            // Three potions blended (requested)
            this.game.ctx.globalAlpha = 0.72;
            this.game.ctx.drawImage(hp, drawX - 6, drawY + 2, this.width, this.height);
            this.game.ctx.globalAlpha = 0.72;
            this.game.ctx.drawImage(pp, drawX + 6, drawY + 2, this.width, this.height);
            this.game.ctx.globalAlpha = 0.72;
            this.game.ctx.drawImage(sp, drawX, drawY - 6, this.width, this.height);
            this.game.ctx.restore();
            return;
        }

        const sprite = this.game.assets.images[this.sprite];
        if (sprite) {
            // Create a nice glowing effect for the potion
            this.game.ctx.save();
            // Add glow based on potion type
            const glowColor = this.type === 'health' ? 'rgba(255, 50, 50, 0.3)' : 
                             this.type === 'power' ? 'rgba(50, 255, 50, 0.3)' :
                             this.type === 'shield' ? 'rgba(50, 50, 255, 0.3)' :
                             this.type === 'projectile' ? 'rgba(170, 70, 255, 0.33)' :
                             'rgba(120, 255, 220, 0.28)';
            this.game.ctx.shadowColor = glowColor;
            this.game.ctx.shadowBlur = 10 + Math.sin(Date.now() * 0.005) * 5;
            // Draw the potion with a slight bobbing animation
            this.game.ctx.drawImage(
                sprite, 
                Math.round(this.x - this.width/2), 
                Math.round(this.y - this.height/2 + Math.sin(Date.now() * 0.005) * 3), 
                this.width, 
                this.height 
            );
            this.game.ctx.restore();
        }   
    }

    collect(player) {
        // Play a random potion sound
        this.playPotionSound();
        // Apply effect based on type
        switch(this.type) {
            case 'health':
                if (player.health < (player.maxHealth || 10)) {
                    player.health++;
                    console.log("Health potion collected! Health restored to:", player.health);
                    // Reset alpha for overlays that should be visible
                    for (let i = 0; i < player.healthOverlays.length; i++) {
                        if (i < player.health) {
                            player.healthOverlays[i].alpha = 1;
                        }
                    }
                }
                if (this.game && typeof this.game.addSpecialCharge === 'function') {
                    this.game.addSpecialCharge(1);
                }
                break;
            case 'power':
                if (player && typeof player.gainPowerFromGreenPotion === 'function') {
                    player.gainPowerFromGreenPotion(1);
                } else if (typeof player.setPowerLevel === 'function') {
                    player.setPowerLevel((player.powerLevel || 1) + 1);
                } else {
                    player.powerLevel = Math.min(200, (player.powerLevel || 1) + 1);
                    if (typeof player.applyPowerLevel === 'function') player.applyPowerLevel();
                }
                // Potions contribute to special charge once unlocked.
                if (this.game && typeof this.game.addSpecialCharge === 'function') {
                    this.game.addSpecialCharge(1);
                }
                console.log(`Power potion collected! Power Level is now ${player.powerLevel}`);
                break;
            case 'shield':
                if (player && typeof player.addShieldHp === 'function') {
                    player.addShieldHp(4);
                } else if (player) {
                    player.shieldHp = Math.min((player.getMaxShieldHp ? player.getMaxShieldHp() : 20), (Number(player.shieldHp) || 0) + 4);
                }
                console.log("Shield potion collected! Shield HP is now:", player.shieldHp);
                if (this.game && typeof this.game.addSpecialCharge === 'function') {
                    this.game.addSpecialCharge(1);
                }
                break;
            case 'projectile':
                if (player) {
                    const current = Math.max(0, Math.min(10, Number(player.projectilePotionLevel) || 0));
                    if (current < 10) {
                        player.projectilePotionLevel = current + 1;
                    } else {
                        // At max level, converts to score.
                        const extra = 160;
                        const mult = (this.game && typeof this.game.getComboMultiplier === 'function') ? this.game.getComboMultiplier() : 1;
                        this.game.score += Math.round(extra * mult);
                    }
                    console.log("Projectile potion collected! Level:", player.projectilePotionLevel);
                }
                if (this.game && typeof this.game.addSpecialCharge === 'function') {
                    this.game.addSpecialCharge(1);
                }
                break;
            case 'mystic':
                if (player) {
                    // Increase shield level slightly on pickup
                    if (typeof player.addShieldHp === 'function') player.addShieldHp(1);
                    else player.shieldHp = (Number(player.shieldHp) || 0) + 1;

                    // Restore 1 HP
                    player.health = Math.min(player.maxHealth || 10, (Number(player.health) || 0) + 1);
                    if (Array.isArray(player.healthOverlays)) {
                        for (let i = 0; i < player.healthOverlays.length; i++) {
                            if (i < player.health) player.healthOverlays[i].alpha = 1;
                        }
                    }

                    // Add one green potion level
                    if (player && typeof player.gainPowerFromGreenPotion === 'function') {
                        player.gainPowerFromGreenPotion(1);
                    } else if (typeof player.setPowerLevel === 'function') {
                        player.setPowerLevel((player.powerLevel || 1) + 1);
                    } else {
                        player.powerLevel = Math.min(200, (player.powerLevel || 1) + 1);
                        if (typeof player.applyPowerLevel === 'function') player.applyPowerLevel();
                    }

                    // Every 3 Mystic Tonics: +4 max shield capacity
                    player.mysticSurgeTonicCount = (Number(player.mysticSurgeTonicCount) || 0) + 1;
                    while ((Number(player.mysticSurgeTonicCount) || 0) >= 3) {
                        player.mysticSurgeTonicCount -= 3;
                        player.bonusMaxShieldHp = (Number(player.bonusMaxShieldHp) || 0) + 4;
                    }
                }
                if (this.game && typeof this.game.addSpecialCharge === 'function') {
                    this.game.addSpecialCharge(1);
                }
                break;
            case 'life':
                if (this.game && typeof this.game.lives === 'number') {
                    const cap = this.game.maxLives || 3;
                    if (this.game.lives < cap) {
                        this.game.lives += 1;
                    }
                }
                if (this.game && typeof this.game.addSpecialCharge === 'function') {
                    this.game.addSpecialCharge(1);
                }
                break;
        }
    }

    playPotionSound() {
        // Define potential potion sounds
        const potionSounds = [
            this.game.assets.sounds.potion1,
            this.game.assets.sounds.potion2,
            this.game.assets.sounds.potion3,
            this.game.assets.sounds.potion4
        ].filter(Boolean);

        if (!potionSounds.length) return;
        // Check if any potion sound is currently playing
        const isSoundPlaying = potionSounds.some(sound =>
            sound && !sound.paused && sound.currentTime > 0 && sound.currentTime < sound.duration
        );
        // If no potion sound is playing, play a random one
        if (!isSoundPlaying) {
            const randomIndex = Math.floor(Math.random() * potionSounds.length);
            const sound = potionSounds[randomIndex];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(() => {});
            }
        }
    }
}

// Dark Empress progression hook
AlchemyBlaster.prototype.onDarkEmpressDefeated = function(_enemy) {
    const round = Math.max(1, Number(this.round) || 1);
    this.lastEmpressDefeatedAtRound = round;
    this.nextEmpressDueRound = round + 3;
};

// Add inputhandlers to AlchemyBlaster class
AlchemyBlaster.prototype.handleKeyDown = function(e) {
    // Power 130 choice screen: 1/2 to pick.
    if (this.gameState === 'powerChoice130') {
        if (e.key === '1') {
            if (this.player) {
                this.player._power130ChoiceMade = true;
                this.player.chargeTimeMultiplier = Math.max(0.55, this.player.getChargeTimeMultiplier() * 0.8);
            }
            this.gameState = 'playing';
            return;
        }
        if (e.key === '2') {
            if (this.player) {
                this.player._power130ChoiceMade = true;
                this.player._specialRateBonus = 0.10;
            }
            this.gameState = 'playing';
            return;
        }
        return;
    }

    // Boss Rush reward choice
    if (this.gameState === 'bossRushRewardChoice') {
        if (e.key === '1') {
            if (this.player) {
                const maxHp = this.player.maxHealth || 10;
                this.player.health = maxHp;
                if (Array.isArray(this.player.healthOverlays)) {
                    for (let i = 0; i < this.player.healthOverlays.length; i++) {
                        this.player.healthOverlays[i].alpha = 1;
                    }
                }
            }

            this._bossRushPendingRoundAdvance = false;
            this.round++;
            this.wave = 1;
            this.gameState = 'playing';
            this.showWaveDialog(`Boss Rush Round ${this.round} Start!`);
            return;
        }
        if (e.key === '2') {
            if (this.player) {
                const current = this.player.powerLevel || 1;
                const next = Math.min(200, current + 10);
                if (typeof this.player.setPowerLevel === 'function') {
                    this.player.setPowerLevel(next);
                } else {
                    this.player.powerLevel = next;
                    if (typeof this.player.applyPowerLevel === 'function') this.player.applyPowerLevel();
                }
            }

            this._bossRushPendingRoundAdvance = false;
            this.round++;
            this.wave = 1;
            this.gameState = 'playing';
            this.showWaveDialog(`Boss Rush Round ${this.round} Start!`);
            return;
        }

        if (e.key === '3') {
            // +Projectile size and faster charge
            if (this.player) {
                this.player.baseProjectileSize = (Number(this.player.baseProjectileSize) || 1) * 1.08;
                this.player.chargeTimeMultiplier = Math.max(0.55, this.player.getChargeTimeMultiplier() * 0.90);
                if (typeof this.player.applyPowerLevel === 'function') this.player.applyPowerLevel();
            }
            this._bossRushPendingRoundAdvance = false;
            this.round++;
            this.wave = 1;
            this.gameState = 'playing';
            this.showWaveDialog(`Boss Rush Round ${this.round} Start!`);
            return;
        }

        if (e.key === '4') {
            // +Combo rate
            this.comboRateMultiplier = Math.min(3, (Number(this.comboRateMultiplier) || 1) * 1.05);
            this._bossRushPendingRoundAdvance = false;
            this.round++;
            this.wave = 1;
            this.gameState = 'playing';
            this.showWaveDialog(`Boss Rush Round ${this.round} Start!`);
            return;
        }
        return;
    }

    // Power choice screen: 1/2 to pick.
    if (this.gameState === 'powerChoice') {
        if (e.key === '1') {
            if (this.player) this.player.powerChoice = 'beam';
            this.gameState = 'playing';
            if (this._pendingStartWaveAfterPowerChoice) {
                this._pendingStartWaveAfterPowerChoice = false;
                this.spawnWave();
            }
            return;
        }
        if (e.key === '2') {
            if (this.player) {
                // Character-specific option 2
                this.player.powerChoice = (this.selectedCharacter === 'aliza') ? 'homing' : 'spread10';
            }
            this.gameState = 'playing';
            if (this._pendingStartWaveAfterPowerChoice) {
                this._pendingStartWaveAfterPowerChoice = false;
                this.spawnWave();
            }
            return;
        }
    }

    if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;

    // Menu: mode selection shortcuts
    if (this.gameState === 'menu' && this.menuStage === 'mode') {
        if (e.key === '1') {
            this.runMode = 'zonePatrol';
            this.menuStage = 'character';
            return;
        }
        if (e.key === '2') {
            this.runMode = 'bossRush';
            this.menuStage = 'character';
            // Reset boss rush progression when entering character select.
            this.round = 1;
            this.wave = 1;
            this.bossRushBossIndex = 1;
            return;
        }
        if (e.key === '3') {
            this.runMode = 'zonePatrolHard';
            this.menuStage = 'character';
            return;
        }
    }

    // (Dev cheat keybinds removed: P/Q)

    // Special attack (charge-based): X
    if (e.key && e.key.toLowerCase && e.key.toLowerCase() === 'x') {
        if (this.gameState === 'playing') {
            this.tryUseSpecialAttack();
        }
        return;
    }

    // Pause stays on Space (and middle click)
    if (e.key === ' ') this.togglePause();

    // Pause menu: quit run and grant currently owed items
    if (e.key === 'Escape' && this.gameState === 'paused') {
        if (typeof this.quitRun === 'function') {
            this.quitRun();
        }
        return;
    }

    // Pause menu: restart the run
    if ((e.key === 'r' || e.key === 'R') && this.gameState === 'paused') {
        const keepCharacter = this.selectedCharacter;
        const keepMode = this.runMode;
        if (typeof this.resetGame === 'function') {
            this.resetGame();
        }
        this.runMode = keepMode;
        this.menuStage = 'character';
        this.selectedCharacter = keepCharacter;
        if (keepCharacter) {
            this.initializeSelectedCharacter();
        }
        return;
    }
};

AlchemyBlaster.prototype.showTransientDialog = function(message, durationMs = 1600) {
    try {
        if (!this.canvas || !this.canvas.parentNode) return;
        const dialog = document.createElement('div');
        dialog.style.position = 'absolute';
        dialog.style.left = '50%';
        dialog.style.bottom = '18%';
        dialog.style.transform = 'translateX(-50%)';
        dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
        dialog.style.border = '2px solid #d4af37';
        dialog.style.borderRadius = '8px';
        dialog.style.padding = '12px 16px';
        dialog.style.color = '#fff';
        dialog.style.textAlign = 'center';
        dialog.style.zIndex = '1000';
        dialog.style.fontSize = '18px';
        dialog.style.pointerEvents = 'none';
        dialog.textContent = String(message || '');
        this.canvas.parentNode.appendChild(dialog);
        setTimeout(() => {
            try { dialog.remove(); } catch (_) {}
        }, Math.max(600, Number(durationMs) || 1600));
    } catch (_) {
        // ignore
    }
};

AlchemyBlaster.prototype.handleKeyUp = function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
};

AlchemyBlaster.prototype.handleMouseMove = function(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = rect.width ? (this.width / rect.width) : 1;
    const scaleY = rect.height ? (this.height / rect.height) : 1;
    this.mousePosition.x = (e.clientX - rect.left) * scaleX;
    this.mousePosition.y = (e.clientY - rect.top) * scaleY;
};

AlchemyBlaster.prototype.handleMouseDown = function(e) {
    if (e.button === 0) { // Left click
        // In menu state, handle character selection
        if (this.gameState === 'menu') {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = rect.width ? (this.width / rect.width) : 1;
            const scaleY = rect.height ? (this.height / rect.height) : 1;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            // Mode selection hitboxes
            if (this.menuStage === 'mode') {
                const desiredShiftY = Math.round(this.height * 0.30);
                const boxW = 440;
                const boxH = 140;
                const gap = 30;
                const x = (this.width - boxW) / 2;
                const baseY1 = 180;
                const groupH = (3 * boxH) + (2 * gap);
                const maxY1 = Math.max(20, Math.round(this.height - groupH - 20));
                const y1 = Math.min(baseY1 + desiredShiftY, maxY1);
                const y2 = y1 + boxH + gap;
                const y3 = y2 + boxH + gap;

                const inBox = (y) => mouseX >= x && mouseX <= x + boxW && mouseY >= y && mouseY <= y + boxH;
                if (inBox(y1)) {
                    this.runMode = 'zonePatrol';
                    this.menuStage = 'character';
                    return;
                }
                if (inBox(y2)) {
                    this.runMode = 'bossRush';
                    this.menuStage = 'character';
                    this.round = 1;
                    this.wave = 1;
                    this.bossRushBossIndex = 1;
                    return;
                }
                if (inBox(y3)) {
                    this.runMode = 'zonePatrolHard';
                    this.menuStage = 'character';
                    return;
                }
            }

            // Character selection is only active after mode selection.
            if (this.menuStage !== 'character') return;

            // Character selection hitboxes (2x2 grid)
            const charWidth = 200;
            const charHeight = 240;
            const spacingX = 90;
            const spacingY = 80;
            const cols = 2;
            const totalW = cols * charWidth + (cols - 1) * spacingX;
            const startX = (this.width - totalW) / 2;
            const startY = 105;

            const cards = [
                { id: 'dere', x: startX, y: startY },
                { id: 'aliza', x: startX + (charWidth + spacingX), y: startY },
                { id: 'kaskit', x: startX, y: startY + (charHeight + spacingY) },
                { id: 'kiki', x: startX + (charWidth + spacingX), y: startY + (charHeight + spacingY) }
            ];

            for (const c of cards) {
                if (mouseX >= c.x && mouseX <= c.x + charWidth && mouseY >= c.y && mouseY <= c.y + charHeight) {
                    this.selectedCharacter = c.id;
                    this.initializeSelectedCharacter();
                    return;
                }
            }
        }

        // Boss Rush reward choice click handling
        if (this.gameState === 'bossRushRewardChoice') {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = rect.width ? (this.width / rect.width) : 1;
            const scaleY = rect.height ? (this.height / rect.height) : 1;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const boxW = 290;
            const boxH = 104;
            const gap = 22;
            const totalW = boxW * 2 + gap;
            const x1 = (this.width - totalW) / 2;
            const x2 = x1 + boxW + gap;
            const y1 = this.height / 2 - boxH - Math.floor(gap / 2);
            const y2 = y1 + boxH + gap;

            const inBox = (x, y) => mouseX >= x && mouseX <= x + boxW && mouseY >= y && mouseY <= y + boxH;

            if (inBox(x1, y1)) {
                // Fill HP
                if (this.player) {
                    const maxHp = this.player.maxHealth || 10;
                    this.player.health = maxHp;
                    if (Array.isArray(this.player.healthOverlays)) {
                        for (let i = 0; i < this.player.healthOverlays.length; i++) {
                            this.player.healthOverlays[i].alpha = 1;
                        }
                    }
                }
                this._bossRushPendingRoundAdvance = false;
                this.round++;
                this.wave = 1;
                this.gameState = 'playing';
                this.showWaveDialog(`Boss Rush Round ${this.round} Start!`);
                return;
            }

            if (inBox(x2, y1)) {
                // +10 power
                if (this.player) {
                    const current = this.player.powerLevel || 1;
                    const next = Math.min(200, current + 10);
                    if (typeof this.player.setPowerLevel === 'function') {
                        this.player.setPowerLevel(next);
                    } else {
                        this.player.powerLevel = next;
                        if (typeof this.player.applyPowerLevel === 'function') this.player.applyPowerLevel();
                    }
                }
                this._bossRushPendingRoundAdvance = false;
                this.round++;
                this.wave = 1;
                this.gameState = 'playing';
                this.showWaveDialog(`Boss Rush Round ${this.round} Start!`);
                return;
            }

            if (inBox(x1, y2)) {
                // Bigger + Faster Charge
                if (this.player) {
                    this.player.baseProjectileSize = (Number(this.player.baseProjectileSize) || 1) * 1.08;
                    if (typeof this.player.getChargeTimeMultiplier === 'function') {
                        this.player.chargeTimeMultiplier = Math.max(0.55, this.player.getChargeTimeMultiplier() * 0.90);
                    } else {
                        this.player.chargeTimeMultiplier = Math.max(0.55, (Number(this.player.chargeTimeMultiplier) || 1) * 0.90);
                    }
                    if (typeof this.player.applyPowerLevel === 'function') this.player.applyPowerLevel();
                }
                this._bossRushPendingRoundAdvance = false;
                this.round++;
                this.wave = 1;
                this.gameState = 'playing';
                this.showWaveDialog(`Boss Rush Round ${this.round} Start!`);
                return;
            }

            if (inBox(x2, y2)) {
                // +Combo rate
                this.comboRateMultiplier = Math.min(3, (Number(this.comboRateMultiplier) || 1) * 1.05);
                this._bossRushPendingRoundAdvance = false;
                this.round++;
                this.wave = 1;
                this.gameState = 'playing';
                this.showWaveDialog(`Boss Rush Round ${this.round} Start!`);
                return;
            }
        }
        
        // If we're playing, handle shooting
        if (this.gameState === 'playing') {
            this.isShooting = true;
        }
    } else if (e.button === 2) { // Right click
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

        if (this.gameState === 'playing' && this.player && typeof this.player.startChargeShot === 'function') {
            this.player.startChargeShot();
        }
    } else if (e.button === 1) { // Middle click
        e.preventDefault();
        this.togglePause();
    }
};

AlchemyBlaster.prototype.initializeSelectedCharacter = function() {
    // Ensure player exists first
    if (!this.player) {
        this.player = new Player(this);
    }

    // Configure character-specific properties
    if (this.selectedCharacter === 'aliza') {
        this.player.sprites = {
            left: 'alizaLeft',
            right: 'alizaRight'
        };
        this.player.projectileSprites = ['alizaShot1', 'alizaShot2', 'alizaShot3'];
        // Aliza projectiles: 50% smaller overall.
        this.player.projectileSize = 2.75 * 0.5;
        this.player.projectileSpeed = 11.25;
        this.player.shotCooldown = 175;
        this.player.damageMultiplier = 1.0;
        this.player.projectilePierceDefault = false;
        this.player.hitboxExtraShrink = 0;
        this.player.hasInnateChargeShot = false;
        this.player.sounds = {
            hit: ['alizaHit1', 'alizaHit2'],
            victory: ['alizaVictory1', 'alizaVictory2'],
            gameOver: ['alizaGameOver1', 'alizaGameOver2']
        };
        this.player.ignoreVisualOverlays = true; // Flag to ignore HP overlays
        this.player.gameOverImage = 'alizagameover';
        this.player.healthOverlays = [];
        this.player.speed = 5;
    } else if (this.selectedCharacter === 'kaskit') {
        this.player.sprites = {
            left: 'kaskitLeft',
            right: 'kaskitRight'
        };
        // Kaskit uses dagger projectiles; tier is chosen dynamically by power level.
        this.player.projectileSprites = ['kaskitDagger1'];
        this.player.projectileSize = 1.1;
        this.player.projectileSpeed = 15 * 1.3;
        this.player.shotCooldown = 175;
        this.player.damageMultiplier = 0.7; // ~30% less than Dere
        // Pierce is applied per-shot in Projectile ctor (progression by power level).
        this.player.projectilePierceDefault = false;
        this.player.hitboxExtraShrink = 0.06;
        this.player.hasInnateChargeShot = true;
        this.player.sounds = {
            hit: ['kaskitHit1', 'kaskitHit2', 'kaskitHitRare'],
            victory: ['victory', 'victory1', 'victory2'],
            gameOver: ['kaskitGameOver']
        };
        this.player.ignoreVisualOverlays = true;
        this.player.gameOverImage = 'kaskitgameover';
        this.player.healthOverlays = [];
        this.player.speed = 5.7;
    } else if (this.selectedCharacter === 'kiki') {
        this.player.sprites = {
            left: 'kikiLeft',
            right: 'kikiRight'
        };
        // Kiki cycles through shots and favors higher tiers at higher power.
        this.player.projectileSprites = ['kikiShot1', 'kikiShot2', 'kikiShot3', 'kikiShot4'];
        this.player.projectileSize = 1.1 * 1.2;
        this.player.projectileSpeed = 15;
        this.player.shotCooldown = Math.round(175 * 0.9);
        this.player.damageMultiplier = 0.9;
        this.player.projectilePierceDefault = false;
        this.player.hitboxExtraShrink = 0.06;
        this.player.hasInnateChargeShot = false;
        this.player.sounds = {
            hit: ['kikiHit'],
            victory: ['victory', 'victory1', 'victory2'],
            gameOver: ['kikiGameOver1', 'kikiGameOver2']
        };
        this.player.ignoreVisualOverlays = true;
        this.player.gameOverImage = 'kikigameover';
        this.player.healthOverlays = [];
        this.player.speed = 5.6;
    } else {
        // Default Dere configuration 
        this.player.sprites = {
            left: 'playerLeft',
            right: 'playerRight'
        };
        this.player.gameOverImage = 'deregameover';
        this.player.projectileSprites = ['shot1', 'shot1a', 'shot1b'];
        this.player.projectileSize = 1.1;
        this.player.projectileSpeed = 15;
        this.player.shotCooldown = 175;
        this.player.damageMultiplier = 1.0;
        this.player.projectilePierceDefault = false;
        this.player.hitboxExtraShrink = 0;
        this.player.hasInnateChargeShot = false;
        this.player.sounds = {
            hit: ['hit1', 'hit2'],
            victory: ['victory', 'victory1', 'victory2'],
            gameOver: ['gameOver', 'gameOver1']
        };
        this.player.ignoreVisualOverlays = false;
        this.player.healthOverlays = [
            { sprite: 'playerHP3', alpha: 1 },
            { sprite: 'playerHP2', alpha: 1 },
            { sprite: 'playerHP1', alpha: 1 }
        ];
        this.player.speed = 5;
    }

    // Power system baseline depends on character
    this.player.baseProjectileSize = this.player.projectileSize;
    this.player.baseProjectileSpeed = this.player.projectileSpeed;
    if (typeof this.player.setPowerLevel === 'function') {
        this.player.setPowerLevel(1);
    }

    // Boss Rush mode: start bonuses
    if (this.runMode === 'bossRush') {
        this.maxLives = 2;
        this.lives = 2;
        if (typeof this.player.setPowerLevel === 'function') {
            this.player.setPowerLevel(10);
        } else {
            this.player.powerLevel = Math.min(100, 10);
            if (typeof this.player.applyPowerLevel === 'function') this.player.applyPowerLevel();
        }
        // Ensure the run starts at the beginning.
        this.round = 1;
        this.wave = 1;
        this.bossRushBossIndex = 1;
    } else {
        // Zone Patrol default
        // Zone Patrol: only one extra life can be held.
        this.maxLives = 1;
        this.lives = this.lives || 0;
    }

    // Reset advanced progression state for a fresh run
    this.player.powerChoice = null;
    this.player._power130ChoiceMade = false;
    this.player.chargeTimeMultiplier = 1;
    this.player._specialRateBonus = 0;
    this.player._chargeUnlockNotified = false;
    this.player._power200LifeGranted = false;
    this.specialCharge = 0;
    this.specialChargesStored = 0;
    this._pendingStartWaveAfterPowerChoice = false;

    this.player.shieldHp = 0;
    this.player.baseMaxShieldHp = 20;
    this.player.bonusMaxShieldHp = 0;
    this.player.mysticSurgeTonicCount = 0;

    this.player.projectilePotionLevel = 0;
    this.player.isChargingShot = false;
    this.player.chargeStartTime = 0;
    this.player.invulnerableUntil = 0;

    // Zone Patrol (Hard): start at Round 5 with full HP/shield and 50/100 power,
    // then force the level-30 power choice before the first wave begins.
    if (this.runMode === 'zonePatrolHard') {
        this.round = 5;
        this.wave = 1;

        // Start with 50 green potion levels.
        if (typeof this.player.setPowerLevel === 'function') {
            this.player.setPowerLevel(50);
        } else {
            this.player.powerLevel = 50;
            if (typeof this.player.applyPowerLevel === 'function') this.player.applyPowerLevel();
        }

        // Full HP
        const maxHp = this.player.maxHealth || 10;
        this.player.health = maxHp;
        if (Array.isArray(this.player.healthOverlays)) {
            for (let i = 0; i < this.player.healthOverlays.length; i++) {
                this.player.healthOverlays[i].alpha = 1;
            }
        }

        // Full shield
        if (typeof this.player.getMaxShieldHp === 'function') {
            this.player.shieldHp = this.player.getMaxShieldHp();
        } else {
            this.player.shieldHp = (Number(this.player.baseMaxShieldHp) || 0) + (Number(this.player.bonusMaxShieldHp) || 0);
        }

        this._pendingStartWaveAfterPowerChoice = true;
        this.gameState = 'powerChoice';
        return;
    }

    // Start the game
    this.gameState = 'playing';
    this.spawnWave();
};

AlchemyBlaster.prototype.togglePause = function() {
    if (this.gameState === 'playing') {
        this.gameState = 'paused';
        this.isPaused = true;
    } else if (this.gameState === 'paused') {
        this.gameState = 'playing';
        this.isPaused = false;
    }
};

AlchemyBlaster.prototype.quitRun = function() {
    // Only allow quitting a run that is currently active (paused or playing).
    if (!(this.gameState === 'playing' || this.gameState === 'paused')) return;

    // Stop spawning / input
    this.isShooting = false;
    this.isPaused = false;
    if (this.spawnInterval) {
        clearInterval(this.spawnInterval);
        this.spawnInterval = null;
    }
    this.isSpawningWave = false;
    this.waveStartTime = null;

    // Move into end screen state and award rewards exactly once.
    this.gameState = 'endScreen';
    const rewards = (typeof this.distributeRewards === 'function')
        ? this.distributeRewards({ scoreOverride: this.score, callCallback: true })
        : [];

    if (typeof this.showEndScreen === 'function') {
        this.showEndScreen({
            title: 'Run Quit',
            subtitle: 'Items granted from your current score.',
            rewardsOverride: rewards
        });
    }
};