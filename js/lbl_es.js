var l8n = {
    "en-US": {
        "#version": "Version 0.0.1en",
        "#ajustes": "Settings",
        "#per": "Rol",
        "#sal" : "Exit"
    },
    "es": { //español
    },
    "es-419": { //español - latinoamerica
        "#version": "Version 0.0.1es",
        "#ajustes": "Ajustes",
        "#per": "Perfil",
        "#sal" : "Salida"
    },
    "ko": {
        ".email": "",
        ".contactinfo h5": ""
    }
}

function Textos() {
    l8n["es"] = l8n["es-419"];
    Etiqueta("#version");
    Etiqueta("#ajustes");
    Etiqueta("#per");
    Etiqueta("#sal");
}
function Etiqueta(key) {
    var lenguaje = "en-US"; //idioma por default
    var i = 0;
    if (l8n[window.navigator.language])
        lenguaje = window.navigator.language;

    /*Probar esto
    for (i = 0; size_object(l8n[lenguaje]); i++) {
    var key = l8n[lenguaje][i];
    document.querySelector(key).textContent = l8n[lenguaje][key];
    }*/
    
    if (window.navigator && l8n[lenguaje]) {
        document.querySelector(key).textContent = l8n[lenguaje][key];
    }
}