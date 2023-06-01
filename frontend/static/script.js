
const formEl = document.querySelector(".form")

function getFormData(event) {
    event.preventDefault();
    const formData = new FormData(formEl);
    console.log(formData.get("email"));
};

// formEl.addEventListener("submit", getFormData)
const submitButton = document.getElementById("submit")

submitButton.addEventListener("click", getFormData)









// AXIOS INSTANCE
const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:5000"
})

// GET REQUEST
function getUsers() {
    // console.log("GET Request");

    // axios({
    //     method: "get",
    //     url: "http://127.0.0.1:5000/users",
    // })
    //     .then(res => showOutput(res))
    //     .catch(err => console.error(err));

    axiosInstance
        .get("/users")
        .then(res => showOutput(res))
        .catch(err => console.error(err));
}

// POST REQUEST
function registerUser() {
    // console.log("POST Request");

    // axios({
    //     method: "post",
    //     url: "http://127.0.0.1:5000/users",
    //     data: {
    //          email: "test5@example.com",
    //          password: "password"
    //     }
    // })
    //    .then(res => showOutput(res))
    //    .catch(err => console.error(err));

    axiosInstance
        .post("/signup", {
            email: "test5@example.com",
            password: "password"
        })
        .then(res => showOutput(res))
        .catch(err => console.error(err));
}


// POST REQUEST
function loginUser() {
    // console.log("POST Request");

    // axios({
    //     method: "post",
    //     url: "http://127.0.0.1:5000/users",
    //     data: {
    //          email: "test5@example.com",
    //          password: "password"
    //     }
    // })
    //    .then(res => showOutput(res))
    //    .catch(err => console.error(err));

    axiosInstance
        .post("/login", {
            email: "test5@example.com",
            password: "password"
        })
        .then(res => showOutput(res))
        .catch(err => console.error(err));
}


// PUT/PATCH REQUEST
function updateLink() {
    console.log("PUT/PATCH Request");
}

// DELETE REQUEST
function deleteLink() {
    console.log("DELETE Request");
}

// SIMULTANEOUS DATA
function getData() {
    console.log("Simultaneous Request");
}

// CUSTOM HEADERS
function customHeaders() {
    console.log("Custom Headers");
}

// TRANSFORMING REQUESTS & RESPONSES
function transformResponse() {
    console.log("Transform Response");
}

// ERROR HANDLING
function errorHandling() {
    console.log("Error Handling");
}

// CANCEL TOKEN
function cancelToken() {
    console.log("Cancel Token");
}

// INTERCEPTING REQUESTS & RESPONSES

// AXIOS INSTANCES

// Show output in browser
function showOutput(res) {
    document.getElementById("res").innerHTML = `
  <div class="card card-body mb-4">
    <h5>Status: ${res.status}</h5>
  </div>

  <div class="card mt-3">
    <div class="card-header">
      Headers
    </div>
    <div class="card-body">
      <pre>${JSON.stringify(res.headers, null, 2)}</pre>
    </div>
  </div>

  <div class="card mt-3">
    <div class="card-header">
      Data
    </div>
    <div class="card-body">
      <pre>${JSON.stringify(res.data, null, 2)}</pre>
    </div>
  </div>

  <div class="card mt-3">
    <div class="card-header">
      Config
    </div>
    <div class="card-body">
      <pre>${JSON.stringify(res.config, null, 2)}</pre>
    </div>
  </div>
`;
}

// Event listeners
document.getElementById("get").addEventListener("click", getUsers);
document.getElementById("signup").addEventListener("click", registerUser);
document.getElementById("login").addEventListener("click", loginUser);
document.getElementById("update").addEventListener("click", updateLink);
document.getElementById("delete").addEventListener("click", deleteLink);
document.getElementById("sim").addEventListener("click", getData);
document.getElementById("headers").addEventListener("click", customHeaders);
document
    .getElementById("transform")
    .addEventListener("click", transformResponse);
document.getElementById("error").addEventListener("click", errorHandling);
document.getElementById("cancel").addEventListener("click", cancelToken);
