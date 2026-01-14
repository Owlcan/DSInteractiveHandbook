(function () {
    function escapeHtml(text) {
        return String(text)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function wire() {
        const button = document.getElementById('logbook-btn');
        const modal = document.getElementById('logbook-modal');
        const entriesEl = document.getElementById('logbook-entries');
        const refreshBtn = document.getElementById('logbook-refresh-btn');
        const saveBtn = document.getElementById('logbook-save-btn');

        if (!modal || !button) return;
        if (modal.dataset.logbookWired === '1') return;
        modal.dataset.logbookWired = '1';

        function storageWritable() {
            try {
                const k = '__logbook_test__';
                localStorage.setItem(k, '1');
                localStorage.removeItem(k);
                return true;
            } catch {
                return false;
            }
        }

        function render() {
            if (!entriesEl) return;
            if (!window.Logbook) {
                entriesEl.innerHTML = '<div style="opacity:0.85;">Logbook module not loaded.</div>';
                return;
            }

            const entries = window.Logbook.getEntries();
            if (!entries || entries.length === 0) {
                const dbg = (typeof window.Logbook.getDebugState === 'function') ? window.Logbook.getDebugState() : null;
                const writable = storageWritable();
                const hint = writable ? '' : 'LocalStorage appears blocked here. Use http://localhost:8000 (not file://) and disable private/incognito restrictions.';

                entriesEl.innerHTML = `
                    <div style="opacity:0.9;">No log entries yet.</div>
                    ${hint ? `<div style="margin-top:8px; color:#ffb74d; font-size:12px;">${escapeHtml(hint)}</div>` : ''}
                    ${dbg ? `
                        <div style="margin-top:10px; font-size:12px; opacity:0.85; line-height:1.4;">
                            <div><strong>Origin:</strong> ${escapeHtml(dbg.origin || '')}</div>
                            <div><strong>Entries:</strong> ${escapeHtml(String(dbg.entryCount))}</div>
                            <div><strong>First-crafted map:</strong> ${escapeHtml(String(dbg.firstProducedCount))}</div>
                            ${dbg.lastError ? `<div><strong>Last error:</strong> ${escapeHtml(dbg.lastError)}</div>` : ''}
                        </div>
                    ` : ''}
                `;
                return;
            }

            entriesEl.innerHTML = entries.map(e => {
                const when = window.Logbook.formatLocal(e.ts);
                const type = e.type ? escapeHtml(e.type) : 'note';
                const title = e.title ? escapeHtml(e.title) : '';

                let details = '';
                if (e.data && e.type === 'expedition' && Array.isArray(e.data.rewards)) {
                    const rewardText = e.data.rewards
                        .map(r => `${escapeHtml(r.id)}${r.amount > 1 ? ` x${r.amount}` : ''}`)
                        .join(', ');
                    details = rewardText ? `<div class="logbook-details">${rewardText}</div>` : '';
                }

                return `
                    <div class="logbook-entry">
                        <div class="logbook-meta">
                            <div class="logbook-when">${escapeHtml(when)}</div>
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

        function open() {
            modal.style.display = 'block';
            render();
        }

        function close() {
            modal.style.display = 'none';
        }

        // Open
        button.addEventListener('click', open);

        // Close (X)
        const closeEl = modal.querySelector('.close');
        if (closeEl) closeEl.addEventListener('click', close);

        // Close (outside)
        modal.addEventListener('click', (evt) => {
            if (evt.target === modal) close();
        });

        // Refresh / Save
        if (refreshBtn) refreshBtn.addEventListener('click', render);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
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

        // ESC
        window.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape' && modal.style.display === 'block') close();
        });
    }

    document.addEventListener('DOMContentLoaded', wire);
})();
