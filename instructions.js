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
//    systemTreeNodeId: number,
//    ...
//    nodeEditable: boolean,
//    nodeCanAddChildren: boolean,
//    nodeStatus: "existing / added / deleted / changed",
//    nodeId: number,
//    children: []
//  }

// indices of the top array:
//const TOP_CONFIG = 0;
const TOP_PLAN = 1;
const TOP_TEST = 2;
const TOP_PREPARE = 3;
const TOP_CHANGEHARDWARE = 4;
const TOP_INSTALL = 5;
const TOP_POSTINSTALL = 6;


//---------------------------------

var gNextInstrNodeId = 0;
var gInstrTree = null;



function makeBasicInstructions(newTreeGuid, instrTreeNum) {
  console.log("makeBasicInstructions: called, newTreeGuid " + newTreeGuid + ", instrTreeNum " + instrTreeNum);

  const guid = crypto.randomBytes(16).toString("hex");

  gObjTree[instrTreeNum] = new Array();
  let gInstrTree = gObjTree[instrTreeNum]; 

  gNextInstrNodeId = 101;

  gInstrTree.push({
            name: "Instructions",
            type: "instructions",
            guid: guid,
            comparedGuid: newTreeGuid,
            nextNodeId: 0,
            systemTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: false,
            nodeStatus: "existing",
            nodeId: gNextInstrNodeId++,
            children: []
            });


  gInstrTree.push({
            name: "Plan",
            systemTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextInstrNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Test",
            systemTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextInstrNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Prepare",
            systemTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextInstrNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Change hardware",
            systemTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextInstrNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Install",
            systemTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextInstrNodeId++,
            children: []
            });

  gInstrTree.push({
            name: "Post-install",
            systemTreeNodeId: 0,
            nodeEditable: false,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextInstrNodeId++,
            children: []
            });

  gInstrTree[TOP_CONFIG].nextNodeId = gNextInstrNodeId;
  console.log("makeBasicInstructions: finished, gInstrTree: " + JSON.stringify(gInstrTree));

  $('#t' + instrTreeNum + 'filename').text("");
  refreshTreeView(instrTreeNum);

  console.log("makeBasicInstructions: return");
}


function addInstruction(parentNodeId, name, text, systemTreeNodeId) {
  console.log("addInstruction: called, parentNodeId " + parentNodeId + ", name " + name + ", text " + text + ", systemTreeNodeId " + systemTreeNodeId);

  var obj = findNode(parentNodeId, gObjTree[2], null);
  console.log("addInstruction: found obj.node.nodeId " + obj.node.nodeId + " obj.parent.nodeId " + obj.parent.nodeId);
  console.log("addInstruction: found obj.node.name " + obj.node.name + " obj.parent.name " + obj.parent.name);

  obj.node.children.push({
            name: name,
            text: text,
            systemTreeNodeId: systemTreeNodeId,
            nodeEditable: true,
            nodeCanAddChildren: true,
            nodeStatus: "existing",
            nodeId: gNextInstrNodeId++,
            children: []
            });

  gObjTree[2][TOP_CONFIG].nextNodeId = gNextInstrNodeId;

  console.log("addInstruction: finished, gObjTree[2]: " + JSON.stringify(gObjTree[2]));

  refreshTreeView(2);

  return gNextInstrNodeId-1;
}




//---------------------------------------------------------------------------

function makeInstructions(newTreeGuid, instrTreeNum) {

  console.log("makeInstructions: called, newTreeGuid " + newTreeGuid + ", instrTreeNum " + instrTreeNum);

  makeBasicInstructions(newTreeGuid, instrTreeNum);

  var nodeId = 0;

  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PLAN].nodeId, "What do you use your system for now ?", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PLAN].nodeId, "What do you want to use your system for in the future ?", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PLAN].nodeId, "Is there anything wrong with the current system ?", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PLAN].nodeId, "Why do you want to change the system ?", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PLAN].nodeId, "What system features are most importand to you ?", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PLAN].nodeId, "What applications are critical to you ?", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PLAN].nodeId, "Can anyone help you use the new system ?", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PLAN].nodeId, "Pick a new OS.", "", 0);
    addInstruction(nodeId, "General choices.", "", 0);
    addInstruction(nodeId, "Check distrowatch.", "", 0);
    addInstruction(nodeId, "Check distrotest.", "", 0);
    nodeId = addInstruction(nodeId, "Research your critical applications.", "", 0);
      addInstruction(nodeId, "Check manufacturer's site to see if this OS is supported.", "", 0);
      addInstruction(nodeId, "Ask on application's forums to see how well app runs on this OS.", "", 0);

  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_TEST].nodeId, "Try a live-session boot of the new OS from a USB drive.", "", 0);
    addInstruction(nodeId, "Download new OS installer to hard disk.", "", 0);
    addInstruction(nodeId, "Burn new OS installer to USB drive.", "", 0);
    addInstruction(nodeId, "Boot from USB drive.", "", 0);
    addInstruction(nodeId, "Click on 'run from USB', not 'install'.", "", 0);
    addInstruction(nodeId, "Test basic features.", "", 0);
    addInstruction(nodeId, "Install and test any critical applications.", "", 0);
  
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PREPARE].nodeId, "Do very extensive backups.", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PREPARE].nodeId, "Clear cookies and caches and do cleaning, then see if you can log in to all the sites you need.", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PREPARE].nodeId, "Update BIOS.", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PREPARE].nodeId, "Put new OS installer on USB drive.", "", 0);
    addInstruction(nodeId, "Download new OS installer to hard disk.", "", 0);
    addInstruction(nodeId, "Burn new OS installer to USB drive.", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_PREPARE].nodeId, "Put pre-install file on a second USB drive.", "", 0);

  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_CHANGEHARDWARE].nodeId, "Add RAM.", "", 0);

  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_INSTALL].nodeId, "Boot from installer USB drive.", "", 0);
    addInstruction(nodeId, "Click on 'install'.", "", 0);
    addInstruction(nodeId, "Click on option to use pre-install file.", "", 0);

  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_POSTINSTALL].nodeId, "Configure OS.", "", 0);
  nodeId = addInstruction(gObjTree[instrTreeNum][TOP_POSTINSTALL].nodeId, "Configure applications.", "", 0);

  console.log("makeInstructions: return");
}


//---------------------------------------------------------------------------
