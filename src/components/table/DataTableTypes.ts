import { Key, ReactNode } from 'react';

export enum FileOverloadStatus {
    NO_OVERLOAD = "no_overload",
    SAME_VERSION = "same_version",
    DIFFERENT_VERSION = "different_version",
}

export interface Column<COL extends Key, ROW> {
    id: COL;
    label: string;
    width?: number | string;
    flex?: number;
    align?: 'right' | 'left' | 'center';
    format?: 'boolean' | 'number' | 'string';
    renderCell?: (row: ROW) => ReactNode;
    renderFooter?: (column: Column<COL, ROW>, rows: ROW[]) => string;
}
