
import {
    TableCell, TableFooter,
    TableRow
} from '@mui/material';
import { Column, FileStatus } from '@/components/table/DataTableTypes';
import { Key } from 'react';

interface ComponentProps<C extends Key> {
    visibleColumns: Column<C>[],
    visibleRows: FileStatus[],
}

export const DataTableFooter = <C extends Key,>({ visibleColumns, visibleRows }: Readonly<ComponentProps<C>>) => {

    return (
        <TableFooter>
            <TableRow sx={{ bottom: 0, position: 'sticky', backgroundColor: 'black' }}>
                { visibleColumns.map((column) => (
                    <TableCell
                        key={column.id}
                        style={{
                            width: column.width,
                            minWidth: column.width,
                            padding: '4px',
                            textAlign: column.align
                        }}
                    >
                        { column.renderFooter && column.renderFooter(column, visibleRows) }
                    </TableCell>
                ))}
            </TableRow>
        </TableFooter>
    );

};
