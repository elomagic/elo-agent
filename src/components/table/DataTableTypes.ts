import { FileMetadata } from '@/shared/Types';
import { Key, ReactNode } from 'react';

export enum FileOverloadStatus {
    NO_OVERLOAD = "no_overload",
    SAME_VERSION = "same_version",
    DIFFERENT_VERSION = "different_version",
}

export type FileStatus = FileMetadata & {
    filename: string;
    pom: boolean;
    loaded: boolean;
    overloaded: boolean;
    overloadedFiles?: FileMetadata[];
    overloadStatus: FileOverloadStatus;
    elapsedTime: number | undefined; // in milliseconds
}

export interface Column<C extends Key> {
    id: C;
    label: string;
    width?: number | string;
    flex?: number;
    align?: 'right' | 'left' | 'center';
    format?: 'boolean' | 'number' | 'string';
    renderCell?: (row: FileStatus) => ReactNode;
}
