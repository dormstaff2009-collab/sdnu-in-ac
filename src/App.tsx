/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  subscribeToIncidents,
  subscribeToMasterData,
  seedInitialSDNUDataIfEmpty,
  deleteIncident,
  DEFAULT_CATEGORIES,
  DEFAULT_LOCATIONS,
  DEFAULT_VICTIM_TYPES,
  DEFAULT_ROLES,
} from './services/incidentService';
import { Incident, MasterConfigData } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { IncidentList } from './components/IncidentList';
import { IncidentFormModal } from './components/IncidentFormModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { MasterDataModal } from './components/MasterDataModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { PrintReportModal } from './components/PrintReportModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [masterData, setMasterData] = useState<MasterConfigData>({
    categories: DEFAULT_CATEGORIES,
    victimTypes: DEFAULT_VICTIM_TYPES,
    locations: DEFAULT_LOCATIONS,
    reporterRoles: DEFAULT_ROLES,
  });

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals for reliable delete and print functions
  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);
  const [incidentToPrint, setIncidentToPrint] = useState<Incident | null>(null);

  // Initialize and subscribe
  useEffect(() => {
    // 1. Check & seed initial data if empty
    seedInitialSDNUDataIfEmpty().catch((err) => {
      console.warn('Initial seed error:', err);
    });

    // 2. Real-time subscription to incidents
    const unsubIncidents = subscribeToIncidents(
      (data) => {
        setIncidents(data);
      },
      (error) => {
        console.error('Real-time incidents error:', error);
      }
    );

    // 3. Real-time subscription to master data lookups
    const unsubMaster = subscribeToMasterData((data) => {
      setMasterData(data);
    });

    return () => {
      unsubIncidents();
      unsubMaster();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaved = (id: string) => {
    showToast(`บันทึกรายงานเหตุการณ์ ${id} เรียบร้อยแล้ว`);
  };

  const handleConfirmDelete = async (id: string) => {
    await deleteIncident(id);
    showToast(`ลบรายงานเหตุการณ์ ${id} ออกจากระบบเรียบร้อยแล้ว`);
    if (selectedIncident?.id === id) {
      setSelectedIncident(null);
    }
  };

  const handleRequestDelete = (incident: Incident) => {
    setIncidentToDelete(incident);
  };

  const handleOpenPrint = (incident: Incident) => {
    setIncidentToPrint(incident);
  };

  const handleEdit = (incident: Incident) => {
    setSelectedIncident(null);
    setEditingIncident(incident);
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-stone-900 flex flex-col font-sans selection:bg-amber-800 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-stone-100 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold ring-1 ring-amber-700/40 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => {
          setEditingIncident(null);
          setIsReportModalOpen(true);
        }}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        totalIncidents={incidents.length}
      />

      {/* App Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            incidents={incidents}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onOpenReportModal={() => {
              setEditingIncident(null);
              setIsReportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'list' && (
          <IncidentList
            incidents={incidents}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onOpenReportModal={() => {
              setEditingIncident(null);
              setIsReportModalOpen(true);
            }}
            onRequestDelete={handleRequestDelete}
            onOpenPrintModal={handleOpenPrint}
          />
        )}
      </main>

      {/* Report Creation/Edit Modal */}
      <IncidentFormModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setEditingIncident(null);
        }}
        masterData={masterData}
        initialData={editingIncident}
        onSaved={handleSaved}
      />

      {/* Detail Inspection Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onEdit={handleEdit}
        onRequestDelete={handleRequestDelete}
        onOpenPrintModal={handleOpenPrint}
      />

      {/* Dedicated Print & Official Document Modal */}
      <PrintReportModal
        isOpen={!!incidentToPrint}
        incident={incidentToPrint}
        onClose={() => setIncidentToPrint(null)}
      />

      {/* Custom Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!incidentToDelete}
        incident={incidentToDelete}
        onClose={() => setIncidentToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Master Data Config Modal */}
      <MasterDataModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        masterData={masterData}
      />

      {/* Footer */}
      <footer className="bg-[#fcfaf7] border-t border-stone-200/80 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-stone-700">
            ระบบรายงานเหตุการณ์ไม่ปกติและอุบัติเหตุภายในหอพักบุคลากร มหาวิทยาลัยนเรศวร (SDNU)
          </p>
          <p className="text-[11px] text-stone-400">
            เชื่อมต่อฐานข้อมูล Google Cloud Firestore Project: <span className="font-mono font-medium text-amber-800">sdnu-in-ac</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
