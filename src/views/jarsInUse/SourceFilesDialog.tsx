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

export type FileId = {
    id: string;
    file: string;
}

interface ComponentProps {
    items: FileId[];
    open: boolean;
    onOkClick: (items: FileId[]) => void;
    onCancelClick: () => void;
}

export const SourceFilesDialog = ({ items, open, onOkClick, onCancelClick }: Readonly<ComponentProps>) => {

    const columns: GridColDef<(typeof items)[number]>[] = [
        {
            field: 'id',
            headerName: 'Folder / File',
            width: 90,
            editable: false,
            type: 'string',
            hideable: false,
            flex: 1
        },
    ];

    return (
        <Dialog fullScreen open={open} onClose={onCancelClick} TransitionComponent={Transition}>
            <DialogTitle>Data sources</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
                <DialogContentText>Identified folder and files</DialogContentText>

                <Box flexGrow={1} sx={{ width: '100%' }}>
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
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancelClick}>Close</Button>
                <Button onClick={() => items && onOkClick(items)}>OK</Button>
            </DialogActions>
        </Dialog>
    );
};
