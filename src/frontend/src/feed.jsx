import * as React from "react";
import { currentRealm, HeadBar, setTitle } from "./common";
import { ToggleButton } from "./common";
import { PostFeed } from "./post_feed";

const userId = (handle) => {
    const users = window.backendCache.users;
    const username = handle.replace("@", "").toLowerCase();
    for (const i in users) {
        if (users[i].toLowerCase() == username) return parseInt(i);
    }
};

export const Feed = ({ params }) => {
    const [filter, setFilter] = React.useState(params);
    React.useEffect(() => setFilter(params), [params]);
    return (
        <div className="column_container">
            <FeedBar params={params} callback={setFilter} />
            <PostFeed
                feedLoader={async (page) => {
                    const tags = [],
                        users = [];
                    filter.forEach((token) => {
                        if (token.startsWith("@")) users.push(userId(token));
                        else tags.push(token);
                    });
                    return await api.query(
                        "posts_by_tags",
                        currentRealm(),
                        tags,
                        users,
                        page,
                    );
                }}
                heartbeat={filter + params}
            />
        </div>
    );
};

const FeedExtender = ({ filterVal, setFilterVal, refilter, filter }) => {
    const [extending, setExtending] = React.useState(false);
    return (
        <div className="top_half_spaced row_container flex_ended">
            {extending && (
                <div className="row_container max_width_col">
                    <input
                        type="text"
                        className="medium_text max_width_col"
                        vlaue={filterVal}
                        onChange={(e) => setFilterVal(e.target.value)}
                        placeholder="Enter @user or #tag"
                    />
                    <button
                        className="right_half_spaced"
                        onClick={() => {
                            refilter();
                            setExtending(false);
                        }}
                    >
                        DONE
                    </button>
                </div>
            )}
            {!extending && (
                <button
                    className="max_width_col right_half_spaced"
                    onClick={() => setExtending(!extending)}
                >
                    EXTEND
                </button>
            )}
            {!extending && api._user && (
                <ToggleButton
                    classNameArg="max_width_col left_half_spaced"
                    currState={() => contains(api._user.feeds, filter)}
                    toggler={() =>
                        api
                            .call("toggle_following_feed", filter)
                            .then(api._reloadUser)
                    }
                />
            )}
        </div>
    );
};

const FeedBar = ({ params, callback }) => {
    const [filter, setFilter] = React.useState(params);
    const [filterVal, setFilterVal] = React.useState("");

    React.useEffect(() => setFilter(params), [params]);

    const refilter = () => {
        // we need to create a new array for react to notice
        const newFilter = filter.map((val) => val);
        newFilter.push(filterVal.replace("#", ""));
        setFilterVal("");
        setFilter(newFilter);
        callback(newFilter);
    };

    const renderToken = (token) =>
        token.startsWith("@") ? (
            <a
                key={token}
                className="tag"
                href={`#/user/${token.replace("@", "")}`}
            >
                {token}
            </a>
        ) : (
            <a key={token} className="tag" href={`#/feed/${token}`}>
                #{token}
            </a>
        );

    filter.sort();
    setTitle(`feed: ${filter.join(" + ")}`);
    return (
        <HeadBar
            title={filter
                .map(renderToken)
                .reduce((prev, curr) => [prev, " + ", curr])}
            shareLink={`feed/${filter.join("+")}`}
            shareTitle={`Hash-tag feed on ${backendCache.name}`}
            content={
                <FeedExtender
                    filterVal={filterVal}
                    setFilterVal={setFilterVal}
                    filter={filter}
                    refilter={refilter}
                />
            }
            menu={true}
        />
    );
};

const contains = (feeds, filter) => {
    filter = filter.map((t) => t.toLowerCase());
    OUTER: for (let i in feeds) {
        const feed = feeds[i];
        if (feed.length != filter.length) continue;
        for (let j in feed) {
            const tag = feed[j];
            if (!filter.includes(tag)) continue OUTER;
        }
        return true;
    }
    return false;
};
