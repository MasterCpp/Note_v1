const { app, nativeImage } = require('electron');
const path = require('node:path');

app.whenReady().then(() => {
  const iconPath = path.join(__dirname, '..', 'assets', 'app-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  const size = icon.getSize();

  if (icon.isEmpty() || size.width !== 256 || size.height !== 256) {
    console.error(`Tray icon failed to load: ${iconPath}`);
    app.exit(1);
    return;
  }

  console.log(`Tray PNG loaded: ${size.width}x${size.height}`);
  app.exit(0);
});
