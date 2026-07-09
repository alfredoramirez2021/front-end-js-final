/* ==========================================================================
   1. BASE DE DATOS DE PRODUCTOS (Gunners Diseños)
   ========================================================================== */
const listaProductos = [
   {
       id: 1,
       title: "Topper Personalizado",
       description: "Topper personalizado para tortas y eventos especiales.",
       price: 2500,
       category: "toppers",
       images: ["./assets/img/tpf2.jpg"]
   },
   {
       id: 2,
       title: "Almanaque Personalizado",
       description: "Almanaques corporativos para negocios y emprendimientos.",
       price: 4500,
       category: "almanaques",
       images: ["./assets/img/tpf3.jpg"]
   },
   {
       id: 3,
       title: "Sticker Personalizado",
       description: "Stickers de alta calidad y troquelados para productos.",
       price: 3500,
       category: "stickers",
       images: ["./assets/img/tpf4.jpg"]
   },
   {
       id: 4,
       title: "Tarjetas Personales",
       description: "Diseños exclusivos impresos para tu marca o negocio.",
       price: 4000,
       category: "papeleria",
       images: ["./assets/img/tpf5.jpg"]
   },
   {
       id: 5,
       title: "Etiquetas Adhesivas",
       description: "Etiquetas personalizadas ideales para packaging.",
       price: 3000,
       category: "stickers",
       images: ["./assets/img/tpf6.jpg"]
   },
   {
       id: 6,
       title: "Stickers Circulares",
       description: "Pack de 10 stickers circulares personalizados.",
       price: 3500,
       category: "stickers",
       images: ["./assets/img/tpf7.jpg"]
   }
];

/* ==========================================================================
   2. ESTADO GENERAL DEL CARRITO (LocalStorage)
   ========================================================================== */
let shoppingCart = JSON.parse(localStorage.getItem('productarticle')) || [];
let totalPrice = parseFloat(localStorage.getItem('totalPrice')) || 0;
let productShown = 0; 
const productPerPage = 4;

/* ==========================================================================
   3. RENDERIZADO DINÁMICO DE PRODUCTOS (index.html)
   ========================================================================== */
function crearProductos(productosAFiltrar = listaProductos, cargarMas = false) {
   const cardProductos = document.getElementById('productCard');
   if (!cardProductos) return; // Si no estamos en index.html, salimos

   if (!cargarMas) {
      cardProductos.innerHTML = '';
      productShown = 0;
   }

   // Segmentamos los productos que corresponden a la página actual
   const nextProducts = productosAFiltrar.slice(productShown, productPerPage + productShown);
   productShown += nextProducts.length;

   nextProducts.forEach(producto => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
         <img src="${producto.images[0]}" alt="imagen de ${producto.title}" class="product-image">
         <div class="product-content">
            <h3 class="product-title">${producto.title}</h3>
            <p class="product-description">${producto.description}</p>
            <p class="product-price"><span>Precio:</span> <span class="price">$${producto.price}</span></p>
            <button type="button" class="product-button" data-id="${producto.id}">Añadir al Carrito</button>
         </div>
      `;
      cardProductos.appendChild(card);
   });

   // Ocultar botón "Mostrar más" si ya se listaron todos
   const btnMas = document.getElementById('mostrarProducts');
   if (btnMas) {
      if (productShown >= productosAFiltrar.length) {
         btnMas.style.display = 'none';
      } else {
         btnMas.style.display = 'inline-block';
      }
   }

   asignarEventosBotones();
}

/* ==========================================================================
   4. LÓGICA DE AGREGAR AL CARRITO (Evita duplicados y suma cantidades)
   ========================================================================== */
function asignarEventosBotones() {
   const botones = document.querySelectorAll('.product-button');
   botones.forEach(boton => {
      // Clonamos para remover event listeners previos en caso de re-renderizado
      const nuevoBoton = boton.cloneNode(true);
      boton.parentNode.replaceChild(nuevoBoton, boton);

      nuevoBoton.addEventListener('click', (e) => {
         const idProducto = parseInt(e.target.getAttribute('data-id'));
         // Si es una card estática del HTML (respaldo), la buscamos por título
         const titulo = e.target.closest('.product-card').querySelector('.product-title').textContent.trim();
         
         const productoBase = listaProductos.find(p => p.id === idProducto) || 
                              listaProductos.find(p => p.title === titulo);

         if (!productoBase) return;

         const existente = shoppingCart.find(item => item.title === productoBase.title);

         if (existente) {
            existente.count += 1;
         } else {
            shoppingCart.push({
               title: productoBase.title,
               price: productoBase.price,
               count: 1
            });
         }

         // Calcular totales de forma precisa
         recualcularTotales();
         actualizarContadorVisual();
         
         // Animación sutil de alerta en lugar de un alert molesto
         e.target.textContent = "¡Agregado! ✓";
         e.target.style.backgroundColor = "#10b981";
         setTimeout(() => {
            e.target.textContent = "Añadir al Carrito";
            e.target.style.backgroundColor = "";
         }, 1000);
      });
   });
}

function recualcularTotales() {
   totalPrice = shoppingCart.reduce((acc, item) => acc + (item.price * item.count), 0);
   localStorage.setItem('productarticle', JSON.stringify(shoppingCart));
   localStorage.setItem('totalPrice', totalPrice.toFixed(2));
}

function actualizarContadorVisual() {
   const totalProductos = shoppingCart.reduce((acc, item) => acc + item.count, 0);
   const contador = document.getElementById('cart-count') || document.querySelector('.count');
   if (contador) {
      contador.textContent = totalProductos;
   }
   localStorage.setItem('totalCount', totalProductos);
}

/* ==========================================================================
   5. PANEL DEL CARRITO DE COMPRAS (carrito.html)
   ========================================================================== */
const handleCart = () => {
   const carritoProduct = document.getElementById('itemProducts');
   if (!carritoProduct) return;

   carritoProduct.innerHTML = '';

   if (shoppingCart.length === 0) {
      carritoProduct.innerHTML = '<p class="text-center py-4">El carrito está vacío 🛒</p>';
      return;
   }

   const tabla = document.createElement('table');
   tabla.classList.add('table', 'table-striped', 'align-middle', 'name-class-tabla');

   let encabezado = `
      <thead>
         <tr>
            <th>Producto</th>
            <th>Precio Unitario</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
            <th>Acciones</th>
         </tr>
      </thead>
   `;

   let cuerpo = '<tbody>';
   shoppingCart.forEach((producto, index) => {
      const subtotal = producto.price * producto.count;
      cuerpo += `
         <tr>
            <td><strong>${producto.title}</strong></td>
            <td>$${producto.price}</td>
            <td>
               <div class="d-flex align-items-center gap-2">
                  <button class="btn btn-sm btn-outline-secondary btn-restar" data-index="${index}">-</button>
                  <span>${producto.count}</span>
                  <button class="btn btn-sm btn-outline-secondary btn-sumar" data-index="${index}">+</button>
               </div>
            </td>
            <td>$${subtotal.toFixed(2)}</td>
            <td>
               <button class="btn btn-sm btn-danger btn-eliminar" data-index="${index}">Eliminar</button>
            </td>
         </tr>
      `;
   });
   cuerpo += '</tbody>';

   tabla.innerHTML = encabezado + cuerpo;
   carritoProduct.appendChild(tabla);

   // Renderizar total general
   const contenedorTotal = document.createElement('div');
   contenedorTotal.className = 'd-flex justify-content-between align-items-center mt-4';
   contenedorTotal.innerHTML = `
      <h3>Total de la compra: <span class="text-success">$${totalPrice.toFixed(2)}</span></h3>
      <div>
         <button id="btn-vaciar" class="btn btn-warning me-2">Vaciar Carrito 🧹</button>
         <button id="btn-finalizar" class="btn btn-primary">Finalizar Compra 💲</button>
      </div>
   `;
   carritoProduct.appendChild(contenedorTotal);

   asignarEventosPanelCarrito();
};

function asignarEventosPanelCarrito() {
   // Eventos para controles de fila individual
   document.querySelectorAll('.btn-sumar').forEach(btn => {
      btn.addEventListener('click', (e) => {
         const idx = e.target.getAttribute('data-index');
         shoppingCart[idx].count++;
         recualcularTotales();
         actualizarContadorVisual();
         handleCart();
      });
   });

   document.querySelectorAll('.btn-restar').forEach(btn => {
      btn.addEventListener('click', (e) => {
         const idx = e.target.getAttribute('data-index');
         if (shoppingCart[idx].count > 1) {
            shoppingCart[idx].count--;
         } else {
            shoppingCart.splice(idx, 1);
         }
         recualcularTotales();
         actualizarContadorVisual();
         handleCart();
      });
   });

   document.querySelectorAll('.btn-eliminar').forEach(btn => {
      btn.addEventListener('click', (e) => {
         const idx = e.target.getAttribute('data-index');
         shoppingCart.splice(idx, 1);
         recualcularTotales();
         actualizarContadorVisual();
         handleCart();
      });
   });

   // Botón vaciar todo
   const btnVaciar = document.getElementById('btn-vaciar');
   if (btnVaciar) {
      btnVaciar.addEventListener('click', limpiarCarrito);
   }

   // Botón finalizar
   const btnFinalizar = document.getElementById('btn-finalizar');
   if (btnFinalizar) {
      btnFinalizar.addEventListener('click', () => {
         alert('¡Gracias por elegir a Gunners Diseños! Tu pedido está siendo procesado.');
         shoppingCart = [];
         recualcularTotales();
         actualizarContadorVisual();
         handleCart();
      });
   }
}

function limpiarCarrito() {
   if (confirm('¿Estás seguro de que deseas vaciar por completo tu carrito?')) {
      shoppingCart = [];
      totalPrice = 0;
      localStorage.clear();
      actualizarContadorVisual();
      handleCart();
   }
}

/* ==========================================================================
   6. INICIALIZACIÓN Y CONFIGURACIÓN GENERAL (Buscador y Carga)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
   // Asegurar que el globo del header muestre el estado guardado al iniciar la web
   actualizarContadorVisual();

   // Inicializar vista de productos en el index
   if (document.getElementById('productCard')) {
      crearProductos(listaProductos, false);

      // Evento Mostrar Más
      const btnMas = document.getElementById('mostrarProducts');
      if (btnMas) {
         btnMas.addEventListener('click', () => {
            crearProductos(listaProductos, true);
         });
      }
   }

   // Inicializar vista del gestor de carrito
   if (document.getElementById('itemProducts')) {
      handleCart();
   }
});