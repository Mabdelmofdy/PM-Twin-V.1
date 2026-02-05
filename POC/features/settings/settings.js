/**
 * Settings page – account and preferences
 */

function initSettings() {
    const user = authService.getCurrentUser();
    if (!user) {
        router.navigate(CONFIG.ROUTES.LOGIN);
        return;
    }

    const langSelect = document.getElementById('settings-language');
    if (langSelect) {
        const currentLang = document.documentElement.getAttribute('lang') || 'en';
        langSelect.value = currentLang === 'ar' ? 'ar' : 'en';
        langSelect.addEventListener('change', () => {
            const lang = langSelect.value;
            if (lang === 'ar') {
                document.documentElement.setAttribute('dir', 'rtl');
                document.documentElement.setAttribute('lang', 'ar');
            } else {
                document.documentElement.setAttribute('dir', 'ltr');
                document.documentElement.setAttribute('lang', 'en');
            }
            if (typeof layoutService !== 'undefined' && layoutService.renderLayout) {
                layoutService.renderLayout();
            }
        });
    }
}
