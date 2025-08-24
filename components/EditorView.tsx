import React, { useState } from 'react';
import FileTree from './FileTree';
import CodeEditor from './CodeEditor';
import BottomPanel from './BottomPanel';
import ResizablePanel from './ResizablePanel';
import type { LintError } from '../types';

const EditorView: React.FC = () => {
  const [lintErrors, setLintErrors] = useState<LintError[]>([]);

  return (
    <div className="flex h-full w-full bg-gray-900">
      <ResizablePanel initialSize={250} minSize={200} direction="horizontal">
        <div className="h-full bg-gray-800/50 overflow-y-auto">
          <FileTree />
        </div>
      </ResizablePanel>
      <div className="flex-grow flex flex-col">
        <ResizablePanel initialSize={500} minSize={200} direction="vertical">
          <div className="h-full flex-grow bg-gray-800">
            <CodeEditor setLintErrors={setLintErrors} />
          </div>
        </ResizablePanel>
        <div className="flex-grow bg-black">
           <BottomPanel lintErrors={lintErrors} />
        </div>
      </div>
    </div>
  );
};

export default EditorView;