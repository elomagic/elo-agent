import {
    ArrowDropDown, ArrowDropUp,
    CheckCircleOutline,
    ContentCopy, Error,
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
    TableContainer, TableFooter,
    TableHead, TableRow, TextField,
    Tooltip, tooltipClasses, TooltipProps, Typography
} from '@mui/material';
import { ChangeEvent, ReactNode, useState } from 'react';
import {copyTextToClipboard, openFolder} from "@/IpcServices";
import { FileMetadata } from '@/shared/Types';

export enum FileOverloadStatus {
    NO_OVERLOAD = "no_overload",
    SAME_VERSION = "same_version",
    DIFFERENT_VERSION = "different_version",
}

export type FileStatus = FileMetadata & {
    filename: string;
    pom: boolean;
    loaded: boolean;
    overloaded: boolean;
    overloadedFiles?: FileMetadata[];
    overloadStatus: FileOverloadStatus;
    elapsedTime: number | undefined; // in milliseconds
}

interface Column {
    id: 'file' | 'pom' | 'filename' | 'loaded' | 'overloaded' | 'elapsedTime';
    label: string;
    width?: number | string;
    flex?: number;
    align?: 'right' | 'left' | 'center';
    format?: string;
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

    const renderFilesTooltip = (files: FileMetadata[] | undefined): ReactNode => {

        if (!files || files.length === 0) {
            return "No overloaded files";
        }

        return (
            <Typography color="inherit">
                {files.map((file) => (
                    <span key={file.file}>{file.file}<br /></span>
                ))}
            </Typography>
        );
    }

    const renderPOMTooltip = (purls: string[] | undefined): ReactNode => {

        if (!purls || purls.length === 0) {
            return "No POM information available";
        }

        return (
            <Typography color="inherit">
                {purls.map((purl) => (
                    <span key={purl}>{purl}<br /></span>
                ))}
            </Typography>
        );
    }


    const renderFooterColumn = (column: Column, rows: FileStatus[]): string => {
        switch (column.id) {
            case "file":
                return `${rows.length} items`;
            case "loaded":
                return `${rows.filter(row => row.loaded).length} loaded`;
            case "overloaded":
                return `${rows.filter(row => row.overloaded).length} overloaded`;
            default:
                return "";
        }
    }

    const renderOverloadedFiles = (fs: FileStatus): ReactNode => {
        if (!fs.overloaded || !fs.overloadedFiles || fs.overloadedFiles.length === 0) {
            return "";
        }

        const overloadStatus = fs.overloadStatus;

        // TODO Check overloads on different versions in filename

        return (
            <>
                {overloadStatus === FileOverloadStatus.SAME_VERSION &&
                  <HtmlTooltip title={renderFilesTooltip(fs.overloadedFiles)}>
                    <Warning color="warning" sx={{ verticalAlign: 'bottom' }} />
                  </HtmlTooltip>
                }
                {overloadStatus === FileOverloadStatus.DIFFERENT_VERSION &&
                  <HtmlTooltip title={renderFilesTooltip(fs.overloadedFiles)}>
                    <Error color="error" sx={{ verticalAlign: 'bottom' }} />
                  </HtmlTooltip>
                }
            </>
        );
    }

    const compareValue = (a: FileStatus, b: FileStatus): number => {
        if (sortColumn === null) return 0;
        const aValue = a[sortColumn as keyof FileStatus];
        const bValue = b[sortColumn as keyof FileStatus];
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    }

    const columns: readonly Column[] = [
        {
            id: 'loaded',
            label: 'In use',
            width: "80px",
            align: 'center',
            format: 'boolean',
            renderCell: (fs) => fs.loaded ? (
                <CheckCircleOutline color="success" sx={{ verticalAlign: 'bottom' }} />
            ) : <NotInterested color="disabled" sx={{ verticalAlign: 'bottom' }} />,
        },
        {
            id: 'overloaded',
            label: 'Overloaded',
            width: "90px",
            align: 'center',
            format: 'boolean',
            renderCell: (fs) => renderOverloadedFiles(fs),
        }, {
            id: 'elapsedTime',
            label: 'Elapsed Time',
            width: "100px",
            align: 'right',
            format: 'number',
        },
        {
            id: 'filename',
            label: 'Filename',
            width: 250,
            format: 'string',
        },
        {
            id: 'pom',
            label: 'POM',
            width: "60px",
            align: 'center',
            format: 'boolean',
            renderCell: (fs) => fs.pom ? (
                <HtmlTooltip title={renderPOMTooltip(fs.purls)}>
                    <CheckCircleOutline color="success" sx={{ verticalAlign: 'bottom' }} />
                </HtmlTooltip>
            ) : "",
        },
        {
            id: 'file',
            label: 'File',
            width: 700,
            format: 'string',
            flex: 1,
        },

    ];

    const handleClose = () => {
        setContextMenu(null);
    };

    const handleCopyPathIntoClipboard = () => {
        handleClose()
        currentStatus?.file && copyTextToClipboard(currentStatus?.file);
    };

    const handleOpenInExplorer = () => {
        handleClose();
        currentStatus?.file && openFolder(currentStatus?.file);
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

        const file = (event.currentTarget as HTMLDivElement).getAttribute('data-id');

        const record = items.find((row: FileStatus) => row.file === file);

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
                            <TableRow>
                                { columns.map((column) => (
                                    <TableCell
                                        onClick={() => handleSortingClick(column.id)}
                                        key={column.id}
                                        style={{
                                            width: column.width,
                                            minWidth: column.width,
                                            padding: '4px',
                                            cursor: 'pointer',
                                            textAlign: column.align
                                        }}
                                    >
                                        {column.label}
                                        {sortColumn === column.id && sortOrder === 'asc' && (<ArrowDropDown sx={{ verticalAlign: 'bottom' }}/>)}
                                        {sortColumn === column.id && sortOrder === 'desc' && (<ArrowDropUp sx={{ verticalAlign: 'bottom' }}/>)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody sx={{ bottom: "20px" }}>
                            {items
                                .filter(row => filter?.length == 0 || row.file.toLowerCase().includes(filter))
                                .sort(compareValue)
                                .map((row) => {
                                    return (
                                        <TableRow hover key={row.file} sx={{ height: '32px'}} onContextMenu={handleContextMenu} data-id={row.file}>
                                            {columns.map((column) => {
                                                const value = row[column.id];
                                                return (
                                                    <TableCell key={column.id} align={column.align} sx={{ padding: '4px' }}>
                                                        { column.renderCell && column.renderCell(row) }
                                                        { !column.renderCell && value === undefined ? "" : value }
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                        <TableFooter>
                            <TableRow sx={{ bottom: 0, position: 'sticky', backgroundColor: 'black' }}>
                                { columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        style={{
                                            width: column.width,
                                            minWidth: column.width,
                                            padding: '4px',
                                            textAlign: column.align
                                        }}
                                    >
                                        {  renderFooterColumn(column, items.filter(row => filter?.length == 0 || row.file.toLowerCase().includes(filter))) }
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableFooter>
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