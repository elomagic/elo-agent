"use client"

import { Stack } from '@mui/material';
import { SourceList } from '@/views/jarsInUse/SourceList';
import { JarsInUseList } from '@/views/jarsInUse/JarsInUseList';
import { JarsNotInUseList } from '@/views/jarsInUse/JarsNotInUseList';

export const JarsInUseView = () => {

  return (
    <Stack direction='row'>
      <SourceList />
      <JarsInUseList />
      <JarsNotInUseList />
    </Stack>
  );

}