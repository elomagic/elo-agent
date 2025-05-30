import {CheckCircleOutline, ContentCopy, NotInterested, OpenInBrowser} from "@mui/icons-material";
import { Box, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from "@mui/material";
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {useState} from "react";
import {copyTextToClipboard, openFolder} from "@/IpcServices";

export type FileStatus = {
    id: string;
    loaded: boolean;
}

interface ComponentProps {
    items: FileStatus[];
}

export const FileStatusTable = ({ items }: Readonly<ComponentProps>) => {

    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; } | null>(null);
    const [currentStatus, setCurrentStatus] = useState<FileStatus | undefined>(undefined);

    const columns: GridColDef<(typeof items)[number]>[] = [
        {
            field: 'loaded',
            headerName: 'Is loaded',
            width: 80,
            editable: false,
            type: 'boolean',
            hideable: false,
            renderCell: (params) => params.value ? (
                <CheckCircleOutline color="success" />
            ) : <NotInterested color="disabled" />,
        },
        {
            field: 'id',
            headerName: 'Filename (Jar / Class)',
            width: 800,
            editable: false,
            type: 'string',
            flex: 1,
            hideable: false,
        },
    ];

    const handleClose = () => {
        setContextMenu(null);
    };

    const handleCopyPathIntoClipboard = () => {
        handleClose()
        currentStatus?.id && copyTextToClipboard(currentStatus?.id);
    };

    const handleOpenInExplorer = () => {
        handleClose();
        currentStatus?.id && openFolder(currentStatus?.id);
    };

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();

        const rowId = (event.currentTarget as HTMLDivElement).getAttribute('data-id');

        const record = items.find((row: FileStatus) => row.id === rowId);

        setCurrentStatus(record)

        if (!record) {
            return;
        }

        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                  // Other native context menus might behave different.
                  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                null,
        );
    };

    return (
        <Stack direction="column" spacing={2} width="100%" height="100vh">
            <Box flexGrow={1} sx={{ height: 500, width: '100%' }}>
                <DataGrid
                    rows={items}
                    columns={columns}
                    rowHeight={32}
                    columnHeaderHeight={32}
                    showToolbar={true}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 100,
                            },
                        },
                    }}
                    slotProps={{
                        row: {
                            onContextMenu: (e) => handleContextMenu(e),
                            style: { cursor: 'context-menu' },
                        },
                    }}

                    //pageSizeOptions={[5]}
                    //checkboxSelection
                    //disableRowSelectionOnClick onContextMenu={handleContextMenu}
                />
                <Menu
                    open={contextMenu !== null}
                    onClose={handleClose}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        contextMenu !== null
                            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                            : undefined
                    }
                >
                    <MenuItem onClick={handleCopyPathIntoClipboard}>
                        <ListItemIcon>
                            <ContentCopy fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Copy path</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleOpenInExplorer}>
                        <ListItemIcon>
                            <OpenInBrowser fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Open in Finder/Explorer</ListItemText>
                    </MenuItem>
                </Menu>
            </Box>
        </Stack>
    );

}