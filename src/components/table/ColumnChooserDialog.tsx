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

interface ComponentProps<COL extends Key, ROW> {
    open: boolean;
    availableColumns: readonly Column<COL, ROW>[];
    visibleColumns: COL[];
    onCloseClick: (columnIds: COL[] | undefined) => void;
}

export const ColumnChooserDialog = <COL extends Key, ROW,>({
                                        open,
                                        availableColumns,
                                        visibleColumns,
                                        onCloseClick
                                    }: Readonly<ComponentProps<COL, ROW>>) => {

    const [selectedColumns, setSelectedColumns] = useState<COL[]>(visibleColumns);

    const handleCheckboxChange = (columnId: COL) => {
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