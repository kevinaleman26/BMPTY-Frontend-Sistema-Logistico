// components/PDF/TransferenciaPDF.js
import {
    Document,
    Image,
    Page,
    StyleSheet,
    Text,
    View
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        paddingTop: 20,
        paddingHorizontal: 30,
        paddingBottom: 20,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.4
    },
    headerBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20
    },
    titleContainer: {
        flexDirection: 'column',
        flex: 1
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        lineHeight: 1.2,
        color: '#1256c4',
        marginBottom: 4
    },
    subtitle: {
        fontSize: 11,
        color: '#666',
        marginBottom: 2
    },
    qrContainer: {
        alignItems: 'center',
        width: 120
    },
    qrCode: {
        width: 100,
        height: 100,
        marginBottom: 4
    },
    qrLabel: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center'
    },
    infoBlock: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 12
    },
    infoTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1256c4',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 4
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 6
    },
    infoLabel: {
        width: '35%',
        fontWeight: 'bold',
        fontSize: 9
    },
    infoValue: {
        width: '65%',
        fontSize: 9
    },
    sucursalesBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 10
    },
    sucursalCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 10
    },
    sucursalTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#1256c4'
    },
    sucursalInfo: {
        fontSize: 9,
        marginBottom: 3
    },
    table: {
        borderTopWidth: 1,
        borderTopColor: '#000',
        borderTopStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        marginBottom: 12
    },
    thead: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        paddingVertical: 6,
        backgroundColor: '#1256c4',
        color: '#fff'
    },
    tbodyRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        borderBottomWidth: 0.6,
        borderBottomColor: '#dcdcdc',
        borderBottomStyle: 'solid'
    },
    colCodigo: { width: '40%', paddingLeft: 4 },
    colTipo: { width: '20%', textAlign: 'center' },
    colPeso: { width: '20%', textAlign: 'center' },
    colPrecio: { width: '20%', textAlign: 'right', paddingRight: 4 },
    th: { fontWeight: 'bold', fontSize: 9 },
    totalsBlock: {
        marginTop: 12,
        alignSelf: 'flex-end',
        width: '40%',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 4,
        backgroundColor: '#f9f9f9'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
        fontSize: 10
    },
    totalLabel: {
        fontWeight: 'bold'
    },
    totalValue: {
        fontWeight: 'bold',
        color: '#1256c4'
    },
    grandTotal: {
        fontSize: 12,
        marginTop: 4,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#1256c4'
    },
    statusBlock: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        marginBottom: 12
    },
    statusCard: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        alignItems: 'center',
        minWidth: 120
    },
    statusPending: {
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)'
    },
    statusCompleted: {
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)'
    },
    statusLabel: {
        fontSize: 8,
        color: '#666',
        marginBottom: 2
    },
    statusValue: {
        fontSize: 10,
        fontWeight: 'bold'
    },
    signatureBlock: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    signatureBox: {
        width: '45%',
        borderTopWidth: 1,
        borderTopColor: '#000',
        paddingTop: 8
    },
    signatureLabel: {
        fontSize: 9,
        textAlign: 'center',
        color: '#666'
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        fontSize: 8,
        color: '#999',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 8
    }
});

const money = (n = 0) => `$${Number(n).toFixed(2)}`;
const lb = (n = 0) => `${Number(n).toFixed(2)} LB`;

export default function TransferenciaPDF({ data, qrCodeDataUrl }) {
    const totalPaquetes = data?.paquetes?.length || 0;
    const pesoTotal = data?.paquetes?.reduce((sum, p) => sum + (Number(p.peso) || 0), 0) || 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header con QR */}
                <View style={styles.headerBlock}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.mainTitle}>TRANSFERENCIA</Text>
                        <Text style={styles.mainTitle}>ENTRE SUCURSALES</Text>
                        <Text style={styles.subtitle}>Documento No Fiscal</Text>
                        <Text style={styles.subtitle}>ID: #{data?.id}</Text>
                    </View>
                    <View style={styles.qrContainer}>
                        {qrCodeDataUrl && (
                            <Image style={styles.qrCode} src={qrCodeDataUrl} />
                        )}
                        <Text style={styles.qrLabel}>Escanear para tracking</Text>
                    </View>
                </View>

                {/* Información General */}
                <View style={styles.infoBlock}>
                    <Text style={styles.infoTitle}>Información de Transferencia</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Fecha de Creación:</Text>
                        <Text style={styles.infoValue}>
                            {data?.created_at ? new Date(data.created_at).toLocaleString('es-PA') : 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Operador Emisor:</Text>
                        <Text style={styles.infoValue}>{data?.operador_emisor?.full_name || 'N/A'}</Text>
                    </View>
                    {data?.operador_receptor && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Operador Receptor:</Text>
                            <Text style={styles.infoValue}>{data.operador_receptor.full_name}</Text>
                        </View>
                    )}
                    {data?.received_at && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Fecha de Recepción:</Text>
                            <Text style={styles.infoValue}>
                                {new Date(data.received_at).toLocaleString('es-PA')}
                            </Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Método de Pago:</Text>
                        <Text style={styles.infoValue}>{data?.metodo_pago?.name || 'Pendiente'}</Text>
                    </View>
                </View>

                {/* Sucursales */}
                <View style={styles.sucursalesBlock}>
                    <View style={styles.sucursalCard}>
                        <Text style={styles.sucursalTitle}>🏢 Sucursal Emisora</Text>
                        <Text style={styles.sucursalInfo}>
                            <Text style={{ fontWeight: 'bold' }}>Nombre: </Text>
                            {data?.emisor_sucursal?.name || 'N/A'}
                        </Text>
                        <Text style={styles.sucursalInfo}>
                            <Text style={{ fontWeight: 'bold' }}>Código: </Text>
                            {data?.emisor_sucursal?.codigo || 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.sucursalCard}>
                        <Text style={styles.sucursalTitle}>🏪 Sucursal Receptora</Text>
                        <Text style={styles.sucursalInfo}>
                            <Text style={{ fontWeight: 'bold' }}>Nombre: </Text>
                            {data?.receptor_sucursal?.name || 'N/A'}
                        </Text>
                        <Text style={styles.sucursalInfo}>
                            <Text style={{ fontWeight: 'bold' }}>Código: </Text>
                            {data?.receptor_sucursal?.codigo || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Estados */}
                <View style={styles.statusBlock}>
                    <View style={[styles.statusCard, data?.delivery_status ? styles.statusCompleted : styles.statusPending]}>
                        <Text style={styles.statusLabel}>Estado de Entrega</Text>
                        <Text style={styles.statusValue}>
                            {data?.delivery_status ? '✓ Recibida' : '⏳ Pendiente'}
                        </Text>
                    </View>
                    <View style={[styles.statusCard, data?.payment_status ? styles.statusCompleted : styles.statusPending]}>
                        <Text style={styles.statusLabel}>Estado de Pago</Text>
                        <Text style={styles.statusValue}>
                            {data?.payment_status ? '✓ Pagada' : '⏳ Pendiente'}
                        </Text>
                    </View>
                </View>

                {/* Tabla de Paquetes */}
                <View style={styles.table}>
                    <View style={styles.thead}>
                        <Text style={[styles.colCodigo, styles.th]}>Código Tracking</Text>
                        <Text style={[styles.colTipo, styles.th]}>Tipo</Text>
                        <Text style={[styles.colPeso, styles.th]}>Peso</Text>
                        <Text style={[styles.colPrecio, styles.th]}>Precio</Text>
                    </View>
                    {data?.paquetes?.map((paquete, idx) => (
                        <View key={idx} style={styles.tbodyRow}>
                            <Text style={styles.colCodigo}>{paquete.codigo}</Text>
                            <Text style={styles.colTipo}>{paquete.tipo || 'N/A'}</Text>
                            <Text style={styles.colPeso}>{lb(paquete.peso)}</Text>
                            <Text style={styles.colPrecio}>{money(paquete.precio)}</Text>
                        </View>
                    ))}
                </View>

                {/* Totales */}
                <View style={styles.totalsBlock}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total de Paquetes:</Text>
                        <Text>{totalPaquetes}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Peso Total:</Text>
                        <Text>{lb(pesoTotal)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.grandTotal]}>
                        <Text style={styles.totalLabel}>Monto Total:</Text>
                        <Text style={styles.totalValue}>{money(data?.total)} USD</Text>
                    </View>
                </View>

                {/* Firmas */}
                <View style={styles.signatureBlock}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Firma Emisor</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Firma Receptor</Text>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer} fixed>
                    Sistema Logístico BMPTY | Documento generado automáticamente
                    {' - '}
                    {new Date().toLocaleDateString('es-PA')}
                </Text>
            </Page>
        </Document>
    );
}
