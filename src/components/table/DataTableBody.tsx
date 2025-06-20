import { TableBody, TableCell, TableRow } from '@mui/material';
import { Column } from './DataTableTypes';
import { Key } from 'react';

interface ComponentProps<COL extends Key, ROW> {
    visibleRows: ROW[],
    visibleColumns: Column<COL, ROW>[],
    sortColumn: string | null,
    sortOrder: "asc" | "desc" | null,
    onContextMenu: (event: React.MouseEvent) => void;
}

export const DataTableBody = <COL extends Key, ROW,>({ visibleRows, visibleColumns, sortColumn, sortOrder, onContextMenu }: Readonly<ComponentProps<COL, ROW>>) => {

    const compareValue = (a: ROW, b: ROW): number => {
        if (sortColumn === null) return 0;
        const aValue = a[sortColumn as keyof ROW];
        const bValue = b[sortColumn as keyof ROW];
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    }

    return (
        <TableBody sx={{ bottom: "20px" }}>
            {visibleRows
                .toSorted(compareValue)
                .map((row, i) => {
                    return (
                        <TableRow hover key={i} sx={{ height: '32px'}} onContextMenu={onContextMenu} data-id={i}>
                            {visibleColumns.map((column) => {
                                const value = row[column.id as unknown as keyof ROW];
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
