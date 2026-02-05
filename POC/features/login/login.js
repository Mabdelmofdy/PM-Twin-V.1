/**
 * Login Page Component
 */

const DEMO_CREDENTIALS = [
    { type: 'Admin', email: 'admin@pmtwin.com', password: 'admin123' },
    { type: 'Company', email: 'info@alkhorayef.com', password: 'password123' },
    { type: 'Company', email: 'contact@saudibinladin.com', password: 'password123' },
    { type: 'Company', email: 'info@almabani.com', password: 'password123' },
    { type: 'Company', email: 'projects@nesma.com', password: 'password123' },
    { type: 'Professional', email: 'ahmed.hassan@email.com', password: 'password123' },
    { type: 'Professional', email: 'fatima.almutairi@email.com', password: 'password123' },
    { type: 'Professional', email: 'mohammed.alqahtani@email.com', password: 'password123' },
    { type: 'Consultant', email: 'sara.alzahrani@email.com', password: 'password123' },
    { type: 'Professional', email: 'khalid.alharbi@email.com', password: 'password123' }
];

function initLogin() {
    const loginForm = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');
    
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Hide previous errors
        errorDiv.style.display = 'none';
        
        try {
            const result = await authService.login(email, password);
            
            if (result) {
                // Update navigation
                await layoutService.updateNavigation();
                
                // Redirect to dashboard
                router.navigate(CONFIG.ROUTES.DASHBOARD);
            }
        } catch (error) {
            // Show error
            errorDiv.textContent = error.message || 'Login failed. Please try again.';
            errorDiv.style.display = 'block';
        }
    });
    
    const btnViewDemo = document.getElementById('btn-view-demo-credentials');
    if (btnViewDemo) {
        btnViewDemo.addEventListener('click', () => {
            const tableRows = DEMO_CREDENTIALS.map(
                (row) => `<tr class="cursor-pointer hover:bg-blue-50 border-b border-gray-100" data-email="${escapeHtml(row.email)}" data-password="${escapeHtml(row.password)}" title="Click to use this account"><td class="py-2 px-3">${escapeHtml(row.type)}</td><td class="py-2 px-3">${escapeHtml(row.email)}</td><td class="py-2 px-3">${escapeHtml(row.password)}</td></tr>`
            ).join('');
            const contentHTML = `
                <p class="text-sm text-gray-600 mb-2">Click a row to fill the login form with that account.</p>
                <div class="overflow-x-auto max-h-[60vh] overflow-y-auto">
                    <table class="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr class="border-b border-gray-200">
                                <th class="py-2 px-3 font-semibold text-gray-900">Account type</th>
                                <th class="py-2 px-3 font-semibold text-gray-900">Email</th>
                                <th class="py-2 px-3 font-semibold text-gray-900">Password</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            `;
            if (window.modalService && typeof window.modalService.showCustom === 'function') {
                modalService.showCustom(contentHTML, 'Demo user credentials');
            } else {
                alert(DEMO_CREDENTIALS.map((r) => `${r.type}: ${r.email} / ${r.password}`).join('\n'));
            }
        });
    }

    document.body.addEventListener('click', (e) => {
        const row = e.target.closest('tr[data-email]');
        if (!row) return;
        const modalContainer = document.getElementById('modal-container');
        if (!modalContainer || modalContainer.style.display === 'none') return;
        const email = row.getAttribute('data-email');
        const password = row.getAttribute('data-password');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        if (email && password && emailInput && passwordInput) {
            emailInput.value = email;
            passwordInput.value = password;
            if (window.modalService) modalService.close();
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
