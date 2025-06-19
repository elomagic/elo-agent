'use client';

import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import {
    chooseAgentFile,
    deleteProject,
    listFiles,
    listProjects,
    readAgentFile,
    updateProject
} from '@/IpcServices';
import { FileStatusTable } from '@/views/jarsInUse/FileStatusTable';
import { toast, ToastContainer } from 'react-toastify';
import { FileMetadata, Project, SourceFile } from '@/shared/Types';
import { TopPanel } from '@/views/jarsInUse/TopPanel';
import { ProgressDialog } from '@/views/jarsInUse/ProgressDialog';
import {confirm, DialogProvider} from "@/components/dialogs/DialogContainer";
import { FileOverloadStatus, FileStatus } from '@/components/table/DataTableTypes';

export const JarsInUseView = () => {

    const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
    const [agentFile, setAgentFile] = useState<string | undefined>(undefined);
    const [fileStatus, setFileStatus] = useState<FileStatus[]>([]);

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [projects, setProjects] = useState<Project[]>([]);

    const [progressOpen, setProgressOpen] = useState<boolean>(false);

    const calcStatusOverload = (overloadedFiles: FileMetadata[]) => {
        if (overloadedFiles.length === 0) {
            return FileOverloadStatus.NO_OVERLOAD;
        }

        const versions = new Set(overloadedFiles.flatMap(f => f.purls).map(purl => purl.split('@')[1]));

        return versions.size === 1 ? FileOverloadStatus.SAME_VERSION : FileOverloadStatus.DIFFERENT_VERSION;
    }

    const reloadTable = (fileSources: SourceFile[], agentFilename: string | undefined) => {

        setProgressOpen(true);

        return Promise.all([
            listFiles(fileSources),
            readAgentFile(agentFilename)])
            .then(([fileMetas, agentMetas]) => {
                console.info('Files found: ' + fileMetas.length);
                console.info('Agent files reported: ' + agentMetas.length);

                // Normalize paths
                for (const element of fileMetas) {
                    element.file = element.file.replace(/\\/g, '/');
                }

                const groupIdArtifactId2fileMetadata = new Map<string, FileMetadata[]>();

                const file2fileStatus = new Map<string, FileStatus>();
                fileMetas.forEach((meta) => {
                    file2fileStatus.set(meta.file, {
                        file: meta.file,
                        pom: meta.purls.length !== 0,
                        filename: meta.file.split("/").slice(-1)[0],
                        purls: meta.purls,
                        loaded: false,
                        overloaded: false,
                        elapsedTime: undefined,
                        overloadStatus: FileOverloadStatus.NO_OVERLOAD
                    });

                    meta.purls.forEach((purl) => {
                        const groupIdArtifactId = purl.split('@')[0]; // e.g. "com.example:my-artifact"
                        if (!groupIdArtifactId2fileMetadata.has(groupIdArtifactId)) {
                            groupIdArtifactId2fileMetadata.set(groupIdArtifactId, []);
                        }
                        groupIdArtifactId2fileMetadata.get(groupIdArtifactId)?.push(meta);
                    });

                });
                agentMetas.forEach((agent) => {
                    const fs = file2fileStatus.get(agent.file);
                    if (fs) {
                        fs.loaded = true;
                        fs.pom = fs.pom || agent.purls.length !== 0;
                        fs.elapsedTime = agent.elapsedTime;
                    } else {
                        file2fileStatus.set(agent.file, {
                            file: agent.file,
                            pom: agent.purls.length !== 0,
                            filename: agent.file.split("/").slice(-1)[0],
                            purls: agent.purls,
                            loaded: true,
                            overloaded: false,
                            elapsedTime: undefined,
                            overloadStatus: FileOverloadStatus.NO_OVERLOAD
                        });

                        agent.purls.forEach((purl) => {
                            const groupIdArtifactId = purl.split('@')[0]; // e.g. "com.example:my-artifact"
                            if (!groupIdArtifactId2fileMetadata.has(groupIdArtifactId)) {
                                groupIdArtifactId2fileMetadata.set(groupIdArtifactId, []);
                            }
                            groupIdArtifactId2fileMetadata.get(groupIdArtifactId)?.push(agent);
                        });
                    }
                })

                groupIdArtifactId2fileMetadata.values().forEach((metas) => {
                    if (metas.length > 1) {
                        metas.forEach((meta) => {
                            const fs = file2fileStatus.get(meta.file);
                            if (fs) {
                                fs.overloaded = true;
                                fs.overloadedFiles = metas;
                                fs.overloadStatus = calcStatusOverload(metas);
                            }
                        });
                    }
                })

                setFileStatus(Array.from(file2fileStatus.values()));
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
            .then(() => project && saveProject({ name: project.name, sourceFiles: newFiles, agentFile }))
            .catch((err) => toast.error(err));
    };

    const handleSelectAgentFileClick = () => {
        chooseAgentFile(undefined)
            .then((file: string | undefined) => {
                file && setAgentFile(file);
                file && reloadTable(sourceFiles, file);
                return file;
            })
            .then((file) => project && saveProject({ name: project.name, sourceFiles, agentFile: file }))
            .catch((err) => toast.error(err));
    }

    const handleNewProject = (name: string) => {
        saveProject({ name, sourceFiles: [], agentFile: undefined })
            .then(() => toast.success('Successful'))
            .catch((err) => toast.error(err));
    };

    const handleProjectNameChanged = (name: string) => {
        listProjects()
            .then(p => {
                const ps = p.filter((f) => f.name === name);
                ps.length > 0 && loadProject(ps[0])
                    .then(() => toast.success('Successful'))
                    .catch((err) => toast.error(err));
            })
            .catch((err) => toast.error(err));
    };

    const handleDeleteProjectClick = () => {
        if (!project) {
            toast.error('No project selected for deletion');
            return;
        }

        confirm({
            open: true,
            text: `Are you sure you want to delete the project "${project?.name}"?`,
            onClose: (confirm) => {
                if (confirm) {
                    deleteProject(project.name).then(() => {
                        setProject(undefined);
                        return listProjects();
                    }).then((p) => {
                        setProjects(p);
                        toast.success('Successful');
                    })
                        .catch((err) => toast.error(err));
                }
            }
        });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
            e.preventDefault(); // Browser-Speichern verhindern
            reloadTable(sourceFiles, agentFile);
        }
    };

    useEffect(() => {
        listProjects()
            .then((items) => setProjects(items))
            .catch((err) => toast.error(err));

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <Stack direction="column" width="100%" height="100vh">
            <ToastContainer position="bottom-center" theme="colored" autoClose={2000} />
            <DialogProvider />
            <TopPanel project={project}
                      projects={projects}
                      onNewProject={handleNewProject}
                      onDeleteProject={handleDeleteProjectClick}
                      onProjectNameChange={handleProjectNameChanged}
                      onReloadFiles={() => reloadTable(sourceFiles, agentFile)}
                      agentFile={agentFile}
                      onSelectAgentFileClick={handleSelectAgentFileClick}
                      sourceFiles={sourceFiles}
                      onUpdateSources={handleUpdateSourcesClick}
            />

            <FileStatusTable items={fileStatus} />

            <ProgressDialog open={progressOpen} text={"Importing files..."} />
        </Stack>
    );

};
