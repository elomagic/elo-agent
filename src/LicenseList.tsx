import licenses from './assets/license-report.json';
import {Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";

export default function LicenseList() {

    return (
        <Table sx={{ minWidth: 200 }} size="small" aria-label="a dense table">
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
    )

}