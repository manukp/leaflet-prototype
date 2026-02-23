import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useAppContext } from '../../context/AppContext';
import type { Individual, IndividualRole, RelationshipType } from '../../types';
import './NetworkGraph.css';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  role: IndividualRole;
  individual: Individual;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  relationshipType: RelationshipType;
}

type NodeSelection = d3.Selection<SVGGElement, GraphNode, SVGGElement, unknown>;

const roleColors: Record<IndividualRole, string> = {
  suspect: '#e74c3c',
  witness: '#3498db',
  victim: '#1abc9c',
  person_of_interest: '#f39c12',
  informant: '#9b59b6',
  law_enforcement: '#2ecc71'
};

const relationshipColors: Record<RelationshipType, string> = {
  'suspect-victim': '#e74c3c',
  'witness-suspect': '#3498db',
  'witness-victim': '#1abc9c',
  associate: '#f39c12',
  family: '#9b59b6',
  'employer-employee': '#95a5a6',
  business_partner: '#e67e22',
  known_contact: '#7f8c8d'
};

export function NetworkGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const {
    visibleIndividuals,
    relationships,
    panToIndividual,
    loading
  } = useAppContext();

  // Update dimensions on resize using ResizeObserver for reliable initial render
  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;

    const updateDimensions = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    };

    // Use ResizeObserver for reliable dimension detection
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(container);

    // Also trigger on window resize as fallback
    window.addEventListener('resize', updateDimensions);

    // Initial measurement with requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const showTooltip = useCallback((event: MouseEvent, content: string) => {
    if (!tooltipRef.current) return;
    tooltipRef.current.innerHTML = content;
    tooltipRef.current.style.display = 'block';
    tooltipRef.current.style.left = `${event.pageX + 10}px`;
    tooltipRef.current.style.top = `${event.pageY + 10}px`;
  }, []);

  const hideTooltip = useCallback(() => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.display = 'none';
  }, []);

  // Build and render the graph
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0 || loading) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create graph data from visible individuals
    const visibleIds = new Set(visibleIndividuals.map(i => i.id));

    const nodes: GraphNode[] = visibleIndividuals.map(ind => ({
      id: ind.id,
      name: ind.name,
      role: ind.role,
      individual: ind
    }));

    const links: GraphLink[] = relationships
      .filter(rel =>
        visibleIds.has(rel.sourceIndividualId) && visibleIds.has(rel.targetIndividualId)
      )
      .map(rel => ({
        id: rel.id,
        source: rel.sourceIndividualId,
        target: rel.targetIndividualId,
        relationshipType: rel.relationshipType
      }));

    if (nodes.length === 0) {
      svg.append('text')
        .attr('x', dimensions.width / 2)
        .attr('y', dimensions.height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#888')
        .text('No individuals in visible map area');
      return;
    }

    // Create simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id(d => d.id)
        .distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create container group for zoom
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => relationshipColors[d.relationshipType])
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('stroke-width', 4);
        const rel = relationships.find(r => r.id === d.id);
        showTooltip(event, `
          <strong>${d.relationshipType.replace(/-/g, ' → ')}</strong>
          ${rel?.description ? `<br/>${rel.description}` : ''}
        `);
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 2);
        hideTooltip();
      });

    // Drag behavior
    const dragBehavior = d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    // Draw nodes
    const node: NodeSelection = g.append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(dragBehavior);

    // Node circles
    node.append('circle')
      .attr('r', 16)
      .attr('fill', d => roleColors[d.role])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Node labels
    node.append('text')
      .text(d => d.name.split(' ')[0])
      .attr('dy', 30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#eee')
      .attr('font-size', '11px');

    // Node interactions
    node
      .on('mouseover', function(event, d) {
        d3.select(this).select('circle')
          .attr('stroke-width', 4)
          .attr('r', 20);
        showTooltip(event, `
          <strong>${d.name}</strong><br/>
          Role: ${d.role.replace(/_/g, ' ')}<br/>
          ${d.individual.alias ? `Alias: ${d.individual.alias}<br/>` : ''}
          ${d.individual.description}<br/>
          <em>Click to pan map to location</em>
        `);
      })
      .on('mouseout', function() {
        d3.select(this).select('circle')
          .attr('stroke-width', 2)
          .attr('r', 16);
        hideTooltip();
      })
      .on('click', (_, d) => {
        panToIndividual(d.id);
      });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [visibleIndividuals, relationships, dimensions, loading, panToIndividual, showTooltip, hideTooltip]);

  if (loading) {
    return <div className="network-loading">Loading network data...</div>;
  }

  return (
    <div className="network-graph">
      <div className="network-header">
        <h3>Network Graph</h3>
        <span className="node-count">{visibleIndividuals.length} individuals</span>
      </div>
      <div className="graph-container">
        <svg ref={svgRef} width="100%" height="100%" />
      </div>
      <div ref={tooltipRef} className="graph-tooltip" />
      <div className="legend">
        <div className="legend-section">
          <span className="legend-title">Roles:</span>
          {(Object.entries(roleColors) as [IndividualRole, string][]).map(([role, color]) => (
            <span key={role} className="legend-item">
              <span className="legend-dot" style={{ background: color }} />
              {role.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
