/**
 * Home Page Component
 * Handles home page interactions
 */

function initHome() {
    highlightDemoFlowWhenVisible();
}

/**
 * When the user scrolls to the demo flow section, highlight the first step card.
 * Uses IntersectionObserver (no dependencies).
 */
function highlightDemoFlowWhenVisible() {
    var section = document.getElementById('demo-flow-section');
    if (!section) return;

    var firstCard = section.querySelector('.demo-step-card[data-step="1"]');
    if (!firstCard) return;

    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    firstCard.classList.add('demo-step-highlight');
                } else {
                    firstCard.classList.remove('demo-step-highlight');
                }
            });
        },
        { rootMargin: '0px', threshold: 0.2 }
    );

    observer.observe(section);
}
