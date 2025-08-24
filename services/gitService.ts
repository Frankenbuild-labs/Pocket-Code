
import type { FileSystemTree, Directory, File } from '../types';
import { decodeBase64 } from '../utils/b64';

// A simple regex to parse "github.com/owner/repo" from various URL formats
const GITHUB_REPO_REGEX = /github\.com[/:]([\w.-]+)\/([\w.-]+)/;

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'tree' | 'blob';
  sha: string;
  size?: number;
  url: string;
}

interface GitHubBlob {
    content: string;
    encoding: 'base64';
    // ... other properties
}


export async function cloneGitHubRepo(url: string): Promise<FileSystemTree> {
  const match = url.match(GITHUB_REPO_REGEX);
  if (!match) {
    throw new Error('Invalid GitHub repository URL. Expected format: https://github.com/owner/repo');
  }

  const [, owner, repo] = match;

  // 1. Get repository info to find the default branch
  const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!repoInfoRes.ok) {
    throw new Error(`Failed to fetch repository info. Status: ${repoInfoRes.status}`);
  }
  const repoInfo = await repoInfoRes.json();
  const defaultBranch = repoInfo.default_branch;

  // 2. Get the file tree recursively
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`);
  if (!treeRes.ok) {
    throw new Error(`Failed to fetch repository tree. Status: ${treeRes.status}`);
  }
  const treeData = await treeRes.json();
  
  if (treeData.truncated) {
      console.warn('Repository tree is truncated because it has too many files. Some files may be missing.');
  }

  const filesToFetch: GitHubTreeItem[] = treeData.tree.filter((item: GitHubTreeItem) => item.type === 'blob');

  // 3. Fetch all file contents in parallel
  const fileContents = await Promise.all(
      filesToFetch.map(async (file) => {
          const blobRes = await fetch(file.url);
          if (!blobRes.ok) {
              console.error(`Failed to fetch blob for ${file.path}`);
              return { path: file.path, content: null };
          }
          const blobData: GitHubBlob = await blobRes.json();
          // Assuming base64 encoding as it's standard for the Git Trees API
          const content = decodeBase64(blobData.content);
          return { path: file.path, content };
      })
  );

  // 4. Reconstruct the file system tree
  const newFileSystem: FileSystemTree = { type: 'directory', children: {} };

  for (const file of fileContents) {
      if (file.content === null) continue; // Skip failed fetches

      const pathParts = file.path.split('/');
      let currentLevel: Directory = newFileSystem;

      for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          const isLastPart = i === pathParts.length - 1;

          if (isLastPart) {
              currentLevel.children[part] = { type: 'file', content: file.content };
          } else {
              if (!currentLevel.children[part]) {
                  currentLevel.children[part] = { type: 'directory', children: {} };
              }
              // Type assertion is safe here as we just created it or it existed from a previous file path
              currentLevel = currentLevel.children[part] as Directory;
          }
      }
  }

  return newFileSystem;
}
