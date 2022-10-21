const electron = require("electron");
const remote = require ("@electron/remote/main");
remote.initialize();
const {app,Menu,ipcMain, Tray } = electron;
const  BrowserWindow = require("electron").BrowserWindow;
const path = require('path');
var iconpath = path.join(__dirname, 'src/images/logo_er2p.ico')
let mainWindowLogin;
const fs = require('fs');
const {download} = require("electron-dl");
global.data={};
global.quit=false;
global.window="";
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//var adresseAPI = "http://apiimpression";
var adresseAPI = "https://apiimpression.leonardo-service.com";

var printer = remote.printer;



const url = require('url')
const { Console } = require("console");
const { dialog } = require('electron');

const { autoUpdater } = require('electron-updater');

var AutoLaunch=require('auto-launch');

app.disableHardwareAcceleration()


function createWindowIndex() {

  data={"deconnecter" : global.deconnecte, "ip":global.ip,"user":global.data,"version":app.getVersion(), "quit": global.quit,"window":global.window};

  mainWindowIndex = new BrowserWindow({
    width: 120,
    height: 100,
    icon:'src/images/logo_er2p.ico',
    maximized: false,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    show: false,
  });

  mainWindowIndex.loadFile("src/index/index.html",{query:{"data" : JSON.stringify(data)}});

  mainWindowIndex.on('close', function (event) {
    app.quit();
  })

  mainWindowIndex.on('minimize', function (event) {
      event.preventDefault()
      mainWindowIndex.hide()
  })

  mainWindowIndex.on('show', function () {

  })

}


function createWindowLogin(deconnecte,ip) {

  if (process.platform === 'darwin') {
    chemin=__dirname
  }else{
    var dir =app.getPath('documents') + '/LisaImpression';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    chemin=app.getPath('documents')+ "/LisaImpression/";
  }

  data={"chemin" : chemin, "deconnect" : deconnecte, "ip":ip,"version":app.getVersion()};

  mainWindowLogin = new BrowserWindow({
    width: 1200,
    height: 1000,
    icon:'src/images/logo_er2p.ico',
    maximized: false,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    show: false,
  });

  mainWindowLogin.loadFile("src/login/login.html", {query:{"data" : JSON.stringify(data)}});

  mainWindowLogin.show();
  menuLogin();

  let menuTrayLogin = notification(mainWindowLogin,"login");

  mainWindowLogin.on('close', function (event) {
    menuTrayLogin.destroy();
    
    if(!app.deconnect){
      const options = {
        type: 'question',
        buttons: ['Annuler', 'Valider',],
        defaultId: 1,
        title: 'Quitter',
        message: 'Voulez-vous vraiment quitter l\'application?',
      };
    
      dialog.showMessageBox(null,options)
        .then(result => {
          if (result.response === 1) {
            global.quit=true;
            global.deconnecte=false;
            global.window="login";
            createWindowIndex();
            //app.isQuiting = true;
            //app.quit();
          }else{
            createWindowLogin(global.deconnecte, global.ip);
          }
        }
      );
    }else{
      app.deconnect=false;
    }
  })

  mainWindowLogin.on('minimize', function (event) {
      event.preventDefault()
      mainWindowLogin.hide()
  })

  mainWindowLogin.on('show', function () {

  })

}

function notification(window,nameWindow){
  var appIcon = new Tray(iconpath)

  var contextMenu = Menu.buildFromTemplate([
      {
          label: 'Ouvrir', click: function () {
            window.show()
          }
      },
      {
          label: 'Quitter', click: function () {
              const options = {
                type: 'question',
                buttons: ['Annuler', 'Valider',],
                defaultId: 1,
                title: 'Quitter',
                message: 'Voulez-vous vraiment quitter l\'application?',
              };
            
              dialog.showMessageBox(null,options)
                .then(result => {
                  if (result.response === 1) {
                    global.quit=true;
                    global.window=nameWindow;
                    createWindowIndex();
                  }
                }
              );
          }
      }
  ])

  appIcon.setContextMenu(contextMenu);
  return appIcon;

  
}

function createChildWindow(arg) {
 
  data={"user" : arg,"version":app.getVersion()};

  childWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    modal: true,
    show: false,
    icon:'src/images/logo_er2p.ico',
  
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    
  });
  
  childWindow.loadFile("src/parametrage/parametrage.html", {query:{"data" : JSON.stringify(data)}});

  childWindow.once("ready-to-show", () => {
    childWindow.show();
    window='parametre';
  });

  menuParam();

  let menuTrayChild = notification(childWindow,"childWindow");

  childWindow.on('close', function (event) {
    menuTrayChild.destroy();

      if(!app.deconnect){
        const options = {
          type: 'question',
          buttons: ['Annuler', 'Valider',],
          defaultId: 1,
          title: 'Quitter',
          message: 'Voulez-vous vraiment quitter l\'application?',
        };
      
        dialog.showMessageBox(null,options)
          .then(result => {
            if (result.response === 1) {
              global.quit=true;
              global.window="childWindow";
              createWindowIndex();
            }else{
              createChildWindow(global.data.user);
            }
          }
        );
      }else{
        app.deconnect=false;
      }
  })

  childWindow.on('minimize', function (event) {
      event.preventDefault()
      childWindow.hide()
  })

  childWindow.on('show', function () {

  })

}

ipcMain.handle('getPrinters', async () => {
  const printers = await mainWindowIndex.webContents.getPrintersAsync();
  return printers;
  
});


ipcMain.on("openChildWindow", (event, arg) => {
  global.data.user=arg;
  createChildWindow(arg);
  app.deconnect=true;
  mainWindowLogin.close();
});

ipcMain.on("openLogin", (event, arg) => {
  createWindowLogin(global.deconnecte, global.ip);
});

ipcMain.on("quit", (event, arg) => {
  app.isQuiting = true;
  app.quit();
});

ipcMain.on( "setMyGlobalVariable", ( event, myGlobalVariableValue, myIp ) => {
  global.deconnecte = myGlobalVariableValue;
  global.ip=myIp;
} );

  
app.whenReady().then(() => {

  global.deconnecte=false;
  global.ip="";

  createWindowIndex();
 
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindowIndex();
    }
  });
});

ipcMain.on("closeLogin", (event, args)=>{
  const options = {
    type: 'question',
    buttons: ['Annuler', 'Valider',],
    defaultId: 1,
    title: 'Quitter',
    message: 'Voulez-vous vraiment quitter l\'application?',
  };

  dialog.showMessageBox(null,options)
    .then(result => {
      if (result.response === 1) {
        app.deconnect=false;
        mainWindowLogin.close();
      }else{
        createWindowLogin(global.deconnecte, global.ip)
      }
    }
  );
  
});

ipcMain.on("closeChildWindow", (event, args)=>{
  app.deconnect=true;
  childWindow.close();
 
  createWindowLogin(global.deconnecte, global.ip);
 
});


ipcMain.on("editionPdf", (event, arg) => {

  data={"edition" : arg};

  const ptp= require('pdf-to-printer') // something like this

  for (let i = 0; i < data.edition.length; i++) {
    var cheminPdf = data.edition[i].pdf;
    var namePrinter = data.edition[i].Imprimante;
    var chemin=data.edition[i].chemin;

    var options ={
      printer:namePrinter,
      silent: true,
    }

    var cheminPdfPrinter = chemin+"\\DOC_"+data.edition[i].id+".pdf";

    download(BrowserWindow.getAllWindows()[0], cheminPdf,{
      directory:chemin,
      filename:"DOC_"+data.edition[i].id+".pdf",
    }).then(
      ()=>{
        ptp.print(cheminPdfPrinter,options)
        
      }
    );
  }

});


ipcMain.on('app_version', (event) => {
  console.log('getVersion');
  event.sender.send('app_version', { version: app.getVersion() });
 
});



function menuLogin(){
  const template = [
    {
        label: 'Fichier',
        submenu: [
            {
                label: 'Quitter',
                click : async () => {
                  app.deconnect=false;
                  global.quit=true;
                  global.deconnecte=false;
                  global.window="login";
                  mainWindowLogin.close();
                }
            }
        ]
    }]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

function menuParam(){
  const template = [
    {
        label: 'Fichier',
        submenu: [
            {
              label: 'Déconnecter',
              click : async () => {
                app.deconnect=true;
                childWindow.close();
                global.deconnecte=true;
                global.ip="";
                global.quit=false;
                global.window="childWindow"
                createWindowIndex();

              }
            },
            {
                label: 'Quitter',
                click : async () => {
                  app.deconnect=false;
                  global.quit=true;
                  global.window="childWindow";
                  childWindow.close();

                }
            }
        ]
    }]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}


