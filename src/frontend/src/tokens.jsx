import {
    bigScreen,
    ButtonWithLoading,
    CopyToClipboard,
    HeadBar,
    Loading,
    NotFound,
    percentage,
    timeAgo,
    token,
    tokenBalance,
    UserLink,
} from "./common";
import * as React from "react";

export const Tokens = () => {
    const [balances, setBalances] = React.useState([]);
    const [term, setTerm] = React.useState("");
    const [noMoreData, setNoMoreData] = React.useState(false);
    const [transactions, setTransactions] = React.useState([]);
    const [txPage, setTxPage] = React.useState(0);
    const [balPage, setBalPage] = React.useState(0);
    const [holder, setHolder] = React.useState(-1);

    const loadState = async () =>
        await Promise.all([loadBalances(), loadTransactions()]);

    const loadBalances = async () => {
        const balances = await window.api.query("balances");
        balances.sort((a, b) => parseInt(b[1]) - parseInt(a[1]));
        setBalances(balances);
    };

    const loadTransactions = async () => {
        const txs = await window.api.query(
            "transactions",
            txPage,
            userToPrincipal[term.toLowerCase()] || term,
        );
        if (txs.length == 0) {
            setNoMoreData(true);
        }
        setTransactions(term && txPage == 0 ? txs : transactions.concat(txs));
    };

    React.useEffect(() => {
        loadState();
    }, []);
    React.useEffect(() => {
        loadTransactions();
    }, [txPage]);

    const mintedSupply = balances.reduce((acc, balance) => acc + balance[1], 0);
    const userToPrincipal = balances.reduce((acc, balance) => {
        const userName = backendCache.users[balance[2]];
        if (userName) acc[userName.toLowerCase()] = balance[0];
        return acc;
    }, {});
    const { total_supply, proposal_approval_threshold } = backendCache.config;

    return (
        <>
            <HeadBar title="Tokens" shareLink="tokens" />
            {balances.length == 0 && <Loading />}
            {balances.length > 0 && (
                <div className="spaced">
                    <div className="dynamic_table monospace vertically_spaced">
                        <div className="db_cell">
                            MINTED<code>{token(mintedSupply)}</code>
                        </div>
                        <div className="db_cell">
                            TOTAL<code>{token(total_supply)}</code>
                        </div>
                        <div className="db_cell">
                            MINTING RATIO
                            <code>
                                {1 <<
                                    Math.floor(
                                        (10 * mintedSupply) / total_supply,
                                    )}
                                :1
                            </code>
                        </div>
                        <div className="db_cell">
                            APPROVAL THRESHOLD
                            <code>{proposal_approval_threshold}%</code>
                        </div>
                    </div>
                    <h2>Top 100 token holders</h2>
                    <div className="row_container bottom_spaced">
                        {balances.slice(0, 100).map((b) => (
                            <div
                                key={b[0]}
                                style={{
                                    height: "5em",
                                    width: percentage(b[1], mintedSupply),
                                    background:
                                        holder == b[2]
                                            ? "white"
                                            : genColor(b[0]),
                                }}
                                onMouseOver={() => setHolder(b[2])}
                                onClick={() => setHolder(b[2])}
                            ></div>
                        ))}
                    </div>
                    Holder: {holder < 0 ? "none" : <UserLink id={holder} />}
                    <hr />
                    <h2>Balances</h2>
                    <table style={{ width: "100%" }}>
                        <thead className={bigScreen() ? null : "small_text"}>
                            <tr>
                                <th style={{ textAlign: "left" }}>Principal</th>
                                <th style={{ textAlign: "right" }}>Balance</th>
                                <th style={{ textAlign: "right" }}>Share</th>
                                <th style={{ textAlign: "right" }}>User</th>
                            </tr>
                        </thead>
                        <tbody
                            style={{ textAlign: "right" }}
                            className={`monospace ${
                                bigScreen() ? null : "small_text"
                            }`}
                        >
                            {balances.slice(0, (balPage + 1) * 15).map((b) => (
                                <tr key={b[0]}>
                                    <td style={{ textAlign: "left" }}>
                                        {principal(b[0])}
                                    </td>
                                    <td>{token(b[1])}</td>
                                    <td>{percentage(b[1], mintedSupply)}</td>
                                    <td>
                                        <UserLink id={b[2]} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <ButtonWithLoading
                            classNameArg="active"
                            onClick={() => setBalPage(balPage + 1)}
                            label="MORE"
                        />
                    </div>
                    <hr />
                    <h2>Latest transactions</h2>
                    <div className="row_container">
                        <input
                            id="search_field"
                            className="monospace max_width_col"
                            type="search"
                            placeholder="Principal or username"
                            value={term}
                            onChange={(event) => setTerm(event.target.value)}
                        />
                        <button
                            className="active"
                            onClick={async () => {
                                setTxPage(0);
                                await loadTransactions();
                            }}
                        >
                            SEARCH
                        </button>
                    </div>
                    <Transactions transactions={transactions} />
                    {!noMoreData && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <ButtonWithLoading
                                classNameArg="active"
                                onClick={() => setTxPage(txPage + 1)}
                                label="MORE"
                            />
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export const Transaction = ({ id }) => {
    const [tx, setTransaction] = React.useState(null);
    React.useEffect(() => {
        api.query("transaction", id).then((result) =>
            setTransaction("Err" in result ? 404 : result.Ok),
        );
    }, []);
    if (!tx) return <Loading />;
    if (tx == 404) return <NotFound />;
    return (
        <div className="spaced">
            <HeadBar
                title={`Transaction #${id}`}
                shareLink={`transaction/${id}`}
            />
            <div className="monospace">
                <div className="bottom_spaced">
                    TIMESTAMP:{" "}
                    <code>
                        {new Date(
                            parseInt(tx.timestamp) / 1000000,
                        ).toLocaleString()}
                    </code>
                </div>
                <div className="bottom_spaced">
                    FROM:{" "}
                    <code>
                        <CopyToClipboard
                            value={tx.from.owner}
                            displayMap={(v) =>
                                bigScreen() ? v : v.split("-")[0]
                            }
                        />
                    </code>
                </div>
                <div className="bottom_spaced">
                    TO:{" "}
                    <code>
                        <CopyToClipboard
                            value={tx.to.owner}
                            displayMap={(v) =>
                                bigScreen() ? v : v.split("-")[0]
                            }
                        />
                    </code>
                </div>
                <div className="bottom_spaced">
                    AMOUNT: <code>{tokenBalance(tx.amount)}</code>
                </div>
                <div className="bottom_spaced">
                    FEE: <code>{tokenBalance(tx.fee)}</code>
                </div>
                <>
                    MEMO: <code>{JSON.stringify(tx.memo)}</code>
                </>
            </div>
        </div>
    );
};

export const Transactions = ({ transactions }) => (
    <table style={{ width: "100%" }}>
        <thead
            style={{ textAlign: "right" }}
            className={bigScreen() ? null : "small_text"}
        >
            <tr>
                <th style={{ textAlign: "left" }}>ID</th>
                <th style={{ textAlign: "left" }}>Time</th>
                <th style={{ textAlign: "center" }}>From</th>
                <th style={{ textAlign: "center" }}>To</th>
                <th>#</th>
            </tr>
        </thead>
        <tbody
            style={{ textAlign: "right" }}
            className={`monospace ${bigScreen() ? null : "small_text"}`}
        >
            {transactions.map(([id, t]) => (
                <tr key={JSON.stringify(t)}>
                    <td style={{ textAlign: "left" }}>
                        <a href={`#/transaction/${id}`}>{id}</a>
                    </td>
                    <td style={{ textAlign: "left" }}>
                        {timeAgo(t.timestamp)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                        {format(t.from.owner)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                        {format(t.to.owner)}
                    </td>
                    <td>{tokenBalance(t.amount)}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const format = (acc) => (acc == "2vxsx-fae" ? "🌱" : principal(acc));

const principal = (p) => (
    <CopyToClipboard value={p} displayMap={(id) => id.split("-")[0]} />
);

const genColor = (val) => {
    let hash = 0;
    for (let i = 0; i < val.length; i++) {
        hash = val.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xff;
        color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
};
