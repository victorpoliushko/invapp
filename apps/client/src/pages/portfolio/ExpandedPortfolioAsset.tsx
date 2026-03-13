import { PortfolioAssetDto } from "../../../../api/src/portfolios/dto/PortfolioAsset.dto";



export function ExpandedPortfolioAsset({ portfolioAsset }: { portfolioAsset: PortfolioAssetDto }) {
  const COLUMN_COUNT = 7;
  
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
                                  {s.assets.transactions?.map(
                                    (t) => {
                                      return (
                                        <React.Fragment key={s.assetId}>
                                          <tr>
                                            <td data-label="actions">
                                              <button
                                                onClick={() =>
                                                  onDeleteAsset(s.assetId)
                                                }
                                                title={`Remove ${s.assets.ticker}`}
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
                                            <td>{s.assets.ticker}</td>
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
  )
}