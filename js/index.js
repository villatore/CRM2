(function ($) {

    function bindEvents() {
        document.addEventListener('pause', onPause, false);
        document.addEventListener('resume', onResume, false);
        document.addEventListener('online', onOnLine, false);
        document.addEventListener('offline', onOffLine, false);
    }
    function onPause() {
        console.log('Pause');
    }
    function onResume() {
        console.log('Resume');
    }
    function onOnLine() {
        console.log('On Line');
    }
    function onOffLine() {
        alert('Off Line');
        console.log('Off Line');
    }
    function onBatteryCritical() {
        console.log('Batería critica');
    }
    function onBatteryLow() {
        console.log('Bateria baja');
    }
    function onBatteryStatus(info) {
        console.log('Estatus bateria ' + info.level + '%');
    }
    function getDeviceInfo() {
        console.log('Nombre dispositivo: ' + device.name);
        console.log('Cordova: ' + device.cordova);
        console.log('Nombre Plataforma: ' + device.platform);
        console.log('Nombre UUID: ' + device.uuid);
        console.log('Nombre Version: ' + device.version);
    }
    function getConnectionInfo() {
        var networkState = navigator.connection.type;
        var states = {}

        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'Wifi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.NONE] = 'No network connection';

        console.log('Conexion actual: ' + states[networkState]);
    }
    function addCommas(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    function size_object(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }
    $(document).on("pagebeforechange", function () { });

    $(document).on("mobileinit", function () {
        bindEvents();
    });
    // Interface
    $(document).on("pageinit", "#home", function () {
        var user = JSON.parse(localStorage.getItem('user'));
        var ventas = JSON.parse(localStorage.getItem('ventas'));
        var comisiones = JSON.parse(localStorage.getItem('comisiones'));
        var userFirstJson = JSON.parse(localStorage.getItem('userFirstJson'));
        var cantVentas = 10;
            if (ventas != undefined)
                cantVentas =(typeof ventas === 'string') ? 0 : ventas.length;
        //var cantComisiones = (typeof comisiones === 'string') ? 0 : size_object(comisiones.PENDIENTE);
        var cantComisiones = 0;
            if (comisiones != undefined)
                cantComisiones = (typeof comisiones === 'string') ? 0 : size_object(comisiones.PENDIENTE);
        
        if (user != undefined){
            $('.userName').html(user.userName);
            $('.userEmail').html(user.userEmail);
            $('.userSex').html(user.userSex);
            $('.userId').html(user.userId);
        }
        $('.cantVentas').html(cantVentas);
        $('.cantComisiones').html(cantComisiones);
        // Testing sockets.io:
        var socket = io.connect('http://crm20.intelisis.com:8080');
        socket.on('connect', function () {
            console.log('Conectamos con socketIO');
            /**
            * Este evento es recursivo, infinidad de veces
            * esto es por la conexión existente o cuando reconecta.
            */
            var usuario ="";
              if (user != undefined){
                usuario = user.userId + ' - ' + user.userName;
                socket.emit('detect newUser', user.userId);
            } else {
                socket.emit('detect newUser', "0567");
            }
            socket.emit('join', usuario);
            /**
            * Con este parámetro traemos toda la base de datos.
            * de MongoDB
            */
            socket.on('sendFullFirtsUserData', function (data) {
                socket.emit('jsonUser', userFirstJson);
                // data.userId [El único valor que trae]
            });
            // Aviso usuario desconectado
            socket.on('user offline', function (data) {
                console.log('Usuario desconectado ' + data);
            });
        });
        // test butons
        $('.socketIO').on('click', function () {
            console.log('click! .socketIO');
            var uuid = (device.uuid == null) ? navigator.appVersion : device.uuid;
            var details = {
                user: user.userName,
                userId: user.userId,
                acceso: uuid
            };
            //socket.emit('msg', details );
            socket.emit('fullUser data', details);
        });


    });
    /** 
    * Ventas
    */
    $(document).on("pageinit", "#sales", function () {
        var ventas = JSON.parse(localStorage.getItem('ventas')),
            div = $('#detailsSales');
        // 2360 -> string 
        // 0567 -> object
        if ((ventas != null) && (typeof (ventas) === 'object')) {
            var ul = $('<ul/>').addClass('listSales');
            var li = $('<li/>');
            var total = 0, totalPesos = 0, totalDolares = 0;
            var arrClientes = new Array();
            ventas.forEach(function (v, i) {
                var moneda = (v.moneda == "Pesos") ? 'color1' : 'color2';
                var a = $('<a/>', { text: v.nombre,
                    href: '#salesDetail',
                    class: 'salesId',
                    'data-id': i,
                    'data-transition': 'slide'
                });
                $('<span/>', { text: '$ ' + addCommas(v.importe),
                    class: 'ui-li-count ' + moneda}).appendTo(a);
                $('<li/>').html(a).appendTo(ul);
                // Calculo para acumulado monedas (Para la gráfica de pie).
                var importe = parseInt(v.importe)
                if (v.moneda == "Dolares") {
                    var importe = parseFloat(v.importe);
                    var tipoCambio = parseFloat(v.tipoCambio);
                    var cambio = importe * tipoCambio;
                    totalDolares += cambio;
                    total += parseInt(cambio);
                    // [Grafica] Sumamos datos para totalizar la suma por clientes.
                    if (typeof (arrClientes[v.nombre]) === 'undefined') {
                        arrClientes[v.nombre] = cambio;
                    } else {
                        arrClientes[v.nombre] = arrClientes[v.nombre] + cambio;
                    }
                } else {
                    totalPesos += importe;
                    total += importe;
                    // [Grafica] Sumamos datos para totalizar la suma por clientes.
                    if (typeof (arrClientes[v.nombre]) === 'undefined') {
                        arrClientes[v.nombre] = importe;
                    } else {
                        arrClientes[v.nombre] = arrClientes[v.nombre] + importe;
                    }
                }
            });
            $('.salesQuantity').text('$ ' + addCommas(total));
            $('#listSales').html(ul);
            $('.listSales').listview({
                countTheme: "b",
                dividerTheme: "a",
                filter: true,
                icon: "arrow-r",
                filterPlaceholder: "Buscar...",
                autodividers: true
            });
            $('.listSales').listview('refresh');
            // Acciones al presionar el btn generado
            $('.salesId').on('click', function () {
                var salesId = $(this).data('id'),
                    nombre = ventas[salesId].nombre,
                    importe = parseInt(ventas[salesId].importe),
                    moneda = ventas[salesId].moneda,
                    fecha = ventas[salesId].fechaEmision,
                    html = $('<div/>').addClass('ui-grid-a'),
                    referencia = ventas[salesId].referencia,
                    tipoCambio = parseFloat(ventas[salesId].tipoCambio),
                    formatoImporte = '$ ' + addCommas(importe) + ' ' + moneda;
                convesion = Math.round((importe * tipoCambio) * 100) / 100,
                    formatoImporteD = '$ ' + addCommas(convesion) + ' Pesos';
                $(div).html('<h4>' + nombre + '</h4>');
                // línea 1
                $('<div/>', { text: "Venta" }).addClass('ui-block-a').appendTo(html);
                $('<div/>', { text: formatoImporte }).addClass('ui-block-b').appendTo(html);
                $(div).append(html);
                if (moneda == "Dolares") {
                    $('<div/>', { text: "Venta en pesos" }).addClass('ui-block-a').appendTo(html);
                    $('<div/>', { text: formatoImporteD }).addClass('ui-block-b').appendTo(html);
                    $(div).append(html);
                }
                // línea 2
                $('<div/>', { text: "Fecha" }).addClass('ui-block-a').appendTo(html);
                $('<div/>', { text: fecha.substr(0, 11) }).addClass('ui-block-b').appendTo(html);
                $(div).append(html);
                // línea 3
                $('<div/>', { text: "Refencia" }).addClass('ui-block-a').appendTo(html);
                $('<div/>', { text: referencia }).addClass('ui-block-b').appendTo(html);
                $(div).append(html);
            });
            // Graphic Ventas totales Dolares vs Pesos
            porcDlls = Math.round((totalDolares / total) * 100);
            porcPesos = Math.round((totalPesos / total) * 100);
            var data = [{ value: porcDlls, color: "#008EBA" },      // Pesos
                         {value: porcPesos, color: "#008973"}];   // Dolares
            var myPie = new Chart(document.getElementById("graphicSales").getContext("2d")).Pie(data);
            // Graphic Comparativo Ventas
            var color = new RColor;
            var data = [];
            var canvasHtml = $("#graphicComparativeSalesLegend"), ul = $('<ul/>').appendTo(canvasHtml);
            for (x in arrClientes)      //arrClientes creado desde arriba.
            {
                var newColor = color.get(true, 0.3, 0.80);
                data.push({ value: arrClientes[x], color: newColor });
                // Insertando leyenda de la gráfica en el HTML
                var nombre = x;
                var venta = addCommas(parseInt(arrClientes[x]));
                var puntos = (nombre.length > 47) ? '...' : '';

                $('<li class="anchoLinea"><span class="ui-btn-corner-all burbuja2" style="background:' + newColor + ';">$ ' + venta + '</span> ' + nombre.substr(0, 47) + ' ' + puntos + '</li>')
                    .appendTo(ul);
            }
            var myPie2 = new Chart(document.getElementById("graphicComparativeSales").getContext("2d")).Pie(data);
        } else if (typeof (ventas) === 'string') {
            $("<p>No tienes ventas, ¿Eres vendedor?</p>")
                    .appendTo(div);
        }
    });
    /**
    * Comisiones
    */
    function onPhotoSuccess(imageData) {
        var myImage = document.getElementById("myImage");
        myImage.style.display = "block";
        alert("Imagen .. " + myImage.style.display);
        myImage.src = "data:image/jpeg;base64," + imageData;
    }
    function onPhotoFail(message) {
        alert("Failed because: " + message);
    }
    $(document).on("pageinit", "#payments", function () {
        var comisiones = JSON.parse(localStorage.getItem('comisiones'));
        var ul = $('<ul/>').addClass('listPayments'); ;
        var li = $('<li/>');

        navigator.notification.vibrate(500);
        console.log('inicia camara.............');
        navigator.camera.getPicture(onPhotoSuccess, onPhotoFail, { quality: 50 });
        console.log('termina camara.............');

        for (estatus in comisiones) {
            var titulo = estatus.toLowerCase(), titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1) + 's';
            var a = $('<a/>', { text: titulo,
                href: '#paymentsDetails',
                class: 'typePayments',
                'data-estatus': estatus,
                'data-transition': 'slide'
            });
            // Cantidades
            var cantidad = size_object(comisiones[estatus]);
            $('<span/>', { text: cantidad,
                class: 'ui-li-count'
            }).appendTo(a);
            $('<li/>').html(a)
                .appendTo(ul);
        }
        $('#typePayments').html(ul);
        $('.listPayments').listview({
            countTheme: "c",
            dividerTheme: "a",
            filter: false,
            icon: "arrow-r",
            autodividers: false
        });
        $('.listPayments').listview("refresh");

        // Acciones para los botones creados <a href/>
        // #paymentsDetail Creando el contenido
        $('.typePayments').on('click', function () {
            var seleccion = $(this).data('estatus'),
                titulo = $(this).text(),
                titulo = titulo.substr(0, titulo.length - 1).toLowerCase();
            $('.paymentsTitle').html(titulo);

            var ul = $('<ul/>').addClass('detailPayments'), cantidadTotal = 0;
            for (proyecto in comisiones[seleccion]) {
                var obj = comisiones[seleccion], obj = obj[proyecto]; // console.log(JSON.stringify(obj));
                var a = $('<a/>', { text: proyecto,
                    href: '#proyectDetails',
                    class: 'proyectDetail',
                    'data-proyecto': proyecto,
                    'data-transition': 'slide'
                });
                // Cantidades
                var cantidad = 0;
                for (id in obj) {
                    var moneda = obj[id].moneda;
                    var importe = parseInt(obj[id].importe);
                    if (moneda === "Dolares") {
                        importe = importe * obj[id].tipoCambio;
                    }
                    cantidad += importe;
                }
                cantidadTotal += cantidad;
                $('<span/>', { text: ' $ ' + addCommas(cantidad),
                    class: 'ui-li-count'
                }).appendTo(a);
                $('<li/>').html(a)
                        .appendTo(ul);
            }
            $('#paymentsDetail').html(ul);
            $('.paymentsQuantity').html(' $ ' + addCommas(cantidadTotal));
            // Acciones para el boton agregado
            $('.proyectDetail').on('click', function () { // Fix usar antes del listview
                var proyecto = $(this).data('proyecto');
                var obj = comisiones[seleccion], obj = obj[proyecto];
                var total = 0;
                $('.proyectTitle').html(proyecto);
                var div = $('#proyectDetail'),
                    div2 = $('<div/>', { 'data-role': 'content' }),
                    div3 = $('<div/>').addClass('bubble-a'),
                    cA1 = 'ui-block-a', cB1 = 'ui-block-b',
                    cR1 = 'crm20-col-c', cR2 = 'crm20-col-d',
                    wrap = 'wrap',
                    bubble = $('<div/>').addClass('bubble');
                div.html('');
                for (id in obj) {
                    var importe = parseInt(obj[id].importe);
                    $('<div/>').addClass(cA1).addClass(cR1).addClass(id).text('Refencia').appendTo(div3);
                    $('<div/>').addClass(cB1).addClass(cR2).addClass(id).text(obj[id].referencia).appendTo(div3);
                    $('<div/>').addClass(cA1).addClass(cR1).addClass(id).text('Fecha').appendTo(div3);
                    $('<div/>').addClass(cB1).addClass(cR2).addClass(id).text(obj[id].fechaEmision).appendTo(div3);
                    $('<div/>').addClass(cA1).addClass(cR1).addClass(id).text('Importe').appendTo(div3);
                    $('<div/>').addClass(cB1).addClass(cR2).addClass(id).text('$ ' + addCommas(importe) + ' ' + obj[id].moneda).appendTo(div3);
                    $('<div/>').addClass(cA1).addClass(cR1).addClass(id).text('Obs').appendTo(div3);
                    $('<div/>').addClass(cB1).addClass(cR2).addClass(id).text(obj[id].observaciones).appendTo(div3);
                    total += importe;
                    div3.appendTo(div2);
                    div2.appendTo(div);
                    $('.' + id).wrapAll(bubble);
                }
                $('.proyectQuantity').html('$ ' + addCommas(total));

            });
            $('.detailPayments').listview({
                countTheme: "b",
                dividerTheme: "a",
                filter: true,
                icon: "arrow-r",
                filterPlaceholder: "Buscar...",
                autodividers: false
            });
            $('.detailPayments').listview('refresh');
        });
    });
    $(document).on("pageinit", "#paymentsDetails", function () {
        $('.detailPayments').listview({
            countTheme: "b",
            dividerTheme: "a",
            filter: true,
            icon: "arrow-r",
            filterPlaceholder: "Buscar...",
            autodividers: false
        });
        $('.detailPayments').listview('refresh');
    });
    $(document).on("pageinit", "#pruebaws", function () {
        $('.detailPayments').listview({
            countTheme: "b",
            dividerTheme: "a",
            filter: true,
            icon: "arrow-r",
            filterPlaceholder: "Buscar...",
            autodividers: false
        });
        $('.detailPayments').listview('refresh');
    });
})(jQuery);

function GEOL(){
    navigator.geolocation.getCurrentPosition(onSuccessGeo, onErrorGeo);
}
// Run after successful transaction
// Let's display the position data
function onSuccessGeo(position) {
    var geoElement = document.getElementById('geolocationData');
    geoElement.innerHTML =
    'Latitude: ' + position.coords.latitude + '<br />' +
    'Longitude: ' + position.coords.longitude + '<br />' +
    'Altitude: ' + position.coords.altitude + '<br />' +
    'Accuracy: ' + position.coords.accuracy + '<br />' +
    'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
    'Heading: ' + position.coords.heading + '<br />' +
    'Timestamp: ' + position.timestamp + '<br />';
}
// Run if we face an error
// obtaining the position data
function onErrorGeo(error) {
    var errString = '';
    // Check to see if we have received an error code
    if(error.code) {
        // If we have, handle it by case
        switch(error.code){
            case 1: // PERMISSION_DENIED
            errString =
                'Unable to obtain the location information ' +
                'because the device does not have permission '+
                'to the use that service.';
            break;
            case 2: // POSITION_UNAVAILABLE
            errString =
                'Unable to obtain the location information ' +
                'because the device location could not ' +
                'be determined.';
            break;
            case 3: // TIMEOUT
            errString =
                'Unable to obtain the location within the ' +
                'specified time allocation.';
            break;
            default: // UNKOWN_ERROR
            errString =
                'Unable to obtain the location of the ' +
                'device due to an unknown error.';
            break;
        }//case
    }//if
    // Handle any errors we may face
    document.getElementById('geolocationData').innerHTML = errString;
}//fin
function Resta() {
    var Cantidad = parseInt($("#cantidad")[0].innerHTML);
    if (Cantidad > 1) $("#cantidad")[0].innerHTML = Cantidad - 1
    $("#total")[0].innerHTML = parseInt($("#cantidad")[0].innerHTML) * parseInt($("#precio")[0].innerHTML);
}
function Suma() {
    var Cantidad = parseInt($("#cantidad")[0].innerHTML);
    $("#cantidad")[0].innerHTML = Cantidad + 1;
    $("#total")[0].innerHTML = parseInt($("#cantidad")[0].innerHTML) * parseInt($("#precio")[0].innerHTML);
}
function LimpiaProducto() {
        $("#cantidad")[0].innerHTML = 0;
        $("#precio").html(0);
        $("#unidad").html("");
        Resta();
}
        function Muestra(){
            $.mobile.changePage('#paymentsDetails');
            $("#contents").html("");
            var url = $("#qrSKU")[0].value;
            var target_div = "#contents";
            readSinglePost(url, target_div);

            function readSinglePost(URL, target_div) {
                $("#title").html("");
                escribeEstado("Consultando .... ");
                $("#cantidad")[0].innerHTML = 1;
                Resta();
                $.ajax({
                    url: URL,
                    dataType: 'json',
                    success: function(data) {
                        if (data.status != "error") {
                            $("#title").html(data.post.title);
                            $(target_div).append(data.post.content);
                            $(target_div).append("<small>" + data.post.date + "</small>");
                            $("#precio").html(data.post.id);
                            $("#unidad").html(data.post.comment_status);
                            console.log(data.post);
                            Resta();
                            escribeEstado("");
                            ExisteProducto=true;
                        } else {
                            LimpiaProducto();
                            $("#title").html("<a style='color:#FF0000'>Está información no fue encontrada, consulte a su asesor...</a>");
                            ExisteProducto=false;
                        }
                        escribeEstado("");
                    } //fin sucess
                }).fail(function(data) {
                    ExisteProducto=false;
                    if (console && console.log) {
                        escribeEstado("Error al conectarse al servidor");
                    }
                });
            };
            function escribeEstado(Texto) {
                $("#Estado").html(Texto);
            }
        };
var ExisteProducto = false;