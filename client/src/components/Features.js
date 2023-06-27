import React from "react"
import { Container } from "react-bootstrap"


const FeaturePage = () => {
    return (
        <div>
            <Container>
                <h1>Main Features</h1>
                <Container>
                    <h3>URL Shortener</h3>
                    <p>
                        With this app, everyone is able to shorten their long URL into a 5 character-long URL, by its auto-generating functionality.

                    </p>
                </Container>
                <Container>
                    <h3>Custom URLs</h3>
                    <p>
                        You can also customize your URLs to be unique for personal or private use.
                    </p>
                </Container>
                <Container>
                    <h3>QR Code Generator</h3>
                    <p>
                        Users can also generate QR Codes for their links and downloaded for external use on social media and media posters.
                    </p>
                </Container>
                <Container>
                    <h3>Click Analytics</h3>
                    <p>
                        You can also track information on how your URLs are used with every click.
                    </p>
                </Container>
            </Container>
        </div>
    )
};

export default FeaturePage;