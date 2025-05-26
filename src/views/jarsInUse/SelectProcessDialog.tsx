import {Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide} from "@mui/material";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {TransitionProps} from "@mui/material/transitions";
import {forwardRef, useState} from "react";

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
    onSelectClick: (args:string) => void;
    onCancelClick: () => void;
}

// eslint-disable-next-line react/function-component-definition
export const SelectProcessDialog = ({ items, open, onSelectClick, onCancelClick }: Readonly<ComponentProps>) => {

    const [args, setArgs] = useState<string | undefined>(undefined);

    const columns: GridColDef<(typeof items)[number]>[] = [
        {
            field: 'id',
            headerName: 'Process Id',
            width: 90,
            editable: false,
            type: 'number',
            hideable: false,
        },
        {
            field: 'args',
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
                    <span>Please select the Java process you want to use for this operation.</span>
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
                        onRowClick={(e) => setArgs(e.row.args)}
                    />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancelClick}>Cancel</Button>
                <Button onClick={() => args &&onSelectClick(args)}>Select</Button>
            </DialogActions>
        </Dialog>
    );
};
