/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Incident, PieChartSlice } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  ระบบไฟฟ้า: '#d97706', // Warm Gold Amber
  ระบบน้ำ: '#0f766e', // Copper Teal / River
  ภัยธรรมชาติ: '#4d7c0f', // Forest Olive
  พบสัตว์เข้าอาคาร: '#b45309', // Earth Bronze
  ภัยคุกคาม: '#991b1b', // Rust Terracotta
  เจ็บป่วยฉุกเฉิน: '#881337', // Deep Wine / Mahogany
  โจรกรรม: '#451a03', // Dark Espresso
  'ทรัพย์สินเสียหาย/สูญหาย': '#c2410c', // Warm Sienna
};

const PALETTE = [
  '#78350f', // Chestnut Brown
  '#b45309', // Warm Copper
  '#d97706', // Rich Amber
  '#9a3412', // Rust Sienna
  '#c2410c', // Terracotta
  '#854d0e', // Raw Umber
  '#57534e', // Deep Stone
  '#713f12', // Dark Ochre
  '#451a03', // Deep Espresso
  '#a16207', // Warm Ochre
  '#0f766e', // Earth Teal
  '#3f6212', // Olive Earth
  '#78716c', // Warm Taupe
  '#52525b', // Slate Stone
];

export function getCategoryChartData(incidents: Incident[]): PieChartSlice[] {
  const counts: Record<string, number> = {};
  incidents.forEach((item) => {
    const key = item.category || 'อื่นๆ';
    counts[key] = (counts[key] || 0) + 1;
  });

  const total = incidents.length;
  let colorIndex = 0;

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => {
      const color =
        CATEGORY_COLORS[label] || PALETTE[colorIndex++ % PALETTE.length];
      return {
        label,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color,
      };
    });
}

export function getLocationChartData(incidents: Incident[]): PieChartSlice[] {
  const counts: Record<string, number> = {};
  incidents.forEach((item) => {
    const key = item.location || 'ไม่ระบุ';
    counts[key] = (counts[key] || 0) + 1;
  });

  const total = incidents.length;
  let colorIndex = 0;

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      color: PALETTE[colorIndex++ % PALETTE.length],
    }));
}

export function getVictimTypeChartData(incidents: Incident[]): PieChartSlice[] {
  const counts: Record<string, number> = {};
  incidents.forEach((item) => {
    const key = item.victimType || 'ผู้พักอาศัย';
    counts[key] = (counts[key] || 0) + 1;
  });

  const total = incidents.length;
  const victimColors: Record<string, string> = {
    ผู้พักอาศัย: '#78350f', // Saddle Chestnut
    ผู้พักอาศัยร่วม: '#b45309', // Warm Copper
    เจ้าหน้าที่ปฏิบัติงาน: '#3f6212', // Olive Earth
    'บุคลากรภายนอก/ผู้มาติดต่อ': '#ca8a04', // Golden Sand
    อื่นๆ: '#78716c', // Warm Taupe
  };

  let colorIdx = 0;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      color: victimColors[label] || PALETTE[colorIdx++ % PALETTE.length],
    }));
}

export function getReporterRoleChartData(incidents: Incident[]): PieChartSlice[] {
  const counts: Record<string, number> = {};
  incidents.forEach((item) => {
    const key = item.reporterRole || 'ไม่ระบุ';
    counts[key] = (counts[key] || 0) + 1;
  });

  const roleColors: Record<string, string> = {
    ผู้จัดการ: '#451a03', // Deep Espresso
    'รปภ.ประจำจุด': '#78350f', // Saddle Leather
    ผู้ประสานงาน: '#b45309', // Warm Copper
    หัวหน้างาน: '#d97706', // Cinnamon Amber
  };

  const total = incidents.length;
  let colorIdx = 0;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      color: roleColors[label] || PALETTE[colorIdx++ % PALETTE.length],
    }));
}
