"use client"

import { IconButton, Stack, Tooltip } from '@mui/material';
import { InsertDriveFileOutlined, OpenInNew, RestartAlt } from '@mui/icons-material';
import { openFileExternal } from '@/IpcServices';
import {FaRedhat} from "react-icons/fa";

interface ComponentProps {
    onSelectAgentFileClick: () => void;
    onResetAgentFileClick: () => void;
    agentFile: string | undefined;
}

export const AgentFile = ({onSelectAgentFileClick, onResetAgentFileClick, agentFile}: Readonly<ComponentProps>) => {

    return (
        <Stack direction="row"
               alignItems="center"
               margin={"2px"}
               sx={{
                   borderColor: "primary.main",
                   borderRadius: "20px",
                   borderStyle: "solid",
                   borderWidth: "1px",
                   paddingLeft: 1,
               }}
        >
            <FaRedhat size="20px"
                      style={{
                          marginRight: "8px",
                          color: "rgb(144, 202, 249)",
                      }}
            />

            <Tooltip title="Load agent file">
                <IconButton aria-label="add" onClick={onSelectAgentFileClick}>
                    <InsertDriveFileOutlined/>
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
