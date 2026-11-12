/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Incident } from '../types';

export function exportIncidentsToCSV(incidents: Incident[], filename = 'sdnu-incidents-report.csv') {
  const headers = [
    'รหัสเหตุการณ์',
    'วันที่เกิดเหตุ',
    'เวลา',
    'วัน',
    'เดือน',
    'ปี',
    'ประเภทเหตุการณ์',
    'สถานที่ (หอพัก มน.นิเวศ)',
    'รายละเอียดจุดเกิดเหตุ',
    'กลุ่มผู้ประสบเหตุ',
    'ชื่อผู้ประสบเหตุ',
    'ลักษณะเหตุการณ์',
    'การดำเนินงานเมื่อเกิดอุบัติเหตุ',
    'จำนวนภาพหลักฐาน',
    'ประเภทผู้รายงานเหตุการณ์',
    'ชื่อ-สกุล ผู้รายงานเหตุการณ์',
  ];

  const rows = incidents.map((inc) => [
    `"${inc.id}"`,
    `"${inc.incidentDate}"`,
    `"${inc.incidentTime}"`,
    inc.reportDay,
    inc.reportMonth,
    inc.reportYear + 543, // Convert to Thai BE year for official reporting
    `"${inc.category}"`,
    `"${inc.location}"`,
    `"${inc.locationDetail || ''}"`,
    `"${inc.victimType}"`,
    `"${inc.victimName || ''}"`,
    `"${(inc.description || '').replace(/"/g, '""')}"`,
    `"${(inc.actionTaken || '').replace(/"/g, '""')}"`,
    inc.photos?.length || 0,
    `"${inc.reporterRole}"`,
    `"${inc.reporterName}"`,
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
