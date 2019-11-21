//---------------------------------------------------------------------------
// "OS Installation Planner" scansystem.js
// Runs in Electron render process
// https://medium.com/@TK_CodeBear/manipulating-objects-in-javascript-59fefeb6a738
//---------------------------------------------------------------------------

// https://www.npmjs.com/package/os-locale
const osLocale = require('os-locale');

const os = require('os');

// https://github.com/sebhildebrandt/systeminformation
const systeminformation = require('systeminformation');

// https://nodejs.org/api/path.html#path_path_parse_pathstring
const path = require('path');

const crypto = require("crypto");



// https://jsonchecker.com/
// https://jsonprettyprint.org/



//---------------------------------------------------------------------------

var gObjAllData = null;
var gObjBlockDevices = null;
var gTree = null;


function addExistingConfigurationInfo() {
  //console.log("addExistingConfigurationRecord: called");
  const guid = crypto.randomBytes(16).toString("hex");
  gTree.push({
            name: "Existing configuration",
            type: "existingConfiguration",
            guid: guid,
            comparedGuid: "",
            children: []
            });
  //console.log("addExistingConfigurationRecord: return");
}


function addSystemInfo() {
  //console.log("addSystemRecord: called");
  var system = gObjAllData.system;
  gTree.push({
            name: "system",
            manufacturer: system.manufacturer,
            model: system.model,
            chassisType: gObjAllData.chassis.type,
            serial: system.serial,
            uuid: system.uuid,
            sku: system.sku,
            children: []
            });
  //console.log("addSystemRecord: return");
}


function addMotherboardInfo() {
  //console.log("addMotherboardRecord: called");
  var baseboard = gObjAllData.baseboard;
  gTree.push({
            name: "motherboard",
            manufacturer: baseboard.manufacturer,
            model: baseboard.model,
            version: baseboard.version,
            serial: baseboard.serial,
            assetTag: baseboard.assetTag,
            children: []
            });
}


function addRAMInfo() {
  //console.log("addRAMRecord: called");
  gTree.push({
            name: "RAM",
            sizeBytes: gObjAllData.mem.total,
            children: []
            });
}


function addKeyboardInfo() {
  //console.log("addKeyboardRecord: called");
  // gets system locale, not actual info about keyboard
  gTree.push({
            name: "keyboard",
            language: osLocale.sync(),
            children: []
            });
}




function addDiskInfo() {
  //console.log("addDiskRecords: called");
  var diskLayoutData = gObjAllData.diskLayout;
  var fsSizeData = gObjAllData.fsSize;

  var i = 0;
  for (i = 0; i < diskLayoutData.length; i++) {

    //console.log("addDiskRecords: diskLayoutData[" + i + "] " + JSON.stringify(diskLayoutData));
    var fulldevicename = diskLayoutData[i].device;
    var n = fulldevicename.lastIndexOf(path.sep);
    var name = fulldevicename.substr(n+1);
    //console.log("addDiskRecords: fulldevicename " + fulldevicename + ", path.sep " + path.sep + ", n " + n + ", name " + name);

    var type = (diskLayoutData[i].type === "HD" ? "hardDisk" : "");
    var removable = (diskLayoutData[i].interfaceType === "USB");

    var objDisk = new Object({
              name: name,
              type: diskLayoutData[i].type,
              removable: removable,
              vendor: diskLayoutData[i].vendor,
              model: diskLayoutData[i].name,
              serialNum: diskLayoutData[i].serialNum,
              sizeBytes: diskLayoutData[i].size,
              hardwareEncryptionSupported: false,
              hardwareEncryptionEnabled: false,
              children: []
              });

    let MAXPARTNUM = 9;
    for (k = 1; k<=MAXPARTNUM; k++) {

      let subDevName = fulldevicename + k;
      var uuid = "";

      for (j = 0; j < gObjBlockDevices.length; j++) {
          //console.log("addDiskRecords: want name " + name + k + ", see gObjBlockDevices[j].name " + gObjBlockDevices[j].name);
          if (gObjBlockDevices[j].name === name + k) {
            uuid = gObjBlockDevices[j].uuid;
            break;
          }
      }

      for (j = 0; j < fsSizeData.length; j++) {
          //console.log("addDiskRecords: want subDevName " + subDevName + ", see fsSizeData[j].fs " + fsSizeData[j].fs);
          if (fsSizeData[j].fs === subDevName) {
            objDisk.children.push({
              name: name + k,
              fullName: fsSizeData[j].fs,
              type: "partition",
              sizeBytes: fsSizeData[j].size,
              fsType: fsSizeData[j].type,
              UUID: uuid,
              children: []
              });
            break;
          }
      }

    }

    gTree.push(objDisk);

  }
  console.log("addDiskRecords: return " + JSON.stringify(objDisk));

  // https://github.com/balena-io-modules/drivelist
}


function addGraphicsInfo() {
      
  var controllers = gObjAllData.graphics.controllers;
  var displays = gObjAllData.graphics.displays;

  var objControllers = new Object({
    name: "graphicsControllers",
    children: []
  });

  for (i = 0; i < controllers.length; i++) {
    objControllers.children.push({
      name: "graphicsController" + i,
      vendor: controllers[i].vendor,
      model: controllers[i].model,
      bus: controllers[i].bus,
      vram: controllers[i].vram,
      vramDynamic: controllers[i].vramDynamic,
      children: []
      });
  }

  gTree.push(objControllers);

  var objDisplays = new Object({
    name: "displays",
    children: []
  });

  for (i = 0; i < displays.length; i++) {
    objDisplays.children.push({
      name: "display" + i,
      vendor: displays[i].vendor,
      model: displays[i].model,
      main: displays[i].main,
      builtin: displays[i].builtin,
      connection: displays[i].connection,
      sizex: displays[i].sizex,
      sizey: displays[i].sizey,
      pixeldepth: displays[i].pixeldepth,
      resolutionx: displays[i].resolutionx,
      resolutiony: displays[i].resolutiony,
      currentResX: displays[i].currentResX,
      currentResY: displays[i].currentResY,
      positionX: displays[i].positionX,
      positionY: displays[i].positionY,
      currentRefreshRate: displays[i].currentRefreshRate,
      children: []
      });
  }

  gTree.push(objDisplays);
}


function addNetworkInterfaceInfo() {
  var networkInterfaces = gObjAllData.net;

  var objIfaces = new Object({
    name: "networkInterfaces",
    children: []
  });

  for (i = 0; i < networkInterfaces.length; i++) {
    if ((networkInterfaces[i].type === "wired") || (networkInterfaces[i].type === "wireless")) {
      objIfaces.children.push({
        name: networkInterfaces[i].ifaceName,
        iface: networkInterfaces[i].iface,
        mac: networkInterfaces[i].mac,
        internal: networkInterfaces[i].internal,
        type: networkInterfaces[i].type,
        bus: networkInterfaces[i].bus,
        bus: networkInterfaces[i].bus,
        bus: networkInterfaces[i].bus,
        bus: networkInterfaces[i].bus,
        children: []
        });
    }
  }

  gTree.push(objIfaces);
}


function addBIOSInfo() {
  var promise = null;
  promise = systeminformation.bios()
    .then(data => {
      treetext += ',{ "name": "BIOS", "type": "BIOS", "removable": false, "vendor": "' + data.vendor + '", "version": "' + data.version + '", "releaseDate": "' + data.releaseDate + '", "revision": "' + data.revision + '", "children": []}';
      }
    ).catch(error => console.log("systeminformation.bios() error: " + error));
  return promise;
}


// app.getGPUInfo(infoType)
// app.getGPUFeatureStatus()
// app.isAccessibilitySupportEnabled()
// app.accessibilitySupportEnabled
// https://electronjs.org/docs/api/process  (nothing useful, I think)
// get timezone and date/time format settings


//---------------------------------------------------------------------------

function scansystem() {

  if (false) {
    // run a shell script
    var exec = require('child_process').exec;
    exec(
      'bash ./ScanSystem-Linux.sh',
      {
        //cwd: '/home/user/directory'
      },
      function(error, stdout, stderr) {
        // work with result
        console.log("JSON.stringify(stdout): " + JSON.stringify(stdout));
      }
    );
  }

  if (false) {
    // https://nodejs.org/api/os.html
    console.log("os.hostname(): " + os.hostname());
    console.log("os.platform(): " + os.platform());
    console.log("os.type(): " + os.type());
    console.log("os.release(): " + os.release());
    console.log("os.totalmem(): " + os.totalmem());
    var networkInterfaces = os.networkInterfaces();
    console.log("JSON.stringify(networkInterfaces): " + JSON.stringify(networkInterfaces));
  }


  if (false) {
    // https://github.com/sebhildebrandt/systeminformation
    systeminformation.system()
      .then(data => console.log("systeminformation.system(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.system() error: " + error));
    systeminformation.cpu()
      .then(data => console.log("systeminformation.cpu(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.cpu() error: " + error));
    systeminformation.bios()
      .then(data => console.log("systeminformation.bios(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.bios() error: " + error));
    systeminformation.baseboard()
      .then(data => console.log("systeminformation.baseboard(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.baseboard() error: " + error));
    systeminformation.chassis()
      .then(data => console.log("systeminformation.chassis(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.chassis() error: " + error));
    systeminformation.mem()
      .then(data => console.log("systeminformation.mem(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.mem() error: " + error));
    systeminformation.graphics()
      .then(data => console.log("systeminformation.graphics(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.graphics() error: " + error));
    systeminformation.osInfo()
      .then(data => console.log("systeminformation.osInfo(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.osInfo() error: " + error));

/*
    // takes a LONG time
    systeminformation.services("*")
      .then(data => console.log("systeminformation.services(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.services() error: " + error));
*/

    systeminformation.diskLayout()
      .then(data => console.log("systeminformation.diskLayout(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.diskLayout() error: " + error));
    systeminformation.blockDevices()
      .then(data => console.log("systeminformation.blockDevices(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.blockDevices() error: " + error));
    systeminformation.fsSize()
      .then(data => console.log("systeminformation.fsSize(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.fsSize() error: " + error));
    systeminformation.networkInterfaces()
      .then(data => console.log("systeminformation.networkInterfaces(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.networkInterfaces() error: " + error));
    systeminformation.networkGatewayDefault()
      .then(data => console.log("systeminformation.networkGatewayDefault(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.networkGatewayDefault() error: " + error));
    systeminformation.wifiNetworks()
      .then(data => console.log("systeminformation.wifiNetworks(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.wifiNetworks() error: " + error));
    systeminformation.time()
      .then(data => console.log("systeminformation.time(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.time() error: " + error));

    systeminformation.getStaticData()
      .then(data => console.log("systeminformation.getStaticData(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.getStaticData() error: " + error));
    systeminformation.getDynamicData()
      .then(data => console.log("systeminformation.getDynamicData(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.getDynamicData() error: " + error));
    systeminformation.getAllData("", "")
      .then(data => console.log("systeminformation.getAllData(): " + JSON.stringify(data)))
      .catch(error => console.log("systeminformation.getAllData() error: " + error));
  }


  return new Promise((resolve, reject) => {

    p = systeminformation.getAllData("", "")
      .then(data => {
      
        console.log("systeminformation.getAllData(): " + JSON.stringify(data));

        gObjAllData = data;

        p = systeminformation.blockDevices()
          .then(data => {

            gObjBlockDevices = data;

            gTree = new Array();

            addExistingConfigurationInfo();
            addSystemInfo();
            addMotherboardInfo();
            addRAMInfo();
            addKeyboardInfo();
            addDiskInfo();
            addGraphicsInfo();
            addNetworkInterfaceInfo();
            
            console.log("scansystem: finished, gTree: " + JSON.stringify(gTree));
            resolve(gTree);

          })
          .catch(error => console.log("systeminformation.blockDevices() error: " + error));
      })
      .catch(error => console.log("systeminformation.getAllData() error: " + error));
  });
}


//---------------------------------------------------------------------------
