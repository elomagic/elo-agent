import {
    CheckCircleOutline,
    ContentCopy, Error as ErrorIcon,
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
    TextField,
    Tooltip, tooltipClasses, TooltipProps, Typography
} from '@mui/material';
import {ChangeEvent, ReactNode, useState} from 'react';
import {copyTextToClipboard, openFolder} from "@/IpcServices";
import { FileMetadata } from '@/shared/Types';
import { Column, FileOverloadStatus } from '@/components/table/DataTableTypes';
import { DataTable } from '@/components/table/DataTable';

interface ComponentProps {
    items: FileStatus[];
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

type ColumnId = 'file' | 'pom' | 'filename' | 'loaded' | 'overloaded' | 'elapsedTime';

export const FileStatusTable = ({ items }: Readonly<ComponentProps>) => {

    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; } | null>(null);
    const [currentStatus, setCurrentStatus] = useState<FileStatus | undefined>(undefined);
    const [filter, setFilter] = useState<string>("");

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

    const renderOverloadedFiles = (fs: FileStatus): ReactNode => {
        if (!fs.overloaded || !fs.overloadedFiles || fs.overloadedFiles.length === 0) {
            return "";
        }

        const overloadStatus = fs.overloadStatus;

        return (
            <>
                {overloadStatus === FileOverloadStatus.SAME_VERSION &&
                  <HtmlTooltip title={renderFilesTooltip(fs.overloadedFiles)}>
                    <Warning color="warning" sx={{ verticalAlign: 'bottom' }} />
                  </HtmlTooltip>
                }
                {overloadStatus === FileOverloadStatus.DIFFERENT_VERSION &&
                  <HtmlTooltip title={renderFilesTooltip(fs.overloadedFiles)}>
                    <ErrorIcon color="error" sx={{ verticalAlign: 'bottom' }} />
                  </HtmlTooltip>
                }
            </>
        );
    }

    const renderFooterColumn = (column: Column<ColumnId, FileStatus>, rows: FileStatus[]): string => {
        switch (column.id) {
            case "filename":
                return `${rows.length} items`;
            case "loaded":
                return `${rows.filter(row => row.loaded).length} loaded`;
            case "overloaded":
                return `${rows.filter(row => row.overloaded).length} overloaded`;
            default:
                return "";
        }
    }

    const columns: readonly Column<ColumnId, FileStatus>[] = [
        {
            id: 'loaded',
            label: 'In use',
            width: "80px",
            align: 'center',
            format: 'boolean',
            renderCell: (fs) => fs.loaded ? (
                <CheckCircleOutline color="success" sx={{ verticalAlign: 'bottom' }} />
            ) : <NotInterested color="disabled" sx={{ verticalAlign: 'bottom' }} />,
            renderFooter: renderFooterColumn
        },
        {
            id: 'overloaded',
            label: 'Overloaded',
            width: "90px",
            align: 'center',
            format: 'boolean',
            renderCell: (fs) => renderOverloadedFiles(fs),
            renderFooter: renderFooterColumn
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
            renderFooter: renderFooterColumn
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

    const handleContextMenu = (row: FileStatus, mouseX: number, mouseY: number) => {

        const file = row.file;

        const record = items.find((row: FileStatus) => row.file === file);

        setCurrentStatus(record)

        if (!record) {
            return;
        }

        setContextMenu(
            contextMenu === null
                ? { mouseX, mouseY, }
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
                <DataTable items={items.filter(row => filter?.length === 0 || row.file.toLowerCase().includes(filter))}
                           columns={columns}
                           onContextMenu={handleContextMenu}
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