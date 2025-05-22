"use client"

import { Box, List, ListItem, ListItemText, Stack } from '@mui/material';

interface ComponentProps {
  items: string[];
}

export const JarsNotInUseList = ({ items }: Readonly<ComponentProps>) => {

  return (
    <Stack direction="column" spacing={2} width="100%">
      <Box>JARs not in use</Box>
      <List style={{ height: "100%" }}>
        {items.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemText id={item} primary={item} />
          </ListItem>)
          )}
      </List>
    </Stack>
  );

}