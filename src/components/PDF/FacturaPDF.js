// components/pdf/FacturaPDF.js
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
        paddingHorizontal: 28,
        paddingBottom: 20,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.35
    },

    // ── Header ──────────────────────────────────────────────────────────────
    headerBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#1256c4',
        paddingBottom: 10
    },

    // LEFT: título + info cliente
    leftHeader: {
        flexDirection: 'column',
        flex: 1,
        paddingRight: 16
    },
    titleLine: {
        fontSize: 26,
        fontWeight: 'bold',
        lineHeight: 1,
        color: '#1256c4'
    },
    docType: {
        fontSize: 9,
        color: '#666',
        marginTop: 4,
        marginBottom: 10
    },
    clientBlock: {
        marginTop: 6
    },
    clientLabel: {
        fontSize: 8,
        color: '#888',
        textTransform: 'uppercase',
        marginBottom: 1
    },
    clientValue: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 3
    },
    clientRow: {
        flexDirection: 'row',
        marginBottom: 2
    },
    clientRowLabel: {
        fontSize: 9,
        color: '#555',
        width: 60
    },
    clientRowValue: {
        fontSize: 9
    },

    // RIGHT: logo + info empresa
    rightHeader: {
        alignItems: 'flex-end',
        flexDirection: 'column',
        minWidth: 180
    },
    logo: {
        width: 140,
        height: 80,
        objectFit: 'contain',
        marginBottom: 6
    },
    empresaBlock: {
        alignItems: 'flex-end'
    },
    empresaName: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1256c4',
        marginBottom: 2
    },
    empresaRow: {
        fontSize: 8,
        color: '#555',
        marginBottom: 1,
        textAlign: 'right'
    },

    // ── Divider meta ─────────────────────────────────────────────────────────
    metaStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f3f6fb',
        borderRadius: 3,
        padding: 6,
        marginBottom: 10
    },
    metaItem: {
        flexDirection: 'column',
        alignItems: 'center'
    },
    metaLabel: {
        fontSize: 7,
        color: '#888',
        textTransform: 'uppercase',
        marginBottom: 2
    },
    metaValue: {
        fontSize: 9,
        fontWeight: 'bold'
    },

    // ── Tabla ────────────────────────────────────────────────────────────────
    table: {
        borderTopWidth: 1,
        borderTopColor: '#000',
        borderTopStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        marginBottom: 10
    },
    thead: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        paddingVertical: 5,
        backgroundColor: '#1256c4',
        color: '#fff'
    },
    tbodyRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
        borderBottomStyle: 'solid'
    },
    tbodyRowAlt: {
        backgroundColor: '#f9fafb'
    },
    colNum:      { width: '6%',  textAlign: 'center' },
    colTracking: { width: '44%', paddingLeft: 4 },
    colPeso:     { width: '16%', textAlign: 'center' },
    colPrecio:   { width: '16%', textAlign: 'center' },
    colTotal:    { width: '18%', textAlign: 'right', paddingRight: 4 },
    th: { fontWeight: 'bold', fontSize: 8 },
    td: { fontSize: 9 },

    // ── Totales ───────────────────────────────────────────────────────────────
    totalsBlock: {
        marginTop: 4,
        alignSelf: 'flex-end',
        width: '38%'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
        fontSize: 9
    },
    totalRowFinal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        marginTop: 3,
        borderTopWidth: 1,
        borderTopColor: '#1256c4',
        fontSize: 11,
        fontWeight: 'bold'
    },
    totalValueFinal: {
        color: '#1256c4',
        fontWeight: 'bold'
    },

    // ── Firma ────────────────────────────────────────────────────────────────
    signatureBlock: {
        marginTop: 28,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    signatureBox: {
        width: '42%',
        borderTopWidth: 1,
        borderTopColor: '#000',
        paddingTop: 6
    },
    signatureLabel: {
        fontSize: 8,
        textAlign: 'center',
        color: '#666'
    },

    // ── Disclaimer ───────────────────────────────────────────────────────────
    disclaimer: {
        marginTop: 12,
        fontSize: 8,
        color: '#999',
        textAlign: 'center',
        borderTopWidth: 0.5,
        borderTopColor: '#ddd',
        paddingTop: 6
    }
});

const money = (n = 0) => `$${Number(n).toFixed(2)}`;
const lb = (n = 0) => `${Number(n).toFixed(2)} LB`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-PA', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function NotaEntregaPDF({ data }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* ── HEADER ──────────────────────────────────────────────── */}
                <View style={styles.headerBlock}>

                    {/* LEFT: Título + info cliente */}
                    <View style={styles.leftHeader}>
                        <Text style={styles.titleLine}>NOTA DE</Text>
                        <Text style={styles.titleLine}>ENTREGA</Text>
                        <Text style={styles.docType}>DOCUMENTO NO FISCAL</Text>

                        <View style={styles.clientBlock}>
                            <Text style={styles.clientLabel}>Cliente</Text>
                            <Text style={styles.clientValue}>{data?.nombreCliente || '—'}</Text>

                            <View style={styles.clientRow}>
                                <Text style={styles.clientRowLabel}>Sucursal:</Text>
                                <Text style={styles.clientRowValue}>{data?.sucursal || '—'}</Text>
                            </View>
                            <View style={styles.clientRow}>
                                <Text style={styles.clientRowLabel}>Dirección:</Text>
                                <Text style={styles.clientRowValue}>{data?.direccion || '—'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* RIGHT: Logo + info empresa */}
                    <View style={styles.rightHeader}>
                        {data?.logoUrl && (
                            <Image style={styles.logo} src={data.logoUrl} />
                        )}
                        <View style={styles.empresaBlock}>
                            {data?.razonSocial && (
                                <Text style={styles.empresaName}>{data.razonSocial}</Text>
                            )}
                            {data?.ruc && (
                                <Text style={styles.empresaRow}>RUC: {data.ruc}</Text>
                            )}
                            {data?.telefono && (
                                <Text style={styles.empresaRow}>Tel: {data.telefono}</Text>
                            )}
                            {data?.emailEmpresa && (
                                <Text style={styles.empresaRow}>{data.emailEmpresa}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* ── META STRIP ──────────────────────────────────────────── */}
                <View style={styles.metaStrip}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Nota #</Text>
                        <Text style={styles.metaValue}>{data?.id || '—'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Fecha de emisión</Text>
                        <Text style={styles.metaValue}>{fmtDate(data?.fechaEmision)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Paquetes</Text>
                        <Text style={styles.metaValue}>{data?.items?.length || 0}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Peso total</Text>
                        <Text style={styles.metaValue}>{lb(data?.items?.reduce((s, i) => s + (Number(i.peso) || 0), 0))}</Text>
                    </View>
                </View>

                {/* ── TABLA DE PAQUETES ───────────────────────────────────── */}
                <View style={styles.table}>
                    <View style={styles.thead}>
                        <Text style={[styles.colNum,      styles.th]}>#</Text>
                        <Text style={[styles.colTracking, styles.th]}>No. Tracking</Text>
                        <Text style={[styles.colPeso,     styles.th]}>Peso</Text>
                        <Text style={[styles.colPrecio,   styles.th]}>Precio/LB</Text>
                        <Text style={[styles.colTotal,    styles.th]}>Total</Text>
                    </View>
                    {data?.items?.map((it, idx) => (
                        <View key={idx} style={[styles.tbodyRow, idx % 2 === 1 ? styles.tbodyRowAlt : {}]}>
                            <Text style={[styles.colNum,      styles.td]}>{idx + 1}</Text>
                            <Text style={[styles.colTracking, styles.td]}>{it.tracking}</Text>
                            <Text style={[styles.colPeso,     styles.td]}>{lb(it.peso)}</Text>
                            <Text style={[styles.colPrecio,   styles.td]}>{money(it.precioLb)}</Text>
                            <Text style={[styles.colTotal,    styles.td]}>{money(it.total)}</Text>
                        </View>
                    ))}
                </View>

                {/* ── TOTALES ─────────────────────────────────────────────── */}
                <View style={styles.totalsBlock}>
                    <View style={styles.totalRow}>
                        <Text>Sub-Total:</Text>
                        <Text>{money(data?.subtotal)} USD</Text>
                    </View>
                    {Number(data?.descuento) > 0 && (
                        <View style={styles.totalRow}>
                            <Text>Descuento:</Text>
                            <Text>- {money(data?.descuento)} USD</Text>
                        </View>
                    )}
                    {Number(data?.otros) > 0 && (
                        <View style={styles.totalRow}>
                            <Text>Otros:</Text>
                            <Text>{money(data?.otros)} USD</Text>
                        </View>
                    )}
                    {Number(data?.itbms) > 0 && (
                        <View style={styles.totalRow}>
                            <Text>Impuestos (ITBMS):</Text>
                            <Text>{money(data?.itbms)} USD</Text>
                        </View>
                    )}
                    <View style={styles.totalRowFinal}>
                        <Text>Total:</Text>
                        <Text style={styles.totalValueFinal}>{money(data?.total)} USD</Text>
                    </View>
                </View>

                {/* ── FIRMAS ──────────────────────────────────────────────── */}
                <View style={styles.signatureBlock}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Firma del cliente</Text>
                    </View>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureLabel}>Firma del operador</Text>
                    </View>
                </View>

                {/* ── DISCLAIMER ──────────────────────────────────────────── */}
                <Text style={styles.disclaimer}>
                    Para reclamos o devoluciones presente este documento. Los precios incluyen impuestos aplicables.
                </Text>

            </Page>
        </Document>
    );
}
