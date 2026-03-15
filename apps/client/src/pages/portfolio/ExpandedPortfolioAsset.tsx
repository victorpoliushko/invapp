import React from "react";
import { PortfolioAssetDto } from "../../../../api/src/portfolios/dto/PortfolioAsset.dto";
import editIcon from "../../assets/pencil-svgrepo-com.svg";
import { useParams } from "react-router-dom";
import { fetchPortfolio } from "../../api";
import { useFetchWithRedirect } from "../../hooks/useApiWithRedirect";
import deleteIcon from "../../assets/delete-svgrepo-com.svg";

export function ExpandedPortfolioAsset({
  portfolioAsset,
  setPortfolio,
  setLoadingPrices
}: {
  portfolioAsset: PortfolioAssetDto;
  setPortfolio: any;
  setLoadingPrices: any;
}) {
  const COLUMN_COUNT = 7;
  const params = useParams<{ id: string }>();
    const fetchWithRedirect = useFetchWithRedirect();
  
  const loadPortfolioData = async (portfolioId?: string) => {
    if (!portfolioId) return;

    const portfolioData = await fetchPortfolio(portfolioId);
    setPortfolio(portfolioData);

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (const asset of portfolioData.portfolioAssets) {
      try {
        setLoadingPrices((prev) => ({ ...prev, [asset.assetId]: true }));
        const token = localStorage.getItem("accessToken");

        const response = await fetchWithRedirect(
          `http://localhost:5173/api/assets/test-finnhub?symbol=${asset.assets.ticker}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch price");

        const data = await response.json();

        setPortfolio((prev) => {
          if (!prev) return prev;

          const updatedAssets = prev.portfolioAssets.map((a) =>
            a.assetId === asset.assetId
              ? { ...a, currentPrice: data.c || data.result?.[0]?.description }
              : a,
          );
          return {
            ...prev,
            portfolioAssets: updatedAssets,
          };
        });

      } catch (err) {
        console.error(`Failed to fetch price for ${asset.assets.ticker}`, err);
      } finally {
        setLoadingPrices((prev) => ({ ...prev, [asset.assetId]: false }));
      }

      await delay(12500);
    }
  };
    const onDeleteTransaction = async (
    id: string
  ) => {
    const token = localStorage.getItem("accessToken");

    try {
      const res = await fetch(`/api/transactions`, {
        method: "DELETE",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      await loadPortfolioData(params.id);
    } catch (error) {
      alert("Could not delete transaction");
    }
  };

  return (
    <tr className="detail-row">
      <td colSpan={COLUMN_COUNT + 1}>
        <div>
          <table>
            <thead>
              <tr>
                {/* <th></th> */}
                <th scope="col">Transactions</th>
                <th scope="col">Type</th>
                <th scope="col">Asset</th>
                <th scope="col">Date</th>
                <th scope="col">Quantity</th>
                <th scope="col">Price change</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolioAsset.assets.transactions?.map(
                (t) => {
                  return (
                    <React.Fragment key={portfolioAsset.assetId}>
                      <tr>
                        <td data-label="actions">
                          <button
                            // onClick={() =>
                            //   onDeleteAsset(portfolioAsset.assetId)
                            // }
                            title={`Remove ${portfolioAsset.assets.ticker}`}
                          >
                            <img
                              className="edit-icon"
                              src={editIcon}
                              alt="edit-icon"
                              height={30}
                              width={30}
                            />
                          </button>
                        </td>
                        <td>{t.type}</td>
                        <td>{portfolioAsset.assets.ticker}</td>
                        <td>{t.date}</td>
                        <td>{t.quantityChange}</td>
                        <td>{t.pricePerUnit}</td>
                        <td data-label="actions">
                          <button
                            onClick={() => onDeleteTransaction(t.id)}
                            title={`Remove transaction ${t.id}`}
                          >
                            <img
                              className="delete-icon"
                              src={deleteIcon}
                              alt="delete-icon"
                              height={30}
                              width={30}
                            />
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                },
                // (
                // <React.Fragment key={s.assetId}>
                //   <tr>
                //     <td data-label="actions">
                //       <button
                //         onClick={() =>
                //           onDeleteAsset(s.assetId)
                //         }
                //         title={`Remove ${s.assets.ticker}`}
                //       >
                //         <img
                //           className="edit-icon"
                //           src={editIcon}
                //           alt="edit-icon"
                //           height={30}
                //           width={30}
                //         />
                //       </button>
                //     </td>
                //     <td>{t.type}</td>
                //     <td>{t.asset.ticker}</td>
                //     <td>{t.date}</td>
                //     <td>{t.quantityChange}</td>
                //     <td>{t.pricePerUnit}</td>
                //     <td data-label="actions">
                //       <button
                //         onClick={() =>
                //           onDeleteAsset(s.assetId)
                //         }
                //         title={`Remove ${s.assets.ticker}`}
                //       >
                //         <img
                //           className="delete-icon"
                //           src={deleteIcon}
                //           alt="delete-icon"
                //           height={30}
                //           width={30}
                //         />
                //       </button>
                //     </td>
                //   </tr>
                // </React.Fragment>
                // )
              )}

              {/* <tr>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="edit-icon"
                                          src={editIcon}
                                          alt="edit-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                    <td>VOO</td>
                                    <td>2025-11-24</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="delete-icon"
                                          src={deleteIcon}
                                          alt="delete-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="edit-icon"
                                          src={editIcon}
                                          alt="edit-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                    <td>VOO</td>
                                    <td>2025-11-24</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="delete-icon"
                                          src={deleteIcon}
                                          alt="delete-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="edit-icon"
                                          src={editIcon}
                                          alt="edit-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                    <td>VOO</td>
                                    <td>2025-11-24</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td>+15.00%</td>
                                    <td data-label="actions">
                                      <button
                                        onClick={() => onDeleteAsset(s.assetId)}
                                        title={`Remove ${s.assets.asset}`}
                                      >
                                        <img
                                          className="delete-icon"
                                          src={deleteIcon}
                                          alt="delete-icon"
                                          height={30}
                                          width={30}
                                        />
                                      </button>
                                    </td>
                                  </tr> */}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}
