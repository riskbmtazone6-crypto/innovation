import { ChecklistItemTemplate, InspectionGroupSet, InspectionRecord, InspectorUser } from '../types';

export const INSPECTION_SETS_TEMPLATE: InspectionGroupSet[] = [
  {
    id: 'exterior',
    setNumber: 1,
    title: 'ชุดที่ 1: ภายนอกตัวรถและระบบไฟส่องสว่าง',
    titleEn: 'Set 1: Exterior & Lighting System',
    icon: 'directions_bus',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    photoGuide: 'ถ่ายภาพรวมภายนอกตัวรถ 1 ภาพ (ด้านหน้าหรือมุมเฉียงตัวรถ) เพื่อยืนยันการตรวจสภาพภายนอก',
    sampleImageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=700&auto=format&fit=crop&q=80',
    items: [
      {
        id: 'body',
        order: 1,
        label: 'สภาพตัวถังภายนอกและกระจกบังลม',
        labelEn: 'Body & Windshield Condition',
        icon: 'directions_car',
        category: 'exterior',
        description: 'ตรวจรอยบุบ รอยชน สีตัวถัง ป้ายทะเบียน และกระจกบังลมหน้า-หลัง ไม่แตกร้าว',
        status: null,
        notes: ''
      },
      {
        id: 'headlights',
        order: 2,
        label: 'ไฟหน้าและไฟหรี่',
        labelEn: 'Headlights & Parking Lights',
        icon: 'lightbulb',
        category: 'lighting',
        description: 'ตรวจไฟสูง ไฟต่ำ ไฟหรี่ และโคมไฟหน้าทั้งสองข้าง สะอาด สว่างสมบูรณ์',
        status: null,
        notes: ''
      },
      {
        id: 'taillights',
        order: 3,
        label: 'ไฟท้ายและไฟเบรก',
        labelEn: 'Tail & Brake Lights',
        icon: 'highlight',
        category: 'lighting',
        description: 'ตรวจไฟท้าย ไฟเบรก ไฟถอยหลัง และไฟส่องป้ายทะเบียน ติดสว่างครบทุกดวง',
        status: null,
        notes: ''
      },
      {
        id: 'turnsignals',
        order: 4,
        label: 'ไฟเลี้ยวและไฟฉุกเฉิน',
        labelEn: 'Turn Signals & Hazard Lights',
        icon: 'compare_arrows',
        category: 'lighting',
        description: 'ตรวจไฟเลี้ยว ซ้าย-ขวา ด้านหน้า ด้านข้าง ด้านหลัง และระบบไฟฉุกเฉิน',
        status: null,
        notes: ''
      },
      {
        id: 'mirrors',
        order: 5,
        label: 'กระจกมองข้างและกระจกมองหลัง',
        labelEn: 'Side & Rearview Mirrors',
        icon: 'visibility',
        category: 'exterior',
        description: 'ตรวจกระจกมองข้างซ้าย-ขวา กระจกมองหลัง ปรับระดับมองชัดเจน ไม่แตกร้าว',
        status: null,
        notes: ''
      },
      {
        id: 'tires',
        order: 6,
        label: 'สภาพยางรถยนต์และกระทะล้อ',
        labelEn: 'Tires & Wheel Rims',
        icon: 'tire_repair',
        category: 'mechanical',
        description: 'ตรวจร่องดอกยาง แรงดันลมยาง น็อตล้อขันแน่นครบทุกตัว ไม่บวมไม่ฉีกขาด',
        status: null,
        notes: ''
      }
    ]
  },
  {
    id: 'interior',
    setNumber: 2,
    title: 'ชุดที่ 2: ภายในห้องโดยสารและอุปกรณ์ความปลอดภัย',
    titleEn: 'Set 2: Interior & Passenger Safety',
    icon: 'airline_seat_recline_extra',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    photoGuide: 'ถ่ายภาพรวมภายในห้องโดยสาร 1 ภาพ (ทางเดิน เบาะโดยสาร หรือคอนโซล) เพื่อยืนยันความพร้อม',
    sampleImageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=700&auto=format&fit=crop&q=80',
    items: [
      {
        id: 'doors',
        order: 7,
        label: 'ประตูขึ้น-ลงและบันไดโดยสาร',
        labelEn: 'Passenger Doors & Steps',
        icon: 'sensor_door',
        category: 'safety',
        description: 'ตรวจระบบเปิด-ปิดประตูอัตโนมัติ วาล์วลมฉุกเฉิน และยางขอบประตู',
        status: null,
        notes: ''
      },
      {
        id: 'cctv',
        order: 8,
        label: 'กล้องวงจรปิด CCTV และระบบ GPS/จอแสดงผล',
        labelEn: 'CCTV, GPS & Driver Display',
        icon: 'videocam',
        category: 'safety',
        description: 'ตรวจการทำงานของกล้อง CCTV ทุกมุมมอง จอแสดงผลห้องคนขับ และสัญญาณ GPS',
        status: null,
        notes: ''
      },
      {
        id: 'ac',
        order: 9,
        label: 'ระบบปรับอากาศและช่องระบายลม',
        labelEn: 'Air Conditioning System',
        icon: 'ac_unit',
        category: 'interior',
        description: 'ตรวจความเย็น พัดลมแอร์ ช่องจ่ายลมแอร์ทุกจุด ไม่มีน้ำหยด และไม่มีกลิ่นผิดปกติ',
        status: null,
        notes: ''
      },
      {
        id: 'windows',
        order: 10,
        label: 'กระจกหน้าต่างและค้อนทุบกระจก',
        labelEn: 'Windows & Safety Hammers',
        icon: 'grid_view',
        category: 'interior',
        description: 'ตรวจบานหน้าต่าง ตัวล็อคแน่นหนา และค้อนทุบกระจกฉุกเฉินติดตั้งครบตามตำแหน่ง',
        status: null,
        notes: ''
      },
      {
        id: 'emergency',
        order: 11,
        label: 'อุปกรณ์ความปลอดภัยและถังดับเพลิง',
        labelEn: 'Emergency Equipment & Fire Extinguisher',
        icon: 'medical_services',
        category: 'safety',
        description: 'ตรวจเกจวัดแรงดันถังดับเพลิงในแถบเขียว สลักล็อคไม่หลุด และชุดปฐมพยาบาล',
        status: null,
        notes: ''
      }
    ]
  },
  {
    id: 'engine',
    setNumber: 3,
    title: 'ชุดที่ 3: ระบบเครื่องยนต์และระบบกลไกความปลอดภัย',
    titleEn: 'Set 3: Engine Bay & Mechanical System',
    icon: 'engineering',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    photoGuide: 'ถ่ายภาพห้องเครื่องยนต์ 1 ภาพ (ห้องเครื่องยนต์ด้านหลัง/ด้านหน้า) เพื่อยืนยันการตรวจ',
    sampleImageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=700&auto=format&fit=crop&q=80',
    items: [
      {
        id: 'engine_bay',
        order: 12,
        label: 'สภาพห้องเครื่องยนต์และการรั่วซึม',
        labelEn: 'Engine Bay & Fluid Leaks',
        icon: 'build',
        category: 'engine',
        description: 'ตรวจสภาพทั่วไปในห้องเครื่อง ท่อยาง สายไฟ ไม่มีรอยน้ำมันเครื่อง/น้ำหล่อเย็นรั่วซึม',
        status: null,
        notes: ''
      },
      {
        id: 'brakes',
        order: 13,
        label: 'ระบบเบรกและแรงดันลมเบรก',
        labelEn: 'Brakes & Air Pressure',
        icon: 'speed',
        category: 'mechanical',
        description: 'ตรวจแรงดันลมเบรก แป้นเบรกตอบสนองดี เบรกมือทำงานปกติ และไม่มีเสียงลมรั่ว',
        status: null,
        notes: ''
      },
      {
        id: 'fluids',
        order: 14,
        label: 'ระดับน้ำมันหล่อลื่นและน้ำยาหล่อเย็น',
        labelEn: 'Engine Oil & Coolant Levels',
        icon: 'water_drop',
        category: 'engine',
        description: 'ตรวจก้านวัดระดับน้ำมันเครื่อง น้ำมันเพาเวอร์ และระดับน้ำยาในถังพักหม้อน้ำ',
        status: null,
        notes: ''
      },
      {
        id: 'smoke_noise',
        order: 15,
        label: 'ควันดำ กลิ่นผิดปกติ และเสียงการทำงานเครื่องยนต์',
        labelEn: 'Exhaust Smoke & Engine Sound',
        icon: 'air',
        category: 'engine',
        description: 'ตรวจสตาร์ทเครื่องยนต์เดินเรียบ ไม่มีเสียงกระแทก ควันไอเสียไม่ดำ และไม่มีกลิ่นไหม้',
        status: null,
        notes: ''
      }
    ]
  }
];

export const CHECKLIST_TEMPLATES: ChecklistItemTemplate[] = [
  {
    id: 'body',
    order: 1,
    label: 'สภาพตัวถังภายนอก',
    labelEn: 'Body Condition',
    icon: 'directions_car',
    category: 'exterior',
    description: 'ตรวจรอยบุบ รอยชน สีตัวถัง ป้ายทะเบียน และกระจกบังลมหน้า'
  },
  {
    id: 'headlights',
    order: 2,
    label: 'ไฟหน้า',
    labelEn: 'Headlights',
    icon: 'lightbulb',
    category: 'lighting',
    description: 'ตรวจไฟสูง ไฟต่ำ ไฟหรี่ และโคมไฟหน้าทั้งสองข้าง'
  },
  {
    id: 'taillights',
    order: 3,
    label: 'ไฟท้าย',
    labelEn: 'Tail lights',
    icon: 'highlight',
    category: 'lighting',
    description: 'ตรวจไฟท้าย ไฟเบรก ไฟถอยหลัง และไฟส่องป้ายทะเบียน'
  },
  {
    id: 'turnsignals',
    order: 4,
    label: 'ไฟเลี้ยว',
    labelEn: 'Turn signals',
    icon: 'compare_arrows',
    category: 'lighting',
    description: 'ตรวจไฟเลี้ยว ซ้าย-ขวา ด้านหน้า ด้านข้าง และด้านหลัง'
  },
  {
    id: 'mirrors',
    order: 5,
    label: 'กระจกมองข้าง/มองหลัง',
    labelEn: 'Mirrors',
    icon: 'visibility',
    category: 'exterior',
    description: 'ตรวจกระจกมองข้างซ้าย-ขวา กระจกมองหลัง และมุมมองของผู้ขับขี่'
  },
  {
    id: 'tires',
    order: 6,
    label: 'สภาพยาง',
    labelEn: 'Tires',
    icon: 'tire_repair',
    category: 'mechanical',
    description: 'ตรวจดอกยาง แรงดันลมยาง น็อตล้อ และความสึกหรอ'
  },
  {
    id: 'doors',
    order: 7,
    label: 'ประตูขึ้น-ลง',
    labelEn: 'Doors',
    icon: 'sensor_door',
    category: 'safety',
    description: 'ตรวจระบบเปิด-ปิดประตูอัตโนมัติ วาล์วลมฉุกเฉิน และยางขอบประตู'
  },
  {
    id: 'cctv',
    order: 8,
    label: 'กล้องวงจรปิด',
    labelEn: 'CCTV',
    icon: 'videocam',
    category: 'safety',
    description: 'ตรวจการทำงานของกล้อง CCTV ภายใน-ภายนอกรถ และจอแสดงผล'
  },
  {
    id: 'ac',
    order: 9,
    label: 'ระบบปรับอากาศ',
    labelEn: 'AC',
    icon: 'ac_unit',
    category: 'interior',
    description: 'ตรวจความเย็น พัดลมแอร์ ช่องระบายอากาศ และไม่มีกลิ่นผิดปกติ'
  },
  {
    id: 'windows',
    order: 10,
    label: 'กระจกหน้าต่าง',
    labelEn: 'Windows',
    icon: 'grid_view',
    category: 'interior',
    description: 'ตรวจบานหน้าต่าง ล็อคหน้าต่าง และค้อนทุบกระจกฉุกเฉิน'
  },
  {
    id: 'emergency',
    order: 11,
    label: 'อุปกรณ์ฉุกเฉิน',
    labelEn: 'Emergency eq.',
    icon: 'medical_services',
    category: 'safety',
    description: 'ตรวจถังดับเพลิง ชุดปฐมพยาบาล ทางออกฉุกเฉิน และป้ายเตือน'
  },
  {
    id: 'engine_bay',
    order: 12,
    label: 'สภาพห้องเครื่องยนต์',
    labelEn: 'Engine Bay',
    icon: 'build',
    category: 'engine',
    description: 'ตรวจสภาพทั่วไปในห้องเครื่อง ไม่มีการรั่วซึม'
  },
  {
    id: 'brakes',
    order: 13,
    label: 'ระบบเบรก',
    labelEn: 'Brakes',
    icon: 'speed',
    category: 'mechanical',
    description: 'ตรวจการตอบสนองของแป้นเบรก เบรกลม เบรกมือ และไม่มีลมรั่ว'
  },
  {
    id: 'fluids',
    order: 14,
    label: 'ระดับน้ำมันหล่อลื่น/น้ำยาหม้อน้ำ',
    labelEn: 'Fluids & Coolant',
    icon: 'water_drop',
    category: 'engine',
    description: 'ตรวจระดับน้ำมันเครื่องและน้ำหล่อเย็น'
  },
  {
    id: 'smoke_noise',
    order: 15,
    label: 'ควันดำและเสียงเครื่องยนต์',
    labelEn: 'Smoke & Noise',
    icon: 'air',
    category: 'engine',
    description: 'ตรวจควันไอเสียและเสียงการทำงานเครื่องยนต์'
  }
];


export const OPERATION_GROUPS = [
  { id: '6-1', name: 'กลุ่มงานปฏิบัติการเดินรถที่ 1 (กปด.16)', depot: 'อู่เมกาบางนา / ปากน้ำ' },
  { id: '6-2', name: 'กลุ่มงานปฏิบัติการเดินรถที่ 2 (กปด.26)', depot: 'อู่แพรกษา / คลองเตย' },
  { id: '6-3', name: 'กลุ่มงานปฏิบัติการเดินรถที่ 3 (กปด.36)', depot: 'อู่ฟาร์มจระเข้ / สายใต้ใหม่' }
];

export const POPULAR_ROUTES = [
  { route: '511', name: 'สายใต้ใหม่ - ปากน้ำ (ทางด่วน/ธรรมดา)', defaultBus: '3-50212' },
  { route: '145', name: 'อู่แพรกษาบ่อดิน - หมอชิต 2', defaultBus: '3-44012' },
  { route: '137', name: 'วงกลมรามคำแหง - รัชดาภิเษก', defaultBus: '4-80091' },
  { route: '514', name: 'มีนบุรี - สีลม', defaultBus: '2-70144' },
  { route: '73', name: 'สะพานพุทธ - ห้วยขวาง', defaultBus: '8-55021' },
  { route: '508', name: 'ปากน้ำ - ท่าราชวรดิฐ', defaultBus: '3-45019' },
  { route: '25', name: 'อู่แพรกษา - ท่าช้าง', defaultBus: '3-40192' },
  { route: '102', name: 'ปากน้ำ - สาธุประดิษฐ์', defaultBus: '3-45088' },
  { route: '142', name: 'ปากน้ำ - อู่แสมดำ', defaultBus: '3-45100' }
];

export const DEFAULT_INSPECTOR: InspectorUser = {
  uid: 'inspector-default-01',
  name: 'สมชาย สายตรวจ',
  email: 'somchai.transit@bmta.go.th',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0OTsmQYswQ6bzj0gWFfCIePC4ERZzvTrSCaxTBE74xPzUyiTU3hFmFmmIUjgDABulPHpx4ZeX-EFjs7s41GtiIzFHJA_0yZboDT9SIwS8hKjMW0RGufD1g-LjSt9jAYNHkska4aOy2JwvrdgKapEwFKZaBgqw4JqflxWT5jPIOldgJM9rcFPyNnmFPx4H9-CTP3-sSJv-_r-kWCAN9f3KZecAqBK0Mcxfu5dLGx5qjZikZ7iZG7rvdg',
  role: 'inspector',
  badgeId: '10294',
  zone: 'เขตการเดินรถที่ 6'
};

export const SAMPLE_INSPECTORS: InspectorUser[] = [
  DEFAULT_INSPECTOR,
  {
    uid: 'inspector-02',
    name: 'วิชัย มั่งมี',
    email: 'wichai.m@bmta.go.th',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMKIzFS4kzqyRW-58FwNAzN_NRk0Sf6fB2RHB0GddfXhy4AYJ1LtjFR_LVVH_vuMRvMcZ7yYz4oBYDJlWho_j_mmmvYjH4QTR5DCX3iBixs1Gn1sHNFGIP-HRcVK6K21KQVmUMqXPZ2QvgULiTEfrLk0tHxMffAYEJ7MYoAdx6pT2U1OR9e_P3RJCHP-2iM9opST-2pKpdiY-49CvaJA4g11lFxCv_NZXcrqDeqrX3mzGySMfeU2qY6A',
    role: 'inspector',
    badgeId: '10352',
    zone: 'เขตการเดินรถที่ 6'
  },
  {
    uid: 'inspector-03',
    name: 'สุรศักดิ์ ใจดี (หัวหน้างาน)',
    email: 'surasak.supervisor@bmta.go.th',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVRVshQhCN53sMjKM8fv96sjSj5mWASJkRhEqfL5hPlKS0axm8P9xknwdyOYdPWVwrXeWnK--zege2N5hLwaWUTNYgSLbXaVYKNoXP5k3OyTR1n3uR4T1tSTpLnbVmcJwf0ZiPMsIbiabRP-2deLoDK5tUYviif5NDDizj8Ixlsg1AxJPpv_7kcQ0Bw7AosIlUrkJfCon225nD1Sm2sXGzdXINFq6fO_RmmYtIa35AS8dKCMEA2gAK9Q',
    role: 'supervisor',
    badgeId: '09811',
    zone: 'เขตการเดินรถที่ 6'
  }
];

export const SAMPLE_INSPECTION_RECORDS: InspectionRecord[] = [
  {
    id: 'rec-001',
    timestamp: Date.now() - 1000 * 60 * 15,
    dateStr: new Date(Date.now() - 1000 * 60 * 15).toLocaleDateString('th-TH'),
    timeStr: '08:15',
    inspectorName: 'สมชาย ส.',
    inspectorId: '10294',
    inspectorAvatar: DEFAULT_INSPECTOR.avatar,
    operationGroup: '6-3',
    operationGroupName: 'กลุ่มงานปฏิบัติการเดินรถที่ 3 (กปด.36)',
    busRoute: '145',
    busNumber: '3-44012',
    overallStatus: 'pass',
    passedCount: 12,
    failedCount: 0,
    totalCount: 12,
    issuesSummary: '-',
    items: CHECKLIST_TEMPLATES.map((t) => ({
      ...t,
      status: 'pass',
      notes: ''
    }))
  },
  {
    id: 'rec-002',
    timestamp: Date.now() - 1000 * 60 * 35,
    dateStr: new Date(Date.now() - 1000 * 60 * 35).toLocaleDateString('th-TH'),
    timeStr: '08:02',
    inspectorName: 'สมชาย ส.',
    inspectorId: '10294',
    inspectorAvatar: DEFAULT_INSPECTOR.avatar,
    operationGroup: '6-2',
    operationGroupName: 'กลุ่มงานปฏิบัติการเดินรถที่ 2 (กปด.26)',
    busRoute: '137',
    busNumber: '4-80091',
    overallStatus: 'fail',
    passedCount: 11,
    failedCount: 1,
    totalCount: 12,
    issuesSummary: 'ไฟท้ายขวาดับ',
    items: CHECKLIST_TEMPLATES.map((t) => ({
      ...t,
      status: t.id === 'taillights' ? 'fail' : 'pass',
      notes: t.id === 'taillights' ? 'หลอดไฟท้ายข้างขวาไม่ติด ต้องเปลี่ยนหลอดใหม่' : ''
    }))
  },
  {
    id: 'rec-003',
    timestamp: Date.now() - 1000 * 60 * 55,
    dateStr: new Date(Date.now() - 1000 * 60 * 55).toLocaleDateString('th-TH'),
    timeStr: '07:55',
    inspectorName: 'วิชัย ม.',
    inspectorId: '10352',
    inspectorAvatar: SAMPLE_INSPECTORS[1].avatar,
    operationGroup: '6-1',
    operationGroupName: 'กลุ่มงานปฏิบัติการเดินรถที่ 1 (กปด.16)',
    busRoute: '514',
    busNumber: '2-70144',
    overallStatus: 'pass',
    passedCount: 12,
    failedCount: 0,
    totalCount: 12,
    issuesSummary: '-',
    items: CHECKLIST_TEMPLATES.map((t) => ({
      ...t,
      status: 'pass',
      notes: ''
    }))
  },
  {
    id: 'rec-004',
    timestamp: Date.now() - 1000 * 60 * 80,
    dateStr: new Date(Date.now() - 1000 * 60 * 80).toLocaleDateString('th-TH'),
    timeStr: '07:40',
    inspectorName: 'สมชาย ส.',
    inspectorId: '10294',
    inspectorAvatar: DEFAULT_INSPECTOR.avatar,
    operationGroup: '6-3',
    operationGroupName: 'กลุ่มงานปฏิบัติการเดินรถที่ 3 (กปด.36)',
    busRoute: '73',
    busNumber: '8-55021',
    overallStatus: 'pending',
    passedCount: 11,
    failedCount: 1,
    totalCount: 12,
    issuesSummary: 'รอยขีดข่วนตัวถัง (รอประเมิน)',
    items: CHECKLIST_TEMPLATES.map((t) => ({
      ...t,
      status: t.id === 'body' ? 'fail' : 'pass',
      notes: t.id === 'body' ? 'รอยขีดข่วนตัวถังด้านซ้ายยาว 30cm รอนายช่างประเมิน' : ''
    }))
  },
  {
    id: 'rec-005',
    timestamp: Date.now() - 1000 * 60 * 120,
    dateStr: new Date(Date.now() - 1000 * 60 * 120).toLocaleDateString('th-TH'),
    timeStr: '07:15',
    inspectorName: 'สมชาย ส.',
    inspectorId: '10294',
    inspectorAvatar: DEFAULT_INSPECTOR.avatar,
    operationGroup: '6-3',
    operationGroupName: 'กลุ่มงานปฏิบัติการเดินรถที่ 3 (กปด.36)',
    busRoute: '511',
    busNumber: '3-50212',
    overallStatus: 'pass',
    passedCount: 12,
    failedCount: 0,
    totalCount: 12,
    issuesSummary: '-',
    items: CHECKLIST_TEMPLATES.map((t) => ({
      ...t,
      status: 'pass',
      notes: ''
    }))
  }
];
