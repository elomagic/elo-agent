
import { Table, TableContainer } from '@mui/material';
import { Column } from '@/components/table/DataTableTypes';
import { Key, useState } from 'react';
import { DataTableHeader } from '@/components/table/DataTableHeader';
import { DataTableBody } from '@/components/table/DataTableBody';
import { DataTableFooter } from '@/components/table/DataTableFooter';

interface ComponentProps<COL extends Key, ROW> {
    columns: readonly Column<COL, ROW>[],
    items: ROW[],
    onContextMenu: (row: ROW, mouseX: number, mouseY: number) => void;
}

export const DataTable = <COL extends Key, ROW,>({ columns, items, onContextMenu }: Readonly<ComponentProps<COL, ROW>>) => {

    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

    const [visibleColumns, setVisibleColumns] = useState<Column<COL, ROW>[]>(Array.from(columns));

    const handleSortingClick = (columnId: string) => {
        if (columnId != sortColumn) {
            setSortColumn(columnId);
            setSortOrder('asc');
        } else {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        }
    }

    const handleColumnsVisibilityChanged = (columnIds: COL[] | undefined) => {
        if (!columnIds) {
            return
        }

        setVisibleColumns(columnIds.map(id => {
            const column = columns.find(c => c.id === id) ?? null;
            if (!column) {
                throw new Error(`Column with id ${id} not found`);
            }
            return column;
        }));
    }

    return (
        <TableContainer sx={{ maxHeight: "100%" }}>
            <Table stickyHeader>
                <DataTableHeader<COL, ROW> visibleColumns={visibleColumns}
                                           availableColumns={columns}
                                           sortColumn={sortColumn}
                                           sortOrder={sortOrder}
                                           onSortingChanged={handleSortingClick}
                                           onColumnVisibilityChanged={handleColumnsVisibilityChanged}
                />

                <DataTableBody<COL, ROW> visibleRows={items}
                                         visibleColumns={visibleColumns}
                                         sortColumn={sortColumn}
                                         sortOrder={sortOrder}
                                         onContextMenu={onContextMenu}
                />

                <DataTableFooter<COL, ROW> visibleRows={items}
                                           visibleColumns={visibleColumns}
                />
            </Table>
        </TableContainer>
    );

};
