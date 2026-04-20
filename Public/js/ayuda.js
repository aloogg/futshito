document.addEventListener("DOMContentLoaded", function() {
  const btnAyuda = document.getElementById("btn-manual-ayuda");
  const ventanaManual = document.getElementById("ventana-manual");
  const btnCerrar = document.getElementById("cerrar-manual");

  btnAyuda.addEventListener("click", function() {
    ventanaManual.classList.toggle("oculto");
  });

  btnCerrar.addEventListener("click", function() {
    ventanaManual.classList.add("oculto");
  });
});