import JSZip from 'jszip';
import type { FileSystemTree, FileSystemNode } from '../types';

async function addNodeToZip(zip: JSZip, node: FileSystemNode, path: string) {
    if (node.type === 'file') {
        zip.file(path, node.content);
    } else if (node.type === 'directory') {
        const dir = zip.folder(path);
        if (dir) {
            for (const [name, child] of Object.entries(node.children)) {
                await addNodeToZip(dir, child, name);
            }
        }
    }
}

export const createProjectZip = async (tree: FileSystemTree): Promise<Blob> => {
    const zip = new JSZip();
    
    // JSZip's root folder is the zip file itself, so we iterate through the children of our root.
    for (const [name, node] of Object.entries(tree.children)) {
        await addNodeToZip(zip, node, name);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    return blob;
};
