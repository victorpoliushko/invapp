import { useParams } from "react-router-dom";
import "../../App.css";
import "./PortfolioPage.css";
import { useState } from "react";

export default function PortfolioPage() {
  const params = useParams<{ portfolioId: string }>();

  const [selectedTab, setSelectedTab] = useState("tab-stocks");
  return (
    <>
      <section className="assets-section section-container">
        <div className="assets">
          <input
            type="radio"
            name="tabs"
            id="tab-stocks"
            checked={selectedTab === "tab-stocks"}
            onChange={() => setSelectedTab("tab-stocks")}
          />
          <label htmlFor="tab-stocks">Stocks</label>
          <div className="tab">
            <table>
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Account">Visa - 3412</td>
                  <td data-label="Due Date">04/01/2016</td>
                  <td data-label="Amount">$1,190</td>
                  <td data-label="Period">03/01/2016 - 03/31/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Account">
                    Visa - 6076
                  </td>
                  <td data-label="Due Date">03/01/2016</td>
                  <td data-label="Amount">$2,443</td>
                  <td data-label="Period">02/01/2016 - 02/29/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Account">
                    Corporate AMEX
                  </td>
                  <td data-label="Due Date">03/01/2016</td>
                  <td data-label="Amount">$1,181</td>
                  <td data-label="Period">02/01/2016 - 02/29/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Acount">
                    Visa - 3412
                  </td>
                  <td data-label="Due Date">02/01/2016</td>
                  <td data-label="Amount">$842</td>
                  <td data-label="Period">01/01/2016 - 01/31/2016</td>
                </tr>
              </tbody>
            </table>
          </div>

          <input
            type="radio"
            name="tabs"
            id="tab-bonds"
            onChange={() => setSelectedTab("tab-bonds")}
            checked={selectedTab === "tab-bonds"}
          />
          <label htmlFor="tab-bonds">Bonds</label>
          <div className="tab">
            <table>
              <thead>
                <tr>
                  <th scope="col">Account</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Account">Bond - 3412</td>
                  <td data-label="Due Date">04/01/2016</td>
                  <td data-label="Amount">$1,190</td>
                  <td data-label="Period">03/01/2016 - 03/31/2016</td>
                </tr>
                <tr>
                  <td scope="row" data-label="Account">
                    Bond - 6076
                  </td>
                  <td data-label="Due Date">03/01/2016</td>
                  <td data-label="Amount">$2,443</td>
                  <td data-label="Period">02/01/2016 - 02/29/2016</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="gains-section section-container"></section>
    </>
  );
}
