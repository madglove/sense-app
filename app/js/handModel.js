document.addEventListener('DOMContentLoaded', () => {
    const handModelView = document.getElementById('handModelView');
    if (!handModelView) return; // Exit if the view element is not found

    handModelView.innerHTML = `
        <div class="sketchfab-embed-wrapper">
            <iframe title="Low-Poly Hand With Animation" frameborder="0" 
                allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" 
                allow="autoplay; fullscreen; xr-spatial-tracking" 
                xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered 
                web-share 
                src="https://sketchfab.com/models/33253439b0874d09b46a9a18685c863c/embed">
            </iframe>
        </div>
    `;
});
