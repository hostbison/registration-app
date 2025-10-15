// API Configuration
const API_BASE_URL = 'https://test.hostbisonapp.com/api';

// DOM Elements
const registrationForm = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const messageElement = document.getElementById('message');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('HostBison Registration App initialized');
    
    // Add real-time validation
    addRealTimeValidation();
    
    // Add password strength indicator
    addPasswordStrengthMeter();
});

// Main form submission handler
registrationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Clear previous states
    clearErrors();
    hideMessage();
    setLoadingState(false);

    // Get and validate form data
    const formData = getFormData();
    const validationResult = validateForm(formData);
    
    if (!validationResult.isValid) {
        showFieldErrors(validationResult.errors);
        return;
    }

    // Attempt registration
    await attemptRegistration(formData);
});

// Get form data
function getFormData() {
    return {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        company: document.getElementById('company').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
}

// Validate form data
function validateForm(data) {
    const errors = {};
    let isValid = true;

    // Name validation
    if (!data.name) {
        errors.name = 'Name is required';
        isValid = false;
    } else if (!/^[A-Za-z\s\'-]+$/.test(data.name)) {
        errors.name = 'Name can only contain letters, spaces, apostrophes, and hyphens';
        isValid = false;
    } else if (data.name.length < 2 || data.name.length > 100) {
        errors.name = 'Name must be between 2 and 100 characters';
        isValid = false;
    }

    // Email validation
    if (!data.email) {
        errors.email = 'Email is required';
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
    } else if (data.email.length > 255) {
        errors.email = 'Email address is too long';
        isValid = false;
    }

    // Company validation
    if (!data.company) {
        errors.company = 'Company name is required';
        isValid = false;
    } else if (data.company.length > 100) {
        errors.company = 'Company name must be less than 100 characters';
        isValid = false;
    }

    // Password validation
    if (!data.password) {
        errors.password = 'Password is required';
        isValid = false;
    } else if (!isStrongPassword(data.password)) {
        errors.password = 'Password must be at least 6 characters and include letters, numbers, and symbols';
        isValid = false;
    }

    // Confirm password validation
    if (!data.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
        isValid = false;
    } else if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        isValid = false;
    }

    return { isValid, errors };
}

// Check password strength
function isStrongPassword(password) {
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 6;
    
    return hasLetter && hasNumber && hasSymbol && isLongEnough;
}

// Show field-specific errors
function showFieldErrors(errors) {
    for (const [field, message] of Object.entries(errors)) {
        showError(`${field}Error`, message);
    }
}

// Attempt registration with API
async function attemptRegistration(formData) {
    setLoadingState(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
            // Add timeout handling
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        const result = await response.json();

        if (result.success) {
            handleSuccess(result);
        } else {
            handleError(result.error || 'Registration failed');
        }
    } catch (error) {
        handleNetworkError(error);
    } finally {
        setLoadingState(false);
    }
}

// Handle successful registration
function handleSuccess(result) {
    showMessage('🎉 Registration successful! Welcome to HostBison App. Redirecting...', 'success');
    
    // Clear form
    registrationForm.reset();
    clearPasswordStrength();
    
    // Redirect to welcome page after delay
    setTimeout(() => {
        // You can redirect to a welcome page when you create one
        // window.location.href = '/welcome.html';
        
        // For now, just show a success message
        showMessage('🎉 Registration completed! You can now log in with your credentials.', 'success');
    }, 2000);
    
    // Log success (for analytics)
    console.log('User registered successfully:', result.userId);
}

// Handle API errors
function handleError(errorMessage) {
    // Check for common error types and provide specific feedback
    if (errorMessage.includes('Email already registered')) {
        showError('emailError', 'This email is already registered. Please use a different email or try logging in.');
    } else if (errorMessage.includes('Password')) {
        showError('passwordError', errorMessage);
    } else if (errorMessage.includes('Name')) {
        showError('nameError', errorMessage);
    } else {
        showMessage(errorMessage, 'error');
    }
}

// Handle network errors
function handleNetworkError(error) {
    console.error('Network error:', error);
    
    if (error.name === 'TimeoutError') {
        showMessage('⏱️ Request timeout. Please check your internet connection and try again.', 'error');
    } else if (error.name === 'TypeError') {
        showMessage('🌐 Network error. Please check your internet connection and try again.', 'error');
    } else {
        showMessage('🚨 An unexpected error occurred. Please try again in a few moments.', 'error');
    }
}

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.style.opacity = '0.7';
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
        submitBtn.style.opacity = '1';
    }
}

// Show error for specific field
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        const inputId = elementId.replace('Error', '');
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.classList.add('error');
        }
    } else {
        // If no specific error element, show as general message
        showMessage(message, 'error');
    }
}

// Clear all errors
function clearErrors() {
    // Clear error messages
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
    
    // Remove error classes from inputs
    const inputElements = document.querySelectorAll('input');
    inputElements.forEach(input => {
        input.classList.remove('error');
    });
}

// Show message
function showMessage(message, type) {
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

// Hide message
function hideMessage() {
    messageElement.style.display = 'none';
    messageElement.textContent = '';
}

// Add real-time validation
function addRealTimeValidation() {
    const inputs = ['name', 'email', 'company', 'password', 'confirmPassword'];
    
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', handleRealTimeValidation);
            input.addEventListener('input', handleRealTimeInput);
        }
    });
}

// Handle real-time validation on blur
function handleRealTimeValidation(e) {
    const input = e.target;
    const formData = getFormData();
    const validationResult = validateForm(formData);
    
    if (validationResult.errors[input.id]) {
        showError(`${input.id}Error`, validationResult.errors[input.id]);
    } else {
        clearFieldError(input.id);
    }
}

// Handle real-time input (clear errors when user starts typing)
function handleRealTimeInput(e) {
    const input = e.target;
    clearFieldError(input.id);
    
    // Special handling for password confirm field
    if (input.id === 'confirmPassword') {
        const password = document.getElementById('password').value;
        const confirmPassword = input.value;
        
        if (confirmPassword && password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
        } else if (confirmPassword) {
            clearFieldError('confirmPassword');
        }
    }
    
    // Update password strength in real-time
    if (input.id === 'password') {
        updatePasswordStrength(input.value);
    }
}

// Clear error for specific field
function clearFieldError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
    const inputElement = document.getElementById(fieldId);
    if (inputElement) {
        inputElement.classList.remove('error');
    }
}

// Add password strength meter
function addPasswordStrengthMeter() {
    const passwordGroup = document.querySelector('#password').closest('.form-group');
    const strengthMeter = document.createElement('div');
    strengthMeter.id = 'passwordStrength';
    strengthMeter.innerHTML = `
        <div class="strength-meter">
            <div class="strength-bar"></div>
        </div>
        <small class="strength-text">Password strength: <span id="strengthValue">None</span></small>
    `;
    
    // Add CSS for strength meter
    const style = document.createElement('style');
    style.textContent = `
        .strength-meter {
            height: 5px;
            background: #eee;
            border-radius: 3px;
            margin: 8px 0;
            overflow: hidden;
        }
        .strength-bar {
            height: 100%;
            width: 0%;
            transition: width 0.3s, background 0.3s;
            border-radius: 3px;
        }
        .strength-text {
            color: #666;
            font-size: 0.8rem;
        }
    `;
    document.head.appendChild(style);
    
    passwordGroup.appendChild(strengthMeter);
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthValue = document.getElementById('strengthValue');
    
    if (!password) {
        strengthBar.style.width = '0%';
        strengthBar.style.background = '#eee';
        strengthValue.textContent = 'None';
        return;
    }
    
    let strength = 0;
    let feedback = '';
    
    // Length check
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 10;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 20;
    
    // Ensure strength doesn't exceed 100%
    strength = Math.min(strength, 100);
    
    // Update visual indicator
    strengthBar.style.width = `${strength}%`;
    
    // Set color and text based on strength
    if (strength < 40) {
        strengthBar.style.background = '#e74c3c';
        strengthValue.textContent = 'Weak';
        strengthValue.style.color = '#e74c3c';
    } else if (strength < 70) {
        strengthBar.style.background = '#f39c12';
        strengthValue.textContent = 'Fair';
        strengthValue.style.color = '#f39c12';
    } else if (strength < 90) {
        strengthBar.style.background = '#3498db';
        strengthValue.textContent = 'Good';
        strengthValue.style.color = '#3498db';
    } else {
        strengthBar.style.background = '#2ecc71';
        strengthValue.textContent = 'Strong';
        strengthValue.style.color = '#2ecc71';
    }
}

// Clear password strength indicator
function clearPasswordStrength() {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthValue = document.getElementById('strengthValue');
    
    if (strengthBar && strengthValue) {
        strengthBar.style.width = '0%';
        strengthValue.textContent = 'None';
        strengthValue.style.color = '#666';
    }
}

// Utility function to check if element exists
function elementExists(id) {
    return document.getElementById(id) !== null;
}

// Add some basic analytics
console.log('HostBison Registration Form Loaded');
console.log('API Base URL:', API_BASE_URL);

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        isStrongPassword,
        updatePasswordStrength
    };
}