//-------------------------------------------------------------------------------------
// createinstaller.js
// from https://www.christianengvall.se/electron-windows-installer/
//-------------------------------------------------------------------------------------


const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'release-builds')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'OS-Installation-Planner-win32-ia32/'),
    authors: 'Bill Dietrich',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'OS-Installation-Planner.exe',
    setupExe: 'OS-Installation-Planner-Installer.exe',
    setupIcon: path.join(rootPath, 'assets', 'icons', 'win', 'osinstallationplanner-32x32.ico')
  })
}


//-------------------------------------------------------------------------------------
