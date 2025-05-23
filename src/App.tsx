"use client"

import './App.css'
import { JarsInUseView } from '@/views/jarsInUse/JarsInUseView';
import { createTheme, CssBaseline, Stack, ThemeProvider } from '@mui/material';

const darkTheme = createTheme({
  typography: {
    // In Chinese and Japanese the characters are usually larger,
    // so a smaller fontsize may be appropriate.
    fontSize: 12,
  },
  palette: {
    mode: 'dark',
  },
});

function App() {

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Stack direction='column' height="100%" style={{ width: '100%' }}>
        <JarsInUseView />

        { /* Place static files into the<code>/public</code> folder <img style={{ width: '5em' }} src='./node.svg' alt='Node logo' />
        <UpdateElectron />
        */}
      </Stack>
    </ThemeProvider>
  )
}

export default App