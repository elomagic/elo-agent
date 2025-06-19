
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField,} from '@mui/material';
import { UpTransition } from '../UiUtils';
import {useState} from "react";

interface ComponentProps {
    open: boolean,
    title?: string,
    text: string,
    defaultValue?: string,
    confirmText?: string,
    cancelText?: string,
    onClose: (confirm: boolean, value: string | undefined) => void,
}

export const AskDialog = ({ open, title, text, defaultValue, confirmText, cancelText, onClose }: Readonly<ComponentProps>) => {

    const [value, setValue] = useState<string | undefined>(defaultValue);

    return (
        <Dialog open={open} onClose={() => onClose(false, value)} TransitionComponent={UpTransition} fullWidth>
            <DialogTitle>{title ?? "Question"}</DialogTitle>
            <DialogContent>
                <DialogContentText>{text}</DialogContentText>

                <TextField defaultValue={value} autoFocus focused fullWidth onChange={(evt) => setValue(evt.target.value)} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(false, value)}>{cancelText ?? "Cancel"}</Button>
                <Button onClick={() => onClose(true, value)}>{confirmText ?? "Ok"}</Button>
            </DialogActions>
        </Dialog>
    );

};
