(function () {
    const STORAGE_KEY = 'alchemyLogbookEntries';
    const MAX_ENTRIES = 500;
    let lastError = null;

    function safeParse(json, fallback) {
        try {
            const parsed = JSON.parse(json);
            return parsed ?? fallback;
        } catch {
            return fallback;
        }
    }

    function loadEntries() {
        return safeParse(localStorage.getItem(STORAGE_KEY) || '[]', []);
    }

    function saveEntries(entries) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        } catch (err) {
            lastError = err;
            console.warn('Failed to save logbook entries', err);
        }
    }

    function isoNow() {
        return new Date().toISOString();
    }

    function formatLocal(isoString) {
        try {
            return new Date(isoString).toLocaleString();
        } catch {
            return isoString;
        }
    }

    function addEntry(entry) {
        const entries = loadEntries();
        const ts = entry && entry.ts ? String(entry.ts) : isoNow();
        const normalized = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            ts,
            type: entry && entry.type ? String(entry.type) : 'note',
            title: entry && entry.title ? String(entry.title) : '',
            data: entry && entry.data ? entry.data : null
        };

        entries.unshift(normalized);
        if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
        saveEntries(entries);
        return normalized;
    }

    function normalizeRewards(rewards) {
        if (!Array.isArray(rewards)) return [];
        return rewards
            .map(r => {
                if (typeof r === 'string') return { id: r, amount: 1 };
                if (r && r.id && typeof r.amount === 'number') return { id: r.id, amount: r.amount };
                if (r && r.id && r.amount) return { id: r.id, amount: Number(r.amount) || 0 };
                return null;
            })
            .filter(r => r && r.id && r.amount > 0);
    }

    function addExpeditionRewards({ locationId, locationName, score, round, wave, rewards } = {}) {
        const normalizedRewards = normalizeRewards(rewards);
        const titleParts = [];
        if (locationName) titleParts.push(locationName);
        else if (locationId) titleParts.push(locationId);
        else titleParts.push('Expedition');
        if (typeof score === 'number') titleParts.push(`Score ${score}`);
        if (typeof round === 'number') titleParts.push(`R${round}`);
        if (typeof wave === 'number') titleParts.push(`W${wave}`);

        return addEntry({
            type: 'expedition',
            title: titleParts.join(' · '),
            data: {
                locationId: locationId || null,
                locationName: locationName || null,
                score: typeof score === 'number' ? score : null,
                round: typeof round === 'number' ? round : null,
                wave: typeof wave === 'number' ? wave : null,
                rewards: normalizedRewards
            }
        });
    }

    function getRecipeFirstProducedMap() {
        return safeParse(localStorage.getItem('recipeFirstProducedAt') || '{}', {});
    }

    function saveRecipeFirstProducedMap(map) {
        try {
            localStorage.setItem('recipeFirstProducedAt', JSON.stringify(map || {}));
        } catch (err) {
            lastError = err;
            console.warn('Failed to save recipe first-produced map', err);
        }
    }

    function getDebugState() {
        const entries = loadEntries();
        const firstProduced = getRecipeFirstProducedMap();
        return {
            origin: (typeof location !== 'undefined' && location.origin) ? location.origin : null,
            href: (typeof location !== 'undefined' && location.href) ? location.href : null,
            entryCount: Array.isArray(entries) ? entries.length : 0,
            firstProducedCount: firstProduced ? Object.keys(firstProduced).length : 0,
            storageKey: STORAGE_KEY,
            lastError: lastError ? String(lastError) : null
        };
    }

    function markRecipeFirstProduced({ recipeId, recipeName } = {}) {
        if (!recipeId) return null;
        const map = getRecipeFirstProducedMap();
        const existingTs = map[recipeId] ? String(map[recipeId]) : null;

        // If we already know the first-produced timestamp, make sure there is a log entry.
        if (existingTs) {
            const entries = loadEntries();
            const alreadyLogged = entries.some(e =>
                e && e.type === 'alchemy' && e.data && e.data.recipeId === recipeId
            );

            if (alreadyLogged) return null;

            return addEntry({
                ts: existingTs,
                type: 'alchemy',
                title: `First crafted: ${recipeName || recipeId}`,
                data: { recipeId, recipeName: recipeName || null, firstProducedAt: existingTs }
            });
        }

        // First time we've ever seen this recipe.
        const ts = isoNow();
        map[recipeId] = ts;
        saveRecipeFirstProducedMap(map);

        return addEntry({
            ts,
            type: 'alchemy',
            title: `First crafted: ${recipeName || recipeId}`,
            data: { recipeId, recipeName: recipeName || null, firstProducedAt: ts }
        });
    }

    function getEntries() {
        return loadEntries();
    }

    function clear() {
        saveEntries([]);
    }

    window.Logbook = {
        addEntry,
        addExpeditionRewards,
        markRecipeFirstProduced,
        getEntries,
        clear,
        formatLocal,
        getDebugState
    };
})();
