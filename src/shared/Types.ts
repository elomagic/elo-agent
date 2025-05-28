export enum FileType {
    ClassFile,
    Directory,
}

export type SourceFile = {
    file: string;
    recursive: boolean;
    type?: FileType
}
