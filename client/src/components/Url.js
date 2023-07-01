import React, { useEffect, useState } from 'react';
import { Button, Card, Image } from 'react-bootstrap';
import { baseUrl, domain, qr_code_folder } from '..';
import { Link } from 'react-router-dom';
// import qr_code_img from ".../public"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faRefresh, faEdit, faChartBar, faRemove, faQrcode, faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';

export const URL = ({ title, long_url, short_url, date_created, visits, onRetrieve }) => {
    return (
        <div className="mb-3 box border rounded p-2" >
            <Card className='card'>
                <Link className="link" onClick={onRetrieve}>
                    <Card.Body>
                        <Card.Title>{title ? title : long_url}</Card.Title>
                        <Card.Link className='link'>{domain}/{short_url}</Card.Link>
                        <Card.Text className="m-2 text-muted">
                            <small className="justify-content">Date: {date_created}  ||  Clicks: {visits}</small>
                        </Card.Text>
                    </Card.Body>
                </Link>
            </Card>
        </div>
    )
};

export const URLDetails = ({ id, title, long_url, short_url, date_created, visits, is_custom, qr_code_added, qr_code_id, onUpdate, onDelete, onReset, onGenerateQR, onRemoveQR, onCopy }) => {

    const imageName = `${qr_code_id}.png`
    const imagePath = `${process.env.REACT_APP_QR_CODE_FOLDER_PATH}/${qr_code_id}.png`
    // const imagePath = `${qr_code_id}.png`

    console.log(process.env.PUBLIC_URL + imagePath)

    const downloadImage = (imagePath, imageName) => {
        const link = document.createElement("a");
        link.href = imagePath;
        link.download = imageName;
        link.click();
    };

    return (
        <div className="mb-3 box border rounded p-2">
            <Card className='card p-4'>
                <div className="m-3">
                    <Button className="btn btn-sm m-2" variant="success" onClick={onUpdate} ><FontAwesomeIcon icon={faEdit} />{" "}Edit</Button>
                    <Button className="btn btn-sm m-2" variant="secondary" onClick={onReset} ><FontAwesomeIcon icon={faRefresh} />{" "}Reset</Button>
                    <Button className="btn btn-sm m-2" variant="danger" onClick={onDelete} ><FontAwesomeIcon icon={faTrash} />{" "}Delete</Button>
                    <Button className="btn btn-sm m-2" variant="success" href={`/analytics/${id}`} >
                        <FontAwesomeIcon icon={faChartBar} />{" "}Analytics
                    </Button>
                </div>
                <h3><b>Title: </b>{title ? title : "No Title"}</h3>
                <h5><b>Long URL: </b> {long_url}</h5>
                <div>
                    <h5>
                        <b>Short URL: </b><Link to={`/${short_url}`} target="_blank" rel="noopener noreferrer">{domain}/{short_url}</Link>{" "}
                        <Button className="btn btn-sm m-1" variant="secondary" onClick={onCopy}>
                            <FontAwesomeIcon icon={faCopy} />
                            {" "}Copy
                        </Button>
                    </h5>
                </div>
                <h6><b>Type: </b>{is_custom ? "Customized" : "Auto-Generated"}</h6>
                <h6><b>Date: </b>{date_created}</h6>
                <h6><b>Clicks: </b>{visits}</h6>
                <h6><b>QR Code: </b>
                    {/* {qr_code_added ? "Yes" : "No"} */}
                    {!qr_code_added ?
                        <>
                            No{" "}
                            <Button className="btn btn-sm m-2" variant="success" onClick={onGenerateQR} ><FontAwesomeIcon icon={faQrcode} />{" "}Generate QR Code</Button>
                        </>
                        :
                        <>
                            Yes{" "}
                            <Button className="btn btn-sm m-2" variant="danger" onClick={onRemoveQR} ><FontAwesomeIcon icon={faRemove} />{" "}Remove QR Code</Button>
                        </>
                    }
                </h6>
                {qr_code_added &&
                    <>
                        {/* <p>{qr_code_id}</p> */}
                        {/* <img src={window.location.origin + imagePath1} alt="QR Code" rounded fluid />
                        <br /> */}
                        <img src={process.env.PUBLIC_URL + imagePath} alt="QR Code" />
                        <Button className="btn btn-sm m-2" variant="secondary" onClick={() => downloadImage(imagePath, imageName)}>
                            <FontAwesomeIcon icon={faDownload} />{" "}Download QR Code
                        </Button>
                        {/* {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />} */}
                    </>
                }
                <div className="m-3">
                    <Button className="btn btn-sm m-2" variant="success" onClick={onUpdate} ><FontAwesomeIcon icon={faEdit} />{" "}Edit</Button>
                    <Button className="btn btn-sm m-2" variant="secondary" onClick={onReset} ><FontAwesomeIcon icon={faRefresh} />{" "}Reset</Button>
                    <Button className="btn btn-sm m-2" variant="danger" onClick={onDelete} ><FontAwesomeIcon icon={faTrash} />{" "}Delete</Button>
                    <Button className="btn btn-sm m-2" variant="success" href={`/analytics/${id}`} >
                        <FontAwesomeIcon icon={faChartBar} />{" "}Analytics
                    </Button>
                </div>
            </Card>
        </div>
    )
};


