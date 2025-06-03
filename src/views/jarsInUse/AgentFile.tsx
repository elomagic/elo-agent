"use client"

import {Box, IconButton, Stack, TextField, Tooltip} from '@mui/material';
import {InsertDriveFileOutlined, OpenInNew, ReplayOutlined, RestartAlt} from '@mui/icons-material';
import { openFileExternal } from '@/IpcServices';

interface ComponentProps {
    onSelectAgentFileClick: () => void;
    onReloadAgentFileClick: () => void;
    onResetAgentFileClick: () => void;
    agentFile: string | undefined;
}

export const AgentFile = ({onSelectAgentFileClick, onReloadAgentFileClick, onResetAgentFileClick, agentFile}: Readonly<ComponentProps>) => {

    return (
        <Stack direction="row"
               alignItems="center"
               spacing={1}
               marginLeft={1}
               flexGrow={1}
        >
            <Box whiteSpace={"nowrap"}>Agent File</Box>
            <TextField fullWidth
                       size="small"
                       placeholder="Agent File"
                       disabled
                       value={agentFile}
                       sx={{
                           "& .MuiInputBase-input": {
                               overflow: "hidden",
                               textOverflow: "ellipsis"
                           }
                       }}
            />
            <Tooltip title="Load agent file">
                <IconButton aria-label="add" onClick={onSelectAgentFileClick}>
                    <InsertDriveFileOutlined/>
                </IconButton>
            </Tooltip>

            <Tooltip title="Reload agent file">
                <IconButton aria-label="reload" onClick={onReloadAgentFileClick}>
                    <ReplayOutlined/>
                </IconButton>
            </Tooltip>

            <Tooltip title="Backup aand reset agent file">
                <IconButton aria-label="reload" onClick={onResetAgentFileClick}>
                    <RestartAlt />
                </IconButton>
            </Tooltip>

            <Tooltip title="Open agent in external application">
                <IconButton aria-label="reload" onClick={() => agentFile && openFileExternal(agentFile)}>
                    <OpenInNew/>
                </IconButton>
            </Tooltip>
        </Stack>
    );

}
