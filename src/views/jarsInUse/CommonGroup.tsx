"use client"

import { IconButton, Stack, Tooltip } from '@mui/material';
import { BugReport, Info } from '@mui/icons-material';

export const CommonGroup = () => {

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
                <IconButton aria-label="about">
                    <Info />
                </IconButton>
            </Tooltip>

            <Tooltip title="Show known issues of the application">
                <IconButton aria-label="reload">
                    <BugReport />
                </IconButton>
            </Tooltip>
        </Stack>
    );

}
