"use client"

import {Grid} from '@mui/material';
import {SourceFiles} from '@/views/jarsInUse/SourceFiles';
import {AgentFile} from './AgentFile';

interface ComponentProps {
    items: string[];
    onDeleteSourceClick: (itemId: string) => void;
    agentFile: string | undefined;
    onSelectAgentFileClick: () => void;
    onReloadAgentFileClick: () => void;
}

export const FileFilters = ({
                                items,
                                onDeleteSourceClick,
                                agentFile,
                                onSelectAgentFileClick,
                                onReloadAgentFileClick,
                            }: Readonly<ComponentProps>) => {

    return (
        <Grid container>
            <Grid size={6}>
                <SourceFiles items={items} onDeleteClick={onDeleteSourceClick} />
            </Grid>
            <Grid size={6}>
                <AgentFile agentFile={agentFile}
                           onSelectAgentFileClick={onSelectAgentFileClick}
                           onReloadAgentFileClick={onReloadAgentFileClick}
                />
            </Grid>
        </Grid>
    );

}