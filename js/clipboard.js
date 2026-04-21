document.addEventListener("DOMContentLoaded", function () {
    const copyBtn = document.getElementById("copy-btn");
    copyBtn.addEventListener("click", function () {
        const emailContent = document.getElementById("email-template").innerText;
        const originalText = copyBtn.textContent;

        const showFeedback = (success) => {
            copyBtn.textContent = success ? "Copied!" : "Copy failed — try again";
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(emailContent)
                .then(() => showFeedback(true))
                .catch(() => showFeedback(false));
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = emailContent;
            textArea.style.cssText = "position:fixed;top:0;left:0;opacity:0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                showFeedback(true);
            } catch (err) {
                showFeedback(false);
            }
            document.body.removeChild(textArea);
        }
    });
});
