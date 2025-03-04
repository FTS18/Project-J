import json

# Load JoSAA JSON file
with open("data.json", "r") as file:
    jossa_data = json.load(file)

# Extract unique college names
unique_colleges = list(set(college["institute"] for college in jossa_data))

# Save unique colleges to a JSON file
with open("colleges.json", "w") as file:
    json.dump(unique_colleges, file, indent=4)

print("✅ Unique college names saved in 'colleges.json'")
