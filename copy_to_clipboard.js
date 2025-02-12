document.addEventListener("DOMContentLoaded", function () {
    const copyBtn = document.getElementById("copy-btn");
    copyBtn.addEventListener("click", function () {
        const emailContent = document.getElementById("email-template").innerText;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(emailContent)
                .then(() => {
                    alert("Email content copied to clipboard!");
                })
                .catch((err) => {
                    console.error("Failed to copy email content: ", err);
                });
        } else {
            // Fallback using a temporary textarea element
            const textArea = document.createElement("textarea");
            textArea.value = emailContent;
            // Prevent scrolling to bottom
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                console.log("Email content copied to clipboard!");
            } catch (err) {
                console.error("Fallback: Unable to copy", err);
            }
            document.body.removeChild(textArea);
        }
    });
});
