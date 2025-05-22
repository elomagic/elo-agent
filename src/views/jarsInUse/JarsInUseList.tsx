"use client"

import { Box, List, ListItem, ListItemText, Stack } from '@mui/material';

interface ComponentProps {
  items: string[];
}

export const JarsInUseList = ({ items }: Readonly<ComponentProps>) => {

  return (
    <Stack direction="column" spacing={2} width="100%">
      <Box>JARs in use</Box>
      <List style={{ height: "100%", width: "100%" }}>
        {items.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemText id={item} primary={item} />
          </ListItem>)
        )}
      </List>
    </Stack>
  );

}