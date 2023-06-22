import uuid

# Generate a new UUID
new_uuid = uuid.uuid4(hex)
print(new_uuid)

# Convert a UUID to string
uuid_string = str(new_uuid)
print(uuid_string)

# Check if a string is a valid UUID
is_valid_uuid = uuid.UUID(uuid_string)
print(is_valid_uuid)

# Generate a UUID from a string
uuid_from_string = uuid.UUID('0ec0be0d-981a-4a7c-9e27-96f4b3e4198c')
print(uuid_from_string)
