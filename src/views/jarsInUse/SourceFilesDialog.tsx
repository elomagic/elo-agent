import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, Divider,
    ListItemIcon, ListItemText,
    Menu, MenuItem,
    Slide, Stack
} from "@mui/material";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {TransitionProps} from "@mui/material/transitions";
import {forwardRef, useEffect, useState} from "react";
import {FileType, SourceFile} from "@/shared/Types";
import {Delete, Description, Folder, FolderCopy, OpenInBrowser} from "@mui/icons-material";
import {yellow} from "@mui/material/colors";
import {chooseFolder, openFolder} from "@/IpcServices";
import {FaJava} from "react-icons/fa";
import {SelectProcessDialog} from "@/views/jarsInUse/SelectProcessDialog";

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

type SourceFileId = SourceFile & {
    id: string;
}

interface ComponentProps {
    items: SourceFileId[];
    open: boolean;
    onOkClick: (items: SourceFile[]) => void;
    onCancelClick: () => void;
}

export const SourceFilesDialog = ({ items, open, onOkClick, onCancelClick }: Readonly<ComponentProps>) => {

    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; } | null>(null);
    const [rows, setRows] = useState<SourceFileId[]>([]);
    const [selected, setSelected] = useState<SourceFileId | undefined>(undefined);

    const [openProcess, setOpenProcess] = useState<boolean>(false);

    const applySourceFiles = (files: SourceFile[]) => {
        // filter duplicates
        const uniqueFolders = Array.from(new Set([...files.map((i) => { return {...i, id: i.file}}), ...rows]));

        setRows(uniqueFolders);
    }

    const handleClose = () => {
        setContextMenu(null);
    };

    const handleOpenInExplorer = () => {
        handleClose();
        selected?.id && openFolder(selected?.id);
    };

    const handleRemoveItem = () => {
        handleClose();
        setRows(rows.filter((r) => r.id !== selected?.id));
    };

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();

        const rowId = (event.currentTarget as HTMLDivElement).getAttribute('data-id');

        const record = items.find((row: SourceFileId) => row.id === rowId);

        setSelected(record)

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

    const handleAddFolderClick = () => {
        chooseFolder(undefined)
            .then((folder) => folder && applySourceFiles([{ file: folder, recursive: false, type: FileType.Directory }]))
    }

    const handleAddFolderRecursiveClick = () => {
        chooseFolder(undefined)
            .then((folder) => folder && applySourceFiles([{ file: folder, recursive: true, type: FileType.Directory }]))
    }

    const handleSelectProcessClick = (a: string) => {
        setOpenProcess(false);

        const args = a.split(" ");
        const cpIndex = args.indexOf("-classpath");
        const cp = args[cpIndex + 1];
        const files = cp.split(";");

        // TODO Classpath from Manifest in case when argument -jar is set

        applySourceFiles(files.map((f) => { return { file: f, recursive: false } }));
    }

    useEffect(() => setRows(items), [items]);

    const columns: GridColDef<(typeof rows)[number]>[] = [
        {
            field: 'type',
            headerName: 'Type',
            width: 90,
            editable: false,
            type: 'string',
            align: 'center',
            headerAlign: 'center',
            hideable: false,
            renderCell: (params) => params.value === FileType.Directory
                ? ( params.row.recursive ? <FolderCopy sx={{ color: yellow[500], verticalAlign: 'middle' }} /> : <Folder sx={{ color: yellow[500], verticalAlign: 'middle' }} />)
                : <Description color="secondary" />,
        },
        {
            field: 'id',
            headerName: 'Folder / File',
            width: 900,
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

                <Stack direction="row" spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
                    <Button startIcon={<Folder />} onClick={handleAddFolderClick}>
                        Add Folder
                    </Button>

                    <Button startIcon={<Folder />} onClick={handleAddFolderRecursiveClick}>
                        Add Folder Recursive
                    </Button>

                    <Button startIcon={<FaJava />} onClick={() => setOpenProcess(true)}>
                        Add Java Process (Experimental)
                    </Button>
                </Stack>

                <Box flexGrow={1} sx={{ width: '100%' }}>
                    <DataGrid
                        rows={rows}
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
                        slotProps={{
                            row: {
                                onContextMenu: (e) => handleContextMenu(e),
                                style: { cursor: 'context-menu' },
                            },
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancelClick}>Close</Button>
                <Button onClick={() => onOkClick(rows)}>OK</Button>
            </DialogActions>

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
                <MenuItem onClick={handleOpenInExplorer}>
                    <ListItemIcon>
                        <OpenInBrowser fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Open in Finder/Explorer</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleRemoveItem}>
                    <ListItemIcon>
                        <Delete fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Remove selected</ListItemText>
                </MenuItem>
            </Menu>

            <SelectProcessDialog open={openProcess} onSelectClick={handleSelectProcessClick} onCancelClick={() => setOpenProcess(false)}/>

        </Dialog>
    );
};
