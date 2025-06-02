// Hnt: Add only types. const are unsupported

export type BackendResponse = {
    responseMessage: string;
}

export enum FileType {
    ClassFile,
    Directory,
}

export type SourceFile = {
    file: string;
    recursive: boolean;
    type?: FileType
}
