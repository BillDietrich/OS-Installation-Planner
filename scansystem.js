//---------------------------------------------------------------------------
// "OS Installation Planner" scansystem.js
// Runs in Electron render process
// https://medium.com/@TK_CodeBear/manipulating-objects-in-javascript-59fefeb6a738
//---------------------------------------------------------------------------

// https://www.npmjs.com/package/os-locale
const osLocale = require('os-locale');

const os = require('os');

// https://www.npmjs.com/package/graceful-fs
// https://nodejs.org/api/fs.html
//const fs = require('graceful-fs');
const fs = require('fs');

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
var gNextNodeId = 0;
var gBootPartitionUUID = "";
var gRootPartitionUUID = "";


//---------------------------------
// standard fields of a node:
//  {
//    name: "something",
//    ...
//    nodeEditable: boolean,
//    nodeCanAddChildren: boolean,
//    nodeStatus: "existing / added / deleted / changed",
//    nodeId: number,
//    children: []
//  }

// indices of the top array:
const TOP_CONFIG = 0;
const TOP_SYSTEM = 1;
const TOP_HARDWARE = 2;
const TOP_SOFTWARE = 3;

// indices in the software children array
const SOFTWARE_BIOS = 0;
const SOFTWARE_OS = 1;

// indices in the OS children array
const OS_SETTINGS = 0;
const OS_CONNECTIONS = 1;
const OS_APPLICATIONS = 2;

//---------------------------------


function addExistingConfigurationInfo() {
  //console.log("addExistingConfigurationInfo: called");
  const guid = crypto.randomBytes(16).toString("hex");
  gNextNodeId = 1001;
  gTree.push({
            name: "Existing configuration",
            type: "existingConfiguration",
            guid: guid,
            comparedGuid: "",
            nextNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
  //console.log("addExistingConfigurationInfo: return");
}


function addSystemInfo() {
  //console.log("addSystemInfo: called");
  var system = gObjAllData.system;
  gTree.push({
            name: "system",
            hostname: gObjAllData.os.hostname,
            manufacturer: system.manufacturer,
            model: system.model,
            chassisType: gObjAllData.chassis.type,
            serial: system.serial,
            uuid: system.uuid,
            sku: system.sku,
            nodeEditable: false,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gTree.push({
            name: "hardware",
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gTree.push({
            name: "software",
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  //console.log("addSystemInfo: return");
}


function addMotherboardInfo() {
  //console.log("addMotherboardInfo: called");
  var baseboard = gObjAllData.baseboard;
  gTree[TOP_HARDWARE].children.push({
            name: "motherboard",
            manufacturer: baseboard.manufacturer,
            model: baseboard.model,
            version: baseboard.version,
            serial: baseboard.serial,
            assetTag: baseboard.assetTag,
            nodeEditable: false,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}


function addCPUInfo() {
  //console.log("addCPUInfo: called");
  var cpu = gObjAllData.cpu;
  gTree[TOP_HARDWARE].children.push({
            name: "CPU",
            manufacturer: cpu.manufacturer,
            brand: cpu.brand,
            vendor: cpu.vendor,
            family: cpu.family,
            model: cpu.model,
            stepping: cpu.stepping,
            revision: cpu.revision,
            flags: cpu.flags,
            nodeEditable: false,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}

function addRAMInfo() {
  //console.log("addRAMInfo: called");
  gTree[TOP_HARDWARE].children.push({
            name: "RAM",
            sizeBytes: gObjAllData.mem.total,
            nodeEditable: true,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}


function addBatteryInfo() {
  //console.log("addBatteryInfo: called");
  gTree[TOP_HARDWARE].children.push({
            name: "battery",
            hasbattery: gObjAllData.battery.hasbattery,
            maxcapacity: gObjAllData.battery.maxcapacity,
            currentcapacity: gObjAllData.battery.currentcapacity,
            type: gObjAllData.battery.type,
            model: gObjAllData.battery.model,
            manufacturer: gObjAllData.battery.manufacturer,
            serial: gObjAllData.battery.serial,
            nodeEditable: true,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}


function addKeyboardInfo() {
  //console.log("addKeyboardInfo: called");
  // gets system locale, not actual info about keyboard
  gTree[TOP_HARDWARE].children.push({
            name: "keyboard",
            language: osLocale.sync(),
            nodeEditable: true,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}




function addDiskInfo() {
  //console.log("addDiskInfo: called");
  var diskLayoutData = gObjAllData.diskLayout;
  var fsSizeData = gObjAllData.fsSize;

  var i = 0;
  for (i = 0; i < diskLayoutData.length; i++) {

    //console.log("addDiskInfo: diskLayoutData[" + i + "] " + JSON.stringify(diskLayoutData));
    var fulldevicename = diskLayoutData[i].device;
    var n = fulldevicename.lastIndexOf(path.sep);
    var name = fulldevicename.substr(n+1);
    //console.log("addDiskInfo: fulldevicename " + fulldevicename + ", path.sep " + path.sep + ", n " + n + ", name " + name);

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
              nodeEditable: true,
              nodeCanAddChildren: true,
              nodeStatus: "existing",
              nodeId: gNextNodeId++,
              children: []
              });

    let MAXPARTNUM = 9;
    for (k = 1; k<=MAXPARTNUM; k++) {

      let subDevName = fulldevicename + k;
      var uuid = "";

      for (j = 0; j < gObjBlockDevices.length; j++) {
          //console.log("addDiskInfo: want name " + name + k + ", see gObjBlockDevices[j].name " + gObjBlockDevices[j].name);
          if (gObjBlockDevices[j].name === name + k) {
            uuid = gObjBlockDevices[j].uuid;
            break;
          }
      }

      for (j = 0; j < fsSizeData.length; j++) {
          //console.log("addDiskInfo: want subDevName " + subDevName + ", see fsSizeData[j].fs " + fsSizeData[j].fs);
          if (fsSizeData[j].fs === subDevName) {
            objDisk.children.push({
              name: name + k,
              fullName: fsSizeData[j].fs,
              type: "partition",
              sizeBytes: fsSizeData[j].size,
              fsType: fsSizeData[j].type,
              UUID: uuid,
              nodeEditable: true,
              nodeCanAddChildren: false,
              nodeStatus: "existing",
              nodeId: gNextNodeId++,
              children: []
              });
            if (fsSizeData[j].mount === "/boot") {
              // we've found the boot partition for the current OS
              gBootPartitionUUID = uuid;
            }
            if (fsSizeData[j].mount === "/") {
              // we've found the root partition for the current OS
              gRootPartitionUUID = uuid;
            }
            break;
          }
      }

    }

    gTree[TOP_HARDWARE].children.push(objDisk);

  }
  console.log("addDiskInfo: return " + JSON.stringify(objDisk));

  // https://github.com/balena-io-modules/drivelist
}


function addGraphicsInfo() {
      
  var controllers = gObjAllData.graphics.controllers;
  var displays = gObjAllData.graphics.displays;

  var objControllers = new Object({
    name: "graphicsControllers",
    nodeEditable: false,
    nodeCanAddChildren: true,
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
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
      nodeEditable: true,
      nodeCanAddChildren: false,
      nodeStatus: "existing",
      nodeId: gNextNodeId++,
      children: []
      });
  }

  gTree[TOP_HARDWARE].children.push(objControllers);

  var objDisplays = new Object({
    name: "displays",
    nodeEditable: false,
    nodeCanAddChildren: true,
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
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
      nodeEditable: true,
      nodeCanAddChildren: false,
      nodeStatus: "existing",
      nodeId: gNextNodeId++,
      children: []
      });
  }

  gTree[TOP_HARDWARE].children.push(objDisplays);
}


function addNetworkInterfaceInfo() {
  var networkInterfaces = gObjAllData.net;

  var objIfaces = new Object({
    name: "networkInterfaces",
    nodeEditable: false,
    nodeCanAddChildren: true,
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
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
        nodeEditable: true,
        nodeCanAddChildren: false,
        nodeStatus: "existing",
        nodeId: gNextNodeId++,
        children: []
        });
    }
  }

  gTree[TOP_HARDWARE].children.push(objIfaces);
}




function addBIOSInfo() {
  //console.log("addBIOSInfo: called");

  // supports UEFI ?
  // supports Secure Boot ?
  // supports ACPI ?

  gTree[TOP_SOFTWARE].children.push({
            name: "BIOS",
            vendor: gObjAllData.bios.vendor,
            version: gObjAllData.bios.version,
            releaseDate: gObjAllData.bios.releaseDate,
            revision: gObjAllData.bios.revision,
            nodeEditable: true,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}


// this is reading the currently booted OS
function addOSInfo() {
  //console.log("addOSInfo: called");

  // Booted from UEFI or BIOS ?
  // https://itsfoss.com/check-uefi-or-bios/
  // Does folder /sys/firmware/efi exist ?
    var bBootedFromUEFI = true;
    try {
      fs.accessSync("/sys/firmware/efi");
    } catch(e) {
      bBootedFromUEFI = false;
    }

  gTree[TOP_SOFTWARE].children.push({
            name: "OS - " + gObjAllData.os.platform + " - " + gObjAllData.os.distro + " - " + gObjAllData.os.release,
            platform: gObjAllData.os.platform,
            distro: gObjAllData.os.distro,
            release: gObjAllData.os.release,
            codename: gObjAllData.os.codename,
            kernel: gObjAllData.os.kernel,
            arch: gObjAllData.os.arch,
            hostname: gObjAllData.os.hostname,
            codepage: gObjAllData.os.codepage,
            logofile: gObjAllData.os.logofile,
            serial: gObjAllData.os.serial,
            build: gObjAllData.os.build,
            servicepack: gObjAllData.os.servicepack,
            bootedFromUEFI: bBootedFromUEFI,
            bootPartitionUUID: gBootPartitionUUID,
            rootPartitionUUID: gRootPartitionUUID,
            nodeEditable: true,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children.push({
    name: "settings",
    nodeEditable: false,
    nodeCanAddChildren: true,
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
    children: []
  });

  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children.push({
    name: "connections",
    nodeEditable: false,
    nodeCanAddChildren: true,
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
    children: []
  });

  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children.push({
    name: "applications",
    nodeEditable: false,
    nodeCanAddChildren: true,
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
    children: []
  });

}


function addTimeInfo() {
  //console.log("addTimeInfo: called");
  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children[OS_SETTINGS].children.push({
            name: "time",
            timezone: gObjAllData.time.timezone,
            timezoneName: gObjAllData.time.timezoneName,
            nodeEditable: true,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}


function addApplicationInfo() {
  console.log("addApplicationInfo: called");
  
  const apps = [
    { path: "/usr/bin/firefox", name: "Firefox" },
    { path: "/opt/bogus", name: "bogus" },
    { path: "/opt/thunderbird", name: "Thunderbird" }
  ];

  for (i = 0; i < apps.length; i++) {
    let filepath = apps[i].path.replace(/\//g, path.sep);

    var exists = true;
    try {
      fs.accessSync(filepath);
      //fs.statSync(filepath);
      //exists = fs.existsSync(filepath);
    } catch(e) {
      //console.log("addApplicationInfo: caught e " + e);
      exists = false;
    }
    //console.log("addApplicationInfo: i " + i + ", path " + apps[i].path + ", filepath " + filepath + ", exists " + exists);

    if (exists) {
      gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children[OS_APPLICATIONS].children.push({
                name: apps[i].name,
                nodeEditable: true,
                nodeCanAddChildren: false,
                nodeStatus: "existing",
                nodeId: gNextNodeId++,
                children: []
                });
    }
  }
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


  if (false) {
    // CLI commands: dmidecode, biosdecode, vpddecode, ownership
    // DMI (some say SMBIOS) table
    // https://www.webopedia.com/TERM/D/DMI.html
    // https://wiki.osdev.org/System_Management_BIOS
    // https://en.wikipedia.org/wiki/System_Management_BIOS
    // https://www.tecmint.com/how-to-get-hardware-information-with-dmidecode-command-on-linux/

    // DMI type 13, BIOS Language Information, Currently Installed Language
    // DMI type 16, Physical Memory Array, Maximum Capacity
    // DMI type 0, Characteristics, BIOS is upgradeable ? ACPI supported ?  UEFI supported ?

    // https://github.com/mjhasbach/node-ms-wmic
    // https://github.com/ruiming/node-wmic
    // https://www.npmjs.com/package/node-wmi
    // https://www.npmjs.com/package/ms-wmic
    // https://npm.taobao.org/package/wmic-js
    // https://github.com/jpgrusling/node-wmi

    // ACPI
    // https://en.wikipedia.org/wiki/Advanced_Configuration_and_Power_Interface
    // https://docs.microsoft.com/en-us/windows-hardware/drivers/kernel/acpi-driver
    // https://www.geeksforgeeks.org/acpi-command-in-linux-with-examples/
    // https://wiki.ubuntu.com/Kernel/Reference/ACPITricksAndTips
    // https://www.kernel.org/doc/html/latest/firmware-guide/acpi/namespace.html

    // OSPM
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
            addCPUInfo();
            addRAMInfo();
            addBatteryInfo();
            addKeyboardInfo();
            addDiskInfo();
            addGraphicsInfo();
            addNetworkInterfaceInfo();

            addBIOSInfo();
            addOSInfo();

            addTimeInfo();
            addApplicationInfo();
            
            gTree[TOP_CONFIG].nextNodeId = gNextNodeId;

            console.log("scansystem: finished, gTree: " + JSON.stringify(gTree));
            resolve(gTree);

          })
          .catch(error => console.log("systeminformation.blockDevices() error: " + error));
      })
      .catch(error => console.log("systeminformation.getAllData() error: " + error));
  });
}


//---------------------------------------------------------------------------
