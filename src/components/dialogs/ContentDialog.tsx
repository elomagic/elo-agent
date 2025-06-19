
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import { UpTransition } from '../UiUtils';
import {ReactNode} from "react";

interface ComponentProps {
    open: boolean,
    title: string,
    text?: string,
    defaultValue?: string,
    confirmText?: string,
    cancelText?: string,
    onClose: (confirm: boolean) => void,
}

export const ContentDialog: React.FC<{ children?: ReactNode, props: ComponentProps }> = ({ children, props }) => {

    return (
        <Dialog open={props.open} onClose={() => props.onClose(false)} TransitionComponent={UpTransition} fullWidth>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{props.text}</DialogContentText>
                {children}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose(false)}>{props.cancelText ?? "Cancel"}</Button>
                <Button onClick={() => props.onClose(true)}>{props.confirmText ?? "Ok"}</Button>
            </DialogActions>
        </Dialog>
    );

};
