import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from 'react';
import { getJavaProcesses } from "@/IpcServices";
import { UpTransition } from "@/components/UiUtils";
import {toast} from "react-toastify";

export type ProcessId = {
    id: string;
    args: string;
}

interface ComponentProps {
    open: boolean;
    onSelectClick: (args: string) => void;
    onCancelClick: () => void;
}

export const SelectProcessDialog = ({ open, onSelectClick, onCancelClick }: Readonly<ComponentProps>) => {

    const [args, setArgs] = useState<string | undefined>(undefined);
    const [items, setItems] = useState<ProcessId[]>([]);

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

    const handleRefreshClick = () => {
        getJavaProcesses()
            .then(processes => {
                const pids: ProcessId[] = processes.map((line) => {
                    const spaceIndex = line.indexOf(' ');
                    const id = line.substring(0, spaceIndex);
                    let args = line.substring(spaceIndex + 1).trim();

                    if (args.length === 0) {
                        args = "No arguments provided. You may need admin permissions to access the Java arguments.";
                    }

                    return {
                        id,
                        args
                    }
                });

                setItems(pids);
            })
            .catch((err) => toast.error(err));
    }

    useEffect(() => {
        if (open) {
            handleRefreshClick();
        }
    }, [open]);

    return (
        <Dialog fullScreen open={open} onClose={onCancelClick} TransitionComponent={UpTransition}>
            <DialogTitle>Select Java Process</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column" }}>
                <Stack spacing={2} direction="row">
                    <Button variant="outlined" onClick={handleRefreshClick}>Refresh</Button>
                </Stack>

                <DialogContentText sx={{ mt: 2 }}>Please select the Java process you want to use for this operation.</DialogContentText>

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
                        onRowClick={(e) => setArgs(e.row.args)}
                    />
                </Box>

            </DialogContent>
            <DialogActions>
                <Button onClick={onCancelClick}>Cancel</Button>
                <Button onClick={() => args &&onSelectClick(args)}>Select</Button>
            </DialogActions>
        </Dialog>
    );
};
