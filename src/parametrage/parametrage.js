let $ = jQuery = require('jquery');
const { ipcRenderer, ipcMain, dialog } = require('electron')
const querystring = require('querystring');
const remote = require ("@electron/remote/main");
const fs = require('fs');
const ipc = window.require('electron').ipcRenderer;
const path = require('path');
const electron = require("electron");
const  BrowserWindow = require("electron").BrowserWindow;
var ipPublicNow;
require ("electron-fetch");

//var adresseAPI = "http://apiimpression";
var adresseAPI = "https://apiimpression.leonardo-service.com";

var dataGrid = null;
let listPrinter=[];

let query = querystring.parse(global.location.search);
let dataNew = JSON.parse(query['?data']);
let version=dataNew.version;

$("#lbl_typedoc").html(("Liste imprimantes"));

window.addEventListener('DOMContentLoaded', () => {
    let printers = ipcRenderer.invoke('getPrinters');
	let list=printers.then(	
		list=>{
			listPrinter=list;
           
            $("#hid_tabLignesPrinters").dxTextBox({
                value: JSON.stringify(listPrinter),
                name:"hid_tabLignesPrinters",
                visible: false
            });

            let query = querystring.parse(global.location.search);
            let data = JSON.parse(query['?data'])
            let version=data.version;
            let login=data.user.login;
            let domain=data.user.domain;
            let nameUser=data.user.nameUser;
            let premomUser=data.user.premomUser;
            let saveId=data.user.saveId;
            let chemin=data.user.chemin;
            let modification=data.user.modification;
            let ipDeconnect=data.user.ipDeconnect;

            $("#premom_user").html(premomUser);
            $("#name_user").html(nameUser);

            if(modification){
                $("#IpDeconnect").html("Vous avez déconnecté le poste "+ipDeconnect+", qui était connecté avec votre identifiant.");
                document.getElementById('IpDeconnect').style.visibility="visible";
            }
           
            var  namePrinterDefaut ="";
            readTextFile(path.join(chemin, "parametre_compte.txt"), function(data){
                var arrLgn=data.split(/\r?\n/g);// tableau
                for (let i=0;i<arrLgn.length;i++){
                    const words = arrLgn[i].split(';');
                    if(words[0]==login){
                        namePrinterDefaut=words[2];
                        if(namePrinterDefaut!=""){
                            recupTableau(namePrinterDefaut, login, domain,chemin);
                            document.getElementById('updatePrint').style.visibility="visible";
                        }
                        break;
                    }
                }
  
                $("#lbl_typeImp").html("Imprimante d'origine");
                $("#cmb_typeImp").dxSelectBox({
                    items: listPrinter,
                    searchEnabled: true,
                    value: namePrinterDefaut,
                    name: "cmb_typeImp",
                    valueExpr: "name",
                    displayExpr: "name",
                    onValueChanged: function (e) {
                        var typeImp = $("#cmb_typeImp").dxSelectBox("instance").option("value");
                        recupTableau(typeImp,login, domain,chemin);
                        saveImpDefault(typeImp,login, domain,saveId,chemin);
                        document.getElementById('updatePrint').style.visibility="visible";
                    }
                });
                $('body').on('click', '#updatePrint', function(e){updatePrinter(listPrinter);});
            });

            lancementEdition(data, 500);
		}  
	); 
});


$('body').on('click', '#closeBtn', function(e){close();});
$('body').on('click', '#confirmBtn', function(e){update(confirmBtn.value,dataNew);});

function updatePrinter(listPrinter){
    
    let favDialog = document.getElementById('favDialog');
    let selectEl = document.getElementById('listPrint');
    let confirmBtn = document.getElementById('confirmBtn');
    var print ="" ;

    if (typeof favDialog.showModal === "function") {

        if(selectEl.options.length==0){
            if(listPrinter.length!=0){
                let length=listPrinter.length-1;
                confirmBtn.value=listPrinter[length].name;
            }
            while(listPrinter.length)
            {
                print = listPrinter.pop();
                print=print.name;
                var opt = new Option(print, print);
                selectEl.options[selectEl.options.length] = opt;
            }
        }
        favDialog.showModal();
    } else {
        console.error("L'API <dialog> n'est pas prise en charge par ce navigateur.");
    }

    selectEl.addEventListener('change', function onSelect(e) {
        confirmBtn.value = selectEl.value;
    });
    
}

function close(){

}

function update(confirmBtn,data){
    var selectedRowsKey = dataGrid.getSelectedRowsData();
    let login=data.user.login;
    let domain=data.user.domain;
    let chemin=data.user.chemin;

    saveUpdateTableau(confirmBtn, login, domain,selectedRowsKey,chemin);
   
}

function saveUpdateTableau(typeImp,login,domain,selectedRowsKey,chemin){
    
    readTextFile(path.join(chemin, "parametre_imprimante_")+login+"_"+domain+".txt", function(data){
        var arrLgn=data.split(/\r?\n/g);// tableau
        let item =[];
        let source = [];
        var dataFile="";
        var content="";
        var log=false;
        
      
        for (let i=0;i<arrLgn.length;i++){
            log=false;
            const words = arrLgn[i].split(';');
            for (let j=0;j<selectedRowsKey.length;j++){
                if(words[0]==selectedRowsKey[j].id){
                    
                    item ={
                        id: words[0],
                        Document: words[1],
                        Imprimante: typeImp,
                    };
                    content=words[0]+";"+words[1]+";"+typeImp+";";
                    log=true;
                    break;  
                }
            }
            if(log==false){
                item ={
                    id: words[0],
                    Document: words[1],
                    Imprimante: words[2],
                };
                content=words[0]+";"+words[1]+";"+words[2]+";";
            }
            source.push(item);
            dataFile=dataFile+content+"\r\n";
        }

        listPrinter=JSON.parse($("#hid_tabLignesPrinters").dxTextBox("instance").option("value"));
        $('#gridContainer').dxDataGrid('instance').option("dataSource", source);

        fs.writeFile(path.join(chemin, "parametre_imprimante_")+login+"_"+domain+".txt", dataFile, function (err) {
            if (err) throw err;
                
            });
    });
    
}

function readTextFile(file, callback) {
	var rawFile = new XMLHttpRequest();
	rawFile.overrideMimeType("text/plain");
	rawFile.open("GET", file, true);
	rawFile.onreadystatechange = function() {
		if (rawFile.readyState === 4 && rawFile.status == "200") {
			callback(rawFile.responseText);
		}
	}
	rawFile.send(null);
}

function recupTableau(typeImp,login,domain,chemin){
    readTextFile(path.join(chemin, "parametre_imprimante_")+login+"_"+domain+".txt", function(data){
        var arrLgn=data.split(/\r?\n/g);// tableau
        let item =[];
        let source = [];
        var namePrinter;
        var dataFile="";
        var content="";
        
        for (let i=0;i<arrLgn.length;i++){
            const words = arrLgn[i].split(';');
            
            if(words[2]==""){
                namePrinter=typeImp;
            }else{
                namePrinter=words[2];
            }
                
            if(words[0]!=""){
                item ={
                    id: words[0],
                    Document: words[1],
                    Imprimante: namePrinter,
                
                    };
                    source.push(item);
                    content=words[0]+";"+words[1]+";"+namePrinter+";";
                    dataFile=dataFile+content+"\r\n";
            }
            
        }

        fs.writeFile(path.join(chemin, "parametre_imprimante_")+login+"_"+domain+".txt", dataFile, function (err) {
            if (err) throw err;
                
            });
    
        $(() => {
            dataGrid = $('#gridContainer').dxDataGrid({
                dataSource: source,
                keyExpr: 'id',
                columns: columns,
                mode: "batch",
                height:'650px',
                wordWrapEnabled: true,
                allowColumnReordering:true,
                allowColumnResizing: true,
                columnAutoWidth:true,
                showBorders: true,
                editing: {
                    allowUpdating: true,
                    mode: 'row',
                },
                selection: {
                    mode: "multiple"
                },
                paging: {
                    enabled: true,
                    pageIndex: 0,
                    pageSize: 15
                },
                onRowUpdated(e)
                {
                    dataFile="";
                    let _source = $('#gridContainer').dxDataGrid('instance').option("dataSource");
                    for (let i=0;i<_source.length;i++){
                        content=_source[i].id+";"+_source[i].Document+";"+_source[i].Imprimante+";";
                        dataFile=dataFile+content+"\r\n";

                    }
                   
                    fs.writeFile(path.join(chemin, "parametre_imprimante_")+login+"_"+domain+".txt", dataFile, function (err) {
                        if (err) throw err;
                            
                        });
                }
            }).dxDataGrid("instance");
            }  
        );
    });
    let columns = [
               
        {
            caption: "Document",
            dataField: "Document",
            allowEditing: false
        },
        {
            caption: "Imprimante",
            dataField: "Imprimante",
            lookup: {
                dataSource: JSON.parse($("#hid_tabLignesPrinters").dxTextBox("instance").option("value")),
                valueExpr: "name",
                displayExpr: "name"
            }					  
        }
    ];
}

function saveImpDefault(typeImp,login,domain,saveId,chemin){

    readTextFile(path.join(chemin, "parametre_compte.txt"), function(data){
        
        var content="";
        var dataFile="";
        var arrLgn=data.split(/\r?\n/g);// tableau
        for (let j=0;j<arrLgn.length-1;j++){
            const words = arrLgn[j].split(';');
            if((words[0]==login)&&(words[1]==domain)){
                if(saveId==true){
                    var dataLog=login+";"+domain+";"+typeImp+";true;";
            
                }else{
                    var dataLog=login+";"+domain+";"+typeImp+";false;";
                }
                content=dataLog;
            }else{
                if(words[2]!=""){
                    content=words[0]+";"+words[1]+";"+words[2]+";false;";
                }else{
                    content=words[0]+";"+words[1]+";;false;" 
                }
            }
            dataFile=dataFile+content+"\r\n";
        }

        //données non existante dans le fichier donc enregistrement
       
            
        fs.writeFile(path.join(chemin, 'parametre_compte.txt'), dataFile, function (err) {
            if (err) throw err;
                
            });
        
    });
}

async function lancementEdition(data, delay){
    let login=data.user.login;
    let domain=data.user.domain;
    let chemin=data.user.chemin;
    
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
                xhrListeIp.open("POST", adresseAPI+"/deconnexion_ip.php");
            
                xhrListeIp.send(databdd);

                xhrListeIp.onload = function() {

                    var dataListeIp = JSON.parse(xhrListeIp.responseText);

                    if(dataListeIp.message=="deconnexion"){

                            const NOTIFICATION_TITLE = 'Déconnexion'
                            const NOTIFICATION_BODY = 'Vous avez été déconnecté du programme d\'impression car le poste '+ dataListeIp.ip+' s\'est connecté avec votre identifiant'
                            const CLICK_MESSAGE = 'Notification clicked!'

                            new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY })
                            .onclick = () => document.getElementById("output").innerText = CLICK_MESSAGE

                            ipc.send( "setMyGlobalVariable", true, dataListeIp.ip);
                            ipc.send('closeChildWindow', dataListeIp.ip); 
                        

                    }else{
                        if(dataListeIp.message=="ok"){

                            var xhrListeDoc = new XMLHttpRequest();
                            xhrListeDoc.withCredentials = true;
                        
                            xhrListeDoc.addEventListener("readystatechange", function() {
                            if(this.readyState === 4) {
                                
                            }
                            });
                        
                            //connexion à la base client (base B) pour récupérer les noms des documents
                            xhrListeDoc.open("POST", adresseAPI+"/document_impression.php");
                        
                            xhrListeDoc.send(databdd);
    
                            xhrListeDoc.onload = function() {
    
                                var dataListeDoc = JSON.parse(xhrListeDoc.responseText);
    
                                if(dataListeDoc.message=="ok"){
    
                                    let source=[];
    
                                    readTextFile(path.join(chemin, "parametre_imprimante_")+login+"_"+domain+".txt", function(dataList){
                                        $("#avancement").html("Récupération de l'imprimante correspond au document");
                                        var arrLgn=dataList.split(/\r?\n/g);// tableau
                                        let item =[];
                                
                                        for (let i = 0; i < dataListeDoc.data.length; i++) {
                                            
                                            var docName = dataListeDoc.data[i].name;
                                        
                                            for (let j=0;j<arrLgn.length;j++){
                                                const words = arrLgn[j].split(';');
                                                if(words[1]==docName){
                                                    item ={
                                                        id:dataListeDoc.data[i].id_document_imprimer,
                                                        pdf: dataListeDoc.data[i].url,
                                                        Imprimante: words[2],
                                                        Document:words[1],
                                                        chemin : chemin,
                                                    };
                                                    source.push(item);
                                                }
                                            }
                                        }
    
                                        ipc.send('editionPdf',source); 
                                      
                                        source=JSON.stringify(source);
                                        databdd.append("source", source);
    
                                        var xhrListeDoc = new XMLHttpRequest();
                                        xhrListeDoc.withCredentials = true;
                                    
                                        xhrListeDoc.addEventListener("readystatechange", function() {
                                        if(this.readyState === 4) {
                                            
                                        }
                                        });
                                    
                                        //connexion à la base client (base B) pour mettre à jour les documents déjà imprimé
                                        xhrListeDoc.open("POST", adresseAPI+"/maj_document_impression.php");
                                    
                                        xhrListeDoc.send(databdd);
                            
                                        xhrListeDoc.onload = function() {
    
                                            var dataListeDocUpdate = JSON.parse(xhrListeDoc.responseText);
    
                                            if(dataListeDocUpdate.message=="ok"){
                                                var cheminPdfPrinter="";
                                                for (let i = 0; i < dataListeDoc.data.length; i++) {
                                                    cheminPdfPrinter=chemin+"\\DOC_"+dataListeDoc.data[i].id_document_imprimer+".pdf";
                                                    fs.unlink(cheminPdfPrinter, (err)=>{
                                                      if(err) throw err;
                                                      console.log(cheminPdfPrinter+"a été supprimé");
                                                    })
        
                                                }
                                                setTimeout(()=>lancementEdition(data,delay), delay);
                                            }
                                        }
                                    });
                                }else{
                                    setTimeout(()=>lancementEdition(data,delay), delay);
                                }
                            }
                        }else{
                            setTimeout(()=>lancementEdition(data,delay), delay);
                        }
                    }
                }
            });
        }else{
            if(dataResult.message=="erreur de version - faire mise à jour du programme"){
                toastInfo("Vous devez faire la mise à jour")
            }
        }
    }
}


