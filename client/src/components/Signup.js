import React, { useState } from "react";
import { Alert, Button, Form, InputGroup } from 'react-bootstrap'
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { baseUrl, emailRegex } from "..";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

const SignupPage = () => {

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
    const [show, setShow] = useState(false);
    const [serverResponse, setServerResponse] = useState("");
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const submitForm = (data) => {
        // console.log(data);
        const headers = new Headers({
            "Content-Type": "application/json",
        });

        const requestOptions = {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        }

        fetch(`${baseUrl}/auth/signup`, requestOptions)
            .then(response => {
                const status = response.status;
                // console.log(status);
                if (status === 201) {
                    navigate("/login")
                }
                return response.json();
            })
            .then(data => {
                // console.log(data)
                setServerResponse(data.message)
                // console.log(serverResponse)
                setShow(true)
                alert(data.message)
            })
            .catch(error => console.log(error))
        reset();
    };

    return (
        <div className="signup container">
            <div className="form">
                {show ?
                    <>
                        <Alert variant="danger" onClose={() => setShow(false)} dismissible>
                            <p>{serverResponse}.</p>
                        </Alert>
                        <h1 className="heading">Sign Up</h1>
                    </>
                    :
                    <h1 className="heading">Sign Up</h1>
                }
                <br />
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label className="form-label" >Email Address</Form.Label>
                        <Form.Control type="email" placeholder="Enter your email"
                            {...register("email", {
                                required: { value: true, message: "Email is required" },
                                maxLength: { value: 255, message: "Email must not exceed 255 charcters" },
                                pattern: { value: emailRegex, message: "Invalid email address" }
                            })}
                        />
                        <Form.Text className="text-muted">
                            We'll never share your email with anyone else.
                        </Form.Text>
                        <br />
                        {errors.email && <small style={{ color: "red" }}>{errors.email.message}</small>}
                    </Form.Group>
                    <br />
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label className="form-label" >Password</Form.Label>
                        <InputGroup>
                            <Form.Control type={showPassword ? "text" : "password"} placeholder="Enter your password"
                                {...register("password", {
                                    required: { value: true, message: "Password is required." },
                                    minLength: { value: 8, message: "Password must be at least 8 characters." },
                                    maxLength: { value: 25, message: "Password must not exceed 25 characters." }
                                })}
                            />
                            <Button variant="secondary btn-sm" type="button" onClick={() => toggleShowPassword()}
                            >{showPassword ? "Hide Password" : "Show Password"}</Button>
                        </InputGroup>
                        {errors.password && <small style={{ color: "red" }}>{errors.password.message}</small>}
                    </Form.Group>
                    <br />
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label className="form-label" >Confirm Password</Form.Label>
                        <InputGroup>
                            <Form.Control type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password"
                                {...register("confirmPassword", {
                                    required: { value: true, message: "Confirm Password is required." },
                                    validate: (value) => value === watch("password") || "Passwords do not match"
                                })}
                            />
                            <Button variant="secondary btn-sm" type="button" onClick={() => toggleShowConfirmPassword()}
                            >{showConfirmPassword ? "Hide Password" : "Show Password"}</Button>
                        </InputGroup>
                        {errors.confirmPassword && <small style={{ color: "red" }}>{errors.confirmPassword.message}</small>}
                    </Form.Group>
                    <br />
                    <Form.Group className="mb-3">
                        <Button as="sub" variant="success" onClick={handleSubmit(submitForm)} ><FontAwesomeIcon icon={faUserPlus} />{" "}Sign Up</Button>
                    </Form.Group>
                    <br />
                    <Form.Group className="mb-3">
                        <p>Already have an account? <Link to="/login">Log In</Link>.</p>
                    </Form.Group>
                </Form>
            </div>
        </div>
    )
};

export default SignupPage;