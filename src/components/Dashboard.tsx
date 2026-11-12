/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  RotateCcw,
  Sliders,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Incident, FilterState } from '../types';
import { PieChart } from './PieChart';
import {
  getCategoryChartData,
  getLocationChartData,
  getVictimTypeChartData,
  getReporterRoleChartData,
} from '../utils/chartHelpers';

interface DashboardProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenReportModal: () => void;
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

export const Dashboard: React.FC<DashboardProps> = ({
  incidents,
  onSelectIncident,
  onOpenReportModal,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    year: 'all',
    month: 'all',
    day: 'all',
    category: 'all',
    location: 'all',
    reporterRole: 'all',
    search: '',
  });

  const [isDonut, setIsDonut] = useState(true);

  // Available years from incident data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    incidents.forEach((inc) => {
      if (inc.reportYear) years.add(inc.reportYear);
    });
    if (years.size === 0) years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [incidents]);

  // Apply filters
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      if (filters.year !== 'all' && inc.reportYear !== filters.year) return false;
      if (filters.month !== 'all' && inc.reportMonth !== filters.month) return false;
      if (filters.day !== 'all' && inc.reportDay !== filters.day) return false;
      if (filters.category !== 'all' && inc.category !== filters.category) return false;
      if (filters.location !== 'all' && inc.location !== filters.location) return false;
      if (filters.reporterRole !== 'all' && inc.reporterRole !== filters.reporterRole) return false;
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const match =
          inc.id.toLowerCase().includes(query) ||
          inc.description.toLowerCase().includes(query) ||
          inc.location.toLowerCase().includes(query) ||
          (inc.locationDetail || '').toLowerCase().includes(query) ||
          inc.reporterName.toLowerCase().includes(query) ||
          (inc.victimName || '').toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [incidents, filters]);

  // Chart data calculations
  const categoryData = useMemo(() => getCategoryChartData(filteredIncidents), [filteredIncidents]);
  const locationData = useMemo(() => getLocationChartData(filteredIncidents), [filteredIncidents]);
  const victimData = useMemo(() => getVictimTypeChartData(filteredIncidents), [filteredIncidents]);
  const reporterRoleData = useMemo(() => getReporterRoleChartData(filteredIncidents), [filteredIncidents]);

  // KPI calculations
  const totalCount = filteredIncidents.length;
  const topCategory = categoryData[0]?.label || '-';
  const topLocation = locationData[0]?.label || '-';
  const topReporterRole = reporterRoleData[0]?.label || '-';

  const resetFilters = () => {
    setFilters({
      year: 'all',
      month: 'all',
      day: 'all',
      category: 'all',
      location: 'all',
      reporterRole: 'all',
      search: '',
    });
  };

  const handleQuickPreset = (preset: 'all' | 'today' | 'this_month' | 'this_year') => {
    const now = new Date();
    if (preset === 'all') {
      resetFilters();
    } else if (preset === 'today') {
      setFilters((prev) => ({
        ...prev,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      }));
    } else if (preset === 'this_month') {
      setFilters((prev) => ({
        ...prev,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: 'all',
      }));
    } else if (preset === 'this_year') {
      setFilters((prev) => ({
        ...prev,
        year: now.getFullYear(),
        month: 'all',
        day: 'all',
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#2c1810] via-[#3d2314] to-[#1c0e07] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-950/40">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-medium text-amber-200 border border-white/10">
              <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
              หอพักบุคลากร มหาวิทยาลัยนเรศวร (มน.นิเวศ 1 - 15)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              ข้อมูลสรุปสถิติเหตุการณ์ไม่ปกติภายในหอพักบุคลากร
            </h1>
            <p className="text-sm text-amber-100/80 leading-relaxed">
              ติดตามรายงานสถานการณ์ฉุกเฉินและอุบัติเหตุภายในหอพักบุคลากรแบบเรียลไทม์
              พร้อมระบบวิเคราะห์สัดส่วนด้วยแผนภูมิวงกลมเพื่อการวางแผนเชิงรุก
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenReportModal}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-amber-600/30 transition-all flex items-center gap-2 cursor-pointer border border-amber-500/30"
            >
              <span>+ บันทึกรายงานเหตุการณ์</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDonut(!isDonut)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-2 border border-white/10"
            >
              <Layers className="w-4 h-4 text-amber-200" />
              <span>โหมด: {isDonut ? 'โดนัท (Donut)' : 'พายเต็ม (Pie)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Date & Time Partition Filter Bar (องค์ประกอบหลัก: แยกข้อมูล วัน, เดือน, ปี ที่รายงาน) */}
      <div className="bg-[#fcfaf7] rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-800" />
            <h2 className="font-bold text-stone-900 text-sm sm:text-base">
              ตัวกรองช่วงเวลาที่รายงาน (แยก วัน / เดือน / ปี)
            </h2>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => handleQuickPreset('all')}
              className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                filters.year === 'all' && filters.month === 'all' && filters.day === 'all'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('today')}
              className="px-3 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium transition-colors"
            >
              วันนี้
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('this_month')}
              className="px-3 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium transition-colors"
            >
              เดือนนี้
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('this_year')}
              className="px-3 py-1 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium transition-colors"
            >
              ปีนี้
            </button>
            {(filters.year !== 'all' || filters.month !== 'all' || filters.day !== 'all' || filters.category !== 'all' || filters.location !== 'all') && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1 text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors ml-1"
                title="ล้างตัวกรองทั้งหมด"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                รีเซ็ต
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {/* Year Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              1. ปีที่รายงาน
            </label>
            <select
              value={filters.year}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  year: e.target.value === 'all' ? 'all' : Number(e.target.value),
                })
              }
              aria-label="ปีที่รายงาน"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">ทุกปี (ทั้งหมด)</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  พ.ศ. {yr + 543} ({yr})
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              2. เดือนที่รายงาน
            </label>
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  month: e.target.value === 'all' ? 'all' : Number(e.target.value),
                })
              }
              aria-label="เดือนที่รายงาน"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">ทุกเดือน (1-12)</option>
              {THAI_MONTHS.map((mName, idx) => (
                <option key={mName} value={idx + 1}>
                  {idx + 1}. {mName}
                </option>
              ))}
            </select>
          </div>

          {/* Day Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              3. วันที่ (1-31)
            </label>
            <select
              value={filters.day}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  day: e.target.value === 'all' ? 'all' : Number(e.target.value),
                })
              }
              aria-label="วันที่ (1-31)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">ทุกวัน (1-31)</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  วันที่ {d}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              4. ประเภทเหตุการณ์
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              aria-label="ประเภทเหตุการณ์"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">ทุกประเภท</option>
              {categoryData.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label} ({c.value})
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              5. มน.นิเวศ (สถานที่)
            </label>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              aria-label="มน.นิเวศ (สถานที่)"
              className="w-full bg-[#fdfbf9] border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none"
            >
              <option value="all">ทุกอาคาร (1 - 15)</option>
              {Array.from({ length: 15 }, (_, i) => i + 1)
                .filter((n) => n !== 13)
                .map((num) => (
                  <option key={num} value={`มน.นิเวศ ${num}`}>
                    มน.นิเวศ {num}
                  </option>
                ))}
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-600 mb-1">
              6. ค้นหาคำสำคัญ
            </label>
            <input
              type="text"
              placeholder="ค้นหาข้อความ..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-[#fdfbf9] border border-stone-200 rounded-xl px-3 py-2 text-stone-800 font-medium focus:ring-2 focus:ring-amber-700 focus:outline-none placeholder:text-stone-400"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-[#fcfaf7] rounded-2xl p-5 border border-stone-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">เหตุการณ์ตามเงื่อนไข</p>
            <h4 className="text-2xl font-extrabold text-stone-900 mt-0.5">{totalCount} รายการ</h4>
            <span className="text-[11px] text-stone-400">จากทั้งหมด {incidents.length} รายการ</span>
          </div>
        </div>

        {/* Top Reporter Role */}
        <div className="bg-[#fcfaf7] rounded-2xl p-5 border border-stone-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">ประเภทผู้รายงานหลัก</p>
            <h4 className="text-lg font-extrabold text-stone-900 mt-0.5 truncate max-w-[140px]">{topReporterRole}</h4>
            <span className="text-[11px] text-amber-800 font-semibold">
              {reporterRoleData[0]?.value ? `${reporterRoleData[0].value} เหตุการณ์ (${reporterRoleData[0].percentage}%)` : 'ยังไม่มีสถิติ'}
            </span>
          </div>
        </div>

        {/* Hotspot Building */}
        <div className="bg-[#fcfaf7] rounded-2xl p-5 border border-stone-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">อาคารที่เกิดเหตุสูงสุด</p>
            <h4 className="text-lg font-extrabold text-stone-900 mt-0.5 truncate max-w-[140px]">
              {topLocation}
            </h4>
            <span className="text-[11px] text-stone-400">
              {locationData[0]?.value ? `${locationData[0].value} เหตุการณ์` : 'ยังไม่มีสถิติ'}
            </span>
          </div>
        </div>

        {/* Top Issue */}
        <div className="bg-[#fcfaf7] rounded-2xl p-5 border border-stone-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-900 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500">ประเภทที่พบบ่อยสุด</p>
            <h4 className="text-lg font-extrabold text-stone-900 mt-0.5 truncate max-w-[140px]">
              {topCategory}
            </h4>
            <span className="text-[11px] text-stone-400">
              {categoryData[0]?.value ? `${categoryData[0].value} เหตุการณ์` : 'ยังไม่มีสถิติ'}
            </span>
          </div>
        </div>
      </div>

      {/* Pie Charts Section (องค์ประกอบหลัก: สรุปผลและแสดงผลเป็นแผนภูมิวงกลมที่ดูง่าย) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart 1: Category */}
        <PieChart
          title="สัดส่วนแยกตามประเภทเหตุการณ์ไม่ปกติ"
          subtitle="ระบบไฟฟ้า, ระบบน้ำ, ภัยธรรมชาติ, สัตว์เข้าอาคาร, ฯลฯ"
          data={categoryData}
          isDonut={isDonut}
          selectedLabel={filters.category !== 'all' ? filters.category : null}
          onSliceClick={(label) =>
            setFilters((prev) => ({
              ...prev,
              category: prev.category === label ? 'all' : label,
            }))
          }
        />

        {/* Pie Chart 2: Location (มน.นิเวศ 1 - 15) */}
        <PieChart
          title="สัดส่วนสถานที่เกิดเหตุ (หอพัก มน.นิเวศ 1 - 15)"
          subtitle="ความถี่การเกิดเหตุในแต่ละอาคารหอพักบุคลากร"
          data={locationData}
          isDonut={isDonut}
          selectedLabel={filters.location !== 'all' ? filters.location : null}
          onSliceClick={(label) =>
            setFilters((prev) => ({
              ...prev,
              location: prev.location === label ? 'all' : label,
            }))
          }
        />

        {/* Pie Chart 3: Victim Type */}
        <PieChart
          title="สัดส่วนกลุ่มผู้ประสบเหตุ"
          subtitle="ผู้พักอาศัย, ผู้พักอาศัยร่วม, เจ้าหน้าที่, บุคลากรภายนอก"
          data={victimData}
          isDonut={isDonut}
        />

        {/* Pie Chart 4: Reporter Role Distribution */}
        <PieChart
          title="สัดส่วนประเภทผู้รายงานเหตุการณ์"
          subtitle="ผู้จัดการ, รปภ.ประจำจุด, ผู้ประสานงาน, หัวหน้างาน"
          data={reporterRoleData}
          isDonut={isDonut}
          selectedLabel={filters.reporterRole !== 'all' ? filters.reporterRole : null}
          onSliceClick={(label) =>
            setFilters((prev) => ({
              ...prev,
              reporterRole: prev.reporterRole === label ? 'all' : label,
            }))
          }
        />
      </div>

      {/* Recent Incidents Feed Spotlight */}
      <div className="bg-[#fcfaf7] rounded-2xl p-6 border border-stone-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-lg">
              รายการเหตุการณ์ล่าสุดตามเงื่อนไข ({filteredIncidents.length} รายการ)
            </h3>
            <p className="text-xs text-stone-500">
              คลิกเพื่อดูรายละเอียด การดำเนินงานเมื่อเกิดอุบัติเหตุ และภาพถ่ายหลักฐาน 3 ภาพ
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenReportModal}
            className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 transition-colors"
          >
            + เพิ่มเหตุการณ์ <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-sm">
            ไม่พบเหตุการณ์ตามเงื่อนไขที่เลือก สามารถกดปุ่ม &quot;รีเซ็ต&quot; หรือเพิ่มรายงานเหตุการณ์ใหม่
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredIncidents.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectIncident(item)}
                className="py-3.5 px-3 -mx-3 rounded-xl hover:bg-amber-50/50 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0 text-stone-700 font-bold text-xs mt-0.5 border border-stone-200">
                    {item.reportDay}/{item.reportMonth}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{item.category}</span>
                      <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-900 font-semibold rounded-md border border-amber-200">
                        {item.location} {item.locationDetail ? `(${item.locationDetail})` : ''}
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                        {item.reporterRole}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-1 mt-1">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1">
                      <span>ผู้รายงาน: {item.reporterName}</span>
                      <span>เวลา {item.incidentTime} น.</span>
                      {item.photos?.length > 0 && (
                        <span className="text-amber-800 font-medium">
                          📷 ภาพหลักฐาน {item.photos.length} รูป
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs text-amber-800 font-semibold hover:text-amber-900">
                    ดูรายละเอียด &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
