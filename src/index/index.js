const { app } = require('electron');

let $ = jQuery = require('jquery');
const ipcRenderer = window.require('electron').ipcRenderer;


const ipc = window.require('electron').ipcRenderer;
const fs = require('fs');
const path = require('path');
const remote = require ("@electron/remote/main");

const querystring = require('querystring');
let query = querystring.parse(global.location.search);
var ipPublicNow;


//var adresseAPI = "http://apiimpression";
var adresseAPI = "https://apiimpression.leonardo-service.com";


window.addEventListener('DOMContentLoaded', () => {

      
      
      let data = JSON.parse(query['?data']);
      let deconnecte = data.deconnecter;
      let quit=data.quit;
      let ip = data.ip;
      let window = data.window;
   
     if((quit)&&(window=="login")){
            ipcRenderer.send('quit');
     }else{
            if((deconnecte)|| ((quit)&&(window=="childWindow"))){
            
                  let login=data.user.user.login;
                  let domain=data.user.user.domain;
                  let chemin=data.user.user.chemin;
                  let version=data.version;
                  
                  var dataConnexion = new FormData();
                  dataConnexion.append("login", login);
                  dataConnexion.append("domain", domain);
                  dataConnexion.append("version",version);

                  let extIP = require("ext-ip")();
                  var ipP = require("ip");

                  //adresse IP privée
                  var ipPrive = ipP.address();

                  var xhr = new XMLHttpRequest();
                  xhr.withCredentials = true;

                  xhr.addEventListener("readystatechange", function() {
                  if(this.readyState === 4) {
                        
                  }
                  });

                  //connexion à l'API pour validation des identifiants de connexion base Z et récupération des données concernant la connexion à la base de données 
                  xhr.open("POST", adresseAPI+"/connexion.php");    

                  xhr.send(dataConnexion);
                  
                  xhr.onload = function() {

                  
                        
                        var dataResult = JSON.parse(xhr.responseText);
                        
                        if(dataResult.message=='ok'){

                              extIP.get().then(ipPublic => {

                                    ipPublicNow = ipPublic;
                                    debugger;
                                    //récupération des données de la base sur laquelle se connecter en fonction de l'utilisateur
                                    var databdd=new FormData();
                                    databdd.append("dataBase",dataResult.data[0].base);
                                    databdd.append("passwordBase",dataResult.data[0].password);
                                    databdd.append("sous_domaine",dataResult.data[0].sous_domaine);
                                    databdd.append("nameBase",dataResult.data[0].nom);
                                    databdd.append("usernameBase",dataResult.data[0].username);
                                    databdd.append("dsnBase",dataResult.data[0].dsn);
                                    databdd.append("ipPublic", ipPublicNow);
                                    databdd.append("ipPrive", ipPrive);
                                    databdd.append("login", login);
                                    databdd.append("domain", domain);

                                    var xhrListeIp = new XMLHttpRequest();
                                    xhrListeIp.withCredentials = true;
                                    
                                    xhrListeIp.addEventListener("readystatechange", function() {
                                    if(this.readyState === 4) {
                                          
                                    }
                                    });
                                    
                                    //connexion à la base client (base B) pour récupérer les noms des documents
                                    xhrListeIp.open("POST", adresseAPI+"/delete_connexion_ip.php");
                                    
                                    xhrListeIp.send(databdd);

                                    xhrListeIp.onload = function() {

                                          var dataListeIp = JSON.parse(xhrListeIp.responseText);

                                          if(dataListeIp.message=="ok"){
                                                if(quit){
                                                      ipcRenderer.send('quit');
                                                }else{
                                                      ipcRenderer.send('openLogin');
                                                }
                                                
                                          }
                                    }
                              });
                        }
                  }
                        
            

            
            }else{
                  ipcRenderer.send('openLogin');
            }
     }
      
     

});


