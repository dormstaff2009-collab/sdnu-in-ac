/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Calendar, Building, User } from 'lucide-react';
import { Incident } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  incident: Incident | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  incident,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await onConfirm(incident.id);
      setIsDeleting(false);
      onClose();
    } catch (err) {
      console.error('Failed to delete incident:', err);
      setIsDeleting(false);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'เกิดข้อผิดพลาดในการลบข้อมูลจากฐานข้อมูล Firebase กรุณาลองใหม่อีกครั้ง'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fcfaf7] rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 text-red-700 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-stone-900">ยืนยันการลบรายงานเหตุการณ์</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              การดำเนินการนี้จะลบข้อมูลออกจากฐานข้อมูล Firebase ทันที และไม่สามารถกู้คืนได้
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Incident Summary Card */}
        <div className="px-6 py-2">
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {incident.id}
              </span>
              <span className="font-semibold text-stone-800">{incident.category}</span>
            </div>

            <div className="flex items-center gap-2 text-stone-600">
              <Building className="w-3.5 h-3.5 text-stone-400" />
              <span>{incident.location} {incident.locationDetail ? `(${incident.locationDetail})` : ''}</span>
            </div>

            <div className="flex items-center gap-2 text-stone-600">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>
                วันที่ {incident.reportDay}/{incident.reportMonth}/{incident.reportYear + 543} เวลา {incident.incidentTime} น.
              </span>
            </div>

            <div className="flex items-center gap-2 text-stone-600">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span>ผู้รายงาน: {incident.reporterName} ({incident.reporterRole})</span>
            </div>

            <p className="text-stone-500 line-clamp-2 pt-1 border-t border-stone-100 italic">
              &quot;{incident.description}&quot;
            </p>
          </div>

          {errorMessage && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 mt-2 bg-[#f8f5f0] border-t border-stone-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-stone-600 hover:bg-stone-200/70 rounded-xl font-semibold text-xs transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>กำลังลบข้อมูล...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>ยืนยันการลบข้อมูล</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
