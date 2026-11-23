# MotoLab · Tu estilo NKD

Landing y personalizador de una AKT NKD 125 blanca. La portada presenta el proceso, los accesorios y la ruta al desplazarse por la página. Desde «Personaliza tu moto» se abre el editor con la moto de serie. Cada enlace «Ver en mi moto» abre el editor con ese accesorio montado.

## Ejecutar en local

Desde la raíz del repositorio, sirve la carpeta `frontend/` con Python 3.

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory frontend
```

Abre `http://127.0.0.1:8000/` en un navegador moderno. El servidor entrega los módulos JavaScript, las imágenes y la fuente desde el propio proyecto. Pulsa Ctrl+C para detenerlo.

## Estructura y responsabilidades

| Ubicación | Función |
| --- | --- |
| `index.html` | Estructura de la portada, navegación por secciones y enlaces al editor. |
| `editor.html` | Vista de la moto, panel de selección y resumen de la combinación. |
| `css/base.css` | Fuente, colores, botones, cabecera y estilos de accesibilidad compartidos. |
| `css/inicio.css` | Composición adaptable de la landing y animación de entrada al desplazarse. |
| `css/editor.css` | Distribución del editor, ubicación de las piezas sobre la moto y estados de los botones. |
| `js/catalogo.js` | Fuente común de nombres, precios, descripciones, imágenes y formato de moneda. |
| `js/inicio.js` | Construye las tarjetas del catálogo y activa la animación de las secciones según la preferencia de movimiento del navegador. |
| `js/editor.js` | Lee el accesorio inicial de la URL, mantiene la selección y sincroniza las capas, los botones y el total. |
| `assets/img/` | Imágenes WebP creadas para esta maqueta a partir de las referencias. Las variantes con sufijo `-montada` tienen fondo transparente para superponerlas a la moto. |
| `assets/fonts/` | Fuente Barlow Condensed y su licencia SIL Open Font License. |

La separación sigue el principio de responsabilidad única. Para cambiar un precio o una descripción, edita el catálogo. Para añadir una pieza, incorpora su imagen de producto y su capa transparente, crea la entrada en el catálogo con un identificador único y posiciona su capa con la clase `.layer-<id>` en `css/editor.css`. La tienda y el editor leen la misma entrada.

## Comprobar el personalizador

| Selección | Total de ejemplo |
| --- | ---: |
| Moto de serie | 0 € |
| Cúpula Sport | 129 € |
| Alforjas Urban | 249 € |
| Cúpula y alforjas | 378 € |

Pulsa una tarjeta para alternar la pieza y comprueba la imagen, el contador y el precio. «Restablecer» devuelve la moto a la configuración de serie. La selección se mantiene mientras está abierta la página. Al recargar, se recupera la configuración indicada por la URL, por ejemplo `editor.html?accesorio=cupula`.

La NKD y los accesorios son representaciones visuales. Los precios en euros corresponden al diseño de referencia. [Diseño en Figma](https://www.figma.com/design/803ix41vMZwQ2Nxq4o7QBs/Untitled?node-id=2-6)
