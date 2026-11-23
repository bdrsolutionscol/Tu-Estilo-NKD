import { accesorios, euros } from './catalogo.js';

const detalle = document.querySelector('#productos .feature');
for (const producto of accesorios) {
  const tarjeta = document.createElement('article');
  tarjeta.innerHTML = `
    <div class="tile"><img loading="lazy" src="${producto.foto}" alt="${producto.titulo}">
      <span class="tag">Pruébalo en tu moto</span></div>
    <p class="eyebrow">${producto.categoria}</p>
    <div class="product-title"><h3>${producto.titulo}</h3><strong>${euros(producto.precio)}</strong></div>
    <p>${producto.lema}</p>
    <a class="text-link" href="editor.html?accesorio=${producto.id}" aria-label="Ver ${producto.nombre} en mi moto">Ver en mi moto ↗</a>`;
  detalle.before(tarjeta);
}

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('enter');
        observer.unobserve(entry.target);
      }
    }
  });
  document.querySelectorAll('[data-reveal]').forEach(section => observer.observe(section));
}
