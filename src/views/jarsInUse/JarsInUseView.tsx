'use client';

import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import {
    chooseAgentFile,
    deleteProject,
    listFiles, listProjects,
    readAgentFile,
    resetAgentFile,
    updateProject
} from '@/IpcServices';
import { FileStatus, FileStatusTable } from '@/views/jarsInUse/FileStatusTable';
import { toast, ToastContainer } from 'react-toastify';
import { FileMetadata, Project, SourceFile } from '@/shared/Types';
import { TopPanel } from '@/views/jarsInUse/TopPanel';
import { ProgressDialog } from '@/views/jarsInUse/ProgressDialog';

export const JarsInUseView = () => {

    const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
    const [agentFile, setAgentFile] = useState<string | undefined>(undefined);
    const [fileStatus, setFileStatus] = useState<FileStatus[]>([]);

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [projects, setProjects] = useState<Project[]>([]);

    const [progressOpen, setProgressOpen] = useState<boolean>(false);

    const reloadTable = (fileSources: SourceFile[], agentFilename: string | undefined) => {

        setProgressOpen(true);

        return Promise.all([
            listFiles(fileSources, true),
            readAgentFile(agentFilename)])
            .then(([fileMetadatas, agentLines]) => {
                console.info('Files found: ' + fileMetadatas.length);

                // Normalize paths
                for (const element of fileMetadatas) {
                    element.file = element.file.replace(/\\/g, '/');
                }

                const groupIdArtifactId2fileMetadata = new Map<string, FileMetadata[]>();
                fileMetadatas.forEach((meta) => {
                    meta.purls.forEach((purl) => {
                        const groupIdArtifactId = purl.split(':').slice(0, 2).join(':'); // e.g. "com.example:my-artifact"
                        if (!groupIdArtifactId2fileMetadata.has(groupIdArtifactId)) {
                            groupIdArtifactId2fileMetadata.set(groupIdArtifactId, []);
                        }
                        groupIdArtifactId2fileMetadata.get(groupIdArtifactId)?.push(meta);
                    });
                })

                const agentFile2ElapsedTime = new Map<string, string | undefined>();
                let columnsCount = undefined;
                for (const line of agentLines) {
                    const columns = line.split(';');
                    if (columns.length === 1) {
                        columnsCount = 1;
                        agentFile2ElapsedTime.set(columns[1], undefined)
                    } else if (columns.length > 2) {
                        columnsCount = columns.length;
                        agentFile2ElapsedTime.set(columns[1], columns[2])
                    }
                }

                if (columnsCount === 1) {
                    console.warn(("Old version of Agent file identified. Please update the agent in the Java runtime."));
                }

                const bothFiles = Array.from(new Set([...fileMetadatas.map((m) => m.file), ...agentFile2ElapsedTime.keys()]));

                // Create base table of file statuses
                const file2fs = new Map<string, FileStatus>();
                bothFiles.forEach((file) => {
                    file2fs.set(file, {
                        id: file,
                        loaded: agentFile2ElapsedTime.has(file),
                        overloaded: false,
                        elapsedTime: agentFile2ElapsedTime.get(file)
                    });
                })

                groupIdArtifactId2fileMetadata.values().forEach((metas) => {
                    if (metas.length > 1) {
                        metas.forEach((meta) => {
                            const fs = file2fs.get(meta.file);
                            if (fs) {
                                fs.overloaded = true;
                                fs.overloadedFiles = metas.map((m) => m.file);
                            }
                        });
                    }
                })

                setFileStatus(Array.from(file2fs.values()));
            })
            .then(() => toast.success('View reloaded!'))
            .finally(() => setProgressOpen(false))
            .catch((err) => toast.error('Reload failed with error: ' + err));
    }

    const loadProject = (project: Project) => {
        setProject(project);
        setSourceFiles(project.sourceFiles);
        setAgentFile(project.agentFile);
        return reloadTable(project.sourceFiles, project.agentFile);
    };

    const saveProject = (p: Project) => {
        if (!p.name || p.name.length === 0) {
            return Promise.resolve();
        }

        return updateProject(p)
            .then(() => {
                return listProjects();
            })
            .then((items) => {
                setProjects(items);
                setProject(p);
            });
    };

    const handleUpdateSourcesClick = (newFiles: SourceFile[]) => {
        setSourceFiles(newFiles);
        reloadTable(newFiles, agentFile)
            .then(() => project && saveProject({ name: project.name, sourceFiles: newFiles, agentFile }));
    };

    const handleSelectAgentFileClick = () => {
        chooseAgentFile(undefined)
            .then((file: string | undefined) => {
                file && setAgentFile(file);
                file && reloadTable(sourceFiles, file);
                return file;
            })
            .then((file) => project && saveProject({ name: project.name, sourceFiles, agentFile: file }));
    }

    const handleResetAgentFileClick = () => {
        agentFile && resetAgentFile(agentFile)
            .then(() => reloadTable(sourceFiles, agentFile))
            .then(() => toast.success('Successful'));
    };

    const handleNewProject = (name: string) => {
        saveProject({ name, sourceFiles: [], agentFile: undefined })
            .then(() => {
                toast.success('Successful');
            });
    };

    const handleProjectNameChanged = (name: string) => {
        listProjects()
            .then(p => {
                const ps = p.filter((f) => f.name === name);
                ps.length > 0 && loadProject(ps[0]).then(() => {
                    toast.success('Successful');
                });
            });
    };

    const handleDeleteProjectClick = () => {
        // TODO Add yes no dialog

        if (!project) {
            toast.error('No project selected for deletion');
            return;
        }

        deleteProject(project.name).then(() => {
            setProject(undefined);
            return listProjects();
        }).then((p) => {
            setProjects(p);
            toast.success('Successful');
        });

    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
            e.preventDefault(); // Browser-Speichern verhindern
            reloadTable(sourceFiles, agentFile);
        }
    };

    useEffect(() => {
        listProjects().then((items) => setProjects(items));

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <Stack direction="column" width="100%" height="100vh">
            <ToastContainer position="bottom-center" theme="colored" autoClose={2000} />
            <TopPanel project={project}
                      projects={projects}
                      onNewProject={handleNewProject}
                      onDeleteProject={handleDeleteProjectClick}
                      onProjectNameChange={handleProjectNameChanged}
                      onReloadFiles={() => reloadTable(sourceFiles, agentFile)}
                      agentFile={agentFile}
                      onSelectAgentFileClick={handleSelectAgentFileClick}
                      onResetAgentFileClick={handleResetAgentFileClick}
                      sourceFiles={sourceFiles}
                      onUpdateSources={handleUpdateSourcesClick}
            />
            <FileStatusTable items={fileStatus} />

            <ProgressDialog open={progressOpen} text={"Importing files..."} />
        </Stack>
    );

};
