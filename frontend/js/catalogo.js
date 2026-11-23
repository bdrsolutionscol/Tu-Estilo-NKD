// Datos compartidos por las tarjetas de la tienda y los controles del editor.
export const accesorios = [
  {
    id: 'cupula', nombre: 'Cúpula Sport', titulo: 'Cúpula Sport ahumada', categoria: 'Cúpulas',
    mensaje: 'Más protección. El mismo carácter.', precio: 129, detalle: 'Ahumada · Kit de montaje incluido', lema: 'Menos viento. Más personalidad.',
    foto: 'assets/img/cupula.webp', capa: 'assets/img/cupula-montada.webp'
  },
  {
    id: 'alforjas', nombre: 'Alforjas Urban', titulo: 'Alforjas Urban · 24 L', categoria: 'Equipaje',
    mensaje: 'Equipada para alargar la ruta.', precio: 249, detalle: 'Lona negra · Capacidad de 24 L', lema: 'Todo lo que necesitas, a tu lado.',
    foto: 'assets/img/alforjas.webp', capa: 'assets/img/alforjas-montada.webp'
  }
];

const moneda = new Intl.NumberFormat('es-ES', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0, minimumFractionDigits: 0
});
export const euros = valor => moneda.format(valor);
