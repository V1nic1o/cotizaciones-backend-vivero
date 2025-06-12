const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');

// Cargar logo desde archivo
const logoPath = path.join(__dirname, '../assets/logo-vivero.png');
const logoBase64 = fs.existsSync(logoPath) ? fs.readFileSync(logoPath).toString('base64') : null;

// Función para formatear la fecha estilo "miércoles, 11 de junio de 2025"
const formatearFecha = () => {
  const fecha = new Date();
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const fonts = {
  Poppins: {
    normal: path.join(__dirname, '../../fonts/Poppins-Regular.ttf'),
    bold: path.join(__dirname, '../../fonts/Poppins-Bold.ttf'),
    italics: path.join(__dirname, '../../fonts/Poppins-Italic.ttf'),
    bolditalics: path.join(__dirname, '../../fonts/Poppins-BoldItalic.ttf')
  }
};

const printer = new PdfPrinter(fonts);

const generarPDFCotizacion = async (cotizacion, cliente, detalles) => {
  const totalGeneral = detalles.reduce((acc, d) => acc + parseFloat(d.total), 0);

  const docDefinition = {
    background: logoBase64
      ? function (currentPage, pageSize) {
          return {
            image: 'logoVivero',
            width: 450, // ✅ Aumentado para mayor presencia visual
            opacity: 0.1,
            absolutePosition: {
              x: (pageSize.width - 450) / 2,
              y: (pageSize.height - 450) / 2
            }
          };
        }
      : undefined,

    images: logoBase64
      ? {
          logoVivero: 'data:image/png;base64,' + logoBase64
        }
      : {},

    content: [
      { text: 'COTIZACIÓN', style: 'header' },
      { text: formatearFecha(), style: 'fecha' },

      {
        text: 'Vivero Flores del Río\nCorreo: mirnafernandez306@gmail.com\nTeléfono: 32459252\nDirección: Colonia el Chilcal Ruta 1 L 1-20, Zona 2, San Miguel Dueñas, Sacatepéquez\nNIT: 12470759\n\n',
        style: 'subheader'
      },
      { text: `Cliente: ${cliente.nombre}\nNIT: ${cliente.nit}\n\n`, style: 'subheader' },

      {
        table: {
          headerRows: 1, // ✅ Se repite encabezado en cada página
          widths: ['auto', 'auto', '*', 'auto', 'auto'],
          body: [
            ['Tipo', 'Cantidad', 'Descripción del Producto', 'Precio Unitario (Q)', 'Total (Q)'],
            ...detalles.map(d => [
              d.tipo || 'bien',
              d.cantidad,
              d.descripcion,
              Number(d.precioUnitario).toFixed(2),
              Number(d.total).toFixed(2)
            ])
          ]
        },
        margin: [0, 0, 0, 10]
      },

      { text: `Total General: Q${totalGeneral.toFixed(2)}\n\n`, style: 'total' },

      {
        text: 'Esta cotización tendrá una validez de 7 días hábiles, ya que los precios de los productos pueden variar.',
        style: 'nota'
      },

      { text: '\n______________________________\nFirma del Encargado del Vivero', style: 'footer' }
    ],

    styles: {
      header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 5] },
      fecha: { fontSize: 10, alignment: 'center', italics: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 12, margin: [0, 0, 0, 10] },
      total: { fontSize: 14, bold: true, alignment: 'right' },
      nota: { fontSize: 11, italics: true, alignment: 'center', margin: [0, 10, 0, 0] },
      footer: { alignment: 'center', margin: [0, 20, 0, 0] }
    },

    defaultStyle: {
      font: 'Poppins'
    }
  };

  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const filePath = path.join(tempDir, `cotizacion-${cotizacion.id}.pdf`);

  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const stream = fs.createWriteStream(filePath);

    pdfDoc.pipe(stream);
    pdfDoc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', (err) => reject(err));
  });
};

module.exports = {
  generarPDFCotizacion
};