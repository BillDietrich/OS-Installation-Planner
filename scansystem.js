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

// https://github.com/ukoloff/win-ca
const winca = require("win-ca/api");

// https://nodejs.org/api/child_process.html#child_process_child_process_execsync_command_options
const childprocess = require('child_process');



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



        var sCommand = "";
        var sOutput = "";

        switch (gnExistingSystemType) {
          case SYSTEMTYPE_LINUX:
          case SYSTEMTYPE_MACOSX:
            sCommand = "ls /lost+found";
            break;
          case SYSTEMTYPE_WINDOWS:
            sCommand = "net session";
            break;
        }

        try {
          sOutput = childprocess.execSync(sCommand);
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


function osNumToPlatform(nOS) {
  switch (nOS) {
    case SYSTEMTYPE_LINUX: return("linux");
    case SYSTEMTYPE_WINDOWS: return("win32");
    case SYSTEMTYPE_MACOSX: return("darwin");
  }
}


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
//    relatedNodeIds: [],
//    UIPermissions: "PCDEN",  // Properties / Clone / Delete / Edit / New Child
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
const OS_INSTALLEDAPPLICATIONS = 2;
const OS_INSTALLEDSERVICES = 3;

// indices in the hardware children array
const HARDWARE_MOTHERBOARD = 0;
const HARDWARE_CPU = 1;
const HARDWARE_RAM = 2;
const HARDWARE_KEYBOARD = 3;
const HARDWARE_MOUSETOUCHPAD = 4;
const HARDWARE_AUDIO = 5;
const HARDWARE_DISKS = 6;
const HARDWARE_GRAPHICSCONTROLLERS = 7;
const HARDWARE_DISPLAYS = 8;
const HARDWARE_NETWORKINTERFACES = 9;



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
            relatedNodeIds: [],
            UIPermissions: "Pcden",
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
            relatedNodeIds: [],
            UIPermissions: "Pcden",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gTree.push({
            name: "software",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gTree.push({
            name: "hardware",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
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
            relatedNodeIds: [],
            UIPermissions: "Pcden",
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
            relatedNodeIds: [],
            UIPermissions: "Pcden",
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
            relatedNodeIds: [],
            UIPermissions: "Pcden",
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
            relatedNodeIds: [],
            UIPermissions: "Pcden",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}




function addMouseTouchpadInfo() {
  //console.log("addMouseTouchpadInfo: called");
  gTree[TOP_HARDWARE].children.push({
            name: "mousetouchpad",
            relatedNodeIds: [],
            UIPermissions: "PcdEn",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}



function addAudioInfo() {
  //console.log("addAudioInfo: called");
  gTree[TOP_HARDWARE].children.push({
            name: "audio",
            relatedNodeIds: [],
            UIPermissions: "Pcden",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}



function addDiskInfo() {
  //console.log("addDiskInfo: called");

  gTree[TOP_HARDWARE].children.push({
            name: "disks",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  let windowsDeviceNames = [ "C:", "D:", "E:", "F:", "G:", "H:", "I:", "J:", "K:", "L:", "M:" ];

  if (!gbPrivilegedUser) {
    var sInstruction = "Disk SMART status.";
    var sDetail = "";
    var nodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, sInstruction, sDetail, [gTree[TOP_HARDWARE].children[HARDWARE_DISKS].nodeId]);
    gTree[TOP_HARDWARE].children[HARDWARE_DISKS].relatedNodeIds.push(nodeId);

    sInstruction = "SMART status of the disks can not be determined because this application has been run without administrator privileges.";
    sDetail = "";
    nodeId = addInstruction(nodeId, sInstruction, sDetail, [gTree[TOP_HARDWARE].children[HARDWARE_DISKS].nodeId]);
    gTree[TOP_HARDWARE].children[HARDWARE_DISKS].relatedNodeIds.push(nodeId);
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
              relatedNodeIds: [],
              UIPermissions: "Pcden",
              nodeStatus: "existing",
              nodeId: gNextNodeId++,
              children: []
              });

    if (gbPrivilegedUser && (gObjAllData.diskLayout[i].type === "HD") && (gObjAllData.diskLayout[i].smartStatus !== "Ok")) {
      var sInstruction = "Disk SMART status";
      var sDetail = "";
      var nodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, sInstruction, sDetail, [objDisk.nodeId]);
      objDisk.relatedNodeIds.push(nodeId);

      sInstruction = "Disk '" + name + "' has SMART status of '" + gObjAllData.diskLayout[i].smartStatus + "'.";
      sDetail = "";
      nodeId = addInstruction(nodeId, sInstruction, sDetail, [objDisk.nodeId]);
      objDisk.relatedNodeIds.push(nodeId);
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
              relatedNodeIds: [],
              UIPermissions: "Pcden",
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
            // CHECK DIRTY BIT !!!
            break;
          }
      }

    }

    gTree[TOP_HARDWARE].children[HARDWARE_DISKS].children.push(objDisk);

  }
  console.log("addDiskInfo: return " + JSON.stringify(objDisk));

  // https://github.com/balena-io-modules/drivelist
}


function addGraphicsInfo() {
      
  var objControllers = new Object({
    name: "graphicsControllers",
    relatedNodeIds: [],
    UIPermissions: "Pcden",
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
      relatedNodeIds: [],
      UIPermissions: "Pcden",
      nodeStatus: "existing",
      nodeId: gNextNodeId++,
      children: []
      });
  }

  gTree[TOP_HARDWARE].children.push(objControllers);

  var objDisplays = new Object({
    name: "displays",
    relatedNodeIds: [],
    UIPermissions: "Pcden",
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
      relatedNodeIds: [],
      UIPermissions: "Pcden",
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
    relatedNodeIds: [],
    UIPermissions: "Pcden",
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
        relatedNodeIds: [],
        UIPermissions: "Pcden",
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
            relatedNodeIds: [],
            UIPermissions: "Pcden",
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
            ostypenum: gnExistingSystemType,
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
            relatedNodeIds: [],
            UIPermissions: "Pcden",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children.push({
    name: "settings",
    relatedNodeIds: [],
    UIPermissions: "PcdeN",
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
    children: []
  });

  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children.push({
    name: "connections",
    relatedNodeIds: [],
    UIPermissions: "PcdeN",
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
    children: []
  });

  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children.push({
    name: "installed applications",
    relatedNodeIds: [],
    UIPermissions: "Pcden",
    nodeStatus: "existing",
    nodeId: gNextNodeId++,
    children: []
  });

  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children.push({
    name: "installed services",
    relatedNodeIds: [],
    UIPermissions: "Pcden",
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
            relatedNodeIds: [],
            UIPermissions: "PcdEn",
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
            relatedNodeIds: [],
            UIPermissions: "PcdEn",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}


function addRunningServicesInfo() {
  //console.log("addRunningServicesInfo: called");
  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children[OS_SETTINGS].children.push({
            name: "running background services",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}


function addPeriodicJobsInfo() {
  //console.log("addPeriodicJobsInfo: called");
  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children[OS_SETTINGS].children.push({
            name: "periodic jobs",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });
}


function addSecurityInfo() {
  //console.log("addSecurityInfo: called");

/*
Windows:
Get-ChildItem cert:\ -Recurse
Get-ChildItem -Path Cert:\* -Recurse -CodeSigningCert
Get-ChildItem -Path Cert:\* -Recurse SSLServerAuthentication
https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.security/about/about_certificate_provider?view=powershell-6

https://github.com/ukoloff/win-ca
https://example-code.com/nodejs/cert.asp

Linux:
find /etc/ssl -name '*.pem' -print | grep "\.pem$" | xargs -I{} openssl x509 -subject -noout -in {}
*/

  var arrCertNames = null;
  switch (gnExistingSystemType) {
    case SYSTEMTYPE_LINUX:
    case SYSTEMTYPE_MACOSX:
      let sCommand = "find /etc/ssl -name '*.pem' -print | xargs -I{} openssl x509 -subject -nameopt=sname -noout -in {} | sed 's/^.*\\/CN=\\(.*\\)$/\\1/' | sed 's/^.*\\/OU=\\(.*\\)$/\\1/' | sed 's/^.*\\/O=\\(.*\\)$/\\1/' | sort";
      console.log("addSecurityInfo: sCommand " + sCommand);
      /*
      childprocess.exec(
        sCommand,
        {
          //cwd: '/home/user/directory'
        },
        function(error, stdout, stderr) {
          console.log("addSecurityInfo: openssl error " + JSON.stringify(error));
          console.log("addSecurityInfo: openssl stderr " + stderr);
          // work with result
          console.log("addSecurityInfo: openssl stdout " + stdout);
          var arrCertNames = stdout.split('\n');
          console.log("addSecurityInfo: arrCertNames " + JSON.stringify(arrCertNames));
        }
      );
      */
      var stdout = childprocess.execSync(sCommand).toString();
      console.log("addSecurityInfo: openssl stdout " + stdout);
      arrCertNames = stdout.split('\n');
      console.log("addSecurityInfo: arrCertNames " + JSON.stringify(arrCertNames));
      break;
    case SYSTEMTYPE_WINDOWS:
      var list = winca({
                    format: winca.der2.pem,
                    store: ['root', 'ca', 'My', 'TrustedPublisher'],
                    unique: true
                  });
      console.log("addSecurityInfo: winca list " + JSON.stringify(list));
      arrCertNames = new Object();  // !!!
      break;
  }

  var arrStandardCertNames = null;

  switch (gnExistingSystemType) {
    case SYSTEMTYPE_LINUX:
    case SYSTEMTYPE_MACOSX:
      arrStandardCertNames = ["AAA Certificate Services","ACCV/C=ES","AC RAIZ FNMT-RCM","Actalis Authentication Root CA","AddTrust External CA Root","AffirmTrust Commercial","AffirmTrust Networking","AffirmTrust Premium","AffirmTrust Premium ECC","Amazon Root CA 1","Amazon Root CA 2","Amazon Root CA 3","Amazon Root CA 4","Atos/C=DE","Autoridad de Certificacion Firmaprofesional CIF A62634068","Baltimore CyberTrust Root","Buypass Class 2 Root CA","Buypass Class 3 Root CA","CA Disig Root R2","Certigna","Certinomis - Root CA","Certplus Root CA G1","Certplus Root CA G2","certSIGN ROOT CA","Certum Trusted Network CA","Certum Trusted Network CA 2","CFCA EV ROOT","Chambers of Commerce Root - 2008","Class 2 Primary CA","COMODO Certification Authority","COMODO ECC Certification Authority","COMODO RSA Certification Authority","Cybertrust Global Root","Deutsche Telekom Root CA 2","DigiCert Assured ID Root CA","DigiCert Assured ID Root G2","DigiCert Assured ID Root G3","DigiCert Global Root CA","DigiCert Global Root G2","DigiCert Global Root G3","DigiCert High Assurance EV Root CA","DigiCert Trusted Root G4","DST Root CA X3","D-TRUST Root Class 3 CA 2 2009","D-TRUST Root Class 3 CA 2 EV 2009","EC-ACC","EE Certification Centre Root CA/emailAddress=pki@sk.ee","Entrust.net Certification Authority (2048)","Entrust Root Certification Authority","Entrust Root Certification Authority - EC1","Entrust Root Certification Authority - G2","ePKI Root Certification Authority","E-Tugra Certification Authority","GDCA TrustAUTH R5 ROOT","GeoTrust Global CA","GeoTrust Primary Certification Authority","GeoTrust Primary Certification Authority - G2","GeoTrust Primary Certification Authority - G3","GeoTrust Universal CA","GeoTrust Universal CA 2","Global Chambersign Root - 2008","GlobalSign","GlobalSign","GlobalSign","GlobalSign","GlobalSign Root CA","Go Daddy Class 2 Certification Authority","Go Daddy Root Certificate Authority - G2","Government Root Certification Authority","Hellenic Academic and Research Institutions ECC RootCA 2015","Hellenic Academic and Research Institutions RootCA 2011","Hellenic Academic and Research Institutions RootCA 2015","Hongkong Post Root CA 1","IdenTrust Commercial Root CA 1","IdenTrust Public Sector Root CA 1","ISRG Root X1","Izenpe.com","LuxTrust Global Root 2","Microsec e-Szigno Root CA 2009/emailAddress=info@e-szigno.hu","mint","NetLock Arany (Class Gold) F\\xC5\\x91tan\\xC3\\xBAs\\xC3\\xADtv\\xC3\\xA1ny","Network Solutions Certificate Authority","OISTE WISeKey Global Root GA CA","OISTE WISeKey Global Root GB CA","OpenTrust Root CA G1","OpenTrust Root CA G2","OpenTrust Root CA G3","QuoVadis Root CA 1 G3","QuoVadis Root CA 2","QuoVadis Root CA 2 G3","QuoVadis Root CA 3","QuoVadis Root CA 3 G3","QuoVadis Root Certification Authority","Secure Global CA","SecureSign RootCA11","SecureTrust CA","Security Communication RootCA1","Security Communication RootCA2","Sonera Class2 CA","SSL.com EV Root Certification Authority ECC","SSL.com EV Root Certification Authority RSA R2","SSL.com Root Certification Authority ECC","SSL.com Root Certification Authority RSA","Staat der Nederlanden EV Root CA","Staat der Nederlanden Root CA - G2","Staat der Nederlanden Root CA - G3","Starfield Class 2 Certification Authority","Starfield Root Certificate Authority - G2","Starfield Services Root Certificate Authority - G2","SwissSign Gold CA - G2","SwissSign Silver CA - G2","SZAFIR ROOT CA2","TeliaSonera Root CA v1","thawte Primary Root CA","thawte Primary Root CA - G2","thawte Primary Root CA - G3","TrustCor ECA-1","TrustCor RootCert CA-1","TrustCor RootCert CA-2","Trustis FPS Root CA","T-TeleSec GlobalRoot Class 2","T-TeleSec GlobalRoot Class 3","TUBITAK Kamu SM SSL Kok Sertifikasi - Surum 1","TWCA Global Root CA","TWCA Root Certification Authority","T\\xC3\\x9CRKTRUST Elektronik Sertifika Hizmet Sa\\xC4\\x9Flay\\xC4\\xB1c\\xC4\\xB1s\\xC4\\xB1 H5","USERTrust ECC Certification Authority","USERTrust RSA Certification Authority","VeriSign Class 3 Public Primary Certification Authority - G3","VeriSign Class 3 Public Primary Certification Authority - G4","VeriSign Class 3 Public Primary Certification Authority - G5","VeriSign Universal Root Certification Authority","Visa eCommerce Root","XRamp Global Certification Authority"];
      break;
    case SYSTEMTYPE_WINDOWS:
      arrStandardCertNames = new Object();  // !!!
      break;
  }

  // remove any empty names or standard names
  // !!!
  i = 0;
  while (i < arrCertNames.length) {
    var j = 0;
    while ((i < arrCertNames.length) && (j < arrStandardCertNames.length)) {
      if ((arrCertNames[i] === "") || (arrCertNames[i] === arrStandardCertNames[j])) {
        arrCertNames.splice(i, 1);
        j = 0;
      } else
        j++;
    }
    i++;
  }
  console.log("addSecurityInfo: now arrCertNames " + JSON.stringify(arrCertNames));


  var objSecurity = Object({
            name: "security",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  // https://www.npmjs.com/package/linux-sys-user
  

  objSecurity.children.push({
            name: "SSH keys",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
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
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  objSecurity.children.push({
            name: "Identity certificates",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children[OS_SETTINGS].children.push(objSecurity);
}


// don't add standard items, just ones that the user added to the system
function addInstalledApplicationsInfo() {
  console.log("addInstalledApplicationsInfo: called");

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

  var sPathSplitChar = " ";
  switch (gnExistingSystemType) {
    case SYSTEMTYPE_LINUX: sPathSplitChar = ":"; break;
    case SYSTEMTYPE_MACOSX: sPathSplitChar = ":"; break;
    case SYSTEMTYPE_WINDOWS: sPathSplitChar = ";"; break;
  }
  console.log("addInstalledApplicationsInfo: PATH " + process.env.PATH);
  var arrPathDirs = process.env.PATH.split(sPathSplitChar);
  console.log("addInstalledApplicationsInfo: arrPathDirs " + JSON.stringify(arrPathDirs));

  switch (gnExistingSystemType) {

    case SYSTEMTYPE_LINUX:
    case SYSTEMTYPE_MACOSX:
      // remove any item that is empty or "."
      // remove any item with "node", ".local", ".rvm", "wine" in it
      var i = 0;
      while (i < arrPathDirs.length) {
        if (
            (arrPathDirs[i] === "")
            || (arrPathDirs[i] === ".")
            || (arrPathDirs[i].includes("node"))
            || (arrPathDirs[i].includes(".local"))
            || (arrPathDirs[i].includes(".rvm"))
            || (arrPathDirs[i].includes("wine"))
            )
          arrPathDirs.splice(i, 1);
        else
          i++;
      }
      // assume nothing added in /bin, /sbin, /usr/bin, /usr/sbin, /usr/local/bin
      i = 0;
      while (i < arrPathDirs.length) {
        if (
            (arrPathDirs[i] === "/bin")
            || (arrPathDirs[i] === "/sbin")
            || (arrPathDirs[i] === "/usr/bin")
            || (arrPathDirs[i] === "/usr/sbin")
            || (arrPathDirs[i] === "/usr/local/bin")
            )
          arrPathDirs.splice(i, 1);
        else
          i++;
      }
      console.log("addInstalledApplicationsInfo: now arrPathDirs " + JSON.stringify(arrPathDirs));
      // add /opt
      arrPathDirs.push("/opt");
    break;

    case SYSTEMTYPE_WINDOWS:
      // remove any item that is empty or "."
      // remove any item with ":\windows" in it
      var i = 0;
      while (i < arrPathDirs.length) {
        if (
            (arrPathDirs[i] === "")
            || (arrPathDirs[i] === ".")
            || (arrPathDirs[i].toLowerCase().includes(":\\windows"))
            )
          arrPathDirs.splice(i, 1);
        else
          i++;
      }
      console.log("addInstalledApplicationsInfo: now arrPathDirs " + JSON.stringify(arrPathDirs));
      // add C:\Program Files, C:\Program Files (x86)
      arrPathDirs.push("C:\\Program Files");
      arrPathDirs.push("C:\\Program Files (x86)");
      break;

  };

  // remove duplicates
  i = 0;
  while (i < arrPathDirs.length) {
    var j = i+1;
    while (j < arrPathDirs.length) {
      if (arrPathDirs[i] === arrPathDirs[j])
        arrPathDirs.splice(j, 1);
      else
        j++;
    }
    i++;
  }

  console.log("addInstalledApplicationsInfo: now2 arrPathDirs " + JSON.stringify(arrPathDirs));

  var actualApps = new Array();

  // get all files in the dirs
  for (i = 0; i < arrPathDirs.length; i++) {
    var arrsFilename = fs.readdirSync(arrPathDirs[i]);
    console.log("addInstalledApplicationsInfo: arrPathDirs[" + i + "] filenames " + JSON.stringify(arrsFilename));
    for (var j = 0; j < arrsFilename.length; j++) {
      var bCanHaveAddons = false;
      // tweaks
      if (arrsFilename[j].includes("thunderbird"))
        bCanHaveAddons = true;
      // on Windows, keep only names that end with ".exe"
      if ((gnExistingSystemType != SYSTEMTYPE_WINDOWS)
            || (arrsFilename[j].toLowerCase().endsWith(".exe"))) {
        actualApps.push({
                      path: arrPathDirs[i] + path.sep + arrsFilename[j],
                      name: arrsFilename[j],
                      canHaveAddons: bCanHaveAddons
                    });
      }
    }
  }
  console.log("addInstalledApplicationsInfo: actualApps " + JSON.stringify(actualApps));

  // add things likely to be added in some of the places we assumed nothing would be added
  var possApps = null;

  switch (gnExistingSystemType) {

    case SYSTEMTYPE_LINUX:
    case SYSTEMTYPE_MACOSX:
      possApps = [
        { path: "/usr/bin/firefox", name: "Firefox", canHaveAddons: true },
        { path: "/usr/bin/chromium", name: "Chromium", canHaveAddons: true },
        { path: "/usr/bin/veracrypt", name: "Veracrypt", canHaveAddons: false },
        { path: "/usr/bin/keepassxc", name: "KeePassXC", canHaveAddons: false },
        { path: "/usr/bin/code", name: "VSCode", canHaveAddons: true },
        { path: "/usr/bin/code-exploration", name: "VSCode exploration", canHaveAddons: true }
      ];
      break;

    case SYSTEMTYPE_WINDOWS:
      possApps = [];
      break;
  };

  for (var i = 0; i < possApps.length; i++) {
    try {
      // could be an executable file or a directory, allow either
      filepath = possApps[i].path;
      //exists = fs.existsSync(filepath);
      fs.accessSync(filepath);
      //objStats = fs.statSync(filepath);
      //console.log("addInstalledApplicationsInfo: objStats " + JSON.stringify(objStats));
      //if (objStats.isFile() && ((objStats.mode & 0111) != 0))   // has execute permission
      actualApps.push(possApps[i]);
    } catch(e) {
      //console.log("addInstalledApplicationsInfo: caught e " + e);
    }
  }

  for (var i = 0; i < actualApps.length; i++) {
    var obj = new Object({
              name: actualApps[i].name,
              path: actualApps[i].path,
              relatedNodeIds: [],
              UIPermissions: "PCDEN",
              nodeStatus: "existing",
              nodeId: gNextNodeId++,
              children: []
              });
    if (actualApps[i].canHaveAddons) {
      obj.children.push({
                name: "addons",
                relatedNodeIds: [],
                UIPermissions: "PCDEN",
                nodeStatus: "existing",
                nodeId: gNextNodeId++,
                children: []
                });
    }
    gTree[TOP_SOFTWARE].children[SOFTWARE_OS].children[OS_INSTALLEDAPPLICATIONS].children.push(obj);
  }
}


// don't add standard items, just ones that the user added to the system
function addInstalledServicesInfo() {
  console.log("addInstalledServicesInfo: called");

  // to see running tasks/apps, use module "tasklist" ?

  // SOMETHING !!!
  // https://www.2daygeek.com/how-to-check-all-running-services-in-linux/
  // https://www.tecmint.com/list-all-running-services-under-systemd-in-linux/

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

    console.log("scansystem: time before getStaticData: " + (new Date()).toLocaleTimeString());
    p = systeminformation.getStaticData()
      .then(data => {

        console.log("scansystem: time after getStaticData: " + (new Date()).toLocaleTimeString());
      
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
                    addRunningServicesInfo();
                    addPeriodicJobsInfo();
                    addSecurityInfo();

                    addInstalledApplicationsInfo();
                    addInstalledServicesInfo();
                    
                    console.log("scansystem: finished, gTree: " + JSON.stringify(gTree));
                    console.log("scansystem: time finished: " + (new Date()).toLocaleTimeString());

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
