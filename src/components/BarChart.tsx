"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

interface BarChartProps {
  data: { keyword: string; count: number }[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 500 });
  const [tooltip, setTooltip] = useState<{ keyword: string; count: number } | null>(null);

  useEffect(() => {
    // Update dimensions on mount and resize
    const updateDimensions = () => {
      const width = window.innerWidth * 0.95; // Make it 95% of viewport width
      const height = window.innerHeight * 0.6; // Make it 60% of viewport height
      setDimensions({ width, height });
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 30, bottom: 100, left: 80 };

    svg.attr("width", width).attr("height", height);
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    // Set up scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.keyword))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count) || 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Add bars
    const bars = svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.keyword)!)
      .attr("y", (d) => y(d.count)!)
      .attr("height", (d) => y(0) - y(d.count)!)
      .attr("width", x.bandwidth())
      .attr("fill", "#69b3a2")
      .style("cursor", "pointer");

    // Mouse hover interaction
    bars
      .on("mouseover", (event, d) => {
        // Highlight bar
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("fill", "#ff7f0e");

        // Show tooltip
        setTooltip({ keyword: d.keyword, count: d.count });
      })
      .on("mouseout", (event) => {
        // Reset bar color
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("fill", "#69b3a2");

        // Hide tooltip
        setTooltip(null);
      });

    // Add X axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .text("Keywords");

    // Add Y axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .text("Count");

  }, [data, dimensions]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: `${dimensions.width / 2}px`,
            top: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            pointerEvents: "none",
          }}
        >
          <strong>{tooltip.keyword}</strong>: {tooltip.count}
        </div>
      )}
    </div>
  );
};
