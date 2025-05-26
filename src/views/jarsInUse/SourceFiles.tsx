"use client"

import {Box, IconButton, Stack, Tooltip} from '@mui/material';
import { EditNote } from '@mui/icons-material';
import { FileId, SourceFilesDialog } from '@/views/jarsInUse/SourceFilesDialog';
import { useState } from 'react';

interface ComponentProps {
    items: string[];
    onUpdateSources: (items: string[]) => void;
}

export const SourceFiles = ({items, onUpdateSources}: Readonly<ComponentProps>) => {

    const [openSources, setOpenSources] = useState<boolean>(false);

    const handleSourcesOkClick = (fileIds: FileId[]) => {
        setOpenSources(false);

        onUpdateSources(fileIds.map((ids) => ids.file));
    }

    return (
        <Stack direction="row" alignItems="center" marginLeft={1} spacing={1} borderRight={1} borderColor={"gray"}>
            <Box>Sources ({items.length} files)</Box>

            <Tooltip title="Show / edit class file sources">
                <IconButton onClick={() => setOpenSources(true)}>
                    <EditNote />
                </IconButton>
            </Tooltip>

            <SourceFilesDialog items={items.map((i) => { return {id: i, file: i}})} open={openSources} onOkClick={handleSourcesOkClick} onCancelClick={() => setOpenSources(false)} />
        </Stack>
    );

}
