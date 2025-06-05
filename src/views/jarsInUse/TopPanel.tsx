"use client"

import { Stack } from '@mui/material';
import {Project, SourceFile} from "@/shared/Types";
import {AgentFileGroup} from "@/views/jarsInUse/AgentFileGroup";
import {SourceFilesGroup} from "@/views/jarsInUse/SourceFilesGroup";
import { CommonGroup } from '@/views/jarsInUse/CommonGroup';
import { ProjectGroup } from '@/views/jarsInUse/ProjectGroup';

interface ComponentProps {
    project: Project | undefined;
    projects: Project[];
    onNewProject: (name: string) => void;
    onDeleteProject: () => void;
    onProjectNameChange: (name: string) => void;
    onReloadFiles: () => void;
    agentFile: string | undefined;
    onSelectAgentFileClick: () => void;
    onResetAgentFileClick: () => void;
    sourceFiles: SourceFile[];
    onUpdateSources: (files: SourceFile[]) => void;
}

export const TopPanel = ({
                             project,
                             projects,
                             onNewProject,
                             onDeleteProject,
                             onProjectNameChange,
                             onReloadFiles,
                             agentFile,
                             onSelectAgentFileClick,
                             onResetAgentFileClick,
                             sourceFiles,
                             onUpdateSources
                         }: Readonly<ComponentProps>) => {

    return (
        <Stack direction="row">
            <ProjectGroup project={project}
                          projects={projects}
                          onNewProject={onNewProject}
                          onDeleteProject={onDeleteProject}
                          onSelectProjectName={onProjectNameChange}
                          onReloadFiles={onReloadFiles}
            />

            <AgentFileGroup agentFile={agentFile}
                            onSelectAgentFileClick={onSelectAgentFileClick}
                            onResetAgentFileClick={onResetAgentFileClick}
            />

            <SourceFilesGroup items={sourceFiles} onUpdateSources={onUpdateSources} />

            <CommonGroup />
        </Stack>
    );

}