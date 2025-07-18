'use client';

import './App.css';
import { MainView } from '@/views/main/MainView';
import { createTheme, CssBaseline, Stack, ThemeProvider } from '@mui/material';

const darkTheme = createTheme({
    typography: {
        // In Chinese and Japanese the characters are usually larger,
        // so a smaller fontsize may be appropriate.
        fontSize: 11,
        fontFamily: '"Segoe UI", Arial, sans-serif',
    },
    palette: {
        mode: 'dark'
    }
});

function App() {

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Stack direction="column" height="100vh" style={{ width: '100%' }}>
                <MainView />

                { /* Place static files into the<code>/public</code> folder <img style={{ width: '5em' }} src='./node.svg' alt='Node logo' />
        <UpdateElectron />
        */}
            </Stack>
        </ThemeProvider>
    );
}

export default App;