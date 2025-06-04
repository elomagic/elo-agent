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
import {Project} from "@/shared/Types";

interface ComponentProps {
    project: Project | undefined;
    projects: Project[];
    onNewProject: () => void;
    onDeleteProject: () => void;
    onProjectNameChange: (name: string) => void;
    onReloadFiles: () => void;
}

export const TopPanel = ({
                             project,
                             projects,
                             onNewProject,
                             onDeleteProject,
                             onProjectNameChange,
                             onReloadFiles,
                         }: Readonly<ComponentProps>) => {

    const renderMenuItem = (name: string | undefined) => {
        return (
            <MenuItem key={name} value={name}>
                { name === project?.name
                    ? (
                        <>
                            <ListItemIcon><CheckCircle /></ListItemIcon>
                            <ListItemText>{name}</ListItemText>
                        </>
                    )
                    : (<ListItemText inset>{name}</ListItemText>)
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
            <FormControl sx={{ minWidth: 160 }} size="small" variant="outlined">
                <Select
                    labelId="project-label"
                    id="project-selector"
                    value={project?.name}
                    displayEmpty
                    variant="outlined"
                    label=""
                    renderValue={(value) => {
                        return value ?? (<Box sx={{ color: "text.secondary" }}><em>No project loaded</em></Box> );
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
    );

}