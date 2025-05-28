"use client"

import {Stack} from '@mui/material';
import {useEffect, useState} from 'react';
import {chooseAgentFile, listFiles, readAgentFile} from '@/IpcServices';
import {FileStatus, FileStatusTable} from '@/views/jarsInUse/FileStatusTable';
import {FileFilters} from '@/views/jarsInUse/FileFilters';
import {toast, ToastContainer} from 'react-toastify';
import {SelectProcessDialog} from "@/views/jarsInUse/SelectProcessDialog";

export const JarsInUseView = () => {

    const [sourceFiles, setSourceFiles] = useState<string[]>([]);
    const [agentFile, setAgentFile] = useState<string | undefined>(undefined);
    const [fileStatus, setFileStatus] = useState<FileStatus[]>([]);

    const [openProcess, setOpenProcess] = useState<boolean>(false);

    const reloadTable = (fileSources: string[], agentFilename: string | undefined) => {

        Promise.all([
            listFiles(fileSources, false, true),
            readAgentFile(agentFilename)])
            .then(([files, agentLines]) => {
                console.info("Files found: " + files.length);

                // Normalize paths
                for (let i = 0; i < files.length; i++) {
                    files[i] = files[i].replace(/\\/g, '/');
                }

                const filesByAgent: string[] = []
                for (const line of agentLines) {
                    const columns = line.split(";");
                    if (columns.length > 1) {
                        filesByAgent.push(columns[1]);
                    }
                }

                const bothFiles = Array.from(new Set([...files, ...filesByAgent]));

                const status: FileStatus[] = [];

                for (const file of bothFiles) {
                    status.push({ id: file, loaded: filesByAgent.includes(file) });
                }

                setFileStatus(status);

            })
            .then(() => toast.success("View reloaded!"))
            .catch((err) => toast.error("Reload failed with error: " + err));

    };

    const applySourceFiles = (files: string[]) => {
        // filter duplicates
        const uniqueFolders = Array.from(new Set([...files, ...sourceFiles]));

        setSourceFiles(uniqueFolders);
        reloadTable(uniqueFolders, agentFile)
    }

    const handleUpdateSourcesClick = (newFiles: string[]) => {
        setSourceFiles(newFiles);
        reloadTable(newFiles, agentFile);
    }

    const handleSelectAgentFileClick = () => {
        chooseAgentFile(undefined)
            .then((file: string | undefined) => {
                file && setAgentFile(file)
                file && reloadTable(sourceFiles, file);
            })
    }

    const handleReloadAgentFileClick = () => {
        reloadTable(sourceFiles, agentFile);
    }

    const handleSelectProcessClick = (a: string) => {
        setOpenProcess(false);

        const args = a.split(" ");
        const cpIndex = args.indexOf("-classpath");
        const cp = args[cpIndex + 1];
        const files = cp.split(";");

        // TODO Classpath from Manifest in case when argument -jar is set

        applySourceFiles(files);
    }

    useEffect(() => {
        window.ipcRenderer.on('add-folder', (_event, folder: string, _recursive: boolean)=> {
            applySourceFiles([folder]);
        });
        window.ipcRenderer.on('show-process-dialog', (_event)=> {
            setOpenProcess(true);
        });
    }, []);

    return (
        <Stack direction='column' width="100%" height="100vh">
            <ToastContainer position='top-center' theme='colored'/>
            <FileFilters items={sourceFiles}
                         onUpdateSources={handleUpdateSourcesClick}
                         agentFile={agentFile}
                         onSelectAgentFileClick={handleSelectAgentFileClick}
                         onReloadAgentFileClick={handleReloadAgentFileClick}
            />
            <FileStatusTable items={fileStatus}/>
            <SelectProcessDialog open={openProcess} onSelectClick={handleSelectProcessClick} onCancelClick={() => setOpenProcess(false)}/>
        </Stack>
    );

}
