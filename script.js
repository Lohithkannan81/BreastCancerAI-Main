document.addEventListener("DOMContentLoaded", () => {
    const mascots = document.querySelectorAll('.mascot');
    
    // Using a common selector for all pupils
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const eyeIcon = document.getElementById('eye-icon');
    
    let isFocused = false;
    let typedPassword = false;
    
    // Toggles pupil smooth transition state
    function setSmooth(smooth) {
        mascots.forEach(m => {
            if (smooth) {
                m.classList.add('smooth-pupil');
            } else {
                m.classList.remove('smooth-pupil');
            }
        });
    }

    // Move pupils toward a specific vector
    function lookAt(x, y) {
        mascots.forEach(mascot => {
            const pupils = mascot.querySelectorAll('.pupil');
            pupils.forEach(pupil => {
                pupil.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    }

    // 1. Cursor Tracking
    document.addEventListener("mousemove", (e) => {
        // Stop tracking if interacting with the form entirely
        if (isFocused) return;
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        mascots.forEach(mascot => {
            // Find center of each mascot
            const rect = mascot.getBoundingClientRect();
            const mascotX = rect.left + rect.width / 2;
            const mascotY = rect.top + rect.height / 2;
            
            // Calc angle and cap distance
            const angle = Math.atan2(mouseY - mascotY, mouseX - mascotX);
            const distance = Math.min(6, Math.hypot(mouseX - mascotX, mouseY - mascotY) / 25);
            
            const pupilX = Math.cos(angle) * distance;
            const pupilY = Math.sin(angle) * distance;
            
            const pupils = mascot.querySelectorAll('.pupil');
            pupils.forEach(pupil => {
                pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
            });
        });
    });
    
    // 2. Username Interaction (look down/right toward input)
    usernameInput.addEventListener('focus', () => {
        isFocused = true;
        setSmooth(true);
        lookAt(5, 3); // Shift pupils explicitly right and slightly down
    });
    
    usernameInput.addEventListener('blur', () => {
        isFocused = false;
        setSmooth(false);
        lookAt(0, 0); // Reset tracking baseline
    });
    
    // 3. Password Interaction (shy / look away)
    passwordInput.addEventListener('focus', () => {
        isFocused = true;
        setSmooth(true);
        lookAt(-4, -4); // Look towards top left slightly
    });
    
    passwordInput.addEventListener('blur', () => {
        isFocused = false;
        setSmooth(false);
        lookAt(0, 0);
        typedPassword = false;
    });

    // 4. Typing in Password (shy reaction)
    passwordInput.addEventListener('input', () => {
        if (!typedPassword) {
            lookAt(-6, -5); // Look further away shyly
            typedPassword = true;
        }
        
        // Small jiggling bounce effect per keystroke via JS
        mascots.forEach(m => {
            m.style.transform = `translateY(4px) scale(0.98)`;
            setTimeout(() => {
                m.style.transform = ''; // Reverts handled by existing CSS animation (though CSS clears transform natively on next frame, the transition will smooth it)
            }, 80);
        });
    });
    
    // 5. Show/Hide Password Button
    togglePasswordBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            
            // Add cover eyes class (triggers CSS arm transform)
            mascots.forEach(m => m.classList.add('cover-eyes'));
            
            // Swap to Eye Off Icon
            eyeIcon.innerHTML = `
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            `;
        } else {
            passwordInput.type = 'password';
            
            // Remove class to uncover eyes
            mascots.forEach(m => m.classList.remove('cover-eyes'));
            
            // Swap back to Eye On Icon
            eyeIcon.innerHTML = `
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            `;
        }
    });

    // Prevent default form submission to just showcase the UI
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Fun success bounce
        mascots.forEach((m, idx) => {
            setTimeout(() => {
                m.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                m.style.transform = 'translateY(-30px)';
                setTimeout(() => {
                     m.style.transform = '';
                }, 300);
            }, idx * 100);
        });
    });
});
