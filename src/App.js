import React, { useState, useEffect } from "react";
import { Table, Button, Container, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Custom CSS

const API_URL = "http://127.0.0.1:5000/getPullRequests";

function App() {
  const [prData, setPrData] = useState({});
  const [qaMetrics, setQaMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchPRData = () => {
    setLoading(true);
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const groupedData = data.pr_results.reduce((acc, pr) => {
          const repo = pr.repository;
          if (!acc[repo]) acc[repo] = [];
          acc[repo].push(pr);
          return acc;
        }, {});

        setPrData(groupedData);
        setQaMetrics(data.qa_metrics || {});
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching PRs:", error);
        setLoading(false);
      });
  };

    // Fetch data initially and every 1 hour
    useEffect(() => {
      fetchPRData(); // Initial fetch
      const interval = setInterval(fetchPRData, 3600000); // 1 hour = 3600000ms
  
      return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-3">📊 SonarQube PR Metrics</h2>

      <div className="text-center mb-3">
        <Button className="fetch-btn" onClick={fetchPRData}>
          Fetch PR Data
        </Button>
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Loading...</p>
        </div>
      ) : (
        <>
          <h4 className="mt-4">✅ QA Branch Metrics</h4>
          <Table striped bordered hover className="metrics-table">
            <thead className="table-dark">
              <tr>
                <th>Repository</th>
                <th>Security Issues</th>
                <th>Reliability Issues</th>
                <th>Maintainability Issues</th>
                <th>Coverage (%)</th>
                <th>Duplications (%)</th>
                <th>Security Hotspots</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(qaMetrics).map(([repo, metrics]) => (
                <tr key={repo}>
                  <td>{repo}</td>
                  <td>{metrics.security_issues}</td>
                  <td>{metrics.reliability_issues}</td>
                  <td>{metrics.maintainability_issues}</td>
                  <td>{metrics.coverage}</td>
                  <td>{metrics.duplications}</td>
                  <td>{metrics.security_hotspots}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h4 className="mt-4">🚀 PR Metrics (Grouped by Repository)</h4>
          <Table striped bordered hover className="pr-table">
            <thead className="table-dark">
              <tr>
                <th>Repository</th>
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
              {Object.entries(prData).map(([repo, prs]) =>
                prs.length > 0 ? (
                  prs.map((pr, index) => (
                    <tr key={pr.pr_key}>
                      {index === 0 && <td rowSpan={prs.length}>{repo}</td>}
                      <td>{pr.pr_key}</td>
                      <td>{pr.branch}</td>
                      <td>{pr.date}</td>
                      <td>{pr.security_issues}</td>
                      <td>{pr.reliability_issues}</td>
                      <td>{pr.maintainability_issues}</td>
                      <td>{pr.coverage}</td>
                      <td>{pr.duplications}</td>
                      <td>{pr.security_hotspots}</td>
                    </tr>
                  ))
                ) : (
                  <tr key={repo}>
                    <td>{repo}</td>
                    <td colSpan="9">No PR data available</td>
                  </tr>
                )
              )}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
}

export default App;
