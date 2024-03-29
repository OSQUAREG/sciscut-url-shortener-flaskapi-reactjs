import React, { useState } from "react";
import { Alert, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { baseUrl, urlRegex } from "..";
import { useNavigate } from "react-router-dom"
import { logoutUser } from "../auth";

const ShortenURLPage = () => {

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [show, setShow] = useState(false);
    const [serverResponse, setServerResponse] = useState("");
    const navigate = useNavigate();

    const shortenUrl = (data) => {
        let token = localStorage.getItem("REACT_TOKEN_AUTH_KEY")
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
            .then(response => {
                console.log(response.status)
                if ((response.status === 201) || (response.status === 200)) {
                    navigate("/")
                }
                else if (response.status === 401) {
                    logoutUser()
                    navigate("/login");
                }
                return response.json()
            })
            .then(data => {
                console.log(data)
                setServerResponse(data.message)
                // console.log(data.status)
                setShow(true)
                // navigate("/")
                alert(data.message)
            })
            .catch(error => console.log(error))
        reset()
    }

    return (
        <div className="shorten container">
            <div className="form box">
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
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text" placeholder="[Optional] Enter short description"
                            {...register("title", { required: false, maxLength: 50 })}
                        />
                        <Form.Text className="text-muted">
                            Short description of your URL
                        </Form.Text>
                        <br />
                        {errors.title?.type === "maxLength" && <small style={{ color: "red" }}>Maximum Character should be 50.</small>}
                    </Form.Group>
                    <br />
                    <Form.Group className="mb-3">
                        <Form.Label>Long URL</Form.Label>
                        <Form.Control type="text" placeholder="Enter your long URL"
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
                        <Form.Label>Custom Back-Half</Form.Label>
                        <Form.Control type="text" placeholder="[Optional] Example: my-favourite-website"
                            {...register("short_url", { required: false, maxLength: 20 })}
                        />
                        <Form.Text className="text-muted">
                            Ignore for auto-generated short back-half.
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
                        <Button as="sub" variant="success" onClick={handleSubmit(shortenUrl)} >Submit</Button>
                    </Form.Group>
                </Form>
            </div>
        </div>
    )
};

export default ShortenURLPage;