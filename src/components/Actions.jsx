import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Actions({ users = [] }) {
    const handleExport = () => {
        if (!users.length) {
            alert('No hay datos para exportar');
            return;
        }

        const exportData = users.map(user => ({
            'User ID': user.userId,
            'Nombre': user.username,
            'Membresía': user.membership,
            'Referido': user.referredBy,
            'Estado': user.status === 'active' ? 'Activo' : 'Inactivo',
            'Fecha Alta': user.startDate || '-',
            'Fecha Fin': user.endDate || '-',
            'Pagos': user.payment,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, `usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <div className="flex flex-wrap gap-4 mb-8">
            {/* Botón Exportar */}
            <button
                onClick={handleExport}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all"
            >
                Exportar
            </button>


        </div>
    );
}
