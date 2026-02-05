/**
 * Knowledge Base Page
 * Tabbed UI: Collaboration Models, SPV & Legal, FAQ. Each tab shows Q&A content.
 */

function initKnowledgeBase() {
    const tabButtons = document.querySelectorAll('.kb-tab');
    const panels = document.querySelectorAll('.kb-panel');

    function switchTab(tabId) {
        tabButtons.forEach(btn => {
            const isActive = btn.getAttribute('data-tab') === tabId;
            btn.classList.toggle('kb-tab-active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        panels.forEach(panel => {
            const isActive = panel.getAttribute('data-tab') === tabId;
            panel.classList.toggle('kb-panel-active', isActive);
            if (isActive) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
        });
    }

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            if (tabId) switchTab(tabId);
        });
    });

    // Ensure first tab is active and only its panel is visible (in case of re-init)
    switchTab('models');
}
