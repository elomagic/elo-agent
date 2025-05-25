"use client"

import {Stack} from '@mui/material';
import {useEffect, useState} from 'react';
import {chooseAgentFile, listFiles, readAgentFile} from '@/IpcServices';
import {FileStatus, FileStatusTable} from '@/views/jarsInUse/FileStatusTable';
import {FileFilters} from '@/views/jarsInUse/FileFilters';
import {toast, ToastContainer} from 'react-toastify';
import {ProcessId, SelectProcessDialog} from "@/views/jarsInUse/SelectProcessDialog";

export const JarsInUseView = () => {

    const [sourceFolders, setSourceFolders] = useState<string[]>([]);
    const [agentFile, setAgentFile] = useState<string | undefined>(undefined);
    const [fileStatus, setFileStatus] = useState<FileStatus[]>([]);

    const [processIds, setProcessIds] = useState<ProcessId[]>([]);
    const [openProcess, setOpenProcess] = useState<boolean>(false);

    const reloadTable = (folders: string[], agentFilename: string | undefined) => {
        listFiles(folders).then(files => {
            console.info("Files found: " + files.length);

            // Normalize paths
            for (let i = 0; i < files.length; i++) {
                files[i] = files[i].replace(/\\/g, '/');
            }

            const status: FileStatus[] = [];

            readAgentFile(agentFilename)
                .then((lines: string[]) => {
                    const files: string[] = []
                    for (const line of lines) {
                        const columns = line.split(";");
                        if (columns.length > 1) {
                            files.push(columns[1]);
                        }
                    }
                    return files;
                })
                .then((usedFiles) => {
                    for (const file of files) {
                        status.push({id: file, loaded: usedFiles.indexOf(file) !== -1});
                    }

                    setFileStatus(status);
                })
                .then(() => toast.success("View reloaded!"))
        })
    };

    const handleDeleteSourceClick = (item: string) => {
        const folders = sourceFolders.filter(i => item !== i);
        setSourceFolders(folders);
        reloadTable(folders, agentFile);
    }

    const handleSelectAgentFileClick = () => {
        chooseAgentFile(undefined)
            .then((file: string | undefined) => {
                file && setAgentFile(file)
                file && reloadTable(sourceFolders, file);
            })
    }

    const handleReloadAgentFileClick = () => {
        reloadTable(sourceFolders, agentFile);
    }

    useEffect(() => {
        window.ipcRenderer.on('add-folders', (_event,folders: string[])=> {
            // TODO filter duplicates
            setSourceFolders([...folders, ...sourceFolders]);
            reloadTable([...folders, ...sourceFolders], agentFile)
        });
        window.ipcRenderer.on('choose-processes', (_event, processes: string[])=> {
            const pi: ProcessId[] = processes.map((p) => { return { id: p, args: p }});

            setProcessIds(pi);
            setOpenProcess(true);
        });
    }, []);

    return (
        <Stack direction='column' width="100%" height="100vh">
            <ToastContainer position='top-center' theme='colored'/>
            <FileFilters items={sourceFolders}
                         onDeleteSourceClick={handleDeleteSourceClick}
                         agentFile={agentFile}
                         onSelectAgentFileClick={handleSelectAgentFileClick}
                         onReloadAgentFileClick={handleReloadAgentFileClick}
            />
            <FileStatusTable items={fileStatus}/>
            <SelectProcessDialog items={processIds} open={openProcess} onYesClick={() => {}} onNoClick={() => {}}/>
        </Stack>
    );

}
