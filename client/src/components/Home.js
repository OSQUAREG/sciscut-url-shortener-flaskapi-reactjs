import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { baseUrl, domain, urlRegex } from "..";
import { URL, URLDetails } from "./Url";
import { Button, Modal, Form, Container, Row, Col, Image } from "react-bootstrap";
import { useForm } from "react-hook-form";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCut } from '@fortawesome/free-solid-svg-icons';


const HomePage = () => {

    const [logged] = useAuth();

    const LoggedInHome = () => {
        const [links, setLinks] = useState([]);
        const [link, setLink] = useState();
        // const [clicks, setClicks] = useState([]);
        const [show, setShow] = useState(false);
        const { register, handleSubmit, setValue, formState: { errors } } = useForm();
        const [linkId, setLinkId] = useState(0);

        const navigate = useNavigate();

        let token = localStorage.getItem("REACT_TOKEN_AUTH_KEY")
        const requestOptions = {
            method: "GET",
            headers: { "Authorization": `Bearer ${JSON.parse(token)}` }
        };

        useEffect(() => {
            fetch(`${baseUrl}/links/user`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    // console.log(data.data)
                    setLinks(data.data);
                    console.log(data.data?.length);
                    getURL(data.data?.length);
                })
                .catch(error => console.log(error))
        }, []);

        const closeModal = () => { setShow(false) };
        const showModal = (id) => {
            setShow(true);
            setLinkId(id)
            links.map((link) => {
                if (link.id === id) {
                    setValue("title", link.title)
                    setValue("long_url", link.long_url)
                    setValue("short_url", link.short_url)
                    setValue("is_custom", link.is_custom)
                };
                return null;
            });
        };

        const getUserLinks = () => {
            fetch(`${baseUrl}/links/user`)
                .then(response => response.json())
                .then(data => {
                    // console.log(data.data)
                    setLinks(data.data);
                })
                .catch(error => console.log(error))
        };

        const getURL = (id) => {
            const headers = new Headers({
                // "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(token)}`
            });

            const requestOptions = {
                method: "GET",
                headers: headers,
            }

            fetch(`${baseUrl}/links/${id}`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    // console.log(data.data);
                    setLink(data.data);
                })
                .catch(error => console.log(error))
        };

        const updateURL = (data) => {
            console.log(data);
            const headers = new Headers({
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(token)}`
            });

            const requestOptions = {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(data),
            }

            fetch(`${baseUrl}/links/${linkId}`, requestOptions)
                .then(response => {
                    // console.log(response.statusText);
                    if (response.status === 409) {
                        showModal();
                    }
                    return response.json()
                })
                .then(data => {
                    console.log(data.data);
                    // console.log(data.message);
                    alert(data.message);
                    navigate("/");
                    // getUserLinks();
                    getURL(data.data.id);
                    closeModal();
                })
                .catch(error => console.log(error))
        }

        const deleteURL = (id) => {
            const headers = new Headers({
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(token)}`
            });

            const requestOptions = {
                method: "DELETE",
                headers: headers,
            }

            fetch(`${baseUrl}/links/${id}`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    // console.log(data)
                    alert(data);
                    getUserLinks();
                    // const reload = window.location.reload();
                    // reload();
                })
                .catch(error => console.log(error))
        }

        const generateQRCode = (id) => {
            const headers = new Headers({
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(token)}`
            });

            const requestOptions = {
                method: "PATCH",
                headers: headers,
            }

            fetch(`${baseUrl}/links/qr_code/${id}`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    alert(data.message)
                    const reload = window.location.reload()
                    reload()
                })
                .catch(error => console.log(error))
        };

        const removeQRCode = (id) => {
            const headers = new Headers({
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(token)}`
            });

            const requestOptions = {
                method: "PATCH",
                headers: headers,
            }

            fetch(`${baseUrl}/links/remove/qr_code/${id}`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    alert(data.message)
                    const reload = window.location.reload()
                    reload()
                })
                .catch(error => console.log(error))
        }

        const resetShortURL = (id) => {
            const headers = new Headers({
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(token)}`
            });

            const requestOptions = {
                method: "PATCH",
                headers: headers,
            };

            fetch(`${baseUrl}/links/reset/${id}`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log(data.data);
                    alert(data.message);
                    // const reload = window.location.reload()
                    // reload()
                })
                .catch(error => console.log(error))
        };

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

        return (
            <>
                <Modal
                    show={show}
                    size="lg"
                    onHide={closeModal}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Update Short URL
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control type="text" placeholder="[Optional] Enter short description"
                                    {...register("title", {
                                        required: { value: false },
                                        maxLength: { value: 50, message: "Maximum length of 50 exceeded." }
                                    })}
                                />
                                <Form.Text className="text-muted">
                                    Short description of your URL.
                                </Form.Text>
                                <br />
                                {errors.title && <small style={{ color: "red" }}>{errors.title.message}</small>}
                            </Form.Group>
                            <br />
                            <Form.Group className="mb-3">
                                <Form.Label>Long URL</Form.Label>
                                <Form.Control type="text" placeholder="Example: https://... or http://..."
                                    {...register("long_url", {
                                        required: { value: true, message: "Long URL is required" },
                                        pattern: { value: urlRegex, message: "URL must start with: 'https://' or 'http://'" }
                                    })}
                                />
                                <Form.Text className="text-muted">
                                    Start with: https://... or http://...
                                </Form.Text>
                                <br />
                                {errors.long_url && <small style={{ color: "red" }}>{errors.long_url.message}</small>}
                            </Form.Group>
                            <br />
                            <Form.Group className="mb-3">
                                <Form.Label>Short/Custom URL</Form.Label>
                                <Form.Control type="text" placeholder="[Optional] Enter a custom URL"
                                    {...register("short_url", {
                                        required: { value: false },
                                        minimum: { value: 5, message: "Minimum length of 5 not reached." },
                                        maxLength: { value: 20, message: "Maximum length of 20 exceeded." }
                                    })}
                                />
                                <Form.Text className="text-muted">
                                    Ignore to auto-generate short URL.
                                </Form.Text>
                                <br />
                                {errors.short_url && <small style={{ color: "red" }}>{errors.short_url.message}</small>}
                            </Form.Group>
                            <br />
                            <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                <Form.Check type="checkbox" label="Customize URL?"
                                    {...register("is_custom", { required: false })}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" onClick={handleSubmit(updateURL)}>Update</Button>
                        <Button variant="secondary" onClick={closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>

                <Container>
                    {links.length > 0 &&
                        <>
                            <Button className="mb-3" variant="success" href="/shorten"><FontAwesomeIcon icon={faCut} />{" "}Shorten New URL</Button>
                        </>
                    }
                    {links && links.length > 0 ? (
                        <>
                            <Row>
                                <Col xs={12} sm={5} className="mb-3 boxShadow" >
                                    <h2 className="mb-3">Your Short URLs List</h2>
                                    <div className="scrollable-container">
                                        {links.map((link, index) => (
                                            <URL
                                                key={index}
                                                title={link?.title}
                                                long_url={link?.long_url}
                                                short_url={link?.short_url}
                                                date_created={link?.date_created}
                                                visits={link?.visits}
                                                is_custom={link?.is_custom}
                                                onRetrieve={() => getURL(link?.id)}
                                            />
                                        ))}
                                    </div>
                                    < br />
                                    <Button className="mb-3" variant="success" href="/shorten"><FontAwesomeIcon icon={faCut} />{" "}Shorten New URL</Button>
                                </Col>
                                <Col xs={12} sm={7} className="mb-3 boxShadow" >
                                    <h2 className="mb-3">Short URL Details</h2>
                                    <div >
                                        {link &&
                                            <URLDetails
                                                id={link.id}
                                                title={link?.title}
                                                long_url={link?.long_url}
                                                short_url={link?.short_url}
                                                visits={link?.visits}
                                                is_custom={link?.is_custom}
                                                date_created={link?.date_created}
                                                qr_code_added={link?.qr_code_added}
                                                qr_code_id={link?.qr_code_id}
                                                onUpdate={() => showModal(link?.id)}
                                                onReset={() => resetShortURL(link?.id)}
                                                onDelete={() => deleteURL(link?.id)}
                                                onGenerateQR={() => generateQRCode(link?.id)}
                                                onRemoveQR={() => removeQRCode(link?.id)}
                                                onCopy={() => copyShortURL(link?.short_url)}
                                            />
                                        }
                                    </div>
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <>
                            <h3>No Short URLs available yet. </h3>
                            <br />
                            <Link className="btn btn-lg btn-success" to="/shorten"><FontAwesomeIcon icon={faCut} />{" "}Shorten Your First URL.</Link>
                        </>
                    )}
                </Container>
            </>
        )
    };

    const LoggedOutHome = () => {
        return (
            <>
                <Link to="/signup" className="btn btn-success m-1">Sign-up here to Get Started</Link>
                <Link to="/login" className="btn btn-success m-1">Log-in here to Shorten Your URL</Link>
            </>
        )
    };

    return (
        <>
            <div className="home container">
                <Row>
                    <Col xs={12} sm={6}>
                        <h1 className="heading">
                            Welcome to <br />
                            <span style={{ color: "red", fontSize: "100px" }}>Sciscut</span>
                        </h1>
                        <br />
                        <h5><i>...your favorite URL Shortener and QR Code Generator</i></h5>
                        <br />
                    </Col>
                    <Col xs={12} sm={6} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div>
                            <Image src="scissor-url-shortener3.png" rounded fluid />
                        </div>
                        <br />
                    </Col>
                </Row>
                <br />
                {logged ? <LoggedInHome /> : <LoggedOutHome />}
            </div>
        </>
    )
};

export default HomePage;