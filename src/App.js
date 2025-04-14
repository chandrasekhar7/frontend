import React, { useState, useEffect } from "react";
import { Table, Button, Container, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Custom CSS

const API_URL = "http://172.16.1.68:5000/getPullRequests";

function App() {
  const [prData, setPrData] = useState({});
  const [qaMetrics, setQaMetrics] = useState({});
  const [openPrs, setOpenPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [showAllPRs, setShowAllPRs] = useState(false);
  const [ageFilteredPrs, setAgeFilteredPrs] = useState([]);

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

        console.log("All PR Results:", data.pr_results);

        const filteredOpenPrs = data.pr_results.filter(
          (pr) => pr.pr_open_status !== "Merged"
        );
        setOpenPrs(filteredOpenPrs);

        const agedPRs = filteredOpenPrs.filter(
          (pr) => parseInt(pr.pr_open_status.replace(" days", "")) > 7
        );
        setAgeFilteredPrs(agedPRs);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching PRs:", error);
        setLoading(false);
      });
  };

  const exportToCSV = (prs, filename) => {
    const headers = Object.keys(prs[0] || {}).join(",");
    const rows = prs.map((pr) =>
      Object.values(pr).join(",")
    ).join("\n");

    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchPRData();
    const interval = setInterval(fetchPRData, 3600000);
    return () => clearInterval(interval);
  }, []);

  const handleRepoClick = (repo) => {
    setSelectedRepo(repo);
    setShowAllPRs(false);
  };

  const toggleShowAllPRs = () => {
    setShowAllPRs(!showAllPRs);
  };

  const getDisplayedPRs = () => {
    if (showAllPRs) {
      return Object.entries(prData).flatMap(([repo, prs]) => prs);
    }
    return selectedRepo ? prData[selectedRepo] || [] : [];
  };

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
                  onClick={() => handleRepoClick(repo)}
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

          <div className="text-center mb-4">
            <Button
              variant="success"
              onClick={() => exportToCSV(openPrs, "OpenPRs.csv")}
            >
              Export Open PRs to CSV
            </Button>
            <Button
              variant="warning"
              onClick={() => exportToCSV(ageFilteredPrs, "AgedPRs.csv")}
              className="ms-2"
            >
              Export PRs Older Than 7 Days
            </Button>
          </div>

          {selectedRepo || showAllPRs ? (
            <>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mt-4">
                  🚀 PR Metrics {showAllPRs ? "(All Repos)" : `for ${selectedRepo}`}
                </h4>
                <Button
                  variant="secondary"
                  onClick={toggleShowAllPRs}
                  className="mb-2"
                >
                  {showAllPRs ? "Show Selected Repo Only" : "Show All PRs"}
                </Button>
              </div>
              <Table
                striped
                bordered
                hover
                className="pr-table table-responsive"
                style={{ maxWidth: "800px", overflowX: "auto" }}
              >
                <thead className="table-dark">
                  <tr>
                    <th className="border-thick">PR Number</th>
                    <th className="border-thick">Repository</th>
                    <th className="border-thick">Author</th>
                    <th className="border-thick">Reviewers</th>
                    <th className="border-thick">Branch</th>
                    <th className="border-thick">Date</th>
                    <th className="border-thick">PR_Open_Status</th>
                    <th className="border-thick">Security Issues</th>
                    <th className="border-thick">Reliability Issues</th>
                    <th className="border-thick">Maintainability Issues</th>
                    <th className="border-thick">Coverage (%)</th>
                    <th className="border-thick">Duplications after Merge (%)</th>
                    <th className="border-thick">Security Hotspots</th>
                  </tr>
                </thead>
                <tbody>
                  {getDisplayedPRs().length > 0 ? (
                    getDisplayedPRs().map((pr) => (
                      <tr key={pr.pr_key} className="border-thick">
                        <td className="border-thick">
                          <a
                            href={pr.pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {pr.pr_key}
                          </a>
                        </td>
                        <td className="border-thick">{pr.repository}</td>
                        <td className="border-thick">{pr.author}</td>
                        <td className="border-thick">{pr.reviewers}</td>
                        <td className="border-thick">{pr.branch}</td>
                        <td className="border-thick">{pr.date}</td>
                        <td className="border-thick">{pr.pr_open_status}</td>
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
                      <td colSpan="13" className="text-center border-thick">
                        No PR data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </>
          ) : null}
        </>
      )}
    </Container>
  );
}

export default App;
