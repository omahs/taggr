import {
    HeadBar,
    Loading,
    ButtonWithLoading,
    timeAgo,
    token,
    userList,
    percentage,
    FileUploadInput,
    tokenBalance,
} from "./common";
import * as React from "react";
import { Content } from "./content";
import { HourGlass, NotFound } from "./icons";
import { PostFeed } from "./post_feed";

const REPO_RELEASE = "https://github.com/TaggrNetwork/taggr/releases/latest";
const REPO_COMMIT = "https://github.com/TaggrNetwork/taggr/commit";

export const Proposals = () => {
    const [currentMask, setCurrentMask] = React.useState(null);
    const [receiver, setReceiver] = React.useState(null);
    const [fundingAmount, setFundingAmount] = React.useState(0);
    const [binary, setBinary] = React.useState(null);
    const [commit, setCommit] = React.useState("");
    const [proposal, setProposal] = React.useState(null);
    const [description, setDescription] = React.useState("");

    return (
        <>
            <HeadBar
                title="Proposals"
                shareLink="proposals"
                menu={true}
                burgerTestId="proposals-burger-button"
                content={
                    <div className="row_container">
                        <button
                            className="max_width_col"
                            onClick={() => setCurrentMask("funding")}
                        >
                            FUNDING
                        </button>
                        <button
                            className="max_width_col"
                            onClick={() => setCurrentMask("reward")}
                        >
                            REWARD
                        </button>
                        <button
                            className="max_width_col"
                            onClick={() => setCurrentMask("release")}
                        >
                            RELEASE
                        </button>
                    </div>
                }
            />
            <div className="vertically_spaced">
                {currentMask == "reward" && (
                    <div className="spaced column_container monospace">
                        <div className="vcentered bottom_half_spaced">
                            RECEIVER
                            <input
                                type="text"
                                className="monospace left_spaced max_width_col"
                                onChange={async (ev) => {
                                    setReceiver(ev.target.value);
                                }}
                            />
                        </div>
                        <div className="bottom_half_spaced monospace">
                            DESCRIPTION
                        </div>
                        <textarea
                            className="monospace bottom_spaced"
                            rows={10}
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                        ></textarea>
                        {description && (
                            <Content
                                value={description}
                                preview={true}
                                classNameArg="bottom_spaced framed"
                            />
                        )}
                        <ButtonWithLoading
                            classNameArg="active"
                            onClick={async () => {
                                if (!description || !receiver) {
                                    alert("Error: incomplete data.");
                                    return;
                                }
                                let response = await api.call(
                                    "propose_reward",
                                    description,
                                    receiver,
                                );
                                if ("Err" in response) {
                                    alert(`Error: ${response.Err}`);
                                    return;
                                }
                                setCurrentMask(null);
                                setProposal(response.Ok);
                            }}
                            label="SUBMIT"
                        />
                    </div>
                )}
                {currentMask == "funding" && (
                    <div className="spaced column_container monospace">
                        <div className="vcentered bottom_half_spaced">
                            RECEIVER
                            <input
                                type="text"
                                className="monospace left_spaced max_width_col"
                                onChange={async (ev) => {
                                    setReceiver(ev.target.value);
                                }}
                            />
                        </div>
                        <div className="vcentered bottom_half_spaced">
                            TOKEN AMOUNT
                            <input
                                type="text"
                                className="monospace left_spaced max_width_col"
                                onChange={async (ev) => {
                                    setFundingAmount(ev.target.value);
                                }}
                            />
                        </div>
                        <div className="bottom_half_spaced monospace">
                            DESCRIPTION
                        </div>
                        <textarea
                            className="monospace bottom_spaced"
                            rows={10}
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                        ></textarea>
                        {description && (
                            <Content
                                value={description}
                                preview={true}
                                classNameArg="bottom_spaced framed"
                            />
                        )}
                        <ButtonWithLoading
                            classNameArg="active"
                            onClick={async () => {
                                if (
                                    !description ||
                                    !receiver ||
                                    !fundingAmount
                                ) {
                                    alert("Error: incomplete data.");
                                    return;
                                }
                                let response = await api.call(
                                    "propose_funding",
                                    description,
                                    receiver,
                                    parseInt(fundingAmount),
                                );
                                if ("Err" in response) {
                                    alert(`Error: ${response.Err}`);
                                    return;
                                }
                                setCurrentMask(null);
                                setProposal(response.Ok);
                            }}
                            label="SUBMIT"
                        />
                    </div>
                )}
                {currentMask == "release" && (
                    <div className="spaced column_container monospace">
                        <div className="vcentered bottom_half_spaced">
                            COMMIT
                            <input
                                type="text"
                                className="monospace left_spaced max_width_col"
                                onChange={async (ev) => {
                                    setCommit(ev.target.value);
                                }}
                            />
                        </div>
                        <div className="vcentered bottom_half_spaced">
                            BINARY{" "}
                            <FileUploadInput
                                classNameArg="monospace left_spaced max_width_col"
                                callback={setBinary}
                            />
                        </div>
                        <div className="bottom_half_spaced monospace">
                            DESCRIPTION
                        </div>
                        <textarea
                            className="monospace bottom_spaced"
                            rows={10}
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                        ></textarea>
                        {description && (
                            <Content
                                value={description}
                                preview={true}
                                classNameArg="bottom_spaced framed"
                            />
                        )}
                        <ButtonWithLoading
                            classNameArg="active"
                            onClick={async () => {
                                if (!description || !binary) {
                                    alert("Error: incomplete data.");
                                    return;
                                }
                                const response = await api.propose_release(
                                    description,
                                    commit,
                                    binary,
                                );
                                if ("Err" in response) {
                                    alert(`Error: ${response.Err}`);
                                    return;
                                }
                                setCurrentMask(null);
                                setProposal(response.Ok);
                            }}
                            label="SUBMIT"
                        />
                    </div>
                )}
            </div>
            <PostFeed
                heartbeat={proposal}
                feedLoader={async (page) => await api.query("proposals", page)}
            />
        </>
    );
};

export const Proposal = ({ id, postId }) => {
    const users = backendCache.users;
    const [proposal, setProposal] = React.useState(null);

    const loadState = async () => {
        const result = await api.query("proposal", id);
        if ("Err" in result) {
            setProposal(404);
        }
        setProposal(result.Ok);
        return result.Ok;
    };

    React.useEffect(() => {
        loadState();
    }, []);

    if (!proposal) return <Loading />;
    if (proposal == 404) return <NotFound />;

    const statusEmoji = (status) => {
        return (
            { OPEN: "✨", REJECTED: "🟥", CANCELLED: "❌", EXECUTED: "✅" }[
                status
            ] || <HourGlass />
        );
    };

    const vote = async (proposal, adopted) => {
        let data = "";
        if (adopted) {
            if ("Release" in proposal.payload) {
                data = prompt("Please enter the build hash:");
                if (!data) return;
            }
            if ("Reward" in proposal.payload) {
                data = prompt(
                    "Please enter the token amount which would be an appropriate reward for the efforts described:",
                );
                if (!data) return;
                if (
                    !confirm(
                        `You vote for issuing the reward of ${data} tokens.`,
                    )
                )
                    return;
            }
        }
        const result = await api.call(
            "vote_on_proposal",
            proposal.id,
            adopted,
            data,
        );
        if ("Err" in result) {
            alert(`Error: ${result.Err}`);
            return;
        }
        api.call("toggle_following_post", postId);
        await loadState();
    };

    const voted =
        !api._user ||
        proposal.bulletins.some((vote) => api._user.id == vote[0]);
    const adopted = proposal.bulletins.reduce(
        (acc, [_, adopted, votes]) => (adopted ? acc + votes : acc),
        0,
    );
    const rejected = proposal.bulletins.reduce(
        (acc, [_, adopted, votes]) => (!adopted ? acc + votes : acc),
        0,
    );
    const open = proposal.status == "Open";
    const commit = proposal.payload.Release
        ? chunks(proposal.payload.Release.commit).join(" ")
        : null;
    const hash = proposal.payload.Release
        ? chunks(proposal.payload.Release.hash).join(" ")
        : null;
    const dailyDrop = proposal.voting_power / 100;
    const t = backendCache.config.proposal_approval_threshold;
    const days = Math.ceil(
        (proposal.voting_power -
            (adopted > rejected ? adopted / t : rejected / (100 - t)) * 100) /
            dailyDrop,
    );
    const propStatus = proposal.status.toUpperCase();
    return (
        <div
            key={proposal.timestamp}
            className="post_extension column_container monospace"
        >
            <div className="bottom_half_spaced">ID: {proposal.id}</div>
            <div className="bottom_half_spaced">
                TYPE: {Object.keys(proposal.payload)[0].toUpperCase()}
            </div>
            <div className="bottom_half_spaced">
                PROPOSER:{" "}
                <a href={`#/user/${proposal.proposer}`}>{`@${
                    users[proposal.proposer]
                }`}</a>
            </div>
            <div className="bottom_half_spaced">
                CREATED: {timeAgo(proposal.timestamp)}
            </div>
            <div className="bottom_spaced">
                STATUS: {statusEmoji(propStatus)}{" "}
                <span className={open ? "accent" : null}>{propStatus}</span>
            </div>
            {!!proposal.payload.Release && (
                <div className="monospace bottom_spaced">
                    {commit && (
                        <div className="row_container bottom_half_spaced">
                            COMMIT:
                            <a
                                className="monospace left_spaced"
                                href={
                                    open
                                        ? REPO_RELEASE
                                        : `${REPO_COMMIT}/${proposal.payload.Release.commit}`
                                }
                            >
                                {commit}
                            </a>
                        </div>
                    )}
                    {!open && (
                        <div className="row_container">
                            <span>HASH:</span>
                            <code className="left_spaced monospace">
                                {hash}
                            </code>
                        </div>
                    )}
                </div>
            )}
            {!!proposal.payload.Reward && (
                <>
                    <div className="bottom_half_spaced">
                        RECEIVER:{" "}
                        <code>{proposal.payload.Reward.receiver}</code>
                    </div>
                    {proposal.status == "Executed" && (
                        <div className="bottom_spaced">
                            TOKENS MINTED:{" "}
                            {tokenBalance(proposal.payload.Reward.minted)}
                        </div>
                    )}
                </>
            )}
            {!!proposal.payload.Fund && (
                <>
                    <div className="bottom_half_spaced">
                        RECEIVER: <code>{proposal.payload.Fund[0]}</code>
                    </div>
                    <div className="bottom_spaced">
                        AMOUNT: {tokenBalance(proposal.payload.Fund[1])}
                    </div>
                </>
            )}
            <div className="bottom_spaced">
                EFFECTIVE VOTING POWER: {token(proposal.voting_power)}
            </div>
            {open && !isNaN(days) && (
                <div className="bottom_spaced">
                    EXECUTION DEADLINE: {days} DAYS
                </div>
            )}
            <div className="bottom_spaced">
                <div className="bottom_half_spaced">
                    ACCEPTED:{" "}
                    <b className={adopted > rejected && open ? "accent" : null}>
                        {token(adopted)}
                    </b>{" "}
                    ({percentage(adopted, proposal.voting_power)})
                </div>
                <div className="small_text">
                    {users &&
                        userList(
                            proposal.bulletins
                                .filter((vote) => vote[1])
                                .map((vote) => vote[0]),
                        )}
                </div>
            </div>
            <div className="bottom_spaced">
                <div className="bottom_half_spaced">
                    REJECTED:{" "}
                    <b className={adopted < rejected && open ? "accent" : null}>
                        {token(rejected)}
                    </b>{" "}
                    ({percentage(rejected, proposal.voting_power)})
                </div>
                <div className="small_text">
                    {users &&
                        userList(
                            proposal.bulletins
                                .filter((vote) => !vote[1])
                                .map((vote) => vote[0]),
                        )}
                </div>
            </div>
            {api._user && open && !voted && (
                <>
                    <div className="row_container">
                        <ButtonWithLoading
                            onClick={() => vote(proposal, false)}
                            classNameArg="max_width_col large_text"
                            label="REJECT"
                        />
                        <ButtonWithLoading
                            onClick={() => vote(proposal, true)}
                            classNameArg="max_width_col large_text"
                            label="ACCEPT"
                        />
                    </div>
                </>
            )}
            {api._user && api._user.id == proposal.proposer && open && (
                <ButtonWithLoading
                    onClick={async () => {
                        if (!confirm("Do you want to cancel your proposal?"))
                            return;
                        await api.call("cancel_proposal", proposal.id);
                        location.reload();
                    }}
                    classNameArg="top_spaced max_width_col large_text"
                    label="CANCEL"
                />
            )}
        </div>
    );
};

const chunks = (s) => (s ? [s.slice(0, 8)].concat(chunks(s.slice(8))) : []);
