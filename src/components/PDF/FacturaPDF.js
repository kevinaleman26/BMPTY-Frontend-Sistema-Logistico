// components/pdf/NotaEntregaPDF.jsx
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
        paddingTop: 5,
        paddingHorizontal: 28,
        paddingBottom: 10,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.35
    },
    headerBlock: {
        flexDirection: 'row', // ahora en fila
        justifyContent: 'space-between', // título a la izquierda, logo a la derecha
        alignItems: 'center'
    },
    titleContainer: {
        flexDirection: 'column'
    },
    titleLine: {
        fontSize: 30,
        fontWeight: 'bold',
        lineHeight: 1
    },
    logo: {
        width: 180,  // ajusta tamaño según tu necesidad
        height: 160,
        objectFit: 'contain'
    },
    subTitleLine: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    metaBlock: {
        marginBottom: 12
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    metaText: {
        fontSize: 10
    },
    bold: { fontWeight: 'bold' },

    table: {
        borderTopWidth: 1,
        borderTopColor: '#000',
        borderTopStyle: 'solid',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
    },
    thead: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        paddingVertical: 4,
        backgroundColor: '#1256c4',
        color:'#fff'
    },
    tbodyRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        borderBottomWidth: 0.6,
        borderBottomColor: '#dcdcdc',
        borderBottomStyle: 'solid'
    },
    colTracking: { width: '58%', textAlign: 'center' },
    colPeso: { width: '14%', textAlign: 'center', paddingRight: 6 },
    colPrecio: { width: '14%', textAlign: 'center', paddingRight: 6 },
    colTotal: { width: '14%', textAlign: 'center' },
    th: { fontWeight: 'bold' },
    totalsBlock: {
        marginTop: 10,
        alignSelf: 'flex-end',
        width: '35%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2
    },
    totalLabel: {},
    totalValue: { fontWeight: 'bold' },
    disclaimer: {
        marginTop: 14,
        fontSize: 9,
        textAlign: 'left'
    }
});

const money = (n = 0) => `$${Number(n).toFixed(2)}`;
const lb = (n = 0) => `${Number(n).toFixed(2)} LB`;

export default function NotaEntregaPDF({ data }) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Encabezado con logo */}
                <View style={styles.headerBlock}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleLine}>NOTA DE</Text>
                        <Text style={styles.titleLine}>ENTREGA</Text>
                        <Text style={styles.titleLine}>SUCURSAL</Text>
                    </View>
                    {data.logoUrl && (
                        <Image style={styles.logo} src={data?.logoUrl} />
                    )}
                </View>

                {/* Bloque meta */}
                <View style={styles.metaBlock}>
                    <View style={styles.metaRow}>
                        <Text style={[styles.metaText, styles.bold]}>
                            DOCUMENTO NO FISCAL
                        </Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>
                            RUC: {data?.ruc || ''}
                        </Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>
                            Dirección: {data?.direccion || ''}
                        </Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Text style={styles.metaText}>
                            Sucursal: {data?.sucursal || ''}
                        </Text>
                    </View>
                </View>

                {/* Tabla */}
                <View style={styles.table}>
                    <View style={styles.thead}>
                        <Text style={[styles.colTracking, styles.th]}>No. Tracking</Text>
                        <Text style={[styles.colPeso, styles.th]}>Peso</Text>
                        <Text style={[styles.colPrecio, styles.th]}>Precio por LB</Text>
                        <Text style={[styles.colTotal, styles.th]}>Total</Text>
                    </View>
                    {data?.items?.map((it, idx) => (
                        <View key={idx} style={styles.tbodyRow}>
                            <Text style={styles.colTracking}>{it.tracking}</Text>
                            <Text style={styles.colPeso}>{lb(it.peso)}</Text>
                            <Text style={styles.colPrecio}>{money(it.precioLb)}</Text>
                            <Text style={styles.colTotal}>{money(it.total)}</Text>
                        </View>
                    ))}
                </View>

                {/* Totales */}
                <View style={styles.totalsBlock}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Sub-Total:</Text>
                        <Text>{money(data?.subtotal)} USD</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Descuento:</Text>
                        <Text>{money(data?.descuento)} USD</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Otros:</Text>
                        <Text>{money(data?.otros)} USD</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Impuestos (ITBMS):</Text>
                        <Text>{money(data?.itbms)} USD</Text>
                    </View>
                    <View style={[styles.totalRow, { marginTop: 4 }]}>
                        <Text style={[styles.totalLabel, styles.bold]}>Total:</Text>
                        <Text style={[styles.totalValue]}>{money(data?.total)} USD</Text>
                    </View>
                </View>

                {/* Nota/Disclaimer */}
                <Text style={styles.disclaimer}>
                    *** Precios de productos incluyen impuestos. Para poder realizar un reclamo o
                    devolución debe de presentar esta factura ***
                </Text>
            </Page>
        </Document>
    );
}
