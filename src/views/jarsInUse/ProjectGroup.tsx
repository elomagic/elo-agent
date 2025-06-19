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
import { useEffect, useState } from 'react';
import {AskDialog} from "@/components/dialogs/AskDialog";

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

    const handleCreateProject = (confirm: boolean, name: string | undefined) => {
        setOpenNewProject(false);

        if (!confirm || !name || name.trim().length === 0) {
            return
        }

        onNewProject(name);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
            e.preventDefault(); // Browser-Speichern verhindern
            setOpenNewProject(true);
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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

            <AskDialog open={openNewProject}
                       title="Create Project"
                       text="Please enter a new project name."
                       confirmText="Create"
                       onClose={(confirm, value) => handleCreateProject(confirm, value)}
            />
        </Stack>
    );

}
