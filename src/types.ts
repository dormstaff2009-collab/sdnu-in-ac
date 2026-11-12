/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IncidentCategory =
  | 'ระบบไฟฟ้า'
  | 'ระบบน้ำ'
  | 'ภัยธรรมชาติ'
  | 'พบสัตว์เข้าอาคาร'
  | 'ภัยคุกคาม'
  | 'เจ็บป่วยฉุกเฉิน'
  | 'โจรกรรม'
  | 'ทรัพย์สินเสียหาย/สูญหาย'
  | string;

export type VictimType =
  | 'ผู้พักอาศัย'
  | 'ผู้พักอาศัยร่วม'
  | 'เจ้าหน้าที่ปฏิบัติงาน'
  | 'บุคลากรภายนอก/ผู้มาติดต่อ'
  | 'อื่นๆ'
  | string;

export type ReporterRole =
  | 'ผู้จัดการ'
  | 'รปภ.ประจำจุด'
  | 'ผู้ประสานงาน'
  | 'หัวหน้างาน'
  | string;

export type IncidentStatus = 'received' | 'in_progress' | 'resolved' | 'closed';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
  id: string;
  incidentDate: string; // YYYY-MM-DD
  incidentTime: string; // HH:mm
  reportDay: number; // 1-31
  reportMonth: number; // 1-12
  reportYear: number; // CE or BE, stored as standard e.g. 2026
  category: IncidentCategory;
  location: string; // มน.นิเวศ 1 - 15
  locationDetail?: string; // e.g. "ห้อง 302", "ลานจอดรถด้านหน้า"
  victimType: VictimType;
  victimName?: string;
  description: string;
  actionTaken: string;
  photos: string[]; // up to 3 image base64 or URLs
  reporterRole: ReporterRole;
  reporterName: string;
  reporterPhone?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface MasterConfigData {
  categories: string[];
  victimTypes: string[];
  locations: string[];
  reporterRoles: string[];
}

export interface FilterState {
  year: number | 'all';
  month: number | 'all';
  day: number | 'all';
  category: string | 'all';
  location: string | 'all';
  reporterRole: string | 'all';
  search: string;
}

export interface PieChartSlice {
  label: string;
  value: number;
  percentage: number;
  color: string;
}
