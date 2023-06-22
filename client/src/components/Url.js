import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { baseUrl } from '..';

const URL = ({ title, long_url, short_url, date_created, visits, is_custom, onClick, onDelete }) => {
    return (
        <Card className="mb-2 boxShadow" style={{ width: '30rem' }}>
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Link href={`/${short_url}`} target="_blank">{baseUrl}/{short_url}</Card.Link>
                <Card.Text className="m-2 text-muted">
                    <small>Date: {date_created}  ||  Clicks: {visits}</small>
                </Card.Text>
                <div className="container">
                    <Button className="btn btn-sm m-2" variant="primary" onClick={onClick} >Update</Button>
                    <Button className="btn btn-sm m-2" variant="danger" onClick={onDelete} >Delete</Button>
                </div>
            </Card.Body>
        </Card>
    )
};

export default URL;