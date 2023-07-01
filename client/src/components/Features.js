import React from "react"
import { Container } from "react-bootstrap"


const FeaturePage = () => {
    return (
        <div>
            <Container>
                <h1>Main Features</h1>
                <p>The main features of this app includes: </p>
                <Container>
                    <h3>URL Shortener</h3>
                    <p>
                        for shortening your long URLs into an auto-generated 5-character long URL end part.
                    </p>
                </Container>
                <Container>
                    <h3>URL Customizer</h3>
                    <p>
                        for customizing your long URL making it unique for personal or corporate use.
                    </p>
                </Container>
                <Container>
                    <h3>QR Code Generator</h3>
                    <p>
                        for generating QR codes for any URL, and can be downloaded for external use on social media and media posters.
                    </p>
                </Container>
                <Container>
                    <h3>Click Analytics</h3>
                    <p>
                        for getting and tracking your short URL click information, such as when and where the click was performed, therefore knowing how your URL is being visited.
                    </p>
                </Container>
            </Container>
        </div>
    )
};

export default FeaturePage;