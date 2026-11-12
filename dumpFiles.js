
import fs from 'fs';
import path from 'path';

const walkDir = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  });
  return fileList;
};

const VALID_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css'];

const allFiles = walkDir('./');
const output = [];

allFiles.forEach(file => {
  const ext = path.extname(file);
  if (VALID_EXTENSIONS.includes(ext)) {
    const content = fs.readFileSync(file, 'utf8');
    output.push(`--- FILE: ${file} ---\n${content}`);
  }
});

fs.writeFileSync('project_dump.txt', output.join('\n\n'), 'utf8');
console.log('✅ Full dump complete. File: project_dump.txt');
