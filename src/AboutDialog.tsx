import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slide, Tab, Tabs, Typography
} from '@mui/material';
import {TransitionProps} from "@mui/material/transitions";
import {forwardRef, SyntheticEvent, useEffect, useState} from 'react';
import LicenseList from '@/LicenseList';
import {getApplicationVersion} from "@/IpcServices";

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

    const [activeTab, setActiveTab] = useState(0);
    const [version, setVersion] = useState<string | undefined>('');

    const handleChange = (_event: SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    useEffect(() => {
        getApplicationVersion().then((v) => setVersion(v));
    }, []);

    return (
        <Dialog open={open} onClose={onCloseClick} TransitionComponent={Transition} fullWidth>
            <DialogTitle>About</DialogTitle>
            <DialogContent sx={{ height: '400px' }}>
                <Tabs value={activeTab} onChange={handleChange}>
                    <Tab label="This Project" />
                    <Tab label="Licenses" />
                </Tabs>

                {activeTab === 0 && <Box sx={{ mt: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        elo Agent {version}
                    </Typography>
                    <p>This is an open source project und distributes under the Apache 2.0 license.</p>
                    <p>Thanks to all supporters</p>
                </Box>}

                {activeTab === 1 && <Box>
                    <p>This project would not have been possible without open source software.</p>
                    <p>Thanks to the following projects</p>

                    <LicenseList />
                </Box>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onCloseClick}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
