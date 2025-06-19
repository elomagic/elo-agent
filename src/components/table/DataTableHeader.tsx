
import {
    TableCell, TableHead,
    TableRow
} from '@mui/material';
import { Column } from '@/components/table/DataTableTypes';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Key, MouseEvent, useState } from 'react';
import { ColumnChooserDialog } from '@/components/table/ColumnChooserDialog';

interface ComponentProps<C extends Key> {
    visibleColumns: Column<C>[],
    availableColumns: readonly Column<C>[],
    sortColumn: C | null,
    sortOrder: "asc" | "desc" | null,
    onSortingChanged: (columnId: C) => void,
    onColumnVisibilityChanged: (columnIds: C[]) => void,
}

export const DataTableHeader = <C extends Key,>({
                                    visibleColumns,
                                    availableColumns,
                                    sortColumn,
                                    sortOrder,
                                    onSortingChanged,
                                    onColumnVisibilityChanged }: Readonly<ComponentProps<C>>) => {

    const [columnOpen, setColumnOpen] = useState<boolean>(false);

    const handleOpenColumnDialog = (evt: MouseEvent<HTMLTableCellElement>) => {
        if (evt.button === 2) {
            setColumnOpen(true);
        }
    }

    const handleCloseColumnChooser = (columnIds: C[] | undefined) => {
        setColumnOpen(false);

        if (!columnIds) {
            return
        }

        onColumnVisibilityChanged(columnIds);
    }

    return (
        <TableHead>
            <TableRow>
                { visibleColumns.map((column) => (
                    <TableCell
                        onClick={() => onSortingChanged && onSortingChanged(column.id)}
                        onMouseUp={(evt) => handleOpenColumnDialog(evt)}
                        key={column.id}
                        style={{
                            width: column.width,
                            minWidth: column.width,
                            padding: '4px',
                            cursor: 'pointer',
                            textAlign: column.align
                        }}
                    >
                        {column.label}
                        {sortColumn === column.id && sortOrder === 'asc' && (<ArrowDropDown sx={{ verticalAlign: 'bottom' }}/>)}
                        {sortColumn === column.id && sortOrder === 'desc' && (<ArrowDropUp sx={{ verticalAlign: 'bottom' }}/>)}
                    </TableCell>
                ))}
            </TableRow>

            <ColumnChooserDialog open={columnOpen}
                                 availableColumns={availableColumns}
                                 visibleColumns={visibleColumns.map(c => c.id)}
                                 onCloseClick={ (cols) => handleCloseColumnChooser(cols)} />
        </TableHead>
    );

};
