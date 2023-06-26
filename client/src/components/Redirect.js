import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { baseUrl } from '..';
import { Container } from 'react-bootstrap';

const RedirectLink = () => {
    const { short_url } = useParams();
    const [longLink, setLongLink] = useState("");

    console.log("short_url:", short_url)

    useEffect(() => {
        fetch(`${baseUrl}/links/${short_url}`)
            .then(response => {
                console.log(response.status);
                return response.json()
            })
            .then(data => {
                // Redirect to the long URL
                console.log(data.data);
                setLongLink(data.data);
                window.location.replace(data.data);
            })
            .catch((error) => {
                console.error('Error redirecting:', error);
            });
    }, [short_url]);

    console.log("longLink:", "http://" + longLink);

    // Function to remove prefix from the URL
    // const removePrefix = (url) => {
    //     console.log("url", url);
    //     const prefix = 'http://localhost:3000/';
    //     if (url.startsWith(prefix)) {
    //         return url.slice(prefix.length);
    //     }

    //     const prefix2 = 'localhost:3000/';
    //     if (url.startsWith(prefix2)) {
    //         return url.slice(prefix2.length);
    //     }

    //     return url;
    // };

    // // Function to remove prefix from the URL
    // const removePrefix2 = (url) => {
    //     const prefix = 'http://localhost:3000/';
    //     if (url.startsWith(prefix)) {
    //         return url.substr(prefix.length);
    //     }
    //     return url;
    // };

    return (
        <Container>
            <p>Redirecting ...</p>

            {/* <p> 1 If you are not redirected automatically, please <Link to={() => removePrefix(longLink)} target="_blank">click here</Link> to visit the link: {longLink}</p>

            <p> 2 If you are not redirected automatically, please <Link to={longLink} target="_blank">click here</Link> to visit the link: {longLink}</p>

            {longLink && (
                <p>
                    3 If you are not redirected automatically, please{' '}
                    <a href={removePrefix(longLink)} target="_blank" rel="noopener noreferrer">
                        click here
                    </a>{' '}
                    to visit the link: {longLink}
                </p>
            )}

            {longLink && (
                <p>
                    4 If you are not redirected automatically, please{' '}
                    <a href={longLink} target="_blank" rel="noopener noreferrer">
                        click here
                    </a>{' '}
                    to visit the link: {longLink}
                </p>
            )} */}
        </Container>
    );
};

export default RedirectLink;
