/**
 * Login Page Component
 */

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
}
