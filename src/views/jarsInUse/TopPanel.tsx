"use client"

import {
    Box,
    Divider,
    FormControl, IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack, Tooltip
} from '@mui/material';
import { Cached, CheckCircle } from '@mui/icons-material';
import {Project, SourceFile} from "@/shared/Types";
import {AgentFile} from "@/views/jarsInUse/AgentFile";
import {SourceFiles} from "@/views/jarsInUse/SourceFiles";

interface ComponentProps {
    project: Project | undefined;
    projects: Project[];
    onNewProject: () => void;
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

    const renderMenuItem = (name: string | undefined) => {
        return (
            <MenuItem key={name} value={name}>
                { name === project?.name
                    ? (
                        <>
                            <ListItemIcon><CheckCircle /></ListItemIcon>
                            <ListItemText primary={name} secondary={project?.agentFile} />
                        </>
                    )
                    : (<ListItemText inset primary={name} secondary={project?.agentFile} />)
                }
            </MenuItem>
        );
    }

    const handleProjectNameChangeClick = (event: SelectChangeEvent) => {
        const name = event.target.value;
        name && onProjectNameChange(name);
    }

    return (
        <Stack direction="row">
            <Stack direction="row"
                   alignItems="center"
                   margin={"2px"}
                   sx={{
                       borderColor: "secondary.main",
                       borderRadius: "20px",
                       borderStyle: "solid",
                       borderWidth: "1px",
                       paddingLeft: 1,
                   }}
            >
                <FormControl sx={{ minWidth: 160 }} size="small" variant="outlined">
                    <Select
                        labelId="project-label"
                        id="project-selector"
                        value={project?.name}
                        displayEmpty
                        variant="outlined"
                        label=""
                        sx={{ borderStyle: 'none' }}
                        renderValue={(value) => {
                            return value ?? (<Box><em>No project loaded</em></Box> );
                        }}
                        onChange={handleProjectNameChangeClick}
                    >
                        <MenuItem onClick={onNewProject}>
                            <ListItemText>New project...</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={onDeleteProject}>
                            <ListItemText>Delete current project...</ListItemText>
                        </MenuItem>

                        <Divider />

                        { projects.map((p) => renderMenuItem(p.name)) }
                    </Select>
                </FormControl>

                <Tooltip title="Reload files">
                    <IconButton aria-label="reload" onClick={onReloadFiles}>
                        <Cached />
                    </IconButton>
                </Tooltip>
            </Stack>

            <AgentFile agentFile={agentFile}
                       onSelectAgentFileClick={onSelectAgentFileClick}
                       onResetAgentFileClick={onResetAgentFileClick}
            />

            <SourceFiles items={sourceFiles} onUpdateSources={onUpdateSources} />
        </Stack>
    );

}