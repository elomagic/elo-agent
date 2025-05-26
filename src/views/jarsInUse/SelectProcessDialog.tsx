import {Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide} from "@mui/material";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {TransitionProps} from "@mui/material/transitions";
import {forwardRef} from "react";

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export type ProcessId = {
    id: string;
    args: string;
}

interface ComponentProps {
    items: ProcessId[];
    open: boolean;
    onSelectClick: () => void;
    onCancelClick: () => void;
}

// eslint-disable-next-line react/function-component-definition
export const SelectProcessDialog = ({ items, open, onSelectClick, onCancelClick }: Readonly<ComponentProps>) => {

    const columns: GridColDef<(typeof items)[number]>[] = [
        {
            field: 'id',
            headerName: 'Process',
            width: 500,
            editable: false,
            type: 'string',
            flex: 1,
            hideable: false,
        },
    ];

    return (
        <Dialog fullScreen open={open} onClose={onCancelClick} TransitionComponent={Transition}>
            <DialogTitle>Select Java Process</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    <Box>Please select the Java process you want to use for this operation.</Box>
                    <DataGrid
                        rows={items}
                        columns={columns}
                        rowHeight={32}
                        columnHeaderHeight={32}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 100,
                                },
                            },
                        }}
                    />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancelClick}>Cancel</Button>
                <Button onClick={onSelectClick}>Select</Button>
            </DialogActions>
        </Dialog>
    );
};
