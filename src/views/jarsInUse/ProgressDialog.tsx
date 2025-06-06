import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Slide
} from '@mui/material';
import {TransitionProps} from "@mui/material/transitions";
import { forwardRef } from 'react';

const Transition = forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<unknown>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

interface ComponentProps {
    text: string,
    open: boolean;
}

export const ProgressDialog = ({ text, open }: Readonly<ComponentProps>) => {

    return (
        <Dialog open={open} TransitionComponent={Transition}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <DialogTitle>{text}</DialogTitle>
                <CircularProgress size="4rem" />
            </DialogContent>
        </Dialog>
    );
};
