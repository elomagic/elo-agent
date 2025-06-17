import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControlLabel, FormGroup,
    Paper
} from "@mui/material";
import {useState} from "react";

interface ComponentProps {
    open: boolean;
    availableColumns: string[][];
    visibleColumns: string[];
    onCloseClick: (columnIds: string[] | undefined) => void;
}

export const ColumnChooserDialog = ({
                                        open,
                                        availableColumns,
                                        visibleColumns,
                                        onCloseClick
                                    }: Readonly<ComponentProps>) => {

    const [selectedColumns, setSelectedColumns] = useState<string[]>(visibleColumns);

    const handleCheckboxChange = (columnId: string) => {
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
                                <FormControlLabel key={c[0]}
                                                  control={<Checkbox key={c[0]}
                                                                     defaultChecked={selectedColumns.includes(c[0])}
                                                                     onClick={() => handleCheckboxChange(c[0])}/>}
                                                  label={c[1]}
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