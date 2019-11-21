//---------------------------------------------------------------------------
// "OS Installation Planner" scansystem.js
// Runs in Electron render process
//---------------------------------------------------------------------------

const osLocale = require('os-locale');
const os = require('os');

// https://github.com/sebhildebrandt/systeminformation
const systeminformation = require('systeminformation');

// https://nodejs.org/api/path.html#path_path_parse_pathstring
const path = require('path');

//---------------------------------------------------------------------------


function addSystemRecord() {
  //alert("addSystemRecord: called");
  var promise = null;
  promise = systeminformation.system()
    .then(data => {
        //alert("addSystemRecord: got then");
        return '{ "name": "' + data.manufacturer + '", "type": "system", "removable": false, "model": "' + data.model + '", "serialNumber": "' + data.serial + '", "UUID": "' + data.uuid + '", "SKU": "' + data.sku + '", "children": []}';
      }
    ).catch(error => alert("systeminformation.system() error: " + error));
  //alert("addSystemRecord: return");
  return promise;
}


function addMotherboardRecord() {
  //alert("addMotherboardRecord: called");
  var promise = null;
  promise = systeminformation.baseboard()
    .then(data => {
      return '{ "name": "motherboard", "type": "motherboard", "manufacturer": "' + data.manufacturer + '", "removable": false, "model": "' + data.model + '", "serialNumber": "' + data.serial + '", "assetTag": "' + data.assetTag + '", "children": []}';
      }
    ).catch(error => alert("systeminformation.baseboard() error: " + error));
  return promise;
}


function addRAMRecord() {
  //alert("addRAMRecord: called");
  var promise = null;
  promise = systeminformation.mem()
    .then(data => {
      return '{ "name": "RAM0", "type": "RAM", "removable": false, "bytes": "' + data.total + '", "children": []}';
      }
    ).catch(error => alert("systeminformation.mem() error: " + error));
  return promise;
}


function addKeyboardRecord() {
  //alert("addKeyboardRecord: called");
  // gets system locale, not actual info about keyboard
  var promise = null;
  promise = osLocale()
    .then(data => {
        return '{ "name": "keyboard", "type": "keyboard", "removable": false, "language": "' + data + '", "children": []}';
      }
    ).catch(error => alert("osLocale() error: " + error));
  return promise;
}


var diskLayoutData = null;
var blockDevicesData = null;
var fsSizeData = null;

function getDiskInfo1() {
  var promise = null;
  promise = systeminformation.diskLayout()
    .then(data => {
      //alert("diskLayoutData " + JSON.stringify(data));
      diskLayoutData = data;
    }
    ).catch(error => alert("systeminformation.diskLayout() error: " + error));
  return promise;
}

function getDiskInfo2() {
  var promise = null;
  promise = systeminformation.blockDevices()
    .then(data => {
      //alert("blockDevicesData " + JSON.stringify(data));
      blockDevicesData = data;
    }
    ).catch(error => alert("systeminformation.blockDevices() error: " + error));
  return promise;
}

function getDiskInfo3() {
  var promise = null;
  promise = systeminformation.fsSize()
    .then(data => {
      //alert("fsSizeData " + JSON.stringify(data));
      fsSizeData = data;
    }
    ).catch(error => alert("systeminformation.fsSize() error: " + error));
  return promise;
}


function addDiskRecords() {
  //alert("addDiskRecords: called");

  var i = 0;
  var text = "";
  for (i = 0; i < diskLayoutData.length; i++) {

    //alert("addDiskRecords: diskLayoutData[" + i + "] " + JSON.stringify(diskLayoutData));
    var fulldevicename = diskLayoutData[i].device;
    var n = fulldevicename.lastIndexOf(path.sep);
    var name = fulldevicename.substr(n+1);
    //alert("addDiskRecords: fulldevicename " + fulldevicename + ", path.sep " + path.sep + ", n " + n + ", name " + name);

    var type = (diskLayoutData[i].type === "HD" ? "hardDisk" : "");
    var removable = (diskLayoutData[i].interfaceType === "USB");

    if (i > 0)
      text += ',';
    text += '{ "name": "' + name + '", "type": "' + type + '", "removable": ' + removable + ', "vendor": "' + diskLayoutData[i].vendor + '", "model": "' + diskLayoutData[i].name + '", "serialNumber": "' + diskLayoutData[i].serialNum + '", "sizeBytes": ' + diskLayoutData[i].size + ', "hardwareEncryptionSupported": false, "hardwareEncryptionEnabled": false, "children": [';

    var nSubDevsFound = 0;
    let MAXPARTNUM = 9;
    for (k = 1; k<=MAXPARTNUM; k++) {

      let subDevName = fulldevicename + k;
      var uuid = "";

      for (j = 0; j < blockDevicesData.length; j++) {
          //alert("addDiskRecords: want name " + name + k + ", see blockDevicesData[j].name " + blockDevicesData[j].name);
          if (blockDevicesData[j].name === name + k) {
            uuid = blockDevicesData[j].uuid;
            break;
          }
      }

      for (j = 0; j < fsSizeData.length; j++) {
          //alert("addDiskRecords: want subDevName " + subDevName + ", see fsSizeData[j].fs " + fsSizeData[j].fs);
          if (fsSizeData[j].fs === subDevName) {
            if (nSubDevsFound > 0)
              text += ',';
            text += '{ "name": "' + name + k + '", "type": "partition", "start": 0, "sizeBytes":' + fsSizeData[j].size + ', "label": "boot", "fsType": "' + fsSizeData[j].type + '", "UUID": "' + uuid + '", "encryption": "none", "children": [] }';
            nSubDevsFound++;
            break;
          }
      }

    }

    text += ']}';

  }
  //alert("addDiskRecords: return " + JSON.stringify(text));
  return text;

  // https://github.com/balena-io-modules/drivelist
}


function addGraphicsRecords() {
  var promise = null;
  promise = systeminformation.graphics()
    .then(data => {
      //alert("addGraphicsRecord: " + JSON.stringify(data));
      var text = "";
      var nFound = 0;
      
      var controllers = data.controllers;
      for (i = 0; i < controllers.length; i++) {
        if (nFound > 0)
          text += ',';
        text += '{ "name": "graphicsController' + i + '", "vendor":"' + controllers[i].vendor + '", "model":"' + controllers[i].model + '", "vram":' + controllers[i].vram + ', "vramDynamic":' + controllers[i].vramDynamic + ', "children": [] }';
        nFound++;
      }
      
      var displays = data.displays;
      for (i = 0; i < displays.length; i++) {
        if (nFound > 0)
          text += ',';
        text += '{ "name": "display' + i + '", "vendor":"' + displays[i].vendor + '", "model":"' + displays[i].model + '", "main":' + displays[i].main + ', "builtin":' + displays[i].builtin + ', "connection":"' + displays[i].connection + '", "sizex":' + displays[i].sizex + ', "sizey":' + displays[i].sizey + ', "pixeldepth":' + displays[i].pixeldepth + ', "resolutionx":' + displays[i].resolutionx + ', "resolutiony":' + displays[i].resolutiony + ', "currentResX":' + displays[i].currentResX + ', "currentResY":' + displays[i].currentResY + ', "positionX":' + displays[i].positionX + ', "positionY":' + displays[i].positionY + ', "currentRefreshRate":' + displays[i].currentRefreshRate + ', "children": [] }';
        nFound++;
      }

      return text;
    }
    ).catch(error => alert("systeminformation.graphics() error: " + error));
  return promise;
}


function addNetworkInterfaceRecords() {
  var promise = null;
  promise = systeminformation.networkInterfaces()
    .then(data => {
      //alert("addNetworkInterfaceRecords: " + JSON.stringify(data));
      var text = "";
      var nFound = 0;
            
      for (i = 0; i < data.length; i++) {
        if ((data[i].type === "wired") || (data[i].type === "wireless")) {
          if (nFound > 0)
            text += ',';
          text += '{ "name": "' + data[i].ifaceName + '", "mac":"' + data[i].mac + '", "type":"' + data[i].type + '", "children": [] }';
          nFound++;
        }
      }

      return text;
    }
    ).catch(error => alert("systeminformation.networkInterfaces() error: " + error));
  return promise;
}


function addBIOSRecord() {
  var promise = null;
  promise = systeminformation.bios()
    .then(data => {
      treetext += ',{ "name": "BIOS", "type": "BIOS", "removable": false, "vendor": "' + data.vendor + '", "version": "' + data.version + '", "releaseDate": "' + data.releaseDate + '", "revision": "' + data.revision + '", "children": []}';
      }
    ).catch(error => alert("systeminformation.bios() error: " + error));
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
        alert("JSON.stringify(stdout): " + JSON.stringify(stdout));
      }
    );
  }

  if (false) {
    // https://nodejs.org/api/os.html
    alert("os.hostname(): " + os.hostname());
    alert("os.platform(): " + os.platform());
    alert("os.type(): " + os.type());
    alert("os.release(): " + os.release());
    alert("os.totalmem(): " + os.totalmem());
    var networkInterfaces = os.networkInterfaces();
    alert("JSON.stringify(networkInterfaces): " + JSON.stringify(networkInterfaces));
  }


  if (false) {
    // https://github.com/sebhildebrandt/systeminformation
    systeminformation.system()
      .then(data => alert("systeminformation.system(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.system() error: " + error));
    systeminformation.cpu()
      .then(data => alert("systeminformation.cpu(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.cpu() error: " + error));
    systeminformation.bios()
      .then(data => alert("systeminformation.bios(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.bios() error: " + error));
    systeminformation.baseboard()
      .then(data => alert("systeminformation.baseboard(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.baseboard() error: " + error));
    systeminformation.chassis()
      .then(data => alert("systeminformation.chassis(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.chassis() error: " + error));
    systeminformation.mem()
      .then(data => alert("systeminformation.mem(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.mem() error: " + error));
    systeminformation.graphics()
      .then(data => alert("systeminformation.graphics(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.graphics() error: " + error));
    systeminformation.osInfo()
      .then(data => alert("systeminformation.osInfo(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.osInfo() error: " + error));

/*
    // takes a LONG time
    systeminformation.services("*")
      .then(data => alert("systeminformation.services(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.services() error: " + error));
*/

    systeminformation.diskLayout()
      .then(data => alert("systeminformation.diskLayout(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.diskLayout() error: " + error));
    systeminformation.blockDevices()
      .then(data => alert("systeminformation.blockDevices(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.blockDevices() error: " + error));
    systeminformation.fsSize()
      .then(data => alert("systeminformation.fsSize(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.fsSize() error: " + error));
    systeminformation.networkInterfaces()
      .then(data => alert("systeminformation.networkInterfaces(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.networkInterfaces() error: " + error));
    systeminformation.networkGatewayDefault()
      .then(data => alert("systeminformation.networkGatewayDefault(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.networkGatewayDefault() error: " + error));
    systeminformation.wifiNetworks()
      .then(data => alert("systeminformation.wifiNetworks(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.wifiNetworks() error: " + error));
    systeminformation.time()
      .then(data => alert("systeminformation.time(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.time() error: " + error));

    systeminformation.getStaticData()
      .then(data => console.log("systeminformation.getStaticData(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.getStaticData() error: " + error));
    systeminformation.getDynamicData()
      .then(data => console.log("systeminformation.getDynamicData(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.getDynamicData() error: " + error));
    systeminformation.getAllData()
      .then(data => console.log("systeminformation.getAllData(): " + JSON.stringify(data)))
      .catch(error => alert("systeminformation.getAllData() error: " + error));
  }


  return new Promise((resolve, reject) => {

    var treetext = '[{ "name": "Existing configuration", "type": "jsonFileLabel", "id": "123", "comparedId": "", "children": [] }';

    treetext += ',{ "name": "", "type": "systemLabel", "children": []}';

    treetext += ',{ "name": "hardware", "children": [';
    
    p = addSystemRecord()
      .then(text => {
        treetext += text;
        p = addMotherboardRecord()
          .then(text => {
            treetext += ',';
            treetext += text;
            p = addRAMRecord()
              .then(text => {
                treetext += ',';
                treetext += text;

                p = addKeyboardRecord()
                  .then(text => {
                    treetext += ',';
                    treetext += text;

                    p = getDiskInfo1()
                      .then(() => {

                        p = getDiskInfo2()
                          .then(() => {

                            p = getDiskInfo3()
                              .then(() => {

                                text = addDiskRecords();
                                if (text !== "")
                                  treetext += ',';
                                treetext += text;

                                p = addGraphicsRecords()
                                  .then(text => {
                                    treetext += ',';
                                    treetext += text;

                                    p = addNetworkInterfaceRecords()
                                      .then(text => {
                                        treetext += ',';
                                        treetext += text;

                                        // close hardware section
                                        treetext += ']}';

                                        treetext += ',{ "name": "software", "children": [';

                                        // close software section
                                        treetext += ']}';

                                        // close config
                                        treetext += ']';

                                        //alert("scansystem: finished treetext: " + treetext);
                                        resolve(treetext);
                                      });
                                  });
                              });
                          });
                      });
                  });
              });
          });
      });

  });
}


//---------------------------------------------------------------------------
