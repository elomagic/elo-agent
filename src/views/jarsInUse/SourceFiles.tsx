"use client"

import {Box, IconButton, List, ListItem, ListItemText, Paper, Stack} from '@mui/material';
import {RemoveCircle} from '@mui/icons-material';

interface ComponentProps {
    items: string[];
    onDeleteClick: (itemId: string) => void;
}

export const SourceFiles = ({items, onDeleteClick}: Readonly<ComponentProps>) => {

    return (
        <Stack direction="column" width="100%" borderRight={1} borderColor={"gray"}>
            <Stack direction="row" alignItems="center" marginLeft={1}>
                <Box>Sources</Box>
            </Stack>

            <Paper elevation={1}>
                <List     sx={{
                    height: "85px",
                    overflow: "auto",
                    marginLeft: "8px"
                    ,
                }}>
                    {items
                        .map((item) => (
                            <ListItem key={item}
                                      disablePadding
                                      secondaryAction={
                                          <IconButton edge="end" aria-label="remove" sx={{padding: 0}}
                                                      onClick={() => onDeleteClick(item)}>
                                              <RemoveCircle color="error"/>
                                          </IconButton>
                                      }
                            >
                                <ListItemText id={item} primary={item}/>
                            </ListItem>)
                        )}
                </List>
            </Paper>
        </Stack>
    );

}
