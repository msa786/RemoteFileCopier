const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const axios = require('axios');

const searchAndCopyPDFs = (src, dest) => {
  const files = fs.readdirSync(src);

  files.forEach(file => {
    const filePath = path.join(src, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      searchAndCopyPDFs(filePath, dest);
    } else if (path.extname(file) === '.pdf') {
      const destPath = path.join(dest, file);
      fs.copyFileSync(filePath, destPath);
    }
  });
};

const compressFolder = (source, out) => {
  const archive = archiver('zip');
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
};

const sendFile = async (filePath, url) => {
  try {
    const response = await axios.post(url, fs.createReadStream(filePath), {
      headers: {
        'Content-Type': 'application/zip'
      }
    });
    console.log('File uploaded successfully:', response.data);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

(async () => {
  const srcDir = 'C:/';  // Adjust this path as needed
  const destDir = 'D:/pdfs';
  const output = 'D:/pdfs.zip';
  const remoteUrl = 'https://your-server.com/upload';  // Replace with your server URL

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  searchAndCopyPDFs(srcDir, destDir);

  try {
    await compressFolder(destDir, output);
    console.log('Folder compressed successfully!');
    await sendFile(output, remoteUrl);
    console.log('File uploaded successfully!');
  } catch (err) {
    console.error('Error:', err);
  }
})();
