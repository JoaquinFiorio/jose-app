import React, { useRef, useLayoutEffect, useState } from 'react';

export default function NetworkNode({ node, maxLoadedLevel, onRequestMoreLevels, loadingNode, expandedNodeIds, setExpandedNodeIds }) {
  const [showInfo, setShowInfo] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const nodeRef = useRef(null);
  const childrenRef = useRef(null);
  const [orgLines, setOrgLines] = useState(null);

  const children = node.children || [];
  const isExpandable = (children.length > 0) || (node.level === maxLoadedLevel && typeof onRequestMoreLevels === 'function');
  const nodeId = node.user_id || node.userInfo?.uId;
  const expanded = expandedNodeIds.has(nodeId);

  const handleExpand = async (e) => {
    e.stopPropagation();
    if (node.level === maxLoadedLevel && typeof onRequestMoreLevels === 'function') {
      await onRequestMoreLevels(maxLoadedLevel + 1, nodeId);
    }
    setExpandedNodeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleShowInfo = (e) => {
    e.stopPropagation();
    setShowInfo(v => !v);
    setHighlight(true);
    setTimeout(() => setHighlight(false), 1200);
  };

  // Organigrama: líneas limpias
  useLayoutEffect(() => {
    if (!expanded || children.length === 0) {
      setOrgLines(null);
      return;
    }
    const parent = nodeRef.current;
    const childrenContainer = childrenRef.current;
    if (!parent || !childrenContainer) return;
    const parentRect = parent.getBoundingClientRect();
    const childrenRects = Array.from(childrenContainer.children)
      .filter(el => el.classList.contains('node'))
      .map(child => child.getBoundingClientRect());
    const containerRect = childrenContainer.getBoundingClientRect();
    const parentCenterX = parentRect.left + parentRect.width / 2 - containerRect.left;
    const parentBottomY = parentRect.bottom - containerRect.top;
    const childCenters = childrenRects.map(rect => ({
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top
    }));
    if (childCenters.length === 0) {
      setOrgLines(null);
      return;
    }
    const verticalLine = {
      x1: parentCenterX,
      y1: parentBottomY,
      x2: parentCenterX,
      y2: childCenters[0].y - 16
    };
    const minX = Math.min(...childCenters.map(c => c.x));
    const maxX = Math.max(...childCenters.map(c => c.x));
    const horizontalY = verticalLine.y2;
    const horizontalLine = {
      x1: minX,
      y1: horizontalY,
      x2: maxX,
      y2: horizontalY
    };
    const childLines = childCenters.map(c => ({
      x1: c.x,
      y1: horizontalY,
      x2: c.x,
      y2: c.y
    }));
    setOrgLines({ verticalLine, horizontalLine, childLines });
  }, [expanded, children.length]);

  return (
    <div className={`node${children.length ? ' parent' : ''}`.trim()} ref={nodeRef}>
      <div
        className={`node-header${highlight ? ' highlight' : ''}`}
        onClick={handleExpand}
        onDoubleClick={handleShowInfo}
        style={{ position: 'relative' }}
        title={isExpandable ? (node.level === maxLoadedLevel ? 'Cargar más niveles' : (expanded ? 'Colapsar hijos' : 'Expandir hijos')) : 'Doble click para ver info'}
      >
        {isExpandable && (
          <span
            style={{
              position: 'absolute',
              right: 2,
              bottom: 2,
              fontSize: 18,
              color: node.level === maxLoadedLevel ? '#eab308' : '#30674c',
              zIndex: 2
            }}
          >
            {loadingNode === nodeId ? (
              <span style={{ fontSize: 14 }}>⏳</span>
            ) : expanded ? '▼' : '▶'}
          </span>
        )}
        {node.first || node.userInfo?.name?.charAt(0) || node.fullname?.charAt(0) || 'U'}
      </div>
      <p className="first-info" onClick={handleShowInfo}>
        <small>{node.nickname || node.userInfo?.name || node.fullname}</small>
      </p>
      {showInfo && (
        <div className="node-content">
          <p><strong>ID:</strong> {node.user_id || node.userInfo?.uId}</p>
          <p><strong>Nombre:</strong> {node.fullname || node.userInfo?.name}</p>
          <p><strong>Celular:</strong> {node.cellular || '-'}</p>
          <p><strong>Número de cuenta:</strong> {node.account_number || '-'}</p>
          <p><strong>Directos:</strong> {node.total_children || (children.length || 0)}</p>
        </div>
      )}
      {children.length > 0 && expanded && (
        <div className="children" ref={childrenRef} style={{ position: 'relative' }}>
          {orgLines && (
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
              <line {...orgLines.verticalLine} stroke="#ccc" strokeWidth={2} />
              <line {...orgLines.horizontalLine} stroke="#ccc" strokeWidth={2} />
              {orgLines.childLines.map((line, idx) => (
                <line key={idx} {...line} stroke="#ccc" strokeWidth={2} />
              ))}
            </svg>
          )}
          {children.map((child, idx) => (
            <NetworkNode
              key={child.user_id || idx}
              node={child}
              maxLoadedLevel={maxLoadedLevel}
              onRequestMoreLevels={onRequestMoreLevels}
              loadingNode={loadingNode}
              expandedNodeIds={expandedNodeIds}
              setExpandedNodeIds={setExpandedNodeIds}
            />
          ))}
        </div>
      )}
    </div>
  );
} 