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
var rightClickPosition = null
var rightClickTreeElementId = ""
var rightClickElement = null
var rightClickTreeNum = 0

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

      console.log('context menu: Properties item clicked, rightClickElement.attributes: ' + JSON.stringify(rightClickElement.attributes))
      console.log('context menu: Properties item clicked, rightClickElement.getAttribute(myid): ' + JSON.stringify(rightClickElement.getAttribute('myid')))
      console.log('context menu: Properties item clicked, rightClickElement.textContent: ' + JSON.stringify(rightClickElement.textContent))
      //console.log('context menu: Properties item clicked, rightClickElement.id: ' + rightClickElement.id);
      //console.log('context menu: Properties item clicked, rightClickElement.onclick: ' + rightClickElement.onclick);
/*
      if (rightClickElement.parentNode) {
        console.log('context menu: Properties item clicked, rightClickElement.parentNode.attributes: ' + JSON.stringify(rightClickElement.parentNode.class))
        console.log('context menu: Properties item clicked, rightClickElement.parentNode.getAttribute(myid): ' + JSON.stringify(rightClickElement.parentNode.getAttribute('myid')))
        console.log('context menu: Properties item clicked, rightClickElement.parentNode.textContent: ' + JSON.stringify(rightClickElement.parentNode.textContent))
        if (rightClickElement.parentNode.parentNode) {
          console.log('context menu: Properties item clicked, rightClickElement.parentNode.parentNode.attributes: ' + JSON.stringify(rightClickElement.parentNode.parentNode.class))
          console.log('context menu: Properties item clicked, rightClickElement.parentNode.parentNode.getAttribute(myid): ' + JSON.stringify(rightClickElement.parentNode.parentNode.getAttribute('myid')))
          console.log('context menu: Properties item clicked, rightClickElement.parentNode.parentNode.textContent: ' + JSON.stringify(rightClickElement.parentNode.parentNode.textContent))
        }
      }
*/
      //ipcRenderer.send('context-menu', {message: "Hi", someData: "Let's go"});
      
      openPropertiesDialog(rightClickElement, (rightClickTreeNum == 0));
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
  }
});
const menuitemDelete = new MenuItem ({
  label: 'Delete',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: Delete item clicked')
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
      readTreeUsingDialog(rightClickTreeNum);
  }
});
const menuitemSaveToFile = new MenuItem ({
  label: 'Save to file',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: Save to file item clicked');
      saveTreeUsingDialog(rightClickTreeNum);
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
      gObjTreeView[rightClickTreeNum].expandAll();
  }
});
const menuitemCollapseAllNodesInTree = new MenuItem ({
  label: 'Collapse all nodes in tree',
  click() { 
      // context menu only appears if right-click in one of the trees
      console.log('context menu: Collapse all nodes in tree item clicked')
      gObjTreeView[rightClickTreeNum].collapseAll();
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
  rightClickElement = document.elementFromPoint(e.x, e.y)
  rightClickTreeElementId = "";

  rightClickTreeNum = 0;
  var rect = document.getElementById("t0tree").getBoundingClientRect();
  //console.log("bounds of t0tree are trbl ", rect.top, rect.right, rect.bottom, rect.left);
  if ((e.x >= rect.left) && (e.x <= rect.right) && (e.y <= rect.bottom) && (e.y >= rect.top)) {
    rightClickTreeElementId = "t0tree";
    rightClickTreeNum = 0;
  } else {
    rect = document.getElementById("t1tree").getBoundingClientRect();
    //console.log("bounds of t1tree are trbl ", rect.top, rect.right, rect.bottom, rect.left);
    if ((e.x >= rect.left) && (e.x <= rect.right) && (e.y <= rect.bottom) && (e.y >= rect.top)) {
      rightClickTreeElementId = "t1tree";
      rightClickTreeNum = 1;
    } else {
      rect = document.getElementById("t2tree").getBoundingClientRect();
      //console.log("bounds of t2tree are trbl ", rect.top, rect.right, rect.bottom, rect.left);
      if ((e.x >= rect.left) && (e.x <= rect.right) && (e.y <= rect.bottom) && (e.y >= rect.top)) {
        rightClickTreeElementId = "t2tree";
        rightClickTreeNum = 2;
      }
    }
  }
  if (rightClickTreeElementId !== "") {
    // show context menu only in the trees
    rightClickPosition = {x: e.x, y: e.y}   // save position of click

    let myid = rightClickElement.getAttribute('myid');

    if (myid === '3') {
      // it's a leaf of the tree
      let sJSON = rightClickElement.getAttribute('JSON');
      let bNodeEditable = JSON.parse(sJSON).nodeEditable;
      let bNodeCanAddChildren = JSON.parse(sJSON).nodeCanAddChildren;
      console.log("myid "+ myid + ", sJSON " + sJSON + ", bNodeEditable " + bNodeEditable);
      menuitemProperties.enabled = true;
      menuitemClone.enabled = (rightClickTreeNum != 0) && bNodeEditable;
      menuitemDelete.enabled = (rightClickTreeNum != 0) && bNodeEditable;
      menuitemEdit.enabled = (rightClickTreeNum != 0) && bNodeEditable;
      menuitemNewChild.enabled = (rightClickTreeNum != 0) && bNodeCanAddChildren;
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
