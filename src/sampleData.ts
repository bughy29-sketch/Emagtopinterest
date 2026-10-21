import { ProductItem } from './types';

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-rowenta-xxl',
    title: 'Aspirator fara sac Rowenta Compact Power XXL 550W',
    category: 'Electrocasnice & Curățenie',
    imageUrl: 'https://s13emagst.akamaized.net/products/32812/32811451/images/res_6df4598440530ed5845c22ee3a6cb6e7.jpg',
    linkAfiliat: 'https://l.profitshare.ro/l/16706445',
    price: '389.99 Lei',
    status: 'draft',
    generatedPin: {
      title: 'Aspirator fără sac Rowenta Compact Power XXL 550W - Putere Maximă',
      description: 'Curățenie impecabilă fără efort! Aspiratorul fără sac Rowenta Compact Power XXL oferă o capacitate generoasă de colectare și filtrare avansată pentru praful fin. Ideal pentru orice locuință cu animale sau covoare groase. Apasă pentru detalii și preț pe eMAG! #electrocasnice #curatenie #emag #rowenta #aspirator',
      generatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  },
  {
    id: 'prod-roborock-s8',
    title: 'Robot de aspirare Roborock S8, 6000Pa, Reactive 3D',
    category: 'Electrocasnice & Curățenie',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    linkAfiliat: 'https://l.profitshare.ro/l/roborock-s8-emag',
    price: '2.499 Lei',
    status: 'ready',
    generatedPin: {
      title: 'Robot Aspirator Roborock S8 6000Pa cu Evitare Obstacole 3D',
      description: 'Uită definitiv de aspirat! Roborock S8 curăță și spală podelele cu o putere extremă de 6000Pa și navigare inteligentă 3D. Control complet din aplicație pentru un cămin mereu curat. Apasă pentru detalii și preț pe eMAG! #roborock #smarthome #curatenieinteligenta #emag #aspiratorrobot',
      generatedAt: new Date(Date.now() - 7200000).toISOString(),
    },
  },
  {
    id: 'prod-airfryer-philips',
    title: 'Friteuza cu aer cald Philips Airfryer XXL Smart Sensing 1.4kg',
    category: 'Electrocasnice & Bucătărie',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    linkAfiliat: 'https://l.profitshare.ro/l/philips-airfryer-xxl',
    price: '1.149 Lei',
    status: 'draft',
  },
  {
    id: 'prod-smartwatch-garmin',
    title: 'Ceas Smartwatch Garmin Venu 3 Amoled 45mm GPS Slate',
    category: 'Telefoane & Gadgeturi',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    linkAfiliat: 'https://l.profitshare.ro/l/garmin-venu-3',
    price: '1.999 Lei',
    status: 'draft',
  },
];
