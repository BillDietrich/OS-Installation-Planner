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
//    relatedNodeIds: [],
//    ...
//    UIPermissions: "PCDEN",  // Properties / Clone / Delete / Edit / New Child
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
            relatedNodeIds: [],
            UIPermissions: "Pcden",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });


  gInstrTree.push({
            name: "Current system",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });


  gInstrTree.push({
            name: "Plan",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Test",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Prepare",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Change hardware",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Install",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Post-install",
            relatedNodeIds: [],
            UIPermissions: "PcdeN",
            nodeStatus: "existing",
            nodeId: gNextNodeId++,
            children: []
            });

  console.log("makeBasicInstructionsTree: finished, gInstrTree: " + JSON.stringify(gInstrTree));

  console.log("makeBasicInstructionsTree: return");
}


function addInstruction(parentNodeId, name, text, relatedNodeIds) {
  console.log("addInstruction: called, parentNodeId " + parentNodeId + ", name " + name + ", text " + text + ", relatedNodeIds " + relatedNodeIds);

  var obj = findNode(parentNodeId, gObjTree[2], null);
  console.log("addInstruction: found obj.node.nodeId " + obj.node.nodeId + " obj.parent.nodeId " + obj.parent.nodeId);
  console.log("addInstruction: found obj.node.name " + obj.node.name + " obj.parent.name " + obj.parent.name);

  var nNewNodeId = gNextNodeId++;
  obj.node.children.push({
            name: name,
            text: text,
            relatedNodeIds: relatedNodeIds,
            UIPermissions: "PCDEN",
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

  nodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, "Anti-virus.", "You're not using anti-virus ?", []);
  nodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, "VPN.", "You're not using a VPN ?", []);
  nodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, "Password Manager.", "You're not using a password manager ?", []);
  nodeId = addInstruction(gObjTree[2][TOP_CURRENTSYSTEM].nodeId, "Firewall.", "You're not using a firewall ?", []);

  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "What do you use your system for now ?", "", []);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "What do you want to use your system for in the future ?", "", []);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "Is there anything wrong with the current system ?", "", []);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "Why do you want to change the system ?", "", []);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "What system features are most importand to you ?", "", []);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "What applications are critical to you ?", "", []);

  console.log("makeInstructionsAfterExisting: return");
}



//---------------------------------------------------------------------------

function makeInstructionsAfterNew() {

  console.log("makeInstructionsAfterNew: called");

  var nodeId = 0;

  gObjTree[2][TOP_CONFIG].newTreeGuid = gObjTree[1][TOP_CONFIG].guid;

  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "Can anyone help you use the new system ?", "", []);
  nodeId = addInstruction(gObjTree[2][TOP_PLAN].nodeId, "Pick a new OS.", "", []);
    addInstruction(nodeId, "General choices.", "", []);
    addInstruction(nodeId, "Check distrowatch.", "", []);
    addInstruction(nodeId, "Check distrotest.", "", []);
    nodeId = addInstruction(nodeId, "Research your critical applications.", "", []);
      addInstruction(nodeId, "Check manufacturer's site to see if this OS is supported.", "", []);
      addInstruction(nodeId, "Ask on application's forums to see how well app runs on this OS.", "", []);

  nodeId = addInstruction(gObjTree[2][TOP_TEST].nodeId, "Try a live-session boot of the new OS from a USB drive.", "", []);
    addInstruction(nodeId, "Download new OS installer to hard disk.", "", []);
    addInstruction(nodeId, "Burn new OS installer to USB drive.", "", []);
    addInstruction(nodeId, "Boot from USB drive.", "", []);
    addInstruction(nodeId, "Click on 'run from USB', not 'install'.", "", []);
    addInstruction(nodeId, "Test basic features.", "", []);
    addInstruction(nodeId, "Install and test any critical applications.", "", []);
  
  nodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, "Do very extensive backups.", "", []);
  nodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, "Clear cookies and caches and do cleaning, then see if you can log in to all the sites you need.", "", []);
  nodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, "Update BIOS.", "", []);
  nodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, "Put new OS installer on USB drive.", "", []);
    addInstruction(nodeId, "Download new OS installer to hard disk.", "", []);
    addInstruction(nodeId, "Burn new OS installer to USB drive.", "", []);
  nodeId = addInstruction(gObjTree[2][TOP_PREPARE].nodeId, "Put pre-install file on a second USB drive.", "", []);

  nodeId = addInstruction(gObjTree[2][TOP_CHANGEHARDWARE].nodeId, "Add RAM.", "", []);

  nodeId = addInstruction(gObjTree[2][TOP_INSTALL].nodeId, "Boot from installer USB drive.", "", []);
    addInstruction(nodeId, "Click on 'install'.", "", []);
    addInstruction(nodeId, "Click on option to use pre-install file.", "", []);

  nodeId = addInstruction(gObjTree[2][TOP_POSTINSTALL].nodeId, "Configure OS.", "", []);
  nodeId = addInstruction(gObjTree[2][TOP_POSTINSTALL].nodeId, "Configure applications.", "", []);

  console.log("makeInstructionsAfterNew: return");
}


//---------------------------------------------------------------------------
