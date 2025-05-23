"use client"

import { IconButton, Stack, TextField } from '@mui/material';
import { InsertDriveFileOutlined, ReplayOutlined } from '@mui/icons-material';

interface ComponentProps {
  onSelectAgentFileClick: () => void;
  onReloadAgentFileClick: () => void;
}

export const AgentFile = ({ onSelectAgentFileClick, onReloadAgentFileClick }: Readonly<ComponentProps>) => {

  return (
    <Stack direction="row">
        <TextField fullWidth />
        <IconButton aria-label="add" onClick={onSelectAgentFileClick}>
          <InsertDriveFileOutlined />
        </IconButton>
        <IconButton aria-label="add" onClick={onReloadAgentFileClick}>
          <ReplayOutlined />
        </IconButton>
      </Stack>
  );

}