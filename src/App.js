import React, { useState, useEffect } from "react";
import { Table, Button, Container, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Custom CSS

const API_URL = "http://127.0.0.1:5000/getPullRequests";

function App() {
  const [prData, setPrData] = useState({});
  const [qaMetrics, setQaMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState(null);

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
                <th className="border-thick">Repository</th>
                <th className="border-thick">Security Issues</th>
                <th className="border-thick">Reliability Issues</th>
                <th className="border-thick">Maintainability Issues</th>
                <th className="border-thick">Coverage (%)</th>
                <th className="border-thick">Duplications (%)</th>
                <th className="border-thick">Security Hotspots</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(qaMetrics).map(([repo, metrics]) => (
                <tr 
                  key={repo} 
                  onClick={() => setSelectedRepo(repo)} 
                  style={{ cursor: "pointer" }} 
                  className="repository-row border-thick"
                >
                  <td className="repository-cell border-thick">{repo}</td>
                  <td className="border-thick">{metrics.security_issues}</td>
                  <td className="border-thick">{metrics.reliability_issues}</td>
                  <td className="border-thick">{metrics.maintainability_issues}</td>
                  <td className="border-thick">{metrics.coverage}</td>
                  <td className="border-thick">{metrics.duplications}</td>
                  <td className="border-thick">{metrics.security_hotspots}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {selectedRepo && (
            <>
            <br />
              <h4 className="mt-4">🚀 PR Metrics for {selectedRepo}</h4>
              <Table striped bordered hover className="pr-table">
                <thead className="table-dark">
                  <tr>
                    <th className="border-thick">PR Key</th>
                    <th className="border-thick">Author</th>
                    <th className="border-thick">Branch</th>
                    <th className="border-thick">Date</th>
                    <th className="border-thick">Security Issues</th>
                    <th className="border-thick">Reliability Issues</th>
                    <th className="border-thick">Maintainability Issues</th>
                    <th className="border-thick">Coverage (%)</th>
                    <th className="border-thick">Duplications (%)</th>
                    <th className="border-thick">Security Hotspots</th>
                  </tr>
                </thead>
                <tbody>
                  {prData[selectedRepo]?.length > 0 ? (
                    prData[selectedRepo].map((pr) => (
                      <tr key={pr.pr_key} className="border-thick">
                        <td className="border-thick">
                          <a href={pr.pr_url} target="_blank" rel="noopener noreferrer">
                            {pr.pr_key}
                          </a>
                        </td>
                        <td className="border-thick">{pr.author}</td>
                        <td className="border-thick">{pr.branch}</td>
                        <td className="border-thick">{pr.date}</td>
                        <td className="border-thick">{pr.security_issues}</td>
                        <td className="border-thick">{pr.reliability_issues}</td>
                        <td className="border-thick">{pr.maintainability_issues}</td>
                        <td className="border-thick">{pr.coverage}</td>
                        <td className="border-thick">{pr.duplications}</td>
                        <td className="border-thick">{pr.security_hotspots}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-thick">
                      <td colSpan="9" className="text-center border-thick">
                        No PR data available for {selectedRepo}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </>
          )}
        </>
      )}
    </Container>
  );
}

export default App;
