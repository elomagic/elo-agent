"use client"

import { IconButton, Stack, Tooltip } from '@mui/material';
import { BugReport, Info } from '@mui/icons-material';
import { openFileExternal } from '@/IpcServices';
import { AboutDialog } from '@/AboutDialog';
import { useState } from 'react';

export const CommonGroup = () => {

    const [openAbout, setOpenAbout] = useState<boolean>(false);

    return (
        <Stack direction="row"
               alignItems="center"
               margin={"2px"}
               sx={{
                   borderColor: "info.main",
                   borderRadius: "20px",
                   borderStyle: "solid",
                   borderWidth: "1px"
               }}
        >
            <Tooltip title="Show information about the application">
                <IconButton aria-label="about" onClick={() => setOpenAbout(true)}>
                    <Info />
                </IconButton>
            </Tooltip>

            <Tooltip title="Show known issues of the application">
                <IconButton aria-label="reload" onClick={() => openFileExternal("https://github.com/elomagic/elo-agent/issues")}>
                    <BugReport />
                </IconButton>
            </Tooltip>

            <AboutDialog open={openAbout} onCloseClick={() => setOpenAbout(false)} />
        </Stack>
    );

}
