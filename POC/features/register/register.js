/**
 * Register Page Component
 */

function initRegister() {
    const registerForm = document.getElementById('register-form');
    const userTypeSelect = document.getElementById('user-type');
    const companyFields = document.getElementById('company-fields');
    const professionalFields = document.getElementById('professional-fields');
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    if (!registerForm) return;
    
    // Show/hide fields based on user type
    userTypeSelect.addEventListener('change', (e) => {
        const userType = e.target.value;
        companyFields.style.display = userType === 'company' ? 'block' : 'none';
        professionalFields.style.display = userType === 'professional' ? 'block' : 'none';
        
        // Update required fields
        if (userType === 'company') {
            document.getElementById('company-name').required = true;
            document.getElementById('full-name').required = false;
        } else if (userType === 'professional') {
            document.getElementById('full-name').required = true;
            document.getElementById('company-name').required = false;
        }
    });
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide previous messages
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
        
        const formData = new FormData(registerForm);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Validate passwords match
        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.style.display = 'block';
            return;
        }
        
        const userType = formData.get('userType');
        if (!userType) {
            errorDiv.textContent = 'Please select an account type';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Determine role
        let role;
        if (userType === 'company') {
            role = CONFIG.ROLES.COMPANY_OWNER;
        } else {
            role = CONFIG.ROLES.PROFESSIONAL;
        }
        
        // Prepare user data
        const userData = {
            email: formData.get('email'),
            password: password,
            role: role,
            profile: {}
        };
        
        if (userType === 'company') {
            userData.profile = {
                type: 'company',
                name: formData.get('companyName'),
                crNumber: formData.get('crNumber') || null
            };
        } else {
            userData.profile = {
                type: 'professional',
                name: formData.get('fullName')
            };
        }
        
        try {
            const user = await authService.register(userData);
            
            successDiv.innerHTML = `
                Account created successfully!<br>
                Your account is pending admin approval. You will receive an email once approved.
            `;
            successDiv.style.display = 'block';
            
            // Clear form
            registerForm.reset();
            companyFields.style.display = 'none';
            professionalFields.style.display = 'none';
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.navigate(CONFIG.ROUTES.LOGIN);
            }, 3000);
            
        } catch (error) {
            errorDiv.textContent = error.message || 'Registration failed. Please try again.';
            errorDiv.style.display = 'block';
        }
    });
}
