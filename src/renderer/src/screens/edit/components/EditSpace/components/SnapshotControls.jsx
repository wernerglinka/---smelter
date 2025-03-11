import React from 'react';
import { SnapshotIcon } from '@components/icons';
import { useSnapshots } from '../../../context/SnapshotContext';
import { useEdit } from '../../../context/EditContext';
import { useHistory } from '../../../context/HistoryContext';

/**
 * Snapshot controls component
 * 
 * @returns {JSX.Element} The snapshot controls component
 */
export const SnapshotControls = () => {
  const { formFields, resetForm } = useEdit();
  const { resetHistory } = useHistory();
  const { 
    snapshots, 
    showSnapshotList, 
    setShowSnapshotList, 
    createSnapshot, 
    restoreSnapshot 
  } = useSnapshots();
  
  const handleCreateSnapshot = () => {
    createSnapshot(formFields);
  };
  
  const handleRestoreSnapshot = (index) => {
    // Show restoration message
    const messageElement = document.createElement('div');
    messageElement.className = 'snapshot-message';
    messageElement.textContent = `Restoring: ${snapshots[index].name}`;
    document.body.appendChild(messageElement);

    // Remove message after 3 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 3000);

    // Restore the snapshot
    restoreSnapshot(index, resetForm, resetHistory);
    setShowSnapshotList(false);
  };
  
  return (
    <div className="snapshot-container">
      <span
        className="snapshot btn"
        role="button"
        title="take snapshot of form"
        onClick={handleCreateSnapshot}
        onMouseEnter={() => {
          if (snapshots.length > 0) {
            setShowSnapshotList(true);
          }
        }}
      >
        <SnapshotIcon />
      </span>

      {snapshots.length > 0 && (
        <div
          className={`snapshot-list ${showSnapshotList ? 'visible' : ''}`}
          onMouseLeave={() => setShowSnapshotList(false)}
        >
          <div className="snapshot-list-header">Saved Snapshots</div>
          {snapshots.map((snapshot, index) => (
            <div
              key={snapshot.timestamp}
              className="snapshot-item"
              onClick={(e) => {
                e.stopPropagation();
                handleRestoreSnapshot(index);
              }}
            >
              {snapshot.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};