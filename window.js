//---------------------------------------------------------------------------
// "OS Installation Planner" window.js
// Runs in Electron render process
//---------------------------------------------------------------------------

const {remote} = require('electron')

const loadJsonFile = require('load-json-file')

// https://cnpmjs.org/package/jsonfile
const jsonFile = require('jsonfile')






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
  gObjTreeView[treenum] = new TreeView(gObjTree[treenum], 't' + treenum + 'tree', treenum);
  gObjTreeView[treenum].expandAll();
  //console.log("loadTreeFromFile: gObjTree[treenum] ", gObjTree[treenum]);
  //console.log("loadTreeFromFile: return");
}

function loadTreeFromText(treenum, text) {
  //console.log("loadTreeFromText: called, ", treenum, text);
  gsTreeFilename[treenum] = "";
  // don't wipe out the gsTreeFilepathname
  gObjTree[treenum] = JSON.parse(text);
  $('#t' + treenum + 'filename').text("");
  gObjTreeView[treenum] = new TreeView(gObjTree[treenum], 't' + treenum + 'tree', treenum);
  gObjTreeView[treenum].expandAll();
  console.log("loadTreeFromText: gObjTree[treenum] ", gObjTree[treenum]);
  //console.log("loadTreeFromText: return");
}

function loadTree(treenum, objTree) {
  console.log("loadTree: called, ", treenum, JSON.stringify(objTree));
  gsTreeFilename[treenum] = "";
  // don't wipe out the gsTreeFilepathname
  gObjTree[treenum] = objTree;
  $('#t' + treenum + 'filename').text("");
  gObjTreeView[treenum] = new TreeView(gObjTree[treenum], 't' + treenum + 'tree', treenum);
  gObjTreeView[treenum].expandAll();
  //console.log("loadTree: return");
}

function saveTreeToFile(treenum) {
  console.log("saveTreeToFile: called, ", treenum);
  // https://www.w3schools.com/nodejs/nodejs_filesystem.asp
  //fs.writeFile(gsTreeFilename[treenum], 'utf8');
  //fs.writeFileSync(gsTreeFilepathname[treenum], JSON.stringify(gObjTree[treenum]));
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
//    nodeStatus: "existing / added / deleted / changed",
//    nodeId: number,
//    children: []
//  }
//---------------------------------


function copyExistingTreeToNew(existingtreenum, newtreenum) {
  gsTreeFilename[newtreenum] = "";
  // don't wipe out the gsTreeFilepathname

  // clone whole object tree; can't just clone top object
  //var sTree = JSON.stringify(gObjTree[existingtreenum]);
  //var sTreeNew = sTree.replace(/nodeStatus:\"existing\"/g, "nodeStatus:\"existing\"");
  //gObjTree[newtreenum] = JSON.parse(sTreeNew);
  gObjTree[newtreenum] = JSON.parse(JSON.stringify(gObjTree[existingtreenum]));

  gObjTree[newtreenum][0].name = "New configuration";
  gObjTree[newtreenum][0].type = "newConfiguration";
  let newguid = crypto.randomBytes(16).toString("hex");
  gObjTree[newtreenum][0].guid = newguid;
  let oldguid = gObjTree[existingtreenum][0].guid;
  gObjTree[newtreenum][0].comparedGuid = oldguid;

  $('#t' + newtreenum + 'filename').text("");
  gObjTreeView[newtreenum] = new TreeView(gObjTree[newtreenum], 't' + newtreenum + 'tree', newtreenum);
  gObjTreeView[newtreenum].expandAll();
  //console.log("copyExistingTreeToNew: return");
}


//---------------------------------------------------------------------------

// "document ready" function:

$(() => {

  //const jstreeview = require('js-treeview')
// https://www.npmjs.com/package/js-treeview
// https://github.com/justinchmura/js-treeview
// https://www.npmjs.com/package/load-json-file



//alert("before file read");
//var t0dataX = fs.readFileSync("System-Existing.json");
/*
let t0filename = "System-Existing.json";
t0data = loadJsonFile.sync(t0filename);
$('#t0filename').text(t0filename);
let t1filename = "System-New.json";
t1data = loadJsonFile.sync(t1filename);
$('#t1filename').text(t1filename);
let t2filename = "System-Instructions.json";
t2data = loadJsonFile.sync(t2filename);
$('#t2filename').text(t2filename);
*/

/*
console.log("__dirname " , __dirname);
gsTreeFilename[0] = "System-Existing.json";
gsTreeFilepathname[0] = __dirname + path.sep + gsTreeFilename[0];
loadTreeFromFile(0);
//loadTreeFromFile(0, null, '[{"name":"y","children":[]}]');
gsTreeFilename[1] = "System-New.json";
gsTreeFilepathname[1] = __dirname + path.sep + gsTreeFilename[1];
loadTreeFromFile(1);
gsTreeFilename[2] = "System-Instructions.json";
gsTreeFilepathname[2] = __dirname + path.sep + gsTreeFilename[2];
loadTreeFromFile(2);
*/

//alert("t0data.constructor.name: " + t0data.constructor.name);
//alert("t0data[0]: " + t0data[0]);
//alert("t0data[0].name: " + t0data[0].name);
//alert("JSON.stringify(t0data): " + JSON.stringify(t0data));



  //
  // Grab expand/collapse buttons
  //
  /*
  var t0expandAll = document.getElementById('t0expandAll');
  var t0collapseAll = document.getElementById('t0collapseAll');
  var t1expandAll = document.getElementById('t1expandAll');
  var t1collapseAll = document.getElementById('t1collapseAll');
  */

  //
  // Create trees
  //
/*
  t0 = new TreeView(t0data, 't0tree', 0);
  t1 = new TreeView(t1data, 't1tree', 1);
  t2 = new TreeView(t2data, 't2tree', 2);
*/
  //$('#t0tree').text("hello");
  //alert("JSON.stringify(t0): " + JSON.stringify(t0));

  //
  // Attach events
  //

/*
  $('#scansystem1').bind('click', function() {
    var p = scansystem().then((treetext) => {
      //alert("bind function scansystem1: got treetext: " + treetext);
      loadTreeFromFile(0, null, treetext);
      t0data = JSON.parse(treetext);
      alert("bind function scansystem1: new t0data: " + JSON.stringify(t0data));
      t0 = new TreeView(t0data, 't0tree', 0);
      t0.expandAll();
    });
  });
*/

/*
  $('#t0expandAll').bind('click', function() {
    //alert("t0expandAll click");
    t0.expandAll();
  });
  $('#t0collapseAll').bind('click', function() {
    //alert("t0collapseAll click");
    t0.collapseAll();
  });

  $('#t1expandAll').bind('click', function() {
    //alert("t1expandAll click");
    t1.expandAll();
  });
  $('#t1collapseAll').bind('click', function() {
    //alert("t1collapseAll click");
    t1.collapseAll();
  });
*/


/*
  t0.on('select', function (e) {
    //const text = this.text;
	  //alert('select "' + this.name + '"');
    //alert("select");
    //alert("select: JSON.stringify(e.data): " + JSON.stringify(e.data));
	});
  t0.on('expand', function (e) {
	  // alert('expand');
    //alert("expand: JSON.stringify(e.leaves): " + JSON.stringify(e.leaves));
	  });
  t0.on('collapse', function (e) {
	  // alert('collapse');
    //alert("collapse: JSON.stringify(e.leaves): " + JSON.stringify(e.leaves));
	  });
  t0.on('expandAll', function () {
	  //alert('expand all');
	  });
  t0.on('collapseAll', function () {
	  // alert('collapse all');
	  });

  t1.on('select', function (e) {
    //const text = this.text;
	  //alert('select "' + this.name + '"');
    //alert("select");
    //alert("select: JSON.stringify(e.data): " + JSON.stringify(e.data));
	});
  t1.on('expand', function (e) {
	  // alert('expand');
    //alert("expand: JSON.stringify(e.leaves): " + JSON.stringify(e.leaves));
	  });
  t1.on('collapse', function (e) {
	  // alert('collapse');
    //alert("collapse: JSON.stringify(e.leaves): " + JSON.stringify(e.leaves));
	  });
  t1.on('expandAll', function () {
	  //alert('expand all');
	  });
  t1.on('collapseAll', function () {
	  // alert('collapse all');
	  });
*/

/*
  t0.expandAll();
  t1.expandAll();
  t2.expandAll();
*/


})


//---------------------------------------------------------------------------
