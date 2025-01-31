import json

# Read data from 'data.json'
with open("data.json", "r") as infile:
    data = json.load(infile)

# Extract unique institutes and their  aths
unique_institutes = set()
output_data = []

for entry in data:
    institute_name = entry['institute']
    # Generate path based on the institute name
    path = f"/assets/res/colleges/{institute_name.replace(' ', '-').lower()}.webp"
    
    if institute_name not in unique_institutes:
        unique_institutes.add(institute_name)
        # Add the unique entry to output
        output_data.append({
            "institute": institute_name,
            "path": path
        })

# Save the new JSON to 'out.json'
with open("out.json", "w") as outfile:
    json.dump(output_data, outfile, indent=4)

# Print the new data (optional)
print(json.dumps(output_data, indent=4))
