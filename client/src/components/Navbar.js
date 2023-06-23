import React, { useState, useEffect } from 'react';
import { logoutUser, useAuth } from '../auth';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { baseUrl, emailRegex, usernameRegex } from '..';
import { Link } from 'react-router-dom';
import { Button, Col, Dropdown, Form, InputGroup, Modal, NavItem, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import User from './User';


const LoggedInLinks = () => {
    return (
        <>
            <Nav.Link className="nav-link" href="/">Home</Nav.Link>
            <Nav.Link className="nav-link" href="/shorten">Shorten URL</Nav.Link>
            <Nav.Link className="nav-link" href="/features">Features</Nav.Link>
            <Nav.Link className="nav-link" href="#" onClick={() => logoutUser()}>Log out</Nav.Link>
        </>
    )
};

const LoggedOutLinks = () => {
    return (
        <>
            <Nav.Link className="nav-link" href="/">Home</Nav.Link>
            <Nav.Link className="nav-link" href="/features">Features</Nav.Link>
            <Nav.Link className="nav-link" href="/signup">Sign up</Nav.Link>
            <Nav.Link className="nav-link" href="/login">Login</Nav.Link>
        </>
    )
};

const NavBar = () => {

    const [logged] = useAuth();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
    const [currentUser, setCurrentUser] = useState();
    // const [userId, setUserId] = useState(0)

    let token = localStorage.getItem("REACT_TOKEN_AUTH_KEY")
    const requestOptions = {
        method: "GET",
        headers: { "Authorization": `Bearer ${JSON.parse(token)}` }
    };

    useEffect(() => {
        fetch(`${baseUrl}/user`, requestOptions)
            .then(response => {
                console.log(response.status)
                if (response.status === 401) {
                    logoutUser();
                }
                return response.json()
            })
            .then(data => {
                setCurrentUser(data.data)
                console.log(currentUser)
            })
            .catch(error => console.log(error))
    }, []);

    const [showView, setShowView] = useState(false);
    const closeViewModal = () => { setShowView(false) };
    const showViewModal = () => { setShowView(true) };

    const [showUpdate, setShowUpdate] = useState(false);
    const closeUpdateModal = () => { setShowUpdate(false) };
    const showUpdateModal = (id) => {
        setShowUpdate(true);
        // setUserId(id);
        setValue("username", currentUser?.username)
        setValue("email", currentUser?.email)
    };

    const [showChangePassword, setShowChangePassword] = useState(false);
    const closeChangePasswordModal = () => { setShowChangePassword(false) };
    const showChangePasswordModal = () => { setShowChangePassword(true) };

    const UpdateUserModal = () => {
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const toggleShowConfirmPassword = () => {
            setShowConfirmPassword(!showConfirmPassword);
        };

        const updateUser = (data) => {
            console.log("user updated", data);

            const headers = new Headers({
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(token)}`
            });

            const requestOptions = {
                method: "PUT",
                headers: headers,
                body: JSON.stringify(data),
            }

            fetch(`${baseUrl}/user`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log(data.data)
                    const reload = window.location.reload()
                    reload()
                })
                .catch(error => console.log(error))
        };

        return (
            <>
                <Modal
                    show={showView}
                    size="lg"
                    onHide={closeViewModal}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            View Profile
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <User
                            username={currentUser?.username}
                            email={currentUser?.email}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary"
                            onClick={() => { showUpdateModal(); closeViewModal(); }}>
                            Update Profile
                        </Button>
                        <Button variant="secondary" onClick={closeViewModal}>Close</Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={showUpdate}
                    size="lg"
                    onHide={closeUpdateModal}
                    aria-labelledby="contained-modal-title-vcenter1"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Update Profile
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label className="form-label" >Username</Form.Label>
                                <Form.Control type="text" placeholder="Enter your username"
                                    {...register("username", {
                                        required: { value: true, message: "Username is required" },
                                        minLength: { value: 3, message: "Minimum length of 3 not reached" },
                                        maxLength: { value: 50, message: "Maximum length of 50 exceeded" },
                                        pattern: { value: usernameRegex, message: "Invalid username" }
                                    })}
                                />
                                {errors.username && <small style={{ color: "red" }}>{errors.username.message} </small>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="form-label" >Email Address</Form.Label>
                                <Form.Control type="email" placeholder="Enter your email"
                                    {...register("email", {
                                        required: { value: true, message: "Email is required" },
                                        maxLength: { value: 255, message: "Maximum length of 255 exceeded" },
                                        pattern: { value: emailRegex, message: "Invalid email address" }
                                    })}
                                />
                                <Form.Text className="text-muted">
                                    We'll never share your email with anyone else.
                                </Form.Text>
                                <br />
                                {errors.email && <small style={{ color: "red" }}>{errors.email.message}. </small>}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="form-label" >Confirm Password</Form.Label>
                                <InputGroup>
                                    <Form.Control type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password"
                                        {...register("password", { required: true })}
                                    />
                                    <Button variant="secondary btn-sm" type="button" onClick={toggleShowConfirmPassword}
                                    >{showConfirmPassword ? "Hide Password" : "Show Password"}</Button>
                                </InputGroup>
                                {errors.password && <small style={{ color: "red" }}>Password is required to save changes. </small>}
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleSubmit(updateUser)} >Update</Button>
                        <Button variant="secondary" onClick={closeUpdateModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    };

    const ChangeUserPasswordModal = () => {
        const { register, handleSubmit, watch, formState: { errors } } = useForm();

        const [showPassword, setShowPassword] = useState(false);
        const toggleShowPassword = () => {
            setShowPassword(!showPassword);
        };

        const [showNewPassword, setShowNewPassword] = useState(false);
        const toggleShowNewPassword = () => {
            setShowNewPassword(!showNewPassword);
        };

        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const toggleShowConfirmPassword = () => {
            setShowConfirmPassword(!showConfirmPassword);
        };
        const changePassword = (data) => {
            console.log("password changed", data)

            const headers = new Headers({
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(token)}`
            });

            const requestOptions = {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify(data),
            }

            fetch(`${baseUrl}/user/change-password`, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log(data.data)
                    const reload = window.location.reload()
                    reload()
                })
                .catch(error => console.log(error))
        };
        return (
            <>
                <Modal
                    show={showChangePassword}
                    size="lg"
                    onHide={closeChangePasswordModal}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Change Password
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group as={Row}>
                                <Form.Label column >Email</Form.Label>
                                <Col>
                                    <Form.Control type="email" plaintext readOnly defaultValue={`${currentUser?.email}`} style={{ fontWeight: "bold" }} />
                                </Col>
                            </Form.Group>
                            <br />
                            <Form.Group className="mb-3">
                                <Form.Label className="form-label" >Old Password</Form.Label>
                                <InputGroup>
                                    <Form.Control type={showPassword ? "text" : "password"} placeholder="Enter your password"
                                        {...register("old_password", {
                                            required: { value: true, message: "Old Password is required" }
                                        })}
                                    />
                                    <Button variant="secondary btn-sm" type="button" onClick={() => toggleShowPassword()}
                                    >{showPassword ? "Hide Password" : "Show Password"}</Button>
                                </InputGroup>
                                {errors.old_password && <small style={{ color: "red" }}>{errors.old_password.message}</small>}
                            </Form.Group>
                            <br />
                            <Form.Group className="mb-3">
                                <Form.Label className="form-label" >New Password</Form.Label>
                                <InputGroup>
                                    <Form.Control type={showNewPassword ? "text" : "password"} placeholder="Confirm your password"
                                        {...register("new_password", {
                                            required: { value: true, message: "New Password is required" },
                                            minLength: { value: 8, message: "Password must be at least 8 characters." },
                                            maxLength: { value: 25, message: "Password must not exceed 25 characters." }
                                        })}
                                    />
                                    <Button variant="secondary btn-sm" type="button" onClick={() => toggleShowNewPassword()}
                                    >{showNewPassword ? "Hide Password" : "Show Password"}</Button>
                                </InputGroup>
                                {errors.new_password && <small style={{ color: "red" }}>{errors.new_password.message}</small>}
                            </Form.Group>
                            <br />
                            <Form.Group className="mb-3">
                                <Form.Label className="form-label" >Confirm New Password</Form.Label>
                                <InputGroup>
                                    <Form.Control type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password"
                                        {...register("confirm_password", {
                                            required: { value: true, message: "New Password is required" },
                                            minLength: { value: 8, message: "Password must be at least 8 characters." },
                                            maxLength: { value: 25, message: "Password must not exceed 25 characters." },
                                            validate: (value) => value === watch("new_password") || "Passwords do not match"
                                        })}
                                    />
                                    <Button variant="secondary btn-sm" type="button" onClick={() => toggleShowConfirmPassword()}
                                    >{showConfirmPassword ? "Hide Password" : "Show Password"}</Button>
                                </InputGroup>
                                {errors.confirm_password && <small style={{ color: "red" }}>{errors.confirm_password.message}</small>}
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={handleSubmit(changePassword)} >Save</Button>
                        <Button variant="secondary" onClick={closeChangePasswordModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    };

    const LoggedInUser = () => {
        return (
            <>
                Active User: <Link style={{ color: "green", fontWeight: "bold", fontSize: "25px" }} >{currentUser?.username}</Link>
            </>
        )
    }

    const LoggedOutUser = () => {
        return (
            <>
                <Link to="/login" className="btn btn-primary">Login Here</Link>
            </>
        )
    }

    return (
        <Navbar bg="light" expand="lg">
            <Container className='container'>
                <Navbar.Brand href="/" style={{ color: "red", fontSize: "30px", fontWeight: "bold" }} >Scissor App</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        {logged ? <LoggedInLinks /> : <LoggedOutLinks />}
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        {logged ?
                            <>
                                <Dropdown as={NavItem}>
                                    <Dropdown.Toggle as={NavItem}>
                                        <UpdateUserModal />
                                        <ChangeUserPasswordModal />
                                        <LoggedInUser />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={showViewModal}>View Profile</Dropdown.Item>
                                        <Dropdown.Item onClick={showUpdateModal}>Update Profile</Dropdown.Item>
                                        <Dropdown.Item onClick={showChangePasswordModal}>Change Password</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                            :
                            <LoggedOutUser />
                        }
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
};

export default NavBar;
