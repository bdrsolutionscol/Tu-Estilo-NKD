import { accesorios, euros } from './catalogo.js';

const seleccion = new Set();
const inicial = new URLSearchParams(location.search).get('accesorio');
if (accesorios.some(item => item.id === inicial)) seleccion.add(inicial);

const opciones = document.querySelector('#opciones');
const capas = document.querySelector('#capas');
const canvas = document.querySelector('#visor');
let mostrarSeleccion3D;
const reset = document.querySelector('#reset');

for (const item of accesorios) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'option';
  boton.dataset.id = item.id;
  boton.setAttribute('aria-label', `${item.nombre}, ${item.detalle}, ${euros(item.precio)}`);
  boton.innerHTML = `<img src="${item.foto}" alt=""><span class="option-copy">
    <strong>${item.nombre}</strong><small>${item.detalle}</small>
    <b class="option-price">${euros(item.precio)}</b><small class="action"></small></span>`;
  boton.addEventListener('click', () => {
    if (seleccion.has(item.id)) seleccion.delete(item.id);
    else seleccion.add(item.id);
    actualizarVista();
  });
  opciones.append(boton);

  const capa = new Image();
  capa.src = item.capa;
  capa.alt = '';
  capa.dataset.id = item.id;
  capa.className = `layer layer-${item.id}`;
  capa.hidden = true;
  capas.append(capa);
}

function actualizarVista() {
  const activos = accesorios.filter(item => seleccion.has(item.id));
  const cantidad = activos.length;
  const precio = euros(activos.reduce((suma, item) => suma + item.precio, 0));
  for (const boton of opciones.children) {
    const activo = seleccion.has(boton.dataset.id);
    boton.setAttribute('aria-pressed', String(activo));
    boton.querySelector('.action').textContent = activo ? '✓ En tu moto · Quitar' : '+ Añadir a mi moto';
  }
  for (const capa of capas.children) capa.hidden = !seleccion.has(capa.dataset.id);
  if (!canvas.hidden) mostrarSeleccion3D(seleccion);
  const piezas = `${cantidad} accesorio${cantidad === 1 ? '' : 's'}`;
  document.querySelector('#cantidad').textContent = `${cantidad} seleccionado${cantidad === 1 ? '' : 's'}`;
  document.querySelector('#precio').textContent = precio;
  document.querySelector('#combinacion').textContent = cantidad
    ? `${activos.map(item => item.nombre).join(' + ')} · ${piezas}`
    : 'Original · Sin accesorios';
  let mensaje = 'Tu próxima versión empieza aquí.';
  if (cantidad === 1) mensaje = activos[0].mensaje;
  if (cantidad > 1) mensaje = 'Tu combinación. Lista para la próxima ruta.';
  document.querySelector('#estado').innerHTML = `${mensaje}<span class="sr-only"> ${piezas}. Total: ${precio}.</span>`;
  reset.disabled = !cantidad;
}

reset.addEventListener('click', () => {
  seleccion.clear();
  actualizarVista();
  opciones.firstElementChild.focus();
});
actualizarVista();

const cambiarVista = document.querySelector('#cambiar-vista');
const foto = document.querySelector('.base-bike');
const ayuda = document.querySelector('#ayuda-visor');
const ayudaLateral = ayuda.textContent;

function cambiarModo(ver3D) {
  foto.hidden = ver3D;
  capas.hidden = ver3D;
  canvas.hidden = !ver3D;
  cambiarVista.setAttribute('aria-expanded', String(ver3D));
  cambiarVista.textContent = ver3D ? 'Volver a la imagen' : 'Opción 3D';
  ayuda.textContent = ver3D
    ? 'Arrastra para girar la moto en 360° e inclinar la vista. También puedes usar las flechas del teclado.'
    : ayudaLateral;
  if (ver3D) mostrarSeleccion3D(seleccion);
}

function avisarSinVisor() {
  cambiarModo(false);
  cambiarVista.disabled = true;
  ayuda.textContent = 'El visor 3D no está disponible. Puedes seguir personalizando la moto en la imagen de referencia.';
}

cambiarVista.hidden = false;
cambiarVista.addEventListener('click', async () => {
  if (!canvas.hidden) {
    cambiarModo(false);
    return;
  }
  if (!mostrarSeleccion3D) {
    cambiarVista.disabled = true;
    cambiarVista.textContent = 'Cargando 3D…';
    try {
      const { iniciarVisor } = await import('./visor-3d.js');
      mostrarSeleccion3D = iniciarVisor(canvas, avisarSinVisor);
    } catch (error) {
      console.warn('Vista 3D no disponible.', error);
      avisarSinVisor();
      return;
    }
    cambiarVista.disabled = false;
  }
  cambiarModo(true);
});
