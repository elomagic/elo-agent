import {
    ArrowDropDown, ArrowDropUp,
    CheckCircleOutline,
    ContentCopy,
    NotInterested,
    OpenInBrowser,
    Warning
} from '@mui/icons-material';
import {
    Box,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack, styled,
    Table, TableBody, TableCell,
    TableContainer,
    TableHead, TableRow, TextField,
    Tooltip, tooltipClasses, TooltipProps, Typography
} from '@mui/material';
import { ChangeEvent, ReactNode, useState } from 'react';
import {copyTextToClipboard, openFolder} from "@/IpcServices";

export type FileStatus = {
    id: string;
    loaded: boolean;
    overloaded: boolean;
    overloadedFiles?: string[];
}

interface Column {
    id: 'id' | 'loaded' | 'overloaded';
    label: string;
    width?: number;
    flex?: number;
    align?: 'right' | 'left' | 'center';
    format?: (value: number) => string;
    renderCell?: (row: FileStatus) => ReactNode;
}

interface ComponentProps {
    items: FileStatus[];
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 800,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}));

export const FileStatusTable = ({ items }: Readonly<ComponentProps>) => {

    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; } | null>(null);
    const [currentStatus, setCurrentStatus] = useState<FileStatus | undefined>(undefined);
    const [filter, setFilter] = useState<string>("");
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

    const renderTooltip = (files: string[] | undefined): ReactNode => {

        if (!files || files.length === 0) {
            return "No overloaded files";
        }

        return (<Typography color="inherit">
            {files.map((file, index) => (
                <div key={index}>{file}</div>
            ))}
        </Typography>);
    }

    const columns: readonly Column[] = [
        {
            id: 'loaded',
            label: 'In use',
            width: 60,
            align: 'center',
            format: () => 'boolean',
            renderCell: (fs) => fs.loaded ? (
                <CheckCircleOutline color="success" sx={{ verticalAlign: 'bottom' }} />
            ) : <NotInterested color="disabled" sx={{ verticalAlign: 'bottom' }} />,
        },
        {
            id: 'overloaded',
            label: 'Overloaded',
            width: 60,
            align: 'center',
            format: () => 'boolean',
            renderCell: (fs) => fs.overloaded ? (<HtmlTooltip title={renderTooltip(fs.overloadedFiles)}><Warning color="error" sx={{ verticalAlign: 'bottom' }} /></HtmlTooltip>) : "",
        },
        {
            id: 'id',
            label: 'Filename',
            width: 800,
            format: () => 'string',
            flex: 1,
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

    const handleFilterChanged = (event: ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value.toLowerCase());
    };

    const handleSortingClick = (columnId: string) => {
        if (columnId != sortColumn) {
            setSortColumn(columnId);
            setSortOrder('asc');
        } else {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        }
    }

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
        <Stack direction="column" flexGrow={1} spacing={1}>
            <TextField fullWidth variant="outlined" size="small" placeholder="Filter..." onChange={handleFilterChanged} />
            <Box flexGrow={1} sx={{ height: 500 }}>
                <TableContainer sx={{ maxHeight: "100%" }}>
                    <Table stickyHeader>
                        <TableHead>
                        { columns.map((column) => (
                            <TableCell
                                onClick={() => handleSortingClick(column.id)}
                                key={column.id}
                                style={{ width: column.width, padding: '4px', cursor: 'pointer', textAlign: column.align}}
                            >
                                {column.label}
                                {sortColumn === column.id && sortOrder === 'asc' && (<ArrowDropDown sx={{ verticalAlign: 'bottom' }}/>)}
                                {sortColumn === column.id && sortOrder === 'desc' && (<ArrowDropUp sx={{ verticalAlign: 'bottom' }}/>)}
                            </TableCell>
                        ))}
                        </TableHead>

                        <TableBody>
                            {items
                                .filter(row => filter?.length == 0 || row.id.toLowerCase().includes(filter))
                                .sort((a, b) => {
                                    if (sortColumn === null) return 0;
                                    const aValue = a[sortColumn as keyof FileStatus];
                                    const bValue = b[sortColumn as keyof FileStatus];
                                    if (aValue === undefined) return 1;
                                    if (bValue === undefined) return -1;
                                    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                                    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                                    return 0;
                                })
                                .map((row) => {
                                    return (
                                        <TableRow hover tabIndex={-1} key={row.id} sx={{ height: '32px'}} onContextMenu={handleContextMenu} data-id={row.id}>
                                            {columns.map((column) => {
                                                const value = row[column.id];
                                                return (
                                                    <TableCell key={column.id} align={column.align} sx={{ padding: '4px' }}>
                                                        { column.renderCell && column.renderCell(row) }
                                                        { !column.renderCell &&
                                                                column.format && typeof value === 'number'
                                                                ? column.format(value)
                                                                : value
                                                        }
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>

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