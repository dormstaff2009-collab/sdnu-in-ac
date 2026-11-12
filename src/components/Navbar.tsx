/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  PieChart as PieIcon,
  ListFilter,
  PlusCircle,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'list';
  setActiveTab: (tab: 'dashboard' | 'list') => void;
  onOpenReportModal: () => void;
  onOpenConfigModal: () => void;
  totalIncidents: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenConfigModal,
  totalIncidents,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fcfaf7]/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & System Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-900 via-stone-800 to-amber-700 flex items-center justify-center text-amber-100 shadow-sm ring-2 ring-amber-200/60">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-900 tracking-tight text-base sm:text-lg">
                  SDNU Incident Reporting
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-300/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                  Firebase: sdnu-in-ac
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                ระบบรายงานเหตุการณ์ไม่ปกติ หอพักบุคลากร มหาวิทยาลัยนเรศวร
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-200/60 p-1.5 rounded-xl border border-stone-300/50">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-amber-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <PieIcon className="w-4 h-4 text-amber-800" />
              แดชบอร์ด & แผนภูมิวงกลม
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-amber-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ListFilter className="w-4 h-4 text-amber-800" />
              รายการเหตุการณ์ ({totalIncidents})
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenConfigModal}
              title="จัดการหมวดหมู่ข้อมูล Master Data"
              className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-xl transition-colors border border-stone-200/70"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-amber-800 via-amber-700 to-stone-800 hover:from-amber-900 hover:to-stone-900 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">รายงานเหตุการณ์ใหม่</span>
              <span className="sm:hidden">รายงาน</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-200 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 py-1 font-medium ${
              activeTab === 'dashboard' ? 'text-amber-800 font-bold border-b-2 border-amber-800' : 'text-stone-600'
            }`}
          >
            <PieIcon className="w-4 h-4" /> แดชบอร์ด
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 py-1 font-medium ${
              activeTab === 'list' ? 'text-amber-800 font-bold border-b-2 border-amber-800' : 'text-stone-600'
            }`}
          >
            <ListFilter className="w-4 h-4" /> รายการ ({totalIncidents})
          </button>
        </div>
      </div>
    </header>
  );
};
