import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser, useAuth } from "../auth";
import { baseUrl } from "..";
import { URL, URLDetails } from "./Url";
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
                    setLinks(data.data);
                    // console.log(data.data.length);
                    getURL(data.data.length);
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

        // const [showShortenURL, setShowShortenURL] = useState(false);
        // const closeShortenURLModal = () => { setShowShortenURL(false) };
        // const showShortenURLModal = () => { setShowShortenURL(true) };

        // const ShortenURLModal = () => {

        //     const { register, handleSubmit, formState: { errors } } = useForm();
        //     // const [show, setShow] = useState(false);
        //     // const [serverResponse, setServerResponse] = useState("");
        //     const navigate = useNavigate();

        //     const shortenUrl = (data) => {
        //         let token = localStorage.getItem("REACT_TOKEN_AUTH_KEY")
        //         const headers = new Headers({
        //             "Content-Type": "application/json",
        //             "Authorization": `Bearer ${JSON.parse(token)}`
        //         });

        //         const requestOptions = {
        //             method: "POST",
        //             headers: headers,
        //             body: JSON.stringify(data)
        //         }

        //         fetch(`${baseUrl}/links/shorten`, requestOptions)
        //             .then(response => {
        //                 console.log(response.status)
        //                 if ((response.status === 201) || (response.status === 200)) {
        //                     navigate("/")
        //                 }
        //                 else if (response.status === 401) {
        //                     logoutUser()
        //                     navigate("/login");
        //                 }
        //                 return response.json()
        //             })
        //             .then(data => {
        //                 console.log(data)
        //                 // setServerResponse(data.message)
        //                 // console.log(data.status)
        //                 // setShow(true)
        //                 getURL(data.data.id)
        //             })
        //             .catch(error => console.log(error))

        //         // reset()
        //     }

        //     return (
        //         <>
        //             <Modal
        //                 show={showShortenURL}
        //                 size="lg"
        //                 onHide={closeShortenURLModal}
        //                 aria-labelledby="contained-modal-title-vcenter1"
        //                 centered
        //             >
        //                 <Modal.Header closeButton>
        //                     <Modal.Title id="contained-modal-title-vcenter">
        //                         Shorten Your URL
        //                     </Modal.Title>
        //                 </Modal.Header>
        //                 <Modal.Body>
        //                     <div className="form box">
        //                         <Form>
        //                             <Form.Group className="mb-3">
        //                                 <Form.Label>URL Title</Form.Label>
        //                                 <Form.Control type="text" placeholder="[Optional] Enter URL Title"
        //                                     {...register("title", { required: false, maxLength: 50 })}
        //                                 />
        //                                 {errors.password?.type === "maxLength" && <small style={{ color: "red" }}>Maximum Character should be 50.</small>}
        //                             </Form.Group>
        //                             <br />
        //                             <Form.Group className="mb-3">
        //                                 <Form.Label>Long URL</Form.Label>
        //                                 <Form.Control type="text" placeholder="Enter your long URL"
        //                                     {...register("long_url", { required: true })}
        //                                 />
        //                                 <Form.Text className="text-muted">
        //                                     Start with: https://... or http://...
        //                                 </Form.Text>
        //                                 <br />
        //                                 {errors.long_url && <small style={{ color: "red" }}>Long URL is required</small>}
        //                             </Form.Group>
        //                             <br />
        //                             <Form.Group className="mb-3">
        //                                 <Form.Label>Custom URL</Form.Label>
        //                                 <Form.Control type="text" placeholder="[Optional] Enter a custom URL"
        //                                     {...register("short_url", { required: false, maxLength: 20 })}
        //                                 />
        //                                 <Form.Text className="text-muted">
        //                                     Ignore for auto-generated short URL.
        //                                 </Form.Text>
        //                                 <br />
        //                                 {errors.short_url?.type === "maxLength" && <small style={{ color: "red" }}>Maximum Character should be 20.</small>}
        //                             </Form.Group>
        //                             <br />
        //                             <Form.Group className="mb-3" controlId="formBasicCheckbox">
        //                                 <Form.Check type="checkbox" label="Generate QR Code?"
        //                                     {...register("qr_code_added", { required: false })}
        //                                 />
        //                             </Form.Group>
        //                             <br />
        //                             <Form.Group className="mb-3">
        //                                 <Button as="sub" variant="success" onClick={handleSubmit(shortenUrl)} >Submit</Button>
        //                             </Form.Group>
        //                         </Form>
        //                     </div>
        //                 </Modal.Body>
        //                 <Modal.Footer>
        //                     <Button variant="primary" onClick={handleSubmit(shortenUrl)} >Submit</Button>
        //                     <Button variant="secondary" onClick={closeShortenURLModal}>Close</Button>
        //                 </Modal.Footer>
        //             </Modal>
        //         </>
        //     )
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
            }

            fetch(`${baseUrl}/links/reset/${id}`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    alert(data.message)
                    // const reload = window.location.reload()
                    // reload()
                })
                .catch(error => console.log(error))
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
                        <Button variant="success" onClick={handleSubmit(updateURL)}>Update</Button>
                        <Button variant="secondary" onClick={closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>

                <Container>
                    <Row>
                        <Col xs={12} sm={5} className="mb-3 boxShadow" >
                            {links.length > 0 &&
                                <>
                                    <Button className="mb-3" variant="success" href="/shorten">Create New Short URL</Button>
                                    <h2 className="mb-3">Your URL Lists</h2>
                                </>
                            }
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
                                            onRetrieve={() => getURL(link.id)}
                                        />
                                    ))}
                                    < br />
                                    <Button className="mb-5" variant="success" href="/shorten">Create New Short URL</Button>
                                </>
                            ) : (
                                <>
                                    <h3>No Short URLs available yet. </h3>
                                    <br />
                                    <Link className="btn btn-lg btn-success" to="/shorten">Create Your First Short URL.</Link>
                                </>
                            )}
                        </Col>
                        <Col xs={12} sm={7} className="mb-3 boxShadow" >
                            <div >
                                {link &&
                                    <URLDetails
                                        id={link.id}
                                        title={link.title}
                                        long_url={link.long_url}
                                        short_url={link.short_url}
                                        visits={link.visits}
                                        is_custom={link.is_custom}
                                        date_created={link.date_created}
                                        qr_code_added={link.qr_code_added}
                                        qr_code_id={link.qr_code_id}
                                        onUpdate={() => showModal(link.id)}
                                        onReset={() => resetShortURL(link.id)}
                                        onDelete={() => deleteURL(link.id)}
                                        onGenerateQR={() => generateQRCode(link.id)}
                                        onRemoveQR={() => removeQRCode(link.id)}
                                    />
                                }
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
                <Link to="/signup" className="btn btn-success m-1">Sign-up Here to Get Started</Link>
                <Link to="/login" className="btn btn-success m-1">Log-in Here to Shorten Your URL</Link>
            </>
        )
    };

    return (
        <>
            {/* <ShortenURLModal /> */}
            <div className="home container">
                <h1 className="heading">Welcome to <br /> <span style={{ color: "red", fontSize: "100px" }}>Scissor App</span></h1>
                <br />
                <h5><i>...your favorite URL Shortener and QR Code Generator</i></h5>
                <br />

                {logged ? <LoggedInHome /> : <LoggedOutHome />}
            </div>
        </>
    )
};

export default HomePage;