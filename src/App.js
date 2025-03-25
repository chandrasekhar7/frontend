import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:5000/getPullRequests"; // Backend API

function App() {
  const [qaMetrics, setQaMetrics] = useState(null);
  const [prData, setPrData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPRDetails = () => {
    setLoading(true);
    setError(null);

    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched PR data:", data);
        setQaMetrics(data.qa_metrics);
        setPrData(data.pr_results || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching PRs:", error);
        setError(error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPRDetails();
  }, []);

  return (
    <div className="container">
      <h2>SonarQube PR Metrics</h2>

      {/* Button to fetch PR details manually */}
      <button onClick={fetchPRDetails} disabled={loading}>
        {loading ? "Fetching..." : "Refresh PR Data"}
      </button>

      {/* Show QA Branch Metrics */}
      {qaMetrics && (
        <div className="qa-metrics">
          <h3>QA Branch Metrics</h3>
          <table>
            <thead>
              <tr>
                <th>Security Issues</th>
                <th>Reliability Issues</th>
                <th>Maintainability Issues</th>
                <th>Coverage (%)</th>
                <th>Duplications (%)</th>
                <th>Security Hotspots</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{qaMetrics.bugs || "N/A"}</td>
                <td>{qaMetrics.vulnerabilities || "N/A"}</td>
                <td>{qaMetrics.code_smells || "N/A"}</td>
                <td>{qaMetrics.coverage || "N/A"}</td>
                <td>{qaMetrics.duplicated_lines_density || "N/A"}</td>
                <td>{qaMetrics.security_hotspots || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Show PR Metrics */}
      <table>
        <thead>
          <tr>
            <th>PR Key</th>
            <th>Branch</th>
            <th>Date</th>
            <th>Security Issues</th>
            <th>Reliability Issues</th>
            <th>Maintainability Issues</th>
            <th>Coverage (%)</th>
            <th>Duplications (%)</th>
            <th>Security Hotspots</th>
          </tr>
        </thead>
        <tbody>
          {prData.length === 0 ? (
            <tr>
              <td colSpan="8">No PR data available</td>
            </tr>
          ) : (
            prData.map((pr) => (
              <tr key={pr.pr_key}>
                <td>{pr.pr_key}</td>
                <td>{pr.branch}</td>
                <td>{pr.date}</td>
                <td>{pr.metrics.security_issues}</td>
                <td>{pr.metrics.reliability_issues}</td>
                <td>{pr.metrics.maintainability_issues}</td>
                <td>{pr.metrics.coverage}</td>
                <td>{pr.metrics.duplications}</td>
                <td>{pr.metrics.security_hotspots}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;
