import {Box, DialogContent, Tab, Tabs, Typography} from '@mui/material';
import {SyntheticEvent, useEffect, useState} from 'react';
import LicenseList from '@/LicenseList';
import {getApplicationVersion} from "@/IpcServices";
import {toast} from "react-toastify";
import {ContentDialog} from "@/components/dialogs/ContentDialog";

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
        getApplicationVersion()
            .then((v) => setVersion(v))
            .catch((err) => toast.error(err));
    }, []);

    return (
        <ContentDialog props={{ title: "About", open: open, onClose: onCloseClick }}>
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
        </ContentDialog>
    );
};
