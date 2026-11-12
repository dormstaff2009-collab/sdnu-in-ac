/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Incident, IncidentStatus, MasterConfigData } from '../types';

export const DEFAULT_CATEGORIES = [
  'ระบบไฟฟ้า',
  'ระบบน้ำ',
  'ภัยธรรมชาติ',
  'พบสัตว์เข้าอาคาร',
  'ภัยคุกคาม',
  'เจ็บป่วยฉุกเฉิน',
  'โจรกรรม',
  'ทรัพย์สินเสียหาย/สูญหาย',
];

export const DEFAULT_LOCATIONS = [
  'มน.นิเวศ 1',
  'มน.นิเวศ 2',
  'มน.นิเวศ 3',
  'มน.นิเวศ 4',
  'มน.นิเวศ 5',
  'มน.นิเวศ 6',
  'มน.นิเวศ 7',
  'มน.นิเวศ 8',
  'มน.นิเวศ 9',
  'มน.นิเวศ 10',
  'มน.นิเวศ 11',
  'มน.นิเวศ 12',
  'มน.นิเวศ 14',
  'มน.นิเวศ 15',
];

export const DEFAULT_VICTIM_TYPES = [
  'ผู้พักอาศัย',
  'ผู้พักอาศัยร่วม',
  'เจ้าหน้าที่ปฏิบัติงาน',
  'บุคลากรภายนอก/ผู้มาติดต่อ',
  'อื่นๆ',
];

export const DEFAULT_ROLES = [
  'ผู้จัดการ',
  'รปภ.ประจำจุด',
  'ผู้ประสานงาน',
  'หัวหน้างาน',
];

const INCIDENTS_COLLECTION = 'incidents';
const MASTER_DATA_COLLECTION = 'master_data';

/**
 * Subscribe to real-time incident reports
 */
export function subscribeToIncidents(
  onData: (incidents: Incident[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(db, INCIDENTS_COLLECTION),
    orderBy('incidentDate', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Incident[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          incidentDate: data.incidentDate || '',
          incidentTime: data.incidentTime || '',
          reportDay: Number(data.reportDay) || 1,
          reportMonth: Number(data.reportMonth) || 1,
          reportYear: Number(data.reportYear) || new Date().getFullYear(),
          category: data.category || 'อื่นๆ',
          location: data.location || 'มน.นิเวศ 1',
          locationDetail: data.locationDetail || '',
          victimType: data.victimType || 'ผู้พักอาศัย',
          victimName: data.victimName || '',
          description: data.description || '',
          actionTaken: data.actionTaken || '',
          photos: Array.isArray(data.photos) ? data.photos.slice(0, 3) : [],
          reporterRole: data.reporterRole || 'รปภ.ประจำจุด',
          reporterName: data.reporterName || '',
          reporterPhone: data.reporterPhone || '',
          status: data.status || 'received',
          severity: data.severity || 'medium',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      onData(list);
    },
    (err) => {
      console.error('Subscription error in incidents:', err);
      try {
        handleFirestoreError(err, OperationType.LIST, INCIDENTS_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

/**
 * Subscribe to Master Data Lookups
 */
export function subscribeToMasterData(
  onData: (data: MasterConfigData) => void
) {
  return onSnapshot(
    collection(db, MASTER_DATA_COLLECTION),
    (snapshot) => {
      const config: MasterConfigData = {
        categories: [...DEFAULT_CATEGORIES],
        victimTypes: [...DEFAULT_VICTIM_TYPES],
        locations: [...DEFAULT_LOCATIONS],
        reporterRoles: [...DEFAULT_ROLES],
      };

      snapshot.forEach((docSnap) => {
        const id = docSnap.id;
        const items = docSnap.data()?.items;
        if (Array.isArray(items)) {
          if (id === 'categories') config.categories = items;
          if (id === 'victim_types') config.victimTypes = items;
          if (id === 'locations') config.locations = items;
          if (id === 'roles') config.reporterRoles = items;
        }
      });

      onData(config);
    },
    (err) => {
      console.warn('Master data subscribe warning:', err);
    }
  );
}

/**
 * Add a new category to Firestore master data
 */
export async function addCustomCategory(newCategory: string, currentCategories: string[]): Promise<void> {
  const trimmed = newCategory.trim();
  if (!trimmed || currentCategories.includes(trimmed)) return;

  const updated = [...currentCategories, trimmed];
  try {
    await setDoc(doc(db, MASTER_DATA_COLLECTION, 'categories'), {
      items: updated,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MASTER_DATA_COLLECTION}/categories`);
  }
}

/**
 * Add a new victim type to Firestore master data
 */
export async function addCustomVictimType(newType: string, currentTypes: string[]): Promise<void> {
  const trimmed = newType.trim();
  if (!trimmed || currentTypes.includes(trimmed)) return;

  const updated = [...currentTypes, trimmed];
  try {
    await setDoc(doc(db, MASTER_DATA_COLLECTION, 'victim_types'), {
      items: updated,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MASTER_DATA_COLLECTION}/victim_types`);
  }
}

/**
 * Create or save an incident
 */
export async function saveIncident(
  data: Omit<Incident, 'id' | 'reportDay' | 'reportMonth' | 'reportYear' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const incidentDateObj = new Date(data.incidentDate);
  const day = incidentDateObj.getDate() || 1;
  const month = incidentDateObj.getMonth() + 1 || 1; // 1-12
  const year = incidentDateObj.getFullYear() || new Date().getFullYear();

  const id = existingId || `INC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const payload = {
    incidentDate: data.incidentDate,
    incidentTime: data.incidentTime || '00:00',
    reportDay: day,
    reportMonth: month,
    reportYear: year,
    category: data.category,
    location: data.location,
    locationDetail: data.locationDetail || '',
    victimType: data.victimType,
    victimName: data.victimName || '',
    description: data.description,
    actionTaken: data.actionTaken,
    photos: (data.photos || []).slice(0, 3),
    reporterRole: data.reporterRole,
    reporterName: data.reporterName,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = doc(db, INCIDENTS_COLLECTION, id);
  try {
    await setDoc(docRef, payload, { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${INCIDENTS_COLLECTION}/${id}`);
  }
}

/**
 * Update incident status
 */
export async function updateIncidentStatus(id: string, status: IncidentStatus): Promise<void> {
  const docRef = doc(db, INCIDENTS_COLLECTION, id);
  try {
    await setDoc(docRef, { status, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${INCIDENTS_COLLECTION}/${id}`);
  }
}

/**
 * Delete incident
 */
export async function deleteIncident(id: string): Promise<void> {
  const docRef = doc(db, INCIDENTS_COLLECTION, id);
  try {
    await deleteDoc(docRef);
    // If user deletes any system-created sample incident, mark that user has managed samples
    if (id.startsWith('SDNU-')) {
      try {
        localStorage.setItem('sdnu_user_cleared_samples', 'true');
      } catch (_) {}
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${INCIDENTS_COLLECTION}/${id}`);
  }
}

/**
 * Clear all system-created demo incidents in one action
 */
export async function clearAllSampleIncidents(): Promise<number> {
  try {
    const snap = await getDocs(collection(db, INCIDENTS_COLLECTION));
    let deletedCount = 0;
    for (const d of snap.docs) {
      if (d.id.startsWith('SDNU-')) {
        await deleteDoc(doc(db, INCIDENTS_COLLECTION, d.id));
        deletedCount++;
      }
    }
    try {
      localStorage.setItem('sdnu_user_cleared_samples', 'true');
    } catch (_) {}
    return deletedCount;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, INCIDENTS_COLLECTION);
  }
}

/**
 * Seed realistic SDNU incident samples - ONLY when requested or explicitly permitted
 */
export async function seedInitialSDNUDataIfEmpty(force = false): Promise<boolean> {
  try {
    // Check if user has previously deleted/cleared sample data - NEVER re-seed unless forced
    try {
      const userCleared = localStorage.getItem('sdnu_user_cleared_samples');
      if (userCleared === 'true' && !force) {
        return false;
      }
    } catch (_) {}

    const snap = await getDocs(collection(db, INCIDENTS_COLLECTION));
    if (!snap.empty && !force) {
      return false; // Already has data
    }

    try {
      localStorage.removeItem('sdnu_user_cleared_samples');
    } catch (_) {}

    const currentYear = new Date().getFullYear();
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

    const sampleIncidents = [
      {
        id: `SDNU-${currentYear}-001`,
        incidentDate: `${currentYear}-${currentMonth}-08`,
        incidentTime: '19:45',
        reportDay: 8,
        reportMonth: Number(currentMonth),
        reportYear: currentYear,
        category: 'ระบบไฟฟ้า',
        location: 'มน.นิเวศ 4',
        locationDetail: 'ห้องพัก 308 ชั้น 3',
        victimType: 'ผู้พักอาศัย',
        victimName: 'ผศ.ดร. นเรศ อารีรักษ์',
        description: 'เกิดไฟฟ้าลัดวงจรที่เบรกเกอร์แอร์ภายในห้อง มีกลิ่นไหม้และมีประกายไฟเล็กน้อย ทำให้กระแสไฟฟ้าดับทั้งชั้น 3 ฝั่งทิศตะวันออก',
        actionTaken: 'รปภ. ประจำจุดเข้าตัดสะพานไฟหลักประจำชั้น 3 แจ้งผู้พักอาศัยให้ออกมายังพื้นที่ปลอดภัย และประสานทีมช่างเวรซ่อมบำรุง กองอาคารสถานที่ เข้าดำเนินการเปลี่ยนอุปกรณ์เบรกเกอร์ใหม่',
        photos: [],
        reporterRole: 'รปภ.ประจำจุด',
        reporterName: 'นายสมบัติ ใจดี',
        reporterPhone: '081-234-5678',
        status: 'resolved' as IncidentStatus,
        severity: 'high' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `SDNU-${currentYear}-002`,
        incidentDate: `${currentYear}-${currentMonth}-09`,
        incidentTime: '06:30',
        reportDay: 9,
        reportMonth: Number(currentMonth),
        reportYear: currentYear,
        category: 'พบสัตว์เข้าอาคาร',
        location: 'มน.นิเวศ 7',
        locationDetail: 'โถงทางเดินชั้น 1 ใกล้ตู้รับจดหมาย',
        victimType: 'ผู้พักอาศัยร่วม',
        victimName: 'คุณกาญจนา ศรีประเสริฐ',
        description: 'พบงูทางมะพร้าว ความยาวประมาณ 1.2 เมตร เลื้อยเข้ามาหลบอยู่ใต้ชั้นวางตู้จดหมายรวมของหอพัก',
        actionTaken: 'เจ้าหน้าที่ รปภ. กั้นพื้นที่ทางเดิน แจ้งเตือนผู้พักอาศัย และประสานเจ้าหน้าที่งานป้องกันและบรรเทาสาธารณภัย มหาวิทยาลัยนเรศวร เข้าจับงูนำไปปล่อยคืนสู่ธรรมชาติเรียบร้อย ไม่มีผู้ได้รับบาดเจ็บ',
        photos: [],
        reporterRole: 'รปภ.ประจำจุด',
        reporterName: 'นายประสิทธิ์ มั่นคง',
        reporterPhone: '089-876-5432',
        status: 'resolved' as IncidentStatus,
        severity: 'medium' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `SDNU-${currentYear}-003`,
        incidentDate: `${currentYear}-${currentMonth}-10`,
        incidentTime: '14:20',
        reportDay: 10,
        reportMonth: Number(currentMonth),
        reportYear: currentYear,
        category: 'ระบบน้ำ',
        location: 'มน.นิเวศ 2',
        locationDetail: 'ห้องน้ำรวมชั้น 2 และห้อง 204',
        victimType: 'ผู้พักอาศัย',
        victimName: 'อาจารย์พิชิต วงศ์คำ',
        description: 'ท่อส่งน้ำประปาเมนหลักแตก มีน้ำไหลทะลักเจิ่งนองบริเวณทางเดินและซึมเข้าห้องพัก 204',
        actionTaken: 'ปิดวาล์วน้ำหลักประจำอาคาร มน.นิเวศ 2 แจ้งทีมช่างประปาฉุกเฉินเข้าซ่อมท่อ และแม่บ้านช่วยทำความสะอาดสูบน้ำออกจากห้องพัก',
        photos: [],
        reporterRole: 'ผู้ประสานงาน',
        reporterName: 'นางสาวสุดารัตน์ ศิริพร',
        reporterPhone: '086-555-1212',
        status: 'in_progress' as IncidentStatus,
        severity: 'medium' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `SDNU-${currentYear}-004`,
        incidentDate: `${currentYear}-${currentMonth}-10`,
        incidentTime: '22:15',
        reportDay: 10,
        reportMonth: Number(currentMonth),
        reportYear: currentYear,
        category: 'เจ็บป่วยฉุกเฉิน',
        location: 'มน.นิเวศ 11',
        locationDetail: 'ห้อง 412',
        victimType: 'ผู้พักอาศัย',
        victimName: 'ดร.สมชาย รัตนไพศาล',
        description: 'ผู้พักอาศัยมีอาการแน่นหน้าอก หายใจไม่ออก มีประวัติโรคหัวใจ ญาติโทรแจ้งศูนย์วิทยุ รปภ.',
        actionTaken: 'รปภ. ประจำจุดรุดขึ้นไปยังห้องพัก นำถังออกซิเจนปฐมพยาบาลเบื้องต้น พร้อมกดเรียกรถพยาบาลฉุกเฉินศูนย์การแพทย์มหาวิทยาลัยนเรศวร (รพ.มน.) นำส่งห้องฉุกเฉินภายใน 8 นาที ผู้ป่วยพ้นขีดอันตราย',
        photos: [],
        reporterRole: 'หัวหน้างาน',
        reporterName: 'นายพงษ์ศักดิ์ ชูเกียรติ',
        reporterPhone: '081-999-8877',
        status: 'closed' as IncidentStatus,
        severity: 'critical' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `SDNU-${currentYear}-005`,
        incidentDate: `${currentYear}-${currentMonth}-11`,
        incidentTime: '02:40',
        reportDay: 11,
        reportMonth: Number(currentMonth),
        reportYear: currentYear,
        category: 'ภัยคุกคาม',
        location: 'มน.นิเวศ 8',
        locationDetail: 'ลานจอดรถจักรยานยนต์ด้านหลังอาคาร',
        victimType: 'ผู้พักอาศัย',
        victimName: 'คุณวรรณา บุญทวี',
        description: 'พบบุคคลภายนอกไม่สวมบัตรแสดงตน เดินวนเวียนและพยายามงัดเบาะรถจักรยานยนต์ในลานจอดรถ',
        actionTaken: 'รปภ. ประจำจุดเข้าตรวจสอบและควบคุมตัวไว้ได้ทันท่วงที ตรวจสอบพบเป็นบุคคลภายนอก จึงนำส่งเจ้าหน้าที่ตำรวจ สภ.เมืองพิษณุโลก เพื่อดำเนินคดีตามกฎหมาย',
        photos: [],
        reporterRole: 'ผู้จัดการ',
        reporterName: 'นายธีรภัทร เอกชัยวัฒน์',
        reporterPhone: '084-333-2211',
        status: 'resolved' as IncidentStatus,
        severity: 'high' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `SDNU-${currentYear}-006`,
        incidentDate: `${currentYear}-${currentMonth}-11`,
        incidentTime: '15:10',
        reportDay: 11,
        reportMonth: Number(currentMonth),
        reportYear: currentYear,
        category: 'ภัยธรรมชาติ',
        location: 'มน.นิเวศ 14',
        locationDetail: 'ด้านข้างอาคารฝั่งทิศเหนือ',
        victimType: 'เจ้าหน้าที่ปฏิบัติงาน',
        victimName: 'นายเฉลิม สว่างวงศ์',
        description: 'เกิดพายุฤดูร้อนลมกระโชกแรง กิ่งไม้ขนาดใหญ่หักพาดสายไฟและตกลงมาขวางทางสัญจร',
        actionTaken: 'ปิดกั้นพื้นที่ชั่วคราว ประสานฝ่ายภูมิทัศน์นำเลื่อยยนต์มาตัดทอนกิ่งไม้ และประสานการไฟฟ้าส่วนภูมิภาคเข้าตรวจสอบความปลอดภัยของสายไฟ',
        photos: [],
        reporterRole: 'หัวหน้างาน',
        reporterName: 'นายพงษ์ศักดิ์ ชูเกียรติ',
        reporterPhone: '081-999-8877',
        status: 'in_progress' as IncidentStatus,
        severity: 'medium' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `SDNU-${currentYear}-007`,
        incidentDate: `${currentYear}-${currentMonth}-05`,
        incidentTime: '11:00',
        reportDay: 5,
        reportMonth: Number(currentMonth),
        reportYear: currentYear,
        category: 'ทรัพย์สินเสียหาย/สูญหาย',
        location: 'มน.นิเวศ 5',
        locationDetail: 'ห้องซักผ้าหยอดเหรียญ ชั้น 1',
        victimType: 'ผู้พักอาศัย',
        victimName: 'ดร.อัจฉรา ภัทรเดช',
        description: 'ฝาเครื่องอบผ้าส่วนกลางชำรุด หลุดจากบานพับ ไม่สามารถใช้งานได้',
        actionTaken: 'ติดป้ายงดใช้บริการชั่วคราว และทำใบสั่งซ่อมส่งฝ่ายพัสดุหอพักเพื่อจัดซื้ออะไหล่เปลี่ยน',
        photos: [],
        reporterRole: 'ผู้ประสานงาน',
        reporterName: 'นางสาวสุดารัตน์ ศิริพร',
        reporterPhone: '086-555-1212',
        status: 'received' as IncidentStatus,
        severity: 'low' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `SDNU-${currentYear}-008`,
        incidentDate: `${currentYear}-${currentMonth}-03`,
        incidentTime: '17:30',
        reportDay: 3,
        reportMonth: Number(currentMonth),
        reportYear: currentYear,
        category: 'ระบบไฟฟ้า',
        location: 'มน.นิเวศ 1',
        locationDetail: 'เสาไฟส่องสว่างหน้าทางเข้าอาคาร',
        victimType: 'ผู้พักอาศัย',
        victimName: 'ไม่ระบุ',
        description: 'หลอดไฟส่องสว่างโซนทางเดินเข้าอาคารดับสนิท 3 ต้น ส่งผลให้ทางเดินมืดในเวลากลางคืน',
        actionTaken: 'จัดตั้งไฟส่องสว่างฉุกเฉินสำรอง และแจ้งช่างไฟฟ้าเปลี่ยนชุดหลอด LED ใหม่ในเช้าวันถัดไป',
        photos: [],
        reporterRole: 'รปภ.ประจำจุด',
        reporterName: 'นายสมบัติ ใจดี',
        reporterPhone: '081-234-5678',
        status: 'resolved' as IncidentStatus,
        severity: 'low' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const incident of sampleIncidents) {
      await setDoc(doc(db, INCIDENTS_COLLECTION, incident.id), incident);
    }

    return true;
  } catch (err) {
    console.error('Error seeding initial data:', err);
    return false;
  }
}
