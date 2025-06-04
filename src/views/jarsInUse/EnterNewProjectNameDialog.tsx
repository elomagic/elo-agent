import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide,
    TextField
} from '@mui/material';
import {TransitionProps} from "@mui/material/transitions";
import { forwardRef, useState } from 'react';

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface ComponentProps {
    open: boolean;
    onCreateClick: (name: string) => void;
    onCancelClick: () => void;
}

export const EnterNewProjectNameDialog = ({ open, onCreateClick, onCancelClick }: Readonly<ComponentProps>) => {

    const [name, setName] = useState<string | undefined>(undefined);

    return (
        <Dialog open={open} onClose={onCancelClick} TransitionComponent={Transition} fullWidth>
            <DialogTitle>Project name</DialogTitle>
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
