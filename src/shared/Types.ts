// Hnt: Add only types. const are unsupported

export type BackendResponse = {
    responseMessage: string;
}

export enum FolderFilter {
    IncludeFolder,
    IncludeFolderRecursive,
    ExcludeFolderRecursive,
}

export type FileMetadata = {
    file: string;
    // Possible multiple purls for the file when more then one artifact was merged into one
    purls: string[];
}

export type SourceFile = {
    file: string;
    recursive: boolean;
    filter?: FolderFilter
}

export type Project = {
    name: string,
    sourceFiles: SourceFile[],
    agentFile: string | undefined;
}
