import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide
} from '@mui/material';
import {TransitionProps} from "@mui/material/transitions";
import { forwardRef } from 'react';
import LicenseList from '@/LicenseList';

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
    onCloseClick: () => void;
}

export const AboutDialog = ({ open, onCloseClick }: Readonly<ComponentProps>) => {

    return (
        <Dialog open={open} onClose={onCloseClick} TransitionComponent={Transition} fullWidth>
            <DialogTitle>About</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mt: 2 }}>
                    <p>This project would not have been possible without open source software.</p>
                    <p>Thanks to the following projects</p>
                </DialogContentText>

                <LicenseList />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCloseClick}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
