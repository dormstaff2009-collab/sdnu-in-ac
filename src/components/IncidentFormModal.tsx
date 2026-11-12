/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Upload,
  Camera,
  Trash2,
  Plus,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  FileText,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { Incident, IncidentStatus, IncidentSeverity, MasterConfigData } from '../types';
import { compressImageToBase64 } from '../utils/imageUtils';
import { addCustomCategory, addCustomVictimType, saveIncident } from '../services/incidentService';

interface IncidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterData: MasterConfigData;
  initialData?: Incident | null;
  onSaved: (id: string) => void;
}

export const IncidentFormModal: React.FC<IncidentFormModalProps> = ({
  isOpen,
  onClose,
  masterData,
  initialData,
  onSaved,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toTimeString().slice(0, 5);

  const [incidentDate, setIncidentDate] = useState(initialData?.incidentDate || todayStr);
  const [incidentTime, setIncidentTime] = useState(initialData?.incidentTime || nowTimeStr);
  const [category, setCategory] = useState(initialData?.category || masterData.categories[0] || 'ระบบไฟฟ้า');
  const [location, setLocation] = useState(initialData?.location || 'มน.นิเวศ 1');
  const [locationDetail, setLocationDetail] = useState(initialData?.locationDetail || '');
  const [victimType, setVictimType] = useState(initialData?.victimType || 'ผู้พักอาศัย');
  const [victimName, setVictimName] = useState(initialData?.victimName || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [actionTaken, setActionTaken] = useState(initialData?.actionTaken || '');
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [reporterRole, setReporterRole] = useState(initialData?.reporterRole || 'รปภ.ประจำจุด');
  const [reporterName, setReporterName] = useState(initialData?.reporterName || '');

  // New category / victim type inline additions
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryText, setNewCategoryText] = useState('');
  const [isAddingNewVictimType, setIsAddingNewVictimType] = useState(false);
  const [newVictimTypeText, setNewVictimTypeText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePhotoUpload = async (file: File, slotIndex: number) => {
    try {
      const base64 = await compressImageToBase64(file);
      const updated = [...photos];
      updated[slotIndex] = base64;
      setPhotos(updated);
    } catch (err) {
      console.error('Error compressing image:', err);
      setErrorMessage('ไม่สามารถประมวลผลไฟล์ภาพได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const removePhoto = (slotIndex: number) => {
    const updated = [...photos];
    updated.splice(slotIndex, 1);
    setPhotos(updated);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryText.trim()) return;
    try {
      await addCustomCategory(newCategoryText.trim(), masterData.categories);
      setCategory(newCategoryText.trim());
      setNewCategoryText('');
      setIsAddingNewCategory(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVictimType = async () => {
    if (!newVictimTypeText.trim()) return;
    try {
      await addCustomVictimType(newVictimTypeText.trim(), masterData.victimTypes);
      setVictimType(newVictimTypeText.trim());
      setNewVictimTypeText('');
      setIsAddingNewVictimType(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim()) {
      setErrorMessage('กรุณากรอกลักษณะเหตุการณ์');
      return;
    }
    if (!actionTaken.trim()) {
      setErrorMessage('กรุณากรอกการดำเนินงานเมื่อเกิดอุบัติเหตุ');
      return;
    }
    if (!reporterName.trim()) {
      setErrorMessage('กรุณากรอกชื่อ-สกุล ผู้รายงานเหตุการณ์');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedId = await saveIncident(
        {
          incidentDate,
          incidentTime,
          category,
          location,
          locationDetail: locationDetail.trim(),
          victimType,
          victimName: victimName.trim(),
          description: description.trim(),
          actionTaken: actionTaken.trim(),
          photos: photos.filter(Boolean).slice(0, 3),
          reporterRole,
          reporterName: reporterName.trim(),
        },
        initialData?.id
      );

      setIsSubmitting(false);
      onSaved(savedId);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูลไปยัง Firebase'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#fcfaf7] rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 via-[#382013] to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/25 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {initialData ? 'แก้ไขรายงานเหตุการณ์' : 'แบบฟอร์มรายงานเหตุการณ์ไม่ปกติ (SDNU)'}
              </h2>
              <p className="text-xs text-stone-300">
                หอพักบุคลากร มหาวิทยาลัยนเรศวร • บันทึกเรียลไทม์ไปยัง Firebase `sdnu-in-ac`
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 text-sm">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: วัน เวลา ที่รายงาน */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 space-y-3 shadow-xs">
            <h3 className="font-bold text-stone-800 text-xs flex items-center gap-2 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-amber-800" />
              1. วัน เดือน ปี และเวลาที่เกิดเหตุ (แยกมิติข้อมูล)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  วันที่เกิดเหตุ *
                </label>
                <input
                  type="date"
                  required
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full bg-[#fdfbf9] border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  เวลาที่เกิดเหตุ (น.) *
                </label>
                <input
                  type="time"
                  required
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  className="w-full bg-[#fdfbf9] border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ประเภทเหตุการณ์ & สถานที่ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700">
                  2. ประเภทเหตุการณ์ไม่ปกติ *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                  className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {isAddingNewCategory ? 'ยกเลิก' : 'เพิ่มประเภทใหม่'}
                </button>
              </div>

              {isAddingNewCategory ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อประเภทเหตุการณ์ใหม่..."
                    value={newCategoryText}
                    onChange={(e) => setNewCategoryText(e.target.value)}
                    className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-3 py-2 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900"
                  >
                    บันทึก
                  </button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
                >
                  {masterData.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Location (มน.นิเวศ 1 - 15) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                3. สถานที่เกิดเหตุ (หอพักบุคลากร มน.นิเวศ) *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
              >
                {masterData.locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location details */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              จุดเกิดเหตุโดยละเอียด / เลขห้องพัก
            </label>
            <input
              type="text"
              placeholder="ตัวอย่าง: ห้อง 402 ชั้น 4 หรือ ทางเดินข้างตู้กดน้ำ หรือ ลานจอดรถด้านหลัง"
              value={locationDetail}
              onChange={(e) => setLocationDetail(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          {/* Section 3: ผู้ประสบเหตุ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700">
                  4. ผู้ประสบเหตุ *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewVictimType(!isAddingNewVictimType)}
                  className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {isAddingNewVictimType ? 'ยกเลิก' : 'เพิ่มกลุ่มใหม่'}
                </button>
              </div>

              {isAddingNewVictimType ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อกลุ่มผู้ประสบเหตุ..."
                    value={newVictimTypeText}
                    onChange={(e) => setNewVictimTypeText(e.target.value)}
                    className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateVictimType}
                    className="px-3 py-2 bg-amber-800 text-white rounded-xl text-xs font-semibold hover:bg-amber-900"
                  >
                    บันทึก
                  </button>
                </div>
              ) : (
                <select
                  value={victimType}
                  onChange={(e) => setVictimType(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
                >
                  {masterData.victimTypes.map((vt) => (
                    <option key={vt} value={vt}>
                      {vt}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ชื่อ-สกุล ผู้ประสบเหตุ (ถ้าทราบ)
              </label>
              <input
                type="text"
                placeholder="ระบุชื่อ-สกุล หรือสังกัดคณะ/หน่วยงาน"
                value={victimName}
                onChange={(e) => setVictimName(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Section 4: ลักษณะเหตุการณ์ & การดำเนินงาน */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                5. ลักษณะเหตุการณ์ (ระบุรายละเอียดของเหตุการณ์ที่เกิดขึ้น) *
              </label>
              <textarea
                required
                rows={3}
                placeholder="อธิบายพฤติการณ์ สภาพแวดล้อม และข้อเท็จจริงที่พบ ณ จุดเกิดเหตุอย่างละเอียด..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl p-3 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                6. การดำเนินงานเมื่อเกิดอุบัติเหตุ / การระงับเหตุและช่วยเหลือเบื้องต้น *
              </label>
              <textarea
                required
                rows={3}
                placeholder="อธิบายมาตรการแก้ไขเฉพาะหน้า การปฐมพยาบาล การตัดกระแสไฟ การประสานงานหน่วยงานฉุกเฉิน (รพ.มน., กองอาคาร, ปภ., ตำรวจ)..."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl p-3 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Section 5: การบันทึกหลักฐาน ภาพถ่ายจุดเกิดเหตุ 3 ภาพ */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-stone-800 text-xs flex items-center gap-2 uppercase tracking-wider">
                  <Camera className="w-4 h-4 text-amber-800" />
                  7. การบันทึกหลักฐาน ภาพถ่ายจุดเกิดเหตุ (สูงสุด 3 ภาพ)
                </h3>
                <p className="text-[11px] text-stone-500">
                  แนบภาพถ่ายสภาพจุดเกิดเหตุ ร่องรอยความเสียหาย เพื่อใช้ประกอบการวิเคราะห์และสอบสวน
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                {photos.filter(Boolean).length} / 3 ภาพ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[0, 1, 2].map((slotIndex) => {
                const photoSrc = photos[slotIndex];
                return (
                  <div
                    key={slotIndex}
                    className="relative border-2 border-dashed border-stone-300 hover:border-amber-700 rounded-2xl p-2 bg-[#fdfbf9] flex flex-col items-center justify-center min-h-[140px] transition-colors overflow-hidden group"
                  >
                    {photoSrc ? (
                      <div className="relative w-full h-full min-h-[120px] flex items-center justify-center">
                        <img
                          src={photoSrc}
                          alt={`หลักฐานภาพที่ ${slotIndex + 1}`}
                          className="w-full h-28 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(slotIndex)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg opacity-90 hover:opacity-100 shadow transition-opacity"
                          title="ลบภาพนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] rounded font-medium">
                          ภาพที่ {slotIndex + 1}
                        </span>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center p-3 text-center w-full h-full">
                        <Upload className="w-6 h-6 text-stone-400 group-hover:text-amber-800 mb-1 transition-colors" />
                        <span className="text-xs font-semibold text-stone-700">
                          ภาพถ่ายที่ {slotIndex + 1}
                        </span>
                        <span className="text-[10px] text-stone-400 mt-0.5">
                          คลิกเพื่อแนบรูปถ่าย
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(file, slotIndex);
                          }}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6: ผู้รายงานเหตุการณ์ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reporter Role */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                8. ประเภทผู้รายงานเหตุการณ์ *
              </label>
              <select
                value={reporterRole}
                onChange={(e) => setReporterRole(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
              >
                {masterData.reporterRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Reporter Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                9. ชื่อ-สกุล ผู้รายงานเหตุการณ์ *
              </label>
              <input
                type="text"
                required
                placeholder="นาย/นาง/นางสาว ระบุชื่อและนามสกุล"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-semibold text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-800 via-amber-700 to-stone-800 hover:from-amber-900 hover:to-stone-900 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกรายงานเหตุการณ์</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
