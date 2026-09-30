const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'eb6pvtx2',
  api_key: '526279599924919',
  api_secret: 'Q3hoRxcN8nUtOeZWgQuHMoT_HfQ'
});

const PUBLIC_DIR = path.join(__dirname, 'public');
const SRC_DIR = path.join(__dirname, 'src');
const CARE_SRC_DIR = path.join(__dirname, '../care/src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

async function uploadImages() {
  const allImages = getAllFiles(PUBLIC_DIR);
  const urlMap = {};

  console.log(`Found ${allImages.length} images.`);

  for (const file of allImages) {
    // Only upload if it's in images/, icons/, or is logo.png
    const relativePath = file.replace(PUBLIC_DIR, '').replace(/\\/g, '/');
    if (relativePath.startsWith('/images') || relativePath.startsWith('/icons') || relativePath === '/logo.png') {
      console.log(`Uploading ${relativePath}...`);
      try {
        const result = await cloudinary.uploader.upload(file, {
          folder: "swarnikacare/website",
          use_filename: true,
          unique_filename: false,
          overwrite: true
        });
        urlMap[relativePath] = result.secure_url;
        console.log(`Success: ${result.secure_url}`);
      } catch (err) {
        console.error(`Error uploading ${relativePath}:`, err);
      }
    }
  }

  fs.writeFileSync('cloudinary_map.json', JSON.stringify(urlMap, null, 2));
  console.log("Finished uploading. Replacing in code...");
  replaceInCode(urlMap, SRC_DIR);
  replaceInCode(urlMap, CARE_SRC_DIR);
}

function replaceInCode(urlMap, dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInCode(urlMap, fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            for (const [localPath, cloudUrl] of Object.entries(urlMap)) {
                // Next.js Image src is usually like src="/images/..."
                const regex1 = new RegExp(`src=["']${localPath}["']`, 'g');
                if (regex1.test(content)) {
                    content = content.replace(regex1, `src="${cloudUrl}"`);
                    modified = true;
                }
                
                // For direct string references like background-image or Fallback arrays
                const regex2 = new RegExp(`["']${localPath}["']`, 'g');
                if (regex2.test(content)) {
                    content = content.replace(regex2, `"${cloudUrl}"`);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}

uploadImages();
