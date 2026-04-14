document.addEventListener('DOMContentLoaded', function() {
    // Selecciona todos los botones de categoría
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // Agrega evento click a cada botón
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remueve la clase active de todos los botones
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Agrega active al botón clickeado
            this.classList.add('active');
            
            // Oculta todos los contenidos de categoría
            document.querySelectorAll('.category-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Muestra el contenido correspondiente
            const categoryId = this.getAttribute('data-category');
            document.getElementById(categoryId).classList.add('active');
        });
    });
});