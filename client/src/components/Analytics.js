import React, { useEffect, useState } from 'react';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Container, Table } from 'react-bootstrap';
import { baseUrl, domain } from '..';
import { Link, useParams } from 'react-router-dom';


const AnalyticsPage = () => {
    const { link_id } = useParams();
    const [clicks, setClicks] = useState([]);
    const [link, setLink] = useState();

    let token = localStorage.getItem("REACT_TOKEN_AUTH_KEY")
    const headers = new Headers({
        "Authorization": `Bearer ${JSON.parse(token)}`
    });

    const requestOptions = {
        method: "GET",
        headers: headers,
    };

    useEffect(() => {
        fetch(`${baseUrl}/links/analytics/${link_id}`, requestOptions)
            .then(response => response.json())
            .then(data => {
                // console.log(data.data);
                setClicks(data.data);
            })
            .catch(error => console.log(error))
    }, [link_id]);


    useEffect(() => {
        fetch(`${baseUrl}/links/${link_id}`, requestOptions)
            .then(response => response.json())
            .then(data => {
                // console.log(data.data);
                setLink(data.data);
            })
            .catch(error => console.log(error))
    }, [link_id]);


    const copyShortURL = (link) => {
        link = `${domain}/${link}`;
        navigator.clipboard.writeText(link)
            .then(() => {
                console.log(`${link} copied to clipboard`);
                alert(`${link} copied to clipboard`);
            })
            .catch((error) => {
                console.error('Error copying string to clipboard:', error);
            });
    };

    const formatDateTime = (timestamp) => {
        const datetime = new Date(timestamp).toLocaleString();
        return datetime;
    };

    return (
        <>
            <Container>
                <div>
                    <h1>Analytics for {link?.title}'s URL</h1>
                    <h5><b>Long URL: </b> {link?.long_url}</h5>
                    <div>
                        <h5>
                            <b>Short URL: </b><Link to={`/${link?.short_url}`} target="_blank" rel="noopener noreferrer">{domain}/{link?.short_url}</Link>{" "}
                            <Button className="btn btn-sm m-1" variant="secondary" onClick={() => copyShortURL(link?.short_url)}>
                                <FontAwesomeIcon icon={faCopy} />{" "}Copy
                            </Button>
                        </h5>
                    </div>
                    <h6><b>Type: </b>{link?.is_custom ? "Customized" : "Auto-Generated"}</h6>
                    <h6><b>Date: </b>{link?.date_created}</h6>
                    <h6><b>Clicks: </b>{link?.visits}</h6>
                </div>
                <br />
                <div>
                    <h2>Clicks Analytics</h2>
                    <Table striped bordered hover>
                        <thead>
                            <th>#</th>
                            <th>Timestamp</th>
                            <th>User Agent</th>
                            <th>Referrer</th>
                            <th>Ip Address</th>
                            <th>Country</th>
                            <th>State</th>
                            <th>City</th>
                        </thead>
                        <tbody>
                            {
                                clicks.map((click, index) => (
                                    <tr>
                                        <td>{index + 1}</td>
                                        <td>{formatDateTime(click?.timestamp)}</td>
                                        <td>{click?.user_agent}</td>
                                        <td>{click?.referrer}</td>
                                        <td>{click?.ip_address}</td>
                                        <td>{click?.country}</td>
                                        <td>{click?.state}</td>
                                        <td>{click?.city}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </Table>
                </div>
            </Container>
        </>
    )
};

export default AnalyticsPage;