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

    const reloadTable = (files: string[], agentFilename: string | undefined) => {
        listFiles(files, false, true).then(files => {
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

    const applySourceFiles = (files: string[]) => {
        // filter duplicates
        const uniqueFolders = files.filter((folder) => !sourceFiles.includes(folder));
        uniqueFolders.push(...sourceFiles.filter((folder) => !files.includes(folder)));

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
        window.ipcRenderer.on('add-folders', (_event, folders: string[])=> {
            applySourceFiles(folders);
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
