document.addEventListener("DOMContentLoaded", () => {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const confirmCheckbox = document.getElementById("confirm");
    const submitButton = document.getElementById("submit-button");

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const messageError = document.getElementById("message-error");

    function validateForm() {
        let isValid = true;

        // Validera namn (endast bokstäver)
        if (!/^[a-zA-Z\s]+$/.test(nameInput.value)) {
            nameError.textContent = "Please enter a valid name, containing only letters.";
            isValid = false;
        } else {
            nameError.textContent = "";
        }

        // Validera email (måste innehålla @ och .)
        if (!/^\S+@\S+\.\S+$/.test(emailInput.value)) {
            emailError.textContent = "Enter a valid email address.";
            isValid = false;
        } else {
            emailError.textContent = "";
        }

        // Validera att meddelandet inte är tomt
        if (messageInput.value.length > 300 || messageInput.value.length === 0) {
            messageError.textContent = "Message should be between 1 and 300 characters.";
            isValid = false;
        } else {
            messageError.textContent = "";
        }

        // Aktivera/skydda skicka-knappen
        submitButton.disabled = !isValid || !confirmCheckbox.checked;
    }

    // Lägg till event listeners
    nameInput.addEventListener("input", validateForm);
    emailInput.addEventListener("input", validateForm);
    messageInput.addEventListener("input", validateForm);
    confirmCheckbox.addEventListener("change", validateForm);

    // Hantera formulärets inskick
    document.getElementById("contact-form").addEventListener("submit", (event) => {
        event.preventDefault();

        alert("Your message has been sent!");

        document.getElementById("contact-form").reset();
        submitButton.disabled = true; // Återställ knappen
    });
});
