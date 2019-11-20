//---------------------------------------------------------------------------
// "OS Installation Planner" scansystem.js
// Runs in Electron render process
//---------------------------------------------------------------------------

const osLocale = require('os-locale');
const os = require('os');
const systeminformation = require('systeminformation');

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
    ).catch(error => alert("systeminformation.mem() error: " + error));
  return promise;
}


function addDiskRecords() {
  // https://github.com/balena-io-modules/drivelist
}


function addPartitionRecordsForDisk() {
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

                //addDiskRecords()


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
}


//---------------------------------------------------------------------------
