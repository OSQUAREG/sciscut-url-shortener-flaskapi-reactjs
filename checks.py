# long_url = "http://www.example.com"

# long_url_wt_https = (
#     long_url
#     if long_url.startswith("https://")
#     else "https://" + long_url.split("//")[1]
#     if long_url.startswith("http://")
#     else "https://" + long_url
# )

# long_url_wt_http = (
#     long_url
#     if long_url.startswith("http://")
#     else "http://" + long_url.split("//")[1]
#     if long_url.startswith("https://")
#     else "http://" + long_url
# )

# long_url_wo_http = (
#     long_url.split("//")[1]
#     if (long_url.startswith("http://") or long_url.startswith("https://"))
#     else long_url
# )

# print(long_url_wt_https)
# print(long_url_wt_http)
# print(long_url_wo_http)


# location = geocoder.ip('192.168.121.140')
# print("\n\n\n LOCATION", location.lat, location.lng, location.country, location.state, location.city ,"\n\n\n")

# print("\n\n host: FINDING IT" "\n\n")


import geocoder

location = geocoder.ip("me")
print(location.lat, location.lng, location.country, location.state, location.city)
