
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,} from '@mui/material';
import { UpTransition } from './UiUtils';

interface ComponentProps {
    open: boolean,
    title?: string,
    text: string,
    confirmText?: string,
    cancelText?: string,
    onClose: (confirm: boolean) => void,
}

export const ConfirmDialog = ({ open, title, text, confirmText, cancelText, onClose }: Readonly<ComponentProps>) => {

    return (
        <Dialog open={open} slots={{ transition: UpTransition }} keepMounted onClose={() => onClose(false)}>
            <DialogTitle>{title ?? "Confirmation"}</DialogTitle>
            <DialogContent>
                <DialogContentText>{text}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(false)}>{cancelText ?? "Cancel"}</Button>
                <Button onClick={() => onClose(true)}>{confirmText ?? "Ok"}</Button>
            </DialogActions>
        </Dialog>
    );

};
