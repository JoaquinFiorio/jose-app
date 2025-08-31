"use client"
import React, { useEffect, useRef, useCallback } from "react"
import { User, DollarSign, ChevronDown, ChevronRight, UserCircle } from "lucide-react"
import ReactDOM from "react-dom/client"
import * as d3 from "d3"

interface D3TreeViewProps {
  treeData: any
  expandedNodesTree: Set<string>
  setExpandedNodesTree: React.Dispatch<React.SetStateAction<Set<string>>>
}

// NodeCard Component
function NodeCard({ nodeData, isExpanded, hasChildren }) {
  const bgColor =
    nodeData.level === 0
      ? "bg-violet-100"
      : nodeData.level === 1
        ? "bg-blue-100"
        : nodeData.level === 2
          ? "bg-green-100"
          : nodeData.level === 3
            ? "bg-yellow-100"
            : nodeData.level === 4
              ? "bg-purple-100"
              : nodeData.level === 5
                ? "bg-pink-100"
                : "bg-red-100"
  const cardBorderColor =
    nodeData.level === 0
      ? "border-violet-600"
      : nodeData.level === 1
        ? "border-blue-600"
        : nodeData.level === 2
          ? "border-green-600"
          : nodeData.level === 3
            ? "border-yellow-600"
            : nodeData.level === 4
              ? "border-purple-600"
              : nodeData.level === 5
                ? "border-pink-600"
                : "border-red-600"
  const avatarBgColor =
    nodeData.level === 0
      ? "bg-violet-600"
      : nodeData.level === 1
        ? "bg-blue-600"
        : nodeData.level === 2
          ? "bg-green-600"
          : nodeData.level === 3
            ? "bg-yellow-600"
            : nodeData.level === 4
              ? "bg-purple-600"
              : nodeData.level === 5
                ? "bg-pink-600"
                : "bg-red-600"
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight
  return (
    <div
      className={`w-full h-full border-2 ${cardBorderColor} ${bgColor} rounded-none shadow-md flex flex-col justify-between p-4 font-sans relative select-none`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-10 h-10 flex items-center justify-center font-bold text-white text-lg ${avatarBgColor} rounded-full flex-shrink-0`}
        >
          {nodeData.name?.charAt(0) || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-zinc-800 truncate">{nodeData.name}</div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-sm text-green-700 font-medium flex items-center">
          <span className="truncate">Comisión: {nodeData.percentage ?? 0}%</span>
        </div>
        <div className="text-sm text-red-600 font-medium flex items-center">
          <span className="truncate">Monto: {nodeData.amount ?? 0}</span>
        </div>
      </div>
      {hasChildren && (
        <div className="absolute bottom-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-white/50 backdrop-blur-sm">
          <ChevronIcon size={18} className="text-zinc-500" />
          <span className="sr-only">{isExpanded ? "Colapsar nodo" : "Expandir nodo"}</span>
        </div>
      )}
    </div>
  )
}

export function D3TreeView({ treeData, expandedNodesTree, setExpandedNodesTree }: D3TreeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  const cardWidth = 260
  const cardHeight = 140

  const buildHierarchy = useCallback((rootUser: any, network: any[]) => {
    const userMap = new Map()
    const root = {
      id: rootUser.uId,
      name: rootUser.name,
      email: rootUser.email || "",
      level: rootUser.level,
      percentage: rootUser.percentage,
      amount: rootUser.amount,
      uId: rootUser.uId,
      children: [],
    }
    userMap.set(rootUser.uId, root)

    network.forEach((user) => {
      const userNode = {
        id: user.userInfo.uId,
        name: user.userInfo.name,
        email: user.userInfo.email || "",
        level: user.level,
        percentage: user.percentage,
        amount: user.amount,
        uId: user.userInfo.uId,
        sponsor_id: user.sponsor_id,
        children: [],
      }
      userMap.set(user.userInfo.uId, userNode)
    })

    network.forEach((user) => {
      const userNode = userMap.get(user.userInfo.uId)
      const parentNode = userMap.get(user.sponsor_id)
      if (parentNode && userNode) {
        parentNode.children.push(userNode)
      }
    })
    return root
  }, [])

  const cloneAndApplyExpansion = useCallback((node: any, expandedSet: Set<string>) => {
    const cloned = { ...node }
    if (cloned.children) {
      delete cloned._children
    }
    if (cloned.children && cloned.children.length > 0) {
      if (expandedSet.has(cloned.id)) {
        cloned.children = cloned.children.map((child: any) => cloneAndApplyExpansion(child, expandedSet))
      } else {
        cloned._children = cloned.children.map((child: any) => cloneAndApplyExpansion(child, expandedSet))
        cloned.children = null
      }
    }
    return cloned
  }, [])

  const initializeD3 = useCallback(() => {
    if (!treeData || !containerRef.current || !svgRef.current) {
      return
    }

    const containerWidth = containerRef.current.clientWidth
    const margin = { top: 120, right: 40, bottom: 80, left: 40 }
    const width = containerWidth - margin.left - margin.right
    // El alto se calculará dinámicamente después del layout

    // Solo elimina el grupo principal, no todo el SVG, para evitar parpadeo
    d3.select(svgRef.current).selectAll("g.d3-tree-content").remove();

    const svgContentGroup = d3
      .select(svgRef.current)
      .attr("width", containerWidth)
      .append("g")
      .attr("class", "d3-tree-content")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const hierarchyData = buildHierarchy(treeData.rootUser, treeData.network)
    const processedTree = cloneAndApplyExpansion(hierarchyData, expandedNodesTree)
    const root = d3.hierarchy(processedTree)

    const treeLayout = d3.tree().nodeSize([cardWidth + 40, cardHeight + 60])
    treeLayout(root)

    let minX = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY
    root.each((d) => {
      minX = Math.min(minX, d.x ?? 0)
      maxX = Math.max(maxX, d.x ?? 0)
    })
    const treeRenderedWidth = maxX - minX
    const offsetX = (width - treeRenderedWidth) / 2 - minX

    root.each((d) => {
      d.x = (d.x ?? 0) + offsetX
    })

    // Custom link path generator for perpendicular lines
    const linkPathGenerator = (d: any) => {
      const sourceX = typeof d.source.x === 'number' ? d.source.x : 0;
      const sourceY = (typeof d.source.y === 'number' ? d.source.y : 0) + cardHeight / 2;
      const targetX = typeof d.target.x === 'number' ? d.target.x : 0;
      const targetY = (typeof d.target.y === 'number' ? d.target.y : 0) - cardHeight / 2;
      const midY = sourceY + (targetY - sourceY) / 2;
      return `M${sourceX},${sourceY}V${midY}H${targetX}V${targetY}`;
    }

    svgContentGroup
      .selectAll(".link")
      .data(root.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5)
      .attr("d", linkPathGenerator)

    const node = svgContentGroup
      .selectAll(".node")
      .data(root.descendants(), (d: any) => d.data.id)
      .join(
        (enter) => {
          const g = enter
            .append("g")
            .attr("class", "node")
            .attr("transform", (d: any) => `translate(${typeof d.x === 'number' ? d.x : 0},${typeof d.y === 'number' ? d.y : 0})`)
            .style("cursor", "pointer")
            .on("click", (event, d: any) => {
              event.stopPropagation();
              setExpandedNodesTree((prev) => {
                const newExpanded = new Set(prev);
                const wasExpanded = newExpanded.has(d.data.id);
                if (wasExpanded) {
                  newExpanded.delete(d.data.id);
                } else {
                  newExpanded.add(d.data.id);
                  // Espera a que React/D3 actualicen el DOM, luego centra el nodo
                  setTimeout(() => {
                    // Busca el nodo SVG correspondiente
                    const svgNode = d3.select(svgRef.current)
                      .selectAll("g.node")
                      .filter((n: any) => n.data.id === d.data.id)
                      .node();
                    if (svgNode && containerRef.current && typeof (svgNode as HTMLElement).scrollIntoView === 'function') {
                      (svgNode as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                    }
                  }, 350);
                }
                return newExpanded;
              });
            })

          // Card UI mejorada con foreignObject
          g.append("foreignObject")
            .attr("x", -cardWidth / 2)
            .attr("y", -cardHeight / 2)
            .attr("width", cardWidth)
            .attr("height", cardHeight)
            .append("xhtml:div")
            .style("width", "100%")
            .style("height", "100%")
            .each(function (d: any) {
              // Solo crea el React root si no existe, si existe solo actualiza
              if (!d.__reactRoot) {
                d.__reactRoot = ReactDOM.createRoot(this as Element);
              }
              d.__reactRoot.render(
                <NodeCard
                  nodeData={d.data}
                  isExpanded={expandedNodesTree.has(d.data.id)}
                  hasChildren={!!(d.data.children || d.data._children)}
                />,
              );
            });

          // Tooltip
          g.append("title").text(
            (d: any) =>
              `${d.data.name}\nEmail: ${d.data.email}\nNivel: ${d.data.level}\nComisión: ${d.data.percentage}%\nMonto: $${d.data.amount}\nID: ${d.data.uId}`,
          )

          return g
        },
        (update) =>
          update
            .transition()
            .duration(500)
            .attr("transform", (d: any) => `translate(${typeof d.x === 'number' ? d.x : 0},${typeof d.y === 'number' ? d.y : 0})`)
            .each(function (d: any) {
              if (d.__reactRoot) {
                d.__reactRoot.render(
                  <NodeCard
                    nodeData={d.data}
                    isExpanded={expandedNodesTree.has(d.data.id)}
                    hasChildren={!!(d.data.children || d.data._children)}
                  />,
                );
              }
            }),
        (exit) =>
          exit
            .transition()
            .duration(500)
            .remove()
            .each(function (d: any) {
              if (d.__reactRoot) {
                d.__reactRoot.unmount()
                delete d.__reactRoot
              }
            }),
      )

    // No zoom ni pan: el árbol es estático

    // Calcula el alto dinámico del SVG según el layout
    let minY = Number.POSITIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
    root.each((d) => {
      minY = Math.min(minY, d.y ?? 0);
      maxY = Math.max(maxY, d.y ?? 0);
    });
    const svgHeight = maxY - minY + cardHeight + margin.top + margin.bottom;
    d3.select(svgRef.current).attr("height", svgHeight);
  }, [treeData, expandedNodesTree, buildHierarchy, cloneAndApplyExpansion, setExpandedNodesTree])

  useEffect(() => {
    if (treeData) {
      const timer = setTimeout(() => {
        initializeD3()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [treeData, expandedNodesTree, initializeD3])

  useEffect(() => {
    const handleResize = () => {
      if (treeData) {
        initializeD3()
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [treeData, initializeD3])

  return (
    <div className="min-h-[600px] flex flex-col bg-white">
      <div className="flex-1 p-0">
        <div
          ref={containerRef}
          className="w-full rounded-b-[5px] overflow-visible"
        >
          <svg ref={svgRef} className="w-full" style={{ display: "block" }}></svg>
        </div>
      </div>
    </div>
  )
}

export default D3TreeView; 