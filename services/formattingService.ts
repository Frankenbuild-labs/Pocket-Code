import prettier from 'prettier';

const getParser = (filePath: string) => {
  const extension = filePath.split('.').pop();
  switch (extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return 'babel-ts'; // babel-ts can handle all of these
    case 'json':
      return 'json';
    case 'css':
    case 'scss':
      return 'css';
    case 'html':
      return 'html';
    case 'md':
      return 'markdown';
    default:
      return null;
  }
};

export const formatCode = async (code: string, filePath: string): Promise<string> => {
  const parser = getParser(filePath);

  if (!parser) {
    // Return original code if no parser is found for the file type
    return code;
  }

  try {
    // The standalone Prettier bundle includes parsers, so we don't pass them in manually.
    const formattedCode = await prettier.format(code, {
      parser: parser,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
    });
    return formattedCode;
  } catch (error) {
    console.error(`Error formatting ${filePath}:`, error);
    // In case of a syntax error that Prettier can't handle, return original code
    return code;
  }
};