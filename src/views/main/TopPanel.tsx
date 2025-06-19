"use client"

import { Stack } from '@mui/material';
import {Project, SourceFile} from "@/shared/Types";
import {AgentFileGroup} from "@/views/main/AgentFileGroup";
import {SourceFilesGroup} from "@/views/main/SourceFilesGroup";
import { CommonGroup } from '@/views/main/CommonGroup';
import { ProjectGroup } from '@/views/main/ProjectGroup';

interface ComponentProps {
    project: Project | undefined;
    projects: Project[];
    onNewProject: (name: string) => void;
    onDeleteProject: () => void;
    onProjectNameChange: (name: string) => void;
    onReloadFiles: () => void;
    agentFile: string | undefined;
    onSelectAgentFileClick: () => void;
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

            <AgentFileGroup agentFile={agentFile} onSelectAgentFileClick={onSelectAgentFileClick} />

            <SourceFilesGroup items={sourceFiles} onUpdateSources={onUpdateSources} />

            <CommonGroup />
        </Stack>
    );

}