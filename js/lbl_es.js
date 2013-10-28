var l8n = {
    "en-US": {
        "#version": "Version 0.0.1en",
        "#ajustes": "Settings",
        "#per": "Rol"
        "#sal" : "Exit"
    },
    "es": { //español
    },
    "es-419": { //español - latinoamerica
        "#version": "Version 0.0.1es",
        "#ajustes": "Ajusteses"
        "#per": "Perfil"
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
}
function Etiqueta(key) {
    var lenguaje = "en-US"; //idioma por default
    if (l8n[window.navigator.language])
        lenguaje = window.navigator.language;
    if (window.navigator && l8n[lenguaje]) {
        document.querySelector(key).textContent = l8n[lenguaje][key];
    }
}