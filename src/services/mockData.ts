/*
  ====================  Mock Data ====================

  Datos simulados para modo portfolio.
  Reemplaza las llamadas reales a la API cuando el backend 
  no está disponible. Incluye productos, órdenes, contenido 
  del sitio, interacciones y estadísticas.

  =========================================================
*/

// ========================== Productos ==========================

export interface MockProduct {
  _id: string
  title: string
  description: string
  price: number
  category: string
  stock: number
  status: boolean
  thumbnails: string[]
  size: string[]
  discount: number
  createdAt: string
  updatedAt: string
}

export const mockProducts: MockProduct[] = [
  {
    _id: "prod_001",
    title: "Corpiño Encaje Floral",
    description:
      "Corpiño de encaje con detalles florales bordados a mano. Diseñado para brindar comodidad y elegancia, con breteles ajustables y cierre trasero de tres posiciones. Tela suave y transpirable ideal para el uso diario.",
    price: 12500,
    category: "corpiños",
    stock: 25,
    status: true,
    thumbnails: [
      "https://i.pinimg.com/736x/50/94/1e/50941e8e0e927cd68172e4063b039135.jpg",
    ],
    size: ["85B", "90B", "85C", "90C", "95C"],
    discount: 0,
    createdAt: "2025-10-15T10:30:00Z",
    updatedAt: "2025-12-01T14:00:00Z",
  },
  {
    _id: "prod_002",
    title: "Bombacha Microfibra Clásica",
    description:
      "Bombacha de microfibra ultra suave con cintura media y corte clásico. Sin costuras visibles para un ajuste perfecto bajo cualquier prenda. Disponible en varios colores para combinar con tu look diario.",
    price: 4800,
    category: "bombachas",
    stock: 50,
    status: true,
    thumbnails: [
      "https://i.pinimg.com/1200x/12/66/28/126628974ebc5613b10c7848e6315330.jpg",
    ],
    size: ["S", "M", "L", "XL"],
    discount: 10,
    createdAt: "2025-09-20T08:15:00Z",
    updatedAt: "2025-11-25T18:30:00Z",
  },
  {
    _id: "prod_003",
    title: "Conjunto Satén Romántico",
    description:
      "Conjunto de dos piezas en satén premium con detalles de encaje. Incluye corpiño triangular con arco decorativo y bombacha tipo bikini con lazos laterales. Perfecto para ocasiones especiales.",
    price: 18900,
    category: "conjuntos",
    stock: 15,
    status: true,
    thumbnails: [
      "https://i.pinimg.com/736x/9e/f0/b7/9ef0b7baff3fd21dd3a85e6b5fb27995.jpg",
    ],
    size: ["S", "M", "L"],
    discount: 15,
    createdAt: "2025-08-10T12:00:00Z",
    updatedAt: "2025-11-20T09:45:00Z",
  },
  {
    _id: "prod_004",
    title: "Body Encaje Negro",
    description:
      "Body de encaje negro con escote profundo en V y espalda descubierta. Confeccionado con encaje premium importado. Broche inferior para mayor comodidad. Una pieza versátil para usar como lencería o como prenda exterior.",
    price: 22500,
    category: "bodys",
    stock: 12,
    status: true,
    thumbnails: [
      "https://i.pinimg.com/736x/84/4e/a1/844ea148cfde3c2dc1e5b2731f8fafa5.jpg",
    ],
    size: ["S", "M", "L", "XL"],
    discount: 0,
    createdAt: "2025-07-05T09:00:00Z",
    updatedAt: "2025-10-18T11:30:00Z",
  },
  {
    _id: "prod_005",
    title: "Pijama Seda Summer",
    description:
      "Pijama de dos piezas en seda sintética de alta calidad. Camisa de mangas cortas con botones y short con cintura elástica. Tacto ultrasuave y diseño sofisticado para las noches de verano.",
    price: 15800,
    category: "pijamas",
    stock: 20,
    status: true,
    thumbnails: [
      "https://i.pinimg.com/736x/73/a8/29/73a82940ff71894520fb8cad49343022.jpg",
    ],
    size: ["S", "M", "L", "XL"],
    discount: 20,
    createdAt: "2025-11-01T15:20:00Z",
    updatedAt: "2025-12-10T20:00:00Z",
  },
  {
    _id: "prod_006",
    title: "Corpiño Push Up Satén",
    description:
      "Corpiño push up con copas de satén y relleno removible. Efecto realce natural con aro flexible que se adapta a tu cuerpo. Tirantes anchos acolchados para mayor soporte y comodidad durante todo el día.",
    price: 14200,
    category: "corpiños",
    stock: 30,
    status: true,
    thumbnails: [
      "https://i.pinimg.com/736x/23/89/17/23891771d7bc833b00661c6e89868500.jpg",
    ],
    size: ["85A", "85B", "90B", "90C", "95B", "95C"],
    discount: 0,
    createdAt: "2025-06-12T11:45:00Z",
    updatedAt: "2025-09-28T16:00:00Z",
  },
  {
    _id: "prod_007",
    title: "Bombacha Tiro Alto Encaje",
    description:
      "Bombacha de tiro alto con panel frontal de encaje transparente y forro de algodón. Diseño retro-chic que estiliza la silueta. Elásticos suaves que no marcan la piel para un ajuste cómodo y seguro.",
    price: 5900,
    category: "bombachas",
    stock: 40,
    status: true,
    thumbnails: [
      "https://i.pinimg.com/736x/5e/9a/f2/5e9af2827721dd866f7daa46017e7d56.jpg",
    ],
    size: ["S", "M", "L", "XL", "XXL"],
    discount: 0,
    createdAt: "2025-05-22T14:30:00Z",
    updatedAt: "2025-08-15T10:00:00Z",
  },
  {
    _id: "prod_008",
    title: "Conjunto Algodón Daily",
    description:
      "Conjunto básico de algodón peinado con corpiño deportivo sin aro y bombacha bikini. Ideal para el uso diario, combina comodidad total con un diseño minimalista y moderno. Tela antibacteriana y de secado rápido.",
    price: 11500,
    category: "conjuntos",
    stock: 35,
    status: true,
    thumbnails: [
      "https://i.pinimg.com/736x/3c/2b/cb/3c2bcbb85f0050b746679ab2477f78ff.jpg",
    ],
    size: ["S", "M", "L", "XL"],
    discount: 5,
    createdAt: "2025-04-18T07:00:00Z",
    updatedAt: "2025-07-10T13:15:00Z",
  },
  {
    _id: "prod_009",
    title: "Body Mesh Transparente",
    description:
      "Body de mesh transparente con aplicaciones de encaje estratégicamente ubicadas. Cuello alto y mangas largas para un estilo audaz y sofisticado. Cierre de presión inferior. Ideal como pieza de lencería de lujo.",
    price: 25000,
    category: "bodys",
    stock: 8,
    status: true,
    thumbnails: [
      "https://i.pinimg.com/736x/2d/e6/c1/2de6c16e8ed0cfeac91b7ad7d32e8e47.jpg",
    ],
    size: ["S", "M", "L"],
    discount: 0,
    createdAt: "2025-03-02T16:40:00Z",
    updatedAt: "2025-06-05T22:00:00Z",
  },
  {
    _id: "prod_010",
    title: "Pijama Camisón Largo",
    description:
      "Camisón largo de satén con tirantes finos regulables y escote recto con detalle de encaje. Caída fluida que acompaña el cuerpo con elegancia. Perfecto para las noches frescas de otoño e invierno.",
    price: 17500,
    category: "pijamas",
    stock: 18,
    status: true,
    thumbnails: [
      "https://i.pinimg.com/736x/54/a7/51/54a751edcdb97d364db6a3f9eab2829d.jpg",
    ],
    size: ["S", "M", "L", "XL"],
    discount: 10,
    createdAt: "2025-02-14T10:10:00Z",
    updatedAt: "2025-05-20T08:30:00Z",
  },
  {
    _id: "prod_011",
    title: "Corpiño Deportivo Sin Costura",
    description:
      "Corpiño deportivo sin costuras de alta compresión. Ideal para actividades de impacto medio. Banda inferior ancha para mayor soporte. Tela tecnológica que absorbe la humedad y mantiene la frescura.",
    price: 9800,
    category: "corpiños",
    stock: 45,
    status: true,
    thumbnails: [
      "https://i.pinimg.com/1200x/5f/97/53/5f975336bec4fe297d21ec97a88da7a8.jpg",
    ],
    size: ["S", "M", "L", "XL"],
    discount: 0,
    createdAt: "2025-01-08T13:00:00Z",
    updatedAt: "2025-04-12T17:45:00Z",
  },
  {
    _id: "prod_012",
    title: "Bombacha Colaless Encaje",
    description:
      "Bombacha colaless confeccionada íntegramente en encaje francés. Cintura baja con elástico ultrafino invisible bajo la ropa. Diseño sensual y cómodo para ocasiones especiales o uso diario debajo de prendas ajustadas.",
    price: 4200,
    category: "bombachas",
    stock: 0,
    status: false,
    thumbnails: [
      "https://i.pinimg.com/736x/1f/76/4e/1f764e4501700434845825402861f102.jpg",
    ],
    size: ["S", "M", "L"],
    discount: 0,
    createdAt: "2024-12-01T09:30:00Z",
    updatedAt: "2025-03-05T12:00:00Z",
  },
]

// ========================== Órdenes ==========================

export interface MockOrder {
  _id: string
  orderNumber: string
  items: Array<{
    productId: string
    title: string
    price: number
    quantity: number
    size?: string
    color?: string
    image?: string
  }>
  shippingInfo: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode?: string
    notes?: string
  }
  paymentMethod: "cash" | "transfer"
  subtotal: number
  shippingCost: number
  total: number
  status:
    | "pending_manual"
    | "pending_transfer_proof"
    | "pending_transfer_confirmation"
    | "paid"
    | "cancelled"
    | "refunded"
  notes?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
  paidAt?: string
  transferProofUrl?: string
}

export const mockOrders: MockOrder[] = [
  {
    _id: "ord_001",
    orderNumber: "JL-2025-0001",
    items: [
      {
        productId: "prod_003",
        title: "Conjunto Satén Romántico",
        price: 16065,
        quantity: 1,
        size: "M",
        color: "Negro",
        image: "https://i.pinimg.com/736x/9e/f0/b7/9ef0b7baff3fd21dd3a85e6b5fb27995.jpg",
      },
      {
        productId: "prod_002",
        title: "Bombacha Microfibra Clásica",
        price: 4320,
        quantity: 2,
        size: "S",
        color: "Negro",
        image: "https://i.pinimg.com/736x/12/66/28/126628974ebc5613b10c7848e6315330.jpg",
      },
    ],
    shippingInfo: {
      fullName: "María García",
      email: "maria.garcia@email.com",
      phone: "5491145678901",
      address: "Av. Corrientes 1234, Piso 5",
      city: "Buenos Aires",
      postalCode: "C1043",
      notes: "Tocar timbre 5B",
    },
    paymentMethod: "transfer",
    subtotal: 24705,
    shippingCost: 1500,
    total: 26205,
    status: "paid",
    createdAt: "2025-12-15T14:30:00Z",
    updatedAt: "2025-12-16T09:00:00Z",
    paidAt: "2025-12-16T09:00:00Z",
  },
  {
    _id: "ord_002",
    orderNumber: "JL-2025-0002",
    items: [
      {
        productId: "prod_004",
        title: "Body Encaje Negro",
        price: 22500,
        quantity: 1,
        size: "S",
        color: "Negro",
        image: "https://i.pinimg.com/1200x/86/9e/dc/869edcf0a4bdc6204bcf401fdeac04c2.jp",
      },
    ],
    shippingInfo: {
      fullName: "Luciana Fernández",
      email: "luciana.f@email.com",
      phone: "5491198765432",
      address: "Calle San Martín 567",
      city: "Rosario",
      postalCode: "S2000",
    },
    paymentMethod: "cash",
    subtotal: 22500,
    shippingCost: 2000,
    total: 24500,
    status: "pending_manual",
    createdAt: "2025-12-18T11:15:00Z",
    updatedAt: "2025-12-18T11:15:00Z",
  },
  {
    _id: "ord_003",
    orderNumber: "JL-2025-0003",
    items: [
      {
        productId: "prod_005",
        title: "Pijama Seda Summer",
        price: 12640,
        quantity: 1,
        size: "L",
        color: "Rosa",
        image: "https://i.pinimg.com/1200x/ac/f9/6e/acf96e880e54d13fee6a70f0b22e40f1.jpg",
      },
      {
        productId: "prod_007",
        title: "Bombacha Tiro Alto Encaje",
        price: 5900,
        quantity: 3,
        size: "M",
        color: "Negro",
        image: "https://i.pinimg.com/736x/72/76/02/72760239cc39c9613868e90e6c2fc686.jpg",
      },
    ],
    shippingInfo: {
      fullName: "Carolina López",
      email: "caro.lopez@email.com",
      phone: "5491134567890",
      address: "Bv. Oroño 1890",
      city: "Córdoba",
      postalCode: "X5000",
      notes: "Entregar en horario de tarde",
    },
    paymentMethod: "transfer",
    subtotal: 30340,
    shippingCost: 1800,
    total: 32140,
    status: "pending_transfer_confirmation",
    createdAt: "2025-12-20T16:45:00Z",
    updatedAt: "2025-12-21T08:20:00Z",
    transferProofUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop",
  },
  {
    _id: "ord_004",
    orderNumber: "JL-2025-0004",
    items: [
      {
        productId: "prod_001",
        title: "Corpiño Encaje Floral",
        price: 12500,
        quantity: 2,
        size: "90B",
        color: "Blanco",
        image: "https://i.pinimg.com/1200x/2f/b8/10/2fb8102b36a6852db4c4dc2830a99d7d.jpg",
      },
    ],
    shippingInfo: {
      fullName: "Valentina Torres",
      email: "val.torres@email.com",
      phone: "5491156789012",
      address: "Av. Libertador 4500",
      city: "Buenos Aires",
      postalCode: "C1426",
    },
    paymentMethod: "transfer",
    subtotal: 25000,
    shippingCost: 0,
    total: 25000,
    status: "paid",
    adminNotes: "Cliente frecuente, envío gratis",
    createdAt: "2025-12-22T09:30:00Z",
    updatedAt: "2025-12-23T10:00:00Z",
    paidAt: "2025-12-23T10:00:00Z",
  },
  {
    _id: "ord_005",
    orderNumber: "JL-2025-0005",
    items: [
      {
        productId: "prod_009",
        title: "Body Mesh Transparente",
        price: 25000,
        quantity: 1,
        size: "M",
        color: "Negro",
        image: "https://i.pinimg.com/1200x/86/9e/dc/869edcf0a4bdc6204bcf401fdeac04c2.jpg",
      },
      {
        productId: "prod_010",
        title: "Pijama Camisón Largo",
        price: 15750,
        quantity: 1,
        size: "M",
        color: "Champagne",
        image: "https://i.pinimg.com/736x/ac/45/cb/ac45cb12d070e46e51be57ed76f72860.jpg",
      },
    ],
    shippingInfo: {
      fullName: "Sofía Martínez",
      email: "sofia.m@email.com",
      phone: "5491167890123",
      address: "Calle Mendoza 789",
      city: "Mendoza",
      postalCode: "M5500",
    },
    paymentMethod: "cash",
    subtotal: 40750,
    shippingCost: 2500,
    total: 43250,
    status: "cancelled",
    notes: "Cliente canceló por cambio de dirección",
    createdAt: "2025-12-25T12:00:00Z",
    updatedAt: "2025-12-26T15:30:00Z",
  },
]

// ========================== Contenido del Sitio ==========================

export const mockSiteContent = {
  hero: {
    mainDescription:
      "Descubrí nuestra colección de lencería diseñada para realzar tu belleza natural con comodidad y estilo.",
    slogan: "Elegancia que se siente",
    buttonText: "Ver Colección",
    buttonLink: "#products",
    heroImage: {
      url: "/hero.prentacion.jpeg",
      alt: "Joly Lingerie - Colección",
      filename: "hero.prentacion.jpeg",
    },
  },
  productCatalog: {
    mainTitle: "Nuestra Colección",
    subtitle:
      "Piezas seleccionadas con los mejores materiales para ofrecerte comodidad, calidad y un toque de sofisticación en cada momento.",
    categories: [
      { name: "corpiños", display_name: "Corpiños" },
      { name: "bombachas", display_name: "Bombachas" },
      { name: "conjuntos", display_name: "Conjuntos" },
      { name: "bodys", display_name: "Bodys" },
      { name: "pijamas", display_name: "Pijamas" },
    ],
  },
  whyChooseJoly: {
    mainTitle: "Nuestra Esencia",
    description:
      "En Joly creemos que la lencería es mucho más que una prenda interior. Es una extensión de tu personalidad, tu confianza y tu estilo.",
    values: [
      {
        icon: "Heart",
        title: "Diseño con Amor",
        description:
          "Cada pieza es creada pensando en vos, combinando tendencias actuales con comodidad inigualable.",
      },
      {
        icon: "Gem",
        title: "Calidad Premium",
        description:
          "Seleccionamos las mejores telas y materiales para garantizar durabilidad y suavidad en cada prenda.",
      },
      {
        icon: "ShieldCheck",
        title: "Compra Segura",
        description:
          "Tu tranquilidad es nuestra prioridad. Compra con confianza y seguridad en cada transacción.",
      },
      {
        icon: "Truck",
        title: "Envío Rápido",
        description:
          "Recibí tu pedido en la puerta de tu casa con envíos rápidos a todo el país.",
      },
      {
        icon: "Sparkles",
        title: "Tendencia",
        description:
          "Colecciones actualizadas con las últimas tendencias de moda en lencería internacional.",
      },
      {
        icon: "Award",
        title: "Satisfacción Garantizada",
        description:
          "Si no estás conforme, te ofrecemos cambio o devolución sin complicaciones.",
      },
    ],
  },
  contact: {
    mainTitle: "Contactanos",
    subtitle: "Estamos para ayudarte",
    description:
      "¿Tenés alguna consulta sobre talles, productos o tu pedido? No dudes en escribirnos. Te responderemos a la brevedad.",
    formTitle: "Envianos un mensaje",
    formDescription: "Completá el formulario y te responderemos dentro de las 24hs hábiles.",
    responseMessage: "¡Gracias por tu mensaje! Te responderemos pronto.",
    responseDisclaimer: "Tiempo de respuesta estimado: 24 horas hábiles.",
    contactInfo: [
      {
        icon: "MapPin",
        title: "Ubicación",
        details: ["Buenos Aires, Argentina"],
        description: "Atención online en todo el país",
      },
      {
        icon: "Phone",
        title: "Teléfono",
        details: ["+54 9 11 4567-8901"],
        description: "Lunes a viernes de 9 a 18hs",
      },
      {
        icon: "Mail",
        title: "Email",
        details: ["contacto@jolylingerie.com"],
        description: "Respondemos en 24hs hábiles",
      },
      {
        icon: "Clock",
        title: "Horario",
        details: ["Lunes a Viernes: 9:00 - 18:00", "Sábados: 10:00 - 14:00"],
        description: "Horario de atención al cliente",
      },
    ],
    socialMedia: [
      {
        icon: "Instagram",
        name: "Instagram",
        handle: "@jolylingerie",
        link: "https://instagram.com/jolylingerie",
      },
      {
        icon: "Facebook",
        name: "Facebook",
        handle: "Joly Lingerie",
        link: "https://facebook.com/jolylingerie",
      },
    ],
  },
  productDetail: {
    infoCards: [
      {
        icon: "Truck",
        title: "Envío Gratis",
        description: "En compras superiores a $30.000",
        enabled: true,
      },
      {
        icon: "RotateCcw",
        title: "30 Días",
        description: "Para cambios y devoluciones",
        enabled: true,
      },
      {
        icon: "Shield",
        title: "Garantía",
        description: "Calidad garantizada",
        enabled: true,
      },
    ],
    expandableSections: [
      {
        id: "description",
        title: "Descripción Detallada",
        content:
          "Confeccionado con los mejores materiales, este producto combina comodidad y elegancia. Pensado para el uso diario o para ocasiones especiales.",
        enabled: true,
      },
      {
        id: "care",
        title: "Cuidado y Lavado",
        content:
          "Lavar a mano con agua fría. No usar blanqueador. Secar al aire libre. No planchar directamente sobre encaje.",
        enabled: true,
      },
      {
        id: "materials",
        title: "Materiales",
        content:
          "Encaje: 90% Poliamida, 10% Elastano. Forro: 100% Algodón. Elásticos: Poliamida y Elastano.",
        enabled: true,
      },
    ],
    showSizeGuideButton: true,
    sizeGuideButtonText: "Guía de tallas",
  },
  sizeGuides: [
    {
      category: "corpiño",
      enabled: true,
      title: "Guía de Tallas - Corpiños",
      subtitle: "Medidas en centímetros",
      tableHeaders: ["Talla", "Contorno", "Copa"],
      tableRows: [
        { size: "85A", measurements: ["83-87", "A"] },
        { size: "85B", measurements: ["83-87", "B"] },
        { size: "90B", measurements: ["88-92", "B"] },
        { size: "85C", measurements: ["83-87", "C"] },
        { size: "90C", measurements: ["88-92", "C"] },
        { size: "95C", measurements: ["93-97", "C"] },
      ],
      notes: "Si estás entre dos tallas, te recomendamos elegir la más grande.",
    },
    {
      category: "bombacha",
      enabled: true,
      title: "Guía de Tallas - Bombachas",
      subtitle: "Medidas en centímetros",
      tableHeaders: ["Talla", "Cintura", "Cadera"],
      tableRows: [
        { size: "S", measurements: ["60-64", "86-90"] },
        { size: "M", measurements: ["65-69", "91-95"] },
        { size: "L", measurements: ["70-74", "96-100"] },
        { size: "XL", measurements: ["75-79", "101-105"] },
        { size: "XXL", measurements: ["80-84", "106-110"] },
      ],
      notes: "Las medidas son aproximadas y pueden variar según el modelo.",
    },
    {
      category: "conjuntos",
      enabled: true,
      title: "Guía de Tallas - Conjuntos",
      subtitle: "Consultar tallas de corpiño y bombacha por separado",
      tableHeaders: ["Talla", "Cintura", "Cadera"],
      tableRows: [
        { size: "S", measurements: ["60-64", "86-90"] },
        { size: "M", measurements: ["65-69", "91-95"] },
        { size: "L", measurements: ["70-74", "96-100"] },
        { size: "XL", measurements: ["75-79", "101-105"] },
      ],
      notes: "Para conjuntos, la talla se refiere a la parte inferior. Para el corpiño, consultar la guía de corpiños.",
    },
  ],
  checkout: {
    deliveryInfo: {
      title: "Información de Entrega",
      meetingPoint: {
        enabled: true,
        title: "Punto de Encuentro",
        description: "Nos encontramos en una ubicación céntrica para entregarte tu pedido.",
        address: "Plaza Italia, Buenos Aires",
        schedule: "Lunes a Viernes de 10:00 a 18:00",
        notes: "Coordinar horario previamente por WhatsApp.",
      },
    },
    paymentInfo: {
      title: "Métodos de Pago",
      bankTransfer: {
        enabled: true,
        title: "Transferencia Bancaria",
        bankName: "Banco Nación",
        accountType: "Caja de Ahorro",
        accountNumber: "000-123456/0",
        accountHolder: "Joly Lingerie S.R.L.",
        cbu: "0110012340001234567890",
        alias: "JOLY.LINGERIE",
        instructions: "Realizá la transferencia y envianos el comprobante por WhatsApp o adjuntalo en el checkout.",
      },
      cashOnDelivery: {
        enabled: true,
        title: "Pago en Efectivo",
        description: "Pagá en efectivo al momento de recibir tu pedido.",
        additionalFee: 0,
        notes: "El monto exacto es requerido.",
      },
    },
    shipping: {
      enabled: true,
      title: "Envíos",
      homeDelivery: {
        enabled: true,
        title: "Envío a Domicilio",
        description: "Recibí tu pedido en la comodidad de tu hogar.",
        baseCost: 2500,
        freeShippingThreshold: 30000,
        estimatedDays: "3-5 días hábiles",
        coverage: "Todo el país (Argentina)",
        notes: "Envío gratis en compras superiores a $30.000.",
      },
    },
  },
} as Record<string, any>

// ========================== Interacciones ==========================

export const mockInteractionsSummary = {
  totalInteractions: 1847,
  recentInteractions: [
    {
      type: "product_view",
      productTitle: "Conjunto Satén Romántico",
      productCategory: "conjuntos",
      createdAt: "2025-12-28T10:30:00Z",
    },
    {
      type: "product_view",
      productTitle: "Body Encaje Negro",
      productCategory: "bodys",
      createdAt: "2025-12-28T09:15:00Z",
    },
    {
      type: "category_view",
      category: "corpiños",
      createdAt: "2025-12-27T18:45:00Z",
    },
    {
      type: "product_view",
      productTitle: "Pijama Seda Summer",
      productCategory: "pijamas",
      createdAt: "2025-12-27T16:20:00Z",
    },
    {
      type: "product_view",
      productTitle: "Corpiño Push Up Satén",
      productCategory: "corpiños",
      createdAt: "2025-12-27T14:00:00Z",
    },
  ],
}

export const mockMostViewedProducts = [
  {
    _id: "prod_003",
    productTitle: "Conjunto Satén Romántico",
    productCategory: "conjuntos",
    count: 342,
  },
  {
    _id: "prod_004",
    productTitle: "Body Encaje Negro",
    productCategory: "bodys",
    count: 289,
  },
  {
    _id: "prod_001",
    productTitle: "Corpiño Encaje Floral",
    productCategory: "corpiños",
    count: 256,
  },
  {
    _id: "prod_005",
    productTitle: "Pijama Seda Summer",
    productCategory: "pijamas",
    count: 198,
  },
  {
    _id: "prod_009",
    productTitle: "Body Mesh Transparente",
    productCategory: "bodys",
    count: 176,
  },
  {
    _id: "prod_006",
    productTitle: "Corpiño Push Up Satén",
    productCategory: "corpiños",
    count: 154,
  },
  {
    _id: "prod_002",
    productTitle: "Bombacha Microfibra Clásica",
    productCategory: "bombachas",
    count: 143,
  },
  {
    _id: "prod_010",
    productTitle: "Pijama Camisón Largo",
    productCategory: "pijamas",
    count: 121,
  },
]

export const mockMostViewedCategories = [
  { category: "conjuntos", count: 523 },
  { category: "bodys", count: 465 },
  { category: "corpiños", count: 410 },
  { category: "pijamas", count: 319 },
  { category: "bombachas", count: 287 },
]
