import {
    CircularProgress,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { ImportProgress } from '@/shared/Types';
import {UpTransition} from "@/components/UiUtils";

interface ComponentProps {
    text: string,
    open: boolean;
}

export const ProgressDialog = ({ text, open }: Readonly<ComponentProps>) => {

    const [progressFile, setProgressFile] = useState<string | undefined>(undefined);

    useEffect(() => {

        window.ipcRenderer.on("import-progress", (_event, progress: ImportProgress) => {
            setProgressFile(progress.file.split("/").slice(-1)[0]);
        })

        return () => {
            // Seams not to work window.ipcRenderer.removeAllListeners("import-progress");
        }

    }, [])

    return (
        <Dialog open={open} fullWidth maxWidth="sm" TransitionComponent={UpTransition}>
            <DialogTitle>{text}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CircularProgress size="1rem" /><span>Analyzing file: { progressFile ?? "Loading..." }</span>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
};
