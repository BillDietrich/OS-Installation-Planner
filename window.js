//---------------------------------------------------------------------------
// "OS Installation Planner" window.js
// Runs in Electron render process
//---------------------------------------------------------------------------

const {remote} = require('electron')

const loadJsonFile = require('load-json-file')

// https://cnpmjs.org/package/jsonfile
const jsonFile = require('jsonfile')




// possible replacements for treeview
// FAR simpler:  https://www.w3schools.com/howto/howto_js_treeview.asp
// https://www.cssscript.com/tag/tree-view/





// tree to printable-text format
// https://www.npmjs.com/package/tree-printer
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

function loadTreeFromFile(treenum) {
  //console.log("loadTreeFromFile: called, ", treenum, filename);
  gObjTree[treenum] = loadJsonFile.sync(gsTreeFilename[treenum]);
  $('#t' + treenum + 'filename').text(gsTreeFilename[treenum]);
  refreshTreeView(treenum);
  //console.log("loadTreeFromFile: gObjTree[treenum] ", gObjTree[treenum]);
  //console.log("loadTreeFromFile: return");
}

function loadTreeFromText(treenum, text) {
  //console.log("loadTreeFromText: called, ", treenum, text);
  gsTreeFilename[treenum] = "";
  // don't wipe out the gsTreeFilepathname
  gObjTree[treenum] = JSON.parse(text);
  $('#t' + treenum + 'filename').text("");
  console.log("loadTreeFromText: gObjTree[treenum] ", gObjTree[treenum]);
  refreshTreeView(treenum);
  //console.log("loadTreeFromText: return");
}

function loadTree(treenum, objTree) {
  console.log("loadTree: called, ", treenum, JSON.stringify(objTree));
  gsTreeFilename[treenum] = "";
  // don't wipe out the gsTreeFilepathname
  gObjTree[treenum] = objTree;
  $('#t' + treenum + 'filename').text("");
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

function saveTreeToFile(treenum) {
  console.log("saveTreeToFile: called, ", treenum);
  // https://www.w3schools.com/nodejs/nodejs_filesystem.asp
  //fs.writeFile(gsTreeFilename[treenum], 'utf8');
  //fs.writeFileSync(gsTreeFilepathname[treenum], JSON.stringify(gObjTree[treenum]));
  gObjTree[treenum][TOP_CONFIG].nextNodeId = gNextNodeId;
  try {
    jsonFile.writeFileSync(gsTreeFilepathname[treenum], gObjTree[treenum]);
  } catch(err) {
    console.log('saveTreeToFile: error', err);
  }
  /*
  fs.writeFileSync(gsTreeFilepathname[treenum], JSON.stringify(gObjTree[treenum]), function(err) {
    if (err)
      console.log('saveTreeToFile: error', err);
  });
  */
  console.log("saveTreeToFile: return");
}

function readTreeUsingDialog(treenum) {
  //console.log("readTreeUsingDialog: called, ", treenum);

  // https://electronjs.org/docs/api/dialog

  dialog = remote.dialog;
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
    properties : ['openFile']
  };

  // https://electronjs.org/docs/api/dialog
  var p = dialog.showOpenDialog(WIN, options).then((retobj) => {
    console.log("readTreeUsingDialog: retobj.canceled ", retobj.canceled);
    if (!retobj.canceled) {
      console.log("readTreeUsingDialog: retobj.filePaths ", retobj.filePaths);
      gsTreeFilename[treenum] = path.parse(retobj.filePaths[0]).base;
      gsTreeFilepathname[treenum] = retobj.filePaths[0];
      $('#t' + treenum + 'filename').text(gsTreeFilename[treenum]);

      loadTreeFromFile(treenum);
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
    filters :[ {name: 'json', extensions: ['json']} ]
  };

  var p = dialog.showSaveDialog(WIN, options).then((retobj) => {
    console.log("saveTreeUsingDialog: retobj.canceled ", retobj.canceled);
    if (!retobj.canceled) {
      console.log("saveTreeUsingDialog: retobj.filePath ", retobj.filePath);
      gsTreeFilename[treenum] = path.parse(retobj.filePath).base;
      gsTreeFilepathname[treenum] = retobj.filePath;
      $('#t' + treenum + 'filename').text(gsTreeFilename[treenum]);

      saveTreeToFile(treenum);
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
  gObjTree[newtreenum][TOP_SOFTWARE].children[SOFTWARE_OS].UIPermissions = "PCDEn";
  // MORE !!!

  var sNewGUID = crypto.randomBytes(16).toString("hex");
  gObjTree[newtreenum][TOP_CONFIG].guid = sNewGUID;
  gObjTree[newtreenum][TOP_CONFIG].newTreeGuid = sNewGUID;
  gObjTree[existingtreenum][TOP_CONFIG].newTreeGuid = sNewGUID;
  gObjTree[2][TOP_CONFIG].newTreeGuid = sNewGUID;

  $('#t' + newtreenum + 'filename').text("");
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




function convertOS(nodeId, treenum, newostypenum, newosname) {
  console.log("convertOS: called, nodeId " + nodeId + ", treenum " + treenum + ", newostypenum " + newostypenum + ", newosname " + newosname);

  var objNAP = findNode(nodeId, gObjTree[treenum], null);
  //console.log("doClone: found objNAP.node " + objNAP.node + " objNAP.parent " + objNAP.parent);
  console.log("convertOS: found objNAP.node.nodeId " + objNAP.node.nodeId + " objNAP.parent.nodeId " + objNAP.parent.nodeId);
  console.log("convertOS: found objNAP.node.name " + objNAP.node.name + " objNAP.parent.name " + objNAP.parent.name);

  if ((gObjTree[1][TOP_SOFTWARE].children[SOFTWARE_OS].ostypenum === SYSTEMTYPE_LINUX)
      && (newostypenum === SYSTEMTYPE_WINDOWS)) {

    console.log("convertOS: change linux to windows");

    objNAP.node.name = newosname;
    objNAP.node.platform = osNumToPlatform(newostypenum);
    objNAP.node.ostypenum = newostypenum;

    var sInstruction = "Download new OS image.";
    var sDetail = "Download image for " + newosname + " from xxxxxxxxxxxx";
    var nodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, sInstruction, sDetail, [gObjTree[1][TOP_SOFTWARE].children[SOFTWARE_OS].nodeId]);
    gObjTree[1][TOP_SOFTWARE].children[SOFTWARE_OS].relatedNodeIds.push(nodeId);

  }

  console.log("convertOS: return");
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
