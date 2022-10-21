let $ = jQuery = require('jquery');
const ipc = window.require('electron').ipcRenderer;
const fs = require('fs');
const path = require('path');
const remote = require ("@electron/remote/main");
$('body').on('click', '#connecter', function (e) { connexion(); });
const querystring = require('querystring');
let query = querystring.parse(global.location.search);
let dataNew = JSON.parse(query['?data']);
let version=dataNew.version;
let getConnexion = dataNew.deconnect;
let ip = dataNew.ip;
dataNew = dataNew.chemin;
const { BrowserWindow } = require("electron");
const app = require("electron");
const { debug } = require('console');

const notification = document.getElementById('notification'); 
const message = document.getElementById('message'); 
const restartButton = document.getElementById('restart-button');

var ipPublicNow;


//var adresseAPI = "http://apiimpression";
var adresseAPI = "https://apiimpression.leonardo-service.com";


//A la sorti du curseur de la zone identifiant, recherche dans le fichier si existant
$("#tbx_username").blur(function () {

    var chemin = path.join(dataNew, "parametre_compte.txt");
    var log = false;
    var domain;
    if (fs.existsSync(chemin)) {
        readText(path.join(dataNew, "parametre_compte.txt"), function (data) {
            var arrLgn = data.split(/\r?\n/g);// tableau
            var login = document.getElementById('tbx_username').value;
            for (let j = 0; j < arrLgn.length; j++) {
                const words = arrLgn[j].split(';');
                if ((words[0] == login)&&(login!='')) {
                    console.log(login);
                    log = true;
                    domain = words[1];
                    document.getElementById('cb-save').checked = true;
                    document.getElementById('tbx_domain').value = domain;
                    break;
                }
            }
        });
    }
});

window.addEventListener('DOMContentLoaded', () => {

    var chemin = path.join(dataNew, "parametre_compte.txt");
    var log = false;
    var domain;

    if(getConnexion==false){
        if (fs.existsSync(chemin)) {
            readText(path.join(dataNew, "parametre_compte.txt"), function (data) {
                var arrLgn = data.split(/\r?\n/g);// tableau
                var login = document.getElementById('tbx_username').value;
                for (let j = 0; j < arrLgn.length; j++) {
                    const words = arrLgn[j].split(';');
    
                    if ((words[3] == 'true')) {
                        log = true;
                        login = words[0];
                        domain = words[1];
                        document.getElementById('cb-save').checked = true;
                        document.getElementById('tbx_username').value = login;
                        document.getElementById('tbx_domain').value = domain;
    
                        connexion();
                        break;
                    }
                }
            });
        }
    }else{
        if(ip!=""){
            $("#IpDeconnect").html('Vous avez été déconnecté du programme d\'impression car le poste '+ ip+' s\'est connecté avec votre identifiant');
            document.getElementById('IpDeconnect').style.visibility="visible";
        }
        
    }
   
});


function connexion() {

    //adresse IP publique

    let extIP = require("ext-ip")();
    var ipP = require("ip");
  
    //adresse IP privée
    var ipPrive = ipP.address();

    //récupération des éléments de connexion
    var data = new FormData();

    var login = document.getElementById('tbx_username').value;
    var domain = document.getElementById('tbx_domain').value;

    domain=domain.toLowerCase();
    
    data.append("login", login);
    data.append("domain", domain);
    data.append("version",version);


  
    var saveId = document.getElementById('cb-save').checked;
    var dataFile = "";
    var dataLog = "";

    //enregistrement des identifiants dans le fichier txt
    if (saveId == true) {
        dataLog = login + ";" + domain + ";;true;";

    } else {
        dataLog = login + ";" + domain + ";";
    }
    var content = "";
    var chemin = path.join(dataNew, "parametre_compte.txt");
    var log = false;

   

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {

        }
    });

    //connexion à l'API pour validation des identifiants de connexion base Z et récupération des données concernant la connexion à la base de données 
    xhr.open("POST", adresseAPI + "/connexion.php");


    xhr.send(data);

    xhr.onload = function () {

        var dataResult = JSON.parse(xhr.responseText);

        if (dataResult.message == 'ok') {

             //si fichier existant, enregistrement des données qui ne sont pas déjà dans le fichier
            if (fs.existsSync(chemin)) {
                readText(path.join(dataNew, "parametre_compte.txt"), function (data) {
                    var arrLgn = data.split(/\r?\n/g);// tableau
                    for (let j = 0; j < arrLgn.length - 1; j++) {
                        const words = arrLgn[j].split(';');
                        if ((words[0] == login) && (words[1] == domain)) {
                            log = true;
                            if (words[2] != "") {

                                if (saveId == true) {
                                    dataLog = login + ";" + domain + ";" + words[2] + ";true;";

                                } else {
                                    dataLog = login + ";" + domain + ";" + words[2] + ";false;";
                                }
                            } else {

                                if (saveId == true) {
                                    dataLog = login + ";" + domain + ";;true;";

                                } else {
                                    dataLog = login + ";" + domain + ";;false;";
                                }

                            }
                            content = dataLog;
                        } else {
                            if (words[2] != "") {
                                content = words[0] + ";" + words[1] + ";" + words[2] + ";false;";
                            } else {
                                content = words[0] + ";" + words[1] + ";;false;"
                            }
                        }
                        dataFile = dataFile + content + "\r\n";
                    }

                    //données non existante dans le fichier donc enregistrement
                    if (log == false) {
                        dataFile = dataFile + dataLog + "\r\n";
                    }

                    fs.writeFile(path.join(dataNew, 'parametre_compte.txt'), dataFile, function (err) {
                        if (err) throw err;

                    });
                });
            }
            //si non existant, création du fichier txt et insertion des données
            else {
                dataLog = dataLog + "\r\n";
                fs.writeFile(path.join(dataNew, "parametre_compte.txt"), dataLog, function (err) {
                    if (err) throw err;

                });
            }
            //récupération des données de la base sur laquelle se connecter en fonction de l'utilisateur

            extIP.get().then(ipPublic => {

                ipPublicNow = ipPublic;

             
                

                var databdd = new FormData();
                databdd.append("dataBase", dataResult.data[0].base);
                databdd.append("passwordBase", dataResult.data[0].password);
                databdd.append("sous_domaine", dataResult.data[0].sous_domaine);
                databdd.append("nameBase", dataResult.data[0].nom);
                databdd.append("usernameBase", dataResult.data[0].username);
                databdd.append("dsnBase", dataResult.data[0].dsn);
                databdd.append("ipPublic", ipPublicNow);
                databdd.append("ipPrive", ipPrive);
                databdd.append("login", login);
                databdd.append("domain", domain);

                var nameUser = dataResult.data[0].nameuser;
                var premomUser = dataResult.data[0].prenom;

                var xhrConnexionIP = new XMLHttpRequest();
                xhrConnexionIP.withCredentials = true;

                xhrConnexionIP.addEventListener("readystatechange", function () {
                    if (this.readyState === 4) {

                    }
                });

                //connexion avec les Adresses IP
                xhrConnexionIP.open("POST", adresseAPI + "/connexion_ip.php");

                xhrConnexionIP.send(databdd);

                xhrConnexionIP.onload = function () {

              

                    var dataConnexionIP = JSON.parse(xhrConnexionIP.responseText);

                    if ((dataConnexionIP.message == "ok")|| (dataConnexionIP.message == "modification")) {

                        var modification=false;
                        var ipDeconnect = "";

                        if(dataConnexionIP.message == "modification"){
                            console.log('connexion');
                            const NOTIFICATION_TITLE = 'Connexion'
                            const NOTIFICATION_BODY = 'Vous avez déconnecté le poste '+ dataConnexionIP.ip+', qui était connecté avec votre identifiant.'
                            const CLICK_MESSAGE = 'Notification clicked!'

                            new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY })
                            .onclick = () => document.getElementById("output").innerText = CLICK_MESSAGE

                            modification=true;
                            ipDeconnect = dataConnexionIP.ip;
                        }

                        let item = [];
                        item = {
                            login: login,
                            domain: domain,
                            nameUser: nameUser,
                            premomUser: premomUser,
                            saveId: saveId,
                            chemin: dataNew,
                            modification:modification,
                            ipDeconnect:ipDeconnect,
                        };

                        var xhrListeDoc = new XMLHttpRequest();
                        xhrListeDoc.withCredentials = true;

                        xhrListeDoc.addEventListener("readystatechange", function () {
                            if (this.readyState === 4) {

                            }
                        });

                        //connexion à la base client (base B) pour récupérer les noms des documents
                        xhrListeDoc.open("POST", adresseAPI + "/requete_sql.php");

                        xhrListeDoc.send(databdd);

                        xhrListeDoc.onload = function () {

                            var dataListeDoc = JSON.parse(xhrListeDoc.responseText);

                            if (dataListeDoc.message == "ok") {


                                var chemin = path.join(dataNew, "parametre_imprimante_") + login + "_" + domain + ".txt";
                                var dataName = "";
                                var dataId = "";
                                var dataFile = "";
                                var dataLigne = "";

                                //tester si le fichier txt avec le nom des documents existe
                                if (fs.existsSync(chemin)) {
                                    var log = false;
                                    var file = path.join(dataNew, "parametre_imprimante_") + login + "_" + domain + ".txt";
                                    var rawFile = new XMLHttpRequest();
                                    rawFile.overrideMimeType("text/plain");
                                    rawFile.open("GET", file, true);
                                    rawFile.onreadystatechange = function () {
                                        if (rawFile.readyState === 4 && rawFile.status == "200") {
                                            var arrLgn = rawFile.responseText.split(/\r?\n/g);// tableau
                                            for (let i = 0; i < dataListeDoc.data.length; i++) {
                                                dataId = dataListeDoc.data[i].id;
                                                for (let j = 0; j < arrLgn.length; j++) {
                                                    log = false;
                                                    const words = arrLgn[j].split(';');


                                                    if (dataId == words[0]) {
                                                        log = true;
                                                        break;
                                                    }
                                                }
                                                if (log == false) {
                                                    dataId = dataListeDoc.data[i].id;
                                                    dataName = dataListeDoc.data[i].name + ";";
                                                    dataLigne = dataId + ";" + dataName + "\r\n";
                                                    dataFile = dataFile + dataLigne;
                                                }
                                            }
                                            //insertion des nom des documents non encore stockés dans le fichier txt
                                            fs.appendFile(path.join(dataNew, "parametre_imprimante_") + login + "_" + domain + ".txt", dataFile, function (err) {
                                                if (err) throw err;
                                                ipc.send('openChildWindow', item);
                                            });
                                        }
                                    }
                                    rawFile.send(null);
                                }
                                else {
                                    //fichier txt non existant
                                    for (let i = 0; i < dataListeDoc.data.length; i++) {
                                        //récupération des données à enregistrer dans le fichier txt
                                        if (i == 0) {
                                            dataId = dataListeDoc.data[i].id;
                                            dataName = dataListeDoc.data[i].name + ";";
                                            dataLigne = dataId + ";" + dataName + "\r\n";
                                            dataFile = dataLigne;
                                        } else {
                                            dataId = dataListeDoc.data[i].id;
                                            dataName = dataListeDoc.data[i].name + ";";
                                            dataLigne = dataId + ";" + dataName + "\r\n";
                                            dataFile = dataFile + dataLigne;
                                        }

                                    }
                                    //création et saisie des données dans le fichier txt
                                    fs.writeFile(path.join(dataNew, "parametre_imprimante_") + login + "_" + domain + ".txt", dataFile, function (err) {
                                        if (err) throw err;
                                        ipc.send('openChildWindow', item);
                                    });
                                }
                            }
                        }
                    }
                }
            }, err => {
                console.error(err);
            });
        } else {
            if (dataResult.message == "no base") {
                toastInfo("Aucune base de rattaché à l'utilisateur");
            } else {
                if (dataResult.message == "erreur de saisie") {
                    toastInfo("Erreur de connexion");
                }else{
                    if(dataResult.message=="erreur de version - faire mise à jour du programme"){
                        toastInfo("Vous devez faire la mise à jour");
                        //ipc.send('restart_app'); 
                    }
                }
            }
        }
    }


}


function readText(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("text/plain");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}


