import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControlLabel, FormGroup,
    Paper
} from "@mui/material";
import { Key, useState } from 'react';
import { Column } from '@/components/table/DataTableTypes';

interface ComponentProps<C extends Key> {
    open: boolean;
    availableColumns: readonly Column<C>[];
    visibleColumns: C[];
    onCloseClick: (columnIds: C[] | undefined) => void;
}

export const ColumnChooserDialog = <C extends Key,>({
                                        open,
                                        availableColumns,
                                        visibleColumns,
                                        onCloseClick
                                    }: Readonly<ComponentProps<C>>) => {

    const [selectedColumns, setSelectedColumns] = useState<C[]>(visibleColumns);

    const handleCheckboxChange = (columnId: C) => {
        setSelectedColumns(prevSelected => {
            if (prevSelected.includes(columnId)) {
                return prevSelected.filter(id => id !== columnId);
            } else {
                return [...prevSelected, columnId];
            }
        });
    }

    return (
        <Dialog open={open} onClose={() => onCloseClick(undefined)} fullWidth maxWidth="xs">
            <DialogTitle>Choose visible columns</DialogTitle>
            <DialogContent>
                <Paper component={'pre'} sx={{padding: 1, overflow: 'auto'}}>
                    <FormGroup>
                        {availableColumns.map(c =>
                            (
                                <FormControlLabel key={c.id}
                                                  control={<Checkbox key={c.id}
                                                                     defaultChecked={selectedColumns.includes(c.id)}
                                                                     onClick={() => handleCheckboxChange(c.id)}/>}
                                                  label={c.label}
                                />
                            )
                        )}
                    </FormGroup>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onCloseClick(undefined)}>Cancel</Button>
                <Button onClick={() => onCloseClick(selectedColumns)}>OK</Button>
            </DialogActions>
        </Dialog>
    );
};