"use client"

import {Box, IconButton, Stack, Tooltip} from '@mui/material';
import { EditNote } from '@mui/icons-material';
import { SourceFilesDialog } from '@/views/jarsInUse/SourceFilesDialog';
import { useState } from 'react';
import {SourceFile} from "@/shared/Types";

interface ComponentProps {
    items: SourceFile[];
    onUpdateSources: (items: SourceFile[]) => void;
}

export const SourceFiles = ({items, onUpdateSources}: Readonly<ComponentProps>) => {

    const [openSources, setOpenSources] = useState<boolean>(false);

    const handleSourcesOkClick = (fileIds: SourceFile[]) => {
        setOpenSources(false);

        onUpdateSources(fileIds);
    }

    return (
        <Stack direction="row" alignItems="center" marginLeft={1} spacing={1} borderRight={1} borderColor={"gray"}>
            <Box>Sources ({items.length} files)</Box>

            <Tooltip title="Show / edit class file sources">
                <IconButton onClick={() => setOpenSources(true)}>
                    <EditNote />
                </IconButton>
            </Tooltip>

            <SourceFilesDialog items={items.map((i) => { return {...i, id: i.file}})} open={openSources} onOkClick={handleSourcesOkClick} onCancelClick={() => setOpenSources(false)} />
        </Stack>
    );

}
