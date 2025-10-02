'use client';

import React, { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataEntry } from '@/lib/types';
import { formatCurrency, formatTime } from '@/lib/calculations';

interface DataHistoryTableProps {
  entries: DataEntry[];
  onEdit: (entry: DataEntry) => void;
  onDelete: (entryId: string) => void;
  className?: string;
}

export default function DataHistoryTable({ 
  entries, 
  onEdit, 
  onDelete, 
  className = '' 
}: DataHistoryTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteClick = (entryId: string) => {
    if (deleteConfirm === entryId) {
      onDelete(entryId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(entryId);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  if (entries.length === 0) {
    return (
      <div className={`card-cpn ${className}`}>
        <div className="text-center py-8">
          <p className="text-cpn-gray">No entries yet</p>
          <p className="text-sm text-cpn-gray/70 mt-1">
            Add your first entry using the form above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-cpn overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-heading text-cpn-white">History</h3>
        <span className="text-sm text-cpn-gray">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table-cpn">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Duration</th>
              <th>Nuts</th>
              <th>Cost/Nut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const costPerNut = entry.numberOfNuts > 0 
                ? entry.amountSpent / entry.numberOfNuts 
                : 0;

              return (
                <tr key={entry.id}>
                  <td className="font-medium">
                    {formatDate(entry.date)}
                  </td>
                  <td className="text-cpn-yellow">
                    {formatCurrency(entry.amountSpent)}
                  </td>
                  <td>
                    {formatTime(entry.durationMinutes)}
                  </td>
                  <td className="text-center">
                    {entry.numberOfNuts}
                  </td>
                  <td className="text-cpn-yellow font-medium">
                    {formatCurrency(costPerNut)}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(entry)}
                        className="text-cpn-gray hover:text-cpn-yellow transition-colors p-1"
                        title="Edit entry"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(entry.id)}
                        className={`transition-colors p-1 ${
                          deleteConfirm === entry.id
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-cpn-gray hover:text-red-400'
                        }`}
                        title={deleteConfirm === entry.id ? 'Click again to confirm' : 'Delete entry'}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">
            Click the delete button again to permanently remove the entry.
            <button
              onClick={() => setDeleteConfirm(null)}
              className="text-red-300 hover:text-red-200 ml-2 underline"
            >
              Cancel
            </button>
          </p>
        </div>
      )}
    </div>
  );
}