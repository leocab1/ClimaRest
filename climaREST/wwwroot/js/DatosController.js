
var fecha;
var hoy;
var hora;

window.onload = function () {
    $('#CiudadFecha').css('visibility', 'hidden');

    //Ciudad, Fecha y Hora
    fecha = new Date();
    hoy = fecha.toLocaleDateString();
    //console.log(hoy);
    hora = fecha.toLocaleTimeString('en-US');
    //console.log(hora);
}

document.addEventListener('DOMContentLoaded', () => {
    // Verifica si el navegador soporta la API de notificaciones
    if (!("Notification" in window)) {
        console.error("Este navegador no soporta notificaciones de escritorio.");
        return;
    }

    // Solicitar permiso para enviar notificaciones
    if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Permiso para notificaciones concedido.");
                // Lanzar una notificación cuando se concede el permiso
                mostrarNotificacion(
                    "Notificaciones activadas",
                    "Gracias por permitir recibir información adicional con datos climatológicos."
                );
            } else if (permission === "denied") {
                console.warn("Permiso para notificaciones denegado.");
            }
        });

        // Mensaje personalizado en el cuadro de permiso
        alert("¿Desea qué se le envíe información adicional con datos climatológicos?");
    } else if (Notification.permission === "granted") {
        // Si ya se concedió el permiso previamente
       
    }
});

// Función para mostrar una notificación
function mostrarNotificacion(titulo, mensaje) {
    // Crear una nueva notificación
    const opciones = {
        body: mensaje,
        icon: "https://via.placeholder.com/100" // URL de un ícono opcional
    };
    new Notification(titulo, opciones);
}

function obtenerPronosticoOpenMeteo() {
    let latitud = document.getElementById('lat').value;
    let longitud = document.getElementById('lon').value;
    let ciudadCaptura = document.getElementById('city').value;

    // Obtener la hora actual
    const ahora = new Date();
    const horaActual = ahora.getHours(); // Hora en formato de 24 horas

    // URL para obtener el pronóstico de temperatura de Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&hourly=temperature_2m&forecast_days=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Buscar la hora más cercana en el pronóstico
            let indiceHoraActual = data.hourly.time.findIndex(time => {
                const horaPronostico = new Date(time).getHours();
                return horaPronostico === horaActual;
            });

            // Si no se encuentra la hora exacta, tomar la hora más cercana
            if (indiceHoraActual === -1) {
                // Si no encontramos la hora exacta, tomamos la primera hora disponible
                indiceHoraActual = 0;
            }

            // Tomar las siguientes 3 horas de pronóstico
            let pronostico = "";
            let horas = data.hourly.temperature_2m.slice(indiceHoraActual + 1, indiceHoraActual + 4); // Las siguientes 3 horas
            let horasPronostico = data.hourly.time.slice(indiceHoraActual + 1, indiceHoraActual + 4); // Horas de los pronósticos

            // Crear el pronóstico de las 3 horas
            horas.forEach((temp, index) => {
                // Convertir la hora del pronóstico de 24 horas a 12 horas con AM/PM
                let hour = new Date(horasPronostico[index]).getHours();
                let suffix = hour >= 12 ? 'pm' : 'am';
                hour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour); // Asegurarnos que 0 horas se muestre como 12 (medianoche)

                pronostico += `${hour} ${suffix}: ${temp}°C\n`;
            });

            // Mostrar la notificación con el pronóstico
            const ciudad = ciudadCaptura; // Puedes obtener esto de tus datos
            const titulo = `${ciudad} (Pronóstico)`;
            mostrarNotificacionClima(titulo, `Temperaturas:\n${pronostico}`, "URL_de_imagen"); // Reemplaza con el ícono que quieras mostrar

        })
        .catch(error => {
            console.error("Error al obtener el pronóstico:", error);
        });
}

function mostrarNotificacionClima(titulo, mensaje, icono) {
    // Crear una nueva notificación
    const opciones = {
        body: mensaje,
        icon: "image/clima.png", // Aquí va el ícono de clima
    };
    new Notification(titulo, opciones);
}

function DatosClimaControlador() {
    var Mensaje;

    let latitud = document.getElementById('lat').value;
    let longitud = document.getElementById('lon').value;
  

    if (latitud == '' || longitud =='') {
        Mensaje = 'Escriba el nombre de una ciudad';
        MuestraToast(Mensaje);
    }
    else {
        var urlCompleta = window.location.protocol + "//" + window.location.host + "/Home/AlmacenaDatosClima?latitud=" + latitud + "&longitud=" + longitud
        fetch(urlCompleta)
            .then(response => response.json())
            .then(data => {
                if (data.length == 0) {
                    Mensaje = 'Error';
                    MuestraToast(Mensaje);
                }
                else {
                    document.getElementById("nombreciudad").innerText = data[0].climaCiudad;
                    document.getElementById("descripcion").innerText = data[0].climaDescripcion;
                    document.getElementById("imagen").src = data[0].imagen;
                    document.getElementById("temp").innerText = data[0].temperatura;
                    document.getElementById("nubocidad").innerText = data[0].porcentajeNubes;
                    document.getElementById("viento").innerText = data[0].viento;
                    document.getElementById("humedad").innerText = data[0].porcentajeHumedad;
                    document.getElementById("datosAdicionales").disabled = false;
                    document.getElementById("datosAdicionales").classList.remove("disabled");


                    //Convertir timestamp a fecha
                    var HoraNormal = new Date(data[0].amanecer * 1000).toLocaleTimeString();
                    console.log(HoraNormal);
                    document.getElementById("amanecer").innerText = HoraNormal;
                    HoraNormal = new Date(data[0].ocaso * 1000).toLocaleTimeString();
                    document.getElementById("ocaso").innerText = HoraNormal;

                    //Ciudad, Fecha y Hora
                    document.getElementById("Ciudad").innerText = data[0].climaCiudad;
                    document.getElementById("FechaHora").innerText = hoy + "--" + hora;
                    $('#CiudadFecha').css('visibility', 'visible');

                    // Cargar un nuevo video aleatorio
                    cargarVideoAleatorio();
                }
            })
            .catch(error => {
                Mensaje = 'No tiene conexion a Internet';
                MuestraToast(Mensaje);
                console.log(error.message);
            });
    }
}

const videoIds = [
    "gXFLW61OL0k",
    "GxWohx1_VOw",
    "utl7t8G2nTY"  
];

let player;

// Función para cargar un nuevo video en el reproductor
function cargarVideoAleatorio() {
    if (!navigator.onLine) {
        // Si no hay conexión, ocultar el reproductor
        document.getElementById('youtubePlayerContainer').style.display = 'none';
        return;
    }

    // Si hay conexión, mostrar el reproductor
    document.getElementById('youtubePlayerContainer').style.display = 'block';

    const randomVideoId = videoIds[Math.floor(Math.random() * videoIds.length)];
    if (player) {
        player.loadVideoById(randomVideoId);
    } else {
        player = new YT.Player('player', {
            height: '360',
            width: '640',
            videoId: randomVideoId,
            events: {
                onReady: (event) => event.target.playVideo(),
            }
        });
    }
}

// Cargar la API de YouTube
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Detectar cuando la API de YouTube esté lista
function onYouTubeIframeAPIReady() {
    cargarVideoAleatorio();
}

// Detectar cambios en la conexión
window.addEventListener('online', () => {
    cargarVideoAleatorio(); // Reintentar cargar el video cuando vuelva la conexión
});

window.addEventListener('offline', () => {
    document.getElementById('youtubePlayerContainer').style.display = 'none'; // Ocultar el reproductor sin conexión
});

function getGeolocation() {
    return new Promise((resolve, reject) => {
        let Mensaje;
        let ciudadCaptura = document.getElementById('city').value;
        let countryCodeCaptura = document.getElementById('countryCode').value;

        // Verifica si el valor es diferente de "MX"
        if (countryCodeCaptura !== "MX") {
            // Oculta el elemento con el ID 'precGasolins'
            document.getElementById('precGasolina').style.display = 'none';
        } else {
            // Muestra el elemento (opcional si necesitas volver a mostrarlo)
            document.getElementById('precGasolina').style.display = 'block';
        }

        if (ciudadCaptura == '') {
            Mensaje = 'Escriba el nombre de una ciudad';
            MuestraToast(Mensaje);
            reject(new Error(Mensaje));
        } else {
            var urlCompleta = window.location.protocol + "//" + window.location.host + "/Home/AlmacenaDatosGeo?Ciudad=" + encodeURIComponent(ciudadCaptura) + "&countrycode=" + encodeURIComponent(countryCodeCaptura);

            fetch(urlCompleta)
                .then(response => response.json())
                .then(data => {
                    if (!data || data.length == 0) {
                        Mensaje = 'Ciudad no encontrada o error en la geolocalización';
                        MuestraToast(Mensaje);
                        reject(new Error(Mensaje));
                    } else {
                        document.getElementById("lat").value = data[0].lat;
                        document.getElementById("lon").value = data[0].lon;
                        $('#CiudadGeo').css('visibility', 'visible');
                        resolve(); // Resolviendo después de actualizar lat/lon
                    }
                })
                .catch(error => {
                    Mensaje = 'No tiene conexión a Internet o hubo un error al cargar los datos.';
                    MuestraToast(Mensaje);
                    reject(error);
                });
        }
    });
}

function consumirApiGoogleMaps() {
    var mensaje;

    let latitud = document.getElementById('lat').value;
    let longitud = document.getElementById('lon').value;

    if (latitud == '' || longitud == '') {
        mensaje = 'Escriba el nombre de una ciudad';
        MuestraToast(mensaje);
    } else {
        var urlCompleta = window.location.protocol + "//" + window.location.host + "/Home/AlmacenaDatosGoogleMaps?latitud=" + latitud + "&longitud=" + longitud;

        // Hacer la solicitud a la API
        fetch(urlCompleta)
            .then(response => response.text())  // Recibe la respuesta como texto
            .then(url => {
                if (!url || url.trim() === '') {
                    mensaje = 'Ciudad no encontrada o error en la geolocalización';
                    MuestraToast(mensaje);
                } else {
                    // Asignar la URL al iframe de Google Maps
                    document.getElementById("frameGoogleMaps").src = url;
                }
            })
            .catch(error => {
                // Manejar errores de conexión o de la API
                mensaje = 'No tiene conexión a Internet o hubo un error al cargar los datos.';
                MuestraToast(mensaje);
            });
    }
}

function consumirApiGasolinas() {
    var mensaje;

    let ciudad = document.getElementById('city').value.trim(); // Obtiene y limpia el valor

    if (ciudad === '') {
        mensaje = 'Escriba el nombre de una ciudad';
        MuestraToast(mensaje);
    } else {
        // Construir la URL para la consulta
        var urlCompleta = window.location.protocol + "//" + window.location.host + "/Home/AlmacenaDatosGasolinas?ciudad=" + ciudad;

        // Hacer la solicitud a la API
        fetch(urlCompleta)
            .then(response => response.text())  // Recibe la respuesta como texto
            .then(url => {
                if (!url || url.trim() === '') {
                    mensaje = 'Estado no encontrado o error en los datos de gasolinas';
                    MuestraToast(mensaje);
                } else {
                    // Asignar la URL al iframe para mostrar los datos
                    document.getElementById("frameGasolinas").src = url;
                }
            })
            .catch(error => {
                // Manejar errores de conexión o de la API
                mensaje = 'No tiene conexión a Internet o hubo un error al cargar los datos.';
                MuestraToast(mensaje);
            });
    }
}

function consumirApiConversor() {
    var Mensaje;

    let bases = document.getElementById('fromCurrency').value;
    let target = document.getElementById('toCurrency').value;
    let cantidad = document.getElementById('amount').value;

    // Validación de campos
    if (bases == '' || target == '' || cantidad == '') {
        Mensaje = 'Ingrese los datos';
        MuestraToast(Mensaje);
    } else {
        var urlCompleta = window.location.protocol + "//" + window.location.host + "/Home/AlmacenaDatosConversor?bases=" + bases + "&target=" + target + "&cantidad=" + cantidad;

        fetch(urlCompleta)
            .then(response => response.json())
            .then(data => {
                if (!data || data.length === 0) {
                    Mensaje = 'Error en la conversión';
                    MuestraToast(Mensaje);
                } else {
                    // Mostrar el resultado en el modal de resultados
                    let resultado = data.res;
                    document.getElementById('conversionResult').innerText = `Resultado: ${cantidad} ${bases} = ${resultado} ${target}`;

                    // Ocultar el modal de conversión
                    var convertModal = new bootstrap.Modal(document.getElementById('exampleModal'));
                    convertModal.hide();

                    // Mostrar el modal con el resultado
                    var resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
                    resultModal.show();
                }
            })
            .catch(error => {
                Mensaje = 'No tiene conexión a Internet';
                MuestraToast(Mensaje);
                console.log(error.message);
            });
    }
}





async function ejecutarConsultas() {
    try {
        await getGeolocation(); 
        DatosClimaControlador(); 
        consumirApiGoogleMaps();
        consumirApiGasolinas();
    } catch (error) {
        console.error("Error:", error.message);
    }
}


/*FUNCIONES PARA LA CAMARA */

var streaming = false,
    video = document.querySelector("#video"),
    canvas = document.querySelector("#canvas"),
    photo = document.querySelector("#photo"),
    startbutton = document.querySelector("#startbutton"),
    downloadbutton = document.querySelector("#btnDownloadImage"),
    deletebutton = document.querySelector("#btnDeleteImage"),
    width = 320,
    height = 0;

navigator.getMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;


navigator.getMedia(
    {
        video: true,
        audio: false,
    },
    function (stream) {
        if (navigator.mozGetUserMedia) {
            video.mozSrcObject = stream;
        } else {
            var vendorURL = window.URL || window.webkitURL;
            video.srcObject = stream;
        }
        video.play();
    },

    function (err) {
        console.log("A ocurrido un Error!  " + err);
    }
);

video.addEventListener(
    "canplay",
    function (ev) {
        if (!streaming) {
            height = video.videoHeight / (video.videoHeight / width);
            video.setAttribute("width", width);
            video.setAttribute("height", height);
            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);
            streaming = true;
        }
    },
    false,
);


function takepicture() {
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(video, 0, 0, width, height);
    var data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
}


startbutton.addEventListener(
    "click",
    function (ev) {
        takepicture();
        deletebutton.classList.remove("disabled");
        downloadbutton.classList.remove("disabled");
        ev.preventDefault();
    },
    false,
);


btnDownloadImage.addEventListener("click", () => {
    var link = document.getElementById('btnDownloadImage');
    link.download = 'ImagenCapturada.png';
    link.href = canvas.toDataURL();
});


deletebutton.addEventListener("click", function (ev) {
    let lienzo = canvas.getContext("2d");
    lienzo.clearRect(0, 0, canvas.width, canvas.height);
    photo.setAttribute('src', "");
    deletebutton.classList.add("disabled");
    downloadbutton.classList.add("disabled");
    ev.preventDefault();
});

/* FIN FUNCIONES PARA LA CAMARA */




window.ononline = function () {
    document.getElementById('conexion').innerHTML = "<p class='text-success'>conectado a internet</p>"
}

window.onoffline = function () {
    document.getElementById('conexion').innerHTML = "<p class='text-danger'>sin conexión a internet</p>"
}

function MuestraToast(Mensaje) {
    document.getElementById('msjnotif').innerHTML = Mensaje;
    let myAlert = document.querySelector('.toast');
    let bsAlert = new bootstrap.Toast(myAlert, { autohide: true, delay: 2000 });
    bsAlert.show();
}