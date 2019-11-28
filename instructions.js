//---------------------------------------------------------------------------
// "OS Installation Planner" instructions.js
// Runs in Electron render process
// https://medium.com/@TK_CodeBear/manipulating-objects-in-javascript-59fefeb6a738
//---------------------------------------------------------------------------





//---------------------------------
// standard fields of a node:
//  {
//    name: "something",
//    ...
//    existingTreeNodeId: number,
//    newTreeNodeId: number,
//    ...
//    nodeEditable: boolean,
//    nodeCanAddChildren: boolean,
//    nodeStatus: "existing / added / deleted / changed",
//    nodeId: number,
//    children: []
//  }

// indices of the top array:
//const TOP_CONFIG = 0;
const TOP_CURRENTSYSTEM = 1;
const TOP_PLAN = 2;
const TOP_TEST = 3;
const TOP_PREPARE = 4;
const TOP_CHANGEHARDWARE = 5;
const TOP_INSTALL = 6;
const TOP_POSTINSTALL = 7;


//---------------------------------

var gInstrTree = null;



function makeBasicInstructionsTree() {
  console.log("makeBasicInstructionsTree: called");

  var sGUID = crypto.randomBytes(16).toString("hex");

  gObjTree[2] = new Array();
  var gInstrTree = gObjTree[2]; 

  gNextNodeId = 101;

  gInstrTree.push({
            name: "Instructions",
            type: "instructions",
            guid: sGUID,
            existingTreeGuid: "",
            newTreeGuid: "",
            instructionsTreeGuid: sGUID,
            nextNodeId: 0,
            existingTreeNodeId: 0,
            newTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });


  gInstrTree.push({
            name: "Current system",
            existingTreeNodeId: 0,
            newTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });


  gInstrTree.push({
            name: "Plan",
            existingTreeNodeId: 0,
            newTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Test",
            existingTreeNodeId: 0,
            newTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Prepare",
            existingTreeNodeId: 0,
            newTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Change hardware",
            existingTreeNodeId: 0,
            newTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Install",
            existingTreeNodeId: 0,
            newTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Post-install",
            existingTreeNodeId: 0,
            newTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  console.log("makeBasicInstructionsTree: finished, gInstrTree: " + JSON.stringify(gInstrTree));

  console.log("makeBasicInstructionsTree: return");
}


function addInstruction(parentNodeId, name, text, existingTreeNodeId, newTreeNodeId) {
  console.log("addInstruction: called, parentNodeId " + parentNodeId + ", name " + name + ", text " + text + ", existingTreeNodeId " + existingTreeNodeId + ", newTreeNodeId " + newTreeNodeId);

  var obj = findNode(parentNodeId, gObjTree[2], null);
  console.log("addInstruction: found obj.node.nodeId " + obj.node.nodeId + " obj.parent.nodeId " + obj.parent.nodeId);
  console.log("addInstruction: found obj.node.name " + obj.node.name + " obj.parent.name " + obj.parent.name);

  var nNewNodeId = gNextNodeId++;
  obj.node.children.push({
            name: name,
            text: text,
            existingTreeNodeId: existingTreeNodeId,
            newTreeNodeId: newTreeNodeId,
            nodeEditable: true,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: nNewNodeId,
            children: []
            });

  console.log("addInstruction: finished, gObjTree[2]: " + JSON.stringify(gObjTree[2]));

  return nNewNodeId;
}




//---------------------------------------------------------------------------

function makeInstructionsAfterExisting() {

  console.log("makeInstructionsAfterExisting: called");

  var nodeId = 0;

  gObjTree[2][TOP_CONFIG].existingTreeGuid = gObjTree[0][TOP_CONFIG].guid;

  nodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, "You're not using anti-virus ?", "", 0, 0);

  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "What do you use your system for now ?", "", 0, 0);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "What do you want to use your system for in the future ?", "", 0, 0);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "Is there anything wrong with the current system ?", "", 0, 0);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "Why do you want to change the system ?", "", 0, 0);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "What system features are most importand to you ?", "", 0, 0);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "What applications are critical to you ?", "", 0, 0);

  console.log("makeInstructionsAfterExisting: return");
}



//---------------------------------------------------------------------------

function makeInstructionsAfterNew() {

  console.log("makeInstructionsAfterNew: called");

  var nodeId = 0;

  gObjTree[2][TOP_CONFIG].newTreeGuid = gObjTree[1][TOP_CONFIG].guid;

  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "Can anyone help you use the new system ?", "", 0, 0);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "Pick a new OS.", "", 0, 0);
    addInstruction(nodeId, "General choices.", "", 0, 0);
    addInstruction(nodeId, "Check distrowatch.", "", 0, 0);
    addInstruction(nodeId, "Check distrotest.", "", 0, 0);
    nodeId = addInstruction(nodeId, "Research your critical applications.", "", 0, 0);
      addInstruction(nodeId, "Check manufacturer's site to see if this OS is supported.", "", 0, 0);
      addInstruction(nodeId, "Ask on application's forums to see how well app runs on this OS.", "", 0, 0);

  nodeId = addInstruction(gObjTree[2][TOP_TEST].nodeId, "Try a live-session boot of the new OS from a USB drive.", "", 0, 0);
    addInstruction(nodeId, "Download new OS installer to hard disk.", "", 0, 0);
    addInstruction(nodeId, "Burn new OS installer to USB drive.", "", 0, 0);
    addInstruction(nodeId, "Boot from USB drive.", "", 0, 0);
    addInstruction(nodeId, "Click on 'run from USB', not 'install'.", "", 0, 0);
    addInstruction(nodeId, "Test basic features.", "", 0, 0);
    addInstruction(nodeId, "Install and test any critical applications.", "", 0, 0);
  
  nodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, "Do very extensive backups.", "", 0, 0);
  nodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, "Clear cookies and caches and do cleaning, then see if you can log in to all the sites you need.", "", 0, 0);
  nodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, "Update BIOS.", "", 0, 0);
  nodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, "Put new OS installer on USB drive.", "", 0, 0);
    addInstruction(nodeId, "Download new OS installer to hard disk.", "", 0, 0);
    addInstruction(nodeId, "Burn new OS installer to USB drive.", "", 0, 0);
  nodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, "Put pre-install file on a second USB drive.", "", 0, 0);

  nodeId = addInstruction(gObjTree[2][TOP_CHANGEHARDWARE].nodeId, "Add RAM.", "", 0, 0);

  nodeId = addInstruction(gObjTree[2][TOP_INSTALL].nodeId, "Boot from installer USB drive.", "", 0, 0);
    addInstruction(nodeId, "Click on 'install'.", "", 0, 0);
    addInstruction(nodeId, "Click on option to use pre-install file.", "", 0, 0);

  nodeId = addInstruction(gObjTree[2][TOP_POSTINSTALL].nodeId, "Configure OS.", "", 0, 0);
  nodeId = addInstruction(gObjTree[2][TOP_POSTINSTALL].nodeId, "Configure applications.", "", 0, 0);

  console.log("makeInstructionsAfterNew: return");
}


//---------------------------------------------------------------------------
