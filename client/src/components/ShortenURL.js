import React, { useState } from "react";
import { Alert, Form, Button } from "react-bootstrap";
// import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { baseUrl } from "..";
import { useNavigate } from "react-router-dom"
import { logout } from "../auth";

const ShortenURLPage = () => {

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [show, setShow] = useState(false);
    const [serverResponse, setServerResponse] = useState("");
    // const [serverStatus, setServerStatus] = useState("");
    const navigate = useNavigate();

    const shortenUrl = (data) => {
        // console.log(data);

        const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY")
        // console.log(token)

        const headers = new Headers({
            "Content-Type": "application/json",
            "Authorization": `Bearer ${JSON.parse(token)}`
        });

        const requestOptions = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        }

        fetch(`${baseUrl}/links/shorten`, requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setServerResponse(data.message)
                // console.log(data.status)

                // setShow(true)

                if (data.status === 401) {
                    logout()
                    navigate("/login");
                }
                else {
                    navigate("/")
                }

                setShow(true)
            })
            .catch(error => console.log(error))

        reset()
    }

    return (
        <div className="shorten container">
            <div className="form">
                {show ?
                    <>
                        <Alert variant="danger" onClose={() => setShow(true)} dismissible>
                            <p>{serverResponse}</p>
                        </Alert>
                        <h1 className="mb-3">Shorten Your URL</h1>
                    </>
                    :
                    <h1 className="mb-3">Shorten Your URL</h1>
                }
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
                        <Form.Label>Custom URL</Form.Label>
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
                        <Form.Check type="checkbox" label="Generate QR Code?"
                            {...register("qr_code_added", { required: false })}
                        />
                    </Form.Group>
                    <br />
                    <Form.Group className="mb-3">
                        <Button as="sub" variant="primary" onClick={handleSubmit(shortenUrl)} >Submit</Button>
                    </Form.Group>
                </Form>
            </div>
        </div>
    )
};

export default ShortenURLPage;