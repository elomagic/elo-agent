import {ConfirmDialog} from "@/components/dialogs/ConfirmDialog";
import {createContext, ReactNode, useEffect, useState} from "react";


type DialogOptions = {
    open: boolean,
    title?: string,
    text: string,
    confirmText?: string,
    cancelText?: string,
    onClose: (confirm: boolean) => void,
}

type DialogContextType = {
    confirm: (options: DialogOptions) => void;
};

const DialogContainerContext = createContext<DialogContextType | undefined>(undefined);

// 🔧 globales Dialog-API (z. B. für Utility-Zugriff)
let _openDialogGlobal: ((options: DialogOptions) => void) | null = null;

export const confirm = (options: DialogOptions) => {
    if (_openDialogGlobal) {
        _openDialogGlobal(options);
    } else {
        console.warn('Dialog API noch nicht bereit');
    }
};

export const DialogProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
    const [dialog, setDialog] = useState<DialogOptions | null>(null);

    const openDialog = (props: DialogOptions) => {
        setDialog(props);
    };

    const closeDialog = () => {
        setDialog(null);
    };

    useEffect(() => {
        _openDialogGlobal = openDialog;
        return () => {
            _openDialogGlobal = null;
        };
    }, []);

    return (
        <DialogContainerContext.Provider value={{ confirm }}>
            {children}
            <ConfirmDialog
                open={dialog?.open ?? false}
                title={dialog?.title}
                text={dialog?.text ?? ""}
                confirmText={dialog?.confirmText}
                cancelText={dialog?.cancelText}
                onClose={(confirm) => {
                    closeDialog();
                    dialog?.onClose(confirm);
                }}
            />
        </DialogContainerContext.Provider>
    );
};
