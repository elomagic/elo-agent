import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Paper,
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
    open: boolean;
    onCloseClick: () => void;
}

export const IntegrateAgentDialog = ({ open, onCloseClick }: Readonly<ComponentProps>) => {

    return (
        <Dialog open={open} onClose={onCloseClick} TransitionComponent={Transition} fullWidth>
            <DialogTitle>Java Agent Integration Examples</DialogTitle>
            <DialogContent>
                <p>Java command line arguments to integrate the agent into your application:</p>
                <Paper component={'pre'} sx={{ padding: 1, overflow: 'auto' }}>
                    java -javaagent:"C:/full/path/to/elo-agent-java-[VERSION]-jar-with-dependencies.jar" -jar yourApp.jar
                </Paper>

                <p>When using YAJSW, configuration in your service wrapper:</p>
                <Paper component={'pre'} sx={{ padding: 1, overflow: 'auto' }}>
                    wrapper.java.additional.[n]=-javaagent:C:/full/path/to/elo-agent-java-[VERSION]-jar-with-dependencies.jar
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCloseClick}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
