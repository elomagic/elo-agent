"use client"

import {Box, IconButton, Stack, TextField} from '@mui/material';
import {InsertDriveFileOutlined, ReplayOutlined} from '@mui/icons-material';

interface ComponentProps {
    onSelectAgentFileClick: () => void;
    onReloadAgentFileClick: () => void;
}

export const AgentFile = ({onSelectAgentFileClick, onReloadAgentFileClick}: Readonly<ComponentProps>) => {

    return (
        <Stack direction="row"
               alignItems="center"
               spacing={1}
               marginLeft={1}
        >
            <Box whiteSpace={"nowrap"}>Agent File</Box>
            <TextField fullWidth size="small" placeholder="Agent File" disabled />
            <IconButton aria-label="add" onClick={onSelectAgentFileClick}>
                <InsertDriveFileOutlined/>
            </IconButton>
            <IconButton aria-label="reload" onClick={onReloadAgentFileClick}>
                <ReplayOutlined/>
            </IconButton>
        </Stack>
    );

}
