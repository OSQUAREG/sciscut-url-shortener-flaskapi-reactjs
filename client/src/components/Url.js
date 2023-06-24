import React from 'react';
import { Button, Card, Image } from 'react-bootstrap';
import { baseUrl } from '..';
import { Link } from 'react-router-dom';

export const URL = ({ title, long_url, short_url, date_created, visits, is_custom, onUpdate, onDelete, onRetrieve }) => {
    return (
        <div className="mb-3 box border rounded p-2" >
            <Card className='card'>
                <Link className="link" onClick={onRetrieve}>
                    <Card.Body>
                        <Card.Title>{title}</Card.Title>
                        <Card.Link className="link" href={`/${short_url}`} target="_blank">{baseUrl}/{short_url}</Card.Link>
                        <Card.Text className="m-2 text-muted">
                            <small className="justify-content">Date: {date_created}  ||  Clicks: {visits}</small>
                        </Card.Text>
                    </Card.Body>
                </Link>
            </Card>
        </div>
    )
};

export const URLDetails = ({ id, title, long_url, short_url, date_created, visits, is_custom, qr_code_added, qr_code_id, onUpdate, onDelete, onReset }) => {
    return (
        <div className="mb-3 box border rounded p-2">
            <Card className='card p-4'>
                <div className="m-3">
                    <Button className="btn btn-sm m-2" variant="success" onClick={onUpdate} >Update</Button>
                    <Button className="btn btn-sm m-2" variant="secondary" onClick={onReset} >Reset</Button>
                    <Button className="btn btn-sm m-2" variant="danger" onClick={onDelete} >Delete</Button>
                </div>
                <h3><b>Title: </b>{title}</h3>
                <h5><b>Long URL: </b> {long_url}</h5>
                <h5><b>Short URL: </b><Link to={`/${short_url}`} target="_blank">{baseUrl}/{short_url}</Link></h5>
                <h6><b>Type: </b>{is_custom ? "Customized" : "Auto-Generated"}</h6>
                <h6><b>Date: </b>{date_created}</h6>
                <h6><b>Clicks: </b>{visits}</h6>
                <h6><b>QR Code Generated: </b>{qr_code_added ? "Yes" : "No"}</h6>
                {qr_code_added &&
                    <>
                        {/* <p>{qr_code_id}</p> */}
                        <Image src={`/qr_code_img/${qr_code_id}.png`} rounded fluid />
                    </>
                }
                <div className="m-3">
                    <Button className="btn btn-sm m-2" variant="primary" onClick={onUpdate} >Update</Button>
                    <Button className="btn btn-sm m-2" variant="secondary" onClick={onReset} >Reset</Button>
                    <Button className="btn btn-sm m-2" variant="danger" onClick={onDelete} >Delete</Button>
                </div>
            </Card>
        </div>
    )
};