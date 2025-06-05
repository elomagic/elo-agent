"use client"

import {
    Box,
    Divider,
    FormControl,
    IconButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Tooltip
} from '@mui/material';
import { Cached, CheckCircle } from '@mui/icons-material';
import { Project } from '@/shared/Types';
import { CreateProjectDialog } from '@/views/jarsInUse/CreateProjectDialog';
import { useState } from 'react';

interface ComponentProps {
    project: Project | undefined;
    projects: Project[];
    onNewProject: (name: string) => void;
    onDeleteProject: () => void;
    onSelectProjectName: (name: string) => void;
    onReloadFiles: () => void;
}

export const ProjectGroup = ({project, projects, onNewProject, onDeleteProject, onSelectProjectName, onReloadFiles}: Readonly<ComponentProps>) => {

    const [openNewProject, setOpenNewProject] = useState<boolean>(false);

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
        name && onSelectProjectName(name);
    }
    return (
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
                    <MenuItem onClick={() => setOpenNewProject(true)}>
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

            <CreateProjectDialog open={openNewProject}
                                 onCreateClick={onNewProject}
                                 onCancelClick={() => setOpenNewProject(false)} />
        </Stack>
    );

}
