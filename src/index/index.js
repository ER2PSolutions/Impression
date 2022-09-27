let $ = jQuery = require('jquery');
const ipcRenderer = window.require('electron').ipcRenderer;




var adresseAPI = "http://apimpression";
//var adresseAPI = "https://apiimpression.leonardo-service.com";


window.addEventListener('DOMContentLoaded', () => {


      ipcRenderer.send('openLogin');

});


