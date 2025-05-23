"use client"

import { Grid } from '@mui/material';
import { SourceFiles } from '@/views/jarsInUse/SourceFiles';
import { AgentFile } from './AgentFile';

interface ComponentProps {
  items: string[];
  onAddSourceClick: () => void;
  onDeleteSourceClick: (itemId: string) => void;
  onSelectAgentFileClick: () => void;
  onReloadAgentFileClick: () => void;
}

export const FileFilters = ({ items, onAddSourceClick, onDeleteSourceClick, onSelectAgentFileClick, onReloadAgentFileClick }: Readonly<ComponentProps>) => {

  return (
    <Grid container spacing={2}>
      <Grid size={6}>
        <SourceFiles items={items} onAddClick={onAddSourceClick} onDeleteClick={onDeleteSourceClick} />
      </Grid>
      <Grid size={6}>
        <AgentFile onSelectAgentFileClick={onSelectAgentFileClick} onReloadAgentFileClick={onReloadAgentFileClick} />
      </Grid>
    </Grid>
  );

}