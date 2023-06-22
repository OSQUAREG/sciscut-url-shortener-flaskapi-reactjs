import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { baseUrl } from "..";
import URL from "./Url";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import { useForm } from "react-hook-form";


// const AlertMessage = () => {
//     const [show, setShow] = useState(true);
//     const [serverResponse, setServerResponse] = useState("");
//     // const navigate = useNavigate();
//     return (
//         <>
//             {show ?
//                 <>
//                     <Alert variant="danger" onClose={() => setShow(false)} dismissible>
//                         <p>{serverResponse}</p>
//                     </Alert>
//                 </>
//                 :
//                 <></>
//             }
//         </>
//     )
// };

const LoggedInHome = () => {
    const [links, setLinks] = useState([]);
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

    const getUserLinks = () => {
        fetch(`${baseUrl}/links/user`)
            .then(response => response.json())
            .then(data => {
                // console.log(data.data)
                setLinks(data.data)
            })
            .catch(error => console.log(error))
    };

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
                // console.log(data.data)
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
                                {...register("title", { required: false, maxLength: 50 })}
                            />
                            {errors.password?.type === "maxLength" && <small style={{ color: "red" }}>Maximum Character should be 50.</small>}
                        </Form.Group>
                        <br />
                        <Form.Group className="mb-3">
                            <Form.Label>Long URL</Form.Label>
                            <Form.Control type="text" placeholder="Enter your long URL password"
                                {...register("long_url", { required: true })}
                            />
                            <Form.Text className="text-muted">
                                Start with: https://... or http://...
                            </Form.Text>
                            <br />
                            {errors.long_url && <small style={{ color: "red" }}>Long URL is required</small>}
                        </Form.Group>
                        <br />
                        <Form.Group className="mb-3">
                            <Form.Label>Short/Custom URL</Form.Label>
                            <Form.Control type="text" placeholder="[Optional] Enter a custom URL"
                                {...register("short_url", { required: false, maxLength: 20 })}
                            />
                            <Form.Text className="text-muted">
                                Ignore for auto-generated short URL.
                            </Form.Text>
                            <br />
                            {errors.short_url?.type === "maxLength" && <small style={{ color: "red" }}>Maximum Character should be 20.</small>}
                        </Form.Group>
                        <br />
                        <Form.Group className="mb-3" controlId="formBasicCheckbox">
                            <Form.Check type="checkbox" label="Is Custom URL?"
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

            <Button className="mb-3" href="/shorten">Create New Short URL</Button>
            <h2 className="">Your URL Lists</h2>
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
            )
            }
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

const HomePage = () => {

    const [logged] = useAuth()

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