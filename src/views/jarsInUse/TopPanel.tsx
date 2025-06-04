"use client"

import {MenuItem, Select, Stack} from '@mui/material';
import {Project, SourceFile} from "@/shared/Types";
import {useEffect, useState} from 'react';
import {listProject} from "@/IpcServices";

interface ComponentProps {
    project: Project;
    onProjectChange: (project: Project) => void;

    onUpdateSources: (files: SourceFile[]) => void;
    agentFile: string | undefined;
    onSelectAgentFileClick: () => void;
    onReloadAgentFileClick: () => void;
    onResetAgentFileClick: () => void;
}

export const TopPanel = ({
                             project,
                             onProjectChange
                         }: Readonly<ComponentProps>) => {

    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        listProject().then((items) => setProjects(items));
    }, []);

    return (
        <Stack direction="row">
            <Select
                labelId="project-label"
                id="project-selector"
                value={project}
                label="Project"
                onChange={(e) => onProjectChange(e.target.value)}
            >
                { projects.map((p) => <MenuItem value={p.name}>{p.name}</MenuItem>) }
            </Select>
        </Stack>
    );

}