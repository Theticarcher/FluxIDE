export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  is_file: boolean;
  extension: string | null;
}

export interface FileNode extends FileEntry {
  children?: FileNode[];
  isExpanded?: boolean;
  isLoading?: boolean;
}

export interface OpenFile {
  id: string;
  path: string;
  name: string;
  content: string;
  language: string;
  isDirty: boolean;
  originalContent: string;
}
