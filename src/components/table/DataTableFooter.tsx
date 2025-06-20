
import { TableCell, TableFooter, TableRow } from '@mui/material';
import { Column } from '@/components/table/DataTableTypes';
import { Key } from 'react';

interface ComponentProps<COL extends Key, ROW> {
    visibleColumns: Column<COL, ROW>[],
    visibleRows: ROW[],
}

export const DataTableFooter = <COL extends Key, ROW,>({ visibleColumns, visibleRows }: Readonly<ComponentProps<COL, ROW>>) => {

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
