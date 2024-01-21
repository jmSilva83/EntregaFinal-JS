//Maquina Expendedora JS
const outputDiv = document.getElementById("output");
const productButtonsDiv = document.getElementById("product-buttons");
const cartDiv = document.getElementById("cart");
const paymentForm = document.getElementById("payment-form");

// Estilos
const estiloCarrito = `
    .carrito-item {
        font-family: 'Courier New', monospace;
        font-weight: normal;
        color: #ffffffd0;
        background-color: #333333;
        margin: 10px;
        padding: 8px;
        margin-bottom: 4px;
        border-radius: 4px;
        display: inline-flexbox;
    }
`;

const estiloFormularioPago = `
    .payment-form {
        font-family: 'Courier New', monospace;
        display: inline-block;
        color: #ffffffd0;
        background-color: #333333;
        padding: 16px;
        margin-top: 16px;
        border-radius: 8px;
    }

    .payment-form label {
        display: inline-block;
        align-items: center;
        margin-bottom: 8px;
    }

    .payment-form input {
        padding: 8px;
        margin-bottom: 16px;
        border: 1px solid #666666;
        border-radius: 4px;
    }

    .payment-form button {
        display: inline-block;
        padding: 8px 16px;
        background-color: #f44444;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .payment-form button:hover {
        background-color: #45a049;
    }
`;

// Agrega los estilos al head del documento
const styleElementCarrito = document.createElement("style");
styleElementCarrito.innerHTML = estiloCarrito;
document.head.appendChild(styleElementCarrito);

const styleElementPago = document.createElement("style");
styleElementPago.innerHTML = estiloFormularioPago;
document.head.appendChild(styleElementPago);

function reproducirSonidoPagar() {
    const paySound = document.getElementById("paySound");
    if (paySound) {
        paySound.volume = 0.5; // Puedes ajustar el volumen según tus preferencias
        paySound.play();
    }
}

const maquinaExpendedora = {
    productos: [],
    carrito: [],

    agregarProducto: function (nombre, numero, precio, stock, conAlcohol) {
        const producto = {
            nombre: nombre,
            numero: numero,
            precio: precio,
            stock: stock,
            conAlcohol: conAlcohol,
        };
        this.productos.push(producto);
    },

    mostrarProductos: function () {
        this.productos.length === 0
            ? this.mostrarMensaje(
                  "No hay productos disponibles en la máquina expendedora.\n"
              )
            : this.productos.forEach((producto) => {
                  this.crearBotonProducto(producto);
              });
    },

    crearBotonProducto: function (producto) {
        const botonProducto = document.createElement("button");
        botonProducto.textContent = `Comprar ${
            producto.nombre
        } - $${producto.precio.toFixed(2)}`;
        botonProducto.addEventListener("click", () => {
            this.agregarAlCarrito(producto);
            this.reproducirSonido("buySound");
        });
        productButtonsDiv.appendChild(botonProducto);
    },

    reproducirSonido: function (soundId) {
        const sound = document.getElementById(soundId);

        if (sound) {
            const newSound = sound.cloneNode(true);
            newSound.volume = 0.1;
            newSound.play();
        }
    },

    agregarAlCarrito: function (producto) {
        const index = this.carrito.findIndex(
            (item) => item.numero === producto.numero
        );

        if (index !== -1) {
            // Si el producto ya está en el carrito, incrementar cantidad y actualizar precio total
            this.carrito[index].stock += 1;
            this.carrito[index].precioTotal =
                this.carrito[index].stock * producto.precio;
        } else {
            // Si el producto no está en el carrito, agregarlo con cantidad y precio total
            const nuevoProducto = {
                ...producto,
                stock: 1,
                precioTotal: producto.precio,
            };
            this.carrito.push(nuevoProducto);
        }

        // Mostrar el carrito después de actualizar la información
        this.mostrarCarrito();

        // Agregar notificación con librería Toastify
        Toastify({
            text: `${producto.nombre} agregado al carrito`,
            duration: 3000,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                color: "#ffffffd0",
                fontFamily: "'Currier New', monospace",
                background: "#333333",
            },
        }).showToast();

        localStorage.setItem(
            "ultimoProductoComprado",
            encodeURIComponent(producto.nombre)
        );
    },

    mostrarCarrito: function () {
        cartDiv.innerHTML = "";

        if (this.carrito.length === 0) {
            return;
        }

        let totalCompra = 0;

        this.carrito.forEach((producto) => {
            const productoDiv = document.createElement("div");
            productoDiv.classList.add("carrito-item");

            productoDiv.innerHTML = `${producto.nombre} - Cantidad: ${
                producto.stock
            }, Precio Total: $${producto.precioTotal.toFixed(2)}`;

            cartDiv.appendChild(productoDiv);

            totalCompra += producto.precioTotal;
        });

        cartDiv.innerHTML += `<br><span class="carrito-item">Total de la compra: $${totalCompra.toFixed(
            2
        )}</span><br>`;

        this.mostrarFormularioPago(totalCompra);
    },

    mostrarFormularioPago: function (totalAPagar) {
        const paymentFormHTML = `
            <div class="payment-form">
                <label for="payment-amount">Ingrese el monto a pagar: $</label>
                <input type="number" id="payment-amount" step="0.01" required>
                <button type="button" onclick="realizarPago(${totalAPagar})">Pagar</button>
            </div>
        `;
        paymentForm.innerHTML = paymentFormHTML;
    },

    realizarPago: function (totalAPagar) {
        const montoIngresado = parseFloat(
            document.getElementById("payment-amount").value
        );

        let mensaje = "";

        if (isNaN(montoIngresado) || montoIngresado <= 0) {
            mensaje += "Por favor, ingrese un monto válido mayor a cero.\n";
        } else if (montoIngresado < totalAPagar) {
            mensaje +=
                "El monto ingresado es insuficiente. Por favor, ingrese más dinero.\n";
        } else {
            const cambio = montoIngresado - totalAPagar;
            mensaje += `Su cambio es: $${cambio.toFixed(2)}\n`;
            mensaje +=
                "¡Compra exitosa! Gracias por tu compra, vuelva pronto.\n";
            mensaje += "El carrito está vacío.\n";
            const fechaHoraActual = new Date().toLocaleString();
            mensaje += `Fecha y hora de la compra: ${fechaHoraActual}\n`;
            mensaje += "Compra finalizada.\n";

            localStorage.setItem("fechaHoraCompra", fechaHoraActual);
            localStorage.setItem(
                "detallesPago",
                `Total: $${totalAPagar.toFixed(
                    2
                )}, Dinero Recibido: $${montoIngresado.toFixed(2)}`
            );

            reproducirSonidoPagar();

            this.vaciarCarrito();

            setTimeout(() => {
                this.mostrarMensaje(
                    "La Máquina se reiniciará en 3 segundos.\n"
                );
            }, 2000);

            setTimeout(() => {
                location.reload();
            }, 5000);
        }

        this.mostrarMensaje(mensaje);
    },

    vaciarCarrito: function () {
        this.carrito = [];
        this.actualizarInterfaz();
    },

    mostrarMensaje: function (mensaje) {
        const mensajeDiv = document.createElement("div");
        mensajeDiv.innerHTML = mensaje;
        mensajeDiv.classList.add("retro-message");
        outputDiv.appendChild(mensajeDiv);
    },

    mostrarUltimoProductoComprado: function () {
        const ultimoProductoComprado = localStorage.getItem(
            "ultimoProductoComprado"
        );

        if (ultimoProductoComprado) {
            const fechaHoraCompra = localStorage.getItem("fechaHoraCompra");

            let mensaje = `Último producto comprado: ${decodeURIComponent(
                ultimoProductoComprado
            )}\n`;

            if (fechaHoraCompra) {
                mensaje += `Fecha y hora de la compra: ${fechaHoraCompra}\n`;
            }

            this.mostrarMensaje(mensaje);
        }
    },

    actualizarInterfaz: function () {
        productButtonsDiv.innerHTML = "";
        cartDiv.innerHTML = "";
        paymentForm.innerHTML = "";

        this.mostrarProductos();
    },
};

function inicializarMaquina() {
    fetch("productos.json")
        .then((response) => response.json())
        .then((data) => {
            data.productos.forEach((producto) => {
                maquinaExpendedora.agregarProducto(
                    producto.nombre,
                    producto.numero,
                    producto.precio,
                    producto.stock,
                    producto.conAlcohol
                );
            });

            maquinaExpendedora.mostrarProductos();
        })
        .catch((error) =>
            console.error("Error al cargar el archivo JSON", error)
        );
}

function realizarPago(totalAPagar) {
    maquinaExpendedora.realizarPago(totalAPagar);
}

// ...

function playMainSound() {
    const mainSound = document.getElementById("mainSound");

    // Ajusta el volumen de forma fija (0.2 para un volumen más bajo)
    mainSound.volume = 0.5;

    // Reproduce el sonido
    mainSound.play();

    // Pausar el sonido cuando la pestaña no está visible
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") {
            mainSound.pause();
        } else {
            mainSound.play();
        }
    });
}

playMainSound();

// ...

maquinaExpendedora.mostrarUltimoProductoComprado();
inicializarMaquina();
