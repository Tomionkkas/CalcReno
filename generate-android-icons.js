const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIcon = path.join(__dirname, 'assets', 'images', 'android-chrome-512x512.png');
const androidRes = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Android icon densities
const densities = {
  mdpi: { launcher: 48, foreground: 108, splash: 48 },
  hdpi: { launcher: 72, foreground: 162, splash: 72 },
  xhdpi: { launcher: 96, foreground: 216, splash: 96 },
  xxhdpi: { launcher: 144, foreground: 324, splash: 144 },
  xxxhdpi: { launcher: 192, foreground: 432, splash: 192 }
};

async function generateIcons() {
  console.log('🎨 Generating CalcReno Android icons from:', sourceIcon);

  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Source icon not found:', sourceIcon);
    process.exit(1);
  }

  let generatedCount = 0;

  for (const [density, sizes] of Object.entries(densities)) {
    const mipmapDir = path.join(androidRes, `mipmap-${density}`);
    const drawableDir = path.join(androidRes, `drawable-${density}`);

    // Ensure directories exist
    if (!fs.existsSync(mipmapDir)) {
      fs.mkdirSync(mipmapDir, { recursive: true });
    }
    if (!fs.existsSync(drawableDir)) {
      fs.mkdirSync(drawableDir, { recursive: true });
    }

    // Generate ic_launcher.png
    const launcherPath = path.join(mipmapDir, 'ic_launcher.png');
    await sharp(sourceIcon)
      .resize(sizes.launcher, sizes.launcher, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(launcherPath);
    console.log(`✅ Generated: mipmap-${density}/ic_launcher.png (${sizes.launcher}x${sizes.launcher})`);
    generatedCount++;

    // Generate ic_launcher_round.png (same as launcher for now)
    const roundPath = path.join(mipmapDir, 'ic_launcher_round.png');
    await sharp(sourceIcon)
      .resize(sizes.launcher, sizes.launcher, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(roundPath);
    console.log(`✅ Generated: mipmap-${density}/ic_launcher_round.png (${sizes.launcher}x${sizes.launcher})`);
    generatedCount++;

    // Generate ic_launcher_foreground.png (for adaptive icons)
    const foregroundPath = path.join(mipmapDir, 'ic_launcher_foreground.png');
    await sharp(sourceIcon)
      .resize(sizes.foreground, sizes.foreground, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(foregroundPath);
    console.log(`✅ Generated: mipmap-${density}/ic_launcher_foreground.png (${sizes.foreground}x${sizes.foreground})`);
    generatedCount++;

    // Generate splashscreen_logo.png
    const splashPath = path.join(drawableDir, 'splashscreen_logo.png');
    await sharp(sourceIcon)
      .resize(sizes.splash, sizes.splash, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(splashPath);
    console.log(`✅ Generated: drawable-${density}/splashscreen_logo.png (${sizes.splash}x${sizes.splash})`);
    generatedCount++;
  }

  console.log(`\n🎉 Success! Generated ${generatedCount} icon files for CalcReno`);
  console.log('📱 Ready to build with: npm run android');
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
