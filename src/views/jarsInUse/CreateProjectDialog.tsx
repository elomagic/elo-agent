import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from '@mui/material';
import { useState } from 'react';
import {UpTransition} from "@/components/UiUtils";

interface ComponentProps {
    open: boolean;
    onCreateClick: (name: string) => void;
    onCancelClick: () => void;
}

export const CreateProjectDialog = ({ open, onCreateClick, onCancelClick }: Readonly<ComponentProps>) => {

    const [name, setName] = useState<string | undefined>(undefined);

    return (
        <Dialog open={open} onClose={onCancelClick} TransitionComponent={UpTransition} fullWidth>
            <DialogTitle>Create Project</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mt: 2 }}>Please enter a new project name.</DialogContentText>

                <TextField autoFocus focused fullWidth onChange={(evt) => setName(evt.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancelClick}>Cancel</Button>
                <Button onClick={() => name && onCreateClick(name)}>Create</Button>
            </DialogActions>
        </Dialog>
    );
};
