import React, { useState } from 'react';
import NetworkNode from './NetworkNode';
import './network-tree-view.css';

export default function NetworkTreeView({ rootUser, network, maxLoadedLevel, onRequestMoreLevels, loadingNode, expandedNodeIds, setExpandedNodeIds }) {
  // rootUser: objeto del usuario raíz
  // network: array de nodos hijos (primer nivel)
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="network-container">
      {/* Nodo raíz */}
      <div className="node-root" onClick={() => setShowInfo((v) => !v)}>
        <img src="/logo_wb.svg" alt="Root User" />
        <p><small>{rootUser?.userInfo?.name || rootUser?.fullname || 'Usuario raíz'}</small></p>
        {showInfo && (
          <div className="node-content">
            <p><strong>ID:</strong> {rootUser?.user_id || rootUser?.userInfo?.uId}</p>
            <p><strong>Nombre:</strong> {rootUser?.userInfo?.name || rootUser?.fullname}</p>
            <p><strong>Celular:</strong> {rootUser?.cellular || '-'}</p>
            <p><strong>Número de cuenta:</strong> {rootUser?.account_number || '-'}</p>
            <p><strong>Directos:</strong> {rootUser?.total_children || network?.length || 0}</p>
          </div>
        )}
      </div>
      {/* Nodos hijos */}
      <div className="node-wrapper">
        {network && network.map((row, idx) => (
          <NetworkNode
            key={row.user_id || idx}
            node={row}
            maxLoadedLevel={maxLoadedLevel}
            onRequestMoreLevels={onRequestMoreLevels}
            loadingNode={loadingNode}
            expandedNodeIds={expandedNodeIds}
            setExpandedNodeIds={setExpandedNodeIds}
          />
        ))}
      </div>
    </div>
  );
} 