import React, { useState } from "react";
import { Alert, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { baseUrl } from "..";
import { login } from "../auth";
import { useNavigate } from "react-router-dom"

const LoginPage = () => {

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [show, setShow] = useState(false);
    const [serverResponse, setServerResponse] = useState("");
    const navigate = useNavigate();

    const loginUser = (data) => {
        console.log(data);

        const headers = new Headers({
            "Content-Type": "application/json",
        });

        const requestOptions = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        }

        fetch(`${baseUrl}/auth/login`, requestOptions)
            .then(response => {
                const statusText = response.statusText
                console.log(statusText)
                if (statusText === "Created") {
                    navigate("/")
                }
                return response.json()
            })
            .then(data => {
                console.log(data)
                // console.log(data["data"])
                setServerResponse(data.message)
                console.log(serverResponse)

                login(data.access_token)
                setShow(true)
            })
            .catch(error => console.log(error))

        // reset();

    }
    return (
        <div className="login container">
            <div className="form">
                {show ?
                    <>
                        <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                            <p>{serverResponse}</p>
                        </Alert>
                        <h1 className="">Login</h1>
                    </>
                    :
                    <h1 className="">Login</h1>
                }
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label className="form-label" >Email Address</Form.Label>
                        <Form.Control type="email" placeholder="Your email"
                            {...register("email", { required: true })}
                        />
                        {errors.email && <small style={{ color: "red" }}>Email is required</small>}
                    </Form.Group>
                    <br />
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label className="form-label" >Password</Form.Label>
                        <Form.Control type="password" placeholder="Your password"
                            {...register("password", { required: true })}
                        />
                        {errors.password && <small style={{ color: "red" }}>Password is required</small>}
                    </Form.Group>
                    <br />
                    <Form.Group className="mb-3">
                        <Button as="sub" variant="primary" onClick={handleSubmit(loginUser)} >Login</Button>
                    </Form.Group>
                    <br />
                    <Form.Group className="mb-3">
                        <p>Don't have an account? <Link to="/signup">Sign Up</Link>.</p>
                    </Form.Group>
                </Form>
            </div>
        </div>
    )
};

export default LoginPage;