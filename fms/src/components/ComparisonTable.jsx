import React from "react";
import "../styles/ComparisonTable.css";

export default function ComparisonTable() {
  return (
    <div className="comparison-table">
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>Feature Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Starter</th>
            <th>Business</th>
            <th>Enterprise</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Track expenses</td>
            <td>✔️</td>
            <td>✔️</td>
            <td>✔️</td>
          </tr>
          <tr>
            <td>Send invoices</td>
            <td>✔️</td>
            <td>✔️</td>
            <td>✔️</td>
          </tr>
          <tr>
            <td>Advanced reports</td>
            <td>❌</td>
            <td>✔️</td>
            <td>✔️</td>
          </tr>
          <tr>
            <td>Team collaboration</td>
            <td>❌</td>
            <td>✔️</td>
            <td>✔️</td>
          </tr>
          <tr>
            <td>Custom integrations</td>
            <td>❌</td>
            <td>❌</td>
            <td>✔️</td>
          </tr>
          <tr>
            <td>Priority support</td>
            <td>❌</td>
            <td>❌</td>
            <td>✔️</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
