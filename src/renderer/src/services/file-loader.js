import { getMarkdownFile } from '../screens/lib/file-ops/get-markdown-file';

export class FileLoaderService {
  static async loadFile(filepath) {
    try {
      if (filepath.endsWith('.md')) {
        return await this.loadMarkdownFile(filepath);
      } else if (filepath.endsWith('.json')) {
        return await this.loadJSONFile(filepath);
      }
      throw new Error('Unsupported file type');
    } catch (error) {
      console.error('Error loading file:', error);
      throw error;
    }
  }

  static async loadMarkdownFile(filepath) {
    try {
      const { frontmatter, content } = await getMarkdownFile(filepath);
      return {
        type: 'markdown',
        data: {
          frontmatter,
          content
        },
        path: filepath
      };
    } catch (error) {
      console.error('Error loading markdown file:', error);
      throw error;
    }
  }

  static async loadJSONFile(filepath) {
    try {
      const { status, data, error } = await window.electronAPI.files.read(filepath);
      
      if (status === 'failure') {
        throw new Error(`Failed to read JSON file: ${error}`);
      }

      return {
        type: 'json',
        data: data,
        path: filepath
      };
    } catch (error) {
      console.error('Error loading JSON file:', error);
      throw error;
    }
  }
}