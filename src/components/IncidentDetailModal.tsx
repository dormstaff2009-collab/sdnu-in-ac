/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Building,
  User,
  Printer,
  CheckCircle2,
  FileText,
  Camera,
  Maximize2,
  Trash2,
  Edit,
} from 'lucide-react';
import { Incident } from '../types';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
  onEdit: (incident: Incident) => void;
  onRequestDelete: (incident: Incident) => void;
  onOpenPrintModal: (incident: Incident) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onEdit,
  onRequestDelete,
  onOpenPrintModal,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!incident) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="bg-[#fcfaf7] rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 via-[#382013] to-stone-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2.5 py-1 bg-amber-900/40 rounded-lg text-amber-300 border border-amber-700/50 font-bold">
              {incident.id}
            </span>
            <div>
              <h2 className="text-lg font-bold">{incident.category}</h2>
              <p className="text-xs text-stone-300">
                {incident.location} {incident.locationDetail ? `• ${incident.locationDetail}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenPrintModal(incident)}
              className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="พิมพ์รายงานสรุปเหตุการณ์ (Print Report)"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">พิมพ์รายงาน</span>
            </button>
            <button
              type="button"
              onClick={() => onEdit(incident)}
              className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="แก้ไขข้อมูล"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Header */}
        <div className="hidden print:block p-6 border-b border-stone-300 text-center">
          <h1 className="text-xl font-bold text-stone-900">
            มหาวิทยาลัยนเรศวร • กองอาคารสถานที่และหอพักบุคลากร
          </h1>
          <h2 className="text-base font-semibold text-stone-700 mt-1">
            รายงานอุบัติเหตุและเหตุการณ์ไม่ปกติภายในหอพักบุคลากร (SDNU Incident Report)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            รหัสเอกสาร: {incident.id} | วันที่บันทึกข้อมูล: {incident.incidentDate} เวลา {incident.incidentTime} น.
          </p>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm">
          {/* Grid Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-stone-200/90 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-800" />
                วัน เวลา และสถานที่เกิดเหตุ
              </h4>
              <p className="text-stone-900 font-semibold">
                วันที่ {incident.reportDay} เดือน {incident.reportMonth} พ.ศ. {incident.reportYear + 543} ({incident.incidentDate})
              </p>
              <p className="text-xs text-stone-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                เวลา {incident.incidentTime} น.
              </p>
              <p className="text-xs text-stone-800 font-medium flex items-center gap-1 mt-1">
                <Building className="w-3.5 h-3.5 text-amber-800" />
                {incident.location} {incident.locationDetail ? `(${incident.locationDetail})` : ''}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/90 space-y-2 shadow-xs">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-800" />
                ข้อมูลผู้ประสบเหตุ & ผู้รายงาน
              </h4>
              <p className="text-stone-900 font-semibold">
                กลุ่มผู้ประสบเหตุ: {incident.victimType}
              </p>
              {incident.victimName && (
                <p className="text-xs text-stone-600">
                  ชื่อผู้ประสบเหตุ: {incident.victimName}
                </p>
              )}
              <div className="pt-1 border-t border-stone-100 text-xs text-stone-600 space-y-0.5">
                <p>ประเภทผู้รายงานเหตุการณ์: <span className="font-semibold text-stone-800">{incident.reporterRole}</span></p>
                <p>ชื่อ-สกุล ผู้รายงานเหตุการณ์: <span className="font-semibold text-stone-900">{incident.reporterName}</span></p>
              </div>
            </div>
          </div>

          {/* Section: ลักษณะเหตุการณ์ */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 space-y-2 shadow-xs">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-800" />
              ลักษณะเหตุการณ์ (รายละเอียดที่พบ)
            </h4>
            <p className="text-stone-800 text-sm whitespace-pre-line leading-relaxed">
              {incident.description}
            </p>
          </div>

          {/* Section: การดำเนินงานเมื่อเกิดอุบัติเหตุ */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 shadow-xs">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
              การดำเนินงานเมื่อเกิดอุบัติเหตุ / การระงับเหตุและช่วยเหลือเบื้องต้น
            </h4>
            <p className="text-stone-800 text-sm whitespace-pre-line leading-relaxed">
              {incident.actionTaken}
            </p>
          </div>

          {/* Section: ภาพถ่ายจุดเกิดเหตุ 3 ภาพ */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-800" />
              การบันทึกหลักฐาน ภาพถ่ายจุดเกิดเหตุ (แนบได้สูงสุด 3 ภาพ)
            </h4>

            {incident.photos && incident.photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {incident.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 group cursor-pointer shadow-xs"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo}
                      alt={`ภาพหลักฐาน ${idx + 1}`}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold rounded">
                      ภาพถ่ายที่ {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white border border-stone-200/80 text-center text-stone-400 text-xs">
                ไม่มีภาพถ่ายแนบในรายงานฉบับนี้
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-stone-200 bg-[#f8f5f0] flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={() => onRequestDelete(incident)}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold py-1.5 px-3 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            ลบรายงานนี้
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenPrintModal(incident)}
              className="px-4 py-2 border border-stone-200 bg-white text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-amber-800" />
              พิมพ์รายงานสรุป
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-amber-800 via-amber-700 to-stone-800 hover:from-amber-900 hover:to-stone-900 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Photo Preview */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedPhoto}
              alt="หลักฐานขยายใหญ่"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white p-2 hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
