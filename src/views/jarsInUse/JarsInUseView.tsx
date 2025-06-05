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
import {toast, ToastContainer} from 'react-toastify';
import { Project, SourceFile } from '@/shared/Types';
import { CreateProjectDialog } from '@/views/jarsInUse/CreateProjectDialog';
import { TopPanel } from '@/views/jarsInUse/TopPanel';

export const JarsInUseView = () => {

    const initializedRef = useRef(false);

    const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
    const [agentFile, setAgentFile] = useState<string | undefined>(undefined);
    const [fileStatus, setFileStatus] = useState<FileStatus[]>([]);

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [projects, setProjects] = useState<Project[]>([]);

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

    const loadProject = (project: Project)=> {
        setProject(project)
        setSourceFiles(project.sourceFiles);
        setAgentFile(project.agentFile)
        reloadTable(project.sourceFiles, project.agentFile);
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

    const handleCreateNewProject = (name: string) => {
        setOpenNewProject(false);

        const p =  {
            name: name,
            sourceFiles: sourceFiles,
            agentFile: agentFile,
        }

        createNewProject(p)
            .then(() => { return listProjects() })
            .then((items) => {
                setProjects(items);
                setProject(p);
                toast("response.responseMessage")
            });
    }

    const handleProjectNameChanged = (name: string) => {
        listProjects()
            .then(p => {
                const ps = p.filter((f) => f.name === name)
                ps.length > 0 && loadProject(ps[0]);
            });
    }

    const saveNewProjectRequestHandler = ()=> {
        setOpenNewProject(true);
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

            deleteProject(prev.name).then(() => {
                setProject(undefined)
                return listProjects();
            }).then((p) => {
                setProjects(p);
                toast("response.responseMessage")
            });
            return prev;
        })

    }

    const initHooks = () => {
        window.ipcRenderer.on('update-project-request', updateProjectRequestHandler);
    }

    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            initHooks();
        }

        listProjects().then((itmes) =>  setProjects(itmes));

        return () => {
            /*
            window.ipcRenderer.removeListener('update-project-request', updateProjectRequestHandler);
            */
        };
    }, []);

    return (
        <Stack direction='column' width="100%" height="100vh">
            <ToastContainer position='bottom-center' theme='colored' autoClose={2000} />
            <TopPanel project={project}
                      projects={projects}
                      onNewProject={saveNewProjectRequestHandler}
                      onDeleteProject={deleteProjectRequestHandler}
                      onProjectNameChange={(name) => handleProjectNameChanged(name)}
                      onReloadFiles={handleReloadFilesClick}
                      agentFile={agentFile}
                      onSelectAgentFileClick={handleSelectAgentFileClick}
                      onResetAgentFileClick={handleResetAgentFileClick}
                      sourceFiles={project?.sourceFiles ?? []}
                      onUpdateSources={handleUpdateSourcesClick}
            />
            <FileStatusTable items={fileStatus}/>

            <CreateProjectDialog open={openNewProject} onCreateClick={handleCreateNewProject} onCancelClick={() => setOpenNewProject(false)} />
        </Stack>
    );

}
