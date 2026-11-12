/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  Building,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  FileText,
  Camera,
} from 'lucide-react';
import { Incident } from '../types';

interface PrintReportModalProps {
  isOpen: boolean;
  incident: Incident | null;
  onClose: () => void;
}

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const getThaiMonthName = (monthNum: number | string): string => {
  const m = typeof monthNum === 'string' ? parseInt(monthNum, 10) : monthNum;
  if (!isNaN(m) && m >= 1 && m <= 12) {
    return THAI_MONTHS[m - 1];
  }
  return String(monthNum);
};

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  incident,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [printStatusNotice, setPrintStatusNotice] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const thaiBuddhistYear = incident.reportYear + 543;
  const thaiMonthName = getThaiMonthName(incident.reportMonth);

  /**
   * Generates the standalone, beautiful official HTML document
   */
  const generateOfficialHTML = () => {
    const photosHtml =
      incident.photos && incident.photos.length > 0
        ? `<div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-top:10px;">
            ${incident.photos
              .map(
                (p, idx) => `
                <div style="border:1px solid #d6d3d1;border-radius:8px;overflow:hidden;background:#fafaf9;text-align:center;">
                  <img src="${p}" alt="ภาพที่ ${idx + 1}" style="width:100%;height:140px;object-fit:cover;display:block;" />
                  <div style="font-size:11px;font-weight:600;padding:4px;color:#44403c;background:#f5f5f4;">ภาพถ่ายที่ ${idx + 1}</div>
                </div>`
              )
              .join('')}
          </div>`
        : `<div style="padding:14px;border:1px dashed #d6d3d1;border-radius:8px;text-align:center;color:#78716c;font-size:12px;">ไม่มีภาพถ่ายหลักฐานแนบในรายงานฉบับนี้</div>`;

    return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>แบบรายงานเหตุการณ์ไม่ปกติ - ${incident.id}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    body {
      font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
      color: #1c1917;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      font-size: 14px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #78350f;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .univ-title {
      font-size: 18px;
      font-weight: 700;
      color: #78350f;
      margin: 0;
    }
    .sub-title {
      font-size: 14px;
      font-weight: 600;
      color: #44403c;
      margin: 4px 0 0 0;
    }
    .doc-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 12px;
      color: #78716c;
      border-top: 1px solid #e7e5e4;
      padding-top: 6px;
    }
    .table-info {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .table-info th, .table-info td {
      border: 1px solid #d6d3d1;
      padding: 8px 12px;
      font-size: 13px;
    }
    .table-info th {
      background-color: #f5f5f4;
      color: #292524;
      width: 28%;
      text-align: left;
      font-weight: 600;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #78350f;
      margin: 16px 0 8px 0;
      border-left: 4px solid #b45309;
      padding-left: 8px;
    }
    .content-box {
      border: 1px solid #d6d3d1;
      border-radius: 6px;
      padding: 10px 14px;
      background-color: #fafaf9;
      margin-bottom: 14px;
      white-space: pre-line;
      font-size: 13px;
    }
    .signatures {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-top: 36px;
      text-align: center;
      page-break-inside: avoid;
    }
    .signature-block {
      border-top: 1px dotted #78716c;
      padding-top: 8px;
      font-size: 12px;
      color: #44403c;
    }
    .no-print {
      display: block;
      margin-bottom: 16px;
      padding: 12px;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      text-align: center;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()" style="padding:8px 16px;background:#78350f;color:#fff;border:none;border-radius:6px;cursor:pointer;font-family:'Sarabun';font-weight:600;font-size:14px;">
      🖨️ คลิกเพื่อสั่งพิมพ์เอกสาร หรือ บันทึกเป็น PDF
    </button>
  </div>

  <div class="header">
    <h1 class="univ-title">มหาวิทยาลัยนเรศวร • NARESUAN UNIVERSITY</h1>
    <h2 class="sub-title">งานจัดการหอพักบุคลากร กองอาคารสถานที่</h2>
    <div style="font-size:15px;font-weight:700;margin-top:6px;color:#1c1917;">แบบบันทึกรายงานเหตุการณ์ไม่ปกติภายในหอพักบุคลากร</div>
    <div class="doc-meta">
      <div>รหัสแบบรายงาน: <strong>${incident.id}</strong></div>
      <div>วันที่บันทึกระบบ: ${incident.incidentDate} (${incident.reportDay}/${incident.reportMonth}/${thaiBuddhistYear}) เวลา ${incident.incidentTime} น.</div>
    </div>
  </div>

  <table class="table-info">
    <tr>
      <th>ประเภทเหตุการณ์ไม่ปกติ</th>
      <td><strong>${incident.category}</strong></td>
    </tr>
    <tr>
      <th>สถานที่เกิดเหตุ (หอพักบุคลากร)</th>
      <td><strong>${incident.location}</strong> ${incident.locationDetail ? `(${incident.locationDetail})` : ''}</td>
    </tr>
    <tr>
      <th>วัน/เวลา ที่เกิดเหตุ</th>
      <td>วันที่ ${incident.reportDay} เดือน ${thaiMonthName} พ.ศ. ${thaiBuddhistYear} เวลา ${incident.incidentTime} น.</td>
    </tr>
    <tr>
      <th>ผู้ประสบเหตุ</th>
      <td>${incident.victimType} ${incident.victimName ? `(ชื่อ-สกุล: ${incident.victimName})` : ''}</td>
    </tr>
    <tr>
      <th>ประเภทผู้รายงานเหตุการณ์</th>
      <td>${incident.reporterRole}</td>
    </tr>
    <tr>
      <th>ชื่อ-สกุล ผู้รายงานเหตุการณ์</th>
      <td><strong>${incident.reporterName}</strong></td>
    </tr>
  </table>

  <div class="section-title">ลักษณะเหตุการณ์ (รายละเอียดข้อเท็จจริง ณ จุดเกิดเหตุ)</div>
  <div class="content-box">${incident.description || '-'}</div>

  <div class="section-title">การดำเนินงานเมื่อเกิดอุบัติเหตุ / การระงับเหตุและช่วยเหลือเบื้องต้น</div>
  <div class="content-box" style="background:#fffbeb;border-color:#fde68a;">${incident.actionTaken || '-'}</div>

  <div class="section-title">การบันทึกหลักฐาน ภาพถ่ายจุดเกิดเหตุ</div>
  ${photosHtml}

  <div class="signatures">
    <div>
      <div style="height:48px;"></div>
      <div class="signature-block">
        ( ลงชื่อ ...................................................... )<br>
        ( ${incident.reporterName || '......................................................'} )<br>
        ผู้รายงานเหตุการณ์<br>
        วันที่ ..... / ..... / .........
      </div>
    </div>

    <div>
      <div style="height:48px;"></div>
      <div class="signature-block">
        ( ลงชื่อ ...................................................... )<br>
        ( นางมณีรัตน์ ดีดน้อย )<br>
        หัวหน้างานจัดการหอพักบุคลากร<br>
        วันที่ ..... / ..... / .........
      </div>
    </div>

    <div>
      <div style="height:48px;"></div>
      <div class="signature-block">
        ( ลงชื่อ ...................................................... )<br>
        ( นายรุ่งรัตน์ พระนาค )<br>
        ผู้อำนวยการกองอาคารสถานที่<br>
        วันที่ ..... / ..... / .........
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  /**
   * Action 1: Standard Browser Print
   */
  const handleBrowserPrint = () => {
    setPrintStatusNotice(null);
    try {
      window.print();
    } catch (err) {
      console.warn('Standard window.print() failed due to sandbox constraints:', err);
      setPrintStatusNotice(
        'เบราว์เซอร์อยู่ใน Sandbox iFrame จึงแนะนำให้กดปุ่ม "เปิดหน้าพิมพ์ในแท็บใหม่" หรือ "ดาวน์โหลดเอกสารสำหรับพิมพ์"'
      );
      // Auto fallback to open in new tab
      handleOpenInNewTab();
    }
  };

  /**
   * Action 2: Open standalone printable page in new tab
   */
  const handleOpenInNewTab = () => {
    try {
      const htmlContent = generateOfficialHTML();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const newWin = window.open(url, '_blank');
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        // Pop-up blocked or iframe restriction, trigger download directly
        handleDownloadHTML();
      }
    } catch (err) {
      console.warn('Blob open failed, falling back to download:', err);
      handleDownloadHTML();
    }
  };

  /**
   * Action 3: Download standalone printable HTML file
   */
  const handleDownloadHTML = () => {
    const htmlContent = generateOfficialHTML();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `รายงานเหตุการณ์_${incident.id}_${incident.location}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setPrintStatusNotice('ดาวน์โหลดไฟล์เอกสารสำหรับสั่งพิมพ์เรียบร้อยแล้ว');
  };

  /**
   * Action 4: Copy plain text summary
   */
  const handleCopySummary = async () => {
    const text = `[แบบรายงานเหตุการณ์ไม่ปกติ SDNU - มหาวิทยาลัยนเรศวร]
รหัส: ${incident.id}
วันที่เกิดเหตุ: วันที่ ${incident.reportDay} เดือน ${thaiMonthName} พ.ศ. ${thaiBuddhistYear} เวลา ${incident.incidentTime} น.
ประเภท: ${incident.category}
สถานที่: ${incident.location} ${incident.locationDetail ? `(${incident.locationDetail})` : ''}
ผู้ประสบเหตุ: ${incident.victimType} ${incident.victimName ? `(${incident.victimName})` : ''}
ลักษณะเหตุการณ์: ${incident.description}
การดำเนินงานระงับเหตุ: ${incident.actionTaken}
ผู้รายงาน: ${incident.reporterName} (${incident.reporterRole})`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:z-auto">
      <div className="bg-[#fcfaf7] rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-900 via-[#382013] to-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">พิมพ์รายงานเหตุการณ์ (Official Incident Report)</h2>
              <p className="text-xs text-stone-300">
                เอกสารทางการงานจัดการหอพักบุคลากร กองอาคารสถานที่ • มหาวิทยาลัยนเรศวร
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-stone-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="คัดลอกข้อความสรุป"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHTML}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-stone-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="ดาวน์โหลดไฟล์เอกสารเพื่อสั่งพิมพ์หรือแปลงเป็น PDF"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>ดาวน์โหลดไฟล์เอกสาร</span>
            </button>

            <button
              type="button"
              onClick={handleBrowserPrint}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>สั่งพิมพ์เอกสาร</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner if needed */}
        {printStatusNotice && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200/80 text-amber-900 text-xs flex items-center justify-between gap-2 print:hidden">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>{printStatusNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setPrintStatusNotice(null)}
              className="text-stone-400 hover:text-stone-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Printable Official Document Container */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-stone-900 text-sm print:p-0 print:overflow-visible">
          {/* Header */}
          <div className="text-center border-b-2 border-amber-950/80 pb-4">
            <h1 className="text-lg font-bold text-amber-950 tracking-wide">
              มหาวิทยาลัยนเรศวร • NARESUAN UNIVERSITY
            </h1>
            <h2 className="text-sm font-semibold text-stone-700 mt-0.5">
              งานจัดการหอพักบุคลากร กองอาคารสถานที่
            </h2>
            <div className="text-base font-bold text-stone-900 mt-2 bg-amber-50/70 inline-block px-4 py-1 rounded-lg border border-amber-200/60">
              แบบบันทึกรายงานเหตุการณ์ไม่ปกติภายในหอพักบุคลากร
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 mt-3 pt-2 border-t border-stone-200">
              <div>
                รหัสแบบรายงาน: <strong className="font-mono text-stone-800">{incident.id}</strong>
              </div>
              <div>
                วันที่บันทึกข้อมูล: {incident.incidentDate} ({incident.reportDay}/{incident.reportMonth}/{thaiBuddhistYear}) เวลา {incident.incidentTime} น.
              </div>
            </div>
          </div>

          {/* Incident Structured Table */}
          <div className="rounded-xl border border-stone-300 overflow-hidden">
            <table className="w-full text-left text-xs sm:text-sm">
              <tbody className="divide-y divide-stone-200">
                <tr className="bg-stone-50/70">
                  <td className="py-2.5 px-4 font-bold text-stone-700 w-1/3 border-r border-stone-200">
                    ประเภทเหตุการณ์ไม่ปกติ
                  </td>
                  <td className="py-2.5 px-4 font-bold text-stone-900">
                    {incident.category}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-stone-700 border-r border-stone-200">
                    สถานที่เกิดเหตุ (หอพักบุคลากร)
                  </td>
                  <td className="py-2.5 px-4 text-stone-800">
                    <strong className="text-amber-900">{incident.location}</strong>{' '}
                    {incident.locationDetail && <span>(จุดเกิดเหตุ: {incident.locationDetail})</span>}
                  </td>
                </tr>
                <tr className="bg-stone-50/70">
                  <td className="py-2.5 px-4 font-bold text-stone-700 border-r border-stone-200">
                    วัน เวลา ที่เกิดเหตุ
                  </td>
                  <td className="py-2.5 px-4 text-stone-800">
                    วันที่ {incident.reportDay} เดือน {thaiMonthName} พ.ศ. {thaiBuddhistYear} เวลา {incident.incidentTime} น.
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-stone-700 border-r border-stone-200">
                    ผู้ประสบเหตุ
                  </td>
                  <td className="py-2.5 px-4 text-stone-800">
                    {incident.victimType} {incident.victimName ? `(ชื่อ-สกุล: ${incident.victimName})` : ''}
                  </td>
                </tr>
                <tr className="bg-stone-50/70">
                  <td className="py-2.5 px-4 font-bold text-stone-700 border-r border-stone-200">
                    ประเภทผู้รายงานเหตุการณ์
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-stone-800">
                    {incident.reporterRole}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-stone-700 border-r border-stone-200">
                    ชื่อ-สกุล ผู้รายงานเหตุการณ์
                  </td>
                  <td className="py-2.5 px-4 font-bold text-stone-900">
                    {incident.reporterName}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Description Section */}
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 border-l-3 border-amber-800 pl-2">
              <FileText className="w-3.5 h-3.5" />
              ลักษณะเหตุการณ์ (รายละเอียดข้อเท็จจริง ณ จุดเกิดเหตุ)
            </h4>
            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line">
              {incident.description || '-'}
            </div>
          </div>

          {/* Action Taken Section */}
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 border-l-3 border-amber-800 pl-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              การดำเนินงานเมื่อเกิดอุบัติเหตุ / การระงับเหตุและช่วยเหลือเบื้องต้น
            </h4>
            <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line">
              {incident.actionTaken || '-'}
            </div>
          </div>

          {/* Photos Evidence Section */}
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 border-l-3 border-amber-800 pl-2">
              <Camera className="w-3.5 h-3.5" />
              การบันทึกหลักฐาน ภาพถ่ายจุดเกิดเหตุ (แนบได้สูงสุด 3 ภาพ)
            </h4>
            {incident.photos && incident.photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {incident.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="border border-stone-200 rounded-xl overflow-hidden bg-stone-100"
                  >
                    <img
                      src={photo}
                      alt={`ภาพหลักฐาน ${idx + 1}`}
                      className="w-full h-36 object-cover"
                    />
                    <div className="p-1.5 bg-stone-50 text-center text-[11px] font-semibold text-stone-700 border-t border-stone-200">
                      ภาพถ่ายที่ {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-stone-300 rounded-xl text-center text-xs text-stone-400">
                ไม่มีภาพถ่ายแนบในรายงานฉบับนี้
              </div>
            )}
          </div>

          {/* Signature Blocks */}
          <div className="pt-6 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="h-12 flex items-end justify-center pb-1">
                <span className="text-stone-400">...................................................</span>
              </div>
              <div className="border-t border-dotted border-stone-400 pt-2 text-stone-700">
                <p className="font-semibold">({incident.reporterName || '...................................................'})</p>
                <p className="text-[11px] text-stone-500">ผู้รายงานเหตุการณ์</p>
                <p className="text-[11px] text-stone-400 mt-1">วันที่ ..... / ..... / .........</p>
              </div>
            </div>

            <div>
              <div className="h-12 flex items-end justify-center pb-1">
                <span className="text-stone-400">...................................................</span>
              </div>
              <div className="border-t border-dotted border-stone-400 pt-2 text-stone-700">
                <p className="font-semibold">(นางมณีรัตน์ ดีดน้อย)</p>
                <p className="text-[11px] text-stone-500">หัวหน้างานจัดการหอพักบุคลากร</p>
                <p className="text-[11px] text-stone-400 mt-1">วันที่ ..... / ..... / .........</p>
              </div>
            </div>

            <div>
              <div className="h-12 flex items-end justify-center pb-1">
                <span className="text-stone-400">...................................................</span>
              </div>
              <div className="border-t border-dotted border-stone-400 pt-2 text-stone-700">
                <p className="font-semibold">(นายรุ่งรัตน์ พระนาค)</p>
                <p className="text-[11px] text-stone-500">ผู้อำนวยการกองอาคารสถานที่</p>
                <p className="text-[11px] text-stone-400 mt-1">วันที่ ..... / ..... / .........</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden during print) */}
        <div className="p-4 px-6 bg-[#f8f5f0] border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <p className="text-xs text-stone-500">
            * เอกสารนี้จัดพิมพ์จากระบบรายงานเหตุการณ์ไม่ปกติ หอพักบุคลากร มหาวิทยาลัยนเรศวร (SDNU Incident Reporting)
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadHTML}
              className="px-4 py-2 border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-amber-800" />
              <span>ดาวน์โหลดเอกสาร (HTML/PDF)</span>
            </button>
            <button
              type="button"
              onClick={handleBrowserPrint}
              className="px-5 py-2 bg-gradient-to-r from-amber-800 via-amber-700 to-stone-800 hover:from-amber-900 hover:to-stone-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์หน้านี้</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
