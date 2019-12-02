const { app, BrowserWindow, Tray } = require('electron'),
  path = require('path'),
  express = require('express');

let window = null;
let tray = null;


// Wait until the app is ready
app.once('ready', () => {


  // Create a new window
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    webPreferences: {
      backgroundThrottling: false
    }
  });

  const url = 'https://ygosalvation.com';
  window.loadURL(url);

  window.once('ready-to-show', () => {
    const position = getWindowPosition();
    window.setPosition(position.x, position.y, false);
    window.show();
    window.focus();
  });

  // Hide the window when it loses focus
  window.on('blur', () => {
    window.hide();
  });


  // Create a new tray
  tray = new Tray(path.join('assets', 'electron-icon.png'));
  // tray.on('right-click', toggleWindow);
  // tray.on('double-click', toggleWindow);
  // tray.on('click', function (event) {
  //   toggleWindow();
  // });

  function showWindow() {
    const position = getWindowPosition();
    window.setPosition(position.x, position.y, false);
    window.show();
    window.focus();
  }

});

const getWindowPosition = () => {
  const windowBounds = window.getBounds();
  const trayBounds = tray.getBounds();

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  return { x: x, y: y };
};



