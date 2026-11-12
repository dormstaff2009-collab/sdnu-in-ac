/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, Sliders, Shield } from 'lucide-react';
import { MasterConfigData } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface MasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterData: MasterConfigData;
}

export const MasterDataModal: React.FC<MasterDataModalProps> = ({
  isOpen,
  onClose,
  masterData,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'victimTypes' | 'roles'>('categories');
  const [newItemText, setNewItemText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentList =
    activeTab === 'categories'
      ? masterData.categories
      : activeTab === 'victimTypes'
      ? masterData.victimTypes
      : masterData.reporterRoles;

  const docId =
    activeTab === 'categories'
      ? 'categories'
      : activeTab === 'victimTypes'
      ? 'victim_types'
      : 'roles';

  const handleAddItem = async () => {
    setErrorMessage(null);
    const text = newItemText.trim();
    if (!text || currentList.includes(text)) return;

    setIsSaving(true);
    const updated = [...currentList, text];
    try {
      await setDoc(doc(db, 'master_data', docId), {
        items: updated,
        updatedAt: new Date().toISOString(),
      });
      setNewItemText('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `master_data/${docId}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveItem = async (indexToRemove: number) => {
    setErrorMessage(null);
    if (currentList.length <= 1) {
      setErrorMessage('ต้องมีตัวเลือกอย่างน้อย 1 รายการในระบบ');
      return;
    }

    setIsSaving(true);
    const updated = currentList.filter((_, idx) => idx !== indexToRemove);
    try {
      await setDoc(doc(db, 'master_data', docId), {
        items: updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `master_data/${docId}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fcfaf7] rounded-3xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stone-900 via-[#382013] to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold">จัดการข้อมูลตัวเลือกหลัก (Master Data)</h2>
              <p className="text-[11px] text-stone-300">
                รองรับการเพิ่ม/แก้ไขประเภทเหตุการณ์ ผู้ประสบเหตุ และประเภทผู้รายงานเหตุการณ์
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-stone-200 text-xs font-semibold bg-[#f8f5f0]">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'categories'
                ? 'bg-[#fcfaf7] text-amber-900 border-b-2 border-amber-800 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ประเภทเหตุการณ์ ({masterData.categories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('victimTypes')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'victimTypes'
                ? 'bg-[#fcfaf7] text-amber-900 border-b-2 border-amber-800 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            กลุ่มผู้ประสบเหตุ ({masterData.victimTypes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'roles'
                ? 'bg-[#fcfaf7] text-amber-900 border-b-2 border-amber-800 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ประเภทผู้รายงาน ({masterData.reporterRoles.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-red-500 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Add input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`พิมพ์ชื่อ${
                activeTab === 'categories'
                  ? 'ประเภทเหตุการณ์'
                  : activeTab === 'victimTypes'
                  ? 'กลุ่มผู้ประสบเหตุ'
                  : 'ประเภทผู้รายงาน'
              }ที่ต้องการเพิ่ม...`}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              className="flex-1 bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none placeholder:text-stone-400"
            />
            <button
              type="button"
              disabled={isSaving || !newItemText.trim()}
              onClick={handleAddItem}
              className="px-4 py-2 bg-gradient-to-r from-amber-800 via-amber-700 to-stone-800 hover:from-amber-900 hover:to-stone-900 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              เพิ่ม
            </button>
          </div>

          {/* List items */}
          <div className="max-h-64 overflow-y-auto divide-y divide-stone-100 rounded-xl border border-stone-200/90 bg-white">
            {currentList.map((item, idx) => (
              <div
                key={item}
                className="flex items-center justify-between p-3 text-xs hover:bg-amber-50/40 transition-colors"
              >
                <span className="font-medium text-stone-800">
                  {idx + 1}. {item}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1 text-stone-400 hover:text-red-500 rounded-md transition-colors"
                  title="ลบตัวเลือกนี้"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-stone-400 text-center">
            * การเปลี่ยนแปลงจะถูกบันทึกไปยัง Firebase และอัปเดตแบบเรียลไทม์ในทุกเครื่อง
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8f5f0] border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-800 via-amber-700 to-stone-800 hover:from-amber-900 hover:to-stone-900 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
