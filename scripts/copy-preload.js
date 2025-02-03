const fs = require('fs');
const path = require('path');

const files = [
  {
    source: path.join(__dirname, '../src/preload/index.js'),
    target: path.join(__dirname, '../out/preload/index.js')
  },
  {
    source: path.join(__dirname, '../src/preload/customDialog.js'),
    target: path.join(__dirname, '../out/preload/customDialog.js')
  }
];

files.forEach(({ source, target }) => {
  const targetDir = path.dirname(target);

  // Create the target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy the file
  fs.copyFileSync(source, target);
  console.log(`Copied ${source} to ${target}`);
});
