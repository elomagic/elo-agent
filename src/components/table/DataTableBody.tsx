import { TableBody, TableCell, TableRow } from '@mui/material';
import { Column, FileStatus } from './DataTableTypes';
import { Key } from 'react';

interface ComponentProps<C extends Key> {
    visibleRows: FileStatus[],
    visibleColumns: Column<C>[],
    sortColumn: string | null,
    sortOrder: "asc" | "desc" | null,
    onContextMenu: (event: React.MouseEvent) => void;
}

export const DataTableBody = <C extends Key,>({ visibleRows, visibleColumns, sortColumn, sortOrder, onContextMenu }: Readonly<ComponentProps<C>>) => {

    const compareValue = (a: FileStatus, b: FileStatus): number => {
        if (sortColumn === null) return 0;
        const aValue = a[sortColumn as keyof FileStatus];
        const bValue = b[sortColumn as keyof FileStatus];
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    }

    return (
        <TableBody sx={{ bottom: "20px" }}>
            {visibleRows
                .toSorted(compareValue)
                .map((row) => {
                    return (
                        <TableRow hover key={row.file} sx={{ height: '32px'}} onContextMenu={onContextMenu} data-id={row.file}>
                            {visibleColumns.map((column) => {
                                const value = row[column.id as keyof FileStatus];
                                return (
                                    <TableCell key={column.id} align={column.align} sx={{ padding: '4px' }}>
                                        { column.renderCell && column.renderCell(row) }
                                        { column.format === "boolean" || value === undefined ? "" : String(value) }
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    );
                })}
        </TableBody>
    );

};
