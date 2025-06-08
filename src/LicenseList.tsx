import licenses from './assets/license-report.json';
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

export default function LicenseList() {

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: "250px" }}>
                <Table stickyHeader sx={{ minWidth: 200 }} size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Version</TableCell>
                            <TableCell>License</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {licenses.map((row) => (
                            <TableRow
                                key={row.name}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.installedVersion}</TableCell>
                                <TableCell>{row.licenseType}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    )

}