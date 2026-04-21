document.addEventListener("DOMContentLoaded", () => {
    const menuBtn = document.getElementById('menu-btn');
    const sidePanel = document.getElementById('side-panel');
    const overlay = document.getElementById('side-panel-overlay');
    const closeBtn = document.getElementById('side-panel-close');

    function openPanel() {
        sidePanel.classList.add('open');
        overlay.classList.add('visible');
    }

    function closePanel() {
        sidePanel.classList.remove('open');
        overlay.classList.remove('visible');
    }

    menuBtn.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);
});
