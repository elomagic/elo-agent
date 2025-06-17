"use client"

import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import { Engineering, InsertDriveFileOutlined, OpenInNew } from '@mui/icons-material';
import { openFileExternal } from '@/IpcServices';
import {FaRedhat} from "react-icons/fa";
import { IntegrateAgentDialog } from '@/views/jarsInUse/IntegrateAgentDialog';
import { useState } from 'react';

interface ComponentProps {
    onSelectAgentFileClick: () => void;
    agentFile: string | undefined;
}

export const AgentFileGroup = ({onSelectAgentFileClick, agentFile}: Readonly<ComponentProps>) => {

    const [openIntegration, setOpenIntegration] = useState<boolean>(false);

    return (
        <Stack direction="row"
               alignItems="baseline"
               margin={"2px"}
               sx={{
                   borderColor: "primary.main",
                   borderRadius: "20px",
                   borderStyle: "solid",
                   borderWidth: "1px",
                   paddingLeft: 1,
               }}
        >
            <Tooltip title={agentFile}>
                <Box>
                    <FaRedhat size="20px"
                              style={{
                                  marginRight: "8px",
                                  color: "rgb(144, 202, 249)",
                              }}
                    />
                </Box>
            </Tooltip>

            <Tooltip title="Load agent file">
                <IconButton aria-label="add" onClick={onSelectAgentFileClick}>
                    <InsertDriveFileOutlined/>
                </IconButton>
            </Tooltip>

            <Tooltip title="Open agent in external application">
                <IconButton aria-label="reload" onClick={() => agentFile && openFileExternal(agentFile)}>
                    <OpenInNew/>
                </IconButton>
            </Tooltip>

            <Tooltip title="Integrate the java agent into you application">
                <IconButton aria-label="open-agent-file" onClick={() => setOpenIntegration(true)}>
                    <Engineering/>
                </IconButton>
            </Tooltip>

            <IntegrateAgentDialog open={openIntegration} onCloseClick={() => setOpenIntegration(false)} />
        </Stack>
    );

}
