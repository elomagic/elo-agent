"use client"

import UpdateElectron from '@/components/update'
import './App.css'
import { JarsInUseView } from '@/views/jarsInUse/JarsInUseView';
import { Stack } from '@mui/material';

function App() {

  return (
      <Stack direction='column' height="100%" style={{ width: '100%' }}>
        <JarsInUseView />

        { /* Place static files into the<code>/public</code> folder <img style={{ width: '5em' }} src='./node.svg' alt='Node logo' /> */}

        <UpdateElectron />
      </Stack>
  )
}

export default App