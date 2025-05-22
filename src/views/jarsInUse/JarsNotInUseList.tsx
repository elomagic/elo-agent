"use client"

import { List, ListItem, ListItemText } from '@mui/material';

interface ComponentProps {
  items: string[];
}

export const JarsNotInUseList = ({ items }: Readonly<ComponentProps>) => {

  return (
    <List style={{ height: "100%" }}>
      {items.map((item) => (
        <ListItem key={item} disablePadding>
          <ListItemText id={item} primary={item} />
        </ListItem>)
        )}
    </List>
  );

}