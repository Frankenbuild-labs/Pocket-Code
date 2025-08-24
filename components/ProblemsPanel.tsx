import React from 'react';
import type { LintError } from '../types';
import { WarningIcon } from './icons';

interface ProblemsPanelProps {
  errors: LintError[];
}

const ProblemsPanel: React.FC<ProblemsPanelProps> = ({ errors }) => {
  if (errors.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
        <p>No problems have been detected.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto p-2 font-mono text-xs text-gray-300 bg-gray-900">
      <table className="w-full">
        <tbody>
          {errors.map((error, index) => (
            <tr key={index} className="hover:bg-gray-700/50">
              <td className="p-1 whitespace-nowrap">
                <WarningIcon className="w-4 h-4 text-yellow-400 inline-block mr-2" />
              </td>
              <td className="p-1 pr-4 whitespace-nowrap">
                {error.ruleId && <span className="text-gray-500">({error.ruleId})</span>}
              </td>
              <td className="p-1 w-full">{error.message}</td>
              <td className="p-1 pr-4 whitespace-nowrap text-gray-500">
                [{error.line}, {error.column}]
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemsPanel;
