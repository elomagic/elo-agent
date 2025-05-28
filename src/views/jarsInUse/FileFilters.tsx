"use client"

import { Stack } from '@mui/material';
import {SourceFiles} from '@/views/jarsInUse/SourceFiles';
import {AgentFile} from './AgentFile';
import {SourceFile} from "@/shared/Types";

interface ComponentProps {
    items: SourceFile[];
    onUpdateSources: (files: SourceFile[]) => void;
    agentFile: string | undefined;
    onSelectAgentFileClick: () => void;
    onReloadAgentFileClick: () => void;
}

export const FileFilters = ({
                                items,
                                onUpdateSources,
                                agentFile,
                                onSelectAgentFileClick,
                                onReloadAgentFileClick,
                            }: Readonly<ComponentProps>) => {

    return (
        <Stack direction="row">
            <SourceFiles items={items} onUpdateSources={onUpdateSources} />

            <AgentFile agentFile={agentFile}
                       onSelectAgentFileClick={onSelectAgentFileClick}
                       onReloadAgentFileClick={onReloadAgentFileClick}
            />
        </Stack>
    );

}