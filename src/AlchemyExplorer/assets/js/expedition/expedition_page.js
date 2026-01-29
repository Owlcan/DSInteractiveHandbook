(function () {
    function getAudio(id) {
        return document.getElementById(id);
    }

    function loadInventory() {
        try {
            return JSON.parse(localStorage.getItem('playerInventory') || '{}') || {};
        } catch {
            return {};
        }
    }

    function saveInventory(inv) {
        localStorage.setItem('playerInventory', JSON.stringify(inv));
    }

    function showToast(text) {
        const el = document.getElementById('expedition-toast');
        if (!el) return;
        el.textContent = text;
        el.style.display = 'block';
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => {
            el.style.display = 'none';
        }, 3500);
    }

    function buildSounds() {
        return {
            shoot: getAudio('shoot-sound'),
            hit1: getAudio('hit1-sound'),
            hit2: getAudio('hit2-sound'),
            victory: getAudio('victory-sound'),
            victory1: getAudio('victory1-sound'),
            victory2: getAudio('victory2-sound'),
            gameOver: getAudio('gameover-sound'),
            gameOver1: getAudio('gameover1-sound'),
            spellfire: [
                getAudio('spellfire-sound'),
                getAudio('spellfire1-sound'),
                getAudio('spellfire2-sound'),
                getAudio('spellfire3-sound')
            ],
            alizaHit1: getAudio('aliza-hit1-sound'),
            alizaHit2: getAudio('aliza-hit2-sound'),
            alizaVictory1: getAudio('aliza-victory1-sound'),
            alizaVictory2: getAudio('aliza-victory2-sound'),
            alizaGameOver1: getAudio('aliza-gameover1-sound'),
            alizaGameOver2: getAudio('aliza-gameover2-sound')
        };
    }

    document.addEventListener('DOMContentLoaded', function () {
        const levelSelect = document.getElementById('expedition-level-select');
        const container = document.getElementById('expedition-container');

        if (!levelSelect || !container) {
            console.error('Expedition page missing required elements');
            return;
        }

        let currentGame = null;

        function wireLogbookModal() {
            const link = document.getElementById('expedition-logbook-link');
            const modal = document.getElementById('logbook-modal');
            const closeBtn = document.getElementById('logbook-close');
            const entriesEl = document.getElementById('logbook-entries');
            const refreshBtn = document.getElementById('logbook-refresh-btn');
            const saveBtn = document.getElementById('logbook-save-btn');

            function render() {
                if (!entriesEl) return;
                if (!window.Logbook) {
                    entriesEl.innerHTML = '<div style="opacity:0.85;">Logbook module not loaded.</div>';
                    return;
                }
                const entries = window.Logbook.getEntries();
                if (!entries || entries.length === 0) {
                    entriesEl.innerHTML = '<div style="opacity:0.85;">No log entries yet.</div>';
                    return;
                }

                entriesEl.innerHTML = entries.map(e => {
                    const when = window.Logbook.formatLocal(e.ts);
                    const type = e.type ? String(e.type) : 'note';
                    const title = e.title ? String(e.title) : '';
                    let details = '';

                    if (e.data && e.type === 'expedition' && Array.isArray(e.data.rewards)) {
                        const rewardText = e.data.rewards
                            .map(r => `${r.id}${r.amount > 1 ? ` x${r.amount}` : ''}`)
                            .join(', ');
                        details = rewardText ? `<div class="logbook-details">${rewardText}</div>` : '';
                    }

                    return `
                        <div class="logbook-entry">
                            <div class="logbook-meta">
                                <div class="logbook-when">${when}</div>
                                <div class="logbook-type">${type}</div>
                            </div>
                            <div class="logbook-body">
                                <div class="logbook-title">${title}</div>
                                ${details}
                            </div>
                        </div>
                    `;
                }).join('');
            }

            if (link && modal) {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    modal.style.display = 'block';
                    render();
                });
            }

            if (closeBtn && modal) {
                closeBtn.addEventListener('click', function () {
                    modal.style.display = 'none';
                });
            }

            if (refreshBtn) refreshBtn.addEventListener('click', render);
            if (saveBtn) {
                saveBtn.addEventListener('click', function () {
                    if (!window.Logbook) return;
                    const entries = window.Logbook.getEntries();
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                    const filename = `logbook_${timestamp}.json`;
                    const dataStr = JSON.stringify(entries, null, 2);
                    const blob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.click();
                    URL.revokeObjectURL(url);
                });
            }

            if (modal) {
                modal.addEventListener('click', function (evt) {
                    if (evt.target === modal) modal.style.display = 'none';
                });
            }
        }

        function startGame(zoneId) {
            container.style.display = 'block';
            levelSelect.style.display = 'none';

            const zoneCfg = (window.ZonePatrolZones && typeof window.ZonePatrolZones.getZoneConfig === 'function')
                ? window.ZonePatrolZones.getZoneConfig(zoneId)
                : { id: zoneId || 'lissome-plains', logbookLocationId: 'lissome-plains', logbookLocationName: 'Lissome Plains' };

            currentGame = new AlchemyBlaster({
                container,
                enemyStyle: 'invaders',
                zoneId: zoneCfg && zoneCfg.id ? zoneCfg.id : (zoneId || 'lissome-plains'),
                sounds: buildSounds(),
                onRewardsCollected: function (rewards) {
                    if (rewards && Array.isArray(rewards)) {
                        const inv = loadInventory();
                        rewards.forEach(reward => {
                            if (!reward || !reward.id) return;
                            const add = Math.floor(Number(reward.amount) || 0);
                            if (add <= 0) return;
                            const cur = Math.floor(Number(inv[reward.id]) || 0);
                            inv[reward.id] = cur + add;
                        });
                        saveInventory(inv);
                        showToast('Rewards saved to your inventory!');

                        if (window.Logbook && typeof window.Logbook.addExpeditionRewards === 'function') {
                            try {
                                window.Logbook.addExpeditionRewards({
                                    locationId: zoneCfg && zoneCfg.logbookLocationId ? zoneCfg.logbookLocationId : (zoneId || 'lissome-plains'),
                                    locationName: zoneCfg && zoneCfg.logbookLocationName ? zoneCfg.logbookLocationName : 'Lissome Plains',
                                    score: currentGame && typeof currentGame.score === 'number' ? currentGame.score : null,
                                    round: currentGame && typeof currentGame.round === 'number' ? currentGame.round : null,
                                    wave: currentGame && typeof currentGame.wave === 'number' ? currentGame.wave : null,
                                    rewards
                                });
                            } catch (e) {
                                console.warn('Failed to log expedition rewards', e);
                            }
                        }
                    }
                }
            });
        }

        document.querySelectorAll('.level-thumbnail').forEach(el => {
            el.addEventListener('click', function () {
                try {
                    const zoneId = el && el.dataset ? el.dataset.level : null;
                    startGame(zoneId);
                } catch (err) {
                    console.error('Failed to start expedition', err);
                    showToast('Failed to start expedition. Check console.');
                }
            });
        });

        // If user navigates back (browser), ensure UI looks sane
        window.addEventListener('pageshow', () => {
            if (!currentGame) {
                container.style.display = 'none';
                levelSelect.style.display = 'block';
            }
        });

        wireLogbookModal();
    });
})();
