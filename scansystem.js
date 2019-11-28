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

const process = require("process");



// https://jsonchecker.com/
// https://jsonprettyprint.org/



//---------------------------------------------------------------------------

var gbPrivilegedUser = false;


function checkPrivilegedUser() {
  console.log("checkPrivilegedUser: called");

  // https://stackoverflow.com/questions/37322862/check-if-electron-app-is-launched-with-admin-privileges-on-windows

  return new Promise((resolve, reject) => {

    p = systeminformation.osInfo()
      .then(data => {

        console.log("checkPrivilegedUser: osInfo: " + JSON.stringify(data));
        switch (data.platform) {
          case 'linux': gnExistingSystemType = SYSTEMTYPE_LINUX; break;
          case 'win32': gnExistingSystemType = SYSTEMTYPE_WINDOWS; break;
          case 'darwin': gnExistingSystemType = SYSTEMTYPE_MACOSX; break;
        }
        console.log("checkPrivilegedUser: gnExistingSystemType " + gnExistingSystemType);


        // https://nodejs.org/api/child_process.html#child_process_child_process_execsync_command_options

        var execSync = require('child_process').execSync;

        var sCommand = "";
        var sOutput = "";

        switch (gnExistingSystemType) {
          case SYSTEMTYPE_LINUX:
          case SYSTEMTYPE_MACOSX:
            sCommand = "wc /etc/shadow";
            break;
          case SYSTEMTYPE_WINDOWS:
            sCommand = "net session";
            break;
        }

        try {
          sOutput = execSync(sCommand);
          console.log("checkPrivilegedUser: sOutput: " + sOutput);
          gbPrivilegedUser = true;
        } catch(e) {
          console.log("checkPrivilegedUser: e: " + e);
          gbPrivilegedUser = false;
        }
    
        console.log("checkPrivilegedUser: gbPrivilegedUser " + gbPrivilegedUser);
        resolve(gbPrivilegedUser);

    });
    
  });

  console.log("checkPrivilegedUser: return");
}

//---------------------------------------------------------------------------

const SYSTEMTYPE_UNKNOWN = 0;
const SYSTEMTYPE_LINUX = 1;
const SYSTEMTYPE_WINDOWS = 2;
const SYSTEMTYPE_MACOSX = 3;
var gnExistingSystemType = SYSTEMTYPE_UNKNOWN;



//---------------------------------------------------------------------------

var gObjAllData = null;

var gTree = null;
var gNextNodeId = 0;    // shared by all trees
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
const TOP_SOFTWARE = 2;
const TOP_HARDWARE = 3;

// indices in the software children array
const SOFTWARE_BIOS = 0;
const SOFTWARE_OS = 1;

// indices in the OS children array
const OS_SETTINGS = 0;
const OS_CONNECTIONS = 1;
const OS_APPSANDSERVICES = 2;

//---------------------------------


function addExistingConfigurationInfo() {
  console.log("addExistingConfigurationInfo: called");
  var sGUID = crypto.randomBytes(16).toString("hex");
  gTree.push({
            name: "Existing configuration",
            type: "existingConfiguration",
            guid: sGUID,
            existingTreeGuid: sGUID,
            newTreeGuid: "",
            instructionsTreeGuid: gObjTree[2][0].guid,
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
  gTree.push({
            name: "system" + ((gObjAllData.os.hostname !== "") ? " - " + gObjAllData.os.hostname : ""),
            hostname: gObjAllData.os.hostname,
            manufacturer: gObjAllData.system.manufacturer,
            model: gObjAllData.system.model,
            chassisType: gObjAllData.chassis.type,
            serial: gObjAllData.system.serial,
            uuid: gObjAllData.system.uuid,
            sku: gObjAllData.system.sku,
            nodeEditable: false,
            nodeCanAddChildren: false,
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

  gTree.push({
            name: "hardware",
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
  gTree[TOP_HARDWARE].children.push({
            name: "motherboard",
            manufacturer: gObjAllData.baseboard.manufacturer,
            model: gObjAllData.baseboard.model,
            version: gObjAllData.baseboard.version,
            serial: gObjAllData.baseboard.serial,
            assetTag: gObjAllData.baseboard.assetTag,
            nodeEditable: false,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}


function addCPUInfo() {
  //console.log("addCPUInfo: called");
  gTree[TOP_HARDWARE].children.push({
            name: "CPU",
            manufacturer: gObjAllData.cpu.manufacturer,
            brand: gObjAllData.cpu.brand,
            vendor: gObjAllData.cpu.vendor,
            family: gObjAllData.cpu.family,
            model: gObjAllData.cpu.model,
            stepping: gObjAllData.cpu.stepping,
            revision: gObjAllData.cpu.revision,
            flags: gObjAllData.cpu.flags,
            nodeEditable: false,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}

function addRAMInfo() {
  //console.log("addRAMInfo: called");

  var nSizeBytes = 0;

  // tricky: on Linux, without admin/root privileges, memLayout[] will be empty

  if (gObjAllData.memLayout.length > 0) {
    for (var i = 0; i < gObjAllData.memLayout.length; i++) {
      nSizeBytes += gObjAllData.memLayout[i].size;
    }
  } else {
    nSizeBytes += gObjAllData.mem.total;
  }

  gTree[TOP_HARDWARE].children.push({
            name: "RAM",
            sizeBytes: nSizeBytes,
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




function addMouseTouchpadInfo() {
  //console.log("addMouseTouchpadInfo: called");
  gTree[TOP_HARDWARE].children.push({
            name: "mousetouchpad",
            nodeEditable: true,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}



function addAudioInfo() {
  //console.log("addAudioInfo: called");
  gTree[TOP_HARDWARE].children.push({
            name: "audio",
            nodeEditable: true,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}



function addDiskInfo() {
  //console.log("addDiskInfo: called");
  let windowsDeviceNames = [ "C:", "D:", "E:", "F:", "G:", "H:", "I:", "J:", "K:", "L:", "M:" ];

  if (!gbPrivilegedUser) {
    var sInstruction = "The SMART status of your disks can not be determined because you are not running this application with administrator privileges.";
    var sDetail = "";
    var nodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, sInstruction, sDetail, gTree[TOP_HARDWARE].nodeId, 0);
  }

  console.log("addDiskInfo: gObjAllData.diskLayout.length " + gObjAllData.diskLayout.length);
  for (var i = 0; i < gObjAllData.diskLayout.length; i++) {

    //console.log("addDiskInfo: gObjAllData.diskLayout[" + i + "] " + JSON.stringify(gObjAllData.diskLayout[i]));
    var fulldevicename = gObjAllData.diskLayout[i].device;
    var name = "";
    if (fulldevicename === "") {
      // happens on Windows
      fulldevicename = windowsDeviceNames[i];
      name = fulldevicename;
    } else {
      var n = fulldevicename.lastIndexOf(path.sep);
      name = fulldevicename.substr(n+1);
    }
    //console.log("addDiskInfo: fulldevicename " + fulldevicename + ", path.sep " + path.sep + ", n " + n + ", name " + name);

    var type = (gObjAllData.diskLayout[i].type === "HD" ? "hardDisk" : "");
    var removable = (gObjAllData.diskLayout[i].interfaceType === "USB");

    // To be able to detect S.M.A.R.T. status on Linux you need to install smartmontools.
    // On DEBIAN based linux distributions you can install it by running sudo apt-get install smartmontools
    // https://www.smartmontools.org/
    // Man pages:
    //    man 8 smartctl
    //    man 8 smartd
    //    man 8 update-smart-drivedb
    //    man 5 smartd.conf
    // CLI commands:
    //    sudo smartctl --health /dev/sda
    //    sudo smartctl --info /dev/sda
    //    sudo smartctl --xall /dev/sda | more

    // tricky: on Linux, without admin/root privileges, SMART status of all disks will be "unknown"

    var objDisk = new Object({
              name: name,
              type: gObjAllData.diskLayout[i].type,
              removable: removable,
              vendor: gObjAllData.diskLayout[i].vendor,
              model: gObjAllData.diskLayout[i].name,
              firmwareRevision: gObjAllData.diskLayout[i].firmwareRevision,
              serialNum: gObjAllData.diskLayout[i].serialNum,
              interfaceType: gObjAllData.diskLayout[i].interfaceType,
              smartStatus: gObjAllData.diskLayout[i].smartStatus,
              sizeBytes: gObjAllData.diskLayout[i].size,
              hardwareEncryptionSupported: false,
              hardwareEncryptionEnabled: false,
              nodeEditable: true,
              nodeCanAddChildren: true,
              nodeStatus: "existing",
              nodeId: gNextNodeId++,
              children: []
              });

    if (gbPrivilegedUser && (gObjAllData.diskLayout[i].type === "HD") && (gObjAllData.diskLayout[i].smartStatus !== "Ok")) {
      var sInstruction = "Your disk '" + name + "' is giving SMART status of '" + gObjAllData.diskLayout[i].smartStatus + "'.";
      var sDetail = "";
      var nodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, sInstruction, sDetail, objDisk.nodeId, 0);
    }

    let MAXPARTNUM = 9;
    for (var k = 1; k<=MAXPARTNUM; k++) {

      var subDevName = "";

      switch (gnExistingSystemType) {
        case SYSTEMTYPE_LINUX:
        case SYSTEMTYPE_MACOSX:
          subDevName = fulldevicename + k;
          break;
        case SYSTEMTYPE_WINDOWS:
          subDevName = windowsDeviceNames[k];
          break;
      }

      var uuid = "";

      for (var j = 0; j < gObjAllData.blockDevices.length; j++) {
          //console.log("addDiskInfo: want name " + name + k + ", see gObjAllData.blockDevices[j].name " + gObjAllData..blockDevices[j].name);
          if (gObjAllData.blockDevices[j].name === name + k) {
            uuid = gObjAllData.blockDevices[j].uuid;
            break;
          }
      }

      for (var j = 0; j < gObjAllData.fsSize.length; j++) {
          //console.log("addDiskInfo: want subDevName " + subDevName + ", see gObjAllData.fsSize[j].fs " + gObjAllData.fsSize[j].fs);
          if (gObjAllData.fsSize[j].fs === subDevName) {
            objDisk.children.push({
              name: name + k,
              fullName: gObjAllData.fsSize[j].fs,
              type: "partition",
              sizeBytes: gObjAllData.fsSize[j].size,
              fsType: gObjAllData.fsSize[j].type,
              mount: gObjAllData.fsSize[j].mount,
              UUID: uuid,
              nodeEditable: true,
              nodeCanAddChildren: false,
              nodeStatus: "existing",
              nodeId: gNextNodeId++,
              children: []
              });
            if (gObjAllData.fsSize[j].mount === path.sep + "boot") {
              // we've found the boot partition for the current OS
              gBootPartitionUUID = uuid;
            }
            if (gObjAllData.fsSize[j].mount === path.sep) {
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
      
  var objControllers = new Object({
    name: "graphicsControllers",
    nodeEditable: false,
    nodeCanAddChildren: true,
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
    children: []
  });

  for (var i = 0; i < gObjAllData.graphics.controllers.length; i++) {
    objControllers.children.push({
      name: "graphicsController" + i,
      vendor: gObjAllData.graphics.controllers[i].vendor,
      model: gObjAllData.graphics.controllers[i].model,
      bus: gObjAllData.graphics.controllers[i].bus,
      vram: gObjAllData.graphics.controllers[i].vram,
      vramDynamic: gObjAllData.graphics.controllers[i].vramDynamic,
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

  for (var i = 0; i < gObjAllData.graphics.displays.length; i++) {
    objDisplays.children.push({
      name: "display" + i,
      vendor: gObjAllData.graphics.displays[i].vendor,
      model: gObjAllData.graphics.displays[i].model,
      main: gObjAllData.graphics.displays[i].main,
      builtin: gObjAllData.graphics.displays[i].builtin,
      connection: gObjAllData.graphics.displays[i].connection,
      sizex: gObjAllData.graphics.displays[i].sizex,
      sizey: gObjAllData.graphics.displays[i].sizey,
      pixeldepth: gObjAllData.graphics.displays[i].pixeldepth,
      resolutionx: gObjAllData.graphics.displays[i].resolutionx,
      resolutiony: gObjAllData.graphics.displays[i].resolutiony,
      currentResX: gObjAllData.graphics.displays[i].currentResX,
      currentResY: gObjAllData.graphics.displays[i].currentResY,
      positionX: gObjAllData.graphics.displays[i].positionX,
      positionY: gObjAllData.graphics.displays[i].positionY,
      currentRefreshRate: gObjAllData.graphics.displays[i].currentRefreshRate,
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

  var objIfaces = new Object({
    name: "networkInterfaces",
    nodeEditable: false,
    nodeCanAddChildren: true,
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
    children: []
  });

  for (var i = 0; i < gObjAllData.net.length; i++) {
    if ((gObjAllData.net[i].type === "wired") || (gObjAllData.net[i].type === "wireless")) {
      objIfaces.children.push({
        name: gObjAllData.net[i].ifaceName,
        iface: gObjAllData.net[i].iface,
        mac: gObjAllData.net[i].mac,
        internal: gObjAllData.net[i].internal,
        type: gObjAllData.net[i].type,
        bus: gObjAllData.net[i].bus,
        bus: gObjAllData.net[i].bus,
        bus: gObjAllData.net[i].bus,
        bus: gObjAllData.net[i].bus,
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
    var bBootedFromUEFI = true;
    switch (gnExistingSystemType) {
      case SYSTEMTYPE_LINUX:
      case SYSTEMTYPE_MACOSX:
        // Does folder /sys/firmware/efi exist ?
        try {
          fs.accessSync("/sys/firmware/efi");
        } catch(e) {
          bBootedFromUEFI = false;
        }
        break;
      case SYSTEMTYPE_WINDOWS:
        // On Windows 10:
        // look for line "Detected boot environment: BIOS"
        // in huge file C:\Windows\Panther\setupact.log
        // ???
        bBootedFromUEFI = false;
        break;
    }

  gTree[TOP_SOFTWARE].children.push({
            name: "OS - " + gObjAllData.os.platform + " - " + gObjAllData.os.distro + " - " + gObjAllData.os.release,
            platform: gObjAllData.os.platform,
            distro: gObjAllData.os.distro,
            release: gObjAllData.os.release,
            codename: gObjAllData.os.codename,
            kernel: gObjAllData.os.kernel,
            arch: gObjAllData.os.arch,
            desktop: "",
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
    name: "applications and services",
    nodeEditable: false,
    nodeCanAddChildren: false,
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


function addSwapInfo() {
  //console.log("addSwapInfo: called");
  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children[OS_SETTINGS].children.push({
            name: "swap",
            swapTotalBytes: gObjAllData.mem.swaptotal,
            swapDevice: "",
            swapFile: "",
            nodeEditable: true,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}


function addBackgroundServicesInfo() {
  //console.log("addBackgroundServicesInfo: called");
  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children[OS_SETTINGS].children.push({
            name: "background services",
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}


function addSecurityInfo() {
  //console.log("addSecurityInfo: called");

  var objSecurity = Object({
            name: "security",
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  // https://www.npmjs.com/package/linux-sys-user
  

  objSecurity.children.push({
            name: "SSH keys",
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  // https://www.npmjs.com/package/node-ssh
  // https://www.npmjs.com/package/node-forge
  // https://www.npmjs.com/package/pkijs
  // https://www.npmjs.com/package/integrator-jsrsasign


  objSecurity.children.push({
            name: "PGP keys",
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  objSecurity.children.push({
            name: "Identity certificates",
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children[OS_SETTINGS].children.push(objSecurity);
}


// don't add standard items, just ones that the user added to the system
function addAppsAndServicesInfo() {
  console.log("addAppsAndServicesInfo: called");

  // to see running tasks/apps, use module "tasklist" ?

  // to list all files in dir:
  // https://stackfame.com/list-all-files-in-a-directory-nodejs

  // list everything in PATH:
  //  ls ${PATH//:/ }
  // or
  // for d in ${PATH//:/ } ; do 
  //    for f in $d/* ; do  
  //        test -x $f && test -f $f && echo $f
  //    done
  // done

  // https://unix.stackexchange.com/questions/20979/how-do-i-list-all-installed-programs
  // https://stackoverflow.com/questions/948008/linux-command-to-list-all-available-commands-and-aliases


  var objApps = new Object({
    name: "applications",
    nodeEditable: false,
    nodeCanAddChildren: true,
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
    children: []
  });

  console.log("addAppsAndServicesInfo: PATH " + process.env.PATH);
  // remove any item with "node" in it
  // assume nothing added in /bin, /sbin, /usr/bin, /usr/sbin, /usr/local/bin
  // add /opt
  // remove duplicates
  // add things likely to be added in some of the places we assumed nothing would be added
  // !!!
  const appsLinux = [
    { path: "/usr/bin/firefox", name: "Firefox", canHaveAddons: true },
    { path: "/opt/bogus", name: "bogus", canHaveAddons: true },
    { path: "/opt/thunderbird", name: "Thunderbird", canHaveAddons: true }
  ];

  var apps = new Array();

  switch (gnExistingSystemType) {
    case SYSTEMTYPE_LINUX: apps = appsLinux; break;
    case SYSTEMTYPE_MACOSX: break;
    case SYSTEMTYPE_WINDOWS: break;
  }

  for (var i = 0; i < apps.length; i++) {
    let filepath = apps[i].path.replace(/\//g, path.sep);

    var exists = true;
    try {
      fs.accessSync(filepath);
      //fs.statSync(filepath);
      //exists = fs.existsSync(filepath);
    } catch(e) {
      //console.log("addAppsAndServicesInfo: caught e " + e);
      exists = false;
    }
    //console.log("addAppsAndServicesInfo: i " + i + ", path " + apps[i].path + ", filepath " + filepath + ", exists " + exists);

    if (exists) {
      var obj = new Object({
                name: apps[i].name,
                nodeEditable: true,
                nodeCanAddChildren: true,
                nodeStatus: "existing",
                nodeId: gNextNodeId++,
                children: []
                });
      if (apps[i].canHaveAddons) {
        obj.children.push({
                  name: "addons",
                  nodeEditable: true,
                  nodeCanAddChildren: true,
                  nodeStatus: "existing",
                  nodeId: gNextNodeId++,
                  children: []
                  });
      }
      objApps.children.push(obj);
    }
  }

  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children[OS_APPSANDSERVICES].children.push(objApps);

  var objServices = new Object({
    name: "services",
    nodeEditable: false,
    nodeCanAddChildren: true,
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
    children: []
  });

  // SOMETHING !!!
  // https://www.2daygeek.com/how-to-check-all-running-services-in-linux/
  // https://www.tecmint.com/list-all-running-services-under-systemd-in-linux/

  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children[OS_APPSANDSERVICES].children.push(objServices);
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

    p = systeminformation.getStaticData()
      .then(data => {
      
        //console.log("scansystem: systeminformation.getStaticData(): " + JSON.stringify(data));

        gObjAllData = data;
/*
        switch (gObjAllData.os.platform) {
          case 'linux': gnExistingSystemType = SYSTEMTYPE_LINUX; break;
          case 'win32': gnExistingSystemType = SYSTEMTYPE_WINDOWS; break;
          case 'darwin': gnExistingSystemType = SYSTEMTYPE_MACOSX; break;
        }

        checkPrivilegedUser();
*/
        p = systeminformation.fsSize()
          .then(data => {

            //console.log("scansystem: systeminformation.fsSize(): " + JSON.stringify(data));

            gObjAllData.fsSize = data;

            p = systeminformation.mem()
              .then(data => {

                //console.log("scansystem: systeminformation.mem(): " + JSON.stringify(data));

                gObjAllData.mem = data;

                p = systeminformation.blockDevices()
                  .then(data => {

                    //console.log("scansystem: systeminformation.blockDevices(): " + JSON.stringify(data));

                    gObjAllData.blockDevices = data;

                    gObjAllData.time = systeminformation.time();

                    console.log("scansystem: gObjAllData: " + JSON.stringify(gObjAllData));

                    gTree = new Array();

                    addExistingConfigurationInfo();
                    addSystemInfo();
                    addMotherboardInfo();
                    addCPUInfo();
                    addRAMInfo();
                    addKeyboardInfo();
                    addMouseTouchpadInfo();
                    addAudioInfo();
                    addDiskInfo();
                    addGraphicsInfo();
                    addNetworkInterfaceInfo();

                    addBIOSInfo();
                    addOSInfo();

                    addTimeInfo();
                    addSwapInfo();
                    addBackgroundServicesInfo();
                    addSecurityInfo();

                    addAppsAndServicesInfo();
                    
                    console.log("scansystem: finished, gTree: " + JSON.stringify(gTree));

                    gObjTree[0] = gTree;

                    resolve(gTree);

                  })
                  .catch(error => console.log("scansystem: systeminformation.blockDevices() error: " + error));
              })
              .catch(error => console.log("scansystem: systeminformation.mem() error: " + error));
          })
          .catch(error => console.log("scansystem: systeminformation.fsSize() error: " + error));
      })
      .catch(error => console.log("scansystem: systeminformation.getAllData() error: " + error));
  });
}


//---------------------------------------------------------------------------
