import React from 'react';

const User = ({ username, email, date_created, date_modified, links }) => {
    const formatDateTime = (timestamp) => {
        const datetime = new Date(timestamp).toDateString();
        return datetime;
    };
    return (
        <div>
            <h2 className="username" style={{ fontSize: "50px" }} >{username}'s profile</h2>
            <h5><b>Username: </b> {username}</h5>
            <h5><b>Email: </b> {email}</h5>
            <h5><b>Date Created: </b> {formatDateTime(date_created)}</h5>
            <h5><b>Last Updated: </b> {date_modified ? formatDateTime(date_modified) : null}</h5>
            <h5><b>Links Count: </b> {links}</h5>
        </div>
    )
};

export default User;