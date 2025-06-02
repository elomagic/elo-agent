"use client"

import {Stack} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import {
    chooseAgentFile,
    createNewProject, deleteProject,
    listFiles,
    readAgentFile,
    resetAgentFile,
    updateProject
} from '@/IpcServices';
import {FileStatus, FileStatusTable} from '@/views/jarsInUse/FileStatusTable';
import {FileFilters} from '@/views/jarsInUse/FileFilters';
import {toast, ToastContainer} from 'react-toastify';
import {SelectProcessDialog} from "@/views/jarsInUse/SelectProcessDialog";
import { FileType, Project, SourceFile } from '@/shared/Types';
import { EnterNewProjectNameDialog } from '@/views/jarsInUse/EnterNewProjectNameDialog';

export const JarsInUseView = () => {

    const initializedRef = useRef(false);

    const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
    const [agentFile, setAgentFile] = useState<string | undefined>(undefined);
    const [fileStatus, setFileStatus] = useState<FileStatus[]>([]);

    const [projectName, setProjectName] = useState<string | undefined>(undefined);

    const [openProcess, setOpenProcess] = useState<boolean>(false);

    const [openNewProject, setOpenNewProject] = useState<boolean>(false);

    const reloadTable = (fileSources: SourceFile[], agentFilename: string | undefined) => {

        Promise.all([
            listFiles(fileSources, true),
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

    const applySourceFiles = (files: SourceFile[]) => {
        // filter duplicates
        const uniqueFolders = Array.from(new Set([...files, ...sourceFiles]));

        setSourceFiles(uniqueFolders);
        reloadTable(uniqueFolders, agentFile)
    }

    const handleUpdateSourcesClick = (newFiles: SourceFile[]) => {
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

    const handleResetAgentFileClick = () => {
        agentFile && resetAgentFile(agentFile).then((response) => toast(response.responseMessage));
        reloadTable(sourceFiles, agentFile);
    }

    const handleSelectProcessClick = (a: string) => {
        setOpenProcess(false);

        const args = a.split(" ");
        const cpIndex = args.indexOf("-classpath");
        const cp = args[cpIndex + 1];
        const files = cp.split(";");

        // TODO Classpath from Manifest in case when argument -jar is set

        applySourceFiles(files.map((f) => { return { file: f, recursive: false } }));
    }

    const handleCreateNewProject = (name: string) => {
        setOpenNewProject(false);

        const p =  {
            name: name,
            sourceFiles: sourceFiles,
            agentFile: agentFile,
        }

        setProjectName(name);

        createNewProject(p).then((response) => toast(response.responseMessage));
    }

    const initHooks = () => {
        window.ipcRenderer.on('add-folder', (_event, folder: string, recursive: boolean)=> {
            applySourceFiles([{ file: folder, recursive: recursive, type: FileType.Directory }]);
        });
        window.ipcRenderer.on('show-process-dialog', (_event)=> {
            setOpenProcess(true);
        });
        window.ipcRenderer.on('save-new-project-request', (_event)=> {
            setOpenNewProject(true);
        });
        window.ipcRenderer.on('load-project-request', (_event, project: Project)=> {
            setProjectName(project.name)
            setSourceFiles(project.sourceFiles);
            setAgentFile(project.agentFile)
            reloadTable(project.sourceFiles, project.agentFile);
        });
        window.ipcRenderer.on('update-project-request', (_event)=> {
            if (!projectName) {
                setOpenNewProject(true);
                return;
            }

            const p: Project = {
                name: projectName,
                sourceFiles: sourceFiles,
                agentFile: agentFile,
            }

            updateProject(p).then((response) => toast(response.responseMessage));
        });
        window.ipcRenderer.on('delete-project-request', (_event)=> {
            if (!projectName) {
                return;
            }

            deleteProject(projectName).then((response) => {
                setProjectName(undefined)
                toast(response.responseMessage)
            });
        });
    }

    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            // Einmalige Initialisierung
            initHooks();
        }
    }, []);

    return (
        <Stack direction='column' width="100%" height="100vh">
            <ToastContainer position='top-center' theme='colored'/>
            <FileFilters items={sourceFiles}
                         onUpdateSources={handleUpdateSourcesClick}
                         agentFile={agentFile}
                         onSelectAgentFileClick={handleSelectAgentFileClick}
                         onReloadAgentFileClick={handleReloadAgentFileClick}
                         onResetAgentFileClick={handleResetAgentFileClick}
            />
            <FileStatusTable items={fileStatus}/>
            <SelectProcessDialog open={openProcess} onSelectClick={handleSelectProcessClick} onCancelClick={() => setOpenProcess(false)}/>
            <EnterNewProjectNameDialog open={openNewProject} onCreateClick={handleCreateNewProject} onCancelClick={() => setOpenNewProject(false)} />
        </Stack>
    );

}
