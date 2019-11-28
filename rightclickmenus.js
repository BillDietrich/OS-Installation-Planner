//---------------------------------------------------------------------------
// "OS Installation Planner" rightclickmenus.js
// Runs in Electron render process
// https://medium.com/@TK_CodeBear/manipulating-objects-in-javascript-59fefeb6a738
//---------------------------------------------------------------------------



const {ipcRenderer} = require('electron')
const {Menu, MenuItem} = remote





//---------------------------------------------------------------------------
//   right-click / context menus
//   from https://www.tutorialspoint.com/electron/electron_menus.htm


// https://stackoverflow.com/questions/32636750/how-to-add-a-right-click-menu-in-electron-that-has-inspect-element-option-like
var gRightClickPosition = null
var gRightClickTreeElementId = ""
var gRightClickElement = null
var gRightClickTreeNum = 0

// https://electronjs.org/docs/api/menu
const menu = new Menu()

// https://electronjs.org/docs/api/menu-item
const menuitemProperties = new MenuItem ({
  label: 'Properties',
  click(menuItem, browserWindow, event) {
      // context menu only appears if right-click in one of the trees
      //console.log('context menu: Properties item clicked, menuItem: ' + menuItem)
      //console.log('context menu: Properties item clicked, browserWindow: ' + browserWindow)
      //console.log('context menu: Properties item clicked, event: ' + JSON.stringify(event))

      console.log('context menu: Properties item clicked, gRightClickElement.attributes: ' + JSON.stringify(gRightClickElement.attributes))
      console.log('context menu: Properties item clicked, gRightClickElement.getAttribute(myid): ' + JSON.stringify(gRightClickElement.getAttribute('myid')))
      console.log('context menu: Properties item clicked, gRightClickElement.textContent: ' + JSON.stringify(gRightClickElement.textContent))
      //console.log('context menu: Properties item clicked, gRightClickElement.id: ' + gRightClickElement.id);
      //console.log('context menu: Properties item clicked, gRightClickElement.onclick: ' + gRightClickElement.onclick);
/*
      if (gRightClickElement.parentNode) {
        console.log('context menu: Properties item clicked, gRightClickElement.parentNode.attributes: ' + JSON.stringify(gRightClickElement.parentNode.class))
        console.log('context menu: Properties item clicked, gRightClickElement.parentNode.getAttribute(myid): ' + JSON.stringify(gRightClickElement.parentNode.getAttribute('myid')))
        console.log('context menu: Properties item clicked, gRightClickElement.parentNode.textContent: ' + JSON.stringify(gRightClickElement.parentNode.textContent))
        if (gRightClickElement.parentNode.parentNode) {
          console.log('context menu: Properties item clicked, gRightClickElement.parentNode.parentNode.attributes: ' + JSON.stringify(gRightClickElement.parentNode.parentNode.class))
          console.log('context menu: Properties item clicked, gRightClickElement.parentNode.parentNode.getAttribute(myid): ' + JSON.stringify(gRightClickElement.parentNode.parentNode.getAttribute('myid')))
          console.log('context menu: Properties item clicked, gRightClickElement.parentNode.parentNode.textContent: ' + JSON.stringify(gRightClickElement.parentNode.parentNode.textContent))
        }
      }
*/
      //ipcRenderer.send('context-menu', {message: "Hi", someData: "Let's go"});
      
      openPropertiesDialog(gRightClickElement, (gRightClickTreeNum == 0));
  }
});
const menuitemSeparator1 = new MenuItem({
  type: 'separator'
});
const menuitemClone = new MenuItem ({
  label: 'Clone',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: Clone item clicked')
      let sJSON = gRightClickElement.getAttribute('JSON');
      let nodeId = JSON.parse(sJSON).nodeId;
      doClone(nodeId, gRightClickTreeNum);
      refreshTreeView(gRightClickTreeNum);
  }
});
const menuitemDelete = new MenuItem ({
  label: 'Delete',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: Delete item clicked')
      let sJSON = gRightClickElement.getAttribute('JSON');
      let nodeId = JSON.parse(sJSON).nodeId;
      doDelete(nodeId, gRightClickTreeNum);
      refreshTreeView(gRightClickTreeNum);
  }
});
const menuitemEdit = new MenuItem ({
  label: 'Edit',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: Edit item clicked')
  }
});
const menuitemNewChild = new MenuItem ({
  label: 'New Child',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: New Child item clicked')
  }
});
const menuitemSeparator2 = new MenuItem({
  type: 'separator'
});
const menuitemReadFromFile = new MenuItem ({
  label: 'Read from file',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: Read from file item clicked')
      readTreeUsingDialog(gRightClickTreeNum);
  }
});
const menuitemSaveToFile = new MenuItem ({
  label: 'Save to file',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: Save to file item clicked');
      saveTreeUsingDialog(gRightClickTreeNum);
  }
});
const menuitemViewPrintable = new MenuItem ({
  label: 'View printable',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: View printable item clicked')
  }
});
const menuitemSeparator3 = new MenuItem({
  type: 'separator'
});
const menuitemExpandAllNodesInTree = new MenuItem ({
  label: 'Expand all nodes in tree',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: Expand all nodes in tree item clicked')
      gObjTreeView[gRightClickTreeNum].expandAll();
  }
});
const menuitemCollapseAllNodesInTree = new MenuItem ({
  label: 'Collapse all nodes in tree',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: Collapse all nodes in tree item clicked')
      gObjTreeView[gRightClickTreeNum].collapseAll();
  }
});
menu.append(menuitemProperties);
menu.append(menuitemSeparator1);
menu.append(menuitemClone);
menu.append(menuitemDelete);
menu.append(menuitemEdit);
menu.append(menuitemNewChild);
menu.append(menuitemSeparator2);
menu.append(menuitemReadFromFile);
menu.append(menuitemSaveToFile);
menu.append(menuitemViewPrintable);
menu.append(menuitemSeparator3);
menu.append(menuitemExpandAllNodesInTree);
menu.append(menuitemCollapseAllNodesInTree);
//menu.append(new MenuItem({label: 'MenuItem2', type: 'checkbox', checked: true}))



// Prevent default action of right click in chromium. Replace with our menu.
window.addEventListener('contextmenu', (e) => {
  // https://electronjs.org/docs/api/web-contents#event-context-menu
  e.preventDefault()

  //console.log("e.x ", e.x , " e.y ", e.y);
  gRightClickElement = document.elementFromPoint(e.x, e.y)
  gRightClickTreeElementId = "";

  gRightClickTreeNum = 0;
  var rect = document.getElementById("t0tree").getBoundingClientRect();
  //console.log("bounds of t0tree are trbl ", rect.top, rect.right, rect.bottom, rect.left);
  if ((e.x >= rect.left) && (e.x <= rect.right) && (e.y <= rect.bottom) && (e.y >= rect.top)) {
    gRightClickTreeElementId = "t0tree";
    gRightClickTreeNum = 0;
  } else {
    rect = document.getElementById("t1tree").getBoundingClientRect();
    //console.log("bounds of t1tree are trbl ", rect.top, rect.right, rect.bottom, rect.left);
    if ((e.x >= rect.left) && (e.x <= rect.right) && (e.y <= rect.bottom) && (e.y >= rect.top)) {
      gRightClickTreeElementId = "t1tree";
      gRightClickTreeNum = 1;
    } else {
      rect = document.getElementById("t2tree").getBoundingClientRect();
      //console.log("bounds of t2tree are trbl ", rect.top, rect.right, rect.bottom, rect.left);
      if ((e.x >= rect.left) && (e.x <= rect.right) && (e.y <= rect.bottom) && (e.y >= rect.top)) {
        gRightClickTreeElementId = "t2tree";
        gRightClickTreeNum = 2;
      }
    }
  }
  if (gRightClickTreeElementId !== "") {
    // show context menu only in the trees
    gRightClickPosition = {x: e.x, y: e.y}   // save position of click

    let myid = gRightClickElement.getAttribute('myid');

    if (myid === '3') {
      // it's a leaf of the tree
      let sJSON = gRightClickElement.getAttribute('JSON');
      let sUIPermissions = JSON.parse(sJSON).UIPermissions;
      console.log("myid "+ myid + ", sJSON " + sJSON + ", sUIPermissions " + sUIPermissions);
      menuitemProperties.enabled = (sUIPermissions.includes("P"));
      menuitemClone.enabled = (sUIPermissions.includes("C"));
      menuitemDelete.enabled = (sUIPermissions.includes("D"));
      menuitemEdit.enabled = (sUIPermissions.includes("E"));
      menuitemNewChild.enabled = (sUIPermissions.includes("N"));
      menuitemReadFromFile.enabled = false;
      menuitemSaveToFile.enabled = false;
      menuitemViewPrintable.enabled = false;
      menuitemExpandAllNodesInTree.enabled = false;
      menuitemCollapseAllNodesInTree.enabled = false;
    } else {
      // it's a blank area of the tree
      menuitemProperties.enabled = false;
      menuitemClone.enabled = false;
      menuitemDelete.enabled = false;
      menuitemEdit.enabled = false;
      menuitemNewChild.enabled = false;
      menuitemReadFromFile.enabled = true;
      menuitemSaveToFile.enabled = true;
      menuitemViewPrintable.enabled = true;
      menuitemExpandAllNodesInTree.enabled = true;
      menuitemCollapseAllNodesInTree.enabled = true;
    }

    menu.popup(remote.getCurrentWindow())
  }
}, false)


//---------------------------------------------------------------------------
