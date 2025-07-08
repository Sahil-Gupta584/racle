import fs from "fs";
import path from "path";

export function getAllFiles(folderPath: string) {
  let filePaths: string[] = [];
  const filesAndFolders = fs.readdirSync(folderPath);
  filesAndFolders.forEach((file) => {
    const fullPath = path.join(folderPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      filePaths = filePaths.concat(getAllFiles(fullPath));
    } else {
      filePaths.push(fullPath);
    }
  });
  return filePaths;
}
