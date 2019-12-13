//// @ts-check
//---------------------------------------------------------------------------
// "OS Installation Planner" window.js
// Runs in Electron render process
//---------------------------------------------------------------------------

const {remote, dialog} = require('electron')

const loadJsonFile = require('load-json-file')

// https://cnpmjs.org/package/jsonfile
const jsonFile = require('jsonfile')

const TreeView = require('./treeview')

// https://www.npmjs.com/package/tree-printer
const treePrinter = require('tree-printer')



// info about installers:
// https://pay.reddit.com/r/linuxquestions/comments/e75mru/how_to_deploy_linux_from_the_local_drive_like_a/


// possible replacements for treeview
// FAR simpler:  https://www.w3schools.com/howto/howto_js_treeview.asp
// https://www.cssscript.com/tag/tree-view/





// tree to printable-text format
// https://github.com/notatestuser/treeify

// DOM tree to HTML format
// https://gist.github.com/mnewt/4331529

// printing text file to printer
// https://github.com/tojocky/node-printer



//---------------------------------------------------------------------------

var gObjTree = new Array(null, null, null);
var gObjTreeView = new Array(null, null, null);
var gsTreeFilename = new Array(null, null, null);
var gsTreeFilepathname = new Array(null, null, null);


//---------------------------------------------------------------------------


function loadTreeFromJSONFile(treenum) {
  //console.log("loadTreeFromJSONFile: called, ", treenum, filename);
  gObjTree[treenum] = loadJsonFile.sync(gsTreeFilename[treenum]);
  document.getElementById("t" + treenum + "filename").innerText = gsTreeFilename[treenum];
  refreshTreeView(treenum);
  //console.log("loadTreeFromJSONFile: gObjTree[treenum] ", gObjTree[treenum]);
  //console.log("loadTreeFromJSONFile: return");
}


function loadTreeFromText(treenum, text) {
  //console.log("loadTreeFromText: called, ", treenum, text);
  gsTreeFilename[treenum] = "";
  // don't wipe out the gsTreeFilepathname
  gObjTree[treenum] = JSON.parse(text);
  document.getElementById("t" + treenum + "filename").innerText = "";
  console.log("loadTreeFromText: gObjTree[treenum] ", gObjTree[treenum]);
  refreshTreeView(treenum);
  //console.log("loadTreeFromText: return");
}


function loadTree(treenum, objTree) {
  console.log("loadTree: called, ", treenum, JSON.stringify(objTree));
  gsTreeFilename[treenum] = "";
  // don't wipe out the gsTreeFilepathname
  gObjTree[treenum] = objTree;
  document.getElementById("t" + treenum + "filename").innerText = "";
  refreshTreeView(treenum);
  //console.log("loadTree: return");
}


// tree object has changed, refresh the view of it
function refreshTreeView(treenum) {
  console.log("refreshTreeView: called, ", treenum);
  gObjTreeView[treenum] = new TreeView(gObjTree[treenum], 't' + treenum + 'tree', treenum);
  gObjTreeView[treenum].expandAll();
  //console.log("refreshTreeView: return");
}


function saveTreeToJSONFile(treenum) {
  console.log("saveTreeToJSONFile: called, ", treenum);
  // https://www.w3schools.com/nodejs/nodejs_filesystem.asp
  //fs.writeFile(gsTreeFilename[treenum], 'utf8');
  //fs.writeFileSync(gsTreeFilepathname[treenum], JSON.stringify(gObjTree[treenum]));
  gObjTree[treenum][TOP_CONFIG].nextNodeId = gNextNodeId;
  try {
    jsonFile.writeFileSync(gsTreeFilepathname[treenum], gObjTree[treenum]);
  } catch(err) {
    console.log('saveTreeToJSONFile: error', err);
  }
  /*
  fs.writeFileSync(gsTreeFilepathname[treenum], JSON.stringify(gObjTree[treenum]), function(err) {
    if (err)
      console.log('saveTreeToJSONFile: error', err);
  });
  */
  console.log("saveTreeToJSONFile: return");
}


function saveTreeToTextFile(treenum) {
  console.log("saveTreeToTextFile: called, ", treenum);
  // https://www.npmjs.com/package/tree-printer
const treePrinter = require('tree-printer')
  gObjTree[treenum][TOP_CONFIG].nextNodeId = gNextNodeId;
  try {
    // @ts-ignore
    fs.writeFileSync(gsTreeFilepathname[treenum], treePrinter(gObjTree[treenum]));
  } catch(err) {
    console.log('saveTreeToTextFile: error', err);
  }
  console.log("saveTreeToTextFile: return");
}


function readTreeUsingDialog(treenum) {
  //console.log("readTreeUsingDialog: called, ", treenum);

  // https://electronjs.org/docs/api/dialog

  //dialog = remote.dialog;
  WIN = remote.getCurrentWindow();

  var buttonText = "";
  switch (treenum) {
    case 0: buttonText = "Read file of existing system's configuration"; break;
    case 1: buttonText = "Read file of new system's configuration"; break;
    case 2: buttonText = "Read file of instructions"; break;
  }
  var defaultPath = "";
  if (gsTreeFilepathname[treenum] === null) {
    switch (treenum) {
      // @ts-ignore
      case 0: defaultPath = __dirname + path.sep + "System-Existing.json"; break;
      case 1: defaultPath = __dirname + path.sep + "System-New.json"; break;
      case 2: defaultPath = __dirname + path.sep + "System-Instructions.json"; break;
    }
  }
  console.log("readTreeUsingDialog: defaultPath ", defaultPath);
  let options = {
    title : buttonText,
    defaultPath: defaultPath,
    buttonLabel : buttonText,
    filters :[ {name: 'json', extensions: ['json']} ],
    properties : ['openFile', 'createDirectory']
  };

  // https://electronjs.org/docs/api/dialog
  var p = dialog.showOpenDialog(WIN, options).then((retobj) => {
    console.log("readTreeUsingDialog: retobj.canceled ", retobj.canceled);
    if (!retobj.canceled) {
      console.log("readTreeUsingDialog: retobj.filePaths ", retobj.filePaths);
      gsTreeFilename[treenum] = path.parse(retobj.filePaths[0]).base;
      gsTreeFilepathname[treenum] = retobj.filePaths[0];
      document.getElementById("t" + treenum + "filename").innerText = gsTreeFilename[treenum];

      loadTreeFromJSONFile(treenum);
      refreshTreeView(treenum);
    }
  });

  console.log("readTreeUsingDialog: return");
}

function saveTreeUsingDialog(treenum) {
  //console.log("saveTreeUsingDialog: called, ", treenum);

  // https://electronjs.org/docs/api/dialog

  dialog = remote.dialog;
  WIN = remote.getCurrentWindow();

  var buttonText = "";
  switch (treenum) {
    case 0: buttonText = "Save existing system's configuration"; break;
    case 1: buttonText = "Save new system's configuration"; break;
    case 2: buttonText = "Save instructions"; break;
  }
  var defaultPath = "";
  if (gsTreeFilepathname[treenum] === null) {
    switch (treenum) {
      case 0: defaultPath = __dirname + path.sep + "System-Existing.json"; break;
      case 1: defaultPath = __dirname + path.sep + "System-New.json"; break;
      case 2: defaultPath = __dirname + path.sep + "System-Instructions.json"; break;
    }
  }
  console.log("saveTreeUsingDialog: defaultPath ", defaultPath);
  let options = {
    title : buttonText,
    defaultPath: defaultPath,
    buttonLabel : buttonText,
    filters :[
            { name: 'json', extensions: ['json'] },
            { name: 'printable text', extensions: ['txt'] }
            ]
  };

  var p = dialog.showSaveDialog(WIN, options).then((retobj) => {
    console.log("saveTreeUsingDialog: retobj.canceled ", retobj.canceled);
    if (!retobj.canceled) {
      console.log("saveTreeUsingDialog: retobj.filePath ", retobj.filePath);
      gsTreeFilename[treenum] = path.parse(retobj.filePath).base;
      gsTreeFilepathname[treenum] = retobj.filePath;
      document.getElementById("t" + treenum + "filename").innerText = gsTreeFilename[treenum];

      if (gsTreeFilename[treenum].endsWith(".json"))
        saveTreeToJSONFile(treenum);
      else
        saveTreeToTextFile(treenum);
    }
  });

  console.log("saveTreeUsingDialog: return");
}



//---------------------------------
// standard fields of a node:
//  {
//    name: "something",
//    ...
//    UIPermissions: "PCDEN",  // Properties / Clone / Delete / Edit / New Child
//    nodeStatus: "existing / added / deleted / changed",
//    nodeId: number,
//    children: []
//  }
//---------------------------------


function copyExistingTreeToNew(existingtreenum, newtreenum) {
  console.log("copyExistingTreeToNew: called");
  gsTreeFilename[newtreenum] = "";
  // don't wipe out the gsTreeFilepathname

  // clone whole object tree; can't just clone top object
  //var sTree = JSON.stringify(gObjTree[existingtreenum]);
  //var sTreeNew = sTree.replace(/nodeStatus:\"existing\"/g, "nodeStatus:\"existing\"");
  //gObjTree[newtreenum] = JSON.parse(sTreeNew);
  gObjTree[newtreenum] = JSON.parse(JSON.stringify(gObjTree[existingtreenum]));

  gObjTree[newtreenum][TOP_CONFIG].name = "New configuration";
  gObjTree[newtreenum][TOP_CONFIG].type = "newConfiguration";

  // modify UIPermissions in various parts of the tree
  // there can be multiple OS's
  for (var i = 0; i < gObjTree[newtreenum][TOP_SOFTWARE].children.length; i++) {
    if (gObjTree[newtreenum][TOP_SOFTWARE].children[i].ostypenum !== undefined)
      gObjTree[newtreenum][TOP_SOFTWARE].children[i].UIPermissions = "PCDEn";
  }
  // MORE !!!

  var sNewGUID = crypto.randomBytes(16).toString("hex");
  gObjTree[newtreenum][TOP_CONFIG].guid = sNewGUID;
  gObjTree[newtreenum][TOP_CONFIG].newTreeGuid = sNewGUID;
  gObjTree[existingtreenum][TOP_CONFIG].newTreeGuid = sNewGUID;
  gObjTree[2][TOP_CONFIG].newTreeGuid = sNewGUID;

  document.getElementById("t" + newtreenum + "filename").innerText = "";
  gObjTreeView[existingtreenum] = new TreeView(gObjTree[existingtreenum], 't' + existingtreenum + 'tree', existingtreenum);
  gObjTreeView[newtreenum] = new TreeView(gObjTree[newtreenum], 't' + newtreenum + 'tree', newtreenum);
  gObjTreeView[2] = new TreeView(gObjTree[2], 't' + 2 + 'tree', 2);
  //console.log("copyExistingTreeToNew: return");
}


// returns {node:objNode, parent:objParent}
function findNode(nodeId, objTree, objParent) {

  //console.log("findNode: called, nodeId " + nodeId);
  //console.log("findNode: Array.isArray(objTree) " + Array.isArray(objTree));
  //console.log("findNode: check nodeId " + objTree.nodeId);

  if (objParent === null) {
    // special case; top of tree, which is array of objects with no children[]
    for (var i = 0; i < objTree.length; i++) {
      //console.log("findNode: top: try array position " + i);
      var obj = findNode(nodeId, objTree[i], objTree);
      if (obj.node) {
        //console.log("findNode: top: success in array position " + i);
        return obj;
      }
    }
    //console.log("findNode: not in array");
    return {node:null, parent:null};
  }
  
  else if (objTree.nodeId === nodeId) {
    //console.log("findNode: success");
    return {node:objTree, parent:objParent};
  }
  
  else if (objTree.children.length == 0) {
    //console.log("findNode: no children");
    return {node:null, parent:null};
  }
  
  else {
    //console.log("findNode: check the children of " + objTree.nodeId);
    //console.log("findNode: array length " + objTree.children.length);
    for (var i = 0; i < objTree.children.length; i++) {
      //console.log("findNode: try array position " + i);
      var obj = findNode(nodeId, objTree.children[i], objTree);
      if (obj.node) {
        //console.log("findNode: success in array position " + i);
        return obj;
      }
    }
    //console.log("findNode: not in array");
    return {node:null, parent:null};
  }

  // never get here
  return {node:null, parent:null};
}


function makeAllNodeIdsUnique(objTree, treenum) {
  console.log("makeAllNodeIdsUnique: called, treenum " + treenum);

  objTree.nodeId = gNextNodeId++;
  console.log("makeAllNodeIdsUnique: objTree.nodeId set to " + objTree.nodeId);
  
  console.log("makeAllNodeIdsUnique: check the children of " + objTree.nodeId);
  console.log("makeAllNodeIdsUnique: array length " + objTree.children.length);
  for (var i = 0; i < objTree.children.length; i++) {
    console.log("makeAllNodeIdsUnique: try array position " + i);
    makeAllNodeIdsUnique(objTree.children[i], treenum);
  }
}


function doClone(nodeId, treenum) {
  console.log("doClone: called, nodeId " + nodeId + ", treenum " + treenum);

  var objNAP = findNode(nodeId, gObjTree[treenum], null);
  //console.log("doClone: found objNAP.node " + objNAP.node + " objNAP.parent " + objNAP.parent);
  console.log("doClone: found objNAP.node.nodeId " + objNAP.node.nodeId + " objNAP.parent.nodeId " + objNAP.parent.nodeId);
  console.log("doClone: found objNAP.node.name " + objNAP.node.name + " objNAP.parent.name " + objNAP.parent.name);

  // clone whole object tree; can't just clone top object
  var newObj = JSON.parse(JSON.stringify(objNAP.node));

  newObj.name = objNAP.node.name + " - clone";

  makeAllNodeIdsUnique(newObj, treenum);

  // insert into array after original object, don't put at end
  for (var i = 0; i < objNAP.parent.children.length; i++) {
    if (objNAP.parent.children[i].nodeId === nodeId) {
      objNAP.parent.children.splice(i+1, 0, newObj);
      break;
    }
  }
}


function doDelete(nodeId, treenum) {
  console.log("doDelete: called, nodeId " + nodeId + ", treenum " + treenum);

  var objNAP = findNode(nodeId, gObjTree[treenum], null);
  //console.log("doDelete: found objNAP.node " + objNAP.node + " objNAP.parent " + objNAP.parent);
  console.log("doDelete: found objNAP.node.nodeId " + objNAP.node.nodeId + " objNAP.parent.nodeId " + objNAP.parent.nodeId);
  console.log("doDelete: found objNAP.node.name " + objNAP.node.name + " objNAP.parent.name " + objNAP.parent.name);

  for (var i = 0; i < objNAP.parent.children.length; i++) {
    if (objNAP.parent.children[i].nodeId === nodeId) {
      console.log("doDelete: delete item " + i + " from array");
      objNAP.parent.children.splice(i, 1);
      break;
    }
  }
}




function convertOS(osNodeId, treenum, newostypenum, newosname) {
  console.log("convertOS: called, osNodeId " + osNodeId + ", treenum " + treenum + ", newostypenum " + newostypenum + ", newosname " + newosname);

  var objNAP = findNode(osNodeId, gObjTree[treenum], null);
  //console.log("doClone: found objNAP.node " + objNAP.node + " objNAP.parent " + objNAP.parent);
  console.log("convertOS: found objNAP.node.nodeId " + objNAP.node.nodeId + " objNAP.parent.nodeId " + objNAP.parent.nodeId);
  console.log("convertOS: found objNAP.node.name " + objNAP.node.name + " objNAP.parent.name " + objNAP.parent.name);

  if ((objNAP.ostypenum === SYSTEMTYPE_LINUX)
      && (newostypenum === SYSTEMTYPE_WINDOWS)) {

    console.log("convertOS: change linux to windows");

    objNAP.node.name = newosname;
    objNAP.node.platform = osNumToPlatform(newostypenum);
    objNAP.node.ostypenum = newostypenum;
    objNAP.node.distro = "Microsoft Windows 10 Home";
    objNAP.node.release = "";
    objNAP.node.codename = "";
    objNAP.node.kernel = "";
    objNAP.node.arch = "x64";
    objNAP.node.desktop = "";
    // objNAP.node.hostname
    objNAP.node.codepage = "";
    objNAP.node.logofile = "windows";
    objNAP.node.serial = "";
    objNAP.node.build = "";
    objNAP.node.servicepack = "";
    // objNAP.node.bootedFromUEFI
    objNAP.node.bootPartitionUUID = "";
    objNAP.node.rootPartitionUUID = "";

    var sInstruction = "Download new OS image.";
    var sDetail = "Download image for " + newosname + " from xxxxxxxxxxxx";
    var instrNodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, sInstruction, sDetail, [osNodeId]);
    objNAP.relatedNodeIds.push(instrNodeId);

  }

  console.log("convertOS: return");
}



function checkOSDiskPartitions(treenum) {
  console.log("checkOSDiskPartitions: called, treenum " + treenum);

  // there can be multiple OS's
  var usedPartitionUUIDs = [];
  for (var i = 0; i < gObjTree[treenum][TOP_SOFTWARE].children.length; i++) {
    var objOS = gObjTree[treenum][TOP_SOFTWARE].children[i];
    if (objOS.ostypenum !== undefined) {
      console.log("checkOSDiskPartitions: found OS, ostypenum " + objOS.ostypenum);

      switch (objOS.ostypenum) {

        case SYSTEMTYPE_LINUX:
        case SYSTEMTYPE_MACOSX:
          console.log("checkOSDiskPartitions: bootPartitionUUID " + objOS.bootPartitionUUID);
          if (objOS.bootPartitionUUID === "") {
            var sInstruction = "Boot partition not found for OS '" + objOS.name + "'";
            var sDetail = "";
            var instrNodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, sInstruction, sDetail, [objOS.nodeId]);
            objOS.relatedNodeIds.push(instrNodeId);
          } else {
            for (var j = 0; j < usedPartitionUUIDs.length; j++) {
              if (objOS.bootPartitionUUID === usedPartitionUUIDs[j].uuid) {
                var sInstruction = "Boot partition '" + objOS.bootPartitionUUID + "' used by two OS's";
                var sDetail = "OS '" + usedPartitionUUIDs[j].objOS.name + "' and OS '" + objOS.name + "' use same partition";
                var instrNodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, sInstruction, sDetail, [objOS.nodeId, usedPartitionUUIDs[j].objOS.nodeId]);
                objOS.relatedNodeIds.push(instrNodeId);
                usedPartitionUUIDs[j].objOS.relatedNodeIds.push(instrNodeId);
              }
            }
            usedPartitionUUIDs.push({uuid: objOS.bootPartitionUUID, objOS:objOS });
          }
          console.log("checkOSDiskPartitions: rootPartitionUUID " + objOS.rootPartitionUUID);
          if (objOS.rootPartitionUUID === "") {
            var sInstruction = "Root partition not found for OS '" + objOS.name + "'";
            var sDetail = "";
            var instrNodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, sInstruction, sDetail, [objOS.nodeId]);
            objOS.relatedNodeIds.push(instrNodeId);
          } else {
            for (var j = 0; j < usedPartitionUUIDs.length; j++) {
              if (objOS.rootPartitionUUID === usedPartitionUUIDs[j].uuid) {
                var sInstruction = "Root partition '" + objOS.rootPartitionUUID + "' used by two OS's";
                var sDetail = "OS '" + usedPartitionUUIDs[j].objOS.name + "' and OS '" + objOS.name + "' use same partition";
                var instrNodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, sInstruction, sDetail, [objOS.nodeId, usedPartitionUUIDs[j].objOS.nodeId]);
                objOS.relatedNodeIds.push(instrNodeId);
                usedPartitionUUIDs[j].objOS.relatedNodeIds.push(instrNodeId);
              }
            }
            usedPartitionUUIDs.push({uuid: objOS.rootPartitionUUID, objOS:objOS });
          }
          break;

        case SYSTEMTYPE_WINDOWS:
          break;
      }
    }
  }

  console.log("checkOSDiskPartitions: return");
}



function checkDiskPartitions(objDisk) {
  console.log("checkDiskPartitions: called");

  console.log("checkDiskPartitions: disk name " + objDisk.name + ", sizeBytes " + objDisk.sizeBytes);

  var nNextBytePosition = 0;
  var sPrevPartitionName = "";
  for (var i = 0; i < objDisk.children.length; i++) {
    console.log("checkDiskPartitions: nNextBytePosition " + nNextBytePosition);
    var objPartition = objDisk.children[i];
    console.log("checkDiskPartitions: partition " + i + ", name " + objPartition.name);
    console.log("checkDiskPartitions: partition startByte " + objPartition.startByte + ", sizeBytes " + objPartition.sizeBytes);
    var sDetail = "";
    var sInstruction = "Unused area on disk '" + objDisk.name + "'";
    if ((i > 0) && (nNextBytePosition > objPartition.startByte)) {
      var sInstruction = "Overlapping partitions on disk '" + objDisk.name + "'";
      sDetail = "Partition '" + sPrevPartitionName + "' ends at " + (nNextBytePosition-1) + "; partition '" + objPartition.name + "' starts at " + objPartition.startByte;
      var instrNodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, sInstruction, sDetail, [objDisk.nodeId]);
      objDisk.relatedNodeIds.push(instrNodeId);
    }
    if (objPartition.startByte > nNextBytePosition) {
      sDetail = "Unused area of " + (objPartition.startByte-nNextBytePosition) + " bytes before partition '" + objPartition.name + "'";
      var instrNodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, sInstruction, sDetail, [objDisk.nodeId]);
      objDisk.relatedNodeIds.push(instrNodeId);
    }
    nNextBytePosition = objPartition.startByte + objPartition.sizeBytes;
    console.log("checkDiskPartitions: now nNextBytePosition " + nNextBytePosition);
    if ((i == objDisk.children.length-1) && (nNextBytePosition < objDisk.sizeBytes)) {
      sDetail = "Unused area of " + (objDisk.sizeBytes-nNextBytePosition) + " bytes after partition '" + objPartition.name + "'";
      var instrNodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, sInstruction, sDetail, [objDisk.nodeId]);
      objDisk.relatedNodeIds.push(instrNodeId);
    }
    sPrevPartitionName = objPartition.name;
  }

  console.log("checkDiskPartitions: return");
}


function checkAllDiskPartitions(treenum) {
  console.log("checkAllDiskPartitions: called, treenum " + treenum);

  var objDisks = gObjTree[treenum][TOP_HARDWARE].children[HARDWARE_DISKS];

  for (var i = 0; i < objDisks.children.length; i++) {
    checkDiskPartitions(objDisks.children[i]);
  }

  console.log("checkAllDiskPartitions: return");
}



//---------------------------------------------------------------------------

// "document ready" function:

$(() => {

  //const jstreeview = require('js-treeview')
// https://www.npmjs.com/package/js-treeview
// https://github.com/justinchmura/js-treeview
// https://www.npmjs.com/package/load-json-file

  console.log("document ready");

})


//---------------------------------------------------------------------------
