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
}




//---------------------------------------------------------------------------

function makeInstructions(newTreeGuid, instrTreeNum) {

  console.log("makeInstructions: called, newTreeGuid " + newTreeGuid + ", instrTreeNum " + instrTreeNum);

  makeBasicInstructions(newTreeGuid, instrTreeNum);

  addInstruction(gObjTree[instrTreeNum][TOP_PREPARE].nodeId, "Do backups", "", 0);
  
  console.log("makeInstructions: return");
}


//---------------------------------------------------------------------------
