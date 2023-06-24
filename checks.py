long_url = "www.example.com"

long_url_wt_https = (
    long_url
    if long_url.startswith("https://")
    else "https://" + long_url.split("//")[1]
    if long_url.startswith("http://")
    else "https://" + long_url
)

long_url_wt_http = (
    long_url
    if long_url.startswith("http://")
    else "http://" + long_url.split("//")[1]
    if long_url.startswith("https://")
    else "http://" + long_url
)

long_url_wo_http = (
    long_url.split("//")[1]
    if (long_url.startswith("http://") or long_url.startswith("https://"))
    else long_url
)

print(long_url_wt_https)
print(long_url_wt_http)
print(long_url_wo_http)
