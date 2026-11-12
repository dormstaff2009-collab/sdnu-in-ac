/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  Building,
  User,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Printer,
} from 'lucide-react';
import { Incident, FilterState } from '../types';
import { exportIncidentsToCSV } from '../utils/exportUtils';
import { seedInitialSDNUDataIfEmpty, updateIncidentStatus } from '../services/incidentService';

interface IncidentListProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenReportModal: () => void;
  onRequestDelete: (incident: Incident) => void;
  onOpenPrintModal: (incident: Incident) => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  onSelectIncident,
  onOpenReportModal,
  onRequestDelete,
  onOpenPrintModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [reporterRoleFilter, setReporterRoleFilter] = useState('all');
  const [isSeeding, setIsSeeding] = useState(false);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (categoryFilter !== 'all' && inc.category !== categoryFilter) return false;
      if (locationFilter !== 'all' && inc.location !== locationFilter) return false;
      if (reporterRoleFilter !== 'all' && inc.reporterRole !== reporterRoleFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          inc.id.toLowerCase().includes(q) ||
          inc.description.toLowerCase().includes(q) ||
          inc.category.toLowerCase().includes(q) ||
          inc.location.toLowerCase().includes(q) ||
          (inc.locationDetail || '').toLowerCase().includes(q) ||
          inc.reporterRole.toLowerCase().includes(q) ||
          inc.reporterName.toLowerCase().includes(q) ||
          (inc.victimName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [incidents, categoryFilter, locationFilter, reporterRoleFilter, searchTerm]);

  const handleExportCSV = () => {
    exportIncidentsToCSV(filteredIncidents, `SDNU_Incidents_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    await seedInitialSDNUDataIfEmpty();
    setIsSeeding(false);
  };

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="bg-[#fcfaf7] rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            ระบบบันทึกและจัดการรายการเหตุการณ์ไม่ปกติ ({filteredIncidents.length} รายการ)
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            หอพักบุคลากรมหาวิทยาลัยนเรศวร • ค้นหา ตรวจสอบสถานะ และส่งออกรายงาน CSV
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-stone-200 bg-[#fdfbf9] hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            ส่งออก CSV
          </button>

          {incidents.length === 0 && (
            <button
              type="button"
              disabled={isSeeding}
              onClick={handleSeedData}
              className="px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              {isSeeding ? 'กำลังเตรียมข้อมูล...' : 'โหลดตัวอย่างข้อมูล มน.นิเวศ'}
            </button>
          )}

          <button
            type="button"
            onClick={onOpenReportModal}
            className="px-4 py-2 bg-gradient-to-r from-amber-800 via-amber-700 to-stone-800 hover:from-amber-900 hover:to-stone-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            เพิ่มรายงานใหม่
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#fcfaf7] rounded-2xl p-4 border border-stone-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ค้นหาตามรหัส, อาคาร, ผู้รายงาน, คำสำคัญ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#fdfbf9] border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none placeholder:text-stone-400"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="ประเภทเหตุการณ์"
            className="w-full bg-[#fdfbf9] border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
          >
            <option value="all">ทุกประเภทเหตุการณ์</option>
            <option value="ระบบไฟฟ้า">ระบบไฟฟ้า</option>
            <option value="ระบบน้ำ">ระบบน้ำ</option>
            <option value="ภัยธรรมชาติ">ภัยธรรมชาติ</option>
            <option value="พบสัตว์เข้าอาคาร">พบสัตว์เข้าอาคาร</option>
            <option value="ภัยคุกคาม">ภัยคุกคาม</option>
            <option value="เจ็บป่วยฉุกเฉิน">เจ็บป่วยฉุกเฉิน</option>
            <option value="โจรกรรม">โจรกรรม</option>
            <option value="ทรัพย์สินเสียหาย/สูญหาย">ทรัพย์สินเสียหาย/สูญหาย</option>
          </select>
        </div>

        {/* Location (มน.นิเวศ 1 - 15) */}
        <div>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            aria-label="สถานที่เกิดเหตุ มน.นิเวศ"
            className="w-full bg-[#fdfbf9] border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
          >
            <option value="all">ทุกอาคาร (มน.นิเวศ 1 - 15)</option>
            {Array.from({ length: 15 }, (_, i) => i + 1)
              .filter((n) => n !== 13)
              .map((num) => (
                <option key={num} value={`มน.นิเวศ ${num}`}>
                  มน.นิเวศ {num}
                </option>
              ))}
          </select>
        </div>

        {/* Reporter Role */}
        <div>
          <select
            value={reporterRoleFilter}
            onChange={(e) => setReporterRoleFilter(e.target.value)}
            aria-label="ประเภทผู้รายงานเหตุการณ์"
            className="w-full bg-[#fdfbf9] border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
          >
            <option value="all">ทุกประเภทผู้รายงานเหตุการณ์</option>
            <option value="ผู้จัดการ">ผู้จัดการ</option>
            <option value="รปภ.ประจำจุด">รปภ.ประจำจุด</option>
            <option value="ผู้ประสานงาน">ผู้ประสานงาน</option>
            <option value="หัวหน้างาน">หัวหน้างาน</option>
          </select>
        </div>
      </div>

      {/* Table & Cards */}
      <div className="bg-[#fcfaf7] rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="font-bold text-stone-700 text-sm">ไม่พบรายการเหตุการณ์ที่ตรงกับเงื่อนไข</h3>
            <p className="text-xs text-stone-400 mt-1">
              ลองปรับเปลี่ยนตัวกรองค้นหา หรือสร้างรายงานเหตุการณ์ใหม่
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/90 text-stone-700 font-bold border-b border-stone-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">วันที่/เวลา</th>
                  <th className="py-3.5 px-4">ประเภทเหตุการณ์</th>
                  <th className="py-3.5 px-4">สถานที่ (มน.นิเวศ)</th>
                  <th className="py-3.5 px-4">ลักษณะเหตุการณ์</th>
                  <th className="py-3.5 px-4">ผู้ประสบเหตุ</th>
                  <th className="py-3.5 px-4">ประเภทผู้รายงาน</th>
                  <th className="py-3.5 px-4">ชื่อ-สกุล ผู้รายงาน</th>
                  <th className="py-3.5 px-4 text-center">หลักฐาน</th>
                  <th className="py-3.5 px-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredIncidents.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    onClick={() => onSelectIncident(item)}
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-stone-900">
                        {item.reportDay}/{item.reportMonth}/{item.reportYear + 543}
                      </div>
                      <span className="text-[11px] text-stone-400">{item.incidentTime} น.</span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                        {item.category}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-amber-900">{item.location}</div>
                      {item.locationDetail && (
                        <span className="text-[11px] text-stone-400 truncate max-w-[140px] block">
                          {item.locationDetail}
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-stone-700 leading-relaxed font-normal">
                        {item.description}
                      </p>
                    </td>

                    {/* Victim */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-stone-800">{item.victimType}</div>
                      {item.victimName && (
                        <span className="text-[11px] text-stone-400">{item.victimName}</span>
                      )}
                    </td>

                    {/* Reporter Role */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-md border border-amber-300/60">
                        {item.reporterRole}
                      </span>
                    </td>

                    {/* Reporter Name */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-stone-900">{item.reporterName}</div>
                    </td>

                    {/* Photos Count */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      {item.photos?.length > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                          📷 {item.photos.length}/3
                        </span>
                      ) : (
                        <span className="text-stone-300 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Action */}
                    <td
                      className="py-3.5 px-4 whitespace-nowrap text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectIncident(item)}
                          className="p-1.5 text-amber-800 hover:bg-amber-100/60 rounded-lg transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenPrintModal(item)}
                          className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-amber-100/60 rounded-lg transition-colors"
                          title="พิมพ์รายงานสรุปเหตุการณ์"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDelete(item)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบรายงาน"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

