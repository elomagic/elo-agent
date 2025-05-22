"use client"

import { Stack } from '@mui/material';
import { SourceList } from '@/views/jarsInUse/SourceList';
import { JarsInUseList } from '@/views/jarsInUse/JarsInUseList';
import { JarsNotInUseList } from '@/views/jarsInUse/JarsNotInUseList';
import { useState } from 'react';

export const JarsInUseView = () => {

  const [sourceFolders, setSourceFolders] = useState<string[]>([]);
  const [inUseItems, setInUseItems] = useState<string[]>([]);
  const [notInUseItems, setNotInUseItems] = useState<string[]>([]);

  const handleAddSourceClick = () => {
    // TODO Add ChooseDirectoryDialog
    const newFolder = "c:\\project\\libs\\";

    // List must be unique
    const folders = sourceFolders.filter(i => newFolder !== i)
    folders.push(newFolder);
  }

  const handleDeleteSourceClick = (item: string) => {
    const folders = sourceFolders.filter(i => item !== i);
    setSourceFolders(folders);

    loadJarLists(folders);
  }

  const loadJarLists = (_folders: string[]) => {
    // TODO Get files by folder
    //folders.map(folder => { IpcServices.listFiles(folder) })
    const totalJars: string[] = [];

    //readFile(".\\my-agent.csv").then((file => file.));

    // TODO Get agent loaded jars
    const loadedJars: string[] = [];

    setInUseItems(loadedJars);

    const leftJars = totalJars.filter(jar => loadedJars.indexOf(jar) >= 0);
    setNotInUseItems(leftJars);
  };

  return (
    <Stack direction='row' width="100%">
      <SourceList items={sourceFolders} onAddClick={handleAddSourceClick} onDeleteClick={handleDeleteSourceClick} />
      <JarsInUseList items={inUseItems} />
      <JarsNotInUseList items={notInUseItems} />
    </Stack>
  );

}