class Producto {
    constructor(nombre, numero, precio, stock, conAlcohol) {
        this.nombre = nombre;
        this.numero = numero;
        this.precio = precio;
        this.stock = stock;
        this.conAlcohol = conAlcohol;
    }
}

class MaquinaExpendedora {
    constructor() {
        this.productos = [];
        this.carrito = [];
        this.outputDiv = document.getElementById("output");
        this.productButtonsDiv = document.getElementById("product-buttons");
        this.cartDiv = document.getElementById("cart");
        this.paymentForm = document.getElementById("payment-form");
        this.initializeStyles();
        this.initializeSounds();
    }

    initializeStyles() {
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

        this.addStyleToHead(estiloCarrito, "carrito-style");
        this.addStyleToHead(estiloFormularioPago, "pago-style");
    }

    addStyleToHead(style, id) {
        const styleElement = document.createElement("style");
        styleElement.innerHTML = style;
        styleElement.id = id;
        document.head.appendChild(styleElement);
    }

    initializeSounds() {
        const buySound = new Audio("./assets/sounds/buttonBeepHigh.wav");
        const paySound = new Audio("./assets/sounds/coinInsert.wav");
        const mainSound = new Audio("./assets/sounds/hum.wav");

        this.sounds = {
            buySound,
            paySound,
            mainSound,
        };
    }

    reproducirSonidoPagar() {
        const paySound = this.sounds.paySound;
        if (paySound) {
            paySound.volume = 0.3;
            paySound.play();
        }
    }

    agregarProducto(nombre, numero, precio, stock, conAlcohol) {
        const producto = new Producto(
            nombre,
            numero,
            precio,
            stock,
            conAlcohol
        );
        this.productos.push(producto);
    }

    mostrarProductos() {
        this.productos.length === 0
            ? this.mostrarMensaje(
                  "No hay productos disponibles en la máquina expendedora.\n"
              )
            : this.productos.forEach((producto) => {
                  this.crearBotonProducto(producto);
              });
    }

    crearBotonProducto(producto) {
        const botonProducto = document.createElement("button");
        botonProducto.textContent = `Comprar ${
            producto.nombre
        } - $${producto.precio.toFixed(2)}`;
        botonProducto.addEventListener("click", () => {
            this.agregarAlCarrito(producto);
            this.reproducirSonido("buySound");
        });
        this.productButtonsDiv.appendChild(botonProducto);
    }

    reproducirSonido(soundId) {
        const sound = this.sounds[soundId];

        if (sound) {
            const newSound = sound.cloneNode(true);
            newSound.volume = 0.1;
            newSound.play();
        }
    }

    agregarAlCarrito(producto) {
        const index = this.carrito.findIndex(
            (item) => item.numero === producto.numero
        );

        if (index !== -1) {
            this.carrito[index].stock += 1;
            this.carrito[index].precioTotal =
                this.carrito[index].stock * producto.precio;
        } else {
            const nuevoProducto = {
                ...producto,
                stock: 1,
                precioTotal: producto.precio,
            };
            this.carrito.push(nuevoProducto);
        }

        this.mostrarCarrito();

        Toastify({
            text: `${producto.nombre} agregado al carrito`,
            duration: 3000,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                color: "#ffffffd0",
                fontFamily: "'Courier New', monospace",
                background: "#333333",
            },
        }).showToast();

        localStorage.setItem(
            "ultimoProductoComprado",
            encodeURIComponent(producto.nombre)
        );
    }

    mostrarCarrito() {
        this.cartDiv.innerHTML = "";

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

            this.cartDiv.appendChild(productoDiv);

            totalCompra += producto.precioTotal;
        });

        this.cartDiv.innerHTML += `<br><span class="carrito-item">Total de la compra: $${totalCompra.toFixed(
            2
        )}</span><br>`;

        this.mostrarFormularioPago(totalCompra);
    }

    mostrarFormularioPago(totalAPagar) {
        const paymentFormHTML = `
            <div class="payment-form">
                <label for="payment-amount">Ingrese el monto a pagar: $</label>
                <input type="number" id="payment-amount" step="0.01" required>
                <button type="button" onclick="realizarPago(${totalAPagar})">Pagar</button>
            </div>
        `;
        this.paymentForm.innerHTML = paymentFormHTML;
    }

    realizarPago(totalAPagar) {
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

            this.reproducirSonidoPagar();

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
    }

    vaciarCarrito() {
        this.carrito = [];
        this.actualizarInterfaz();
    }

    mostrarMensaje(mensaje) {
        const mensajeDiv = document.createElement("div");
        mensajeDiv.innerHTML = mensaje;
        mensajeDiv.classList.add("retro-message");
        this.outputDiv.appendChild(mensajeDiv);
    }

    mostrarUltimoProductoComprado() {
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
    }

    actualizarInterfaz() {
        this.productButtonsDiv.innerHTML = "";
        this.cartDiv.innerHTML = "";
        this.paymentForm.innerHTML = "";

        this.mostrarProductos();
    }
}

function inicializarMaquina() {
    fetch("productos.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
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

function playMainSound() {
    const mainSound = document.getElementById("mainSound");

    mainSound.volume = 0.5;
    mainSound.play();

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") {
            mainSound.pause();
        } else {
            mainSound.play();
        }
    });
}

playMainSound();

const maquinaExpendedora = new MaquinaExpendedora();
maquinaExpendedora.mostrarUltimoProductoComprado();
inicializarMaquina();
