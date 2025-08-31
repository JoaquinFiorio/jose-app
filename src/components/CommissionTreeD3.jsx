import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { Users } from "lucide-react";

const getColor = (level) => {
  if (level <= 3) return "#ff6b6b"; // Red
  if (level <= 6) return "#4ecdc4"; // Teal
  if (level <= 9) return "#45b7d1"; // Light Blue
  return "#96ceb4"; // Greenish
};

export default function CommissionTreeD3({ graphData, loading, error }) {
  console.log('CommissionTreeD3 - Component rendered with props:', { 
    hasGraphData: !!graphData, 
    loading, 
    error,
    graphDataKeys: graphData ? Object.keys(graphData) : null 
  });
  
  // Add a state to track if D3 has been initialized
  const [d3Initialized, setD3Initialized] = useState(false);
  
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const tooltipRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Ref to hold the D3 root hierarchy object, which is mutable
  const d3RootRef = useRef(null);

  const margin = { top: 60, right: 20, bottom: 20, left: 20 };
  const duration = 750;
  let i = 0; // For unique IDs for nodes

  const diagonal = useCallback((s, d) => {
    // Vertical tree path
    return `M ${s.x} ${s.y}
            C ${s.x} ${(s.y + d.y) / 2},
              ${d.x} ${(s.y + d.y) / 2},
              ${d.x} ${d.y}`;
  }, []);

  const collapse = useCallback((d) => {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }, []);

  // The core D3 update function
  const updateTree = useCallback(
    (source) => {
      if (!gRef.current || !d3RootRef.current) return;

      const effectiveDimensions = {
        width: dimensions.width > 0 ? dimensions.width : 800,
        height: dimensions.height > 0 ? dimensions.height : 600
      };

      const treeLayout = d3.tree().size([effectiveDimensions.width, effectiveDimensions.height - margin.top - margin.bottom]);
      const treeData = treeLayout(d3RootRef.current); // Always use the current root from ref

      const nodes = treeData.descendants();
      const links = treeData.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach((d) => {
        d.y = d.depth * 180; // Adjust spacing between levels
      });

      // Update the nodes
      const node = d3
        .select(gRef.current)
        .selectAll("g.node")
        .data(nodes, (d) => (d.id || (d.id = ++i)));

      // Enter any new nodes at the parent's previous position.
      const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d) => `translate(${source.x0 || 0},${source.y0 || 0})`)
        .on("click", (event, d) => {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          updateTree(d); // Call update with the clicked node as source for transition
        });

      // Add Circle for the nodes
      nodeEnter
        .append("circle")
        .attr("r", 1e-6)
        .style("fill", (d) => (d._children ? getColor(d.data.level) : "#fff"))
        .style("stroke", (d) => getColor(d.data.level));

      // Add labels for the nodes
      nodeEnter
        .append("text")
        .attr("dy", ".35em")
        .attr("y", (d) => (d.children || d._children ? -13 : 13)) // Position text above/below circle
        .attr("text-anchor", "middle")
        .text((d) => (d.data.name.length > 15 ? d.data.name.substring(0, 15) + "..." : d.data.name))
        .style("fill-opacity", 1e-6);

      // Add mouse events for tooltip
      nodeEnter
        .on("mouseover", (event, d) => {
          if (tooltipRef.current) {
            d3.select(tooltipRef.current).transition().duration(200).style("opacity", 0.9);
            d3.select(tooltipRef.current)
              .html(`
                <strong>${d.data.name}</strong><br/>
                Email: ${d.data.email}<br/>
                ID: ${d.data.uId}<br/>
                Nivel: ${d.data.level}<br/>
                Porcentaje: ${d.data.percentage}%
              `)
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 28 + "px");
          }
        })
        .on("mouseout", () => {
          if (tooltipRef.current) {
            d3.select(tooltipRef.current).transition().duration(500).style("opacity", 0);
          }
        });

      // UPDATE
      const nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", (d) => `translate(${d.x},${d.y})`);

      // Update the node attributes and style
      nodeUpdate
        .select("circle")
        .attr("r", (d) => 6 + d.data.percentage * 0.3)
        .style("fill", (d) => (d._children ? getColor(d.data.level) : "#fff"))
        .style("stroke", (d) => getColor(d.data.level));

      nodeUpdate.select("text").style("fill-opacity", 1);

      // Remove any exiting nodes
      const nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr("transform", (d) => `translate(${source.x},${source.y})`)
        .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select("circle").attr("r", 1e-6);

      // On exit reduce the opacity of the text to 0
      nodeExit.select("text").style("fill-opacity", 1e-6);

      // Update the links
      const link = d3
        .select(gRef.current)
        .selectAll("path.link")
        .data(links, (d) => d.id);

      // Enter any new links at the parent's previous position.
      const linkEnter = link
        .enter()
        .insert("path", "g")
        .attr("class", "link")
        .attr("d", (d) => {
          const o = { x: source.x0 || 0, y: source.y0 || 0 };
          return diagonal(o, o);
        });

      // UPDATE
      const linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate
        .transition()
        .duration(duration)
        .attr("d", (d) => diagonal(d, d.parent));

      // Remove any exiting links
      link
        .exit()
        .transition()
        .duration(duration)
        .attr("d", (d) => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      // Store the old positions for transition.
      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    },
    [dimensions, diagonal, margin.top, margin.bottom], // Dependencies for updateTree
  );

  const expandAll = useCallback(() => {
    if (!d3RootRef.current) return;
    function expand(d) {
      if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      if (d.children) {
        d.children.forEach(expand);
      }
    }
    expand(d3RootRef.current);
    updateTree(d3RootRef.current); // Update with root as source
  }, [updateTree]);

  const collapseAll = useCallback(() => {
    if (!d3RootRef.current || !d3RootRef.current.children) return;
    d3RootRef.current.children.forEach(collapse);
    updateTree(d3RootRef.current); // Update with root as source
  }, [collapse, updateTree]);

  const resetView = useCallback(() => {
    if (svgRef.current && gRef.current) {
      const svg = d3.select(svgRef.current);
      const zoomBehavior = d3
        .zoom()
        .scaleExtent([0.3, 3])
        .on("zoom", (event) => {
          d3.select(gRef.current).attr("transform", event.transform.toString());
        });
      svg
        .transition()
        .duration(750)
        .call(zoomBehavior.transform, d3.zoomIdentity.translate(margin.left, margin.top));
    }
  }, [margin.left, margin.top]);

  // Effect for setting dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      // Try multiple selectors to find the container
      let container = d3.select("#tree-container").node();
      if (!container) {
        container = d3.select(".tree-container").node();
      }
      if (!container) {
        // Fallback: use window dimensions
        const width = window.innerWidth - 100;
        const height = 600;
        setDimensions({ width, height });
        return;
      }
      
      const { width, height } = container.getBoundingClientRect();
      console.log('CommissionTreeD3 - Container dimensions:', { width, height });
      
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      } else {
        // Fallback dimensions if container has no size
        const fallbackWidth = window.innerWidth - 100;
        const fallbackHeight = 600;
        console.log('CommissionTreeD3 - Using fallback dimensions:', { fallbackWidth, fallbackHeight });
        setDimensions({ width: fallbackWidth, height: fallbackHeight });
      }
    };

    // Initial dimension update with multiple attempts
    const timer1 = setTimeout(updateDimensions, 50);
    const timer2 = setTimeout(updateDimensions, 200);
    const timer3 = setTimeout(updateDimensions, 500);
    
    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Effect for D3 initialization and re-initialization on dimensions change and data change
  useEffect(() => {
    console.log('CommissionTreeD3 - useEffect triggered with:', { 
      dimensions, 
      graphData: !!graphData,
      graphDataKeys: graphData ? Object.keys(graphData) : null 
    });
    
    if (!graphData) {
      console.log('CommissionTreeD3 - No graph data available');
      setD3Initialized(false);
      return;
    }

    // Use fallback dimensions if container dimensions are not available
    const effectiveDimensions = {
      width: dimensions.width > 0 ? dimensions.width : 800,
      height: dimensions.height > 0 ? dimensions.height : 600
    };

    console.log('CommissionTreeD3 - Using dimensions:', effectiveDimensions);

    // Add a small delay to ensure DOM is fully ready
    const initTimer = setTimeout(() => {
      try {
        if (!svgRef.current) {
          console.log('CommissionTreeD3 - SVG ref not ready, retrying...');
          setD3Initialized(false);
          return;
        }

    let treeData = null;

    // Handle new API structure with rootUser
    if (graphData.rootUser) {
      console.log('Using new API structure with rootUser:', graphData.rootUser);
      console.log('Users in new structure:', graphData.users);
      console.log('Links in new structure:', graphData.links);
      
      console.log('CommissionTreeD3 - Processing new API structure');
      
      const userMap = {};
      
      // Add root user to the map
      userMap[graphData.rootUser.user_id] = {
        id: graphData.rootUser.user_id,
        level: graphData.rootUser.level,
        percentage: graphData.rootUser.percentage,
        name: graphData.rootUser.userInfo.name,
        email: graphData.rootUser.userInfo.email,
        uId: graphData.rootUser.userInfo.uId,
        children: [],
      };
      
      // Add all other users to the map
      if (graphData.users) {
        graphData.users.forEach((user) => {
          userMap[user.user_id] = {
            id: user.user_id,
            level: user.level,
            percentage: user.percentage,
            name: user.userInfo.name,
            email: user.userInfo.email,
            uId: user.userInfo.uId,
            children: [],
          };
        });
      }

      // Build the tree structure using links
      if (graphData.links) {
        graphData.links.forEach((link) => {
          const parent = userMap[link.source];
          const child = userMap[link.target];
          if (parent && child) {
            parent.children.push(child);
          }
        });
      }
      
      treeData = userMap[graphData.rootUser.user_id];
      
      if (!treeData) {
        console.error("Root user data not found in userMap");
        return;
      }
      
      console.log('CommissionTreeD3 - treeData created successfully (new structure):', treeData);
    } else {
      // Fallback to old API structure
      console.log('Using old API structure');
      
      if (!graphData.users || !graphData.links) return;

      const userMap = {};
      graphData.users.forEach((user) => {
        userMap[user.user_id] = {
          id: user.user_id,
          level: user.level,
          percentage: user.percentage,
          name: user.userInfo.name,
          email: user.userInfo.email,
          uId: user.userInfo.uId,
          children: [],
        };
      });

      graphData.links.forEach((link) => {
        const parent = userMap[link.source];
        const child = userMap[link.target];
        if (parent && child) {
          parent.children.push(child);
        }
      });

      // Find root user - look for the user that appears as source but not as target
      const sourceUsers = new Set(graphData.links.map(link => link.source));
      const targetUsers = new Set(graphData.links.map(link => link.target));
      
      // Find users that are sources but not targets (root nodes)
      const rootUserIds = Array.from(sourceUsers).filter(id => !targetUsers.has(id));
      
      if (rootUserIds.length === 0) {
        console.error("No root user found in the graph");
        return;
      }
      
      // Use the first root user found
      const rootUserId = rootUserIds[0];
      const rootUser = graphData.users.find(u => u.user_id === rootUserId);
      
      if (!rootUser) {
        console.error("Root user not found in users array:", rootUserId);
        return;
      }
      
      treeData = userMap[rootUser.user_id];
      
      if (!treeData) {
        console.error("Root user data not found in userMap");
        return;
      }
    }

    console.log('CommissionTreeD3 - Starting D3 initialization with treeData:', treeData);
    
    const svg = d3.select(svgRef.current).attr("width", effectiveDimensions.width).attr("height", effectiveDimensions.height);
    svg.selectAll("*").remove(); // Clear SVG content on re-render

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    gRef.current = g.node();
    
    console.log('CommissionTreeD3 - SVG and group created successfully');

    const initialRoot = d3.hierarchy(treeData);
    initialRoot.x0 = effectiveDimensions.width / 2; // Initial x position for vertical layout
    initialRoot.y0 = 0; // Initial y position for vertical layout

    // Store the initial root in the ref
    d3RootRef.current = initialRoot;

    // Collapse after the first level
    if (initialRoot.children) {
      initialRoot.children.forEach(collapse);
    }

    // Initial render
    updateTree(initialRoot); // Pass the initial root as source for first render

    const zoomBehavior = d3
      .zoom()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });
    svg.call(zoomBehavior);
    
    console.log('CommissionTreeD3 - D3 initialization completed successfully');
    setD3Initialized(true);
      } catch (error) {
        console.error('CommissionTreeD3 - Error during initialization:', error);
        setD3Initialized(false);
      }
    }, 50); // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(initTimer);
      setD3Initialized(false);
    };
  }, [dimensions, updateTree, collapse, margin.left, margin.top, graphData]); // Dependencies for D3 setup

  // Force initialization after 5 seconds if it gets stuck
  useEffect(() => {
    if (graphData && !d3Initialized && dimensions.width > 0) {
      const timeout = setTimeout(() => {
        console.log('CommissionTreeD3 - Forcing initialization after timeout');
        setD3Initialized(true);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [graphData, d3Initialized, dimensions.width]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center p-8">
          <p className="text-slate-600 text-lg">Cargando árbol de comisiones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="flex justify-center items-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Sin datos</h2>
          <p className="text-slate-600 mb-4">No hay datos de red disponibles para mostrar el árbol.</p>
          <p className="text-sm text-slate-500">
            Esto puede indicar que aún no tienes referidos en tu red o que los datos no se han sincronizado.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while D3 is initializing
  if (graphData && !d3Initialized && dimensions.width > 0) {
    return (
      <div className="flex justify-center items-center h-[600px] bg-gray-50 rounded-lg">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Inicializando árbol...</p>
          <p className="text-sm text-slate-500 mt-2">Preparando visualización...</p>
          <p className="text-xs text-gray-400 mt-1">Dimensiones: {dimensions.width}x{dimensions.height}</p>
        </div>
      </div>
    );
  }

  // Force initialization if we have data but D3 is not initialized
  if (graphData && !d3Initialized) {
    console.log('CommissionTreeD3 - Forcing initialization with fallback dimensions');
    setD3Initialized(true);
  }

  // Calculate statistics based on available data
  let totalUsers = 0;
  let maxLevel = 0;
  let totalConnections = 0;

  if (graphData.rootUser) {
    // New API structure
    totalUsers = (graphData.users ? graphData.users.length : 0) + 1; // +1 for rootUser
    maxLevel = Math.max(
      graphData.rootUser.level,
      ...(graphData.users ? graphData.users.map((u) => u.level) : [])
    );
    totalConnections = graphData.links ? graphData.links.length : 0;
  } else if (graphData.users) {
    // Old API structure
    totalUsers = graphData.users.length;
    maxLevel = Math.max(...graphData.users.map((u) => u.level));
    totalConnections = graphData.links ? graphData.links.length : 0;
  }

  return (
    <>
      <div className="pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 text-center p-4 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-[#667eea]">{totalUsers}</div>
            <div className="text-sm text-gray-600">Total Usuarios</div>
          </div>
          <div className="bg-white border border-gray-200 text-center p-4 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-[#667eea]">{maxLevel}</div>
            <div className="text-sm text-gray-600">Niveles</div>
          </div>
          <div className="bg-white border border-gray-200 text-center p-4 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-[#667eea]">{totalConnections}</div>
            <div className="text-sm text-gray-600">Conexiones</div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button 
          onClick={expandAll} 
          className="px-4 py-2 bg-[#667eea] hover:bg-[#5a6ad6] text-white rounded-md shadow-md"
        >
          Expandir Todo
        </button>
        <button 
          onClick={collapseAll} 
          className="px-4 py-2 bg-[#667eea] hover:bg-[#5a6ad6] text-white rounded-md shadow-md"
        >
          Colapsar Todo
        </button>
        <button 
          onClick={resetView} 
          className="px-4 py-2 bg-[#667eea] hover:bg-[#5a6ad6] text-white rounded-md shadow-md"
        >
          Restablecer Vista
        </button>
      </div>

      <div
        id="tree-container"
        className="w-full h-[600px] border-2 border-gray-200 rounded-lg overflow-hidden relative bg-gray-50"
      >
        <svg ref={svgRef} className="w-full h-full">
          <defs>
            <style>{`
              .node circle {
                cursor: pointer;
                stroke: #fff;
                stroke-width: 2px;
                transition: all 0.3s ease;
              }

              .node:hover circle {
                stroke-width: 4px;
                filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
              }

              .node text {
                font-size: 11px;
                font-weight: 500;
                fill: #333;
              }

              .link {
                fill: none;
                stroke: #999;
                stroke-width: 2px;
                stroke-opacity: 0.7;
              }
            `}</style>
          </defs>
        </svg>
        <div
          ref={tooltipRef}
          className="absolute bg-gray-800 text-white p-2 rounded-md text-xs pointer-events-none opacity-0 transition-opacity duration-200 z-50"
        ></div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-white" style={{ background: "#ff6b6b" }}></div>
          <span className="text-sm text-gray-700">Nivel 1-3</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-white" style={{ background: "#4ecdc4" }}></div>
          <span className="text-sm text-gray-700">Nivel 4-6</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-white" style={{ background: "#45b7d1" }}></div>
          <span className="text-sm text-gray-700">Nivel 7-9</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-white" style={{ background: "#96ceb4" }}></div>
          <span className="text-sm text-gray-700">Nivel 10+</span>
        </div>
      </div>
    </>
  );
} 