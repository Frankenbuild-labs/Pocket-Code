
export function resolvePath(cwd: string, target: string): string {
  if (!target) return cwd;
  
  if (target.startsWith('/')) {
    // Absolute path
    return normalizePath(target);
  }
  // Relative path
  const combined = cwd === '/' ? target : `${cwd}/${target}`;
  return normalizePath(combined);
}

function normalizePath(path: string): string {
  const parts = path.split('/').filter(p => p && p !== '.');
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  // If the original path was just '/', the stack will be empty.
  // Otherwise, join with '/' and prefix with a leading '/'.
  return '/' + stack.join('/');
}
