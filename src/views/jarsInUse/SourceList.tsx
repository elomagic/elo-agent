"use client"

import { Box, IconButton, List, ListItem, ListItemText, Stack } from '@mui/material';
import { AddCircle, RemoveCircle } from '@mui/icons-material';

interface ComponentProps {
  items: string[];
  onAddClick: () => void;
  onDeleteClick: (itemId: string) => void;
}

export const SourceList = ({ items, onAddClick, onDeleteClick }: Readonly<ComponentProps>) => {

  return (
    <Stack direction="column" spacing={2} width="100%">
      <Box>Source Folders</Box>
      <Stack direction="column">
        <IconButton aria-label="add" onClick={onAddClick}>
          <AddCircle />
        </IconButton>
      </Stack>
      <List style={{ height: "100%" }}>
        {items
          .map((item) => (
            <ListItem key={item}
                      disablePadding
                      secondaryAction={
                        <IconButton edge="end" aria-label="remove" sx={{padding: 0}}>
                          <RemoveCircle color="error" onClick={() => onDeleteClick(item)}/>
                        </IconButton>
                      }
            >
              <ListItemText id={item} primary={item} />
            </ListItem>)
          )}
      </List>
    </Stack>
  );

}