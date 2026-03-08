const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Using process.cwd() instead of __dirname to avoid issues in ESM/Bundler environments
const IN_DIR = path.join(process.cwd(), 'assets', 'images');
const OUT_DIR = path.join(process.cwd(), 'assets', 'images_squared');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Convert non-square icons to perfectly square
const imagesToSquare = [
  'android-icon-foreground.png',
  'android-icon-monochrome.png',
  'android-icon-background.png',
  'icon.png'
];

async function squareImages() {
  for (const file of imagesToSquare) {
    const inputPath = path.join(IN_DIR, file);
    const outputPath = path.join(OUT_DIR, file);

    try {
      if (fs.existsSync(inputPath)) {
        console.log(`Squaring ${file}...`);
        
        // Resize to 1024x1024, padding with transparent background
        await sharp(inputPath)
          .resize({
            width: 1024,
            height: 1024,
            fit: 'contain', 
            background: { r: 255, g: 255, b: 255, alpha: 0 } 
          })
          .toFile(outputPath);
          
        console.log(`Successfully squared ${file}`);
        
        // Backup original and replace
        fs.copyFileSync(inputPath, inputPath + '.bak');
        fs.copyFileSync(outputPath, inputPath);
      } else {
        console.log(`Skipping ${file} - not found at ${inputPath}`);
      }
    } catch (err) {
      console.error(`Error squaring ${file}:`, err);
    }
  }
}

squareImages();
