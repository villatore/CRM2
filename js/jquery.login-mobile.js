/**
 * Develop by Carlos Lima <clima@intelisis.com> | <clima@nucliux.com>
 * Login desing based on webpage: http://tympanus.net/codrops/2012/10/16/custom-login-form-styling/
 * @package crm20 mobile version 1.0
 */
;(function($){
    var defaults = {
        class: "crm20-login",
        cssForm: "crm20-form",
        urlLogo: "img/qrlogo.png",
        title1: "Bienvenido",
        title2: "a",
        title3: "Cart",
        userName: "Usuario",
        passName: "Contraseña",
        inputUserName: "Usuario",
        inputPassName: "Contraseña",
        formName: "Usuario[usuarioweb]",
        formPass: "Usuario[contrasena]",
        btnValue: "Acceder",
        classInfo: "crm20-informacion",
        hideNotice: "crm20-hide",
        errorEmptyValues: "No se permiten campos vacíos.",
        errorLogin: "Usuario o contraseña no válidos",
        errorClassArea: "crm20-error",
        ajaxOptions: {
            url: "http://crm20.intelisis.com/api/usuarios/login/",
            type: "GET",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            dataType:"jsonp",
            jsonpCallback: "crm20Login",
            crossDomain: true,
        },
        test: function() { // this.config.test();
            alert('function test');
        }
    }
    function crm20 (element, options)
    {   var widget     = this;
        widget.config  = $.extend(true,{}, defaults, options);
        widget.element = element;

        // Envio del formulario
        var errorShow   = true;
        widget.element.on("submit",function(e) { 
            e.preventDefault();
            var form = $(this);
            // Validar campos no vacíos
            var errorClassArea = widget.config.errorClassArea;
            var elemntsForm    = $(this).find('input[name]');
            var errorArea      = $(this).find('.clearfix');

            // Fix Impide que se multipliquen los avisos de errores.
            var findError      = $(this).find('.'+errorClassArea).attr('style');
            var errShowActive  = false; 
            if (typeof findError != 'undefined') {
                errorShow = (findError.length == 14 ) ? true : false;
                errShowActive = true;
            }

            $.each(elemntsForm,function() {
                if ( $(this).val().length == 0 && errorShow == true ) {
                     $('<p/>',{text:widget.config.errorEmptyValues,'class':'crm20-aviso crm20-fallo'})
                                .addClass(errorClassArea)
                                .fadeIn('slow')
                                .prependTo(errorArea);
                
                widget.hideError(errorClassArea);
                errorShow = false;
                }
            });
            // Fix esconde el error 
            if (errShowActive == true ) {
               $('.'+errorClassArea).fadeOut();
               errShowActive = false;
               errorShow = true;
            }
            // Envío de datos
            if (errorShow == true) {
                //TODO crear un aviso
                $('.crm20-informacion').fadeIn();
                var dataObj = {
                    data: {
                        usuario:  widget.element.find('.user').eq(1).val(),
                        password: widget.element.find('.pass').eq(1).val()
                    }
                }
                var ajaxSettings = $.extend({}, widget.config.ajaxOptions, dataObj);
                $.ajax(ajaxSettings);
            }
             return false;
        });
        this.init();
    }

    crm20.prototype.init = function()
    {   this.element.addClass(this.config.class);
        // Imatge superior
        var p = $("<p/>").addClass('center');
        $("<img/>",{
            src: this.config.urlLogo
        }).addClass('crm20-logo')
          .fadeIn(5000)
          .appendTo(this.element);
        $('.crm20-logo').wrapAll(p);
        // Fotmulari  d'entrada
        var form     = $('<form/>').addClass(this.config.cssForm).appendTo(this.element);
        var cf       = this.config;
        var i2       = cf.inputPassName;
        var t1       = cf.title1;
        var t2       = cf.title2;
        var t3       = cf.title3;
        var f1       = cf.formName;
        var f2       = cf.formPass;
        var btnValue = cf.btnValue;
        var hide     = cf.hideNotice;
        var info     = cf.classInfo;
        var p        = $('<p/>').addClass('float');
        var p2       = $('<p/>').addClass('float2');
        var clearfix = $('<p/>').addClass('clearfix');
        var iconUser = $('<i/>').addClass('icon-user');
        var iconLock = $('<i/>').addClass('icon-lock');
        // Titulo
        $("<h1><span class='log-in'>"+t1+"</span> "+t2+" <span class='sign-up'>"+t3+"</span>'").appendTo(form);
        // Usuari
        $('<label/>',{text:cf.userName,'for':cf.userName}).addClass('user').appendTo(form);
        $('<input/>',{type:'text',placeholder:cf.inputUserName,name:f1}).addClass('user').appendTo(form);
            $('.user').wrapAll(p);
            $('.user').first().prepend(iconUser);
        // Contrasenya
        $('<label/>',{text:cf.passName,'for':cf.passName}).addClass('pass').appendTo(form);
        $('<input/>',{type: 'password',placeholder:i2,name:f2}).addClass('pass').appendTo(form);
            $('.pass').wrapAll(p);
            $('.pass').first().prepend(iconLock);
        // Avisos
        $('<p/>',{text:'Enviando información'}).addClass(cf.hideNotice).addClass(info).appendTo(form);
        $('<p/>',{text:cf.errorLogin,'class':'crm20-aviso crm20-fallo'}).addClass(cf.hideNotice).addClass(cf.errorClassArea).appendTo(form);
            $('.'+cf.hideNotice).wrapAll(p2);
        // Enviar
        ($('<input/>',{type:'submit',text:btnValue,value:btnValue}).appendTo(form)).wrapAll(clearfix);
    };

    crm20.prototype.slideIn = function() {

        this.element.fadeIn( 4000 );
    }
    crm20.prototype.hideError = function(id) {
        $('.' + id).on('click',function(){
            $(this).fadeOut();
        });
    }
    $.fn.crm20 = function (options) {
        new crm20(this.first(),options);
        return this.first();
        document.addEventListener('crm20MobileLogin',crm20Login,false);
    }
}(jQuery));
function crm20Login(json) {
    if (json.login == 'Correcto'){
        var jsonUser = {  id: json.userId,
                            user: json,
                            ventas: json.ventas,
                            comisiones: json.comisiones
                        };
        delete jsonUser.user['ventas'];
        delete jsonUser.user['comisiones'];
        window.localStorage.setItem("userFirstJson",JSON.stringify(jsonUser)); // para MongoDB
        window.localStorage.setItem("uuid",device.uuid);
        window.localStorage.setItem("ventas",JSON.stringify(jsonUser.ventas));
        window.localStorage.setItem("comisiones",JSON.stringify(jsonUser.comisiones));
        delete json['ventas'];
        delete json['comisiones'];
        window.localStorage.setItem("user",JSON.stringify(json));
        $.mobile.changePage('#home');
    } else {
        // TODO Error 
        // hide information:
        $('.crm20-informacion').fadeOut();
        $('.crm20-hide').eq(1).show(0).delay(5000).hide(0);
    }
}
function crm20Exit() {
    //localStorage.clear();
    //$.mobile.changePage('#index');
    //location.reload();
    alert ("Cerrara app");
    if(navigator.app){
            navigator.app.exitApp();
    }else if(navigator.device){
            navigator.device.exitApp();
    }
}