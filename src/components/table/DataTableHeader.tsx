
import { TableCell, TableHead, TableRow } from '@mui/material';
import { Column } from '@/components/table/DataTableTypes';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import { Key, MouseEvent, useState } from 'react';
import { ColumnChooserDialog } from '@/components/table/ColumnChooserDialog';

interface ComponentProps<COL extends Key, ROW> {
    visibleColumns: Column<COL, ROW>[],
    availableColumns: readonly Column<COL, ROW>[],
    sortColumn: string | null,
    sortOrder: "asc" | "desc" | null,
    onSortingChanged: (columnId: string) => void,
    onColumnVisibilityChanged: (columnIds: COL[]) => void,
}

export const DataTableHeader = <COL extends Key, ROW,>({
                                    visibleColumns,
                                    availableColumns,
                                    sortColumn,
                                    sortOrder,
                                    onSortingChanged,
                                    onColumnVisibilityChanged }: Readonly<ComponentProps<COL, ROW>>) => {

    const [columnOpen, setColumnOpen] = useState<boolean>(false);

    const handleOpenColumnDialog = (evt: MouseEvent<HTMLTableCellElement>) => {
        if (evt.button === 2) {
            setColumnOpen(true);
        }
    }

    const handleCloseColumnChooser = (columnIds: COL[] | undefined) => {
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
                        onClick={() => onSortingChanged && onSortingChanged(String(column.id))}
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
