"use client"

import {Stack} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import {
    chooseAgentFile,
    createNewProject, deleteProject,
    listFiles, listProjects,
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
import { TopPanel } from '@/views/jarsInUse/TopPanel';

export const JarsInUseView = () => {

    const initializedRef = useRef(false);

    const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
    const [agentFile, setAgentFile] = useState<string | undefined>(undefined);
    const [fileStatus, setFileStatus] = useState<FileStatus[]>([]);

    const [project, setProject] = useState<Project | undefined>(undefined);

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

    const handleReloadFilesClick = () => {
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

        setProject(p);

        createNewProject(p).then((response) => toast(response.responseMessage));
    }

    const handleProjectNameChanged = (name: string) => {
        listProjects()
            .then(p => {
               const ps = p.filter((f) => f.name === name)
                ps.length > 0 && loadProjectRequestHandler(null, ps[0]);
            });
    }

    const addFolderHandler = (_event: any, folder: string, recursive: boolean)=> {
        applySourceFiles([{ file: folder, recursive: recursive, type: FileType.Directory }]);
    }

    const showProcessDialogHandler = ()=> {
        setOpenProcess(true);
    }

    const saveNewProjectRequestHandler = ()=> {
        setOpenNewProject(true);
    }

    const loadProjectRequestHandler = (_event: any, project: Project)=> {
        setProject(project)
        setSourceFiles(project.sourceFiles);
        setAgentFile(project.agentFile)
        reloadTable(project.sourceFiles, project.agentFile);
    }

    const updateProjectRequestHandler = ()=> {
        setProject(prev => {
            if (!prev) {
                setOpenNewProject(true);
                return;
            }

            const p: Project = {
                name: prev.name,
                sourceFiles: sourceFiles,
                agentFile: agentFile,
            }

            updateProject(p).then((response) => toast(response.responseMessage));

            return prev;
        });
    }

    const deleteProjectRequestHandler = ()=> {
        // TODO Add yes no dialog
        setProject(prev => {
            if (!prev) {
                return;
            }

            deleteProject(prev.name).then((response) => {
                setProject(undefined)
                toast(response.responseMessage)
            });
            return prev;
        })

    }

    const initHooks = () => {
        window.ipcRenderer.on('add-folder', addFolderHandler);
        window.ipcRenderer.on('show-process-dialog', showProcessDialogHandler);
        window.ipcRenderer.on('save-new-project-request', saveNewProjectRequestHandler);
        window.ipcRenderer.on('load-project-request', loadProjectRequestHandler);
        window.ipcRenderer.on('update-project-request', updateProjectRequestHandler);
        window.ipcRenderer.on('delete-project-request', deleteProjectRequestHandler);
        window.ipcRenderer.on('reload-request', handleReloadFilesClick);
    }

    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            initHooks();
        }

        return () => {
            /*
            window.ipcRenderer.removeListener('add-folder', addFolderHandler);
            window.ipcRenderer.removeListener('show-process-dialog', showProcessDialogHandler);
            window.ipcRenderer.removeListener('save-new-project-request', saveNewProjectRequestHandler);
            window.ipcRenderer.removeListener('load-project-request', loadProjectRequestHandler);
            window.ipcRenderer.removeListener('update-project-request', updateProjectRequestHandler);
            window.ipcRenderer.removeListener('delete-project-request', deleteProjectRequestHandler);
            */
        };
    }, []);

    return (
        <Stack direction='column' width="100%" height="100vh">
            <ToastContainer position='top-center' theme='colored' autoClose={2000} />
            <TopPanel projectName={project?.name}
                      onNewProject={saveNewProjectRequestHandler}
                      onDeleteProject={deleteProjectRequestHandler}
                      onProjectNameChange={(name) => handleProjectNameChanged(name)}
                      onReloadFiles={handleReloadFilesClick}
            />
            <FileFilters items={sourceFiles}
                         onUpdateSources={handleUpdateSourcesClick}
                         agentFile={agentFile}
                         onSelectAgentFileClick={handleSelectAgentFileClick}
                         onResetAgentFileClick={handleResetAgentFileClick}
            />
            <FileStatusTable items={fileStatus}/>
            <SelectProcessDialog open={openProcess} onSelectClick={handleSelectProcessClick} onCancelClick={() => setOpenProcess(false)}/>
            <EnterNewProjectNameDialog open={openNewProject} onCreateClick={handleCreateNewProject} onCancelClick={() => setOpenNewProject(false)} />
        </Stack>
    );

}
