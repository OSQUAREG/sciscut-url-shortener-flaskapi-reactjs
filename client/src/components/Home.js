import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { baseUrl } from "..";
import URL from "./Url";
import { Button, Modal, Form, Container, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";


const HomePage = () => {

    const [logged] = useAuth()

    const LoggedInHome = () => {
        const [links, setLinks] = useState([]);
        const [link, setLink] = useState();
        const [show, setShow] = useState(false);
        const { register, handleSubmit, setValue, formState: { errors } } = useForm();
        const [linkId, setLinkId] = useState(0);

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
                    setLinks(data.data)
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

        // const [isCustom, setIsCustom] = useState(link.is_custom)
        // const toggleShowIsCustom = () => {
        //     setIsCustom(!isCustom);
        // };

        const getUserLinks = () => {
            fetch(`${baseUrl}/links/user`)
                .then(response => response.json())
                .then(data => {
                    // console.log(data.data)
                    setLinks(data.data)
                })
                .catch(error => console.log(error))
        };

        const getURL = (id) => {
            const headers = new Headers({
                "Content-Type": "application/json",
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
                    const url = data.data
                    setLink(url);
                    console.log(url.title)
                    return url;
                })
                .catch(error => console.log(error))
        }

        const updateURL = (data) => {
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
                .then(response => response.json())
                .then(data => {
                    console.log(data.data)
                    const reload = window.location.reload()
                    reload()
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
                    alert(data)
                    getUserLinks()
                    const reload = window.location.reload()
                    reload()
                })
                .catch(error => console.log(error))
        }

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
                                <Form.Label>URL Title</Form.Label>
                                <Form.Control type="text" placeholder="[Optional] Enter URL Title"
                                    {...register("title", {
                                        required: { value: false },
                                        maxLength: { value: 50, message: "Maximum length of 50 exceeded." }
                                    })}
                                />
                                {errors.title && <small style={{ color: "red" }}>{errors.title.message}</small>}
                            </Form.Group>
                            <br />
                            <Form.Group className="mb-3">
                                <Form.Label>Long URL</Form.Label>
                                <Form.Control type="text" placeholder="Example: https://... or http://..."
                                    {...register("long_url", { required: { value: true, message: "Long URL is required." } })}
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
                        <Button variant="primary" onClick={handleSubmit(updateURL)}>Update</Button>
                        <Button variant="secondary" onClick={closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>

                <Container>
                    <Button className="mb-3" href="/shorten">Create New Short URL</Button>
                    <h2 className="mb-3">Your URL Lists</h2>
                    <Row>
                        <Col xs={12} sm={5} className="mb-3 boxShadow" >
                            {links && links.length > 0 ? (
                                <>
                                    {links.map((link, index) => (
                                        <URL
                                            key={index}
                                            title={link.title}
                                            long_url={link.long_url}
                                            short_url={link.short_url}
                                            date_created={link.date_created}
                                            visits={link.visits}
                                            is_custom={link.is_custom}
                                            onClick={() => showModal(link.id)}
                                            onDelete={() => deleteURL(link.id)}
                                        />
                                    ))}
                                    < br />
                                    <Button className="mb-5" href="/shorten">Create New Short URL</Button>
                                </>
                            ) : (
                                <p>
                                    No URLs available. <Link to="/shorten">Create Your First Short URL</Link>
                                </p>
                            )}
                        </Col>
                        <Col xs={12} sm={7} className="mb-3 boxShadow" >
                            <div >
                                <h1>This wil contain the URL Title.</h1>
                                <h3>This wil contain the Long URL.</h3>
                                <h3>This wil contain the Short URL.</h3>
                                <p>This is for the number of visits</p>
                                <p>This is for the date it was created</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </>
        )
    };

    const LoggedOutHome = () => {
        return (
            <>
                <Link to="/signup" className="btn btn-primary">Sign Up Here to Get Started</Link>
            </>
        )
    };

    return (
        <div className="home container">
            {/* <><AlertMessage /></> */}
            <h1 className="heading">Welcome to <br /> <span style={{ color: "red", fontSize: "100px" }}>Scissor App</span></h1>
            <h5><i>...your favorite URL Shortener and QR Code Generator</i></h5>
            <br />
            {logged ? <LoggedInHome /> : <LoggedOutHome />}
        </div>
    )
};

export default HomePage;