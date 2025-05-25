import {CheckCircleOutline, NotInterested} from "@mui/icons-material";
import { Box, Stack } from "@mui/material";
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export type FileStatus = {
  id: string;
  loaded: boolean;
}

interface ComponentProps {
  items: FileStatus[];
}

export const FileStatusTable = ({ items }: Readonly<ComponentProps>) => {

  const columns: GridColDef<(typeof items)[number]>[] = [
    {
      field: 'loaded',
      headerName: 'Is loaded',
      width: 180,
      editable: false,
      type: 'boolean',
      hideable: false,
      renderCell: (params) => params.value ? (
          <CheckCircleOutline color="success" />
      ) : <NotInterested color="disabled" />,
    },
    {
      field: 'id',
      headerName: 'Filename (Jar / Class)',
      width: 800,
      editable: false,
      type: 'string',
      flex: 1,
      hideable: false,
    },
  ];

  return (
    <Stack direction="column" spacing={2} width="100%" height="100vh">
      <Box flexGrow={1} sx={{ height: 500, width: '100%' }}>
        <DataGrid
            rows={items}
            columns={columns}
            rowHeight={32}
            columnHeaderHeight={32}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 100,
                },
              },
            }}
          //pageSizeOptions={[5]}
          //checkboxSelection
          //disableRowSelectionOnClick
        />
      </Box>
    </Stack>
  );

}